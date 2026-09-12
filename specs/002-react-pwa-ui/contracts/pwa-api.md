# PWA Client Contract

The PWA is a local-network client of the existing Node.js service.

## HTTP client operations

- `GET /health`: show dependency availability without exposing secrets.
- `GET /api/config/public`: load activation phrases, visual settings, enabled capability names, and history mode.
- `POST /api/requests`: submit text through the service boundary; the client must not perform actions directly.
- `GET /api/request-history`: load history fields allowed by the configured mode.
- `DELETE /api/request-history`: send only after explicit owner confirmation.

The client must treat API errors and unavailable responses as visible connection states,
not as empty successful results.

## WebSocket client operations

Connect to `/api/events` and accept `system_state` events containing state, message,
request identifier, and optional event sequence. Ignore an event with a sequence older
than the last accepted event. Reconnect with bounded backoff and do not resubmit the
last request automatically after reconnecting.

## Cache policy

The service worker may precache the static application shell and public static assets.
It must use a network-only policy for `/health`, `/api/**`, WebSocket connections, and
any request containing private or live data. No API response may be written to the
Cache Storage API or IndexedDB.
