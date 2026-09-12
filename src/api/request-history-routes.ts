import type { FastifyInstance } from 'fastify';
import type { RequestHistoryStore } from '../domain/request-history.js';

export async function registerRequestHistoryRoutes(app: FastifyInstance, history: RequestHistoryStore): Promise<void> {
  app.get('/api/request-history', async () => ({ mode: 'configured', records: await history.list() }));
  app.delete<{ Body: { confirm?: boolean } }>('/api/request-history', async (request, reply) => {
    if (request.body?.confirm !== true) return reply.code(400).send({ error: 'Explicit confirmation is required' });
    await history.deleteAll();
    return { deleted: true };
  });
}
