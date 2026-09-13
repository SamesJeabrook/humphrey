# Humphrey Setup

Humphrey runs locally on Linux Mint. The first release binds to loopback by default.
Keep local configuration and credentials outside source control.

## Local services

Install Node.js 22 LTS, Ollama, `whisper.cpp`, Piper, and their local model files.
Configure Home Assistant with a long-lived local access token in the environment variable
named by `homeAssistant.tokenEnv`. In the example configuration, `tokenEnv` is set to
`HUMPHREY_HOME_ASSISTANT_TOKEN`, which is only the variable name. Put the actual token in
an ignored `.env` file by copying the template:

```bash
cp .env.example .env
# Edit .env and replace PASTE_YOUR_HOME_ASSISTANT_TOKEN_HERE with your token.
```

Humphrey loads `.env` when it starts. Do not paste the token into
`config/local.config.json` or commit `.env`.

From the repository root, install both the backend and React UI dependencies:

```bash
npm install
npm install --prefix web
```

Copy `config/example.config.json` to `config/local.config.json`, then set local device
names, ALSA input/output pairs, model paths, and the request-history mode. History modes
are `normalized_only`, `redacted_transcript`, and `full_transcript`; the default is
`full_transcript`, and records expire after 30 days.

## Validation

Run `npm run build`, `npm test`, and `npm run dev`. The build includes the React UI and
serves it at `http://127.0.0.1:3100`. If the build has not run yet, the backend can
still answer `GET /health` and `GET /api/config/public`, but `/` returns a JSON 404
because `web/dist` does not exist. Never commit local config, tokens, raw audio, or
model files.

For a microphone-independent test, open the dashboard and click **Activate Humphrey**.
Enter a command and click **Send**. This exercises the normal backend request path while
keeping the same confirmation and Home Assistant allowlist rules. It is a text test
control, not browser speech recognition.

Before connecting the services together, follow the [local services readiness checklist](local-services-readiness.md).

If a dependency or audio path fails, use the [troubleshooting guide](troubleshooting.md).
