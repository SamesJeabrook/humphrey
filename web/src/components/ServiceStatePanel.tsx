import type { VisualServiceState } from '../types/contracts';
import styles from './ServiceStatePanel.module.css';
export function ServiceStatePanel({ state }: { state: VisualServiceState }) { return <section className={`${styles.panel} ${styles[state.state]}`} aria-live="polite"><div className={styles.orb} aria-hidden="true"/><p className={styles.state}>{state.state.replace('_', ' ')}</p><p className={styles.message}>{state.message}</p></section>; }
