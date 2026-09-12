import { unlink } from 'node:fs/promises';

export async function cleanupTemporaryAudio(path: string): Promise<void> { await unlink(path).catch(() => undefined); }
