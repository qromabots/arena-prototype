import { useEffect, useRef } from 'react';
import { useStore } from 'tinybase/ui-react';
import type { PlayerId } from '@arena-prototype/shared-types';
import {
  GAMEPAD_AXIS_EPSILON,
  SYNC_PUBLISH_INTERVAL_MS,
} from '@arena-prototype/shared-types';
import { readGamepad } from '@/hooks/useGamepad';
import {
  axesChanged,
  buttonsChanged,
  pickChangedFields,
} from '@/sync/throttledPublish';
import { CONTROLLERS } from './constants';
import {
  controllerRowFromSnapshot,
  disconnectedControllerRow,
  type ControllerRow,
} from './gamepadRows';

export function usePublishLocalGamepad(
  playerId: PlayerId,
  handle: string,
  enabled = true,
) {
  const store = useStore();
  const lastPublishedRef = useRef<Partial<ControllerRow>>({});

  useEffect(() => {
    if (!store || !enabled) return;

    const publish = () => {
      const gamepad = readGamepad(0);
      const next = gamepad
        ? controllerRowFromSnapshot(handle, gamepad)
        : disconnectedControllerRow(handle);

      const prev = lastPublishedRef.current;
      const partial = pickChangedFields(
        prev,
        next,
        ['handle', 'connected', 'padId', 'updatedAt'],
      ) ?? {};

      if (
        next.connected &&
        axesChanged(String(prev.axes ?? '[]'), gamepad?.axes ?? [], GAMEPAD_AXIS_EPSILON)
      ) {
        partial.axes = next.axes;
      }

      if (
        next.connected &&
        gamepad &&
        buttonsChanged(String(prev.buttons ?? '[]'), gamepad.buttons)
      ) {
        partial.buttons = next.buttons;
      }

      if (!next.connected && prev.connected !== false) {
        partial.axes = next.axes;
        partial.buttons = next.buttons;
      }

      if (Object.keys(partial).length === 0) return;

      if (!store.hasRow(CONTROLLERS, playerId)) {
        store.setRow(CONTROLLERS, playerId, next);
      } else {
        store.setPartialRow(CONTROLLERS, playerId, partial);
      }
      lastPublishedRef.current = { ...prev, ...partial };
    };

    store.setRow(CONTROLLERS, playerId, disconnectedControllerRow(handle));
    lastPublishedRef.current = disconnectedControllerRow(handle);

    publish();
    const interval = window.setInterval(publish, SYNC_PUBLISH_INTERVAL_MS);

    return () => {
      window.clearInterval(interval);
      if (store.hasRow(CONTROLLERS, playerId)) {
        store.delRow(CONTROLLERS, playerId);
      }
    };
  }, [store, playerId, handle, enabled]);
}
