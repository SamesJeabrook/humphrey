# Quickstart Validation Guide

This guide validates the local-first design before implementation is considered ready.
It is intentionally a run guide, not a deployment script or implementation tutorial.

## Prerequisites

- Supported Linux Mint installation with Node.js 22 LTS or newer supported LTS.
- Microphone available to the local user and ALSA capture permissions configured.
- Home Assistant reachable on the local network with a dedicated long-lived access token.
- Ollama installed locally with the selected model already available.
- `whisper.cpp` built locally with a speech model stored on the machine.
- A local text-to-speech engine and output device associated with the microphone.
- Optional integrations disabled unless their destinations and credentials are approved.

## Configuration validation

1. Copy the example configuration to the local configuration location.
2. Provide Home Assistant and Ollama local endpoints through local secret/configuration
   storage; never commit the values.
3. Set the `whisper.cpp` executable and model paths.
4. Configure at least one Home Assistant light entity and a safe `turn_on` action.
5. Start the service bound to loopback or the trusted LAN interface.
6. Request `GET /health` and verify all required local dependencies report healthy.
7. Request `GET /api/config/public` and verify no token, credential, or secret reference
   is returned.
8. Verify the configured audio output can play a local test phrase without a browser
   or attached display.
9. Verify request-history mode is configurable as `normalized_only`,
   `redacted_transcript`, or `full_transcript`, with `full_transcript` selected by
   default and a 30-day expiry configured.

## Acceptance scenarios

### Safe voice action

1. Start in `idle`.
2. Say "Hey Humphrey" or "Yo Humphrey".
3. Confirm the browser enters `listening` with the animated orange border.
4. Say a configured light request ending in "please".
5. Verify the service emits a validated intent, calls only the configured Home Assistant
   service, speaks the confirmation through the same terminal's associated output, and
   reports `completed` when a display is available.

### Voice-only operation

1. Disconnect or disable the display while leaving the microphone and associated speaker
   available.
2. Complete a safe device request and a request that omits "please".
3. Verify the success response and magic-word prompt are both audible through the local
   speaker and that no display is required.

### Missing confirmation

1. Activate Humphrey and request a supported action without saying "please".
2. Verify the state becomes `awaiting_confirmation`.
3. Verify no Home Assistant service call occurs.
4. Verify the response asks for the magic word.

### Failure and privacy checks

1. Disable Ollama, Home Assistant, or whisper.cpp one at a time.
2. Verify the UI reports `unavailable` or `failed`, no side effect occurs, and retries do
   not duplicate an action.
3. Search local logs and HTTP responses for configured tokens, raw audio, transcripts,
   and model prompts; none may be present.
4. Leave an optional external integration disabled and verify no outbound request is
   made to its destination.
5. Create a request-history record, review it locally, manually delete all history,
   and verify configuration and speaker profiles remain intact.

## Integration test fixtures

Use local mocks for Home Assistant, Ollama, and `whisper.cpp` in automated tests. Live
Home Assistant and Ollama tests are opt-in and must be explicitly enabled by environment
configuration; they must never require or print real credentials.
