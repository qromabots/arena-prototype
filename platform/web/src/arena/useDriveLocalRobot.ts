import { useEffect, useRef } from 'react';
import { useStore } from 'tinybase/ui-react';
import type { PlayerId } from '@arena-prototype/shared-types';
import {
  ARENA_HEIGHT,
  ARENA_WIDTH,
  ROBOT_ACCEL,
  ROBOT_FRICTION,
  ROBOT_MAX_SPEED,
  ROBOT_RADIUS,
  ROBOTS,
} from './constants';
import { readDriveInput } from './driveInput';
import { readRobotRow } from './robotRows';

const KEY_MAP: Record<string, true> = {
  ArrowUp: true,
  ArrowDown: true,
  ArrowLeft: true,
  ArrowRight: true,
  w: true,
  W: true,
  s: true,
  S: true,
  a: true,
  A: true,
  d: true,
  D: true,
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function useDriveLocalRobot(playerId: PlayerId) {
  const store = useStore();
  const keysRef = useRef(new Set<string>());

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (KEY_MAP[event.key]) {
        event.preventDefault();
        keysRef.current.add(event.key);
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      keysRef.current.delete(event.key);
    };

    const onBlur = () => {
      keysRef.current.clear();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  useEffect(() => {
    if (!store) return;

    let frame = 0;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 16.67, 2);
      lastTime = now;

      const row = readRobotRow(store.getRow(ROBOTS, playerId));
      if (!row) {
        frame = requestAnimationFrame(tick);
        return;
      }

      const { ax, ay } = readDriveInput(keysRef.current);

      let vx = row.vx;
      let vy = row.vy;

      if (ax !== 0 || ay !== 0) {
        vx += ax * ROBOT_ACCEL * dt;
        vy += ay * ROBOT_ACCEL * dt;
      } else {
        vx *= ROBOT_FRICTION;
        vy *= ROBOT_FRICTION;
        if (Math.abs(vx) < 0.05) vx = 0;
        if (Math.abs(vy) < 0.05) vy = 0;
      }

      const speed = Math.hypot(vx, vy);
      if (speed > ROBOT_MAX_SPEED) {
        vx = (vx / speed) * ROBOT_MAX_SPEED;
        vy = (vy / speed) * ROBOT_MAX_SPEED;
      }

      let x = row.x + vx * dt;
      let y = row.y + vy * dt;
      let angle = row.angle;

      if (speed > 0.1) {
        angle = Math.atan2(vy, vx);
      }

      const margin = ROBOT_RADIUS;
      if (x < margin) {
        x = margin;
        vx = Math.abs(vx) * 0.5;
      } else if (x > ARENA_WIDTH - margin) {
        x = ARENA_WIDTH - margin;
        vx = -Math.abs(vx) * 0.5;
      }
      if (y < margin) {
        y = margin;
        vy = Math.abs(vy) * 0.5;
      } else if (y > ARENA_HEIGHT - margin) {
        y = ARENA_HEIGHT - margin;
        vy = -Math.abs(vy) * 0.5;
      }

      vx = clamp(vx, -ROBOT_MAX_SPEED, ROBOT_MAX_SPEED);
      vy = clamp(vy, -ROBOT_MAX_SPEED, ROBOT_MAX_SPEED);

      store.setRow(ROBOTS, playerId, {
        ...row,
        x,
        y,
        angle,
        vx,
        vy,
        updatedAt: Date.now(),
      });

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [store, playerId]);
}
