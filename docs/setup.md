# Humphrey Setup

Humphrey runs locally on Linux Mint. The first release binds to loopback by default.
Keep local configuration and credentials outside source control.

## Local services

Install Node.js 22 LTS, Ollama, `whisper.cpp`, Piper, and their local model files.
Configure Home Assistant with a long-lived local access token in the environment variable
named by `homeAssistant.tokenEnv`.

Copy `config/example.config.json` to `config/local.config.json`, then set local device
names, ALSA input/output pairs, model paths, and the request-history mode. History modes
are `normalized_only`, `redacted_transcript`, and `full_transcript`; the default is
`full_transcript`, and records expire after 30 days.

## Validation

Run `npm install`, `npm run build`, and `npm test`. Start with `npm run dev`, then check
`GET /health` and `GET /api/config/public` locally. Never commit local config, tokens,
raw audio, or model files.
