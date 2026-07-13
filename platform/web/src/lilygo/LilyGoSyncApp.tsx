import { createContext, useContext, type ReactNode } from 'react';
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
import { BOARD, BOARD_ROW, DEFAULT_BOARD_TEXT } from './constants';
import { useLilyGoRoomId } from './useLilyGoRoomId';

const INITIAL_CONTENT = [
  {
    [BOARD]: {
      [BOARD_ROW]: {
        text: DEFAULT_BOARD_TEXT,
        hostConnected: false,
        boardId: '',
        lastAck: '',
        updatedAt: 0,
      },
    },
  },
  {},
] as const;

function createLilyGoStore() {
  return createMergeableStore().setTablesSchema({
    [BOARD]: {
      text: { type: 'string', default: DEFAULT_BOARD_TEXT },
      hostConnected: { type: 'boolean', default: false },
      boardId: { type: 'string', default: '' },
      lastAck: { type: 'string', default: '' },
      updatedAt: { type: 'number', default: 0 },
    },
  });
}

type LilyGoSyncContextValue = {
  roomId: string;
  createRoom: () => void;
};

const LilyGoSyncContext = createContext<LilyGoSyncContextValue | null>(null);

export function useLilyGoSync(): LilyGoSyncContextValue {
  const ctx = useContext(LilyGoSyncContext);
  if (!ctx) {
    throw new Error('useLilyGoSync must be used within LilyGoSyncApp');
  }
  return ctx;
}

type Props = {
  children: ReactNode;
};

export function LilyGoSyncApp({ children }: Props) {
  const [roomId, createRoom] = useLilyGoRoomId();
  const store = useCreateMergeableStore(createLilyGoStore, []);
  const checkpoints = useCreateCheckpoints(store, createCheckpoints);
  const persisterKey = `arena-prototype-lilygo/${roomId || 'local'}`;

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
      <LilyGoSyncContext.Provider value={{ roomId, createRoom }}>
        {children}
      </LilyGoSyncContext.Provider>
    </Provider>
  );
}
