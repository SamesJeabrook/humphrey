# Feature Specification: Local Home Automation Service

**Feature Branch**: `001-local-home-automation`

**Created**: 2026-09-12

**Status**: Draft

**Input**: User description: "Build a home automation service that works purely on the local network. It will be compatible to run on Linux Mint, use Node JS, Home Assistant, Ring if available, Tado heating, Spotify, optional external-drive music, local Ollama, microphone speech input, Humphrey activation phrases, a required please confirmation word, dark theme with orange listening state, weather, and basic web searches."

## Clarifications

### Session 2026-09-12

- Q: Should Humphrey permit any approved external network access for weather, web search, Spotify, Ring, or Tado? -> A: Local-first with per-integration opt-in; each external integration is disabled by default and enabled individually by the owner.
- Q: Should Humphrey use a local speech-to-text engine with model files installed on Linux Mint? -> A: Yes; use whisper.cpp and keep its model files on the Linux Mint machine.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Control Local Home Devices by Voice (Priority: P1)

As a resident, I want to speak a natural-language request to Humphrey so that I can control supported lights, heating, cameras, and other local home devices without using a separate interface for each device.

**Why this priority**: Reliable local device control is the core value of the service and the foundation for every other capability.

**Independent Test**: With a configured local device, say an activation phrase followed by a valid request ending in "please" and verify that the intended device changes state and Humphrey reports the result locally.

**Acceptance Scenarios**:

1. **Given** Humphrey is idle and a supported local device is configured, **When** the user says "Hey Humphrey, turn on the living room light please", **Then** the matching light turns on and the user receives a concise confirmation.
2. **Given** a request does not end with "please", **When** the user finishes speaking, **Then** Humphrey does not perform the action and asks for the magic word.
3. **Given** a request names an unknown device or unsupported action, **When** the user finishes speaking with "please", **Then** Humphrey explains that it cannot safely perform the request and makes no device change.

---

### User Story 2 - Understand and Respond to Local Speech (Priority: P1)

As a resident, I want Humphrey to listen only after its activation phrase and respond conversationally through the same local audio terminal that heard me so that the system remains usable even when no display is available.

**Why this priority**: Activation, listening feedback, and understandable responses are necessary for safe and usable voice interaction.

**Independent Test**: Exercise idle, activated, listening, processing, confirmation-required, completed, and error states with recorded local speech and verify that each state produces the expected spoken response through the requesting audio terminal; when a display is available, verify that it shows matching optional status.

**Acceptance Scenarios**:

1. **Given** Humphrey is idle, **When** the user says "Hey Humphrey" or "Yo Humphrey", **Then** it enters listening mode and displays an animated orange border around the listening interface.
2. **Given** Humphrey is idle, **When** the user speaks without an activation phrase, **Then** it does not interpret or act on the speech as a command.
3. **Given** a valid request is completed, **When** Humphrey responds, **Then** the response is understandable human-like speech and the relevant local interface state is shown.
4. **Given** a voice terminal has captured the request, **When** Humphrey responds, **Then** the response is played through that terminal's associated local audio output even if no screen is connected.

---

### User Story 3 - Configure Integrations and Credentials Locally (Priority: P1)

As the system owner, I want to configure local endpoints and optional service credentials without exposing secrets so that Humphrey can use the integrations I choose while remaining private and maintainable.

**Why this priority**: Safe configuration is required before any external or device integration can be enabled.

**Independent Test**: Configure a local Home Assistant connection and an optional credential-backed integration with invalid, valid, and missing credentials, then verify safe error handling and secret redaction.

**Acceptance Scenarios**:

1. **Given** a local integration has valid configuration, **When** the owner enables it, **Then** Humphrey reports it as available without displaying credential values.
2. **Given** an integration has missing or invalid credentials, **When** Humphrey attempts to use it, **Then** it reports a useful local error, performs no unsafe action, and does not reveal the credentials.
3. **Given** an integration is disabled, **When** the user requests its capability, **Then** Humphrey explains that the capability is unavailable and does not attempt an unconfigured connection.

