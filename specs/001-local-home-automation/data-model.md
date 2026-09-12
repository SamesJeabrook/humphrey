# Data Model: Local Home Automation Service

## VoiceRequest

Represents one activated speech interaction.

| Field         | Type                                            | Rules                                                              |
| ------------- | ----------------------------------------------- | ------------------------------------------------------------------ |
| id            | opaque string                                   | Unique per request; never contains speech or secrets               |
| receivedAt    | timestamp                                       | Local time for diagnostics only                                    |
| transcript    | ephemeral string                                | Kept in memory only until processing completes; excluded from logs |
| intent        | Intent or null                                  | Must pass schema and policy validation before execution            |
| confirmation  | `missing` or `present`                          | Side effects require `present`                                     |
| state         | SystemState                                     | Must follow the state transitions below                            |
| outcome       | success, rejected, unavailable, failed, or null | Set when processing ends                                           |
| audioEndpoint | AudioEndpoint                                   | Capturing endpoint selected for every spoken response              |

## Intent

The only model output that can reach an adapter.

| Field                | Type                          | Rules                                                                                 |
| -------------------- | ----------------------------- | ------------------------------------------------------------------------------------- |
| kind                 | enum                          | `device_action`, `status_query`, `media_action`, `weather_query`, `web_query`, `help` |
| target               | configured identifier or null | Must resolve to an enabled entity or integration                                      |
| action               | configured action or null     | Must be allowlisted for the target                                                    |
| parameters           | object                        | Schema-validated and bounded per action                                               |
| requiresConfirmation | boolean                       | True for every side effect                                                            |
| responseText         | string                        | Local response; must not contain secrets                                              |
| source               | local or approved-external    | External only when the integration is enabled                                         |

## DeviceEntity

A Home Assistant entity exposed to Humphrey.

| Field           | Type                            | Rules                                                        |
| --------------- | ------------------------------- | ------------------------------------------------------------ |
| entityId        | string                          | Canonical Home Assistant entity ID; unique                   |
| displayName     | string                          | User-facing name; unique within configured household aliases |
| domain          | string                          | Must match an allowed Home Assistant domain                  |
| allowedServices | string[]                        | Explicit service allowlist; empty means no side effects      |
| aliases         | string[]                        | Normalized, non-empty, no duplicate aliases                  |
| enabled         | boolean                         | Disabled entities cannot be targeted                         |
| availability    | available, unavailable, unknown | Refreshed from Home Assistant state                          |

## Integration

A local or explicitly approved external capability.

| Field         | Type                                                                            | Rules                                               |
| ------------- | ------------------------------------------------------------------------------- | --------------------------------------------------- |
| id            | string                                                                          | Unique adapter identifier                           |
| kind          | home_assistant, ollama, whisper, spotify, ring, tado, weather, web, local_media | Determines adapter contract                         |
| enabled       | boolean                                                                         | False by default for optional external integrations |
| endpoint      | local URL or approved URL                                                       | Must match the network policy                       |
| credentialRef | local secret reference or null                                                  | Reference only; never persisted as a secret value   |
| capabilities  | string[]                                                                        | Explicit operations exposed to the intent router    |
| health        | healthy, degraded, unavailable, unknown                                         | Updated by health checks                            |

## NetworkPolicy

The allowlist governing every network call.

| Field             | Type    | Rules                                                           |
| ----------------- | ------- | --------------------------------------------------------------- |
| localEndpoints    | URL[]   | Home Assistant and Ollama endpoints required for core operation |
| optionalEndpoints | URL[]   | Disabled until the corresponding integration is enabled         |
| permittedData     | mapping | Declares data allowed across each endpoint                      |
| retention         | mapping | Declares whether returned data may be retained locally          |

## SystemState

`idle -> activated -> listening -> processing -> awaiting_confirmation -> executing -> completed`

Failure transitions from `activated`, `listening`, `processing`, or `executing` go to
`failed` or `unavailable`. A request without the final "please" goes to
`awaiting_confirmation` and cannot transition to `executing` until confirmation is
present. Only one side-effecting request may be in `executing` at a time.

## AudioEndpoint

Represents the local microphone and speaker route for one voice terminal.

| Field            | Type                           | Rules                                                           |
| ---------------- | ------------------------------ | --------------------------------------------------------------- |
| id               | opaque string                  | Unique local endpoint identifier                                |
| inputDevice      | local device reference         | Captures activation and request audio                           |
| outputDevice     | local device reference         | Receives every spoken response for the request                  |
| displayAvailable | boolean                        | Controls optional UI feedback only; never gates voice operation |
| fallbackOutput   | local device reference or null | Used only when the primary output is unavailable                |

The audio endpoint is selected before request processing and remains associated with
the request through completion, error, and confirmation states.
