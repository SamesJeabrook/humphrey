import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export class WhisperAdapter {
  constructor(private readonly executable: string, private readonly model: string) {}

  async transcribe(audioFile: string): Promise<string> {
    const result = await execFileAsync(this.executable, ['-m', this.model, '-f', audioFile, '--no-timestamps'], { maxBuffer: 1024 * 1024, timeout: 60_000 });
    return result.stdout.trim();
  }

  isActivationPhrase(text: string): boolean {
    return /\bhum(?:phrey|phry|phree|phrie|phri|fry|free)\b/i.test(text);
  }
}
