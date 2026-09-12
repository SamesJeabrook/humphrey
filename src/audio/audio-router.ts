import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type { AudioEndpoint } from '../domain/types.js';

const execFileAsync = promisify(execFile);

export async function listAudioDevices(): Promise<{ inputs: string[]; outputs: string[] }> {
  if (process.platform !== 'linux') return { inputs: [], outputs: [] };
  const [inputs, outputs] = await Promise.all([
    execFileAsync('arecord', ['-L']).then((result) => result.stdout.split('\n').filter(Boolean)),
    execFileAsync('aplay', ['-L']).then((result) => result.stdout.split('\n').filter(Boolean))
  ]);
  return { inputs, outputs };
}

export async function assertEndpoint(endpoint: AudioEndpoint): Promise<void> {
  if (!endpoint.inputDevice || !endpoint.outputDevice) throw new Error('Audio endpoint requires explicit input and output devices');
}
