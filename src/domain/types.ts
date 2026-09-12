export type HistoryMode = 'normalized_only' | 'redacted_transcript' | 'full_transcript';
export type SystemState = 'idle' | 'activated' | 'listening' | 'processing' | 'awaiting_confirmation' | 'executing' | 'completed' | 'failed' | 'unavailable';
export type RequestOutcome = 'success' | 'rejected' | 'unavailable' | 'failed';

export interface AudioEndpoint {
  id: string;
  inputDevice: string;
  outputDevice: string;
  fallbackOutput?: string;
  displayAvailable: boolean;
}

export interface DeviceEntity {
  entityId: string;
  displayName: string;
  domain: string;
  aliases: string[];
  allowedServices: string[];
  enabled: boolean;
}

export interface Intent {
  kind: 'device_action' | 'status_query' | 'media_action' | 'weather_query' | 'web_query' | 'help';
  target: string | null;
  action: string | null;
  parameters: Record<string, unknown>;
  requiresConfirmation: boolean;
  responseText: string;
  source: 'local' | 'approved-external';
}

export interface VoiceRequest {
  id: string;
  createdAt: string;
  transcript: string;
  intent: Intent | null;
  confirmation: 'missing' | 'present';
  state: SystemState;
  outcome: RequestOutcome | null;
  audioEndpoint: AudioEndpoint;
}

export interface RequestHistoryRecord {
  id: string;
  createdAt: string;
  requestText: string | null;
  normalizedIntent: string | null;
  personName: string | null;
  targetCapability: string | null;
  outcome: RequestOutcome;
  expiresAt: string;
}
