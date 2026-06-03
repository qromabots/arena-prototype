import { z } from 'zod';
import {
  zArenaId,
  zIntentId,
  zMessageId,
  zPlayerId,
} from './ids.js';
import { zSigningPrivKeyJwk, zSigningPubKeyBytes } from './keys.js';

export const zArenaStatus = z.enum(['waiting', 'active', 'finished']);
export type ArenaStatus = z.infer<typeof zArenaStatus>;

export const zTransport = z.enum(['do', 'p2p']);
export type Transport = z.infer<typeof zTransport>;

export const zConnectionState = z.enum([
  'idle',
  'connecting',
  'connected',
  'reconnecting',
  'failed',
  'disconnected',
]);
export type ConnectionState = z.infer<typeof zConnectionState>;

export const zArenaConfig = z.object({
  name: z.string().min(1).max(60).optional(),
  maxGuests: z.number().int().min(1).max(8),
  seed: z.string().min(1),
  disconnectGraceMs: z.number().int().min(0).default(15_000),
});
export type ArenaConfig = z.infer<typeof zArenaConfig>;

export const zArenaConfigExport = z.object({
  kind: z.literal('arena-config'),
  version: z.literal(1),
  config: zArenaConfig,
});
export type ArenaConfigExport = z.infer<typeof zArenaConfigExport>;

export const zArena = zArenaConfig.extend({
  id: zArenaId,
  inviteCode: z.string().min(1),
  hostPlayerId: zPlayerId,
  status: zArenaStatus,
});
export type Arena = z.infer<typeof zArena>;

export const zHandle = z
  .string()
  .min(2)
  .max(24)
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    'Handle: letters, numbers, underscore, hyphen only',
  )
  .brand<'Handle'>();
export type Handle = z.infer<typeof zHandle>;

export const zPlayer = z.object({
  id: zPlayerId,
  handle: zHandle,
  avatarColor: z.string().min(1),
  role: z.enum(['host', 'guest']),
  isConnected: z.boolean(),
  isReady: z.boolean(),
  joinedAt: z.number(),
  lastSeen: z.number(),
  signingPubKey: zSigningPubKeyBytes,
});
export type Player = z.infer<typeof zPlayer>;

export const zMessage = z.object({
  id: zMessageId,
  from: zPlayerId,
  to: zPlayerId,
  sentAt: z.number(),
  payload: z.unknown(),
});
export type Message = z.infer<typeof zMessage>;

export const zIntent = z.object({
  id: zIntentId,
  from: zPlayerId,
  sentAt: z.number(),
  payload: z.unknown(),
});
export type Intent = z.infer<typeof zIntent>;

export const zRobot = z.object({
  handle: zHandle,
  avatarColor: z.string().min(1),
  x: z.number(),
  y: z.number(),
  angle: z.number(),
  vx: z.number(),
  vy: z.number(),
  updatedAt: z.number(),
});
export type Robot = z.infer<typeof zRobot>;

export const zPreferences = z.object({
  soundEnabled: z.boolean().default(true),
  theme: z.string().min(1).default('system'),
});
export type Preferences = z.infer<typeof zPreferences>;

export const zPlayerIdentity = z.object({
  playerId: zPlayerId,
  signingPubKey: zSigningPubKeyBytes,
  signingPrivKey: zSigningPrivKeyJwk,
  handle: zHandle,
  avatarColor: z.string().min(1),
});
export type PlayerIdentity = z.infer<typeof zPlayerIdentity>;

/** Persisted before handle is chosen (bootstrap). */
export const zStoredIdentity = z.object({
  playerId: zPlayerId,
  signingPubKey: zSigningPubKeyBytes,
  signingPrivKey: zSigningPrivKeyJwk,
  handle: z.string(),
  avatarColor: z.string().min(1),
});
export type StoredIdentity = z.infer<typeof zStoredIdentity>;
