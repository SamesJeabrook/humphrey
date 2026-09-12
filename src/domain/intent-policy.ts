import type { DeviceEntity, Intent } from './types.js';

export function resolveDevice(devices: DeviceEntity[], target: string): DeviceEntity {
  const normalized = target.trim().toLowerCase();
  const device = devices.find((item) => item.enabled && (item.entityId.toLowerCase() === normalized || item.displayName.toLowerCase() === normalized || item.aliases.some((alias) => alias.toLowerCase() === normalized)));
  if (!device) throw new Error(`Unknown or disabled device: ${target}`);
  return device;
}

export function validateIntent(intent: Intent, devices: DeviceEntity[]): Intent {
  if (!intent.responseText || intent.responseText.length > 1000) throw new Error('Intent response is invalid');
  if (intent.kind === 'device_action') {
    if (!intent.target || !intent.action) throw new Error('Device intent requires a target and action');
    const device = resolveDevice(devices, intent.target);
    if (!device.allowedServices.includes(intent.action)) throw new Error(`Action is not allowlisted: ${intent.action}`);
    return { ...intent, target: device.entityId, requiresConfirmation: true };
  }
  return intent;
}

export function hasPlease(transcript: string): boolean { return /\bplease\s*[.!?]?\s*$/i.test(transcript.trim()); }
