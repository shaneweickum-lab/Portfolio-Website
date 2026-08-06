"use client";

import { useRef, useState } from "react";
import { Reader } from "@/components/reader";
import {
  parseDocument,
  SUPPORTED_EXTENSIONS,
  type ParsedDocument,
} from "@/lib/parse-document";

export default function HomePage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doc, setDoc] = useState<ParsedDocument | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setParsing(true);
    try {
      const parsed = await parseDocument(file);
      setDoc(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't read that file.");
    } finally {
      setParsing(false);
    }
  }

  if (doc) {
    return <Reader doc={doc} onClose={() => setDoc(null)} />;
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">
        Narrate
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
        Have your manuscript read aloud
      </h1>
      <p className="mt-4 max-w-lg text-muted">
        Upload a document and it&apos;s read back to you right in the
        browser, using your device&apos;s own voices. Nothing leaves your
        device.
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
          accept={SUPPORTED_EXTENSIONS.map((e) => `.${e}`).join(",")}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        <p className="font-medium">
          {parsing ? "Reading your file…" : "Drop a file here, or click to browse"}
        </p>
        <p className="text-sm text-muted">
          {SUPPORTED_EXTENSIONS.map((e) => `.${e}`).join("  ·  ")}
        </p>
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-accent-strong/40 bg-accent-strong/10 px-4 py-2 text-sm text-accent-strong">
          {error}
        </p>
      )}

      <p className="mt-8 text-xs text-muted">
        Everything happens on-device — parsing and narration never touch a
        server.
      </p>
    </div>
  );
}