---

### User Story 4 - Ask for Media, Weather, and General Information (Priority: P2)

As a resident, I want to ask Humphrey for music, weather, recipes, and everyday information so that the same voice interface can help with household and general tasks.

**Why this priority**: Information and entertainment improve usefulness after safe local control is working, but they are not required for the minimum viable automation service.

**Independent Test**: Request a configured local music source, a supported weather lookup, and a general information query, then verify that the result clearly identifies its source and handles unavailable services without affecting device control.

**Acceptance Scenarios**:

1. **Given** a configured music source is available, **When** the user asks Humphrey to play music and ends the request with "please", **Then** playback starts through the selected source and Humphrey reports the result.
2. **Given** a requested location or information source is unavailable, **When** the user asks for weather or an answer, **Then** Humphrey explains the limitation and does not invent a result.
3. **Given** the user requests a recipe or general answer, **When** the request requires information not stored locally, **Then** Humphrey follows the approved network policy before retrieving or declining the information.

### Edge Cases

- If the activation phrase is heard while Humphrey is already processing a request, Humphrey MUST finish or safely cancel the current state before accepting another request.
- If speech recognition is incomplete, unintelligible, or interrupted, Humphrey MUST ask the user to repeat the request and MUST perform no action.
- If the required final word is spoken as part of an ambiguous or quoted sentence, Humphrey MUST require an unambiguous confirmation before acting.
- If Home Assistant, Ollama, a configured device, or an optional integration is unavailable, Humphrey MUST fail safely, explain the unavailable dependency, and avoid retries that create unintended actions.
- If a camera capability is unavailable, Humphrey MUST not claim to have retrieved or viewed camera information.
- If the external drive is disconnected, local music playback MUST remain available without corrupting or changing the drive.
- If network policy prevents a weather or web lookup, Humphrey MUST provide a local explanation rather than silently contacting an unapproved service.
- Microphone input MUST not be retained beyond the configured local processing and retention policy.
- If the requesting terminal's audio output is unavailable, Humphrey MUST report the failure through any configured fallback audio endpoint and local diagnostics without treating a screen as a required fallback.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST run on a supported Linux Mint installation and provide a locally accessible interface.
- **FR-002**: System MUST communicate with configured home devices through the local Home Assistant service and MUST limit actions to explicitly configured entities and services.
- **FR-003**: System MUST support available local integrations for lighting, heating, cameras, and media, including Ring, Tado, and Spotify only when their access and network policies permit their use.
- **FR-004**: System MUST support music from an attached external drive as an optional local source.
- **FR-005**: System MUST accept microphone input only after detecting an activation phrase equivalent to "Hey Humphrey" or "Yo Humphrey".
- **FR-006**: System MUST convert activated speech into a text request using locally running whisper.cpp speech recognition and MUST keep audio, model files, and transcripts within the approved local data boundary.
- **FR-007**: System MUST use a locally running language model to interpret requests and produce natural-language responses without sending prompts, transcripts, or device state to a cloud model.
- **FR-008**: System MUST require the spoken word "please" at the end of an actionable request before changing device state, starting playback, or performing another side effect.
- **FR-009**: System MUST prompt for the missing confirmation word with a phrase such as "What's the magic word?" and MUST not act until the request is repeated or clearly completed with "please".
- **FR-010**: System MUST display distinct idle, activated, listening, processing, confirmation-required, success, and error states.
- **FR-011**: System MUST provide optional visual status through a dark-themed local interface with an animated orange listening border, but a display MUST NOT be required for voice interaction.
- **FR-012**: System MUST allow the owner to configure endpoints, enabled integrations, locations, media sources, and optional credentials through local configuration.
- **FR-013**: System MUST never expose credentials in the interface, logs, speech responses, error messages, source control, or generated documentation.
- **FR-014**: System MUST fail closed for ambiguous requests, unknown entities, unsupported actions, missing confirmation, invalid credentials, and unavailable dependencies.
- **FR-015**: System MUST provide weather information for the configured current location and requested locations only through an approved network policy.
- **FR-016**: System MUST support general information requests, recipes, and basic web searches only through an approved network policy and MUST identify when an answer is unavailable or externally sourced.
- **FR-017**: System MUST record sufficient local diagnostics to explain state transitions, integration failures, and rejected actions while redacting sensitive content by default.
- **FR-018**: System MUST provide documentation that accurately describes installation, configuration, connectivity, security, operation, recovery, and enabled integrations.
- **FR-019**: System MUST route every spoken response, including confirmations, clarification prompts, errors, and unavailable-service messages, through the same local audio terminal associated with the microphone that captured the request.
- **FR-020**: System MUST support voice-only operation with no display attached and MUST treat visual status as supplemental feedback rather than the primary response channel.

