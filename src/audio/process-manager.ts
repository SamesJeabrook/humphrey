import { spawn, type ChildProcess } from 'node:child_process';

export function startLocalProcess(command: string, args: string[]): ChildProcess {
  const child = spawn(command, args, { stdio: ['pipe', 'pipe', 'pipe'] });
  child.stderr.on('data', () => undefined);
  return child;
}
