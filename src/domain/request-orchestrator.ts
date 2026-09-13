import { randomUUID } from 'node:crypto';
import type { AudioEndpoint, DeviceEntity, Intent, SystemState, VoiceRequest } from './types.js';
import { hasPlease, validateIntent, resolveDevice } from './intent-policy.js';
import { assertTransition, SideEffectLock } from './request-state.js';
import { HomeAssistantAdapter } from '../adapters/home-assistant.js';
import { OllamaAdapter } from '../adapters/ollama.js';
import { PiperTextToSpeechAdapter } from '../adapters/text-to-speech.js';

export interface RequestResult { request: VoiceRequest; message: string; }

export class RequestOrchestrator {
  private readonly sideEffects = new SideEffectLock();
  constructor(private readonly devices: DeviceEntity[], private readonly homeAssistant: HomeAssistantAdapter, private readonly ollama: OllamaAdapter, private readonly speech: PiperTextToSpeechAdapter) {}

  async process(transcript: string, audioEndpoint: AudioEndpoint): Promise<RequestResult> {
    const request: VoiceRequest = { id: randomUUID(), createdAt: new Date().toISOString(), transcript, intent: null, confirmation: hasPlease(transcript) ? 'present' : 'missing', state: 'idle', outcome: null, audioEndpoint };
    this.transition(request, 'activated');
    this.transition(request, 'listening');
    this.transition(request, 'processing');
    let intent: Intent;
    try {
      intent = validateIntent(await this.ollama.interpret(transcript), this.devices);
    } catch (error) {
      request.outcome = 'rejected';
      this.transition(request, 'failed');
      return { request, message: error instanceof Error ? error.message : 'Request was rejected.' };
    }
    request.intent = intent;
    if (intent.requiresConfirmation && request.confirmation !== 'present') {
      this.transition(request, 'awaiting_confirmation');
      await this.speech.speak("What's the magic word?", audioEndpoint.outputDevice);
      return { request, message: "What's the magic word?" };
    }
    try {
      await this.sideEffects.run(async () => {
        this.transition(request, 'executing');
        if (intent.kind === 'device_action' && intent.target && intent.action) await this.homeAssistant.callService(resolveDevice(this.devices, intent.target), intent.action, intent.parameters);
      });
      await this.speech.speak(intent.responseText, audioEndpoint.outputDevice);
      request.outcome = 'success';
      this.transition(request, 'completed');
      return { request, message: intent.responseText };
    } catch (error) {
      request.outcome = 'failed';
      this.transition(request, 'failed');
      const message = error instanceof Error ? error.message : 'The request failed.';
      await this.speech.speak(message, audioEndpoint.outputDevice).catch(() => undefined);
      return { request, message };
    }
  }

  private transition(request: VoiceRequest, next: SystemState): void { assertTransition(request.state, next); request.state = next; }
}
