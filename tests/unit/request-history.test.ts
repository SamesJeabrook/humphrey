import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { RequestHistoryStore } from '../../src/domain/request-history.js';

test('full transcript mode stores text but excludes credentials', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'humphrey-history-'));
  const store = new RequestHistoryStore(join(directory, 'history.json'), 'full_transcript');
  await store.record({ id: 'one', createdAt: new Date().toISOString(), transcript: 'turn on the light', normalizedIntent: 'device_action:light', outcome: 'success' });
  const records = await store.list();
  assert.equal(records[0]?.requestText, 'turn on the light');
});

test('redacted mode removes credential-shaped transcript values', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'humphrey-history-'));
  const store = new RequestHistoryStore(join(directory, 'history.json'), 'redacted_transcript');
  await store.record({ id: 'two', createdAt: new Date().toISOString(), transcript: 'my token: abc123', normalizedIntent: null, outcome: 'rejected' });
  const records = await store.list();
  assert.equal(records[0]?.requestText, 'my [REDACTED]');
});

test('expired records are purged after thirty days', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'humphrey-history-'));
  const store = new RequestHistoryStore(join(directory, 'history.json'), 'full_transcript');
  await store.record({ id: 'old', createdAt: '2020-01-01T00:00:00.000Z', transcript: 'old request', normalizedIntent: null, outcome: 'success' });
  assert.equal((await store.list()).length, 0);
});
