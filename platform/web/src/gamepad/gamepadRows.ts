import type { GamepadButtonState, GamepadSnapshot } from '@/hooks/useGamepad';
import type { Row } from 'tinybase';

export type ControllerRow = {
  handle: string;
  connected: boolean;
  padId: string;
  axes: string;
  buttons: string;
  updatedAt: number;
};

export function disconnectedControllerRow(handle: string): ControllerRow {
  return {
    handle,
    connected: false,
    padId: '',
    axes: '[]',
    buttons: '[]',
    updatedAt: Date.now(),
  };
}

export function controllerRowFromSnapshot(
  handle: string,
  snapshot: GamepadSnapshot,
): ControllerRow {
  return {
    handle,
    connected: true,
    padId: snapshot.id,
    axes: JSON.stringify(snapshot.axes),
    buttons: JSON.stringify(snapshot.buttons),
    updatedAt: Date.now(),
  };
}

export function snapshotFromControllerRow(row: Row | undefined): GamepadSnapshot | null {
  if (!row?.connected) return null;

  let axes: number[];
  let buttons: GamepadButtonState[];
  try {
    axes = JSON.parse(String(row.axes)) as number[];
    buttons = JSON.parse(String(row.buttons)) as GamepadButtonState[];
  } catch {
    return null;
  }

  return {
    connected: true,
    id: String(row.padId),
    index: 0,
    axes,
    buttons,
  };
}
