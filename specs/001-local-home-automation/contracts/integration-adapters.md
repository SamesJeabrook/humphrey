# Integration Adapter Contract

Each adapter is a small module behind the same lifecycle and policy boundary.

## Adapter operations

- `healthCheck()`: returns health and a redacted diagnostic reason.
- `discover()`: returns only configured or explicitly approved capabilities.
- `read(target, parameters)`: performs a read-only operation.
- `execute(target, action, parameters)`: performs an allowlisted side effect after the
  request pipeline has confirmed the final "please".
- `close()`: releases sockets, child processes, and file handles.

## Safety rules

- Adapters MUST receive validated intent objects, never raw model text.
- Adapters MUST reject disabled integrations and targets outside the network policy.
- Adapters MUST redact credentials and sensitive response fields before returning errors.
- Side-effecting operations MUST be idempotent where the upstream service permits it and
  MUST report whether execution started, completed, or was rejected.

## Initial adapters

- Home Assistant: local REST service calls and WebSocket state subscriptions.
- Ollama: local structured chat requests for interpretation and response generation.
- Whisper: local `whisper.cpp` process or local server for wake-word and request audio.
- Local media: read-only external-drive catalog plus playback handoff.
- Optional integrations: Spotify, Ring, Tado, weather, and web search, each disabled by
  default and enabled only through the network policy.
