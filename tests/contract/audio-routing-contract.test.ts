import test from 'node:test';
import assert from 'node:assert/strict';
import { assertEndpoint } from '../../src/audio/audio-router.js';

test('requires an explicit local audio endpoint pair', async () => {
  await assertEndpoint({ id: 'main', inputDevice: 'default', outputDevice: 'default', displayAvailable: false });
  await assert.rejects(() => assertEndpoint({ id: 'invalid', inputDevice: '', outputDevice: '', displayAvailable: false }));
});
