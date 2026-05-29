import type { ReactNode } from 'react';
import {
  useCell,
  useSetCellCallback,
  useSetCheckpointCallback,
} from 'tinybase/ui-react';
import { SHAPES, TYPES } from './constants';
import { useSelectedIdState } from './SelectedIdContext';

function SidebarCell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="cell">
      {label}: {children}
    </div>
  );
}

function SidebarTypeCell() {
  const [selectedId] = useSelectedIdState();
  const setCheckpoint = useSetCheckpointCallback(() => 'change of type', []);
  if (selectedId == null) return null;

  return (
    <SidebarCell label="Shape">
      <select
        value={useCell(SHAPES, selectedId, 'type') as string}
        onChange={useSetCellCallback(
          SHAPES,
          selectedId,
          'type',
          (e) => (e.target as HTMLSelectElement).value,
          [],
          undefined,
          setCheckpoint,
        )}
      >
        {TYPES.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
    </SidebarCell>
  );
}

function SidebarColorCell({
  label,
  cellId,
}: {
  label: string;
  cellId: 'textColor' | 'backColor';
}) {
  const [selectedId] = useSelectedIdState();
  const setCheckpoint = useSetCheckpointCallback(
    () => `change of '${label.toLowerCase()}' color`,
    [label],
  );
  if (selectedId == null) return null;

  return (
    <SidebarCell label={label}>
      <input
        type="color"
        value={useCell(SHAPES, selectedId, cellId) as string}
        onChange={useSetCellCallback(
          SHAPES,
          selectedId,
          cellId,
          (e) => (e.target as HTMLInputElement).value,
          [],
          undefined,
          setCheckpoint,
        )}
      />
    </SidebarCell>
  );
}

const nudgeUp = (cell: unknown) => Number(cell ?? 0) + 1;
const nudgeDown = (cell: unknown) => Number(cell ?? 0) - 1;

function SidebarNumberCell({
  label,
  cellId,
}: {
  label: string;
  cellId: 'x1' | 'y1' | 'x2' | 'y2';
}) {
  const [selectedId] = useSelectedIdState();
  const setCheckpoint = useSetCheckpointCallback(
    () => `nudge of '${label.toLowerCase()}' value`,
    [label],
  );
  if (selectedId == null) return null;

  const handleDown = useSetCellCallback(
    SHAPES,
    selectedId,
    cellId,
    () => nudgeDown,
    [],
    undefined,
    setCheckpoint,
  );
  const handleUp = useSetCellCallback(
    SHAPES,
    selectedId,
    cellId,
    () => nudgeUp,
    [],
    undefined,
    setCheckpoint,
  );

  return (
    <SidebarCell label={label}>
      <div className="spin">
        <div className="button" onClick={handleDown}>
          -
        </div>
        {useCell(SHAPES, selectedId, cellId) as number}
        <div className="button" onClick={handleUp}>
          +
        </div>
      </div>
    </SidebarCell>
  );
}

export function DrawingSidebar() {
  const [selectedId] = useSelectedIdState();
  return (
    <div id="sidebar">
      {selectedId == null ? null : (
        <>
          <SidebarTypeCell />
          <SidebarColorCell label="Text" cellId="textColor" />
          <SidebarColorCell label="Back" cellId="backColor" />
          <SidebarNumberCell label="Left" cellId="x1" />
          <SidebarNumberCell label="Top" cellId="y1" />
          <SidebarNumberCell label="Right" cellId="x2" />
          <SidebarNumberCell label="Bottom" cellId="y2" />
        </>
      )}
    </div>
  );
}
