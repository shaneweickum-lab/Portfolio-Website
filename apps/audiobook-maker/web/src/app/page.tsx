"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { SUPPORTED_FORMATS, uploadDocument } from "@/lib/api";

function extensionOf(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

export default function UploadPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const acceptedExtensions = SUPPORTED_FORMATS.map((f) => f.extension);

  async function handleFile(file: File) {
    const extension = extensionOf(file.name);
    if (!acceptedExtensions.includes(extension)) {
      setError(
        `.${extension} isn't supported yet. Try: ${acceptedExtensions.map((e) => `.${e}`).join(", ")}`,
      );
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const job = await uploadDocument(file);
      router.push(`/jobs/${job.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">
        Narrate
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
        Turn your manuscript into an audiobook
      </h1>
      <p className="mt-4 max-w-lg text-muted">
        Upload a document and get back a narrated MP3, chapter pauses and all.
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
        onClick={() => inputRef.current?.click()}
        className={`mt-10 flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-8 py-16 transition-colors ${
          dragging ? "border-accent bg-surface" : "border-border bg-surface/60"
        } cursor-pointer`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={acceptedExtensions.map((e) => `.${e}`).join(",")}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        <p className="font-medium">
          {submitting ? "Uploading…" : "Drop a file here, or click to browse"}
        </p>
        <p className="text-sm text-muted">
          {SUPPORTED_FORMATS.map((f) => f.label).join("  ·  ")}
        </p>
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-accent-strong/40 bg-accent-strong/10 px-4 py-2 text-sm text-accent-strong">
          {error}
        </p>
      )}

      <p className="mt-8 text-xs text-muted">
        .docx support is here today and free while there&apos;s no paid plan yet.
      </p>
    </div>
  );
}
