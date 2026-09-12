import { execFile } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export class PiperTextToSpeechAdapter {
  constructor(private readonly executable: string, private readonly model: string) {}

  async speak(text: string, outputDevice: string): Promise<void> {
    const directory = await mkdtemp(join(tmpdir(), 'humphrey-tts-'));
    const outputFile = join(directory, 'response.wav');
    try {
      await execFileAsync(this.executable, ['--model', this.model, '--output_file', outputFile], { input: text } as never);
      await execFileAsync('aplay', ['-D', outputDevice, outputFile]);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  }
}
