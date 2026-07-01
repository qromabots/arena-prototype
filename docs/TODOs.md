# Future chunks of work

Derived from the trajectory so far: identity → drawing sync → gamepad sync, all over
the Cloudflare Durable Object transport. The through-line is **prove real-time
multiplayer sync with concrete demos, then converge on the robot arena.** Each chunk is
meant to be independently demoable, in the spirit of the milestones in
`plan-archives/INITIAL-PLAN.md`.

## TODO Next
- [ ] **Update board text from a browser over WebSerial.** The LilyGo hello sketches
  (S3 LCD + T5 e-ink) render a hardcoded string once in `setup()` and never read input —
  today the only way to change the message is to re-flash. Build the live round-trip:
  - **Firmware:** add a serial reader in `loop()` that accumulates bytes until `\n`, then
    re-renders the display with the received text. Start with the **T-Display S3** (fast
    LCD redraw, native USB CDC so `Serial` is the USB port); then port the same protocol
    to the **T5 e-ink** (full/partial refresh, ~1–2s, watch the flashing).
  - **Browser:** a minimal standalone page — `navigator.serial.requestPort()` → open at
    115200 → textbox + Send that writes `text + "\n"`.
  - Test the browser→board round-trip standalone before folding into the arena app.
  This is step 2 of the "LilyGo dev boards over WebSerial" thread below.

- [ ] **Sized arena with persistent smoke trails + reset.** One chunk:
  - On arena setup, force the host to set the arena dimensions before proceeding — no
    defaulting past it. Software validates the input (positive numbers, sane min/max,
    required) and blocks setup until it's valid. Dimensions define the shared
    canvas/world bounds for the sim.
  - While a virtual robot moves, it lays down a persistent smoke trail (no fading),
    colored per bot, so paths accumulate across the arena.
  - The arena owner gets a reset button to clear the trails — all at once, or per user.
  Reuses the canvas renderer; pairs with "drive a bot from a synced gamepad."


## Near term

- [ ] **Drive a bot from a synced gamepad.** Map each participant's synced
  `controllers` row (axes/buttons) onto a moving sprite in a shared 2D arena canvas.
  This is the bridge from "we sync controller state" to "controllers move a thing."
  Reuses the drawing canvas renderer + the gamepad store. Demo: two browsers, two bots,
  each driven by its own pad.
- [ ] **Virtual on-screen controller.** Touch joystick + buttons for phones / browsers
  with no physical gamepad, publishing into the same `controllers` table. Lets guests
  join and play from a phone — big for reach. Pairs with "host without a gamepad."
- [ ] **Input rate + latency pass.** Publishing full JSON snapshots every animation
  frame is heavy. Add dead-zones, throttle/coalesce, delta or binary encoding, and a
  visible round-trip latency readout. Control feel is the whole game here.

## Formalize the "arena" the plan describes

- [ ] **Unify rooms into one arena store.** Today drawing-room and gamepad-room are
  separate ad-hoc room IDs sharing `getDrawingWsUrl`. Extract a generic
  `createSyncedRoom` / the `ArenaStore` interface from the plan, with `arena` +
  `players` + `controllers` tables in one shared store per arena. Pay down the
  drawing/gamepad duplication before adding more demos.
- [ ] **Invite-code gate + share URL.** Bring the plan's `?invite=...&t=do` URL shape
  into the live demo and enforce the invite in the DO `fetch` (reject un-invited
  sockets). Fail brittle on missing/invalid invite → error screen.
- [ ] **Presence, heartbeat, disconnect.** `updatedAt` exists but nothing reaps stale
  rows. Add heartbeat + TTL/host-driven pruning, connected/ready indicators, and a
  "player dropped" / reconnect state. Surfaces the M3/M6 roster + connection UX.
- [ ] **Roles: host / player / spectator.** Make host authority explicit (owns the
  `arena` row, assigns gamepads to bot slots). "Host without a gamepad" already hints
  at the operator/spectator split — formalize it.

## Toward an actual game

- [ ] **Shared arena simulation.** Collisions, walls, and a scoreboard once bots move.
  Decide the authority model: host-authoritative sim vs each client authoritative over
  its own bot. Document the trade-off (matches the plan's "good-citizen ownership").
- [ ] **Match lifecycle.** Lobby → ready-up → countdown → live → results, driven by
  `arena.status`. Gives the demos a beginning and end.
- [ ] **Intents & messages tables.** Add the plan's `intents` (player→arena) and
  `messages` (player↔player) tables so guest actions and bot commands have a home
  distinct from raw input streaming.

## The qromabots payoff

- [ ] **Bind a real robot.** Host associates a physical robot with the arena via
  WebSerial / WebBluetooth / WebHID, and translates synced input/intents into real
  motor commands. This is the "robot" in robot arena (plan open question).
- [ ] **Robot telemetry / camera feed.** WebRTC video of the physical arena so remote
  guests see what their bot is doing. Closes the control loop for off-site players.

## Separate thread — LilyGo dev boards over WebSerial

A parallel hardware track, independent of the arena sync work. Goal: physical boards
that display text pushed from the browser, as a stepping stone toward bound robots.

- [ ] **Flash a LilyGo board to print text.** Bring up one of the LilyGo dev boards
  (e.g. T-Display) with custom firmware that renders text to its screen. Establish the
  toolchain (PlatformIO / Arduino-ESP32), pin/display config, and a minimal "hello"
  render. Demo: text hardcoded in firmware shows on the board.
- [ ] **Update board text from a webpage over WebSerial.** Add a serial protocol
  (newline-delimited or framed) the firmware reads, and a browser page that connects via
  `navigator.serial`, sends typed text, and the board re-renders it live. Demo: type in
  the browser → board updates.
- [ ] **Fold into the arena.** Once both work, drive the board's text from synced arena
  state (player names, scores, status) so the physical display reflects the live game —
  the bridge from this thread back into the qromabots arena.

## Infrastructure / optional

- [ ] **Trystero P2P transport.** Second transport behind the same `ArenaStore`
  interface — zero backend, lower control latency. Validates the abstraction (plan M5
  in reverse: DO already exists, p2p is the parity target now).
- [ ] **Deploy + env hygiene.** GH Pages base path, `VITE_SYNC_WS_ORIGIN` wiring, and a
  smoke test that the deployed Pages build talks to the deployed Worker.
