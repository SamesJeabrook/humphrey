export type ServiceState = 'idle' | 'activated' | 'listening' | 'processing' | 'awaiting_confirmation' | 'executing' | 'completed' | 'failed' | 'unavailable';
export type HistoryMode = 'normalized_only' | 'redacted_transcript' | 'full_transcript';
export interface VisualServiceState { state: ServiceState; message: string; requestId?: string; receivedAt?: string; sequence?: number; }
export interface ConnectionState { service: 'connected' | 'disconnected' | 'unavailable'; events: 'connected' | 'reconnecting' | 'disconnected'; lastSequence: number; }
export interface HistoryViewRecord { id: string; createdAt: string; requestText: string | null; normalizedIntent: string | null; personName: string | null; targetCapability: string | null; outcome: 'success' | 'rejected' | 'unavailable' | 'failed'; expiresAt: string; }
export interface PublicConfig { activationPhrases: string[]; historyMode: HistoryMode; retentionDays: number; integrations: string[]; }
export interface RequestResponse { requestId: string; state: ServiceState; outcome: string | null; message: string; transcript?: string; }
