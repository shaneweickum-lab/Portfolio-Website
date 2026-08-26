import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function requireEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required env var: ${name} (copy .env.example to .env)`);
  }
  return value;
}

export const config = {
  port: Number(process.env.PORT ?? 8787),
  allowedOrigin: requireEnv("ALLOWED_ORIGIN", "http://localhost:3000"),
  plugNodeId: process.env.PLUG_NODE_ID || null,
  autoOffMs: Number(process.env.AUTO_OFF_MS ?? 15_000),
  storagePath: path.resolve(__dirname, "../.matter-storage"),
  envFilePath: path.resolve(__dirname, "../.env"),
};

export const rateLimits = {
  togglePerIpPerMinute: 6,
  toggleGlobalPerMinute: 30,
  statusPerIpPerMinute: 60,
  minMsBetweenAcceptedToggles: 2_000,
};
