import pino, { type Logger } from 'pino';
import { redact } from './redaction.js';

export const logger: Logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  redact: { paths: ['req.headers.authorization', 'token', 'password', 'secret', 'credential'], censor: '[REDACTED]' }
});

export function safeLogData(value: unknown): unknown { return redact(value); }
