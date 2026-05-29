import { WebSocketServer } from 'ws';
import { createWsServer } from 'tinybase/synchronizers/synchronizer-ws-server';

const port = Number(process.env.DRAWING_WS_PORT ?? 8043);

createWsServer(new WebSocketServer({ port }));

console.log(`Drawing sync server listening on ws://localhost:${port}/`);
