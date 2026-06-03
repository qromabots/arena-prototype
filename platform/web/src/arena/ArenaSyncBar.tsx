import { useCallback, useState } from 'react';
import { useRowIds } from 'tinybase/ui-react';
import { getDrawingWsOrigin, isDrawingSyncAvailable } from '@/drawing/drawingSync';
import { PLAYERS } from './constants';
import { useArenaSync } from './ArenaSyncApp';
import { arenaShareUrl } from './useArenaRoomId';

export function ArenaSyncBar() {
  const { roomId, createRoom } = useArenaSync();
  const playerIds = useRowIds(PLAYERS) ?? [];
  const [copied, setCopied] = useState(false);
  const wsOrigin = getDrawingWsOrigin();
  const syncAvailable = isDrawingSyncAvailable();

  const handleCopy = useCallback(async () => {
    if (!roomId) return;
    await navigator.clipboard.writeText(arenaShareUrl(roomId));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, [roomId]);

  return (
    <div className="gamepad-sync arena-sync" aria-label="Arena sync">
      {roomId ? (
        <>
          <span className="gamepad-sync-status">
            Arena {roomId.slice(0, 8)}… · {playerIds.length} robot
            {playerIds.length === 1 ? '' : 's'}
          </span>
          <span className="gamepad-sync-hint muted">
            Share the link — each person gets a robot controlled by their gamepad (or
            keyboard).
          </span>
          <button type="button" className="gamepad-sync-button" onClick={handleCopy}>
            {copied ? 'Copied!' : 'Copy share link'}
          </button>
          <a
            className="gamepad-sync-button"
            href={arenaShareUrl(roomId)}
            target="_blank"
            rel="noreferrer"
          >
            Open in new window
          </a>
        </>
      ) : (
        <>
          <span className="gamepad-sync-status">Local arena — your robot only</span>
          {syncAvailable ? (
            <button type="button" className="gamepad-sync-button primary" onClick={createRoom}>
              Create arena
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
