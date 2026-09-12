import type { FastifyInstance } from 'fastify';
import { WebSocketServer } from 'ws';

export function registerEventServer(app: FastifyInstance): WebSocketServer {
  const server = new WebSocketServer({ server: app.server, path: '/api/events' });
  server.on('connection', (socket) => socket.send(JSON.stringify({ type: 'system_state', state: 'idle', message: 'Ready' })));
  return server;
}
