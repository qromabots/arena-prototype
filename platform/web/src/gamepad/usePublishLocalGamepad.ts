import { useEffect } from 'react';
import { useStore } from 'tinybase/ui-react';
import type { Handle, PlayerId } from '@arena-prototype/shared-types';
import { readGamepad } from '@/hooks/useGamepad';
import { CONTROLLERS } from './constants';
import {
  controllerRowFromSnapshot,
  disconnectedControllerRow,
} from './gamepadRows';

export function usePublishLocalGamepad(
  playerId: PlayerId,
  handle: Handle,
  roomId: string,
) {
  const store = useStore();

  useEffect(() => {
    if (!store || !roomId) return;

    let frame = 0;

    const tick = () => {
      const gamepad = readGamepad(0);
      store.setRow(
        CONTROLLERS,
        playerId,
        gamepad
          ? controllerRowFromSnapshot(handle, gamepad)
          : disconnectedControllerRow(handle),
      );
      frame = requestAnimationFrame(tick);
    };

    store.setRow(CONTROLLERS, playerId, disconnectedControllerRow(handle));
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      if (store.hasRow(CONTROLLERS, playerId)) {
        store.delRow(CONTROLLERS, playerId);
      }
    };
  }, [store, playerId, handle, roomId]);
}
