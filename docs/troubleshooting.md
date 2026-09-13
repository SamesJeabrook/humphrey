# Humphrey Troubleshooting

Use this guide to isolate failures one dependency at a time. Do not debug the full
voice pipeline until the individual local services work independently.

## Diagnostic order

1. Linux microphone records your voice.
2. The recorded WAV plays back clearly.
3. Whisper transcribes that WAV accurately.
4. Ollama responds locally.
5. Home Assistant API responds and can control one safe device.
6. Piper generates a WAV.
7. The WAV plays through the intended speaker.
8. Humphrey connects the stages together.

## Whisper prints unrelated or inaccurate text

To test the microphone through the dashboard, open `http://127.0.0.1:3100`, click
**Activate Humphrey**, allow microphone access, speak clearly, and click **Stop and
process**. The **Whisper heard** panel shows the exact transcript returned by the local
Whisper command. If it is wrong, compare it with the direct `arecord` test below.

`whisper-stream` continuously transcribes whatever reaches its selected capture device.
It can hallucinate text from silence, room noise, music, or speaker feedback.

Humphrey's current voice session does not use `whisper-stream`. It repeatedly records a
short WAV with `arecord`, sends that file to `whisper-cli`, and deletes the temporary
file. Reproduce that exact capture path manually before debugging Whisper itself.

Watch the microphone level without saving audio:

```bash
arecord -D default -f S16_LE -r 16000 -c 1 -vv /dev/null
```

Speak normally. The capture meter should move clearly when you speak and remain near
silence when you stop. Stop it with `Ctrl+C`.

Capture one activation window using the same settings as Humphrey:

```bash
arecord \
  -D default \
  -f S16_LE \
  -r 16000 \
  -c 1 \
  -d 2 \
  /tmp/humphrey-activation.wav
```

Listen to exactly what Whisper receives:

```bash
aplay /tmp/humphrey-activation.wav
```

Then transcribe that exact file:

```bash
whisper-cli \
  -m /path/to/ggml-base.en.bin \
  -f /tmp/humphrey-activation.wav \
  -l en \
  -nt
```

If the playback is quiet, distorted, or contains the wrong microphone, fix the audio
device/profile first. If playback is clear but this file transcription is wrong, fix
the Whisper model or language settings. If both are correct but Humphrey misses the
phrase, the 2-second window boundary is likely cutting off the activation phrase.

First record a known sample:

```bash
arecord -D default -f S16_LE -r 16000 -c 1 -d 10 /tmp/humphrey-test.wav
```

Play the recording:

```bash
aplay /tmp/humphrey-test.wav
```

If playback is wrong or silent, fix the microphone selection before changing Whisper.
Check available devices:

```bash
arecord -l
arecord -L
```

Then transcribe the exact file:

```bash
./build/bin/whisper-cli \
  -m ./models/ggml-base.en.bin \
  -f /tmp/humphrey-test.wav \
  -l en \
  -nt
```

If the WAV is clear but the result is inaccurate, try `small.en`:

```bash
./models/download-ggml-model.sh small.en
./build/bin/whisper-cli \
  -m ./models/ggml-small.en.bin \
  -f /tmp/humphrey-test.wav \
  -l en \
  -nt
```

While testing streaming:

- Use headphones or mute speakers.
- Stop Piper output temporarily.
- Keep the microphone close to the speaker.
- Stop music, television, fans, and other background noise.
- Check `whisper-stream -h` for capture-device and VAD options.

## `whisper-stream` cannot find or open the microphone

Confirm the executable exists from inside the `whisper.cpp` directory:

```bash
pwd
ls -l ./build/bin/whisper-stream
```

Install ALSA tools if needed:

```bash
sudo apt install alsa-utils
```

List capture devices:

```bash
arecord -l
```

Try the exact ALSA device shown by `arecord -l`, for example `hw:1,0`:

```bash
arecord -D hw:1,0 -f S16_LE -r 16000 -c 1 -d 5 /tmp/mic.wav
```

Use `pavucontrol` to inspect PipeWire/PulseAudio input levels:

```bash
sudo apt install pavucontrol
pavucontrol
```

## Whisper build cannot find SDL2

Install the development package:

```bash
sudo apt update
sudo apt install -y libsdl2-dev pkg-config
```

Rebuild from the `whisper.cpp` directory:

