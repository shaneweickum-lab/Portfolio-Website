# matter-bridge

The local half of the "Matter Integration Interface" portfolio project.
This is **not** deployed anywhere — it's a small Node.js process you run
on your own network, only when you want the public demo at
`/projects/matter-integration` to be live. It talks Matter directly to a
real smart plug and exposes a tiny HTTP API that the public site polls
and calls through a Cloudflare Tunnel.

It exists as a separate package specifically so its Node-only Matter/mDNS
dependencies never touch the main Next.js app's build.

## Why this has to exist at all

Browsers have no way to speak Matter — it's a local-network protocol
(IPv6/Thread or Wi-Fi + mDNS discovery + certificate-based PASE/CASE
sessions), not something any browser exposes to a web page, the same way
no browser lets a page open a raw UDP socket. Every real Matter
controller (Google/Apple/Amazon Home, Home Assistant, matter.js itself)
runs as a native process or Node.js service. This bridge is that process.

It's opt-in by design, not 24/7, on purpose: a home-network device
shouldn't have a permanently-exposed public control surface just for a
portfolio demo. You start it when you want the demo live; the public page
shows an honest "offline" state the rest of the time.

## One-time setup

```
npm install
npm run commission -- --code=<your plug's setup code>
npm run build
```

`commission` pairs the bridge with your real plug and persists the
resulting Matter fabric/session material to `.matter-storage/` (gitignored,
never commit it — it's effectively a credential store). It prints a node
id at the end; copy that into `.env` (copy `.env.example` first) as
`PLUG_NODE_ID`. You should only ever need to do this once, unless you
factory-reset the plug or wipe `.matter-storage/`.

Then set up the Cloudflare Tunnel (also one-time):

1. Confirm `shaneweickum.dev`'s DNS is on Cloudflare's nameservers (or
   move it there — this doesn't require moving hosting away from Vercel,
   only one new subdomain record gets added).
2. Install `cloudflared`, then:
   ```
   cloudflared tunnel login
   cloudflared tunnel create matter-bridge
   cloudflared tunnel route dns matter-bridge matter.shaneweickum.dev
   ```
3. Copy `cloudflared/config.yml.example` to `cloudflared/config.yml` and
   fill in the tunnel id from step 2.

A **named** tunnel is used deliberately, not `cloudflared tunnel --url`'s
ephemeral quick-tunnel — a named tunnel's hostname never changes, so the
deployed site's `NEXT_PUBLIC_MATTER_BRIDGE_URL` only needs setting once,
ever, in Vercel's project settings.

## Running the demo

```
npm run demo
```

Starts the bridge and the tunnel together; `Ctrl+C` stops both. Individually:
`npm start` (bridge only) / `npm run tunnel` (tunnel only) — useful if
you want to confirm the bridge works locally before exposing it.

## API

- `GET /healthz` — unauthenticated, for local process supervision only.
- `GET /status` → `{ online, power, lastChangedAt, autoOffAt, cooldownRemainingMs }`
- `POST /toggle` → `{ ok, power, autoOffAt }`, `429` if rate-limited, `503`
  if the Matter session to the plug itself is down.

## Safety rails

- 6 toggles/minute per IP, 30/minute globally, plus a 2-second minimum
  gap between any two accepted toggles regardless of source.
- **Auto-off after 15 seconds.** Turning the plug on always arms a timer
  that turns it back off; toggling off manually first just clears it.
  This is in-memory only — a bridge restart doesn't need to "remember"
  anything here, since a restart only happens when you deliberately stop
  the demo.
- CORS is locked to the production site's origin, but **that is not a
  real security boundary** — it only stops browser JS on other origins;
  it does nothing against someone directly `curl`-ing this URL. The rate
  limiter and auto-off timer above are the actual protection, and they
  apply uniformly regardless of what's making the request. There is
  deliberately no shared-secret/API-key scheme either: anything embedded
  in the public site's client-side JS would be trivially readable via
  devtools anyway, so it would add complexity without adding real
  security.

## Honest limitation

Everything in this package was written without access to the real plug,
a real home network, or a real Cloudflare account to test against — there
was no hardware available in the environment that built it. Two things
*were* checked, though, not just assumed:

- `src/matterController.ts` and `src/commission.ts` are written and
  typechecked against the actual `@matter/main` 0.11.5 `.d.ts` files
  installed in `node_modules` (not a blog post or an older tutorial —
  the real controller API in this version turned out to be a `ServerNode`
  with a built-in `ControllerBehavior`, not the `CommissioningController`
  class most still-published examples show, which no longer exists in
  this release).
- The compiled bridge was actually run (`node dist/server.js`, no real
  plug attached): `ServerNode.create()` genuinely boots — it opens real
  local storage, initializes the commissioning/controller/network
  behaviors, and comes up as a real root Matter node — and then correctly
  reports "no commissioned node found" for a fake node id via
  `server.nodes.get()`, exactly matching this code's error handling. So
  the controller runtime itself, storage setup, and the "not yet
  commissioned" path are confirmed working, not just type-checked.

What's still unverified, and worth checking in this order before calling
this "done":

1. **The actual commissioning handshake and device control**, against a
   real plug — `serverNode.nodes.commission()`, the `parts` traversal in
   `findOnOffEndpoint()`, and `endpoint.act(agent => agent.onOff.on())`
   are confirmed to be the right API shape, but have only run against a
   *lack* of hardware, never a real commissioned node. That's the one
   genuinely unproven step, and only real hardware can prove it.
2. **Commissioning path for your specific plug** — some Matter devices
   commission purely over IP if already Wi-Fi-joined; others need an
   initial BLE handoff. If yours needs BLE, the machine running this
   needs a working BLE radio and matter.js's BLE support, which has
   historically been less mature than the IP path.
3. **Whether the plug is already in another Matter ecosystem** (Google/
   Apple/Alexa Home). If so, commissioning fresh won't work — you'd need
   that ecosystem's "share device"/multi-admin flow instead.
4. **Network topology.** Matter's mDNS discovery doesn't cross typical
   VLAN/IoT-isolation/guest-network boundaries — this bridge needs to run
   on the same network segment as the plug.
5. **The tunnel path end-to-end**, checked from a genuinely external
   network (phone on cellular data, not your home Wi-Fi) before trusting
   the public demo.

Don't flip the site's `content/projects/matter-integration.mdx` out of
`draft: true` until you've actually run this against the real plug and
confirmed all of the above.
