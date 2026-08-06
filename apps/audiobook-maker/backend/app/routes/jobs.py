from fastapi import APIRouter, HTTPException, UploadFile
from fastapi.responses import FileResponse

from app.config import MAX_UPLOAD_BYTES, UPLOADS_DIR
from app.jobs.store import Job, create_job, get_job
from app.jobs.worker import enqueue
from app.models import JobResponse
from app.parsing.registry import PARSERS, extension_of

router = APIRouter(prefix="/jobs", tags=["jobs"])


def _to_response(job: Job) -> JobResponse:
    download_url = f"/jobs/{job.id}/download" if job.status == "done" else None
    return JobResponse(
        id=job.id,
        filename=job.filename,
        format=job.format,
        status=job.status,
        progress=job.progress,
        error=job.error,
        download_url=download_url,
    )


@router.post("", response_model=JobResponse)
async def create_conversion_job(file: UploadFile) -> JobResponse:
    if not file.filename:
        raise HTTPException(status_code=400, detail="A file is required.")

    extension = extension_of(file.filename)
    if extension not in PARSERS:
        supported = ", ".join(sorted(f".{ext}" for ext in PARSERS))
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type .{extension}. Supported: {supported}",
        )

    contents = await file.read()
    if len(contents) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="File is too large.")
    if not contents:
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")

    job = create_job(filename=file.filename, format=extension)
    upload_path = UPLOADS_DIR / f"{job.id}.{extension}"
    upload_path.write_bytes(contents)

    await enqueue(job.id)
    return _to_response(job)


@router.get("/{job_id}", response_model=JobResponse)
def get_job_status(job_id: str) -> JobResponse:
    job = get_job(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found.")
    return _to_response(job)


@router.get("/{job_id}/download")
def download_audio(job_id: str) -> FileResponse:
    job = get_job(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found.")
    if job.status != "done" or not job.audio_path:
        raise HTTPException(status_code=409, detail="This job isn't finished yet.")

    download_name = f"{job.filename.rsplit('.', 1)[0]}.mp3"
    return FileResponse(job.audio_path, media_type="audio/mpeg", filename=download_name)
