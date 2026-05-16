import { ulid } from 'ulid';
import { z } from 'zod';

export const PREFIX = {
  player: 'plyr',
  arena: 'arena',
  message: 'msg',
  intent: 'intent',
} as const;

export type IdKind = keyof typeof PREFIX;

export const zPlayerId = z
  .string()
  .refine((s) => s.startsWith(`${PREFIX.player}_`), 'Invalid PlayerId')
  .brand<'PlayerId'>();
export type PlayerId = z.infer<typeof zPlayerId>;

export const zArenaId = z
  .string()
  .refine((s) => s.startsWith(`${PREFIX.arena}_`), 'Invalid ArenaId')
  .brand<'ArenaId'>();
export type ArenaId = z.infer<typeof zArenaId>;

export const zMessageId = z
  .string()
  .refine((s) => s.startsWith(`${PREFIX.message}_`), 'Invalid MessageId')
  .brand<'MessageId'>();
export type MessageId = z.infer<typeof zMessageId>;

export const zIntentId = z
  .string()
  .refine((s) => s.startsWith(`${PREFIX.intent}_`), 'Invalid IntentId')
  .brand<'IntentId'>();
export type IntentId = z.infer<typeof zIntentId>;

type BrandFor<K extends IdKind> = K extends 'player'
  ? PlayerId
  : K extends 'arena'
    ? ArenaId
    : K extends 'message'
      ? MessageId
      : IntentId;

export function make<K extends IdKind>(kind: K): BrandFor<K> {
  const raw = `${PREFIX[kind]}_${ulid()}`;
  switch (kind) {
    case 'player':
      return zPlayerId.parse(raw) as BrandFor<K>;
    case 'arena':
      return zArenaId.parse(raw) as BrandFor<K>;
    case 'message':
      return zMessageId.parse(raw) as BrandFor<K>;
    case 'intent':
      return zIntentId.parse(raw) as BrandFor<K>;
  }
}

export function strip<T extends string>(id: T): string {
  return id;
}

export function isIdOfKind<K extends IdKind>(kind: K, id: string): id is BrandFor<K> {
  return id.startsWith(`${PREFIX[kind]}_`);
}
