import { useCallback, useState } from 'react';
import { drawingShareUrl } from './useDrawingRoomId';

type Props = {
  roomId: string;
  onStartSharing: () => void;
};

export function DrawingSyncBar({ roomId, onStartSharing }: Props) {
  const [copied, setCopied] = useState(false);
  const wsOrigin = import.meta.env.VITE_DRAWING_WS_ORIGIN ?? 'ws://localhost:8043/';

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
          <button type="button" className="drawing-sync-button primary" onClick={onStartSharing}>
            Start sharing
          </button>
        </>
      )}
      {import.meta.env.DEV ? (
        <span className="drawing-sync-hint muted">via {wsOrigin}</span>
      ) : null}
    </div>
  );
}
