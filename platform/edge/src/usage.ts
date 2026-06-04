import {
  DO_FREE_LIMITS,
  SYNC_PUBLISH_INTERVAL_MS,
  type DoUsageSnapshot,
} from '@arena-prototype/shared-types';

export type UsageDelta = {
  requests: number;
  bytesIn: number;
  bytesOut: number;
  durationMs: number;
};

export type StoredDailyUsage = {
  dateUtc: string;
  requests: number;
  bytesIn: number;
  bytesOut: number;
  durationMs: number;
};

const USAGE_STORAGE_KEY = 'usage:daily';

export function utcDateKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function nextUtcMidnightIso(date = new Date()): string {
  const next = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1),
  );
  return next.toISOString();
}

export function emptyDailyUsage(dateUtc = utcDateKey()): StoredDailyUsage {
  return {
    dateUtc,
    requests: 0,
    bytesIn: 0,
    bytesOut: 0,
    durationMs: 0,
  };
}

export function mergeUsage(
  current: StoredDailyUsage,
  delta: UsageDelta,
): StoredDailyUsage {
  return {
    ...current,
    requests: current.requests + delta.requests,
    bytesIn: current.bytesIn + delta.bytesIn,
    bytesOut: current.bytesOut + delta.bytesOut,
    durationMs: current.durationMs + delta.durationMs,
  };
}

export function toUsageSnapshot(stored: StoredDailyUsage): DoUsageSnapshot {
  return {
    ...stored,
    limits: DO_FREE_LIMITS,
    resetAtUtc: nextUtcMidnightIso(),
    plan: 'free',
    syncPublishIntervalMs: SYNC_PUBLISH_INTERVAL_MS,
  };
}

export function messageByteLength(message: string | ArrayBuffer): number {
  return typeof message === 'string' ? message.length : message.byteLength;
}

export async function loadDailyUsage(
  storage: DurableObjectStorage,
): Promise<StoredDailyUsage> {
  const today = utcDateKey();
  const stored = await storage.get<StoredDailyUsage>(USAGE_STORAGE_KEY);
  if (!stored || stored.dateUtc !== today) {
    return emptyDailyUsage(today);
  }
  return stored;
}

export async function saveDailyUsage(
  storage: DurableObjectStorage,
  usage: StoredDailyUsage,
): Promise<void> {
  await storage.put(USAGE_STORAGE_KEY, usage);
}
