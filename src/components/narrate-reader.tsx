"use client";

import { Pause, Play, SkipBack, SkipForward, X } from "lucide-react";
import { useSpeechReader } from "@/hooks/use-speech-reader";
import type { ParsedDocument } from "@/lib/parse-document";

export function NarrateReader({
  doc,
  onClose,
}: {
  doc: ParsedDocument;
  onClose: () => void;
}) {
  const reader = useSpeechReader(doc.paragraphs);

  if (reader.status === "unsupported") {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center justify-center px-6 py-16 text-center">
        <p className="rounded-lg border border-ember/40 bg-ember/10 px-4 py-3 text-sm text-ember">
          This browser doesn&apos;t support text-to-speech (the Web Speech
          API). Try Chrome, Edge, or Safari.
        </p>
        <button onClick={onClose} className="mt-6 text-sm text-signal">
          Back
        </button>
      </div>
    );
  }

  const displayIndex = Math.min(reader.currentIndex, doc.paragraphs.length - 1);
  const isPlaying = reader.status === "playing";

  return (
    <div className="mx-auto flex max-w-2xl flex-col px-6 py-10">
      <div className="flex items-center justify-between">
        <p className="truncate font-medium text-muted">{doc.title}</p>
        <button
          onClick={onClose}
          aria-label="Choose another file"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-muted hover:text-foreground"
        >
          <X size={16} />
        </button>
      </div>

      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
        <div
          className="h-full rounded-full bg-signal transition-all duration-300"
          style={{ width: `${Math.round(reader.progress * 100)}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-muted">
        Paragraph {displayIndex + 1} of {doc.paragraphs.length}
      </p>

      <div className="mt-8 flex min-h-64 items-center justify-center rounded-2xl border border-border bg-surface p-8">
        <p className="text-center text-xl leading-relaxed text-foreground">
          {doc.paragraphs[displayIndex]}
        </p>
      </div>

      {reader.errorMessage && (
        <p className="mt-6 rounded-lg border border-ember/40 bg-ember/10 px-4 py-2 text-center text-sm text-ember">
          {reader.errorMessage}
        </p>
      )}
      {!reader.errorMessage && reader.voicesUnavailable && (
        <p className="mt-6 rounded-lg border border-border bg-surface-muted px-4 py-2 text-center text-sm text-muted">
          No text-to-speech voices were found on this device. Playback may
          not work here — this is a device/browser limitation, not something
          wrong with your file.
        </p>
      )}

      <div className="mt-8 flex items-center justify-center gap-4">
        <button
          onClick={reader.skipPrev}
          disabled={displayIndex === 0}
          aria-label="Previous paragraph"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-foreground disabled:opacity-30"
        >
          <SkipBack size={18} />
        </button>
        <button
          onClick={isPlaying ? reader.pause : reader.play}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-signal text-white"
        >
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </button>
        <button
          onClick={reader.skipNext}
          disabled={displayIndex >= doc.paragraphs.length - 1}
          aria-label="Next paragraph"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-foreground disabled:opacity-30"
        >
          <SkipForward size={18} />
        </button>
      </div>

      {reader.voices.length > 0 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <label htmlFor="voice-picker" className="text-xs text-muted">
            Voice
          </label>
          <select
            id="voice-picker"
            value={reader.voiceURI ?? ""}
            onChange={(e) => reader.selectVoice(e.target.value)}
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-foreground"
          >
            {reader.voices.map((voice) => (
              <option key={voice.voiceURI} value={voice.voiceURI}>
                {voice.name} ({voice.lang})
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
