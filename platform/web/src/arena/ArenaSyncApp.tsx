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
import { ARENA, PLAYERS, ROBOTS } from './constants';
import { LocalRobotRefProvider } from './LocalRobotRefContext';
import { useArenaRoomId } from './useArenaRoomId';
import { useJoinArena } from './useJoinArena';
import { useDriveLocalRobot } from './useDriveLocalRobot';

const INITIAL_CONTENT = [{}, {}] as const;

function createArenaStore() {
  return createMergeableStore().setTablesSchema({
    [ARENA]: {
      id: { type: 'string', default: '' },
      name: { type: 'string', default: '' },
      width: { type: 'number', default: 800 },
      height: { type: 'number', default: 480 },
      createdAt: { type: 'number', default: 0 },
    },
    [PLAYERS]: {
      handle: { type: 'string', default: '' },
      avatarColor: { type: 'string', default: '' },
      joinedAt: { type: 'number', default: 0 },
      isConnected: { type: 'boolean', default: false },
    },
    [ROBOTS]: {
      handle: { type: 'string', default: '' },
      avatarColor: { type: 'string', default: '' },
      x: { type: 'number', default: 0 },
      y: { type: 'number', default: 0 },
      angle: { type: 'number', default: 0 },
      vx: { type: 'number', default: 0 },
      vy: { type: 'number', default: 0 },
      updatedAt: { type: 'number', default: 0 },
    },
  });
}

type ArenaSyncContextValue = {
  roomId: string;
  createRoom: () => void;
};

const ArenaSyncContext = createContext<ArenaSyncContextValue | null>(null);

export function useArenaSync(): ArenaSyncContextValue {
  const ctx = useContext(ArenaSyncContext);
  if (!ctx) {
    throw new Error('useArenaSync must be used within ArenaSyncApp');
  }
  return ctx;
}

type Props = {
  identity: PlayerIdentity;
  children: ReactNode;
};

function ArenaSyncInner({ identity, children }: Props) {
  const { roomId } = useArenaSync();
  useJoinArena(identity, roomId);
  useDriveLocalRobot(identity.playerId);
  return children;
}

export function ArenaSyncApp({ identity, children }: Props) {
  const [roomId, createRoom] = useArenaRoomId();
  const store = useCreateMergeableStore(createArenaStore, []);
  const checkpoints = useCreateCheckpoints(store, createCheckpoints);
  const persisterKey = `arena-prototype-arena/${roomId || 'local'}`;

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
      <ArenaSyncContext.Provider value={{ roomId, createRoom }}>
        <LocalRobotRefProvider>
          <ArenaSyncInner identity={identity}>{children}</ArenaSyncInner>
        </LocalRobotRefProvider>
      </ArenaSyncContext.Provider>
    </Provider>
  );
}
