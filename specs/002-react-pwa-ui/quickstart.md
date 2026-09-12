# Quickstart Validation Guide

## Prerequisites

- Node.js 22 LTS and npm installed.
- Humphrey local Node.js service running on Linux Mint.
- The local service exposes `/health`, `/api/config/public`, `/api/requests`,
  `/api/request-history`, and `/api/events`.
- A supported browser with service-worker and PWA installation support.

## Development

From the repository root:

```bash
npm install
npm run build
npm test
npm run dev
```

The PWA development workflow may use a Vite development server, but production output
must be served from the existing local Node.js service.

## Validation scenarios

### Live state

1. Open the local PWA.
2. Verify it shows idle until a state event arrives.
3. Simulate activated, listening, processing, awaiting confirmation, completed, failed,
   and unavailable events.
4. Verify each state has a distinct accessible label and listening uses orange feedback.

### Request and history

1. Submit a valid text request through the PWA.
2. Verify the request reaches only the local Node.js API.
3. Open history and verify fields match the configured history mode.
4. Confirm deletion explicitly and verify history is empty while configuration remains.

### PWA privacy and offline behavior

1. Install the PWA from the local service.
2. Inspect the service worker cache and verify it contains only static application assets.
3. Confirm no transcript, history record, credential, device state, API response, or model
   output is cached.
4. Disconnect the local service and reopen the PWA.
5. Verify only the shell loads and the UI clearly says live data is unavailable.
6. Verify the backend continues voice-only operation without the browser.

### Responsive behavior

Verify request submission, state display, connection status, and history review at
mobile, tablet, and desktop viewport sizes without clipping or overlapping controls.
