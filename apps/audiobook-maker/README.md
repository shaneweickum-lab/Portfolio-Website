# Narrate — Read Aloud

Upload a manuscript, have it read aloud right in your browser. A standalone,
installable PWA that lives alongside the main portfolio but deploys and
runs independently — and, as of this MVP, entirely client-side.

## Architecture

```
apps/audiobook-maker/
  web/    Next.js PWA — parsing, TTS, and playback all run in the browser
```

There is no backend. Parsing and narration both happen on-device:

- **Parsing** — `.txt` read directly; `.md` parsed with `marked`'s lexer
  (code blocks skipped, inline formatting stripped via the browser's
  `DOMParser`); `.docx` parsed with `mammoth.js`'s `extractRawText`. All of
  this runs in the browser — a file never leaves the device.
- **Narration** — the [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
  (`speechSynthesis`) reads each paragraph aloud using whatever voices are
  installed on the visitor's own device/browser, with play/pause/skip
  controls and a voice picker.

## Why this pivot

The original plan used a Python (FastAPI + Piper TTS + python-docx) backend
that rendered a downloadable MP3. That's real, working code — still in git
history (see the commit that added `apps/audiobook-maker/backend/`) — but
it needed a persistent backend host (Fly.io/Railway), volumes, Docker, and
a real deploy to test, which turned into its own multi-step yak-shave
before the actual product could be tried at all.

Device-native TTS trades the MP3-download requirement away — browsers
don't expose synthesized speech as capturable audio, so there's no way to
turn `speechSynthesis` output into a file — in exchange for: zero backend,
zero deploy, zero cost, works offline once installed, and is testable
immediately. For an MVP, that trade is worth it. MP3 export could come
back later as a separate, deliberately-scoped "render" feature (reusing
the Piper backend) if it's still wanted once this core experience is
proven.

## Why a separate app instead of a page on the portfolio

- Installable on its own, with its own icon/name — it's a tool, not a blog post.
- Independent deploys: shipping a change here never risks the portfolio site.
- Fully offline-capable once cached by its service worker — no server
  dependency at all for the core experience.

The portfolio's Projects page just links out to it.

## Formats

| Format | Parser | Status |
|---|---|---|
| `.txt` | built-in | ✅ |
| `.md` | `marked` (code blocks skipped) | ✅ |
| `.docx` | `mammoth.js` | ✅ |
| `.pdf` | — | not yet built |
| `.pages` / Google Docs | — | **out of scope** — both convert cleanly to already-supported formats (Pages → export to `.docx`/PDF; Google Docs → File → Download), so there's no need to build dedicated parsers for either. |

No tiers/paywall exist in this client-only build — that entire concept
depended on the (removed) backend gating formats server-side. If a paid
tier comes back, it'll need a different mechanism now that there's nothing
server-side to enforce it against.

## Local development

```bash
cd web
npm install
npm run dev
```

## Known limitation of this build environment

This was developed and verified inside a sandboxed environment whose
headless browser has **zero installed text-to-speech voices** — the
`speechSynthesis` API exists but every synthesis attempt fails with
`synthesis-failed`. So while parsing (all three formats), the full
upload → reader UI flow, playback controls, and graceful error-handling
were all verified end-to-end with a real browser, **actual spoken audio
output has not been verified** — that requires a real device with real
OS-level voices installed, which any normal user's browser will have.
Please try it on your own machine/phone and let me know if playback itself
doesn't work as expected.

## Deploying

Since this is now a plain static/client Next.js app with no backend, it's a
standard Vercel deploy:

1. New Vercel project (or reuse the existing one from the earlier backend
   attempt), Root Directory set to `apps/audiobook-maker/web`.
2. Framework preset: Next.js (auto-detected). No environment variables
   needed.
3. Deploy.
