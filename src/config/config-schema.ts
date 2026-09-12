import { z } from 'zod';

const deviceSchema = z.object({
  entityId: z.string().min(1),
  displayName: z.string().min(1),
  domain: z.string().min(1),
  aliases: z.array(z.string().min(1)).default([]),
  allowedServices: z.array(z.string().min(1)).default([]),
  enabled: z.boolean().default(true)
});

export const configSchema = z.object({
  server: z.object({ host: z.string().default('127.0.0.1'), port: z.number().int().positive().default(3100) }),
  homeAssistant: z.object({ baseUrl: z.string().url(), tokenEnv: z.string().min(1) }),
  ollama: z.object({ baseUrl: z.string().url(), model: z.string().min(1) }),
  audio: z.object({
    inputDevice: z.string().min(1), outputDevice: z.string().min(1), fallbackOutput: z.string().nullable().default(null),
    whisperExecutable: z.string().min(1), whisperModel: z.string().min(1), piperExecutable: z.string().min(1), piperModel: z.string().min(1)
  }),
  history: z.object({ mode: z.enum(['normalized_only', 'redacted_transcript', 'full_transcript']).default('full_transcript'), retentionDays: z.literal(30).default(30) }),
  integrations: z.record(z.object({ enabled: z.boolean().default(false) })).default({}),
  devices: z.array(deviceSchema).default([])
});

export type AppConfig = z.infer<typeof configSchema>;
