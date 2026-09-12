const root = document.querySelector<HTMLElement>('#app')!;
const status = document.querySelector<HTMLElement>('#status')!;
const form = document.querySelector<HTMLFormElement>('#request-form')!;
const input = document.querySelector<HTMLInputElement>('#text')!;
const events = new WebSocket(`ws://${location.host}/api/events`);
events.onmessage = (message) => { const event = JSON.parse(message.data) as { state: string; message: string }; root.dataset.state = event.state; status.textContent = event.message; };
form.addEventListener('submit', async (event) => { event.preventDefault(); const response = await fetch('/api/requests', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text: input.value }) }); const data = await response.json() as { message?: string; state?: string }; status.textContent = data.message ?? data.state ?? 'Request submitted'; input.value = ''; });
