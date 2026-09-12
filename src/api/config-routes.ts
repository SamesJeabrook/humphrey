import type { FastifyInstance } from 'fastify';
import type { AppConfig } from '../config/config-schema.js';

export async function registerConfigRoutes(app: FastifyInstance, config: AppConfig): Promise<void> {
  app.get('/api/config/history', async () => ({ mode: config.history.mode, retentionDays: config.history.retentionDays }));
}
