# HTTP and WebSocket Contract

The service binds to the local machine by default. Authentication for the local UI is
out of scope for the first household-only release; deployment MUST restrict access to
the trusted local network or loopback interface.

## HTTP endpoints

### `GET /health`

Returns dependency health without secret values.

```json
{
  "status": "ok",
  "dependencies": {
    "homeAssistant": "healthy",
    "ollama": "healthy",
    "whisper": "healthy"
  }
}
```

### `GET /api/config/public`

Returns non-secret UI configuration: enabled capability names, activation phrases, and
visual theme values. It MUST never return endpoints, tokens, credential references, or
raw network policy details.

### `POST /api/requests`

Accepts a local UI request for testing or accessibility fallback. The body is a validated
request envelope and MUST NOT bypass activation, confirmation, or intent policy checks.

```json
{
  "text": "turn on the living room light please"
}
```

Returns `202 Accepted` with a request identifier and current state.

### `GET /api/requests/:id`

Returns redacted request state and user-facing outcome. It MUST omit transcript, prompt,
credentials, raw model output, and internal stack traces.

### `GET /api/request-history`

Returns locally stored request-history records according to the configured history mode.
The response MUST exclude raw audio, credentials, prompts, and full model output.

### `DELETE /api/request-history`

Deletes all local request-history records after explicit owner confirmation. It MUST
not delete configuration, speaker profiles, or unrelated operational diagnostics.

## WebSocket `/api/events`

The server sends state updates to the browser:

```json
{
  "type": "system_state",
  "requestId": "req_123",
  "state": "listening",
  "message": "Listening"
}
```

Allowed state values are `idle`, `activated`, `listening`, `processing`,
`awaiting_confirmation`, `executing`, `completed`, `failed`, and `unavailable`.

The browser may send `ui_ready` and `cancel_request`. Cancellation MUST be safe and
MUST NOT interrupt a Home Assistant service call after execution has begun. Browser
events are supplemental; the audio endpoint remains authoritative for spoken output.

## Audio response contract

Every request response has an associated local audio endpoint. The service MUST send
spoken confirmations, prompts, errors, and unavailable-service messages to that
endpoint even when no browser is connected. The browser may mirror the state but MUST
NOT be the only response path.
