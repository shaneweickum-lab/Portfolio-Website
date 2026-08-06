import asyncio
import logging
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from app.config import OUTPUT_DIR, UPLOADS_DIR
from app.jobs.store import get_job, update_job
from app.parsing.base import EmptyDocumentError
from app.parsing.registry import parse_document
from app.tts.synthesize import encode_to_mp3, synthesize_to_wav

_LOGGER = logging.getLogger("audiobook.worker")
_executor = ThreadPoolExecutor(max_workers=1)

queue: asyncio.Queue[str] = asyncio.Queue()


async def enqueue(job_id: str) -> None:
    await queue.put(job_id)


async def run_worker_loop() -> None:
    loop = asyncio.get_running_loop()
    while True:
        job_id = await queue.get()
        try:
            await _process_job(job_id, loop)
        except Exception as exc:  # noqa: BLE001 - persist any failure onto the job
            _LOGGER.exception("Job %s failed", job_id)
            update_job(job_id, status="error", error=str(exc))
        finally:
            queue.task_done()


async def _process_job(job_id: str, loop: asyncio.AbstractEventLoop) -> None:
    job = get_job(job_id)
    if job is None:
        return

    upload_path = UPLOADS_DIR / f"{job_id}.{job.format}"
    wav_path = OUTPUT_DIR / f"{job_id}.wav"
    mp3_path = OUTPUT_DIR / f"{job_id}.mp3"

    update_job(job_id, status="parsing", progress=0.05)
    document = await loop.run_in_executor(
        _executor, parse_document, upload_path, job.format
    )

    if not document.paragraphs:
        raise EmptyDocumentError("No readable text was found in this document.")

    update_job(job_id, status="synthesizing", progress=0.1)

    def on_progress(fraction: float) -> None:
        update_job(job_id, progress=0.1 + 0.75 * fraction)

    await loop.run_in_executor(
        _executor, synthesize_to_wav, document.paragraphs, wav_path, on_progress
    )

    update_job(job_id, status="encoding", progress=0.9)
    await encode_to_mp3(wav_path, mp3_path)
    wav_path.unlink(missing_ok=True)

    update_job(job_id, status="done", progress=1.0, audio_path=str(mp3_path))
