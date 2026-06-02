import { createContext, useContext, type ReactNode } from 'react';
import type { PlayerIdentity } from '@arena-prototype/shared-types';
import {
  createCheckpoints,
  createMergeableStore,
} from 'tinybase';
import { createLocalPersister } from 'tinybase/persisters/persister-browser';
import { createWsSynchronizer } from 'tinybase/synchronizers/synchronizer-ws-client';
import {
  Provider,
  useCreateCheckpoints,
  useCreateMergeableStore,
  useCreatePersister,
  useCreateSynchronizer,
} from 'tinybase/ui-react';
import { getDrawingWsUrl } from '@/drawing/drawingSync';
import { CONTROLLERS } from './constants';
import { useGamepadRoomId } from './useGamepadRoomId';
import { usePublishLocalGamepad } from './usePublishLocalGamepad';

const INITIAL_CONTENT = [{}, {}] as const;

function createGamepadStore() {
  return createMergeableStore().setTablesSchema({
    [CONTROLLERS]: {
      handle: { type: 'string', default: '' },
      connected: { type: 'boolean', default: false },
      padId: { type: 'string', default: '' },
      axes: { type: 'string', default: '[]' },
      buttons: { type: 'string', default: '[]' },
      updatedAt: { type: 'number', default: 0 },
    },
  });
}

type GamepadSyncContextValue = {
  roomId: string;
  createRoom: () => void;
};

const GamepadSyncContext = createContext<GamepadSyncContextValue | null>(null);

export function useGamepadSync(): GamepadSyncContextValue {
  const ctx = useContext(GamepadSyncContext);
  if (!ctx) {
    throw new Error('useGamepadSync must be used within GamepadSyncApp');
  }
  return ctx;
}

type Props = {
  identity: PlayerIdentity;
  children: ReactNode;
};

function GamepadSyncInner({ identity, children }: Props) {
  const { roomId } = useGamepadSync();
  usePublishLocalGamepad(identity.playerId, identity.handle, roomId);
  return children;
}

export function GamepadSyncApp({ identity, children }: Props) {
  const [roomId, createRoom] = useGamepadRoomId();
  const store = useCreateMergeableStore(createGamepadStore, []);
  const checkpoints = useCreateCheckpoints(store, createCheckpoints);
  const persisterKey = `arena-prototype-gamepad/${roomId || 'local'}`;

  useCreatePersister(
    store,
    (s) => createLocalPersister(s, persisterKey),
    [persisterKey],
    async (persister) => {
      await persister.startAutoLoad([...INITIAL_CONTENT]);
      checkpoints?.clear();
      await persister.startAutoSave();
    },
    [checkpoints, persisterKey],
  );

  useCreateSynchronizer(
    store,
    async (s) => {
      if (!roomId) return;
      const synchronizer = await createWsSynchronizer(
        s,
        new WebSocket(getDrawingWsUrl(roomId)),
      );
      await synchronizer.startSync();
      checkpoints?.clear();
      return synchronizer;
    },
    [roomId, checkpoints],
  );

  return (
    <Provider store={store} checkpoints={checkpoints}>
      <GamepadSyncContext.Provider value={{ roomId, createRoom }}>
        <GamepadSyncInner identity={identity}>{children}</GamepadSyncInner>
      </GamepadSyncContext.Provider>
    </Provider>
  );
}
