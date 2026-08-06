# Narrate — Audiobook Maker

Upload a manuscript, get back a narrated MP3. A standalone, installable PWA
that lives alongside the main portfolio but deploys and runs independently.

## Architecture

```
apps/audiobook-maker/
  web/       Next.js PWA (upload UI, job status, playback/download) → Vercel
  backend/   FastAPI service (parsing, Piper TTS, mp3 encoding)      → Fly.io
```

The frontend never does any parsing or audio work itself — it uploads a
file to the backend, gets a job id back, and polls `/jobs/{id}` until the
job is `done` (or `error`), at which point it can stream/download the mp3
from `/jobs/{id}/download`.

The backend runs as a single always-on-when-needed process (not classic
serverless functions) because Piper TTS needs a loaded model in memory and
meaningful CPU time per document — a poor fit for short-lived serverless
invocations. Fly.io's scale-to-zero machines keep this cheap without those
constraints.

## Why a separate app instead of a page on the portfolio

- Installable on its own, with its own icon/name — it's a tool, not a blog post.
- Independent deploys: shipping a change here never risks the portfolio site.
- Own domain/subdomain, own scaling, own outage blast radius.

The portfolio's Projects page just links out to it.

## Formats

| Format | Parser | Status |
|---|---|---|
| `.txt` | built-in | ✅ free |
| `.md` | `markdown` + `beautifulsoup4` (code blocks stripped) | ✅ free |
| `.docx` | `python-docx` | ✅ works today, free until a paid tier exists |
| `.pdf` | — | not yet built (straightforward add via `pypdf`) |
| `.pages` | — | **not planned** — no viable open-source parser for Apple's proprietary bundle format. Ask users to export to `.docx` or PDF from Pages instead (two clicks in Pages). |
| Google Docs | — | **not a file format** — would need a separate Google OAuth + Drive API integration, not a file-upload parser. Future feature, not in scope here. |

No paywall is enforced yet. `backend/app/config.py` has a `FORMAT_TIERS` map
and an `ENFORCE_PAYWALL` env flag — flipping that on later to gate `.docx`/`.pdf`
behind a paid plan is a one-line change, not a rewrite.

## Local development

**Backend:**

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python -m piper.download_voices en_US-lessac-medium --download-dir ./voices
DATA_DIR=./data VOICES_DIR=./voices uvicorn app.main:app --reload
```

**Frontend:**

```bash
cd web
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
npm run dev
```

There's also `backend/manual_test.py` — a standalone smoke test (parsing,
synthesis, mp3 encoding, and the full upload → poll → download API flow)
that doesn't require pytest. Run it with `python manual_test.py` after
installing requirements.

> **Note on this build**: the voice model download (`piper.download_voices`)
> pulls from huggingface.co, which was blocked by this sandbox's network
> policy — so the Piper voice model itself couldn't be downloaded or tested
> here. Everything else (parsing all three formats, the async job pipeline,
> ffmpeg mp3 encoding, the real HTTP API, and the full frontend upload flow)
> was verified end-to-end using a stubbed voice standing in for Piper's
> neural synthesis. Run `manual_test.py` or the app itself with the real
> voice model on a machine with normal internet access (or once deployed to
> Fly.io) to confirm actual speech quality.

## Deploying

### Backend → Fly.io

```bash
cd backend
fly launch --no-deploy   # creates the app, keeps our fly.toml
fly volumes create audiobook_data --size 3   # persistent storage for jobs.db + output
fly deploy
```

The Dockerfile bakes the default voice model (`en_US-lessac-medium`) into
the image at build time, so cold starts don't need to hit the network.

### Frontend → Vercel

1. New Vercel project, same GitHub repo, **Root Directory** set to
   `apps/audiobook-maker/web`.
2. Framework preset: Next.js (auto-detected).
3. Environment variable: `NEXT_PUBLIC_API_URL` = your Fly.io backend URL
   (e.g. `https://audiobook-maker-api.fly.dev`).
4. Set `ALLOWED_ORIGINS` on the Fly.io side (in `fly.toml` or as a Fly
   secret) to your Vercel domain, so the backend's CORS allows it.
5. Point a subdomain at it (e.g. `narrate.shaneweickum.com`) once deployed,
   then add a real link to the `narrate-audiobook-maker` project entry back
   in the main portfolio's content.
