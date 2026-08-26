"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SectionHeader } from "@/components/section-header";
import { Tag } from "@/components/tag";

const BRIDGE_URL = process.env.NEXT_PUBLIC_MATTER_BRIDGE_URL || null;
const POLL_INTERVAL_MS = 8_000;
const FETCH_TIMEOUT_MS = 4_000;
const LAST_KNOWN_STORAGE_KEY = "matter-integration-last-known";
// Matches the bridge's own default minimum gap between accepted toggles (see
// matter-bridge/src/config.ts). Shown optimistically right after a toggle so the
// button doesn't briefly look re-clickable before the next /status poll catches up
// — the bridge's own rate limiter is still the real, authoritative enforcement.
const OPTIMISTIC_COOLDOWN_MS = 2_000;

type BridgeConnection = "checking" | "online" | "offline";

interface LastKnown {
  on: boolean;
  at: number;
}

interface StatusResponse {
  online: boolean;
  power?: "on" | "off";
  lastChangedAt?: string;
  autoOffAt?: string | null;
  cooldownRemainingMs?: number;
}

interface ToggleResponse {
  ok: boolean;
  power?: "on" | "off";
  autoOffAt?: string | null;
  error?: string;
  retryAfterMs?: number;
}

function loadLastKnown(): LastKnown | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LAST_KNOWN_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LastKnown) : null;
  } catch {
    return null;
  }
}

function saveLastKnown(value: LastKnown) {
  try {
    window.localStorage.setItem(LAST_KNOWN_STORAGE_KEY, JSON.stringify(value));
  } catch {
    // best-effort only — a full localStorage or a private-browsing quirk isn't worth surfacing
  }
}

