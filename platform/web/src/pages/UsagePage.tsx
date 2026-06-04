import { useCallback, useEffect, useState } from 'react';
import type { DoUsageSnapshot } from '@arena-prototype/shared-types';
import { Layout } from '@/components/Layout';
import { getDoUsageUrl, isDrawingSyncAvailable } from '@/drawing/drawingSync';
import { getRouteApi, Link } from '@tanstack/react-router';

const route = getRouteApi('/usage');

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDurationMs(durationMs: number): string {
  const seconds = durationMs / 1000;
  if (seconds < 60) return `${seconds.toFixed(1)} s`;
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.round(seconds % 60);
  return `${minutes}m ${remainder}s`;
}

function estimateDurationGbSeconds(durationMs: number): number {
  // Rough edge estimate: 128 MB object for ~1 ms of handler time on a small room.
  const assumedObjectSizeGb = 0.128;
  return (durationMs / 1000) * assumedObjectSizeGb;
}

type UsageMeterProps = {
  label: string;
  used: number;
  limit: number;
  formatValue?: (value: number) => string;
  hint?: string;
};

function UsageMeter({
  label,
  used,
  limit,
  formatValue = (value) => value.toLocaleString(),
  hint,
}: UsageMeterProps) {
  const ratio = limit > 0 ? Math.min(used / limit, 1) : 0;
  const remaining = Math.max(limit - used, 0);
  const warn = ratio >= 0.8;

  return (
    <div className="usage-meter">
      <div className="usage-meter-header">
        <span>{label}</span>
        <span className="mono">
          {formatValue(used)} / {formatValue(limit)}
        </span>
      </div>
      <div className="usage-meter-track" aria-hidden>
        <div
          className={`usage-meter-fill${warn ? ' usage-meter-fill-warn' : ''}`}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
      <p className="muted usage-meter-foot">
        {formatValue(remaining)} remaining
        {hint ? ` · ${hint}` : null}
      </p>
    </div>
  );
}

export function UsagePage() {
  route.useRouteContext();
  const syncAvailable = isDrawingSyncAvailable();
  const [usage, setUsage] = useState<DoUsageSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!syncAvailable) {
      setLoading(false);
      setError('Sync worker is not configured for this deployment.');
      return;
    }

    try {
      const response = await fetch(getDoUsageUrl(), { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Usage API returned ${response.status}`);
      }
      const data = (await response.json()) as DoUsageSnapshot;
      setUsage(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load usage');
    } finally {
      setLoading(false);
    }
  }, [syncAvailable]);

  useEffect(() => {
    void refresh();
    const interval = window.setInterval(() => {
      void refresh();
    }, 10_000);
    return () => window.clearInterval(interval);
  }, [refresh]);

  const durationGbSeconds = usage ? estimateDurationGbSeconds(usage.durationMs) : 0;

  return (
    <Layout title="Durable Object usage">
      <p className="lead">
        Estimated sync worker usage against Cloudflare Free plan quotas. Counts reset
        daily at 00:00 UTC.
      </p>

      {!syncAvailable ? (
        <p className="muted">
          Set <code className="mono">VITE_DRAWING_WS_ORIGIN</code> or run{' '}
          <code className="mono">npm run dev</code> locally to track usage.
        </p>
      ) : null}

      <div className="usage-actions">
        <button
          type="button"
          className="gamepad-sync-button"
          onClick={() => {
            setLoading(true);
            void refresh();
          }}
          disabled={loading || !syncAvailable}
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
        {syncAvailable ? (
          <span className="muted mono usage-endpoint">{getDoUsageUrl()}</span>
        ) : null}
      </div>

      {error ? <p className="usage-error">{error}</p> : null}

      {usage ? (
        <>
          <section className="card usage-card">
            <h2>Today ({usage.dateUtc} UTC)</h2>
            <UsageMeter
              label="DO requests"
              used={usage.requests}
              limit={usage.limits.requestsPerDay}
              hint="WebSocket messages, HTTP, and alarms"
            />
            <UsageMeter
              label="Estimated DO duration"
              used={durationGbSeconds}
              limit={usage.limits.durationGbSecondsPerDay}
              formatValue={(value) => `${value.toFixed(2)} GB-s`}
              hint={`Handler time tracked: ${formatDurationMs(usage.durationMs)}`}
            />
            <dl className="usage-stats">
              <div>
                <dt>Bytes in (tracked)</dt>
                <dd className="mono">{formatBytes(usage.bytesIn)}</dd>
              </div>
              <div>
                <dt>Bytes out (tracked)</dt>
                <dd className="mono">{formatBytes(usage.bytesOut)}</dd>
              </div>
            </dl>
          </section>

          <section className="card">
            <h2>Traffic reduction</h2>
            <ul className="usage-list">
              <li>
                Client publishes coalesced every{' '}
                <strong>{usage.syncPublishIntervalMs} ms</strong> (~
                {Math.round(1000 / usage.syncPublishIntervalMs)} Hz) instead of every
                animation frame.
              </li>
              <li>Only changed robot / gamepad fields are written with partial rows.</li>
              <li>Arena no longer syncs unused controller rows to the room DO.</li>
              <li>Room DOs batch usage reports every 10 seconds.</li>
            </ul>
            <p className="muted">
              Next quota reset: {new Date(usage.resetAtUtc).toLocaleString()} (local
              time)
            </p>
          </section>
        </>
      ) : null}

      <p>
        <Link to="/">Home</Link>
        {' · '}
        <Link to="/settings">Settings</Link>
      </p>
    </Layout>
  );
}
