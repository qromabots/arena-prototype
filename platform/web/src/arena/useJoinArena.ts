import { useEffect } from 'react';
import { useStore } from 'tinybase/ui-react';
import type { PlayerIdentity } from '@arena-prototype/shared-types';
import { ARENA, ARENA_ROW, PLAYERS, ROBOTS } from './constants';
import {
  defaultArenaRow,
  playerRowFromIdentity,
  robotRowFromIdentity,
} from './robotRows';

export function useJoinArena(identity: PlayerIdentity, roomId: string) {
  const store = useStore();

  useEffect(() => {
    if (!store) return;

    const playerId = identity.playerId;

    if (roomId && !store.hasRow(ARENA, ARENA_ROW)) {
      store.setRow(ARENA, ARENA_ROW, defaultArenaRow(roomId, identity.handle));
    }

    store.setRow(PLAYERS, playerId, playerRowFromIdentity(identity));

    if (!store.hasRow(ROBOTS, playerId)) {
      store.setRow(ROBOTS, playerId, robotRowFromIdentity(identity));
    }

    const heartbeat = window.setInterval(() => {
      if (store.hasRow(PLAYERS, playerId)) {
        store.setPartialRow(PLAYERS, playerId, { isConnected: true });
      }
    }, 5_000);

    return () => {
      window.clearInterval(heartbeat);
      if (store.hasRow(PLAYERS, playerId)) {
        store.setPartialRow(PLAYERS, playerId, { isConnected: false });
      }
    };
  }, [store, identity, roomId]);
}
