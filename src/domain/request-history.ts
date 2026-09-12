import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { HistoryMode, RequestHistoryRecord, RequestOutcome } from './types.js';

export class RequestHistoryStore {
  private records: RequestHistoryRecord[] = [];
  private loaded = false;

  constructor(private readonly filePath: string, private mode: HistoryMode, private readonly retentionDays = 30) {}

  async load(): Promise<void> {
    if (this.loaded) return;
    try { this.records = JSON.parse(await readFile(this.filePath, 'utf8')) as RequestHistoryRecord[]; } catch { this.records = []; }
    this.loaded = true;
    await this.purgeExpired();
  }

  setMode(mode: HistoryMode): void { this.mode = mode; }

  async record(input: { id: string; createdAt: string; transcript: string; normalizedIntent: string | null; personName?: string | null; targetCapability?: string | null; outcome: RequestOutcome }): Promise<void> {
    await this.load();
    const createdAt = new Date(input.createdAt);
    const expiresAt = new Date(createdAt.getTime() + this.retentionDays * 24 * 60 * 60 * 1000).toISOString();
    this.records.push({ id: input.id, createdAt: createdAt.toISOString(), requestText: this.mode === 'normalized_only' ? null : this.mode === 'redacted_transcript' ? redactTranscript(input.transcript) : input.transcript, normalizedIntent: this.mode === 'normalized_only' ? input.normalizedIntent : input.normalizedIntent, personName: input.personName ?? null, targetCapability: input.targetCapability ?? null, outcome: input.outcome, expiresAt });
    await this.persist();
  }

  async list(): Promise<RequestHistoryRecord[]> { await this.load(); await this.purgeExpired(); return [...this.records].sort((a, b) => b.createdAt.localeCompare(a.createdAt)); }

  async purgeExpired(now = new Date()): Promise<number> {
    await this.loadWithoutPurge();
    const before = this.records.length;
    this.records = this.records.filter((record) => new Date(record.expiresAt) > now);
    if (before !== this.records.length) await this.persist();
    return before - this.records.length;
  }

  async deleteAll(): Promise<void> { await this.load(); this.records = []; await this.persist(); }

  private async loadWithoutPurge(): Promise<void> {
    if (this.loaded) return;
    try { this.records = JSON.parse(await readFile(this.filePath, 'utf8')) as RequestHistoryRecord[]; } catch { this.records = []; }
    this.loaded = true;
  }

  private async persist(): Promise<void> { await mkdir(dirname(this.filePath), { recursive: true }); await writeFile(this.filePath, JSON.stringify(this.records, null, 2), 'utf8'); }
}

function redactTranscript(value: string): string {
  return value.replace(/\b(?:token|password|secret|api[-_ ]?key)\s*[:=]?\s*\S+/gi, '[REDACTED]');
}
