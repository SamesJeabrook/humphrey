const root = document.querySelector('#app');
const status = document.querySelector('#status');
const form = document.querySelector('#request-form');
const input = document.querySelector('#text');
const events = new WebSocket(`ws://${location.host}/api/events`);
events.onmessage = (message) => { const event = JSON.parse(message.data); root.dataset.state = event.state; status.textContent = event.message; };
form.addEventListener('submit', async (event) => { event.preventDefault(); const response = await fetch('/api/requests', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text: input.value }) }); const data = await response.json(); status.textContent = data.message || data.state || 'Request submitted'; input.value = ''; });
