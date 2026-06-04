# Drawing sync Worker (Cloudflare Durable Object)

TinyBase `WsServerDurableObject` — one room per URL path, e.g. `wss://…workers.dev/<room-id>`.

**Worker name:** `arena-drawing-sync` (Free plan requires `new_sqlite_classes` in `wrangler.jsonc`).

## Fix deploy error 10097

This error means Cloudflare Free requires SQLite-backed Durable Objects. It often appears when an older Worker script exists without a valid SQLite migration.

**Option A — GitHub Actions (easiest)**

1. **Actions → Deploy drawing sync Worker → Run workflow**
2. Check **Delete existing Worker first** (`reset_worker`)
3. Run

**Option B — From your machine**

```bash
npx wrangler login
npm run reset -w @arena-prototype/edge
```

That deletes `arena-drawing-sync` (and you can manually delete the old `arena-prototype-drawing-sync` in the Cloudflare dashboard if it exists), then deploys fresh.

## Deploy (normal)

```bash
npm run deploy:edge
```

Wrangler prints:

```text
https://arena-drawing-sync.<subdomain>.workers.dev
```

Set the web app variable to the WebSocket form:

```text
wss://arena-drawing-sync.<subdomain>.workers.dev/
```

## GitHub secrets

| Type | Name |
|------|------|
| Secret | `CLOUDFLARE_API_TOKEN` |
| Secret | `CLOUDFLARE_ACCOUNT_ID` |
| Variable | `VITE_DRAWING_WS_ORIGIN` |

After deploy, re-run **Deploy to GitHub Pages**.

## Local dev

```bash
npm run dev    # Vite + wrangler dev on port 8043
```

## Usage API

`GET /usage` returns estimated Durable Object consumption for the Free-tier dashboard in the web app (`/usage`). Room DOs batch metrics into a global `UsageDurableObject` every 10 seconds.

After pulling the `v2` SQLite migration (`UsageDurableObject`), run a normal deploy or `npm run reset -w @arena-prototype/edge` if Cloudflare rejects the new class.
