import { useCallback } from 'react';
import type { Store } from 'tinybase';
import {
  useAddRowCallback,
  useLinkedRowIds,
  useLocalRowIds,
  useRedoInformation,
  useRemoteRowId,
  useSetCheckpointCallback,
  useUndoInformation,
} from 'tinybase/ui-react';
import { SHAPES } from './constants';
import { useBackId, useFrontId, useOrderShape, useRequiredStore } from './hooks';
import { useSelectedIdState } from './SelectedIdContext';

function UndoRedo() {
  const [canUndo, handleUndo, , undoLabel] = useUndoInformation();
  const [canRedo, handleRedo, , redoLabel] = useRedoInformation();

  return (
    <>
      <div
        className={`button undo${canUndo ? '' : ' disabled'}`}
        {...(canUndo ? { onClick: handleUndo, title: `Undo ${undoLabel}` } : {})}
      />
      <div
        className={`button redo${canRedo ? '' : ' disabled'}`}
        {...(canRedo ? { onClick: handleRedo, title: `Redo ${redoLabel}` } : {})}
      />
    </>
  );
}

function ShapeAdd() {
  const frontId = useFrontId();
  const [, setSelectedId] = useSelectedIdState();
  const setCheckpoint = useSetCheckpointCallback(() => 'add shape', []);
  const onAddRow = useCallback(
    (rowId: string | undefined, store: Store) => {
      if (frontId == null || rowId == null) return;
      store.setCell(SHAPES, frontId, 'nextId', rowId);
      setSelectedId(rowId);
      setCheckpoint();
    },
    [frontId, setSelectedId, setCheckpoint],
  );
  const handleClick = useAddRowCallback(
    SHAPES,
    () => ({}),
    [],
    undefined,
    onAddRow,
    [onAddRow],
  );
  return (
    <div className="button add" onClick={handleClick}>
      Add shape
    </div>
  );
}

function ShapeOrder() {
  const [selectedId] = useSelectedIdState();
  const frontId = useFrontId();
  const forwardId = useRemoteRowId('order', selectedId ?? '');
  const [previousId] = useLocalRowIds('order', selectedId ?? '');
  const [backwardId] = useLocalRowIds('order', previousId ?? '');
  const backId = useBackId();

  const buttons: [string, string, string | undefined, () => void][] = [
    ['front', 'To front', frontId, useOrderShape(frontId ?? '', 'to front')],
    ['forward', 'Forward', frontId, useOrderShape(forwardId ?? '', 'forward')],
    ['backward', 'Backward', backId, useOrderShape(backwardId ?? '', 'backward')],
    ['back', 'To back', backId, useOrderShape('0', 'to back')],
  ];

  return (
    <>
      {buttons.map(([className, label, disabledIfId, handleClick]) => {
        const disabled =
          selectedId == null || selectedId === disabledIfId;
        return (
          <div
            key={className}
            className={`button ${className}${disabled ? ' disabled' : ''}`}
            onClick={disabled ? undefined : handleClick}
          >
            {label}
          </div>
        );
      })}
    </>
  );
}

function ShapeDelete() {
  const store = useRequiredStore();
  const [selectedId, setSelectedId] = useSelectedIdState();
  const [previousId] = useLocalRowIds('order', selectedId ?? '');
  const nextId = useRemoteRowId('order', selectedId ?? '');
  const setCheckpoint = useSetCheckpointCallback(() => 'delete', []);
  const handleClick = useCallback(() => {
    if (selectedId == null || previousId == null) return;
    store.transaction(() => {
      if (nextId == null) {
        store.delCell(SHAPES, previousId, 'nextId');
      } else {
        store.setCell(SHAPES, previousId, 'nextId', nextId);
      }
      store.delRow(SHAPES, selectedId);
    });
    setCheckpoint();
    setSelectedId(null);
  }, [store, selectedId, setSelectedId, previousId, nextId, setCheckpoint]);

  return (
    <div className="button delete" onClick={handleClick}>
      Delete
    </div>
  );
}

export function DrawingToolbar() {
  const [selectedId] = useSelectedIdState();
  return (
    <div id="toolbar">
      <UndoRedo />
      <ShapeAdd />
      {selectedId == null ? null : (
        <>
          <ShapeOrder />
          <ShapeDelete />
        </>
      )}
    </div>
  );
}