```bash
rm -rf build
cmake -S . -B build -DWHISPER_SDL2=ON
cmake --build build --config Release -j"$(nproc)"
```

For WAV-file transcription, SDL2 is not required:

```bash
rm -rf build
cmake -S . -B build
cmake --build build --config Release -j"$(nproc)"
```

## Piper produces no sound

Test Piper independently of Humphrey:

```bash
echo "Hello, this is Humphrey speaking." | \
  piper \
  --model /path/to/voice-model.onnx \
  --output_file /tmp/humphrey-response.wav
```

Play the result:

```bash
aplay /tmp/humphrey-response.wav
```

Check the executable and output devices:

```bash
which piper
aplay -l
```

If the WAV exists but is silent, the issue is the speaker/output device, not Humphrey.

## Ollama does not respond

Check that it is running:

```bash
curl http://127.0.0.1:11434/api/version
ollama list
```

Start it if necessary:

```bash
sudo systemctl enable --now ollama
```

Download the configured model:

```bash
ollama pull llama3.2
```

Test it:

```bash
ollama run llama3.2
```

Humphrey expects Ollama at `http://127.0.0.1:11434` unless
`config/local.config.json` says otherwise.

## Home Assistant API fails

Check the container:

```bash
cd ~/homeassistant
docker compose ps
docker compose logs --tail=100 homeassistant
```

Verify the web interface:

```text
http://localhost:8123
```

Verify the API token without printing it:

```bash
if [ -n "$HUMPHREY_HOME_ASSISTANT_TOKEN" ]; then
  echo "Home Assistant token is set"
else
  echo "Home Assistant token is missing"
fi
```

Test the API:

```bash
curl \
  -H "Authorization: Bearer $HUMPHREY_HOME_ASSISTANT_TOKEN" \
  http://127.0.0.1:8123/api/
```

Expected result:

```json
{ "message": "API running." }
```

Do not put the token directly into `config/local.config.json` or commit it.

## Humphrey will not start

From the repository root:

```bash
npm install
npm run build
npm test
npm run lint
```

Check the local configuration exists and is valid:

```bash
ls -l config/local.config.json
```

Start with:

```bash
npm run dev
```

Check the service:

```bash
curl http://127.0.0.1:3100/health
curl http://127.0.0.1:3100/api/config/public
```

The public configuration response must not expose tokens, passwords, or secret values.

## Humphrey returns a JSON 404

A JSON response such as `Route GET:/ not found` means Humphrey is reachable, but the
requested path is not registered. Use these known endpoints:

```bash
curl http://127.0.0.1:3100/health
curl http://127.0.0.1:3100/api/config/public
curl http://127.0.0.1:3100/api/config/history
```

There is no Home Assistant-style `/api/` endpoint on Humphrey. The Home Assistant API
is at port `8123`; Humphrey is normally at port `3100`.

If `/health` works but opening `http://127.0.0.1:3100/` returns JSON 404, build the web
application before starting Humphrey:

```bash
npm run build
npm run dev
```

The root page is served only when `web/dist/index.html` exists. If you are using the
production server instead, run `npm run build` before `npm start`.

## Browser UI does not load

Check that the PWA build exists:

```bash
ls -l web/dist/index.html
```

Build it if necessary:

```bash
npm run build:web
npm run build
```

Then open:

```text
http://127.0.0.1:3100
```

The browser is optional. A missing browser must not stop microphone capture, request
processing, Home Assistant actions, or Piper responses.

## Browser says disconnected

Check the backend first:

```bash
curl http://127.0.0.1:3100/health
```

Then inspect the browser connection to:

```text
/api/events
```

Refresh the page after restarting Humphrey. The client must reconnect without replaying
an old request automatically.

## “Anything you own” or other strange background text

This usually means Whisper is transcribing silence, background audio, or the computer's
own speaker output. It is not normally an Ollama problem.

1. Stop Piper and mute speakers.
2. Record `/tmp/humphrey-test.wav` with `arecord`.
3. Play it back with `aplay`.
4. Transcribe the same file with `whisper-cli`.
5. Only then test `whisper-stream`.

## Security reminders

- Never commit `config/local.config.json`.
- Never paste Home Assistant tokens into logs or issue reports.
- Do not expose Home Assistant port `8123` to the internet.
- Do not cache request history, transcripts, credentials, device state, or API responses
  in the browser service worker.
- Speaker recognition is for personalization only, not authentication.
