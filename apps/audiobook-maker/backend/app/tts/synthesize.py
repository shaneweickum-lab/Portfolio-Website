import asyncio
import wave
from pathlib import Path
from typing import Callable

import numpy as np

from app.config import MP3_BITRATE
from app.tts.voice import get_voice

PARAGRAPH_PAUSE_SECONDS = 0.45


def synthesize_to_wav(
    paragraphs: list[str],
    wav_path: Path,
    on_progress: Callable[[float], None] | None = None,
) -> None:
    """Synthesize paragraphs to a single WAV file, with pauses between them."""
    voice = get_voice()
    sample_rate = voice.config.sample_rate
    silence_frames = np.zeros(int(sample_rate * PARAGRAPH_PAUSE_SECONDS), dtype=np.int16)
    silence_bytes = silence_frames.tobytes()

    with wave.open(str(wav_path), "wb") as wav_file:
        wav_file.setframerate(sample_rate)
        wav_file.setsampwidth(2)
        wav_file.setnchannels(1)

        total = len(paragraphs)
        for index, paragraph in enumerate(paragraphs):
            for chunk in voice.synthesize(paragraph):
                wav_file.writeframes(chunk.audio_int16_bytes)
            if index < total - 1:
                wav_file.writeframes(silence_bytes)

            if on_progress:
                on_progress((index + 1) / total)


async def encode_to_mp3(wav_path: Path, mp3_path: Path) -> None:
    process = await asyncio.create_subprocess_exec(
        "ffmpeg",
        "-y",
        "-i",
        str(wav_path),
        "-codec:a",
        "libmp3lame",
        "-b:a",
        MP3_BITRATE,
        str(mp3_path),
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    _, stderr = await process.communicate()

    if process.returncode != 0:
        raise RuntimeError(f"ffmpeg failed: {stderr.decode(errors='replace')}")
