import { useCallback, useState } from 'react';
import { getDrawingWsOrigin, isDrawingSyncAvailable } from '@/drawing/drawingSync';
import { useGamepadSync } from './GamepadSyncApp';
import { gamepadShareUrl } from './useGamepadRoomId';

export function GamepadSyncBar() {
  const { roomId, createRoom } = useGamepadSync();
  const [copied, setCopied] = useState(false);
  const wsOrigin = getDrawingWsOrigin();
  const syncAvailable = isDrawingSyncAvailable();

  const handleCopy = useCallback(async () => {
    if (!roomId) return;
    await navigator.clipboard.writeText(gamepadShareUrl(roomId));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, [roomId]);

  return (
    <div className="gamepad-sync" aria-label="Controller sync">
      {roomId ? (
        <>
          <span className="gamepad-sync-status">Syncing room {roomId}</span>
          <span className="gamepad-sync-hint muted">
            Open the share link in another browser — each participant appears here with
            their controller, or &quot;No controller connected&quot; if none is plugged in
          </span>
          <button type="button" className="gamepad-sync-button" onClick={handleCopy}>
            {copied ? 'Copied!' : 'Copy share link'}
          </button>
          <a
            className="gamepad-sync-button"
            href={gamepadShareUrl(roomId)}
            target="_blank"
            rel="noreferrer"
          >
            Open in new window
          </a>
        </>
      ) : (
        <>
          <span className="gamepad-sync-status">Local only — inputs stay on this device</span>
          {syncAvailable ? (
            <button type="button" className="gamepad-sync-button primary" onClick={createRoom}>
              Start sharing
            </button>
          ) : (
            <span className="gamepad-sync-hint muted">
              Deploy the Cloudflare Worker (platform/edge) and set VITE_DRAWING_WS_ORIGIN
            </span>
          )}
        </>
      )}
      {import.meta.env.DEV ? (
        <span className="gamepad-sync-hint muted">via {wsOrigin}</span>
      ) : null}
    </div>
  );
}
