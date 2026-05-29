import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

type DragState<T> = {
  x: number;
  y: number;
  initial: T;
};

type DragPayload<T> = {
  dx: number;
  dy: number;
  initial: T;
};

export function useDraggableObject<T>(
  getInitial: () => T,
  onDrag: (payload: DragPayload<T>) => void,
  onDragStart?: () => void,
  onDragStop?: () => void,
) {
  const [start, setStart] = useState<DragState<T> | null>(null);

  const handleMouseDown = useCallback(
    (event: MouseEvent) => {
      onDragStart?.();
      setStart({
        x: event.clientX,
        y: event.clientY,
        initial: getInitial(),
      });
      event.stopPropagation();
    },
    [getInitial, onDragStart],
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (start != null) {
        onDrag({
          dx: event.clientX - start.x,
          dy: event.clientY - start.y,
          initial: start.initial,
        });
      }
      event.stopPropagation();
    },
    [onDrag, start],
  );

  const handleMouseUp = useCallback(
    (event: MouseEvent) => {
      setStart(null);
      onDragStop?.();
      event.stopPropagation();
    },
    [onDragStop],
  );

  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const current = ref.current;
    if (!current) return;
    current.addEventListener('mousedown', handleMouseDown);
    return () => current.removeEventListener('mousedown', handleMouseDown);
  }, [handleMouseDown]);

  useEffect(() => {
    if (start == null) return;
    addEventListener('mousemove', handleMouseMove);
    addEventListener('mouseup', handleMouseUp);
    return () => {
      removeEventListener('mousemove', handleMouseMove);
      removeEventListener('mouseup', handleMouseUp);
    };
  }, [start, handleMouseMove, handleMouseUp]);

  return ref;
}
