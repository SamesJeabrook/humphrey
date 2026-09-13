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

Install Piper in a dedicated user virtual environment on the Linux Mint machine. Do
not install it inside the Humphrey repository:

```bash
sudo apt install -y python3-venv
python3 -m venv ~/.local/share/humphrey/piper-venv
~/.local/share/humphrey/piper-venv/bin/pip install --upgrade pip piper-tts
mkdir -p ~/humphrey-models/piper
cd ~/humphrey-models/piper
~/.local/share/humphrey/piper-venv/bin/python -m piper.download_voices en_US-lessac-medium
```

Verify the executable and generate a test WAV:

```bash
~/.local/share/humphrey/piper-venv/bin/piper \
	--model ~/humphrey-models/piper/en_US-lessac-medium.onnx \
	--output_file /tmp/humphrey-piper-test.wav \
	<<< "Hello, this is Humphrey."
aplay /tmp/humphrey-piper-test.wav
```

Set these absolute paths in `config/local.config.json`:

```json
"piperExecutable": "/home/YOUR_USERNAME/.local/share/humphrey/piper-venv/bin/piper",
"piperModel": "/home/YOUR_USERNAME/humphrey-models/piper/en_US-lessac-medium.onnx"
```

Replace `YOUR_USERNAME` with the Linux username that runs Humphrey. Keep the model
outside Git because voice models are large binary files.

## Configure Humphrey

Install the Node dependencies and create local configuration:

```bash
npm install
npm install --prefix web
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
cp .env.example .env
# Edit .env and replace PASTE_YOUR_HOME_ASSISTANT_TOKEN_HERE with your token.
```

`homeAssistant.tokenEnv` in `config/local.config.json` should contain only the name
`HUMPHREY_HOME_ASSISTANT_TOKEN`, not the token itself. Humphrey loads the token from
the ignored `.env` file when it starts. For one-off shell sessions, an `export`
command also works.

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

The default local dashboard is:

```text
http://127.0.0.1:3100
```

The dashboard is built from the separate React application in `web/`. `npm run build`
builds the web app into `web/dist` and then builds the backend. Run it once before
opening the dashboard. If `web/dist` does not exist, the backend health routes still
work, but opening `/` returns a JSON 404 because there is no web interface to serve.

For frontend-only development, run the Vite server from the `web/` directory:

```bash
cd web
npm run dev
```

That exposes the development UI at the URL Vite prints, normally
`http://localhost:5173`. The integrated dashboard at port `3100` is the normal runtime
path.

To test commands without relying on the microphone, open the integrated dashboard and
click **Activate Humphrey**. Enter a command in the test field and click **Send**. The
request goes through the normal local Ollama, intent-policy, Home Assistant, and Piper
path. Device actions still require the final word `please` and the configured device
allowlist. This button is a text test control; it does not use browser speech
recognition or replace the local microphone wake-word listener.

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

See [docs/setup.md](docs/setup.md), the [local services readiness checklist](docs/local-services-readiness.md),
the [troubleshooting guide](docs/troubleshooting.md), and the [feature quickstart](specs/001-local-home-automation/quickstart.md)
for the full setup and validation expectations.

## Privacy and Network Boundaries

- Core services communicate locally with Home Assistant, Ollama, `whisper.cpp`, and Piper.
- Optional external integrations are disabled by default.
- No cloud model, cloud speech service, or remote telemetry is required.
- Operational logs are redacted.
- Request history stays local and expires after 30 days.
- Speaker recognition, when enabled, is for personalization only and is not authentication.
- Do not commit `config/local.config.json`, tokens, model files, raw audio, or local logs.
