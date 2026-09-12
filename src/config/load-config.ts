import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { configSchema, type AppConfig } from './config-schema.js';

export async function loadConfig(path = process.env.HUMPHREY_CONFIG ?? 'config/local.config.json'): Promise<AppConfig> {
  const raw = JSON.parse(await readFile(path, 'utf8')) as unknown;
  return configSchema.parse(raw);
}

export function requireSecret(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Required local secret is not configured: ${name}`);
  return value;
}
