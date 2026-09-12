import test from 'node:test';
import assert from 'node:assert/strict';
import { redact } from '../../src/logging/redaction.js';

test('redacts credential-shaped fields from operational data', () => {
  assert.deepEqual(redact({ token: 'secret', nested: { password: 'hidden', value: 'safe' } }), { token: '[REDACTED]', nested: { password: '[REDACTED]', value: 'safe' } });
});
