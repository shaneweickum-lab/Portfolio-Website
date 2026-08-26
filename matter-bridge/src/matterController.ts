/**
 * Thin wrapper around matter.js's controller API, isolated to this one file
 * on purpose. Verified against the actually-installed `@matter/main` 0.11.5
 * type definitions (not just docs/blog posts, which describe an older,
 * pre-0.10 API shape that no longer matches what's on disk here):
 *
 * - A pure controller is a `ServerNode` whose root endpoint carries the
 *   built-in `ControllerBehavior` — there is no separate "CommissioningController"
 *   class in this version, unlike most still-published tutorials.
 * - `serverNode.nodes` (a `ClientNodes` collection) is where you commission
 *   new devices and look up already-commissioned ones.
 * - A commissioned device is a `ClientNode`, itself a tree of `Endpoint`s —
 *   the plug's actual OnOff cluster lives on a *child* endpoint (a "part"),
 *   not the node's root endpoint, so it has to be located by walking `.parts`.
 * - Reading a cluster attribute is synchronous local state (`endpoint.state.onOff.onOff`);
 *   invoking a command needs `endpoint.act(agent => agent.onOff.on())`.
 *
 * This compiles clean against the installed package, but has NOT been run
 * against a real plug or network — there was no hardware available to test
 * against in the environment that wrote it. See README.md's "Honest
 * limitation" section before assuming any of this just works.
 */
import { Environment, type Endpoint, ServerNode } from "@matter/main";
import { config } from "./config.js";

let controllerNode: ServerNode | null = null;
let plugEndpoint: Endpoint | null = null;

function requireNodeId(): string {
  if (!config.plugNodeId) {
    throw new Error(
      "PLUG_NODE_ID is not set — run `npm run commission` once before starting the bridge normally.",
    );
  }
  return config.plugNodeId;
}

async function getControllerNode(): Promise<ServerNode> {
  if (controllerNode) return controllerNode;

  const environment = Environment.default;
  environment.vars.set("storage.path", config.storagePath);

  controllerNode = await ServerNode.create({
    id: "matter-bridge-controller",
    environment,
  });
  return controllerNode;
}

/** Walks a commissioned node's endpoint tree to find the part exposing OnOff.
 *  A simple single-outlet plug has exactly one such part; this takes the first
 *  match, which is the common case but not exhaustively validated against
 *  every possible plug's endpoint layout. */
function findOnOffEndpoint(node: Endpoint): Endpoint {
  for (const part of node.parts) {
    if ("onOff" in part.state) return part;
  }
  throw new Error(
    "No endpoint exposing the OnOff cluster was found on this node — is PLUG_NODE_ID really a simple on/off plug?",
  );
}

/** Connects to the already-commissioned plug. Never re-commissions. */
export async function connectToPlug(): Promise<void> {
  const nodeId = requireNodeId();
  const server = await getControllerNode();
  const node = server.nodes.get(nodeId);
  if (!node) {
    throw new Error(
      `No commissioned node found for PLUG_NODE_ID=${nodeId}. Run \`npm run commission\` again if the plug was reset.`,
    );
  }
  plugEndpoint = findOnOffEndpoint(node);
}

export async function disconnectFromPlug(): Promise<void> {
  await controllerNode?.close();
  controllerNode = null;
  plugEndpoint = null;
}

function requireEndpoint(): Endpoint {
  if (!plugEndpoint) {
    throw new Error("Not connected — call connectToPlug() first.");
  }
  return plugEndpoint;
}

/**
 * The OnOff endpoint is located dynamically at runtime (findOnOffEndpoint above) —
 * its exact EndpointType isn't known statically, so TypeScript can't type-check the
 * `onOff` behavior on it the way it can for a compile-time-constructed endpoint.
 * These two functions are the one deliberate `any` boundary in this file for that reason.
 */

/** Reads the plug's real current on/off state directly from local synced state. */
export async function readPlugState(): Promise<boolean> {
  const endpoint = requireEndpoint() as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  return Boolean(endpoint.state.onOff.onOff);
}

/** Writes on/off directly via explicit commands (not the cluster's own toggle()),
 *  so the bridge's own state cache and auto-off timer stay authoritative. */
export async function writePlugState(on: boolean): Promise<void> {
  const endpoint = requireEndpoint() as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  await endpoint.act((agent: any) => (on ? agent.onOff.on() : agent.onOff.off())); // eslint-disable-line @typescript-eslint/no-explicit-any
}

export function isConnected(): boolean {
  return plugEndpoint !== null;
}
