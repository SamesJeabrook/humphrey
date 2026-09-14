import type { FastifyInstance } from 'fastify';
import type { AppConfig } from '../config/config-schema.js';

export async function registerHealthRoutes(app: FastifyInstance, config: AppConfig): Promise<void> {
  app.get('/health', async () => ({ status: 'ok', dependencies: { homeAssistant: 'configured', ollama: 'configured', whisper: 'configured', piper: 'configured' } }));
  app.get('/api/config/public', async () => ({ activationPhrases: ['Humphrey', 'Humphry', 'Humphree', 'Humfry', 'Humfree'], historyMode: config.history.mode, retentionDays: config.history.retentionDays, integrations: Object.entries(config.integrations).filter(([, value]) => value.enabled).map(([key]) => key) }));
}
