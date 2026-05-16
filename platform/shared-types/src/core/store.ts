import type {
  Arena,
  ArenaConfig,
  ArenaStatus,
  ConnectionState,
  Intent,
  Message,
  Player,
  PlayerIdentity,
  Preferences,
} from './schemas.js';
import type { ArenaId, PlayerId } from './ids.js';

export type { ConnectionState };

export interface ConnectOptions {
  arenaId: ArenaId;
  inviteCode: string;
  identity: PlayerIdentity;
  mode: 'create' | 'join';
  config?: ArenaConfig;
}

export interface ArenaStore {
  getArena(): Arena;
  getPlayers(): Player[];

  onArenaChange(cb: (arena: Arena) => void): () => void;
  onPlayerJoined(cb: (player: Player) => void): () => void;
  onPlayerLeft(cb: (playerId: PlayerId) => void): () => void;
  onPlayerChanged(cb: (player: Player) => void): () => void;
  onStatusChanged(cb: (status: ArenaStatus) => void): () => void;
  onConnectionStateChange(cb: (state: ConnectionState) => void): () => void;

  setReady(playerId: PlayerId, ready: boolean): void;
  setStatus(status: ArenaStatus): void;
  heartbeat(): void;

  connect(opts: ConnectOptions): Promise<void>;
  disconnect(): void;
  getConnectionState(): ConnectionState;

  sendMessage(to: PlayerId, payload: unknown): void;
  onMessage(cb: (msg: Message) => void): () => void;

  sendIntent(payload: unknown): void;
  onIntent(cb: (intent: Intent) => void): () => void;
}

export interface LocalStore {
  getIdentity(): PlayerIdentity | null;
  saveIdentity(identity: PlayerIdentity): void;
  getPreferences(): Preferences;
  savePreferences(prefs: Preferences): void;
  ensureKeypair(): Promise<void>;
}
