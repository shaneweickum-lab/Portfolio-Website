import os
from pathlib import Path

DATA_DIR = Path(os.environ.get("DATA_DIR", "/data"))
UPLOADS_DIR = DATA_DIR / "uploads"
OUTPUT_DIR = DATA_DIR / "output"
DB_PATH = DATA_DIR / "jobs.db"

VOICES_DIR = Path(os.environ.get("VOICES_DIR", DATA_DIR / "voices"))
DEFAULT_VOICE = os.environ.get("PIPER_VOICE", "en_US-lessac-medium")

MAX_UPLOAD_BYTES = int(os.environ.get("MAX_UPLOAD_BYTES", 25 * 1024 * 1024))
MP3_BITRATE = os.environ.get("MP3_BITRATE", "128k")

# Format tier gating. No paywall is enforced yet (see routes/jobs.py), but every
# supported format is already classified so turning on enforcement later is a
# one-line change instead of a rewrite.
FORMAT_TIERS = {
    "txt": "free",
    "md": "free",
    "docx": "paid",
    "pdf": "paid",
}

ENFORCE_PAYWALL = os.environ.get("ENFORCE_PAYWALL", "false").lower() == "true"

for directory in (DATA_DIR, UPLOADS_DIR, OUTPUT_DIR, VOICES_DIR):
    directory.mkdir(parents=True, exist_ok=True)
