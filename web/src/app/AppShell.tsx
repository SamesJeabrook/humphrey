import { useState } from 'react';
import { useConnectionState } from '../hooks/useConnectionState';
import { ConnectionStatus } from '../components/ConnectionStatus';
import { ServiceStatePanel } from '../components/ServiceStatePanel';
import { api } from '../services/humphrey-api';
import styles from './AppShell.module.css';

export function AppShell() {
	const { connection, state } = useConnectionState();
	const [active, setActive] = useState(false);
	const [command, setCommand] = useState('');
	const [response, setResponse] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);

	async function submitCommand(event: React.FormEvent<HTMLFormElement>): Promise<void> {
		event.preventDefault();
		if (!command.trim() || submitting) return;
		setSubmitting(true);
		setResponse(null);
		try {
			const result = await api.submit(command.trim());
			setResponse(result.message);
			setCommand('');
		} catch (error) {
			setResponse(error instanceof Error ? error.message : 'The local request failed.');
		} finally {
			setSubmitting(false);
		}
	}

	return <main className={styles.shell}>
		<header><div><p className={styles.eyebrow}>LOCAL HOME ASSISTANT</p><h1>Humphrey</h1></div><ConnectionStatus connection={connection}/></header>
		<ServiceStatePanel state={state}/>
		<section className={styles.testPanel} aria-labelledby="test-heading">
			<div className={styles.testHeader}>
				<div><p className={styles.eyebrow}>LOCAL TEST MODE</p><h2 id="test-heading">Try a command</h2></div>
				<button type="button" className={styles.activateButton} onClick={() => setActive(true)} disabled={active}>Activate Humphrey</button>
			</div>
			{active && <form className={styles.commandForm} onSubmit={submitCommand}>
				<label htmlFor="command">Command</label>
				<div className={styles.commandRow}>
					<input id="command" value={command} onChange={(event) => setCommand(event.target.value)} placeholder="Turn on the living room light please" autoFocus />
					<button type="submit" disabled={!command.trim() || submitting}>{submitting ? 'Sending...' : 'Send'}</button>
				</div>
				{response && <p className={styles.response} role="status">{response}</p>}
			</form>}
		</section>
	</main>;
}
