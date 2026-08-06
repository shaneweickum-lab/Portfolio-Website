"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SectionHeader } from "@/components/section-header";
import { FountainDecoder } from "@/lib/fountain";
import { OpticalReceiverPipeline, type OpticalDiagnostics } from "@/lib/optical-decoder";

type Status = "requesting" | "denied" | "watching" | "done";

const PROCESS_INTERVAL_MS = 50; // throttle heavy pixel work independent of camera/display fps
const CAPTURE_WIDTH = 640; // downscale before blob detection -- fiducials don't need full resolution

function statusHint(diagnostics: OpticalDiagnostics | null, hasDecoder: boolean, recovered: number, total: number): string {
  if (!diagnostics) return "Starting camera…";
  if (hasDecoder) return `Receiving… ${recovered}/${total} blocks recovered`;
  if (diagnostics.blobsFound < 5) return "Looking for the sender's screen — point the camera at it";
  if (!diagnostics.fiducialsAssigned) return "Found some markers, but not a clean set of 4 — hold steadier";
  if (!diagnostics.homographyOk) return "Aligning…";
  return "Aligned. Waiting for the sender to start transmitting…";
}

export function OpticalReceiver() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement>(null);
  const pipelineRef = useRef(new OpticalReceiverPipeline());
  const decoderRef = useRef<FountainDecoder | null>(null);

  const [status, setStatus] = useState<Status>("requesting");
  const [error, setError] = useState<string | null>(null);
  const [diagnostics, setDiagnostics] = useState<OpticalDiagnostics | null>(null);
  const [measuredFps, setMeasuredFps] = useState(0);
  const [progress, setProgress] = useState<{ recovered: number; total: number } | null>(null);
  const [fileReady, setFileReady] = useState<Uint8Array | null>(null);

  const resetDecodeState = useCallback(() => {
    pipelineRef.current.reset();
    decoderRef.current = null;
    setProgress(null);
    setFileReady(null);
    setStatus("watching");
  }, []);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;
    let rafHandle: number | null = null;
    let lastProcess = 0;
    let fpsCount = 0;
    let fpsWindowStart = 0;

    // Avoids re-triggering reconstruct() on every tick after completion --
    // the loop deliberately keeps running (harmless) so a reset can pick
    // up a fresh transfer without re-requesting camera permission.
    const fileReadyRef = { current: null as Uint8Array | null };

    function processTick(now: number) {
      const video = videoRef.current;
      const canvas = captureCanvasRef.current;
      if (!video || !canvas || video.readyState < 2) return;
      if (now - lastProcess < PROCESS_INTERVAL_MS) return;
      lastProcess = now;

      const aspect = video.videoWidth > 0 ? video.videoHeight / video.videoWidth : 0.75;
      const width = CAPTURE_WIDTH;
      const height = Math.round(width * aspect);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, width, height);
      const imageData = ctx.getImageData(0, 0, width, height);

      const { diagnostics: diag, decoded } = pipelineRef.current.processFrame(imageData);
      setDiagnostics(diag);

      fpsCount++;
      if (now - fpsWindowStart >= 1000) {
        setMeasuredFps(fpsCount);
        fpsCount = 0;
        fpsWindowStart = now;
      }

      if (decoded?.type === "metadata" && !decoderRef.current) {
        decoderRef.current = new FountainDecoder(decoded.meta.blockCount, decoded.meta.fileSize);
        setProgress({ recovered: 0, total: decoded.meta.blockCount });
      } else if (decoded?.type === "data" && decoderRef.current) {
        decoderRef.current.addSymbol(decoded.symbolIndex, decoded.payload);
        const decoder = decoderRef.current;
        setProgress({ recovered: decoder.recoveredCount, total: decoder.blockCount });
        if (decoder.isComplete && !fileReadyRef.current) {
          fileReadyRef.current = decoder.reconstruct();
          setFileReady(fileReadyRef.current);
          setStatus("done");
        }
      }
    }

    function loop(now: number) {
      processTick(now);
      rafHandle = requestAnimationFrame(loop);
    }

    async function start() {
      try {
        stream = await navigator.mediaDevices
          .getUserMedia({ video: { facingMode: "environment" } })
          .catch(() => navigator.mediaDevices.getUserMedia({ video: true }));
        if (cancelled) return;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setStatus("watching");
        fpsWindowStart = performance.now();
        rafHandle = requestAnimationFrame(loop);
      } catch (err) {
        setStatus("denied");
        setError(err instanceof Error ? err.message : "Camera access failed.");
      }
    }

    start();

    return () => {
      cancelled = true;
      if (rafHandle !== null) cancelAnimationFrame(rafHandle);
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  function downloadFile() {
    if (!fileReady) return;
    const blob = new Blob([fileReady as BlobPart]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "received-file";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-10 text-center">
      <SectionHeader
        kicker="Airgap — Receiver"
        title="Point your camera at the sender"
        description="Hold the camera roughly upright and facing the screen. No network is used — this reads the flicker pattern directly."
        accent="signal"
      />

      <div className="relative mt-8 w-full max-w-md overflow-hidden rounded-2xl border border-border">
        <video ref={videoRef} muted playsInline className="w-full" />
        <canvas ref={captureCanvasRef} className="hidden" />
      </div>

      {status === "denied" && (
        <p className="mt-6 rounded-lg border border-ember/40 bg-ember/10 px-4 py-2 text-sm text-ember">
          {error ?? "Camera access was denied."}
        </p>
      )}

      {(status === "watching" || status === "done") && (
        <>
          <p className="mt-6 text-sm font-medium text-foreground">
            {statusHint(diagnostics, progress !== null, progress?.recovered ?? 0, progress?.total ?? 0)}
          </p>

          {progress && (
            <div className="mt-3 w-full">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
                <div
                  className="h-full rounded-full bg-signal transition-all duration-300"
                  style={{ width: `${Math.round((progress.recovered / progress.total) * 100)}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-muted">
                {progress.recovered}/{progress.total} blocks
              </p>
            </div>
          )}

          <dl className="mt-6 grid w-full grid-cols-2 gap-3 text-left text-xs text-muted sm:grid-cols-4">
            <div>
              <dt className="text-muted">Camera fps</dt>
              <dd className="text-foreground">{measuredFps}</dd>
            </div>
            <div>
              <dt className="text-muted">Markers found</dt>
              <dd className="text-foreground">{diagnostics?.blobsFound ?? 0}/5</dd>
            </div>
            <div>
              <dt className="text-muted">Aligned</dt>
              <dd className="text-foreground">{diagnostics?.homographyOk ? "Yes" : "No"}</dd>
            </div>
            <div>
              <dt className="text-muted">Reprojection error</dt>
              <dd className="text-foreground">
                {diagnostics?.reprojectionError !== null && diagnostics?.reprojectionError !== undefined
                  ? `${diagnostics.reprojectionError.toFixed(1)}px`
                  : "—"}
              </dd>
            </div>
          </dl>
        </>
      )}

      {status === "done" && (
        <div className="mt-8 flex flex-col items-center gap-3">
          <p className="text-sm text-signal">File fully reconstructed.</p>
          <button
            onClick={downloadFile}
            className="rounded-full bg-signal px-6 py-3 text-sm font-medium text-white"
          >
            Download file
          </button>
          <button onClick={resetDecodeState} className="text-sm text-muted underline">
            Receive another file
          </button>
          <p className="max-w-sm text-xs text-muted">
            The original filename isn&apos;t transmitted — you may want to
            rename the downloaded file.
          </p>
        </div>
      )}
    </div>
  );
}
