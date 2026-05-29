import { networkInterfaces } from 'node:os';
import { WebSocketServer } from 'ws';
import { createWsServer } from 'tinybase/synchronizers/synchronizer-ws-server';

const port = Number(process.env.PORT ?? process.env.DRAWING_WS_PORT ?? 8043);
const host = process.env.DRAWING_WS_HOST ?? '0.0.0.0';

createWsServer(new WebSocketServer({ port, host }));

console.log(`TinyBase WsServer listening on ${host}:${port}`);

for (const addresses of Object.values(networkInterfaces())) {
  for (const net of addresses ?? []) {
    if (net.family === 'IPv4' && !net.internal) {
      console.log(`  Other devices: ws://${net.address}:${port}/<room-id>`);
    }
  }
}
