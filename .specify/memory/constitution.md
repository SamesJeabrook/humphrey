<!--
Sync Impact Report
- Version change: 1.1.0 -> 1.2.0
- Modified principles: IV. Safe, Testable Automation; V. Simple, Observable Node.js Services; Development Workflow and Quality Gates
- Added sections: none
- Removed sections: none
- Follow-up TODOs: Confirm the historical ratification date before the first release.
-->

# Humphrey Home Automation Constitution

## Core Principles

### I. Local-First Operation

Every runtime capability MUST operate on the local Linux Mint system and communicate
only with explicitly configured devices on the local network. Home Assistant is the
automation and device integration boundary; Ollama is the local language-model
boundary. The system MUST NOT send audio, transcripts, prompts, device state, or
automation data to cloud services. This preserves privacy, predictable operation,
and control over the home environment.

### II. Explicit Device and Action Boundaries

The application MUST interact with Home Assistant through an explicit, documented
interface and MUST limit commands to configured local entities and services. User
speech MUST be translated into a validated intent before any device action is
performed. Unknown devices, ambiguous intents, unsupported services, and unsafe
requests MUST fail closed with a clear local explanation rather than guessing.

### III. Secret and Data Safety

Secrets, access tokens, credentials, and private configuration MUST be supplied
through environment variables or local secret storage and MUST NOT be committed,
logged, displayed in error messages, sent to Ollama, or included in generated
artifacts. Persistent data MUST remain on the local system, and collection MUST be
limited to what is required for the requested automation. Logs MUST redact secrets
and sensitive speech or device data by default.

### IV. Safe, Testable Automation

Automation behavior MUST be deterministic once an intent has been validated. Each
new or changed unit of application logic MUST include focused unit tests, and each
new integration, intent, and safety rule MUST have automated tests at the narrowest
useful level, with contract or integration tests covering Home Assistant, Ollama,
audio, and other adapter boundaries where practical. Destructive, high-impact, or
difficult-to-reverse actions MUST require an explicit confirmation policy and MUST
be observable in local logs.

### V. Simple, Observable Node.js Services

The implementation MUST use Node.js and favor small, composable modules with clear
interfaces over speculative abstractions. Runtime failures MUST produce actionable
local diagnostics without exposing secrets. Code MUST be self-documenting through
clear names, focused modules, explicit interfaces, and concise comments only where
the reasoning is not obvious. Source files SHOULD generally remain at or below 300
lines of code, excluding generated files, vendored code, and static assets. When a
cohesive source file exceeds that guideline, the change MUST either split the file
along a clear responsibility boundary or document the exception and its rationale
in review. Public behavior and configuration changes MUST be documented, and
breaking changes MUST be called out explicitly in the change record.

## Security and Locality

The supported operating environment is Linux Mint. Network access MUST be allowlisted
to the local Home Assistant and Ollama endpoints and any explicitly configured local
devices. The project MUST avoid cloud SDKs, remote telemetry, hosted model APIs, and
external speech-processing services. Dependencies MUST be reviewed for network,
filesystem, and credential-handling behavior before adoption.

## Development Workflow and Quality Gates

Changes MUST proceed from a current specification to an implementation plan and
actionable tasks. Before implementation is considered complete, required unit tests,
contract tests, and relevant integration tests MUST pass; configuration and failure
paths MUST be reviewed; and local-only network
behavior MUST be verified. A change that weakens privacy, expands network scope, or
allows unconfirmed high-impact actions requires an explicit constitution amendment
or a documented justification approved during review. Documentation describing how
the system is installed, configured, connected, secured, operated, and recovered
MUST match the actual system setup. Setup documentation MUST be followed during
implementation and deployment; deviations MUST be recorded with their rationale,
impact, and required documentation updates before release.

## Governance

This constitution is the governing source for project principles and supersedes
conflicting informal practices. Amendments MUST describe the reason, affected
principles, security and operational impact, migration needs, and updated version.
Versioning follows semantic rules: MAJOR for incompatible removals or redefinitions,
MINOR for new principles or materially expanded requirements, and PATCH for
clarifications or non-semantic wording changes. Every implementation review MUST
check compliance with this document, and unresolved violations MUST block release
until they are corrected or explicitly accepted by the project owner.

**Version**: 1.2.0 | **Ratified**: TODO(RATIFICATION_DATE): confirm initial adoption date | **Last Amended**: 2026-09-12
