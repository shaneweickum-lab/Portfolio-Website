"use client";

import { useEffect, useRef, useState } from "react";
import type { Worker } from "tesseract.js";
import type { ImageToTextPipelineType } from "@huggingface/transformers";
import { SectionHeader } from "@/components/section-header";
import { Tag } from "@/components/tag";
import { loadMathOcr, recognizeMathText, type OcrLoadProgress } from "@/lib/math-ocr-engine";
import { loadHandwritingOcr, recognizeHandwriting, type ModelLoadProgress } from "@/lib/handwriting-ocr-engine";
import { normalizeMathText, solveMathText, type MathSolveResult } from "@/lib/math-solver";

type CameraStatus = "requesting" | "denied" | "watching";
type Mode = "live" | "frozen";
type Engine = "printed" | "handwriting";

const LIVE_CAPTURE_WIDTH = 640;
const FREEZE_CAPTURE_WIDTH = 1280; // a deliberate freeze isn't time-critical, so it's worth the extra detail
const STABLE_READS_REQUIRED = 2; // consecutive matching reads before a live answer is shown, not just the first guess
const CYCLE_DELAY_MS = 150; // gap on top of however long recognize() itself takes

function formatNumber(value: number): string {
  const rounded = Math.round(value * 1e6) / 1e6;
  if (Number.isInteger(rounded)) return String(rounded);
  return rounded.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
}

function describeResult(result: MathSolveResult): { headline: string; detail?: string; accent: "signal" | "ok" | "ember" } {
  switch (result.kind) {
    case "expression":
      return { headline: `= ${formatNumber(result.value)}`, accent: "ok" };
    case "equation-numeric":
      return {
        headline: result.holds ? "True" : "False",
        detail: `${result.lhs} = ${result.rhs}`,
        accent: result.holds ? "ok" : "ember",
      };
    case "equation-linear":
      return { headline: `x = ${formatNumber(result.solution)}`, accent: "ok" };
    case "unsupported":
      return { headline: "Can't solve this one", detail: result.reason, accent: "ember" };
  }
}

function liveHint(
  engine: Engine,
  cameraStatus: CameraStatus,
  ready: boolean,
  liveText: string,
  hasSolved: boolean,
): string {
  if (!ready) return engine === "printed" ? "Loading the OCR engine…" : "Loading the handwriting model…";
  if (cameraStatus === "requesting") return "Requesting camera access…";
  if (hasSolved) return "Move to a new problem any time — it updates automatically.";
  if (engine === "handwriting") return "Frame a single handwritten line tightly, then freeze it";
  if (liveText.trim().length > 0) return "Reading… hold steady";
  return "Point the camera at a printed math problem, or freeze a frame for a closer look";
}

// Captures the current video frame onto both a visible display canvas (an
// untouched copy, so the user sees exactly what was captured) and a hidden
// OCR canvas (grayscale + contrast, tuned for Tesseract's printed-text
// engine -- the handwriting engine instead reads the untouched display
// canvas directly, since that preprocessing isn't calibrated for it).
function captureFrame(
  video: HTMLVideoElement,
  displayCanvas: HTMLCanvasElement,
  ocrCanvas: HTMLCanvasElement,
  width: number,
): boolean {
  if (video.readyState < 2 || video.videoWidth === 0) return false;
  const aspect = video.videoHeight / video.videoWidth;
  const height = Math.round(width * aspect);

  displayCanvas.width = width;
  displayCanvas.height = height;
  const displayCtx = displayCanvas.getContext("2d");
  if (!displayCtx) return false;
  displayCtx.drawImage(video, 0, 0, width, height);

  ocrCanvas.width = width;
  ocrCanvas.height = height;
  const ocrCtx = ocrCanvas.getContext("2d");
  if (!ocrCtx) return false;
  ocrCtx.filter = "grayscale(1) contrast(1.6)";
  ocrCtx.drawImage(video, 0, 0, width, height);

  return true;
}

