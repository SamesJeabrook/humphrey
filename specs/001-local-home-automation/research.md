# Research: Local Home Automation Service

## Decision: Use a single TypeScript service on Node.js 22 LTS or newer supported LTS

**Rationale**: The constitution requires Node.js, and one process keeps local deployment,
configuration, logging, and network policy simple. TypeScript adds explicit contracts and
self-documenting types without introducing another runtime.

**Alternatives considered**: A multi-service architecture was rejected for the first
release because it adds deployment and secret boundaries. Plain JavaScript was rejected
because the system has several safety-sensitive integration contracts.

## Decision: Use Fastify with a vanilla browser UI and WebSocket state updates

**Rationale**: Fastify provides a small local HTTP server, while a browser UI satisfies
the dark theme and animated listening-state requirements without a second frontend build.
WebSocket events can update state without polling.

**Alternatives considered**: A larger frontend framework was deferred because the first
release has one local screen and does not need a separate client deployment.

## Decision: Use Home Assistant REST for commands and WebSocket for live state

**Rationale**: Home Assistant documents Bearer-token REST calls for health, states, and
service actions, and an authenticated `/api/websocket` protocol for subscriptions and
command results. REST calls will be restricted to configured entities and services;
WebSocket state events will drive the local UI and adapter health.

**Alternatives considered**: Direct device integrations were rejected as the default
because Home Assistant is the project’s explicit device boundary and already represents
lighting, heating, cameras, and media integrations.

## Decision: Use Ollama structured chat output for intent interpretation

**Rationale**: Ollama exposes a local `/api/chat` endpoint with non-streaming responses,
JSON schemas, and tool calls. Humphrey will request a narrow intent schema and validate
the response independently before any adapter can act.

**Alternatives considered**: Free-form model text was rejected because it is difficult to
validate safely. Cloud language-model APIs are prohibited by the constitution.

## Decision: Use whisper.cpp locally for speech recognition

**Rationale**: whisper.cpp supports Linux CPU inference, local model files, microphone
streaming examples, VAD, and a local server option. It avoids a Python runtime and keeps
audio processing inside the Linux machine. A short local capture pipeline will detect
"Hey Humphrey" or "Yo Humphrey", then transcribe the active request.

**Alternatives considered**: Python Whisper was rejected for the first release because it
adds a second runtime and a larger dependency surface. Cloud speech recognition is
prohibited.

## Decision: Use local JSON configuration and ephemeral request state

**Rationale**: The first release has one owner and does not require historical voice
storage or a database. A validated local configuration file plus environment variables
for secrets is sufficient. Raw audio and transcripts are discarded after processing.

**Alternatives considered**: SQLite is deferred until a concrete local history or device
metadata requirement exists.

## Decision: Use Piper for local text-to-speech

**Rationale**: Piper provides local text-to-speech inference with voice model files that
can remain on the Linux Mint machine. The service can render a response to local PCM or
WAV output and route it through the request's explicitly selected audio endpoint. This
keeps spoken responses independent of a browser or cloud speech service.

**Alternatives considered**: Cloud text-to-speech services are prohibited. A generic
operating-system speech command was not selected because its voice, availability, and
output behavior vary across Linux Mint installations.

## Decision: Pair audio devices through explicit local configuration

**Rationale**: Linux systems may expose multiple microphones and playback devices. The
owner will configure named input/output pairs using local ALSA device identifiers. The
service may enumerate devices for setup assistance, but it will not guess a pairing.
When the selected output disappears, a separately configured fallback output may be
used; otherwise the request fails safely and is recorded locally.

**Alternatives considered**: Matching devices by enumeration order, USB proximity, or
the default system device was rejected because those heuristics can route private
responses to the wrong room or terminal.

## Decision: Add local speaker recognition only for personalization

**Rationale**: A local speaker-embedding model can compare an enrolled voice with a
request and return a person name plus confidence score. Humphrey will use that result
to personalize spoken responses, while low-confidence results remain anonymous. Voice
profiles, embeddings, and recognition results stay local.

**Alternatives considered**: Cloud voice identification is prohibited. Using speaker
recognition as authentication or authorization is rejected because voice biometrics can
be spoofed and must not bypass the existing confirmation and safety pipeline.

## Decision: Retain configurable request history locally for 30 days

**Rationale**: A 30-day rolling window is long enough for household troubleshooting and
usage review while bounding privacy exposure and local storage. The owner can select
`normalized_only`, `redacted_transcript`, or `full_transcript`, with `full_transcript`
as the default. Raw audio, credentials, prompts, and full model output are excluded,
and a purge job plus manual deletion will enforce retention.

**Alternatives considered**: Indefinite retention was rejected because it creates
unbounded sensitive household history. Storing only counters was rejected because it
would not support reviewing what was requested.

## Decision: Treat optional external integrations as explicit opt-in adapters

**Rationale**: Spotify, Ring, Tado, weather, and web search may require external access.
Each adapter is disabled by default and must declare its destination, credentials, data
boundary, and retention behavior before activation. The network policy remains the
source of truth.

**Alternatives considered**: Enabling all configured services automatically was rejected
because it conflicts with the local-first constitution.

## Sources

- Home Assistant REST API: https://developers.home-assistant.io/docs/api/rest/
- Home Assistant WebSocket API: https://developers.home-assistant.io/docs/api/websocket/
- Ollama API: https://github.com/ollama/ollama/blob/main/docs/api.md
- whisper.cpp: https://github.com/ggml-org/whisper.cpp
