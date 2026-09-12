# Implementation Plan: Local Home Automation Service

**Branch**: `001-local-home-automation` | **Date**: 2026-09-12 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-local-home-automation/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Build a local-first voice home automation service for Linux Mint. A Node.js service
coordinates local microphone capture, `whisper.cpp` speech recognition, Ollama intent
interpretation, local text-to-speech output routed to the requesting audio terminal,
and allowlisted Home Assistant actions. A browser interface provides optional visual
state; voice operation MUST remain usable without a display. Optional external
integrations remain disabled until explicitly enabled by the owner.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript on Node.js 22 LTS or newer supported LTS

**Primary Dependencies**: Fastify, `ws`, Zod, Pino, Ollama HTTP API, Home Assistant
REST/WebSocket APIs, locally built `whisper.cpp`, a local speaker-embedding adapter,
and Piper for local text-to-speech with locally stored voice model files

**Storage**: Local JSON configuration, ephemeral in-memory request state, and a local
request-history store with configurable `normalized_only`, `redacted_transcript`, and
`full_transcript` modes. The default is `full_transcript`; all history is permanently
deleted after 30 days. No cloud or remote persistence. Operational logs use rotation
and redaction.

**Testing**: Node.js test runner for unit tests, contract tests for local interfaces,
and opt-in integration tests against Home Assistant, Ollama, and `whisper.cpp`

**Target Platform**: Linux Mint on the local network, with a Chromium-compatible
browser for the local interface

**Project Type**: Local web service with a browser UI and managed local processes

**Performance Goals**: Reach a visible listening state immediately after activation;
complete at least 90% of successful local device requests within 5 seconds under
normal local network and model conditions; keep the UI responsive during inference

**Constraints**: Bind the service to the local interface by default; allowlist every
network destination; never log credentials, raw audio, prompts, or transcripts;
require an explicit final "please" before side effects; serialize or reject
concurrent side-effecting requests; fail closed on uncertainty or dependency failure;
provide focused unit tests for changed logic; and keep source files at or below about
300 lines where practical, documenting justified exceptions

**Scale/Scope**: One household and one primary owner; one active voice request at a
time for the first release; a small configured set of Home Assistant entities and
optional integrations

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- PASS: Local-first operation. All audio, transcripts, prompts, model calls, device
  state, and logs remain local unless an explicitly enabled integration is approved
  by the owner and covered by the network policy.
- PASS: Explicit action boundaries. Only configured Home Assistant entities and
  services may be called, and the request pipeline requires validated intent plus
  the final confirmation word before side effects.
- PASS: Secret and data safety. Credentials are local configuration inputs, never
  committed or logged; raw audio is ephemeral, operational logs are redacted, and
  request history follows the constitutional mode and 30-day retention policy.
- PASS: Safe, testable automation. Focused unit tests cover changed logic, while
  contract and opt-in integration tests cover intent validation, confirmation, adapter
  failures, and state transitions.
- PASS: Simple observable Node.js service. The design uses one service, small
  adapters, structured redacted logs, and an optional local browser UI; audio output
  remains the primary interaction channel.
- PASS: Documentation and setup compliance. `quickstart.md` defines the supported
  setup and validation path; deviations require documented review.

## Project Structure

### Documentation (this feature)

```text
specs/001-local-home-automation/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
src/
├── app.ts                 # service composition and lifecycle
├── config/                # validated local configuration
├── domain/                # request state, intents, safety policy
├── adapters/              # Home Assistant, Ollama, whisper.cpp, speaker, media, web
├── audio/                 # microphone capture, terminal routing, and local speech output
├── api/                   # local HTTP and WebSocket routes
├── ui/                    # browser assets and state rendering
└── logging/               # redaction and structured diagnostics

tests/
├── unit/
├── contract/
└── integration/

config/
└── example.config.json

docs/
└── setup.md
```

**Structure Decision**: A single Node.js project owns the local service and browser
UI. Domain logic is kept independent from integration adapters so safety rules can
be tested without network services. The UI is served by the same local process to
avoid a second deployment surface.

## Complexity Tracking

No constitution violations were identified; complexity tracking is not applicable.
