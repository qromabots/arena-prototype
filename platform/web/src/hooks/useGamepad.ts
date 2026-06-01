import { useEffect, useState } from 'react';

export type GamepadButtonState = {
  pressed: boolean;
  value: number;
};

export type GamepadSnapshot = {
  connected: boolean;
  id: string;
  index: number;
  axes: number[];
  buttons: GamepadButtonState[];
};

const DEADZONE = 0.12;

function applyDeadzone(value: number): number {
  const abs = Math.abs(value);
  if (abs < DEADZONE) return 0;
  const sign = value < 0 ? -1 : 1;
  return sign * ((abs - DEADZONE) / (1 - DEADZONE));
}

export function readGamepad(index: number): GamepadSnapshot | null {
  const pads = navigator.getGamepads?.();
  if (!pads) return null;

  const pad = pads[index] ?? pads.find((p) => p?.connected) ?? null;
  if (!pad?.connected) return null;

  return {
    connected: true,
    id: pad.id,
    index: pad.index,
    axes: pad.axes.map(applyDeadzone),
    buttons: pad.buttons.map((b) => ({
      pressed: b.pressed,
      value: b.value,
    })),
  };
}

export function useGamepad(preferredIndex = 0): GamepadSnapshot | null {
  const [snapshot, setSnapshot] = useState<GamepadSnapshot | null>(() =>
    readGamepad(preferredIndex),
  );

  useEffect(() => {
    let frame = 0;

    const tick = () => {
      setSnapshot(readGamepad(preferredIndex));
      frame = requestAnimationFrame(tick);
    };

    const onGamepadEvent = () => {
      setSnapshot(readGamepad(preferredIndex));
    };

    window.addEventListener('gamepadconnected', onGamepadEvent);
    window.addEventListener('gamepaddisconnected', onGamepadEvent);
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('gamepadconnected', onGamepadEvent);
      window.removeEventListener('gamepaddisconnected', onGamepadEvent);
    };
  }, [preferredIndex]);

  return snapshot;
}
