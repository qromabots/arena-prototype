import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from 'react';
import type { RowProps } from 'tinybase/ui-react';
import {
  LinkedRowsView,
  useRow,
  useRowListener,
  useSetCellCallback,
  useSetCheckpointCallback,
  useSetPartialRowCallback,
} from 'tinybase/ui-react';
import {
  between,
  CANVAS_ID,
  MIN_HEIGHT,
  MIN_WIDTH,
  SHAPES,
} from './constants';
import { useBackId, useRequiredStore } from './hooks';
import { useSelectedIdState } from './SelectedIdContext';
import { useDraggableObject } from './useDraggableObject';

type ShapeRow = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  text: string;
  type: string;
  backColor: string;
  textColor: string;
};

function ShapeText({ id }: { id: string }) {
  const { text, textColor } = useRow(SHAPES, id) as ShapeRow;
  const inputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const setCheckpoint = useSetCheckpointCallback(() => 'edit text', []);
  const handleDoubleClick = useCallback(() => setEditing(true), []);
  const handleBlur = useCallback(() => {
    setEditing(false);
    setCheckpoint();
  }, [setCheckpoint]);
  const handleChange = useSetCellCallback(
    SHAPES,
    id,
    'text',
    (e) => (e as ChangeEvent<HTMLInputElement>).target.value,
    [],
  );
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  }, []);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);

  const style = { color: textColor };

  return editing ? (
    <input
      ref={inputRef}
      style={style}
      value={text}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
    />
  ) : (
    <span style={style} onDoubleClick={handleDoubleClick}>
      {text !== '' ? text : '\xa0'}
    </span>
  );
}

function Grip({
  m: [mx1, my1, mx2, my2],
  id,
  x,
  y,
  d,
}: {
  m: [number, number, number, number];
  id: string;
  x: number;
  y: number;
  d: string;
}) {
  const store = useRequiredStore();
  const getInitial = useCallback(() => store.getRow(SHAPES, id) as ShapeRow, [store, id]);

  const handleDrag = useSetPartialRowCallback(
    SHAPES,
    id,
    ({ dx, dy, initial }: { dx: number; dy: number; initial: ShapeRow }) => ({
      x1: initial.x1 + dx * mx1,
      y1: initial.y1 + dy * my1,
      x2: initial.x2 + dx * mx2,
      y2: initial.y2 + dy * my2,
    }),
    [mx1, my1, mx2, my2],
  );
  const handleDragStop = useSetCheckpointCallback(() => 'resize', []);

  return (
    <div
      ref={useDraggableObject(getInitial, handleDrag, undefined, handleDragStop)}
      className="grip"
      style={{ left: `${x}px`, top: `${y}px`, cursor: `${d}-resize` }}
    />
  );
}

function ShapeGrips({ id }: { id: string }) {
  const { x1, y1, x2, y2 } = useRow(SHAPES, id) as ShapeRow;
  const xm = (x1 + x2) / 2;
  const ym = (y1 + y2) / 2;
  return (
    <>
      <Grip m={[1, 1, 0, 0]} id={id} x={x1} y={y1} d="nwse" />
      <Grip m={[0, 1, 0, 0]} id={id} x={xm} y={y1} d="ns" />
      <Grip m={[0, 1, 1, 0]} id={id} x={x2} y={y1} d="nesw" />
      <Grip m={[0, 0, 1, 0]} id={id} x={x2} y={ym} d="ew" />
      <Grip m={[0, 0, 1, 1]} id={id} x={x2} y={y2} d="nwse" />
      <Grip m={[0, 0, 0, 1]} id={id} x={xm} y={y2} d="ns" />
      <Grip m={[1, 0, 0, 1]} id={id} x={x1} y={y2} d="nesw" />
      <Grip m={[1, 0, 0, 0]} id={id} x={x1} y={ym} d="ew" />
    </>
  );
}

