export const SHAPES = 'shapes';
export const CANVAS_ID = '0';
export const MIN_WIDTH = 50;
export const MIN_HEIGHT = 30;
export const TYPES = ['rectangle', 'ellipse'] as const;

export type ShapeType = (typeof TYPES)[number];

export const constrainType = (
  store: { setCell: (t: string, r: string, c: string, v: string) => void },
  tableId: string,
  rowId: string,
  cellId: string,
  type: unknown,
) => {
  if (type != null && !TYPES.includes(type as ShapeType)) {
    store.setCell(tableId, rowId, cellId, TYPES[0]);
  }
};

export const constrainColor = (
  store: { setCell: (t: string, r: string, c: string, v: string) => void },
  tableId: string,
  rowId: string,
  cellId: string,
  color: unknown,
) => {
  if (color != null && !/^#[a-f\d]{6}$/i.test(String(color))) {
    store.setCell(tableId, rowId, cellId, '#000000');
  }
};

export const between = (value: number, min: number, max: number) =>
  value < min ? min : value > max ? max : value;
