import { config } from "./config.js";
import { readPlugState, writePlugState } from "./matterController.js";

interface DeviceState {
  power: "on" | "off";
  lastChangedAt: string;
  autoOffAt: string | null;
}

let cached: DeviceState | null = null;
let autoOffTimer: NodeJS.Timeout | null = null;
let lastAcceptedToggleAt = 0;

export function getLastAcceptedToggleAt(): number {
  return lastAcceptedToggleAt;
}

/** Refreshes the cache from the real device. Call this on boot and whenever /status is polled. */
export async function refreshState(): Promise<DeviceState> {
  const on = await readPlugState();
  if (!cached || (cached.power === "on") !== on) {
    cached = {
      power: on ? "on" : "off",
      lastChangedAt: new Date().toISOString(),
      autoOffAt: cached?.autoOffAt ?? null,
    };
  }
  return cached;
}

export function getCachedState(): DeviceState | null {
  return cached;
}

function clearAutoOffTimer() {
  if (autoOffTimer) {
    clearTimeout(autoOffTimer);
    autoOffTimer = null;
  }
}

/** Flips the plug and, if turning on, arms the auto-off timer described in the project plan. */
export async function toggle(): Promise<DeviceState> {
  const current = cached ?? (await refreshState());
  const next = current.power === "on" ? "off" : "on";

  await writePlugState(next === "on");
  clearAutoOffTimer();

  const now = new Date();
  lastAcceptedToggleAt = now.getTime();

  let autoOffAt: string | null = null;
  if (next === "on") {
    autoOffAt = new Date(now.getTime() + config.autoOffMs).toISOString();
    autoOffTimer = setTimeout(async () => {
      try {
        await writePlugState(false);
        cached = { power: "off", lastChangedAt: new Date().toISOString(), autoOffAt: null };
      } catch (err) {
        console.error("Auto-off failed:", err);
      }
    }, config.autoOffMs);
  }

  cached = { power: next, lastChangedAt: now.toISOString(), autoOffAt };
  return cached;
}
