# Humphrey

Humphrey is a local-first voice home automation service for Linux Mint. It uses Home
Assistant for local device control, Ollama for local language-model interpretation,
`whisper.cpp` for local speech recognition, and Piper for local text-to-speech.

The service is designed to operate on the local machine and local network. Optional
external integrations are disabled by default and must be enabled individually.

## Requirements

- Linux Mint on the local machine
- Node.js 22 LTS or a newer supported LTS
- npm
- Home Assistant reachable on the local network
- A Home Assistant long-lived access token
- Ollama installed locally with the selected model downloaded
- `whisper.cpp` built locally with a Whisper model
- Piper installed locally with a voice model
- A microphone and speaker configured as a local ALSA input/output pair

Raw microphone audio is not stored. Credentials must remain in environment variables
or local configuration that is excluded from source control.

## Install Dependencies

### Node.js

Install Node.js 22 LTS using the preferred Linux Mint or NodeSource installation method.
Verify the installation:

```bash
node --version
npm --version
```

### Ollama

Install Ollama locally:

```bash
curl -fsSL https://ollama.com/install.sh | sh
sudo systemctl enable --now ollama
ollama pull llama3.2
```

Verify the local API:

```bash
ollama list
curl http://127.0.0.1:11434/api/version
```

If systemd is unavailable, start Ollama manually with `ollama serve`.

### whisper.cpp

Build `whisper.cpp` locally and download a model. The exact model size depends on the
machine's CPU and memory. A small or base English model is a reasonable starting point.
The resulting executable and model path must be configured in `config/local.config.json`.

The service expects a command equivalent to:

```text
whisper-cli -m ./models/ggml-base.en.bin -f <audio-file>
```

### Piper

Install Piper locally and download a compatible voice model. Store the executable and
model on the Linux Mint machine. Configure both paths in `config/local.config.json`.

## Configure Humphrey

Install the Node dependencies and create local configuration:

```bash
npm install
cp config/example.config.json config/local.config.json
```

Edit `config/local.config.json` and set:

- Home Assistant URL
- Ollama URL and model
- ALSA microphone and speaker names
- `whisper.cpp` executable and model paths
- Piper executable and voice model path
- Home Assistant devices and their allowlisted services
- Request-history mode and retention settings

Request history supports:

- `normalized_only`
- `redacted_transcript`
- `full_transcript` (default)

Request history is local and deleted after 30 days. Raw audio and credentials are never
stored.

Set the Home Assistant token without placing it in source control:

```bash
export HUMPHREY_HOME_ASSISTANT_TOKEN='your-local-home-assistant-token'
```

For a persistent user-session configuration, place the export in the appropriate local
shell or service environment rather than committing it to the repository.

## Validate and Run

Run the build, tests, lint, and dependency audit:

```bash
npm run build
npm test
npm run lint
npm audit --omit=dev --audit-level=high
```

Start the local service:

```bash
npm run dev
```

The default local interface is:

```text
http://127.0.0.1:3100
```

Health and configuration checks:

```bash
curl http://127.0.0.1:3100/health
curl http://127.0.0.1:3100/api/config/public
```

The public configuration endpoint must not expose tokens, credential values, or secret
references.

## First Safe Test

1. Configure one Home Assistant light with an explicit `turn_on` allowlist.
2. Start Humphrey and verify `/health`.
3. Say `Hey Humphrey` or `Yo Humphrey`.
4. Submit a request ending in `please`.
5. Verify the action is sent only to the configured Home Assistant entity.
6. Submit the same request without `please`.
7. Verify no device action occurs and Humphrey asks for the magic word.
8. Verify the spoken response uses the local audio output associated with the request.

See [docs/setup.md](docs/setup.md) and the [feature quickstart](specs/001-local-home-automation/quickstart.md)
for the full setup and validation expectations.

## Privacy and Network Boundaries

- Core services communicate locally with Home Assistant, Ollama, `whisper.cpp`, and Piper.
- Optional external integrations are disabled by default.
- No cloud model, cloud speech service, or remote telemetry is required.
- Operational logs are redacted.
- Request history stays local and expires after 30 days.
- Speaker recognition, when enabled, is for personalization only and is not authentication.
- Do not commit `config/local.config.json`, tokens, model files, raw audio, or local logs.
