# Local Services Readiness Checklist

Use this guide before debugging Humphrey. Each dependency should work independently
before the services are connected together.

## 1. Home Assistant

Start Home Assistant from its own directory, where `compose.yml` is beside `config/`:

```bash
cd ~/homeassistant
docker compose up -d
docker compose ps
```

Open the Home Assistant web interface:

```text
http://localhost:8123
```

Complete the first-run owner setup, then add at least one safe light or switch under
**Settings -> Devices & services**.

Create a long-lived access token from the Home Assistant user profile. Store it only
in the ignored `.env` file. From the Humphrey repository root:

```bash
cp .env.example .env
# Edit .env and replace PASTE_YOUR_HOME_ASSISTANT_TOKEN_HERE with your token.
```

Verify the API:

```bash
curl \
  -H "Authorization: Bearer $HUMPHREY_HOME_ASSISTANT_TOKEN" \
  http://127.0.0.1:8123/api/
```

Expected result:

```json
{ "message": "API running." }
```

Find and record one safe entity ID, for example `light.living_room`:

```bash
curl \
  -H "Authorization: Bearer $HUMPHREY_HOME_ASSISTANT_TOKEN" \
  http://127.0.0.1:8123/api/states
```

Test only the selected safe device:

```bash
curl -X POST \
  -H "Authorization: Bearer $HUMPHREY_HOME_ASSISTANT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"entity_id":"light.living_room"}' \
  http://127.0.0.1:8123/api/services/light/turn_on
```

Do not expose Home Assistant port `8123` to the internet.

## 2. Ollama

Start Ollama locally:

```bash
sudo systemctl enable --now ollama
```

If systemd is unavailable:

```bash
ollama serve
```

Download the configured model:

```bash
ollama pull llama3.2
```

Verify the service and model:

```bash
curl http://127.0.0.1:11434/api/version
ollama list
```

Test a local response:

```bash
ollama run llama3.2
```

Exit the interactive prompt with `Ctrl+D`.

## 3. whisper.cpp

From the `whisper.cpp` directory, verify the executable and model:

```bash
ls -l ./build/bin/whisper-cli
ls -lh ./models/ggml-base.en.bin
```

Record a known microphone sample:

```bash
arecord -D default -f S16_LE -r 16000 -c 1 -d 10 /tmp/humphrey-test.wav
```

Play it back before transcribing:

```bash
aplay /tmp/humphrey-test.wav
```

Transcribe the exact recording:

```bash
./build/bin/whisper-cli \
  -m ./models/ggml-base.en.bin \
  -f /tmp/humphrey-test.wav \
  -l en \
  -nt
```

If playback is clear but transcription is inaccurate, try `small.en`. If playback is
wrong or silent, fix the ALSA/PipeWire microphone selection before changing models.

`whisper-stream` is a diagnostic tool and continuously transcribes microphone input.
It does not by itself invoke Ollama, Home Assistant, Piper, or Humphrey's wake-word
pipeline.

## 4. Piper

Install Piper in a dedicated user virtual environment, outside the Humphrey repository:

```bash
sudo apt install -y python3-venv
python3 -m venv ~/.local/share/humphrey/piper-venv
~/.local/share/humphrey/piper-venv/bin/pip install --upgrade pip piper-tts
mkdir -p ~/humphrey-models/piper
cd ~/humphrey-models/piper
~/.local/share/humphrey/piper-venv/bin/python -m piper.download_voices en_US-lessac-medium
```

Find the Piper executable and local voice model:

```bash
ls -l ~/.local/share/humphrey/piper-venv/bin/piper
ls -lh ~/humphrey-models/piper/en_US-lessac-medium.onnx
```

Generate a test WAV:

```bash
echo "Hello, this is Humphrey speaking." | \
  ~/.local/share/humphrey/piper-venv/bin/piper \
  --model ~/humphrey-models/piper/en_US-lessac-medium.onnx \
  --output_file /tmp/humphrey-response.wav
```

Play it:

```bash
aplay /tmp/humphrey-response.wav
```

Set `audio.piperExecutable` and `audio.piperModel` in `config/local.config.json` to
these absolute paths. If this fails, fix Piper and speaker output before connecting it
to the Node service.

## 5. Humphrey configuration

From the repository root:

```bash
cp config/example.config.json config/local.config.json
```

Edit `config/local.config.json` with:

- Home Assistant URL
- `HUMPHREY_HOME_ASSISTANT_TOKEN` as the `tokenEnv` value; this is the variable name,
  not the token itself
- Ollama model
- Whisper executable and model paths
- Piper executable and model paths
- Explicit ALSA input and output devices
- One safe Home Assistant device and allowlisted services

In other words, the configuration should contain the name only:

```json
"homeAssistant": {
  "baseUrl": "http://127.0.0.1:8123",
  "tokenEnv": "HUMPHREY_HOME_ASSISTANT_TOKEN"
}
```

The secret value belongs after the `=` in `.env`. Do not paste the secret into
`tokenEnv`, commit `.env` or `config/local.config.json`, or include it in logs. An
`export HUMPHREY_HOME_ASSISTANT_TOKEN=...` command can still be used to override the
`.env` value for a one-off session.

Then validate the service:

```bash
npm install
npm run build
npm test
npm run lint
npm run dev
```

In another terminal:

```bash
curl http://127.0.0.1:3100/health
curl http://127.0.0.1:3100/api/config/public
```

The public configuration response must not contain the Home Assistant token or any
credential value.

## Readiness order

Proceed in this order:

1. Home Assistant web interface and API
2. One safe Home Assistant device action
3. Ollama API and selected model
4. Microphone recording and playback
5. Whisper transcription of the recorded file
6. Piper speech generation and speaker playback
7. Humphrey build, tests, configuration, and health endpoint
8. Full Whisper -> Ollama -> validation -> Home Assistant -> Piper flow

If a stage fails, debug that stage independently before continuing. This prevents
microphone, model, network, and audio-output problems from being mistaken for one
another.
