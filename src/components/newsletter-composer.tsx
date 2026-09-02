"use client";

import { useState } from "react";
import { Send } from "lucide-react";

type RecipientGroup = "waitlist" | "customers" | "all";

interface NewsletterComposerProps {
  onSuccess?: () => void;
}

export function NewsletterComposer({ onSuccess }: NewsletterComposerProps) {
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [recipientGroup, setRecipientGroup] = useState<RecipientGroup>(
    "waitlist"
  );
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(false);

  const handleSend = async () => {
    if (!subject.trim() || !content.trim()) {
      setMessage("Subject and content are required");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/admin/newsletter/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject,
          htmlContent: content,
          plainTextContent: content.replace(/<[^>]*>/g, ""),
          recipientGroup,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Failed to send newsletter");
        setStatus("error");
        return;
      }

      setMessage(data.message);
      setStatus("success");
      setSubject("");
      setContent("");
      onSuccess?.();

      setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 3000);
    } catch {
      setMessage("Network error. Please try again.");
      setStatus("error");
    }
  };

  if (preview) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setPreview(false)}
          className="text-sm text-signal hover:text-signal/80"
        >
          ← Back to editor
        </button>
        <div className="rounded-lg border border-border bg-surface p-6">
          <h2 className="font-display text-xl font-medium text-foreground">
            {subject}
          </h2>
          <div
            className="mt-4 text-sm text-muted prose prose-sm"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
        <button
          onClick={handleSend}
          disabled={status === "loading"}
          className="inline-flex items-center gap-2 rounded-lg bg-signal px-4 py-2 text-sm font-medium text-onaccent transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          Send Newsletter
          <Send size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="subject"
          className="block text-sm font-medium text-foreground"
        >
          Subject
        </label>
        <input
          id="subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Newsletter subject line"
          className="mt-2 w-full rounded-lg border border-border bg-surface px-4 py-2 text-foreground placeholder-muted focus:border-signal focus:outline-none focus:ring-1 focus:ring-signal/20"
        />
      </div>

      <div>
        <label
          htmlFor="recipients"
          className="block text-sm font-medium text-foreground"
        >
          Send to
        </label>
        <select
          id="recipients"
          value={recipientGroup}
          onChange={(e) => setRecipientGroup(e.target.value as RecipientGroup)}
          className="mt-2 w-full rounded-lg border border-border bg-surface px-4 py-2 text-foreground focus:border-signal focus:outline-none focus:ring-1 focus:ring-signal/20"
        >
          <option value="waitlist">Waitlist Members</option>
          <option value="customers">Active Customers</option>
          <option value="all">All (Waitlist + Customers)</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="content"
          className="block text-sm font-medium text-foreground"
        >
          Content
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your newsletter content here. You can use HTML tags for formatting."
          rows={10}
          className="mt-2 w-full rounded-lg border border-border bg-surface px-4 py-2 text-foreground placeholder-muted focus:border-signal focus:outline-none focus:ring-1 focus:ring-signal/20"
        />
        <p className="mt-1 text-xs text-muted">
          Supports HTML formatting (e.g., &lt;p&gt;, &lt;strong&gt;, &lt;a&gt;,
          etc.)
        </p>
      </div>

      {message && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            status === "success"
              ? "border-signal/30 bg-signal/5 text-signal"
              : "border-red-500/20 bg-red-500/5 text-red-400"
          }`}
        >
          {message}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => setPreview(true)}
          disabled={status === "loading" || !subject.trim() || !content.trim()}
          className="inline-block rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-signal hover:text-signal disabled:opacity-50"
        >
          Preview
        </button>
        <button
          onClick={handleSend}
          disabled={status === "loading" || !subject.trim() || !content.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-signal px-4 py-2 text-sm font-medium text-onaccent transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {status === "loading" ? "Sending..." : "Send Newsletter"}
          {status !== "loading" && <Send size={16} />}
        </button>
      </div>
    </div>
  );
}
