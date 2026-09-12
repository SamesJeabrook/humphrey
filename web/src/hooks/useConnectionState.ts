import { useEffect, useState } from 'react';
import type { ConnectionState, VisualServiceState } from '../types/contracts';
import { connectStateEvents } from '../services/state-events';
export function useConnectionState() { const [connection, setConnection] = useState<ConnectionState>({ service: 'connected', events: 'disconnected', lastSequence: -1 }); const [state, setState] = useState<VisualServiceState>({ state: 'idle', message: 'Ready' }); useEffect(() => connectStateEvents((next) => setState(next), (events) => setConnection((current) => ({ ...current, events }))), []); return { connection, state }; }
