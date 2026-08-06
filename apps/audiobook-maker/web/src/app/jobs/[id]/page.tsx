"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { downloadUrlFor, getJobStatus, type JobResponse } from "@/lib/api";

const STATUS_LABEL: Record<JobResponse["status"], string> = {
  queued: "Queued…",
  parsing: "Reading your document…",
  synthesizing: "Narrating…",
  encoding: "Finalizing the audio…",
  done: "Done",
  error: "Something went wrong",
};

export default function JobStatusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [job, setJob] = useState<JobResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    async function poll() {
      try {
        const latest = await getJobStatus(id);
        if (cancelled) return;
        setJob(latest);
        if (latest.status !== "done" && latest.status !== "error") {
          timer = setTimeout(poll, 1500);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Lost connection to the server.");
          timer = setTimeout(poll, 3000);
        }
      }
    }

    poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [id]);

  const progressPercent = Math.round((job?.progress ?? 0) * 100);
  const download = job ? downloadUrlFor(job) : null;

  return (
    <div className="mx-auto flex max-w-xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">Narrate</p>

      {job && (
        <p className="mt-4 max-w-md truncate text-sm text-muted">{job.filename}</p>
      )}

      <h1 className="mt-3 text-2xl font-semibold">
        {job ? STATUS_LABEL[job.status] : "Loading…"}
      </h1>

      {job && job.status !== "done" && job.status !== "error" && (
        <div className="mt-8 w-full">
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full rounded-full bg-accent transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-muted">{progressPercent}%</p>
        </div>
      )}

      {job?.status === "done" && download && (
        <div className="mt-8 flex w-full flex-col items-center gap-4">
          <audio controls src={download} className="w-full" />
          <a
            href={download}
            download
            className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-background"
          >
            Download MP3
          </a>
        </div>
      )}

      {(job?.status === "error" || error) && (
        <div className="mt-8 flex flex-col items-center gap-4">
          <p className="rounded-lg border border-accent-strong/40 bg-accent-strong/10 px-4 py-2 text-sm text-accent-strong">
            {job?.error ?? error}
          </p>
          <Link href="/" className="text-sm text-accent">
            Try another file
          </Link>
        </div>
      )}
    </div>
  );
}