### Key Entities _(include if feature involves data)_

- **Voice Request**: Activated speech converted into a request, including its lifecycle state, interpreted intent, confirmation status, and outcome.
- **Device Entity**: A configured home device exposed through Home Assistant, including its human-readable name, supported actions, and current availability.
- **Integration**: A local or explicitly approved service connection, its enabled capabilities, health state, and non-secret configuration.
- **Media Source**: A configured Spotify account or attached local music location available for playback.
- **Network Policy**: The allowlisted set of local endpoints and explicitly approved external destinations, if any, together with the data permitted to cross each boundary.
- **System State**: The user-visible operating state such as idle, listening, processing, awaiting confirmation, completed, or failed.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: In acceptance testing, at least 95% of clearly spoken supported device requests that include the activation phrase and end with "please" produce the intended result on the first attempt.
- **SC-002**: 100% of tested requests that omit the final confirmation word produce no device or media side effect.
- **SC-003**: 100% of tested requests for unknown devices, unsupported actions, unavailable integrations, or ambiguous intents fail without an unintended side effect.
- **SC-004**: At least 90% of test users can identify whether Humphrey is idle, listening, processing, waiting for confirmation, successful, or blocked from the visible interface.
- **SC-005**: At least 90% of successful local device requests receive a spoken or visible confirmation within 5 seconds under normal local network conditions.
- **SC-006**: 100% of reviewed logs, generated artifacts, and user-visible failures contain no configured credentials or secret values.
- **SC-007**: A new system owner can follow the setup documentation to configure a local Home Assistant connection and complete a first safe device-control request within 30 minutes on a supported Linux Mint installation.
- **SC-008**: For approved information requests, at least 90% of responses clearly indicate whether the answer came from local knowledge, an approved service, or could not be retrieved.
- **SC-009**: In voice-only acceptance testing with no display attached, 100% of completed, rejected, confirmation-required, and failure responses are audible through the requesting terminal's associated local audio output.

## Assumptions

- The system owner has a functioning Linux Mint machine with a microphone and access to the local network containing the configured home services.
- Home Assistant is the authoritative local boundary for supported home devices; device-specific capabilities depend on the corresponding Home Assistant integration being available.
- Ring, Tado, and Spotify availability depends on their accounts, device connectivity, service terms, and the project network policy.
- Ollama and whisper.cpp are available locally with their model files installed on the Linux Mint machine; Ollama produces intent interpretations and natural-language responses while whisper.cpp converts microphone audio to text.
- The initial interface is intended for one household and one primary owner; multi-user identity and permissions are out of scope for the first release.
- A dark interface with orange activation feedback is the default visual treatment; custom themes are out of scope for the first release.
- Weather, web search, Spotify, Ring, and Tado access is disabled unless the project owner explicitly enables that integration and approves its destination, data boundary, and retention behavior.
- The required confirmation word applies to all requests that cause a side effect; read-only status and information responses may be processed without it unless they trigger an external lookup or other approved side effect.
- The first release will prioritize safe device control, activation, confirmation, and local responses before optional media, camera, weather, and web-search capabilities.
