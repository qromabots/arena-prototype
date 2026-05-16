export type StoreRegion =
  | 'arena'
  | 'own_players_row'
  | 'own_messages'
  | 'own_intents';

export interface OwnershipRule {
  region: StoreRegion;
  writer: string;
  everyoneElse: string;
}

/** Good-citizen write-ownership convention (v1 — not enforced at transport). */
export const STORE_OWNERSHIP: readonly OwnershipRule[] = [
  {
    region: 'arena',
    writer: 'host',
    everyoneElse: 'read-only',
  },
  {
    region: 'own_players_row',
    writer: 'that player',
    everyoneElse: 'read-only',
  },
  {
    region: 'own_messages',
    writer: 'that player (from === self)',
    everyoneElse: 'read; consume rows where to === self',
  },
  {
    region: 'own_intents',
    writer: 'that player (from === self)',
    everyoneElse: 'host reads and consumes',
  },
] as const;
