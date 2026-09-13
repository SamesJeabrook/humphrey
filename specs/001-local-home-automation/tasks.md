---
description: 'Task list for local home automation service'
---

# Tasks: Local Home Automation Service

**Input**: Design documents from `/specs/001-local-home-automation/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, and `quickstart.md`

**Tests**: Included because the project constitution requires automated unit, contract, and opt-in integration tests for integrations, intents, safety rules, and state transitions.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested as an independent increment.

## Dependencies and Execution Order

- Phase 1 must complete before Phase 2.
- Phase 2 must complete before any user-story phase.
- User Story 1 is the MVP and must complete before User Story 4.
- User Story 2 depends on the request state model from User Story 1 but can proceed in parallel with the User Story 1 adapter implementation after Phase 2.
- User Story 3 depends on the configuration and adapter boundaries from Phase 2 and should complete before enabling optional integrations in User Story 4.
- User Story 4 depends on the validated intent router and integration policy from User Stories 1 and 3.
- User Story 5 depends on the local audio/session foundation from User Story 2 but remains optional and must not block the MVP.
- User Story 6 depends on the request orchestration and configuration foundations but remains optional and must not block the MVP.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the TypeScript Node.js project and repository structure described in `plan.md`.

- [x] T001 Create the Node.js project manifest and scripts in `./package.json` for development, build, test, lint, and start commands.
- [x] T002 [P] Create the TypeScript compiler configuration in `./tsconfig.json` for the Node.js service and browser assets.
- [x] T003 [P] Configure linting and formatting in `./eslint.config.js` and `./.prettierrc.json`.
- [x] T004 [P] Create the source and test directory structure under `src/`, `tests/unit/`, `tests/contract/`, and `tests/integration/`.
- [x] T005 [P] Add the non-secret configuration template in `config/example.config.json` and document ignored local secret files in `.gitignore`.
- [x] T006 [P] Add the initial setup and recovery documentation structure in `docs/setup.md`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the shared boundaries that every user story depends on. No user-story implementation should begin until this phase is complete.

- [x] T007 Implement validated configuration loading, environment-variable secret references, and default-disabled optional integrations in `src/config/config-schema.ts` and `src/config/load-config.ts`.
- [ ] T008 [P] Implement local network destination and permitted-data validation in `src/config/network-policy.ts`.
- [ ] T009 [P] Implement redacted structured logging in `src/logging/logger.ts` and `src/logging/redaction.ts`.
- [x] T010 Implement the VoiceRequest, Intent, Integration, NetworkPolicy, SystemState, and AudioEndpoint domain types in `src/domain/types.ts`.
- [x] T011 Implement request state transitions and single-side-effect serialization in `src/domain/request-state.ts`.
- [x] T012 [P] Implement intent schema validation, alias resolution, action allowlisting, and fail-closed policy checks in `src/domain/intent-policy.ts`.
- [ ] T013 [P] Implement local process lifecycle management for `whisper.cpp` and text-to-speech adapters in `src/audio/process-manager.ts`.
- [ ] T014 Implement microphone capture, endpoint association, temporary audio handling, and cleanup in `src/audio/microphone.ts`.
- [ ] T015 Implement explicit ALSA input/output endpoint discovery, configured pairing, primary routing, and fallback output handling in `src/audio/audio-router.ts`.
- [ ] T016 [P] Add foundational unit tests for configuration, network policy, redaction, state transitions, intent rejection, and audio endpoint selection in `tests/unit/foundation.test.ts`.
- [ ] T017 [P] Add local mock fixtures for Home Assistant, Ollama, whisper.cpp, and text-to-speech in `tests/integration/fixtures/`.

**Checkpoint**: Configuration, privacy boundaries, request state, local audio routing, and test fixtures are ready for independent user-story work.

---

## Phase 3: User Story 1 - Control Local Home Devices by Voice (Priority: P1) 🎯 MVP

**Goal**: Activate Humphrey, interpret a validated local device intent, require the final "please", call only an allowlisted Home Assistant service, and speak the result through the requesting audio terminal.

**Independent Test**: With a mocked Home Assistant light and mocked local audio devices, issue a supported request ending in "please" and verify exactly one allowlisted service call plus an audible completion response; repeat without "please" and verify no service call.

### Tests for User Story 1

- [ ] T018 [P] [US1] Add Home Assistant REST service-call contract tests for configured entity and service allowlists in `tests/contract/home-assistant-contract.test.ts`.
- [ ] T019 [P] [US1] Add intent-policy tests for supported, unknown-entity, unsupported-action, ambiguous, and missing-confirmation requests in `tests/unit/intent-policy.test.ts`.
- [ ] T020 [P] [US1] Add end-to-end mocked voice-action tests covering activation, transcription, intent validation, please confirmation, Home Assistant execution, and same-terminal speech output in `tests/integration/user-story-1.test.ts`.

### Implementation for User Story 1

- [ ] T021 [P] [US1] Implement the Home Assistant REST and WebSocket adapter for health, entity state, service calls, and state updates in `src/adapters/home-assistant.ts`.
- [x] T022 [P] [US1] Implement the local Ollama structured-chat adapter for validated intent interpretation in `src/adapters/ollama.ts`.
- [ ] T023 [P] [US1] Implement the local `whisper.cpp` wake-word and request transcription adapter for "Hey Humphrey" and "Yo Humphrey" in `src/adapters/whisper.ts`.
- [x] T024 [US1] Implement the voice request orchestration pipeline from activation through confirmation, policy validation, Home Assistant execution, and outcome speech in `src/domain/request-orchestrator.ts`.
- [x] T025 [US1] Implement the local Piper text-to-speech adapter with locally stored voice model files and response playback through the request's `AudioEndpoint` in `src/adapters/text-to-speech.ts`.
- [x] T026 [US1] Implement local request submission and redacted request-status endpoints in `src/api/request-routes.ts`.
- [ ] T027 [US1] Wire application lifecycle, adapters, orchestrator, and graceful shutdown in `src/app.ts`.

**Checkpoint**: User Story 1 works without a display and produces no device side effect unless the request is validated and ends with "please".

---

## Phase 4: User Story 2 - Understand and Respond to Local Speech (Priority: P1)

**Goal**: Provide reliable activation, state feedback, same-terminal spoken responses, optional browser status, and safe voice-only operation.

**Independent Test**: Run the service with no display, use a mocked microphone and speaker, and verify audible responses for activation, listening, confirmation-required, success, and failure states; with a browser connected, verify matching dark/orange visual states.

### Tests for User Story 2

- [ ] T028 [P] [US2] Add audio routing contract tests for primary output, fallback output, missing output, and display-absent operation in `tests/contract/audio-routing-contract.test.ts`.
- [ ] T029 [P] [US2] Add state-machine tests for idle, activated, listening, processing, awaiting confirmation, executing, completed, failed, and unavailable states in `tests/unit/request-state.test.ts`.
- [ ] T030 [P] [US2] Add voice-only integration tests verifying every response is audible without a browser or display in `tests/integration/voice-only.test.ts`.

### Implementation for User Story 2

- [x] T031 [US2] Implement microphone activation and request capture integration with endpoint ownership in `src/audio/voice-session.ts`.
- [ ] T032 [US2] Implement the local audio response catalog for confirmations, "What's the magic word?", errors, and unavailable-service messages in `src/audio/response-phrases.ts`.
- [ ] T033 [US2] Implement the local WebSocket event server for redacted system-state updates and safe cancellation in `src/api/event-server.ts`.
- [ ] T034 [US2] Implement the optional dark browser UI with orange animated listening state in `src/ui/index.html`, `src/ui/styles.css`, and `src/ui/app.ts`.
- [x] T035 [US2] Implement health and public-configuration endpoints that never require the browser for voice operation in `src/api/health-routes.ts`.
- [ ] T036 [US2] Integrate fallback audio behavior and display-independent failure handling in `src/domain/request-orchestrator.ts` and `src/audio/audio-router.ts`.

**Checkpoint**: The system is usable from a voice-only terminal, while an attached browser receives supplemental status.

---

## Phase 5: User Story 3 - Configure Integrations and Credentials Locally (Priority: P1)

**Goal**: Allow the owner to configure local endpoints, optional integrations, aliases, credentials, audio devices, and network policy without exposing secrets.

**Independent Test**: Start from a clean local configuration, enable a mock integration with valid, invalid, missing, and disabled credentials, and verify health reporting, redaction, and no unauthorized network call.

### Tests for User Story 3

- [ ] T037 [P] [US3] Add configuration contract tests for required local endpoints, optional integration defaults, secret references, audio devices, and public configuration redaction in `tests/contract/config-contract.test.ts`.
- [ ] T038 [P] [US3] Add security tests proving tokens, credential values, prompts, transcripts, and raw audio are absent from logs and API responses in `tests/unit/secret-redaction.test.ts`.
- [ ] T039 [P] [US3] Add integration health tests for valid, invalid, missing, disabled, and unavailable adapters using local fixtures in `tests/integration/integration-health.test.ts`.

### Implementation for User Story 3

- [ ] T040 [P] [US3] Implement the local configuration status and integration management routes in `src/api/config-routes.ts`.
- [ ] T041 [P] [US3] Implement adapter health, discovery, read, execute, and close lifecycle interfaces in `src/adapters/adapter.ts`.
- [ ] T042 [US3] Implement integration registry, enablement checks, credential-reference resolution, and network-policy enforcement in `src/domain/integration-registry.ts`.
- [ ] T043 [US3] Implement Home Assistant entity discovery, friendly-name aliases, availability tracking, and configured service allowlists in `src/domain/device-registry.ts`.
- [ ] T044 [US3] Document Linux Mint installation, local model paths, microphone permissions, audio output routing, configuration, recovery, and secret handling in `docs/setup.md`.
- [ ] T045 [US3] Add a safe local configuration example covering Home Assistant, Ollama, whisper.cpp, text-to-speech, audio endpoints, and disabled optional integrations in `config/example.config.json`.

**Checkpoint**: The owner can configure the core local system safely and enable optional integrations individually without secret leakage.

---

## Phase 6: User Story 4 - Ask for Media, Weather, and General Information (Priority: P2)

**Goal**: Add optional local media and explicitly approved external information capabilities without weakening the local-first safety boundary.

**Independent Test**: Keep all optional integrations disabled and verify no outbound calls; then enable one mocked integration at a time and verify allowlisted results, source labeling, and safe failure behavior.

### Tests for User Story 4

- [ ] T046 [P] [US4] Add adapter contract tests for disabled-by-default behavior, approved destinations, source labeling, and unavailable-service handling in `tests/contract/optional-integrations.test.ts`.
- [ ] T047 [P] [US4] Add local media tests for external-drive discovery, disconnect handling, and playback handoff in `tests/unit/local-media.test.ts`.
- [ ] T048 [P] [US4] Add mocked integration tests for Spotify, Ring, Tado, weather, and web-search opt-in behavior in `tests/integration/optional-integrations.test.ts`.

### Implementation for User Story 4

- [ ] T049 [P] [US4] Implement external-drive media discovery and safe playback handoff in `src/adapters/local-media.ts`.
- [ ] T050 [P] [US4] Implement Spotify adapter behind explicit credential and network-policy enablement in `src/adapters/spotify.ts`.
- [ ] T051 [P] [US4] Implement Ring camera adapter behind explicit credential and network-policy enablement in `src/adapters/ring.ts`.
- [ ] T052 [P] [US4] Implement Tado heating adapter behind explicit credential and network-policy enablement in `src/adapters/tado.ts`.
- [ ] T053 [P] [US4] Implement weather and web-search adapters with destination allowlists, source labeling, and no-retention defaults in `src/adapters/information.ts`.
- [ ] T054 [US4] Add media, weather, and information intent routing with confirmation enforcement for side effects in `src/domain/intent-router.ts`.
- [ ] T055 [US4] Add source attribution and unavailable-service spoken responses for optional capabilities in `src/audio/response-phrases.ts` and `src/domain/request-orchestrator.ts`.

**Checkpoint**: Optional media and information features work only when individually enabled and approved.

---

## Phase 7: User Story 5 - Personalize Responses by Recognized Speaker (Priority: P2)

**Goal**: Enroll local speaker profiles and use recognized person names in responses without using speaker recognition for authentication or authorization.

**Independent Test**: Enroll two mocked speaker profiles, submit recognized, unknown, and low-confidence samples, and verify correct names or neutral responses while device confirmation rules remain unchanged.

### Tests for User Story 5

- [ ] T056 [P] [US5] Add speaker-recognition tests for enrollment, matching, confidence thresholds, unknown speakers, profile deletion, and neutral responses in `tests/unit/speaker-recognition.test.ts`.
- [ ] T057 [P] [US5] Add personalization integration tests proving recognized names do not bypass intent validation or final confirmation in `tests/integration/speaker-personalization.test.ts`.

### Implementation for User Story 5

- [ ] T058 [P] [US5] Implement local person and speaker-profile storage with protected embeddings and deletion handling in `src/domain/speaker-profiles.ts`.
- [ ] T059 [P] [US5] Implement the local speaker-embedding adapter with confidence-threshold matching in `src/adapters/speaker-recognition.ts`.
- [ ] T060 [US5] Add speaker-profile enrollment, rename, disable, and delete operations to `src/api/speaker-profile-routes.ts`.
- [ ] T061 [US5] Add recognized-person context to response personalization while preserving neutral unknown-speaker responses in `src/domain/personalization.ts`.
- [ ] T062 [US5] Integrate speaker recognition into the voice session without changing authorization, confirmation, or side-effect policy in `src/audio/voice-session.ts` and `src/domain/request-orchestrator.ts`.

**Checkpoint**: Recognized household members receive personalized responses, while unknown speakers remain anonymous and all safety rules remain mandatory.

---

## Phase 8: User Story 6 - Review Recent Request History (Priority: P2)

**Goal**: Retain user request history locally in the configured mode for 30 days, make it reviewable by the owner, and delete it automatically or on request.

**Independent Test**: Create successful, rejected, unavailable, and failed request records in each history mode, review the permitted fields, run the purge at the retention cutoff, and verify that no raw audio, credentials, prompts, or expired records remain.

### Tests for User Story 6

- [ ] T063 [P] [US6] Add request-history tests for all three modes, record creation, outcomes, 30-day expiry, credential exclusion, and manual deletion in `tests/unit/request-history.test.ts`.
- [ ] T064 [P] [US6] Add request-history API contract tests for local review, deletion confirmation, and secret exclusion in `tests/contract/request-history-contract.test.ts`.
- [ ] T065 [P] [US6] Add retention integration tests proving expired records are purged without affecting configuration or speaker profiles in `tests/integration/request-history-retention.test.ts`.

### Implementation for User Story 6

- [x] T066 [P] [US6] Implement configurable RequestHistoryRecord storage for all three modes with local-only retention metadata in `src/domain/request-history.ts`.
- [ ] T067 [US6] Implement the scheduled 30-day purge and owner-triggered delete-all operation in `src/services/request-history-retention.ts`.
- [x] T068 [US6] Implement local request-history review and confirmed deletion routes in `src/api/request-history-routes.ts`.

**Checkpoint**: The owner can review the last 30 days of redacted requests, and expired or manually deleted records are gone without affecting operation or profiles.

---

## Phase 9: Polish and Cross-Cutting Concerns

**Purpose**: Complete release-quality validation, documentation, and operational hardening.

- [ ] T069 [P] Add full quickstart acceptance automation for safe action, voice-only mode, missing confirmation, dependency failure, and privacy checks in `tests/integration/quickstart-validation.test.ts`.
- [ ] T070 [P] Add graceful shutdown, child-process cleanup, temporary-audio cleanup, and log-rotation checks in `tests/unit/lifecycle-cleanup.test.ts`.
- [ ] T071 [P] Add local performance checks for listening-state latency and the 5-second successful-response target in `tests/integration/performance.test.ts`.
- [ ] T072 Review all source files for focused unit-test coverage and the approximately 300-line maintainability guideline, then update `docs/setup.md` for any documented exceptions or implementation deviations.
- [ ] T073 Run the complete build, lint, unit, contract, and opt-in integration checks using scripts in `package.json` and record results in `docs/setup.md`.

## Parallel Execution Examples

### After Phase 2

- T018-T020 can run in parallel while the Home Assistant, Ollama, and whisper adapters are implemented by T021-T023.
- T028-T030 can run in parallel with T031-T035 once the foundation is stable.
- T037-T039 can run in parallel with T040-T043.
- T046-T048 can run in parallel with T049-T053.
- T056-T062 can run in parallel with optional integration work after the voice-session foundation is stable.
- T063-T068 can run in parallel with speaker-personalization work after request orchestration is stable.

### MVP parallelization

- T021, T022, and T023 are independent adapter implementations.
- T018, T019, and T020 are independent test slices.
- T024 and T025 should begin after the adapter contracts and foundation tasks they consume.

## Implementation Strategy

1. Complete setup and foundational safety boundaries first.
2. Deliver User Story 1 as the MVP: one safe Home Assistant device action with local
   speech recognition, Ollama intent validation, "please" confirmation, and same-terminal
   spoken output.
3. Add display-independent state handling and optional browser feedback through User Story 2.
4. Add secure owner configuration and integration lifecycle management through User Story 3.
5. Add optional local media and explicitly approved external services through User Story 4.
6. Add optional local speaker personalization through User Story 5 without using it for security.
7. Add the bounded local request history through User Story 6.
8. Finish with privacy, performance, cleanup, documentation, and full acceptance validation.
