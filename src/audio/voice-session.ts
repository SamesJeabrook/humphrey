import type { AudioEndpoint } from '../domain/types.js';

export interface VoiceSession { endpoint: AudioEndpoint; active: boolean; }

export function createVoiceSession(endpoint: AudioEndpoint): VoiceSession { return { endpoint, active: false }; }
