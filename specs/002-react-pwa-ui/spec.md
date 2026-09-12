# Feature Specification: React Progressive Web App Interface

**Feature Branch**: `002-react-pwa-ui`

**Created**: 2026-09-12

**Status**: Draft

**Input**: User description: "Create a React-based Progressive Web App for Humphrey's local browser interface. Replace the initial vanilla UI with componentized React components and CSS Modules. Serve the built PWA from the existing local Node.js service. Use the existing HTTP and WebSocket contracts for health, request submission, system state, and request history. The PWA must be optional: voice operation must continue without a browser or display. Use a dark visual theme with orange listening feedback. The service worker may cache the application shell, but must not cache transcripts, request history, credentials, device state, or API responses. The PWA is a local-network client, not an authentication system."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - See Humphrey's Live State (Priority: P1)

As a household member, I want to see Humphrey's current listening and processing state so that I understand whether it heard me, is working, or needs another request.

**Why this priority**: Clear state feedback is the primary purpose of the visual interface and must mirror the voice experience without replacing it.

**Independent Test**: Connect the interface to a local service-state stream, simulate every supported system state, and verify that the correct state, message, and listening treatment appear.

**Acceptance Scenarios**:

1. **Given** the service is idle, **When** the interface connects, **Then** it shows a ready state without implying that a microphone is actively listening.
2. **Given** Humphrey enters listening or activated state, **When** the state update arrives, **Then** the interface shows the dark theme and animated orange listening treatment.
3. **Given** Humphrey is processing, awaiting confirmation, completed, unavailable, or failed, **When** the state update arrives, **Then** the interface shows a distinct understandable state and does not display private transcript or credential data.
4. **Given** no browser is connected, **When** Humphrey processes a request, **Then** voice capture, processing, and spoken response behavior continue normally.

---

### User Story 2 - Submit Requests and Review History (Priority: P1)

As the system owner, I want to submit a local text request and review permitted request history so that I can operate and troubleshoot Humphrey from a browser when a display is available.

**Why this priority**: The interface must expose the existing local service capabilities without duplicating device-control logic in the client.

**Independent Test**: Use a local service fixture to submit a request, receive its state and outcome, list request history, and delete history with explicit confirmation.

**Acceptance Scenarios**:

1. **Given** the local service is available, **When** the user submits a request, **Then** the interface shows submission and resulting state without bypassing activation, intent validation, or "please" confirmation.
2. **Given** request history is available, **When** the owner opens history, **Then** the interface displays only fields allowed by the configured history mode.
3. **Given** the owner chooses to delete history, **When** they explicitly confirm, **Then** the interface reports completion without deleting configuration or speaker profiles.
4. **Given** the local service is unavailable, **When** the user tries to submit or review history, **Then** the interface shows a clear offline/error state and does not fabricate results.

---

### User Story 3 - Install and Use the Optional Local App (Priority: P2)

As a household member, I want to install Humphrey as a local app and use it across supported browsers so that the interface feels like a dependable local tool while remaining optional.

**Why this priority**: Installation and responsive layout improve repeated use, but the core voice service must remain independent of the app.

**Independent Test**: Install the app from a supported browser, disconnect the browser from the service, reconnect it, and verify the cached shell loads while no private data is shown offline.

**Acceptance Scenarios**:

1. **Given** a supported browser can reach the local service, **When** the user installs the app, **Then** the app has a recognizable name, icon, and local launch experience.
2. **Given** the browser is offline or the local service is unavailable, **When** the user opens the installed app, **Then** only the static application shell may load and it MUST clearly show that live service data is unavailable.
3. **Given** a service worker is active, **When** the app handles transcripts, request history, credentials, device state, or API responses, **Then** those values are not cached for offline use.
4. **Given** the interface is used on desktop, tablet, or mobile-sized screens, **When** the viewport changes, **Then** controls and status remain readable and usable without overlap.

### Edge Cases

- If the WebSocket connection drops, the interface MUST show a disconnected state and reconnect without duplicating requests.
- If state updates arrive out of order, the interface MUST not show an older state over a newer known state.
- If the user submits an empty request, the interface MUST reject it locally and provide a clear message.
- If history contains a full transcript, the interface MUST display it only according to the configured local history mode and MUST not expose credentials.
- If the service worker has an outdated shell, the interface MUST support an update path without caching private API data.
- If no display or browser is connected, the service MUST continue voice-only operation as defined by the core feature.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST provide a browser interface for the existing local Humphrey service without moving device control, speech processing, or safety validation into the client.
- **FR-002**: Interface MUST consume the existing local health, request, state-event, public-configuration, and request-history contracts.
- **FR-003**: Interface MUST display all supported service states with distinct accessible labels and listening feedback.
- **FR-004**: Interface MUST use the configured dark visual treatment and orange listening indicator without making visual output a requirement for voice operation.
- **FR-005**: Interface MUST submit requests only through the existing local service boundary and MUST not call Home Assistant, Ollama, or external integrations directly.
- **FR-006**: Interface MUST display request outcomes, errors, unavailable states, and connection status without exposing credentials, raw audio, prompts, or internal stack traces.
- **FR-007**: Interface MUST display request history according to the active `normalized_only`, `redacted_transcript`, or `full_transcript` mode.
- **FR-008**: Interface MUST require explicit confirmation before deleting all request history and MUST report the result clearly.
- **FR-009**: Interface MUST be usable on desktop, tablet, and mobile-sized screens without overlapping controls or unreadable text.
- **FR-010**: Interface MUST support local installation as an optional app while keeping live API data and private records out of offline caches.
- **FR-011**: Service-worker caching MUST be limited to the static application shell and public static assets; it MUST NOT cache transcripts, request history, credentials, device state, API responses, or model output.
- **FR-012**: Interface MUST show a clear unavailable/offline state when the local service cannot be reached and MUST not fabricate stale live state.
- **FR-013**: The browser interface MUST be componentized so state display, request submission, history, connection status, and shared controls have separate maintainable boundaries.

### Key Entities _(include if feature involves data)_

- **Visual Service State**: The current local service state presented to the user without changing the underlying request state.
- **History View**: The permitted request-history records presented according to the configured retention mode.
- **Connection State**: The browser's connection to the local service and state-event stream.
- **Application Shell**: Static local interface assets that may be cached for optional app installation.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: At least 95% of simulated service-state updates are reflected in the correct visible state within 250 milliseconds while the local connection is healthy.
- **SC-002**: 100% of tested request submissions pass through the local service boundary and cannot directly invoke Home Assistant or Ollama from the browser.
- **SC-003**: 100% of tested offline-cache inspections contain no transcript, request-history, credential, device-state, API-response, or model-output data.
- **SC-004**: At least 90% of test users can identify idle, listening, processing, confirmation-required, completed, unavailable, and failed states from the interface.
- **SC-005**: At least 90% of test users can complete a request submission and view its outcome without assistance on desktop and mobile-sized viewports.
- **SC-006**: 100% of tested history deletions require explicit confirmation and leave configuration and speaker profiles intact.
- **SC-007**: The local service remains capable of processing and speaking a request when no browser is connected.

## Assumptions

- The existing Node.js service remains the only authority for device control, speech processing, intent validation, safety rules, and private data handling.
- Browser access is limited to the local machine or trusted local network; authentication is out of scope for this household-only first interface feature.
- The initial visual interface supports one household owner and does not introduce multi-user web permissions.
- The installed app shell may load without live data, but all live state and request-history views require a reachable local service.
- React, CSS Modules, and the PWA packaging approach will be selected in the implementation plan as the delivery mechanism for these user-visible outcomes.
