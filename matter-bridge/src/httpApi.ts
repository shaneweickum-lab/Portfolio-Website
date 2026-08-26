import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { config, rateLimits } from "./config.js";
import { getLastAcceptedToggleAt, refreshState, toggle } from "./state.js";
import { isConnected } from "./matterController.js";

export async function buildServer() {
  const app = Fastify({ logger: true, trustProxy: true });

  await app.register(cors, {
    origin: config.allowedOrigin,
    methods: ["GET", "POST"],
  });

  // Global default; per-route overrides below tighten /toggle further.
  await app.register(rateLimit, {
    max: rateLimits.statusPerIpPerMinute,
    timeWindow: "1 minute",
  });

  app.get("/healthz", async () => ({ ok: true }));

  app.get("/status", async (_req, reply) => {
    if (!isConnected()) {
      reply.code(503);
      return { online: false, error: "device_offline" };
    }
    try {
      const state = await refreshState();
      return {
        online: true,
        power: state.power,
        lastChangedAt: state.lastChangedAt,
        autoOffAt: state.autoOffAt,
        cooldownRemainingMs: cooldownRemainingMs(),
      };
    } catch (err) {
      app.log.error(err, "status read failed");
      reply.code(503);
      return { online: false, error: "device_offline" };
    }
  });

  app.post(
    "/toggle",
    {
      config: {
        rateLimit: {
          max: rateLimits.togglePerIpPerMinute,
          timeWindow: "1 minute",
        },
      },
    },
    async (_req, reply) => {
      if (!isConnected()) {
        reply.code(503);
        return { ok: false, error: "device_offline" };
      }

      const remaining = cooldownRemainingMs();
      if (remaining > 0) {
        reply.code(429);
        return { ok: false, error: "rate_limited", retryAfterMs: remaining };
      }

      try {
        const state = await toggle();
        return { ok: true, power: state.power, autoOffAt: state.autoOffAt };
      } catch (err) {
        app.log.error(err, "toggle failed");
        reply.code(503);
        return { ok: false, error: "device_offline" };
      }
    },
  );

  return app;
}

function cooldownRemainingMs(): number {
  const elapsed = Date.now() - getLastAcceptedToggleAt();
  return Math.max(0, rateLimits.minMsBetweenAcceptedToggles - elapsed);
}
