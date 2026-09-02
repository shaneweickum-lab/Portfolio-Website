"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface AdminLoginProps {
  onSuccess?: (token: string) => void;
}

export function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
        setStatus("error");
        return;
      }

      localStorage.setItem("adminToken", data.token);
      onSuccess?.(data.token);
      router.push("/admin/dashboard");
    } catch {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@example.com"
          required
          className="rounded-lg border border-border bg-surface px-4 py-2 text-foreground placeholder-muted focus:border-signal focus:outline-none focus:ring-1 focus:ring-signal/20"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm font-medium text-foreground">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          className="rounded-lg border border-border bg-surface px-4 py-2 text-foreground placeholder-muted focus:border-signal focus:outline-none focus:ring-1 focus:ring-signal/20"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-lg bg-signal px-4 py-2 text-sm font-medium text-onaccent transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {status === "loading" ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
