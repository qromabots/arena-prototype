import type { GamepadSnapshot } from '@/hooks/useGamepad';
import { readGamepad } from '@/hooks/useGamepad';

const KEY_MAP: Record<string, { ax: number; ay: number }> = {
  ArrowUp: { ax: 0, ay: -1 },
  ArrowDown: { ax: 0, ay: 1 },
  ArrowLeft: { ax: -1, ay: 0 },
  ArrowRight: { ax: 1, ay: 0 },
  w: { ax: 0, ay: -1 },
  W: { ax: 0, ay: -1 },
  s: { ax: 0, ay: 1 },
  S: { ax: 0, ay: 1 },
  a: { ax: -1, ay: 0 },
  A: { ax: -1, ay: 0 },
  d: { ax: 1, ay: 0 },
  D: { ax: 1, ay: 0 },
};

export function driveInputFromKeys(keys: ReadonlySet<string>): { ax: number; ay: number } {
  let ax = 0;
  let ay = 0;
  for (const key of keys) {
    const dir = KEY_MAP[key];
    if (dir) {
      ax += dir.ax;
      ay += dir.ay;
    }
  }
  const len = Math.hypot(ax, ay);
  if (len > 1) {
    ax /= len;
    ay /= len;
  }
  return { ax, ay };
}

export function driveInputFromGamepad(pad: GamepadSnapshot | null): { ax: number; ay: number } {
  if (!pad?.connected) return { ax: 0, ay: 0 };

  let ax = pad.axes[0] ?? 0;
  let ay = pad.axes[1] ?? 0;

  const buttons = pad.buttons;
  if (buttons[12]?.pressed) ay -= 1;
  if (buttons[13]?.pressed) ay += 1;
  if (buttons[14]?.pressed) ax -= 1;
  if (buttons[15]?.pressed) ax += 1;

  const len = Math.hypot(ax, ay);
  if (len > 1) {
    ax /= len;
    ay /= len;
  }
  return { ax, ay };
}

export function readDriveInput(keys: ReadonlySet<string>): { ax: number; ay: number } {
  const pad = readGamepad(0);
  const fromPad = driveInputFromGamepad(pad);
  if (Math.hypot(fromPad.ax, fromPad.ay) > 0.01) {
    return fromPad;
  }
  return driveInputFromKeys(keys);
}
