import { createMergeableStore } from 'tinybase';
import { createDurableObjectStoragePersister } from 'tinybase/persisters/persister-durable-object-storage';
import {
  WsServerDurableObject,
  getWsServerDurableObjectFetch,
} from 'tinybase/synchronizers/synchronizer-ws-server-durable-object';
import {
  loadDailyUsage,
  mergeUsage,
  messageByteLength,
  saveDailyUsage,
  toUsageSnapshot,
  type UsageDelta,
} from './usage';

const USAGE_FLUSH_INTERVAL_MS = 10_000;

const USAGE_CORS_HEADERS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, OPTIONS',
  'cache-control': 'no-store',
} as const;

export interface Env {
  DRAWING_ROOMS: DurableObjectNamespace<DrawingRoomDurableObject>;
  USAGE: DurableObjectNamespace;
}

/** Aggregates DO usage across rooms for the Free-tier dashboard. */
export class UsageDurableObject implements DurableObject {
  constructor(
    private state: DurableObjectState,
    _env: Env,
  ) {}

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'POST' && url.pathname === '/report') {
      const delta = (await request.json()) as UsageDelta;
      const usage = await loadDailyUsage(this.state.storage);
      await saveDailyUsage(this.state.storage, mergeUsage(usage, delta));
      return new Response(null, { status: 204 });
    }

    if (request.method === 'GET') {
      const usage = await loadDailyUsage(this.state.storage);
      return Response.json(toUsageSnapshot(usage), {
        headers: USAGE_CORS_HEADERS,
      });
    }

    return new Response('Not found', { status: 404 });
  }
}

/** One Durable Object per room; persists and relays MergeableStore sync. */
export class DrawingRoomDurableObject extends WsServerDurableObject {
  private pendingUsage: UsageDelta = emptyUsageDelta();
  private usageFlushScheduled = false;

  declare env: Env;

  createPersister() {
    return createDurableObjectStoragePersister(
      createMergeableStore(),
      this.ctx.storage,
      'drawing:',
    );
  }

  async fetch(request: Request): Promise<Response> {
    return super.fetch!(request);
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    const started = Date.now();
    const bytesIn = messageByteLength(message);
    this.accumulateUsage({ requests: 1, bytesIn, bytesOut: 0, durationMs: 0 });
    await super.webSocketMessage!(ws, message);
    this.accumulateUsage({
      requests: 0,
      bytesIn: 0,
      bytesOut: bytesIn,
      durationMs: Date.now() - started,
    });
    this.scheduleUsageFlush();
  }

  async webSocketClose(
    ws: WebSocket,
    code: number,
    reason: string,
    wasClean: boolean,
  ): Promise<void> {
    await super.webSocketClose!(ws, code, reason, wasClean);
  }

  async alarm(): Promise<void> {
    await this.flushUsageToGlobal();
    this.usageFlushScheduled = false;
  }

  private accumulateUsage(delta: UsageDelta) {
    this.pendingUsage = mergeUsageDelta(this.pendingUsage, delta);
  }

  private scheduleUsageFlush() {
    if (this.usageFlushScheduled) return;
    this.usageFlushScheduled = true;
    void this.ctx.storage.setAlarm(Date.now() + USAGE_FLUSH_INTERVAL_MS);
  }

  private async flushUsageToGlobal() {
    const delta = { ...this.pendingUsage };
    this.pendingUsage = emptyUsageDelta();
    if (delta.requests === 0 && delta.durationMs === 0) return;

    const stub = this.env.USAGE.get(this.env.USAGE.idFromName('global'));
    await stub.fetch(
      new Request('https://usage.internal/report', {
        method: 'POST',
        body: JSON.stringify(delta),
        headers: { 'content-type': 'application/json' },
      }),
    );
  }
}

function emptyUsageDelta(): UsageDelta {
  return { requests: 0, bytesIn: 0, bytesOut: 0, durationMs: 0 };
}

function mergeUsageDelta(current: UsageDelta, delta: UsageDelta): UsageDelta {
  return {
    requests: current.requests + delta.requests,
    bytesIn: current.bytesIn + delta.bytesIn,
    bytesOut: current.bytesOut + delta.bytesOut,
    durationMs: current.durationMs + delta.durationMs,
  };
}

const wsFetch = getWsServerDurableObjectFetch('DRAWING_ROOMS');

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/usage') {
      if (request.method === 'OPTIONS') {
        return new Response(null, { headers: USAGE_CORS_HEADERS });
      }
      if (request.method === 'GET') {
        const stub = env.USAGE.get(env.USAGE.idFromName('global'));
        return stub.fetch(
          new Request('https://usage.internal/usage', {
            headers: { 'cache-control': 'no-store' },
          }),
        );
      }
    }

    return wsFetch(request, env);
  },
};