export function CameraMathSolver() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const liveCanvasRef = useRef<HTMLCanvasElement>(null); // hidden, live-loop OCR input
  const freezeDisplayRef = useRef<HTMLCanvasElement>(null); // visible frozen preview
  const freezeOcrRef = useRef<HTMLCanvasElement>(null); // hidden, frozen-frame OCR input
  const workerRef = useRef<Worker | null>(null);
  const handwritingRef = useRef<ImageToTextPipelineType | null>(null);
  const handwritingLoadStartedRef = useRef(false);

  const [ocrProgress, setOcrProgress] = useState<OcrLoadProgress | null>(null);
  const [ocrReady, setOcrReady] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [handwritingProgress, setHandwritingProgress] = useState<ModelLoadProgress | null>(null);
  const [handwritingReady, setHandwritingReady] = useState(false);
  const [handwritingError, setHandwritingError] = useState<string | null>(null);
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>("requesting");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [engine, setEngine] = useState<Engine>("printed");
  const [mode, setMode] = useState<Mode>("live");
  const [liveText, setLiveText] = useState("");
  const [solved, setSolved] = useState<{ normalized: string; result: MathSolveResult } | null>(null);
  const [frozenAnalyzing, setFrozenAnalyzing] = useState(false);
  const [frozenNoRead, setFrozenNoRead] = useState(false);

  // Load the Tesseract.js worker once, independent of camera permission --
  // this is the default engine, so it loads eagerly.
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      loadMathOcr((progress) => {
        if (!cancelled) setOcrProgress(progress);
      })
        .then((worker) => {
          if (cancelled) {
            worker.terminate();
            return;
          }
          workerRef.current = worker;
          setOcrReady(true);
        })
        .catch((err) => {
          if (!cancelled) setOcrError(err instanceof Error ? err.message : "Failed to load the OCR engine.");
        });
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  // Load the handwriting model lazily, only once the user actually switches
  // to it -- it's a separate, much larger download than Tesseract, so
  // nobody using the (default) printed-text engine should pay for it.
  useEffect(() => {
    if (engine !== "handwriting" || handwritingLoadStartedRef.current) return;
    handwritingLoadStartedRef.current = true;

    let cancelled = false;
    const timer = setTimeout(() => {
      loadHandwritingOcr((progress) => {
        if (!cancelled) setHandwritingProgress(progress);
      })
        .then((ocr) => {
          if (cancelled) return;
          handwritingRef.current = ocr;
          setHandwritingReady(true);
        })
        .catch(() => {
          if (!cancelled) {
            setHandwritingError(
              "Couldn't download the handwriting model. It's fetched from a public CDN on first use, so this usually means a network or ad-blocker issue -- printed text still works normally.",
            );
          }
        });
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [engine]);

  // Request the camera once, independent of engine/OCR load state. The
  // stream keeps running even while a frame is frozen, so re-freezing never
  // needs to re-request permission or restart the video element.
  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;

    const timer = setTimeout(() => {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "environment" } })
        .catch(() => navigator.mediaDevices.getUserMedia({ video: true }))
        .then(async (mediaStream) => {
          if (cancelled) {
            mediaStream.getTracks().forEach((track) => track.stop());
            return;
          }
          stream = mediaStream;
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
            await videoRef.current.play();
          }
          setCameraStatus("watching");
        })
        .catch((err) => {
          if (!cancelled) {
            setCameraStatus("denied");
            setCameraError(err instanceof Error ? err.message : "Camera access failed.");
          }
        });
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  // The continuous recognize-and-solve loop: printed-text only (the
  // handwriting model is too slow to run every ~150ms and is
  // freeze-frame-only), runs in live mode once the camera and Tesseract
  // worker are ready, and reschedules itself after each cycle finishes
  // rather than on a fixed interval, so a slow device never queues up
  // overlapping recognize() calls. Freezing a frame, or switching engines,
  // tears this down via the cleanup below.
  useEffect(() => {
    if (engine !== "printed" || mode !== "live" || cameraStatus !== "watching" || !ocrReady) return;

    let cancelled = false;
    let timeoutHandle: ReturnType<typeof setTimeout> | null = null;
    let pendingNormalized = "";
    let pendingCount = 0;

    async function recognizeOnce() {
      const video = videoRef.current;
      const canvas = liveCanvasRef.current;
      const worker = workerRef.current;
      if (!video || !canvas || !worker || video.readyState < 2) return;

      const aspect = video.videoWidth > 0 ? video.videoHeight / video.videoWidth : 0.75;
      const width = LIVE_CAPTURE_WIDTH;
      const height = Math.round(width * aspect);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      // Grayscale + boosted contrast gives Tesseract a cleaner shot on a
      // photographed page than the raw camera feed's color/exposure noise.
      ctx.filter = "grayscale(1) contrast(1.6)";
      ctx.drawImage(video, 0, 0, width, height);

      const rawText = await recognizeMathText(worker, canvas);
      if (cancelled) return;

      setLiveText(rawText.trim());
      const normalized = normalizeMathText(rawText);
      const result = solveMathText(rawText);

      if (result && normalized === pendingNormalized) {
        pendingCount++;
      } else {
        pendingNormalized = normalized;
        pendingCount = result ? 1 : 0;
      }

      if (result && pendingCount >= STABLE_READS_REQUIRED) {
        setSolved((prev) => (prev?.normalized === normalized ? prev : { normalized, result }));
      }
    }

    async function loop() {
      try {
        await recognizeOnce();
      } catch {
        // One failed recognize() cycle isn't fatal -- the next tick tries again.
      }
      if (!cancelled) timeoutHandle = setTimeout(loop, CYCLE_DELAY_MS);
    }

    timeoutHandle = setTimeout(loop, CYCLE_DELAY_MS);

    return () => {
      cancelled = true;
      if (timeoutHandle !== null) clearTimeout(timeoutHandle);
    };
  }, [engine, mode, cameraStatus, ocrReady]);

  function handleFreeze() {
    const video = videoRef.current;
    const displayCanvas = freezeDisplayRef.current;
    const ocrCanvas = freezeOcrRef.current;
    if (!video || !displayCanvas || !ocrCanvas) return;
    if (!captureFrame(video, displayCanvas, ocrCanvas, FREEZE_CAPTURE_WIDTH)) return;

    const recognize =
      engine === "printed"
        ? workerRef.current && (() => recognizeMathText(workerRef.current!, ocrCanvas))
        : handwritingRef.current && (() => recognizeHandwriting(handwritingRef.current!, displayCanvas));
    if (!recognize) return;

    setMode("frozen");
    setLiveText("");
    setSolved(null);
    setFrozenNoRead(false);
    setFrozenAnalyzing(true);

    recognize()
      .then((rawText) => {
        const trimmed = rawText.trim();
        setLiveText(trimmed);
        const result = solveMathText(rawText);
        if (result) {
          setSolved({ normalized: normalizeMathText(rawText), result });
        } else {
          setFrozenNoRead(true);
        }
      })
      .catch(() => setFrozenNoRead(true))
      .finally(() => setFrozenAnalyzing(false));
  }

  function handleResumeLive() {
    setMode("live");
    setLiveText("");
    setSolved(null);
    setFrozenNoRead(false);
    setFrozenAnalyzing(false);
  }

  function handleEngineChange(next: Engine) {
    if (next === engine) return;
    setEngine(next);
    setMode("live");
    setLiveText("");
    setSolved(null);
    setFrozenNoRead(false);
    setFrozenAnalyzing(false);
  }

  const description = solved ? describeResult(solved.result) : null;
  const engineReady = engine === "printed" ? ocrReady : handwritingReady;
  const engineError = engine === "printed" ? ocrError : handwritingError;
  const loadProgress =
    engine === "printed"
      ? ocrProgress
        ? { status: ocrProgress.status, pct: Math.round(ocrProgress.progress * 100) }
        : null
      : handwritingProgress && handwritingProgress.total > 0
        ? { status: "Downloading model", pct: Math.round((handwritingProgress.loaded / handwritingProgress.total) * 100) }
        : null;
  const canFreeze = mode === "live" && cameraStatus === "watching" && engineReady;

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-10 text-center">
      <SectionHeader
        kicker="Camera Math Solver"
        title="Point your camera at a math problem"
        description="Recognizes printed arithmetic and single-variable linear equations, and solves them live -- entirely in your browser. Freeze a frame for a steadier, higher-detail read."
        accent="signal"
      />

      <div className="mt-6 inline-flex rounded-full border border-border p-1 text-sm">
        <button
          onClick={() => handleEngineChange("printed")}
          className={`whitespace-nowrap rounded-full px-3 py-1.5 font-medium transition-colors sm:px-4 ${
            engine === "printed" ? "bg-signal text-onaccent" : "text-muted hover:text-foreground"
          }`}
        >
          Printed text
        </button>
        <button
          onClick={() => handleEngineChange("handwriting")}
          className={`whitespace-nowrap rounded-full px-3 py-1.5 font-medium transition-colors sm:px-4 ${
            engine === "handwriting" ? "bg-signal text-onaccent" : "text-muted hover:text-foreground"
          }`}
        >
          <span className="sm:hidden">Handwritten</span>
          <span className="hidden sm:inline">Handwritten (experimental)</span>
        </button>
      </div>

      <div className="relative mt-4 w-full max-w-md overflow-hidden rounded-2xl border border-border">
        <video ref={videoRef} muted playsInline className={mode === "live" ? "w-full" : "hidden"} />
        <canvas ref={freezeDisplayRef} className={mode === "frozen" ? "w-full" : "hidden"} />
        <canvas ref={liveCanvasRef} className="hidden" />
        <canvas ref={freezeOcrRef} className="hidden" />
        <div className="pointer-events-none absolute inset-6 rounded-xl border-2 border-dashed border-signal/50" />
      </div>

      <div className="mt-4 flex gap-3">
        {mode === "live" ? (
          <button
            onClick={handleFreeze}
            disabled={!canFreeze}
            className="rounded-full bg-signal px-5 py-2.5 text-sm font-medium text-onaccent transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
          >
            Freeze frame
          </button>
        ) : (
          <>
            <button
              onClick={handleFreeze}
              disabled={frozenAnalyzing || !engineReady}
              className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-signal/60 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Freeze again
            </button>
            <button
              onClick={handleResumeLive}
              className="rounded-full bg-signal px-5 py-2.5 text-sm font-medium text-onaccent"
            >
              Resume live
            </button>
          </>
        )}
      </div>

      {!engineReady && !engineError && (
        <div className="mt-6 w-full">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full rounded-full bg-signal transition-all duration-300"
              style={{ width: `${loadProgress?.pct ?? 0}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted">
            {loadProgress ? `${loadProgress.status} (${loadProgress.pct}%)` : "Starting…"}
          </p>
        </div>
      )}

      {engineError && (
        <p className="mt-6 rounded-lg border border-ember/40 bg-ember/10 px-4 py-2 text-sm text-ember">
          {engineError}
        </p>
      )}

      {cameraStatus === "denied" && (
        <p className="mt-6 rounded-lg border border-ember/40 bg-ember/10 px-4 py-2 text-sm text-ember">
          {cameraError ?? "Camera access was denied."}
        </p>
      )}

      {!engineError && (
        <p className="mt-6 text-sm font-medium text-foreground">
          {mode === "frozen"
            ? frozenAnalyzing
              ? "Analyzing the frozen frame…"
              : frozenNoRead
                ? "Couldn't read any math on that frame -- try freezing again with better lighting, framing, or focus."
                : "Frame frozen."
            : liveHint(engine, cameraStatus, engineReady, liveText, solved !== null)}
        </p>
      )}

      {liveText && (
        <p className="mt-2 max-w-sm truncate font-mono text-xs text-muted">
          Reading: {liveText}
        </p>
      )}

      {solved && description && (
        <div className="mt-6 w-full rounded-2xl border border-border bg-surface-muted p-6">
          <Tag accent={description.accent}>{solved.normalized}</Tag>
          <p className="mt-3 font-display text-4xl font-medium text-foreground">{description.headline}</p>
          {description.detail && <p className="mt-2 text-sm text-muted">{description.detail}</p>}
        </div>
      )}

      <div className="mt-10 max-w-md text-left text-xs text-muted">
        <p className="font-medium text-foreground">What this can and can&apos;t do</p>
        <ul className="mt-2 flex flex-col gap-1.5">
          <li>— Arithmetic expressions and single-variable linear equations (using &quot;x&quot;), on printed or handwritten text.</li>
          <li>— Freezing a frame captures at higher resolution than the live scan, and skips waiting for repeated matching reads -- useful when lighting or a shaky hand is throwing off the live scan.</li>
          <li>— Handwriting mode is experimental, freeze-only (no live scan), and works best on a single line framed tightly -- it doesn&apos;t locate text on its own the way the printed-text engine does.</li>
          <li>— Quadratics and multiple variables are out of scope, and it says so rather than guessing.</li>
          <li>— A lowercase &quot;x&quot; is always read as the variable; use &quot;×&quot; for multiplication.</li>
          <li>— Everything -- the camera feed and OCR -- runs locally in your browser. The handwriting mode downloads its model from a public CDN on first use; nothing you capture is ever uploaded anywhere.</li>
        </ul>
      </div>
    </div>
  );
}
