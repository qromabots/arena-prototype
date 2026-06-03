import { useEffect, useRef } from 'react';
import { useRowIds, useStore } from 'tinybase/ui-react';
import type { PlayerId } from '@arena-prototype/shared-types';
import {
  ARENA_HEIGHT,
  ARENA_WIDTH,
  ROBOT_RADIUS,
  ROBOTS,
} from './constants';
import { readRobotRow } from './robotRows';

type Props = {
  playerId: PlayerId;
};

function drawRobot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  color: string,
  handle: string,
  isSelf: boolean,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  ctx.beginPath();
  ctx.arc(0, 0, ROBOT_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = isSelf ? '#fff' : 'rgba(255,255,255,0.35)';
  ctx.lineWidth = isSelf ? 2.5 : 1.5;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(ROBOT_RADIUS * 0.4, 0);
  ctx.lineTo(ROBOT_RADIUS + 6, 0);
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.restore();

  ctx.font = '600 11px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.fillText(handle, x, y - ROBOT_RADIUS - 6);
}

export function ArenaCanvas({ playerId }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const store = useStore();
  const robotIds = useRowIds(ROBOTS) ?? [];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !store) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;

    const render = () => {
      ctx.clearRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

      ctx.fillStyle = '#121820';
      ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

      ctx.strokeStyle = 'rgba(61, 156, 245, 0.25)';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, ARENA_WIDTH - 2, ARENA_HEIGHT - 2);

      const gridStep = 40;
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 1;
      for (let x = gridStep; x < ARENA_WIDTH; x += gridStep) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, ARENA_HEIGHT);
        ctx.stroke();
      }
      for (let y = gridStep; y < ARENA_HEIGHT; y += gridStep) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(ARENA_WIDTH, y);
        ctx.stroke();
      }

      const ids = store.getRowIds(ROBOTS) ?? [];
      for (const id of ids) {
        const robot = readRobotRow(store.getRow(ROBOTS, id));
        if (!robot) continue;
        drawRobot(
          ctx,
          robot.x,
          robot.y,
          robot.angle,
          robot.avatarColor,
          robot.handle,
          id === playerId,
        );
      }

      frame = requestAnimationFrame(render);
    };

    frame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frame);
  }, [store, playerId, robotIds]);

  return (
    <canvas
      ref={canvasRef}
      className="arena-canvas"
      width={ARENA_WIDTH}
      height={ARENA_HEIGHT}
      aria-label="Robot arena"
    />
  );
}
