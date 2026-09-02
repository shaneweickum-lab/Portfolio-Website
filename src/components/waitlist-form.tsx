"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";

interface WaitlistFormProps {
  offering?: string;
  onSuccess?: () => void;
}

export function WaitlistForm({ offering = "general", onSuccess }: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError("");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, offering }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to join waitlist");
        setStatus("error");
        return;
      }

      setStatus("success");
      setEmail("");
      setName("");
      onSuccess?.();
    } catch {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-signal/30 bg-signal/5 p-4">
        <Check className="h-5 w-5 text-signal" />
        <div>
          <p className="font-medium text-foreground">You&apos;re on the waitlist!</p>
          <p className="text-sm text-muted">We&apos;ll be in touch soon.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="text-sm font-medium text-foreground">
          Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          required
          className="rounded-lg border border-border bg-surface px-4 py-2 text-foreground placeholder-muted focus:border-signal focus:outline-none focus:ring-1 focus:ring-signal/20"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="rounded-lg border border-border bg-surface px-4 py-2 text-foreground placeholder-muted focus:border-signal focus:outline-none focus:ring-1 focus:ring-signal/20"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-signal px-4 py-2 text-sm font-medium text-onaccent transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {status === "loading" ? "Joining..." : "Join waitlist"}
        <ArrowRight size={16} />
      </button>
    </form>
  );
}
