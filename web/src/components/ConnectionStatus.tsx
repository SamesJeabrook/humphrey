import type { ConnectionState } from '../types/contracts';
import styles from './ConnectionStatus.module.css';
export function ConnectionStatus({ connection }: { connection: ConnectionState }) { const label = connection.events === 'connected' ? 'Connected' : connection.events === 'reconnecting' ? 'Reconnecting' : 'Disconnected'; return <p className={styles.status} role="status">{label}</p>; }
