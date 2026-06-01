import { useEffect } from 'react';
import { useStore } from 'tinybase/ui-react';
import type { Handle, PlayerId } from '@arena-prototype/shared-types';
import { readGamepad } from '@/hooks/useGamepad';
import { CONTROLLERS } from './constants';
import { controllerRowFromSnapshot } from './gamepadRows';

export function usePublishLocalGamepad(playerId: PlayerId, handle: Handle) {
  const store = useStore();

  useEffect(() => {
    if (!store) return;

    let frame = 0;

    const tick = () => {
      const gamepad = readGamepad(0);
      if (gamepad) {
        store.setRow(CONTROLLERS, playerId, controllerRowFromSnapshot(handle, gamepad));
      } else if (store.hasRow(CONTROLLERS, playerId)) {
        store.setPartialRow(CONTROLLERS, playerId, {
          connected: false,
          updatedAt: Date.now(),
        });
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      if (store.hasRow(CONTROLLERS, playerId)) {
        store.delRow(CONTROLLERS, playerId);
      }
    };
  }, [store, playerId, handle]);
}
