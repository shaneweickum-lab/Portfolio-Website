"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SectionHeader } from "@/components/section-header";
import { FountainEncoder, MAX_SYMBOL_INDEX } from "@/lib/fountain";
import { renderCalibrationFrame, renderOpticalFrame } from "@/lib/optical-encoder";

const DWELL_MS = 180;
const METADATA_EVERY = 8; // interleave a metadata frame every N ticks

type Phase = "idle" | "ready" | "transmitting";

export function OpticalSender() {
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const encoderRef = useRef<FountainEncoder | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef(0);
  const tickRef = useRef(0);
  const dataSymbolRef = useRef(0);
  const syncToggleRef = useRef(false);

  const [phase, setPhase] = useState<Phase>("idle");
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number; blockCount: number } | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ symbolsSent: 0, currentLabel: "" });

  const stopLoop = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }, []);

  useEffect(() => stopLoop, [stopLoop]);

  // Draws the calibration/alignment pattern whenever we're in "ready"
  // phase. Deliberately not drawn inline in handleFile/stopTransmitting --
  // canvasRef.current is still null there when entering "ready" from
  // "idle", since the <canvas> only mounts once React commits the phase
  // change, which hasn't happened yet in that same synchronous call.
  useEffect(() => {
    if (phase !== "ready") return;
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx && canvasRef.current) renderCalibrationFrame(ctx, canvasRef.current.width);
  }, [phase]);

  async function handleFile(file: File) {
    setError(null);
    try {
      const buffer = new Uint8Array(await file.arrayBuffer());
      const encoder = new FountainEncoder(buffer);
      encoderRef.current = encoder;
      tickRef.current = 0;
      dataSymbolRef.current = 0;
      setFileInfo({ name: file.name, size: buffer.length, blockCount: encoder.blockCount });
      setStats({ symbolsSent: 0, currentLabel: "" });
      setPhase("ready");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't read that file.");
    }
  }

  function startTransmitting() {
    setPhase("transmitting");
    lastTickRef.current = performance.now();
    const loop = (now: number) => {
      const canvas = canvasRef.current;
      const encoder = encoderRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !encoder || !ctx) return;

      if (now - lastTickRef.current >= DWELL_MS) {
        lastTickRef.current = now;
        syncToggleRef.current = !syncToggleRef.current;

        const isMetadataTick = tickRef.current % METADATA_EVERY === 0;
        let frame;
        let label;
        if (isMetadataTick) {
          frame = encoder.metadataFrame();
          label = "metadata";
        } else {
          const symbolIndex = dataSymbolRef.current % (MAX_SYMBOL_INDEX + 1);
          frame = encoder.dataFrame(symbolIndex);
          label =
            symbolIndex < encoder.blockCount
              ? `block ${symbolIndex + 1}/${encoder.blockCount} (systematic)`
              : `repair symbol ${symbolIndex - encoder.blockCount + 1}`;
          dataSymbolRef.current++;
        }
        tickRef.current++;

        renderOpticalFrame(ctx, canvas.width, frame, syncToggleRef.current);
        setStats((prev) => ({ symbolsSent: prev.symbolsSent + 1, currentLabel: label }));
      }

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  }

  function stopTransmitting() {
    stopLoop();
    setPhase("ready");
  }

  function reset() {
    stopLoop();
    encoderRef.current = null;
    setFileInfo(null);
    setPhase("idle");
  }

  if (phase === "idle") {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <SectionHeader
          kicker="Airgap — Sender"
          title="Send a file with light"
          description="Pick a small file. It's encoded into a color-flicker pattern on this screen — no network, no pairing, just a camera pointed at this display."
          accent="signal"
        />

        <div
          onClick={() => inputRef.current?.click()}
          className="mt-10 flex w-full cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-surface/60 px-8 py-16 transition-colors hover:border-signal"
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          <p className="font-medium text-foreground">Click to choose a file</p>
          <p className="text-sm text-muted">Small files work best — a few KB, not a few MB</p>
        </div>

        {error && (
          <p className="mt-4 rounded-lg border border-ember/40 bg-ember/10 px-4 py-2 text-sm text-ember">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-10 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-signal">Airgap — Sender</p>
      {fileInfo && (
        <p className="mt-3 text-sm text-muted">
          {fileInfo.name} · {fileInfo.size} bytes · {fileInfo.blockCount} blocks
        </p>
      )}

      <canvas
        ref={canvasRef}
        width={640}
        height={640}
        className="mt-6 aspect-square w-full max-w-md rounded-2xl border border-border"
      />

      {phase === "ready" && (
        <>
          <p className="mt-4 max-w-sm text-sm text-muted">
            This is the alignment pattern. Point the receiver&apos;s camera
            at this screen, wait for its calibration readout to look
            stable, then start transmitting.
          </p>
          <div className="mt-6 flex gap-3">
            <button
              onClick={startTransmitting}
              className="rounded-full bg-signal px-6 py-3 text-sm font-medium text-white"
            >
              Start transmitting
            </button>
            <button
              onClick={reset}
              className="rounded-full border border-border px-6 py-3 text-sm text-foreground"
            >
              Choose another file
            </button>
          </div>
        </>
      )}

      {phase === "transmitting" && (
        <>
          <p className="mt-4 text-sm text-muted">
            Sending: {stats.currentLabel} · {stats.symbolsSent} symbols sent
          </p>
          <p className="mt-1 text-xs text-muted">
            Keeps looping until stopped — the receiver can join at any time
            and will pick up whatever it needs.
          </p>
          <button
            onClick={stopTransmitting}
            className="mt-6 rounded-full border border-border px-6 py-3 text-sm text-foreground"
          >
            Stop
          </button>
        </>
      )}
    </div>
  );
}
