import { config } from "./config.js";
import { connectToPlug } from "./matterController.js";
import { buildServer } from "./httpApi.js";

async function main() {
  console.log("Connecting to the plug...");
  await connectToPlug();
  console.log("Connected.");

  const app = await buildServer();
  await app.listen({ port: config.port, host: "0.0.0.0" });
  console.log(`Bridge listening on http://localhost:${config.port}`);
  console.log("Run `npm run tunnel` (or `npm run demo` for both) to make it publicly reachable.");
}

main().catch((err) => {
  console.error("Failed to start bridge:", err);
  process.exit(1);
});
