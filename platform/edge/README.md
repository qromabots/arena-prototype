# Drawing sync Worker (Cloudflare Durable Object)

TinyBase `WsServerDurableObject` — one room per URL path, e.g. `wss://…workers.dev/<room-id>`.

## Deploy from your machine

```bash
npx wrangler login          # once
npm run deploy:edge           # from repo root
```

Wrangler prints the live URL, e.g. `https://arena-prototype-drawing-sync.<subdomain>.workers.dev`.

Use the **WebSocket** form for the web app:

```text
wss://arena-prototype-drawing-sync.<subdomain>.workers.dev/
```

## Deploy via GitHub Actions

Repo → **Settings → Secrets and variables → Actions**:

| Type | Name | Value |
|------|------|--------|
| Secret | `CLOUDFLARE_API_TOKEN` | Cloudflare API token (Edit Cloudflare Workers template) |
| Secret | `CLOUDFLARE_ACCOUNT_ID` | Cloudflare dashboard → Workers & Pages → Account ID |
| Variable | `VITE_DRAWING_WS_ORIGIN` | `wss://arena-prototype-drawing-sync.<subdomain>.workers.dev/` |

Then **Actions → Deploy drawing sync Worker → Run workflow**.

After the Worker is live, re-run **Deploy to GitHub Pages** so the drawing page picks up `VITE_DRAWING_WS_ORIGIN`.

## Common failures (exit code 1)

**`CLOUDFLARE_API_TOKEN environment variable`** — Token or Account ID secret missing/wrong in GitHub, or run `wrangler login` locally.

**Durable Object / SQLite / migration errors** — Free Workers plans require `new_sqlite_classes` in `wrangler.toml` (not `new_classes`). This repo uses SQLite-backed DOs.

**Authentication / permission errors** — Recreate the API token with the **Edit Cloudflare Workers** template scoped to your account.

## Local dev

```bash
npm run dev    # Vite + wrangler dev on port 8043
```