function Shape({ rowId: id }: RowProps) {
  const [selectedId, setSelectedId] = useSelectedIdState();
  const selected = id === selectedId;
  const { x1, y1, x2, y2, backColor, type } = useRow(SHAPES, id) as ShapeRow;

  const store = useRequiredStore();
  const getInitial = useCallback(() => store.getRow(SHAPES, id) as ShapeRow, [store, id]);

  const handleDrag = useSetPartialRowCallback(
    SHAPES,
    id,
    ({ dx, dy, initial }: { dx: number; dy: number; initial: ShapeRow }) => ({
      x1: initial.x1 + dx,
      y1: initial.y1 + dy,
      x2: initial.x2 + dx,
      y2: initial.y2 + dy,
    }),
    [],
  );
  const handleDragStart = useCallback(() => setSelectedId(id), [setSelectedId, id]);
  const handleDragStop = useSetCheckpointCallback(() => 'drag', []);
  const ref = useDraggableObject(getInitial, handleDrag, handleDragStart, handleDragStop);

  const style = {
    left: `${x1}px`,
    top: `${y1}px`,
    width: `${x2 - x1}px`,
    height: `${y2 - y1}px`,
    background: backColor,
  };

  return (
    <>
      <div ref={ref} className={`shape ${type}${selected ? ' selected' : ''}`} style={style}>
        <ShapeText id={id} />
      </div>
      {selected ? <ShapeGrips id={id} /> : null}
    </>
  );
}

export function DrawingCanvas() {
  const ref = useRef<HTMLDivElement>(null);
  const store = useRequiredStore();
  const [canvasDimensions, setCanvasDimensions] = useState<[number, number]>([0, 0]);

  const getShapeDimensions = useCallback(
    (id: string, maxX: number, maxY: number) => {
      const { x1, x2, y1, y2 } = store.getRow(SHAPES, id) as ShapeRow;
      const w = Math.max(x2 - x1, Math.min(MIN_WIDTH, maxX));
      const h = Math.max(y2 - y1, Math.min(MIN_HEIGHT, maxY));
      return { x1, x2, y1, y2, w, h };
    },
    [store],
  );

  useRowListener(
    SHAPES,
    null,
    (store, _tableId, rowId, getCellChange) => {
      const [maxX, maxY] = canvasDimensions;
      if (maxX === 0 || maxY === 0 || getCellChange == null) {
        return;
      }

      const [x1Changed] = getCellChange(SHAPES, rowId, 'x1');
      const [x2Changed] = getCellChange(SHAPES, rowId, 'x2');
      const [y1Changed] = getCellChange(SHAPES, rowId, 'y1');
      const [y2Changed] = getCellChange(SHAPES, rowId, 'y2');
      if (
        (x1Changed || x2Changed || y1Changed || y2Changed) &&
        rowId !== CANVAS_ID
      ) {
        const { x1, x2, y1, y2, w, h } = getShapeDimensions(rowId, maxX, maxY);
        if (x1Changed && x1 != null) {
          store.setCell(
            SHAPES,
            rowId,
            'x1',
            between(x1, 0, Math.min(x2, maxX) - w),
          );
        }
        if (x2Changed && x2 != null) {
          store.setCell(
            SHAPES,
            rowId,
            'x2',
            between(x2, Math.max(x1, 0) + w, maxX),
          );
        }
        if (y1Changed && y1 != null) {
          store.setCell(
            SHAPES,
            rowId,
            'y1',
            between(y1, 0, Math.min(y2, maxY) - h),
          );
        }
        if (y2Changed && y2 != null) {
          store.setCell(
            SHAPES,
            rowId,
            'y2',
            between(y2, Math.max(y1, 0) + h, maxY),
          );
        }
      }
    },
    [...canvasDimensions, getShapeDimensions],
    true,
  );

  const updateDimensions = useCallback(
    (current: HTMLDivElement) => {
      const { clientWidth: maxX, clientHeight: maxY } = current;
      setCanvasDimensions([maxX, maxY]);
      store.forEachRow(SHAPES, (id) => {
        if (id !== CANVAS_ID) {
          const { x2, y2, w, h } = getShapeDimensions(id, maxX, maxY);
          if (x2 > maxX) {
            store.setPartialRow(SHAPES, id, {
              x1: Math.max(0, maxX - w),
              x2: maxX,
            });
          }
          if (y2 > maxY) {
            store.setPartialRow(SHAPES, id, {
              y1: Math.max(0, maxY - h),
              y2: maxY,
            });
          }
        }
      });
    },
    [store, getShapeDimensions],
  );

  useEffect(() => {
    const current = ref.current;
    if (!current) return;
    const observer = new ResizeObserver(() => updateDimensions(current));
    observer.observe(current);
    updateDimensions(current);
    return () => observer.disconnect();
  }, [updateDimensions]);

  const [, setSelectedId] = useSelectedIdState();
  const handleMouseDown = useCallback(() => setSelectedId(null), [setSelectedId]);
  const backId = useBackId();

  return (
    <div id="canvas" onMouseDown={handleMouseDown} ref={ref}>
      {backId == null ? null : (
        <LinkedRowsView
          relationshipId="order"
          firstRowId={backId}
          rowComponent={Shape}
        />
      )}
    </div>
  );
}
