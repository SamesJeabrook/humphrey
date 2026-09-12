# Implementation Plan: React Progressive Web App Interface

**Branch**: `002-react-pwa-ui` | **Date**: 2026-09-12 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-react-pwa-ui/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Replace the initial vanilla local browser surface with a componentized React PWA served
from the existing Humphrey Node.js service. The PWA provides live state, request
submission, request-history review, responsive visual feedback, and installable shell
assets while remaining optional to the voice service.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript with React and Node.js 22 LTS-compatible tooling

**Primary Dependencies**: React, Vite, CSS Modules, `vite-plugin-pwa`, Fastify static
asset serving, existing HTTP/WebSocket contracts, and the Node.js test tooling

**Storage**: No client persistence for live or private data. Service-worker Cache Storage
may contain only static application-shell assets; request history remains server-side.

**Testing**: Component tests, API-client contract tests, WebSocket state tests, service
worker cache-policy tests, responsive browser checks, and the existing Node.js checks

**Target Platform**: Chromium-compatible browsers on desktop, tablet, and mobile
viewports connected to the trusted local network

**Project Type**: Installable local-network React PWA served by a Node.js web service

**Performance Goals**: Reflect healthy local state events within 250ms; keep initial
shell rendering responsive on supported mobile-sized viewports; avoid duplicate request
submissions during reconnects

**Constraints**: The PWA MUST not call Home Assistant, Ollama, or external services
directly; API and WebSocket requests remain network-only; only static shell assets may
be cached; voice operation remains independent of the browser; components SHOULD remain
focused and source files SHOULD generally stay below the constitutional 300-line guide

**Scale/Scope**: One local household, one primary owner, one dashboard surface, and the
existing local service contracts; no multi-user web authorization in this feature

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- PASS: Local-first operation. The PWA communicates only with the local Humphrey service
  and caches no live or private data.
- PASS: Explicit action boundaries. The PWA submits requests but never invokes devices,
  models, or integrations directly.
- PASS: Secret and data safety. Credentials, transcripts, history, device state, API
  responses, and model output are excluded from client caches and UI diagnostics.
- PASS: Safe, testable automation. Component, contract, WebSocket, cache-policy, and
  responsive behavior tests cover the UI boundary without changing backend safety rules.
- PASS: Simple observable Node.js service. The built PWA is served by the existing local
  service and remains optional to voice operation.
- PASS: Documentation and setup compliance. The feature quickstart documents build,
  serving, installation, offline-shell, and privacy validation.

## Project Structure

### Documentation (this feature)

```text
specs/002-react-pwa-ui/
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
web/
├── src/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   ├── styles/
│   └── types/
├── public/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vitest.config.ts

src/api/
└── static-serving.ts       # serves web/dist from the existing Node service

tests/web/
├── components/
├── services/
└── pwa/
```

**Structure Decision**: Keep the PWA in a separate `web/` project boundary so React,
Vite, CSS Modules, and service-worker configuration remain isolated from backend
runtime code. The production build is served by the existing Node.js service. The PWA
uses typed service modules and WebSocket hooks, while components remain presentation
and interaction boundaries with no direct device or model access.

## Complexity Tracking

No constitution violations were identified; the separate `web/` boundary is required
to isolate the PWA build and service-worker lifecycle from the backend service.
