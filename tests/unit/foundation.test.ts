import test from 'node:test';
import assert from 'node:assert/strict';
import { assertTransition } from '../../src/domain/request-state.js';
import { hasPlease } from '../../src/domain/intent-policy.js';

test('allows the confirmation transition', () => assert.doesNotThrow(() => assertTransition('processing', 'awaiting_confirmation')));
test('rejects unsafe state transitions', () => assert.throws(() => assertTransition('idle', 'executing')));
test('requires please at the end of a request', () => {
  assert.equal(hasPlease('turn on the light please'), true);
  assert.equal(hasPlease('please turn on the light'), false);
});
