import { useConnectionState } from '../hooks/useConnectionState';
import { ConnectionStatus } from '../components/ConnectionStatus';
import { ServiceStatePanel } from '../components/ServiceStatePanel';
import styles from './AppShell.module.css';
export function AppShell() { const { connection, state } = useConnectionState(); return <main className={styles.shell}><header><div><p className={styles.eyebrow}>LOCAL HOME ASSISTANT</p><h1>Humphrey</h1></div><ConnectionStatus connection={connection}/></header><ServiceStatePanel state={state}/></main>; }
