# Research: React Progressive Web App Interface

## Decision: Use React with Vite and CSS Modules in a separate `web/` client

**Rationale**: React provides component boundaries for live state, request submission,
history, connection status, and shared controls. Vite gives a small, fast browser build
that can be served by the existing Node.js service. CSS Modules keep visual styles local
to components and reduce accidental global coupling.

**Alternatives considered**: Extending the current vanilla UI was rejected because the
feature explicitly requires componentization and a maintainable UI structure. A larger
frontend framework was deferred because the interface is a local single-client surface.

## Decision: Use `vite-plugin-pwa` for an installable application shell only

**Rationale**: The service worker can cache static assets and the application shell while
runtime API, WebSocket, request history, transcripts, credentials, device state, and
model output remain network-only. Updates must invalidate the shell without retaining
private data.

**Alternatives considered**: Offline caching of API responses was rejected because it
could expose stale or private household data. A native mobile client is deferred to a
separate future feature.

## Decision: Keep the Node.js service as the only authority

**Rationale**: The PWA communicates through the existing local HTTP and WebSocket
contracts. It never calls Home Assistant, Ollama, or optional integrations directly.
This preserves the existing safety, network-policy, and credential boundaries.

**Alternatives considered**: Direct browser-to-Home-Assistant access was rejected because
it would expose service boundaries and complicate credential handling.

## Decision: Serve the built PWA from the existing local service

**Rationale**: Serving the compiled assets from Fastify keeps deployment to one local
process and one local origin. The UI can be reached at the existing local address and
remains optional for voice operation.

**Alternatives considered**: A separate frontend development server is useful during
development but is not the production deployment boundary.
