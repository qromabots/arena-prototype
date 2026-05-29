# arena-prototype

**Robot arena in the browser:** a host operates a robot arena from their web client and shares a URL so guests can join from their own browsers. Persistent per-browser identity: an Ed25519 signing keypair + a **handle** you choose once at startup (reused in every arena). No passwords — the invite code in the share URL gates entry.

**Stack:** Vite, TanStack Router, React 19, TinyBase, Zod, TypeScript (strict, branded types).

**Architecture:** no REST API and no app-level transport code — every arena is a *single shared TinyBase store* (`arena`, `players`, `messages`, `intents` tables) reconciled by the active synchronizer. Each arena pins **one** transport in its share URL: Cloudflare Durable Objects (`?t=do`) or Trystero P2P (`?t=p2p`) — never both.

**Principles:**

- **Fail brittle** — missing or invalid input stops with a clear error + remediation actions, never a silent default.
- **No backwards compatibility** while prototyping — schemas and stores can be wiped and restarted at will.
- **Latest stable libraries** — track current stable releases.

**Deploy:** static SPA to **GitHub Pages** (from milestone M1 onward). A Cloudflare Worker is needed only for the `do` transport; Trystero arenas need no backend.

See [the infrastructure plan](./plan-archives/INITIAL-PLAN.md) for full detail.
https://qromabots.github.io/arena-prototype/drawing?room=Uzl08SzgKlTI6l9X
