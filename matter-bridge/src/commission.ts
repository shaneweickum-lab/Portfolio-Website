/**
 * One-time setup. Run manually, once, near the plug:
 *
 *   npm run commission -- --code=<the plug's 11-digit setup passcode>
 *
 * Pairs this bridge with the real device and persists the resulting Matter
 * fabric/session material under .matter-storage/. Prints the assigned node id,
 * which you then paste into .env as PLUG_NODE_ID. Never re-run this for normal
 * startups — matterController.ts only ever reconnects to the node id you set here.
 *
 * `serverNode.nodes.commission(passcode)` defaults to on-network (IP/mDNS)
 * discovery. If your plug needs BLE commissioning instead (see README's
 * "Honest limitation" section), this call needs a discovery-options object
 * instead of a bare passcode — check @matter/main's CommissioningDiscovery
 * type for the exact shape when you get there, since that's specific to your
 * hardware and wasn't guessable without it.
 */
import { Environment, ServerNode } from "@matter/main";
import { config } from "./config.js";

function parsePasscode(): number {
  const arg = process.argv.find((a) => a.startsWith("--code="));
  if (!arg) {
    console.error("Usage: npm run commission -- --code=<setup passcode>");
    process.exit(1);
  }
  const passcode = Number(arg.slice("--code=".length));
  if (!Number.isFinite(passcode)) {
    console.error("--code must be numeric (the plug's setup passcode, not a QR URL).");
    process.exit(1);
  }
  return passcode;
}

async function main() {
  const passcode = parsePasscode();

  const environment = Environment.default;
  environment.vars.set("storage.path", config.storagePath);

  const server = await ServerNode.create({
    id: "matter-bridge-controller",
    environment,
  });

  console.log("Commissioning — make sure this machine is on the same network as the plug...");
  const node = await server.nodes.commission(passcode);

  console.log("\nCommissioned successfully.");
  console.log(`Node ID: ${node.id}`);
  console.log(`\nAdd this to matter-bridge/.env:\n  PLUG_NODE_ID=${node.id}\n`);

  await server.close();
}

main().catch((err) => {
  console.error("Commissioning failed:", err);
  process.exit(1);
});
