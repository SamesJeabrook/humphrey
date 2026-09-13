import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type { AudioEndpoint } from '../domain/types.js';
import type { WhisperAdapter } from '../adapters/whisper.js';
import type { RequestOrchestrator } from '../domain/request-orchestrator.js';

const execFileAsync = promisify(execFile);
type StateListener = (state: 'idle' | 'activated' | 'listening' | 'unavailable', message: string) => void;

export interface VoiceSession {
	endpoint: AudioEndpoint;
	active: boolean;
	start(): Promise<void>;
	stop(): void;
}

export function createVoiceSession(
	endpoint: AudioEndpoint,
	whisper: WhisperAdapter,
	orchestrator: RequestOrchestrator,
	onState: StateListener = () => undefined,
): VoiceSession {
	let active = false;

	const capture = async (seconds: number): Promise<string> => {
		const directory = await mkdtemp(join(tmpdir(), 'humphrey-mic-'));
		const audioFile = join(directory, 'capture.wav');
		try {
			await execFileAsync('arecord', ['-D', endpoint.inputDevice, '-f', 'S16_LE', '-r', '16000', '-c', '1', '-d', String(seconds), audioFile]);
			return await whisper.transcribe(audioFile);
		} finally {
			await rm(directory, { recursive: true, force: true });
		}
	};

	const run = async (): Promise<void> => {
		while (active) {
			const activation = await capture(2);
			if (!whisper.isActivationPhrase(activation)) continue;
			onState('activated', 'Activation phrase heard');
			onState('listening', 'Listening');
			const requestText = await capture(8);
			if (!requestText.trim()) {
				onState('idle', 'Ready');
				continue;
			}
			await orchestrator.process(requestText, endpoint);
			onState('idle', 'Ready');
		}
	};

	return {
		endpoint,
		get active() { return active; },
		async start() {
			if (active) return;
			active = true;
			onState('idle', 'Ready');
			await run();
		},
		stop() { active = false; }
	};
}
