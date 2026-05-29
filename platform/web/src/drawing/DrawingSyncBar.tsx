import { useCallback, useState } from 'react';
import { getDrawingWsOrigin, isDrawingSyncAvailable } from './drawingSync';
import { drawingShareUrl } from './useDrawingRoomId';

type Props = {
  roomId: string;
  onStartSharing: () => void;
};

export function DrawingSyncBar({ roomId, onStartSharing }: Props) {
  const [copied, setCopied] = useState(false);
  const wsOrigin = getDrawingWsOrigin();
  const syncAvailable = isDrawingSyncAvailable();

  const handleCopy = useCallback(async () => {
    if (!roomId) return;
    await navigator.clipboard.writeText(drawingShareUrl(roomId));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, [roomId]);

  return (
    <div id="drawing-sync">
      {roomId ? (
        <>
          <span className="drawing-sync-status">Syncing room {roomId}</span>
          <span className="drawing-sync-hint muted">
            Open the share link on another device (same network for local dev)
          </span>
          <button type="button" className="drawing-sync-button" onClick={handleCopy}>
            {copied ? 'Copied!' : 'Copy share link'}
          </button>
          <a
            className="drawing-sync-button"
            href={drawingShareUrl(roomId)}
            target="_blank"
            rel="noreferrer"
          >
            Open in new window
          </a>
        </>
      ) : (
        <>
          <span className="drawing-sync-status">Local only — changes stay on this device</span>
          {syncAvailable ? (
            <button type="button" className="drawing-sync-button primary" onClick={onStartSharing}>
              Start sharing
            </button>
          ) : (
            <span className="drawing-sync-hint muted">
              Deploy the Cloudflare Worker (platform/edge) and set VITE_DRAWING_WS_ORIGIN
            </span>
          )}
        </>
      )}
      {import.meta.env.DEV ? (
        <span className="drawing-sync-hint muted">via {wsOrigin}</span>
      ) : null}
    </div>
  );
}
