import test from 'node:test';
import assert from 'node:assert/strict';
import { matchSpeaker, type SpeakerProfile } from '../../src/domain/speaker-profiles.js';

const profile: SpeakerProfile = { id: 'james', personName: 'James', embedding: [1, 0], confidenceThreshold: 0.9, enabled: true };

test('matches an enrolled speaker above threshold', () => assert.deepEqual(matchSpeaker([profile], [1, 0]), { personName: 'James', confidence: 1 }));
test('returns unknown below threshold', () => assert.equal(matchSpeaker([profile], [0, 1]), null));
