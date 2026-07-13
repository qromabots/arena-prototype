import { useCallback, useState } from 'react';
import { getDrawingWsOrigin, isDrawingSyncAvailable } from '@/drawing/drawingSync';
import { useLilyGoSync } from './LilyGoSyncApp';
import { lilyGoShareUrl } from './useLilyGoRoomId';

export function LilyGoSyncBar() {
  const { roomId, createRoom } = useLilyGoSync();
  const [copied, setCopied] = useState(false);
  const wsOrigin = getDrawingWsOrigin();
  const syncAvailable = isDrawingSyncAvailable();

  const handleCopy = useCallback(async () => {
    if (!roomId) return;
    await navigator.clipboard.writeText(lilyGoShareUrl(roomId));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, [roomId]);

  return (
    <div className="lilygo-sync" aria-label="Board text sync">
      {roomId ? (
        <>
          <span className="lilygo-sync-status">Syncing room {roomId}</span>
          <span className="lilygo-sync-hint muted">
            Open the share link in another browser — anyone can edit the display text.
            Connect the board on one host tab; that host pushes text over WebSerial.
          </span>
          <button type="button" className="lilygo-sync-button" onClick={handleCopy}>
            {copied ? 'Copied!' : 'Copy share link'}
          </button>
          <a
            className="lilygo-sync-button"
            href={lilyGoShareUrl(roomId)}
            target="_blank"
            rel="noreferrer"
          >
            Open in new window
          </a>
        </>
      ) : (
        <>
          <span className="lilygo-sync-status">Local only — text stays on this device</span>
          {syncAvailable ? (
            <button type="button" className="lilygo-sync-button primary" onClick={createRoom}>
              Start sharing
            </button>
          ) : (
            <span className="lilygo-sync-hint muted">
              Deploy the Cloudflare Worker (platform/edge) and set VITE_DRAWING_WS_ORIGIN
            </span>
          )}
        </>
      )}
      {import.meta.env.DEV ? (
        <span className="lilygo-sync-hint muted">via {wsOrigin}</span>
      ) : null}
    </div>
  );
}
