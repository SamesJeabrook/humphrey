import type { FastifyInstance } from 'fastify';
import type { RequestOrchestrator } from '../domain/request-orchestrator.js';
import type { AudioEndpoint } from '../domain/types.js';
import type { RequestHistoryStore } from '../domain/request-history.js';

export async function registerRequestRoutes(app: FastifyInstance, orchestrator: RequestOrchestrator, endpoint: AudioEndpoint, history: RequestHistoryStore): Promise<void> {
  app.post<{ Body: { text: string } }>('/api/requests', async (request, reply) => {
    if (!request.body?.text) return reply.code(400).send({ error: 'text is required' });
    const result = await orchestrator.process(request.body.text, endpoint);
    await history.record({ id: result.request.id, createdAt: result.request.createdAt, transcript: result.request.transcript, normalizedIntent: result.request.intent ? `${result.request.intent.kind}:${result.request.intent.target ?? 'none'}` : null, targetCapability: result.request.intent?.target, outcome: result.request.outcome ?? 'failed' });
    return reply.code(202).send({ requestId: result.request.id, state: result.request.state, outcome: result.request.outcome, message: result.message });
  });
}
