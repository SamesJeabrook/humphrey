---
description: 'Task list for React Progressive Web App interface'
---

# Tasks: React Progressive Web App Interface

**Input**: Design documents from `/specs/002-react-pwa-ui/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, and `quickstart.md`

**Tests**: Included because the constitution requires focused unit tests for changed logic and contract/integration tests for interface boundaries.

**Organization**: Tasks are grouped by user story so each UI increment can be tested independently.

## Dependencies and Execution Order

- Phase 1 must complete before Phase 2.
- Phase 2 must complete before any user-story phase.
- User Story 1 provides the shared state and connection foundation for User Story 2.
- User Story 2 depends on User Story 1's typed client services and state hooks.
- User Story 3 can begin after Phase 2, but production serving and PWA installation depend on the web build from User Stories 1 and 2.

## Phase 1: Setup (PWA Infrastructure)

**Purpose**: Create the separate web client build boundary and development scripts.

- [X] T001 Create the PWA package manifest and scripts in `web/package.json` using React, Vite, TypeScript, CSS Modules, `vite-plugin-pwa`, and the selected test tooling.
- [X] T002 [P] Create the PWA TypeScript configuration in `web/tsconfig.json` and the Vite configuration in `web/vite.config.ts`.
- [X] T003 [P] Create the PWA test configuration in `web/vitest.config.ts` and browser test setup in `web/src/test/setup.ts`.
- [X] T004 [P] Create the component, hook, service, style, type, public, and web test directories under `web/src/`, `web/public/`, and `tests/web/`.
- [X] T005 [P] Add PWA manifest metadata, icons, and static shell assets in `web/public/manifest.webmanifest` and `web/public/icons/`.
- [X] T006 Configure the existing Node service to serve `web/dist` and the SPA fallback through `src/api/static-serving.ts`.

---

## Phase 2: Foundational (Blocking Client Boundaries)

**Purpose**: Establish typed API/WebSocket clients, privacy-safe cache rules, and shared UI state before user-story components.

- [X] T007 Implement shared browser contract types for VisualServiceState, ConnectionState, HistoryViewRecord, and request responses in `web/src/types/contracts.ts`.
- [X] T008 [P] Implement the local HTTP client for health, public configuration, request submission, history listing, and confirmed history deletion in `web/src/services/humphrey-api.ts`.
- [X] T009 [P] Implement the WebSocket state client with bounded reconnect, sequence ordering, and no automatic request replay in `web/src/services/state-events.ts`.
- [ ] T010 [P] Implement service-worker registration, update detection, and static-shell-only cache policy in `web/src/services/pwa.ts` and `web/vite.config.ts`.
- [X] T011 Implement shared connection and service-state hooks in `web/src/hooks/useConnectionState.ts` and `web/src/hooks/useServiceState.ts`.
- [ ] T012 [P] Add API-client contract tests for local endpoints, errors, history modes, and confirmed deletion in `tests/web/services/humphrey-api.test.ts`.
- [ ] T013 [P] Add WebSocket state tests for reconnects, out-of-order events, and duplicate-submission prevention in `tests/web/services/state-events.test.ts`.
- [ ] T014 [P] Add service-worker cache-policy tests proving `/api/**`, WebSocket traffic, and private payloads are network-only in `tests/web/pwa/cache-policy.test.ts`.

**Checkpoint**: The web client can safely communicate with the local service without caching or directly invoking private integrations.

---

## Phase 3: User Story 1 - See Humphrey's Live State (Priority: P1)

**Goal**: Display live service state with accessible labels, dark styling, orange listening treatment, and clear connection status.

**Independent Test**: Feed all supported service states and connection transitions into the client and verify the correct component output and visual state.

### Tests for User Story 1

- [ ] T015 [P] [US1] Add ServiceStatePanel component tests for idle, activated, listening, processing, awaiting confirmation, executing, completed, failed, and unavailable states in `tests/web/components/ServiceStatePanel.test.tsx`.
- [ ] T016 [P] [US1] Add ConnectionStatus component tests for connected, reconnecting, disconnected, and unavailable states in `tests/web/components/ConnectionStatus.test.tsx`.
- [ ] T017 [P] [US1] Add responsive browser tests for state visibility, readable labels, and orange listening treatment at desktop, tablet, and mobile viewports in `tests/web/components/live-state-responsive.test.tsx`.

### Implementation for User Story 1

- [X] T018 [P] [US1] Implement the AppShell layout and route composition in `web/src/app/AppShell.tsx` and `web/src/app/AppShell.module.css`.
- [X] T019 [P] [US1] Implement ConnectionStatus with accessible status text in `web/src/components/ConnectionStatus.tsx` and `web/src/components/ConnectionStatus.module.css`.
- [X] T020 [P] [US1] Implement ServiceStatePanel and state-specific visual treatment in `web/src/components/ServiceStatePanel.tsx` and `web/src/components/ServiceStatePanel.module.css`.
- [X] T021 [P] [US1] Implement shared dark theme tokens and responsive layout styles in `web/src/styles/theme.module.css` and `web/src/styles/globals.css`.
- [X] T022 [US1] Implement the browser entry point and mount AppShell in `web/src/main.tsx` and `web/index.html`.

**Checkpoint**: Live states are visible and understandable, while the backend remains fully usable without the browser.

---

## Phase 4: User Story 2 - Submit Requests and Review History (Priority: P1)

**Goal**: Submit local text requests, display outcomes, review mode-appropriate history, and confirm history deletion.

**Independent Test**: Use local API fixtures to submit a request, display its outcome, render each history mode, and delete history only after explicit confirmation.

### Tests for User Story 2

- [ ] T023 [P] [US2] Add RequestComposer tests for empty input, valid submission, pending state, and API errors in `tests/web/components/RequestComposer.test.tsx`.
- [ ] T024 [P] [US2] Add HistoryPanel tests for normalized-only, redacted-transcript, full-transcript, expiry display, and credential exclusion in `tests/web/components/HistoryPanel.test.tsx`.
- [ ] T025 [P] [US2] Add request-outcome and history-deletion integration tests in `tests/web/components/request-history-flow.test.tsx`.

### Implementation for User Story 2

- [ ] T026 [P] [US2] Implement RequestComposer with local validation and typed request submission in `web/src/components/RequestComposer.tsx` and `web/src/components/RequestComposer.module.css`.
- [ ] T027 [P] [US2] Implement RequestOutcome with accessible success, rejection, unavailable, and failure states in `web/src/components/RequestOutcome.tsx` and `web/src/components/RequestOutcome.module.css`.
- [ ] T028 [P] [US2] Implement HistoryPanel with mode-aware fields, expiry display, and explicit delete confirmation in `web/src/components/HistoryPanel.tsx` and `web/src/components/HistoryPanel.module.css`.
- [ ] T029 [US2] Integrate request submission, outcome state, and history loading into AppShell in `web/src/hooks/useRequestFlow.ts` and `web/src/app/AppShell.tsx`.
- [ ] T030 [US2] Add accessible empty, loading, offline, and error states for request and history views in `web/src/components/AsyncState.tsx` and `web/src/components/AsyncState.module.css`.

**Checkpoint**: The owner can operate and troubleshoot Humphrey through the local PWA without bypassing backend safety rules.

---

## Phase 5: User Story 3 - Install and Use the Optional Local App (Priority: P2)

**Goal**: Make the shell installable and responsive while keeping live and private data out of offline caches.

**Independent Test**: Install the PWA, inspect caches, disconnect the service, reopen the shell, and verify live data is unavailable while voice operation remains unaffected.

### Tests for User Story 3

- [ ] T031 [P] [US3] Add PWA manifest and installation-prompt tests in `tests/web/pwa/installability.test.ts`.
- [ ] T032 [P] [US3] Add offline-shell browser tests proving only static assets load without live API data in `tests/web/pwa/offline-shell.test.ts`.
- [ ] T033 [P] [US3] Add cache inspection tests proving transcripts, history, credentials, device state, API responses, and model output are not cached in `tests/web/pwa/privacy-cache.test.ts`.
- [ ] T034 [P] [US3] Add responsive browser tests for desktop, tablet, and mobile layout at the complete application level in `tests/web/pwa/responsive-app.test.ts`.

### Implementation for User Story 3

- [ ] T035 [P] [US3] Implement the PWA install/update prompt and service-worker lifecycle UI in `web/src/components/InstallPrompt.tsx` and `web/src/components/InstallPrompt.module.css`.
- [ ] T036 [P] [US3] Implement static-shell-only PWA configuration and deny caching for service/API/WebSocket requests in `web/vite.config.ts` and `web/src/services/pwa.ts`.
- [X] T037 [US3] Integrate built PWA asset serving and SPA fallback into the existing Node service in `src/api/static-serving.ts` and `src/app.ts`.
- [ ] T038 [US3] Add local PWA installation, offline behavior, and cache-boundary instructions to `docs/setup.md` and `README.md`.

**Checkpoint**: The PWA is installable and useful on supported browsers without becoming a dependency of voice operation.

---

## Phase 6: Polish and Cross-Cutting Concerns

**Purpose**: Complete visual accessibility, security, validation, and release integration.

- [ ] T039 [P] Add keyboard navigation, focus visibility, semantic labels, and reduced-motion support across `web/src/components/` and `web/src/styles/globals.css`.
- [ ] T040 [P] Add component and PWA tests for transcript display modes and credential-safe rendering in `tests/web/privacy-history-rendering.test.tsx`.
- [ ] T041 [P] Add the PWA build and static-serving checks to `tests/web/build-serving.test.ts`.
- [ ] T042 Run the PWA build, component tests, browser tests, Node.js tests, lint, production dependency audit, and `git diff --check` using scripts in `package.json` and record results in `docs/setup.md`.
- [ ] T043 Review source files against the constitutional 300-line guideline and document any justified exceptions in `docs/setup.md`.

## Parallel Execution Examples

### After Phase 2

- T012-T014 can run in parallel with T008-T011.
- T015-T017 can run in parallel with T018-T022.
- T023-T025 can run in parallel with T026-T030.
- T031-T034 can run in parallel with T035-T038.

## Implementation Strategy

1. Establish the separate web build and typed local-service boundary.
2. Deliver User Story 1 as the first visible increment: live state and connection status.
3. Add request submission and history review through User Story 2.
4. Add installability, offline shell, cache privacy, and responsive validation through User Story 3.
5. Finish accessibility, privacy rendering, serving integration, and complete validation.
