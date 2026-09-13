import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { FastifyInstance } from 'fastify';
import type { AudioEndpoint } from '../domain/types.js';
import type { RequestOrchestrator } from '../domain/request-orchestrator.js';
import type { RequestHistoryStore } from '../domain/request-history.js';
import type { WhisperAdapter } from '../adapters/whisper.js';

export async function registerVoiceRoutes(
  app: FastifyInstance,
  whisper: WhisperAdapter,
  orchestrator: RequestOrchestrator,
  endpoint: AudioEndpoint,
  history: RequestHistoryStore,
): Promise<void> {
  app.post<{ Body: Buffer }>('/api/voice', async (request, reply) => {
    if (!Buffer.isBuffer(request.body) || request.body.length === 0) return reply.code(400).send({ error: 'WAV audio is required' });
    const directory = await mkdtemp(join(tmpdir(), 'humphrey-browser-mic-'));
    const audioFile = join(directory, 'request.wav');
    try {
      await writeFile(audioFile, request.body);
      const transcript = await whisper.transcribe(audioFile);
      if (!transcript) return reply.code(422).send({ error: 'Whisper did not recognize speech', transcript: '' });
      const result = await orchestrator.process(transcript, endpoint);
      await history.record({ id: result.request.id, createdAt: result.request.createdAt, transcript, normalizedIntent: result.request.intent ? `${result.request.intent.kind}:${result.request.intent.target ?? 'none'}` : null, targetCapability: result.request.intent?.target, outcome: result.request.outcome ?? 'failed' });
      return reply.code(202).send({ requestId: result.request.id, transcript, state: result.request.state, outcome: result.request.outcome, message: result.message });
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
}