async function fetchWithTimeout(url: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export function MatterIntegrationApp() {
  const [connection, setConnection] = useState<BridgeConnection>("checking");
  const [deviceOn, setDeviceOn] = useState<boolean | null>(null);
  const [lastKnown, setLastKnown] = useState<LastKnown | null>(null);
  const [cooldownRemainingMs, setCooldownRemainingMs] = useState(0);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cooldownTickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const loadedStorageRef = useRef<boolean | null>(null);

  if (loadedStorageRef.current == null) {
    loadedStorageRef.current = true;
    const stored = loadLastKnown();
    if (stored) setLastKnown(stored);
  }

  const startCooldownCountdown = useCallback((ms: number) => {
    if (cooldownTickRef.current) clearInterval(cooldownTickRef.current);
    setCooldownRemainingMs(ms);
    if (ms <= 0) return;
    const startedAt = Date.now();
    cooldownTickRef.current = setInterval(() => {
      const remaining = Math.max(0, ms - (Date.now() - startedAt));
      setCooldownRemainingMs(remaining);
      if (remaining <= 0 && cooldownTickRef.current) {
        clearInterval(cooldownTickRef.current);
        cooldownTickRef.current = null;
      }
    }, 250);
  }, []);

  const poll = useCallback(async () => {
    if (!BRIDGE_URL) {
      setConnection("offline");
      return;
    }
    try {
      const res = await fetchWithTimeout(`${BRIDGE_URL}/status`);
      const data = (await res.json()) as StatusResponse;
      if (!res.ok || !data.online) {
        setConnection("offline");
        return;
      }
      setConnection("online");
      setError(null);
      const on = data.power === "on";
      setDeviceOn(on);
      startCooldownCountdown(data.cooldownRemainingMs ?? 0);
      if (data.lastChangedAt) {
        const known = { on, at: new Date(data.lastChangedAt).getTime() };
        setLastKnown(known);
        saveLastKnown(known);
      }
    } catch {
      setConnection("offline");
    }
  }, [startCooldownCountdown]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    function start() {
      if (interval) return;
      interval = setInterval(poll, POLL_INTERVAL_MS);
    }
    function stop() {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    }
    function handleVisibility() {
      if (document.visibilityState === "hidden") {
        stop();
      } else {
        // deferred to a callback (not called directly here) — same reasoning as the
        // initial kick-off below, so an immediate re-check on tab focus doesn't
        // become a synchronous setState-in-effect call.
        setTimeout(poll, 0);
        start();
      }
    }

    // Kick off the first status check as a callback rather than calling poll()
    // directly in the effect body, then start the recurring interval.
    const initialPoll = setTimeout(poll, 0);
    start();
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      clearTimeout(initialPoll);
      stop();
      document.removeEventListener("visibilitychange", handleVisibility);
      if (cooldownTickRef.current) clearInterval(cooldownTickRef.current);
    };
  }, [poll]);

  async function handleToggle() {
    if (!BRIDGE_URL || connection !== "online" || toggling || cooldownRemainingMs > 0) return;

    setToggling(true);
    setError(null);
    const optimistic = !deviceOn;
    setDeviceOn(optimistic); // optimistic — reconciled by the next poll either way

    try {
      const res = await fetchWithTimeout(`${BRIDGE_URL}/toggle`, { method: "POST" });
      const data = (await res.json()) as ToggleResponse;

      if (!res.ok || !data.ok) {
        if (data.error === "rate_limited") {
          startCooldownCountdown(data.retryAfterMs ?? 2_000);
        } else {
          setConnection("offline");
        }
        return;
      }

      const on = data.power === "on";
      setDeviceOn(on);
      const known = { on, at: Date.now() };
      setLastKnown(known);
      saveLastKnown(known);
      startCooldownCountdown(OPTIMISTIC_COOLDOWN_MS);
    } catch {
      setConnection("offline");
    } finally {
      setToggling(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <SectionHeader
        kicker="Live hardware demo"
        title="Matter Integration Interface"
        description="A real Matter-native smart plug on my home network — toggle it yourself, when the bridge is live."
        accent="signal"
      />

      <div className="mt-10 rounded-2xl border border-border bg-surface p-6">
        {connection === "offline" ? (
          <OfflineState lastKnown={lastKnown} />
        ) : (
          <LiveState
            connection={connection}
            deviceOn={deviceOn}
            toggling={toggling}
            cooldownRemainingMs={cooldownRemainingMs}
            onToggle={handleToggle}
          />
        )}
        {error && (
          <p className="mt-4 rounded-lg border border-ember/40 bg-ember/10 px-4 py-2 text-sm text-ember">
            {error}
          </p>
        )}
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-3 text-xs text-muted sm:grid-cols-4">
        <div>
          <dt className="text-faint">Device</dt>
          <dd className="mt-0.5 text-foreground">Matter-native smart plug</dd>
        </div>
        <div>
          <dt className="text-faint">Powering</dt>
          <dd className="mt-0.5 text-foreground">A desk lamp</dd>
        </div>
        <div>
          <dt className="text-faint">Protocol</dt>
          <dd className="mt-0.5 text-foreground">Matter</dd>
        </div>
        <div>
          <dt className="text-faint">Last known state</dt>
          <dd className="mt-0.5 text-foreground">
            {lastKnown ? `${lastKnown.on ? "On" : "Off"} · ${formatTimestamp(lastKnown.at)}` : "—"}
          </dd>
        </div>
      </dl>

      <p className="mt-8 text-xs text-muted">
        This page never talks to a server of mine — it calls the bridge directly from your
        browser, the same way any client-side integration would. See the write-up below for how
        the bridge itself works.
      </p>
    </div>
  );
}

function LiveState({
  connection,
  deviceOn,
  toggling,
  cooldownRemainingMs,
  onToggle,
}: {
  connection: BridgeConnection;
  deviceOn: boolean | null;
  toggling: boolean;
  cooldownRemainingMs: number;
  onToggle: () => void;
}) {
  const checking = connection === "checking" || deviceOn === null;
  const cooling = cooldownRemainingMs > 0;
  const disabled = checking || toggling || cooling;

  return (
    <div>
      <div className="flex items-center gap-2">
        {checking ? (
          <Tag accent="muted">Checking…</Tag>
        ) : deviceOn ? (
          <Tag accent="ok">LIVE · ON</Tag>
        ) : (
          <Tag accent="muted">LIVE · OFF</Tag>
        )}
      </div>

      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-signal px-6 py-3 text-sm font-medium text-onaccent transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {checking
          ? "Checking device…"
          : toggling
            ? "Sending…"
            : deviceOn
              ? "Turn plug OFF"
              : "Turn plug ON"}
      </button>

      {cooling && (
        <div className="mt-4 max-w-xs">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full rounded-full bg-signal transition-all duration-200"
              style={{ width: `${Math.max(0, 100 - (cooldownRemainingMs / 2000) * 100)}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-faint">
            Cooling down — {Math.ceil(cooldownRemainingMs / 1000)}s
          </p>
        </div>
      )}
    </div>
  );
}

function OfflineState({ lastKnown }: { lastKnown: LastKnown | null }) {
  return (
    <div>
      <Tag accent="ember">Bridge offline</Tag>
      <h2 className="mt-4 font-display text-xl font-medium text-foreground">
        The bridge isn&apos;t running right now.
      </h2>
      <p className="mt-2 max-w-xl text-sm text-muted">
        This controls a real device on my home network. The bridge that connects this page to it
        only runs when I turn it on — it&apos;s not a 24/7 exposed service, by design. Check back,
        or reach out and I&apos;ll fire it up for a live demo.
      </p>

      {lastKnown && (
        <div className="mt-5 inline-block rounded-lg border border-border bg-surface-muted px-4 py-2.5 text-sm">
          <span className="text-faint">Last known state: </span>
          <span className="font-medium text-foreground">{lastKnown.on ? "ON" : "OFF"}</span>
          <span className="text-faint">, as of {formatTimestamp(lastKnown.at)}</span>
        </div>
      )}

      <button
        type="button"
        disabled
        className="mt-5 flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium text-muted opacity-60"
      >
        Bridge offline — toggle unavailable
      </button>
    </div>
  );
}

function formatTimestamp(ms: number): string {
  return new Date(ms).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
