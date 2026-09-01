"use client";

import { useState } from "react";
import { Pause, Play, SkipBack, SkipForward, Sparkles, X } from "lucide-react";
import { useSpeechReader } from "@/hooks/use-speech-reader";
import { useKokoroReader } from "@/hooks/use-kokoro-reader";
import type { ParsedDocument } from "@/lib/parse-document";

const ENGINE_STORAGE_KEY = "narrate:engine";
type Engine = "speech" | "kokoro";

export function NarrateReader({
  doc,
  onClose,
}: {
  doc: ParsedDocument;
  onClose: () => void;
}) {
  const speech = useSpeechReader(doc.paragraphs);
  const kokoro = useKokoroReader(doc.paragraphs);
  const [engine, setEngine] = useState<Engine>(() => {
    if (typeof window === "undefined") return "speech";
    const stored = localStorage.getItem(ENGINE_STORAGE_KEY);
    return stored === "kokoro" || stored === "speech" ? stored : "speech";
  });

  function chooseEngine(next: Engine) {
    speech.stop();
    kokoro.stop();
    setEngine(next);
    localStorage.setItem(ENGINE_STORAGE_KEY, next);
    if (next === "kokoro" && (kokoro.modelState === "not-loaded" || kokoro.modelState === "error")) {
      kokoro.enable();
    }
  }

  if (speech.status === "unsupported" && engine === "speech") {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center justify-center px-6 py-16 text-center">
        <p className="rounded-lg border border-ember/40 bg-ember/10 px-4 py-3 text-sm text-ember">
          This browser doesn&apos;t support text-to-speech (the Web Speech
          API). Try Chrome, Edge, or Safari — or switch to the better voice
          below.
        </p>
        <button onClick={onClose} className="mt-6 text-sm text-signal">
          Back
        </button>
      </div>
    );
  }

  const usingKokoro = engine === "kokoro";
  const modelDownloading = usingKokoro && kokoro.modelState === "loading";
  const modelWarmingUp = usingKokoro && kokoro.modelState === "warming-up";
  const modelReady = usingKokoro && kokoro.modelState === "ready";
  const isPlaying = usingKokoro ? kokoro.status === "playing" : speech.status === "playing";
  const isBuffering = usingKokoro && kokoro.status === "buffering";
  const currentIndex = usingKokoro ? kokoro.currentIndex : speech.currentIndex;
  const progress = usingKokoro ? kokoro.progress : speech.progress;
  const displayIndex = Math.min(currentIndex, doc.paragraphs.length - 1);
  const errorMessage = usingKokoro ? kokoro.errorMessage : speech.errorMessage;
  const transportDisabled = usingKokoro && !modelReady;

  function handlePlayPause() {
    const target = usingKokoro ? kokoro : speech;
    if (isPlaying) {
      target.pause();
    } else {
      target.play();
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col px-6 py-10">
      <div className="flex items-center justify-between">
        <p className="truncate font-medium text-muted">{doc.title}</p>
        <button
          onClick={onClose}
          aria-label="Choose another file"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border text-muted hover:text-foreground"
        >
          <X size={16} />
        </button>
      </div>

      <div className="mt-6 flex gap-2 rounded-full border border-border bg-surface p-1 text-sm">
        <button
          onClick={() => chooseEngine("speech")}
          className={`flex-1 rounded-full px-3 py-1.5 transition-colors ${
            !usingKokoro ? "bg-signal text-onaccent" : "text-muted hover:text-foreground"
          }`}
        >
          Device voice
        </button>
        <button
          onClick={() => chooseEngine("kokoro")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 transition-colors ${
            usingKokoro ? "bg-signal text-onaccent" : "text-muted hover:text-foreground"
          }`}
        >
          <Sparkles size={14} />
          Better voice
        </button>
      </div>
      {usingKokoro && (
        <p className="mt-2 text-center text-xs text-muted">
          A neural voice model, downloaded once and cached in your browser —
          noticeably more natural than your device&apos;s built-in voices.
        </p>
      )}

      {modelDownloading && (
        <div className="mt-4">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full rounded-full bg-signal transition-all duration-300"
              style={{ width: `${Math.round(kokoro.modelProgress * 100)}%` }}
            />
          </div>
          <p className="mt-2 text-center text-xs text-muted">
            Downloading the better voice model — {Math.round(kokoro.modelProgress * 100)}%.
            This only happens once.
          </p>
        </div>
      )}
      {modelWarmingUp && (
        <div className="mt-4">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
            <div className="h-full w-1/3 animate-pulse rounded-full bg-signal" />
          </div>
          <p className="mt-2 text-center text-xs text-muted">
            Setting up the voice — this can take a little longer on the
            first run.
          </p>
        </div>
      )}

      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
        <div
          className="h-full rounded-full bg-signal transition-all duration-300"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-muted">
        Paragraph {displayIndex + 1} of {doc.paragraphs.length}
      </p>

      {isBuffering && (
        <div className="mt-3">
          <div className="h-1 w-full overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full rounded-full bg-signal/70 transition-all duration-150 ease-linear"
              style={{ width: `${Math.round(kokoro.bufferProgress * 100)}%` }}
            />
          </div>
          <p className="mt-1.5 text-center text-xs text-muted">Generating audio…</p>
        </div>
      )}

      <div className="mt-8 flex min-h-64 items-center justify-center rounded-2xl border border-border bg-surface p-8">
        <p className="text-center text-xl leading-relaxed text-foreground">
          {doc.paragraphs[displayIndex]}
        </p>
      </div>

      {errorMessage && (
        <p className="mt-6 rounded-lg border border-ember/40 bg-ember/10 px-4 py-2 text-center text-sm text-ember">
          {errorMessage}
        </p>
      )}
      {!errorMessage && !usingKokoro && speech.voicesUnavailable && (
        <p className="mt-6 rounded-lg border border-border bg-surface-muted px-4 py-2 text-center text-sm text-muted">
          No text-to-speech voices were found on this device. Playback may
          not work here — this is a device/browser limitation, not something
          wrong with your file.
        </p>
      )}

      <div className="mt-8 flex items-center justify-center gap-4">
        <button
          onClick={usingKokoro ? kokoro.skipPrev : speech.skipPrev}
          disabled={displayIndex === 0 || transportDisabled}
          aria-label="Previous paragraph"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-foreground disabled:opacity-30"
        >
          <SkipBack size={18} />
        </button>
        <button
          onClick={handlePlayPause}
          disabled={transportDisabled || isBuffering}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-signal text-onaccent disabled:opacity-40"
        >
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </button>
        <button
          onClick={usingKokoro ? kokoro.skipNext : speech.skipNext}
          disabled={displayIndex >= doc.paragraphs.length - 1 || transportDisabled}
          aria-label="Next paragraph"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-foreground disabled:opacity-30"
        >
          <SkipForward size={18} />
        </button>
      </div>

      {!usingKokoro && speech.voices.length > 0 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <label htmlFor="voice-picker" className="text-xs text-muted">
            Voice
          </label>
          <select
            id="voice-picker"
            value={speech.voiceURI ?? ""}
            onChange={(e) => speech.selectVoice(e.target.value)}
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-foreground"
          >
            {speech.voices.map((voice) => (
              <option key={voice.voiceURI} value={voice.voiceURI}>
                {voice.name} ({voice.lang})
              </option>
            ))}
          </select>
        </div>
      )}

      {usingKokoro && modelReady && kokoro.voices.length > 0 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <label htmlFor="kokoro-voice-picker" className="text-xs text-muted">
            Voice
          </label>
          <select
            id="kokoro-voice-picker"
            value={kokoro.voiceId}
            onChange={(e) => kokoro.selectVoice(e.target.value)}
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-foreground"
          >
            {kokoro.voices.map((voice) => (
              <option key={voice.id} value={voice.id}>
                {voice.name} ({voice.language}, {voice.gender})
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
