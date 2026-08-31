"use client";

import { useEffect, useRef, useState } from "react";
import type { Worker } from "tesseract.js";
import { SectionHeader } from "@/components/section-header";
import { Tag } from "@/components/tag";
import { loadMathOcr, recognizeMathText, type OcrLoadProgress } from "@/lib/math-ocr-engine";
import { normalizeMathText, solveMathText, type MathSolveResult } from "@/lib/math-solver";

type CameraStatus = "requesting" | "denied" | "watching";

const CAPTURE_WIDTH = 640;
const STABLE_READS_REQUIRED = 2; // consecutive matching reads before an answer is shown, not just the first guess
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

function cameraHint(cameraStatus: CameraStatus, ocrReady: boolean, liveText: string, hasConfirmed: boolean): string {
  if (!ocrReady) return "Loading the OCR engine…";
  if (cameraStatus === "requesting") return "Requesting camera access…";
  if (hasConfirmed) return "Move to a new problem any time — it updates automatically.";
  if (liveText.trim().length > 0) return "Reading… hold steady";
  return "Point the camera at a printed math problem";
}

export function CameraMathSolver() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workerRef = useRef<Worker | null>(null);

  const [ocrProgress, setOcrProgress] = useState<OcrLoadProgress | null>(null);
  const [ocrReady, setOcrReady] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>("requesting");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [liveText, setLiveText] = useState("");
  const [confirmed, setConfirmed] = useState<{ normalized: string; result: MathSolveResult } | null>(null);

  // Load the Tesseract.js worker once, independent of camera permission.
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

  // Request the camera once, independent of OCR load state.
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

  // The recognize-and-solve loop: only runs once both the camera feed and
  // the OCR worker are ready, and reschedules itself after each cycle
  // finishes rather than on a fixed interval, so a slow device never
  // queues up overlapping recognize() calls.
  useEffect(() => {
    if (cameraStatus !== "watching" || !ocrReady) return;

    let cancelled = false;
    let timeoutHandle: ReturnType<typeof setTimeout> | null = null;
    let pendingNormalized = "";
    let pendingCount = 0;

    async function recognizeOnce() {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const worker = workerRef.current;
      if (!video || !canvas || !worker || video.readyState < 2) return;

      const aspect = video.videoWidth > 0 ? video.videoHeight / video.videoWidth : 0.75;
      const width = CAPTURE_WIDTH;
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
        setConfirmed((prev) => (prev?.normalized === normalized ? prev : { normalized, result }));
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
  }, [cameraStatus, ocrReady]);

  const description = confirmed ? describeResult(confirmed.result) : null;
  const progressPct = ocrProgress ? Math.round(ocrProgress.progress * 100) : 0;

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-10 text-center">
      <SectionHeader
        kicker="Camera Math Solver"
        title="Point your camera at a math problem"
        description="Recognizes printed arithmetic and single-variable linear equations, and solves them live -- entirely in your browser."
        accent="signal"
      />

      <div className="relative mt-8 w-full max-w-md overflow-hidden rounded-2xl border border-border">
        <video ref={videoRef} muted playsInline className="w-full" />
        <canvas ref={canvasRef} className="hidden" />
        <div className="pointer-events-none absolute inset-6 rounded-xl border-2 border-dashed border-signal/50" />
      </div>

      {!ocrReady && !ocrError && (
        <div className="mt-6 w-full">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full rounded-full bg-signal transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted">
            {ocrProgress ? `${ocrProgress.status} (${progressPct}%)` : "Starting…"}
          </p>
        </div>
      )}

      {ocrError && (
        <p className="mt-6 rounded-lg border border-ember/40 bg-ember/10 px-4 py-2 text-sm text-ember">
          {ocrError}
        </p>
      )}

      {cameraStatus === "denied" && (
        <p className="mt-6 rounded-lg border border-ember/40 bg-ember/10 px-4 py-2 text-sm text-ember">
          {cameraError ?? "Camera access was denied."}
        </p>
      )}

      <p className="mt-6 text-sm font-medium text-foreground">
        {cameraHint(cameraStatus, ocrReady, liveText, confirmed !== null)}
      </p>

      {liveText && (
        <p className="mt-2 max-w-sm truncate font-mono text-xs text-muted">
          Reading: {liveText}
        </p>
      )}

      {confirmed && description && (
        <div className="mt-6 w-full rounded-2xl border border-border bg-surface-muted p-6">
          <Tag accent={description.accent}>{confirmed.normalized}</Tag>
          <p className="mt-3 font-display text-4xl font-medium text-foreground">{description.headline}</p>
          {description.detail && <p className="mt-2 text-sm text-muted">{description.detail}</p>}
        </div>
      )}

      <div className="mt-10 max-w-md text-left text-xs text-muted">
        <p className="font-medium text-foreground">What this can and can&apos;t do</p>
        <ul className="mt-2 flex flex-col gap-1.5">
          <li>— Arithmetic expressions and single-variable linear equations (using &quot;x&quot;), on printed text.</li>
          <li>— Quadratics, multiple variables, and handwriting are out of scope, and it says so rather than guessing.</li>
          <li>— A lowercase &quot;x&quot; is always read as the variable; use &quot;×&quot; for multiplication.</li>
          <li>— Everything -- the camera feed, OCR, and the math -- runs locally in your browser. Nothing is uploaded anywhere.</li>
        </ul>
      </div>
    </div>
  );
}
