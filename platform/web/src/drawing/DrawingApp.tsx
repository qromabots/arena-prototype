import { useState } from 'react';
import {
  createCheckpoints,
  createMergeableStore,
  createRelationships,
} from 'tinybase';
import { createLocalPersister } from 'tinybase/persisters/persister-browser';
import { createWsSynchronizer } from 'tinybase/synchronizers/synchronizer-ws-client';
import {
  Provider,
  useCreateCheckpoints,
  useCreateMergeableStore,
  useCreatePersister,
  useCreateRelationships,
  useCreateSynchronizer,
} from 'tinybase/ui-react';
import { Inspector } from 'tinybase/ui-react-inspector';
import { DrawingCanvas } from './DrawingCanvas';
import { DrawingSidebar } from './DrawingSidebar';
import { DrawingSyncBar } from './DrawingSyncBar';
import { DrawingToolbar } from './DrawingToolbar';
import {
  CANVAS_ID,
  constrainColor,
  constrainType,
  SHAPES,
} from './constants';
import { SelectedIdContext } from './SelectedIdContext';
import { useDrawingRoomId } from './useDrawingRoomId';
import { getDrawingWsUrl } from './drawingSync';
import './drawing.css';

const INITIAL_CONTENT = [
  {
    shapes: {
      [CANVAS_ID]: { x1: 0, y1: 0, nextId: '1', text: '[canvas]' },
      1: {},
    },
  },
  {},
] as const;

function createDrawingStore() {
  const s = createMergeableStore().setTablesSchema({
    [SHAPES]: {
      x1: { type: 'number', default: 100 },
      y1: { type: 'number', default: 100 },
      x2: { type: 'number', default: 300 },
      y2: { type: 'number', default: 200 },
      text: { type: 'string', default: 'text' },
      type: { type: 'string' },
      backColor: { type: 'string', default: '#0077aa' },
      textColor: { type: 'string', default: '#ffffff' },
      nextId: { type: 'string' },
    },
  });
  s.addCellListener(SHAPES, null, 'type', constrainType, true);
  s.addCellListener(SHAPES, null, 'backColor', constrainColor, true);
  s.addCellListener(SHAPES, null, 'textColor', constrainColor, true);
  return s;
}

export function DrawingApp() {
  const [roomId, createRoom] = useDrawingRoomId();
  const store = useCreateMergeableStore(createDrawingStore, []);
  const checkpoints = useCreateCheckpoints(store, createCheckpoints);
  const persisterKey = `arena-prototype-drawing/${roomId || 'local'}`;

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

  const relationships = useCreateRelationships(store, (s) =>
    createRelationships(s).setRelationshipDefinition(
      'order',
      SHAPES,
      SHAPES,
      'nextId',
    ),
  );

  const selectedIdState = useState<string | null>(null);

  return (
    <Provider store={store} relationships={relationships} checkpoints={checkpoints}>
      <SelectedIdContext.Provider value={selectedIdState}>
        <div className="drawing-app">
          <DrawingSyncBar roomId={roomId} onStartSharing={createRoom} />
          <DrawingToolbar />
          <DrawingCanvas />
          <DrawingSidebar />
        </div>
      </SelectedIdContext.Provider>
      <Inspector />
    </Provider>
  );
}
