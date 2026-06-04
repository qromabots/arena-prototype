/** WebSocket origin for the TinyBase sync endpoint (room id is the URL path). */
export function getDrawingWsOrigin(): string {
  const configured = import.meta.env.VITE_DRAWING_WS_ORIGIN;
  if (configured) {
    return configured.endsWith('/') ? configured : `${configured}/`;
  }

  // Local `wrangler dev` for the DrawingRoom Durable Object (platform/edge).
  const port = import.meta.env.VITE_DRAWING_WS_PORT ?? '8043';
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${wsProtocol}//${window.location.hostname}:${port}/`;
}

export function getDrawingWsUrl(roomId: string): string {
  return `${getDrawingWsOrigin()}${encodeURIComponent(roomId)}`;
}

export function getSyncHttpOrigin(): string {
  const wsOrigin = getDrawingWsOrigin().replace(/\/$/, '');
  return wsOrigin.replace(/^wss:/i, 'https:').replace(/^ws:/i, 'http:');
}

export function getDoUsageUrl(): string {
  return `${getSyncHttpOrigin()}/usage`;
}

/** True when sync can run (Cloudflare Worker URL set, or local wrangler dev over HTTP). */
export function isDrawingSyncAvailable(): boolean {
  if (import.meta.env.VITE_DRAWING_WS_ORIGIN) return true;
  return window.location.protocol !== 'https:';
}
