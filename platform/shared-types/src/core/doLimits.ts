/** Cloudflare Workers Free plan Durable Object quotas (resets 00:00 UTC). */
export const DO_FREE_LIMITS = {
  requestsPerDay: 100_000,
  durationGbSecondsPerDay: 13_000,
  sqlRowsWrittenPerDay: 100_000,
  sqlRowsReadPerDay: 5_000_000,
} as const;

export type DoFreeLimits = typeof DO_FREE_LIMITS;

export type DoUsageSnapshot = {
  dateUtc: string;
  requests: number;
  bytesIn: number;
  bytesOut: number;
  durationMs: number;
  limits: DoFreeLimits;
  resetAtUtc: string;
  plan: 'free';
  syncPublishIntervalMs: number;
};
