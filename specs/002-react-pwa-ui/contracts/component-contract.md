# Component Contract

The UI must be organized around focused components with explicit props and no direct
Home Assistant, Ollama, or credential access.

- `AppShell`: application layout, install/update state, and route-level composition.
- `ConnectionStatus`: service and WebSocket connectivity.
- `ServiceStatePanel`: visual state, message, and orange listening treatment.
- `RequestComposer`: input validation and request submission.
- `RequestOutcome`: current request result and error state.
- `HistoryPanel`: history-mode-aware record display and delete confirmation.
- `InstallPrompt`: optional PWA installation and update controls.

Data fetching and WebSocket lifecycle belong in client service/hooks modules. Components
receive typed data and callbacks, remain independently testable, and do not own network
credentials or device-control logic.
