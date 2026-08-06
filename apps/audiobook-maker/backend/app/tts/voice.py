import threading
from pathlib import Path

from piper import PiperVoice

from app.config import DEFAULT_VOICE, VOICES_DIR

_voice: PiperVoice | None = None
_lock = threading.Lock()


def voice_model_path(voice_name: str = DEFAULT_VOICE) -> Path:
    return VOICES_DIR / f"{voice_name}.onnx"


def get_voice() -> PiperVoice:
    """Lazily load the default Piper voice model (thread-safe, loaded once)."""
    global _voice
    if _voice is not None:
        return _voice

    with _lock:
        if _voice is None:
            model_path = voice_model_path()
            if not model_path.exists():
                raise FileNotFoundError(
                    f"Voice model not found at {model_path}. Run "
                    f"`python -m piper.download_voices {DEFAULT_VOICE} "
                    f"--download-dir {VOICES_DIR}` first."
                )
            _voice = PiperVoice.load(str(model_path))

    return _voice
