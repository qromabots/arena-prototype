import { useCallback } from 'react';
import type { Store } from 'tinybase';
import {
  useLinkedRowIds,
  useLocalRowIds,
  useRemoteRowId,
  useSetCheckpointCallback,
  useStore,
} from 'tinybase/ui-react';
import { CANVAS_ID, SHAPES } from './constants';
import { useSelectedIdState } from './SelectedIdContext';

export function useRequiredStore(): Store {
  const store = useStore();
  if (!store) {
    throw new Error('TinyBase store is not available');
  }
  return store;
}

export const useBackId = () => useLinkedRowIds('order', CANVAS_ID)[1];
export const useFrontId = () => useLinkedRowIds('order', CANVAS_ID).slice(-1)[0];

export function useOrderShape(toId: string, label: string) {
  const store = useRequiredStore();
  const [selectedId] = useSelectedIdState();
  const [previousId] = useLocalRowIds('order', selectedId ?? '');
  const nextId = useRemoteRowId('order', selectedId ?? '');
  const nextNextId = useRemoteRowId('order', toId);
  const setCheckpoint = useSetCheckpointCallback(() => `move ${label}`, []);

  return useCallback(() => {
    if (selectedId == null || previousId == null) return;
    store.transaction(() => {
      if (nextId != null) {
        store.setCell(SHAPES, previousId, 'nextId', nextId);
      } else {
        store.delCell(SHAPES, previousId, 'nextId');
      }
      if (nextNextId != null) {
        store.setCell(SHAPES, selectedId, 'nextId', nextNextId);
      } else {
        store.delCell(SHAPES, selectedId, 'nextId');
      }
      store.setCell(SHAPES, toId, 'nextId', selectedId);
    });
    setCheckpoint();
  }, [selectedId, toId, store, previousId, nextId, nextNextId, setCheckpoint]);
}
