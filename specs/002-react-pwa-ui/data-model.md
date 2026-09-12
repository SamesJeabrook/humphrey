# Data Model: React Progressive Web App Interface

## VisualServiceState

The browser projection of the local service state.

| Field      | Type                                                                                                     | Rules                                     |
| ---------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| state      | idle, activated, listening, processing, awaiting_confirmation, executing, completed, failed, unavailable | Must match the service contract           |
| message    | string                                                                                                   | User-facing, no secrets or stack traces   |
| requestId  | string or null                                                                                           | References a local request when available |
| receivedAt | timestamp                                                                                                | Used to reject older state events         |

## ConnectionState

| Field        | Type                                  | Rules                                                       |
| ------------ | ------------------------------------- | ----------------------------------------------------------- |
| service      | connected, disconnected, unavailable  | Live health/API connection state                            |
| events       | connected, reconnecting, disconnected | WebSocket state-event status                                |
| lastSequence | number                                | Monotonically increasing local event sequence when supplied |

## HistoryViewRecord

A browser-safe projection of a RequestHistoryRecord. The fields shown depend on the
configured history mode and are never used to infer permissions.

| Field            | Type                                   | Rules                                        |
| ---------------- | -------------------------------------- | -------------------------------------------- |
| id               | string                                 | Local record identifier                      |
| createdAt        | timestamp                              | Displayed in the local timezone              |
| requestText      | string or null                         | Present only when permitted by history mode  |
| normalizedIntent | string or null                         | Optional review summary                      |
| personName       | string or null                         | Present only for a valid local speaker match |
| targetCapability | string or null                         | Must not expose credentials                  |
| outcome          | success, rejected, unavailable, failed | Displayed with accessible status text        |
| expiresAt        | timestamp                              | Displayed so the owner understands retention |

## ApplicationShell

Static assets for the installable PWA. It may be cached by the service worker. It must
not contain transcripts, request history, credentials, device state, API responses, or
model output.
