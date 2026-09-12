import fastifyStatic from '@fastify/static';
import type { FastifyInstance } from 'fastify';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

export async function registerStaticServing(app: FastifyInstance): Promise<void> {
  const webRoot = join(process.cwd(), 'web', 'dist');
  if (!existsSync(webRoot)) return;
  await app.register(fastifyStatic, { root: webRoot, prefix: '/' });
  app.get('/', async (_request, reply) => reply.sendFile('index.html'));
}
