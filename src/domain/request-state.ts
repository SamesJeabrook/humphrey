import type { SystemState } from './types.js';

const transitions: Record<SystemState, SystemState[]> = {
  idle: ['activated'], activated: ['listening', 'failed', 'unavailable'], listening: ['processing', 'failed', 'unavailable'],
  processing: ['awaiting_confirmation', 'executing', 'failed', 'unavailable'], awaiting_confirmation: ['listening', 'executing', 'failed'],
  executing: ['completed', 'failed', 'unavailable'], completed: ['idle'], failed: ['idle'], unavailable: ['idle']
};

export function assertTransition(from: SystemState, to: SystemState): void {
  if (!transitions[from].includes(to)) throw new Error(`Invalid request state transition: ${from} -> ${to}`);
}

export class SideEffectLock {
  private locked = false;
  async run<T>(operation: () => Promise<T>): Promise<T> {
    if (this.locked) throw new Error('Another side-effecting request is already executing');
    this.locked = true;
    try { return await operation(); } finally { this.locked = false; }
  }
}
