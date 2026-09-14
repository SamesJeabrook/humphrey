import { execFile, spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

function runPiper(executable: string, args: string[], text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const process = spawn(executable, args);
    let stderr = '';
    const timeout = setTimeout(() => {
      process.kill();
      reject(new Error('Piper timed out after 30 seconds'));
    }, 30_000);
    process.stderr.on('data', (chunk: Buffer) => { stderr += chunk.toString(); });
    process.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    process.on('close', (code) => {
      clearTimeout(timeout);
      if (code === 0) return resolve();
      reject(new Error(`Piper exited with code ${code}: ${stderr.trim()}`));
    });
    process.stdin.end(text);
  });
}

export class PiperTextToSpeechAdapter {
  constructor(private readonly executable: string, private readonly model: string) {}

  async speak(text: string, outputDevice: string): Promise<void> {
    const directory = await mkdtemp(join(tmpdir(), 'humphrey-tts-'));
    const outputFile = join(directory, 'response.wav');
    try {
      await runPiper(this.executable, ['--model', this.model, '--output_file', outputFile], text);
      await execFileAsync('aplay', ['-D', outputDevice, outputFile], { timeout: 30_000 });
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  }
}
