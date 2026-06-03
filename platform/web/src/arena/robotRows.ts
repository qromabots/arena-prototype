import type { Handle, PlayerIdentity } from '@arena-prototype/shared-types';
import {
  ARENA_HEIGHT,
  ARENA_WIDTH,
  ROBOT_RADIUS,
} from './constants';

export type RobotRow = {
  handle: string;
  avatarColor: string;
  x: number;
  y: number;
  angle: number;
  vx: number;
  vy: number;
  updatedAt: number;
};

export type PlayerRow = {
  handle: string;
  avatarColor: string;
  joinedAt: number;
  isConnected: boolean;
};

export type ArenaRow = {
  id: string;
  name: string;
  width: number;
  height: number;
  createdAt: number;
};

function hashPlayerId(playerId: string): number {
  let hash = 0;
  for (let i = 0; i < playerId.length; i++) {
    hash = (hash * 31 + playerId.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function spawnPosition(playerId: string): { x: number; y: number } {
  const hash = hashPlayerId(playerId);
  const margin = ROBOT_RADIUS + 12;
  const innerW = ARENA_WIDTH - margin * 2;
  const innerH = ARENA_HEIGHT - margin * 2;
  return {
    x: margin + (hash % innerW),
    y: margin + ((hash >> 8) % innerH),
  };
}

export function robotRowFromIdentity(identity: PlayerIdentity): RobotRow {
  const { x, y } = spawnPosition(identity.playerId);
  return {
    handle: identity.handle,
    avatarColor: identity.avatarColor,
    x,
    y,
    angle: 0,
    vx: 0,
    vy: 0,
    updatedAt: Date.now(),
  };
}

export function playerRowFromIdentity(identity: PlayerIdentity): PlayerRow {
  return {
    handle: identity.handle,
    avatarColor: identity.avatarColor,
    joinedAt: Date.now(),
    isConnected: true,
  };
}

export function defaultArenaRow(roomId: string, hostHandle: Handle): ArenaRow {
  return {
    id: roomId,
    name: `${hostHandle}'s arena`,
    width: ARENA_WIDTH,
    height: ARENA_HEIGHT,
    createdAt: Date.now(),
  };
}

export function readRobotRow(row: Record<string, unknown> | undefined): RobotRow | null {
  if (!row || Object.keys(row).length === 0) return null;
  return {
    handle: String(row.handle ?? ''),
    avatarColor: String(row.avatarColor ?? '#3d9cf5'),
    x: Number(row.x ?? 0),
    y: Number(row.y ?? 0),
    angle: Number(row.angle ?? 0),
    vx: Number(row.vx ?? 0),
    vy: Number(row.vy ?? 0),
    updatedAt: Number(row.updatedAt ?? 0),
  };
}
