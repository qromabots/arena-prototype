/** WebSocket origin for the TinyBase WsServer (path suffix is the room id). */
export function getDrawingWsOrigin(): string {
  const configured = import.meta.env.VITE_DRAWING_WS_ORIGIN;
  if (configured) {
    return configured.endsWith('/') ? configured : `${configured}/`;
  }

  const port = import.meta.env.VITE_DRAWING_WS_PORT ?? '8043';
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${wsProtocol}//${window.location.hostname}:${port}/`;
}

export function getDrawingWsUrl(roomId: string): string {
  return `${getDrawingWsOrigin()}${encodeURIComponent(roomId)}`;
}

/** True when the page can reach a WsServer (explicit origin or non-HTTPS dev/LAN). */
export function isDrawingSyncAvailable(): boolean {
  if (import.meta.env.VITE_DRAWING_WS_ORIGIN) return true;
  return window.location.protocol !== 'https:';
}
