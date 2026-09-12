# Intent Contract

Ollama output is accepted only when it conforms to this logical schema and passes local
policy validation. The model is never authorized to call an integration directly.

```json
{
  "kind": "device_action",
  "target": "living_room_light",
  "action": "turn_on",
  "parameters": {},
  "requiresConfirmation": true,
  "responseText": "Turning on the living room light.",
  "source": "local"
}
```

## Rules

- `kind` MUST be one of `device_action`, `status_query`, `media_action`,
  `weather_query`, `web_query`, or `help`.
- `target` MUST resolve through configured aliases; model-generated entity IDs are not
  trusted without a configuration match.
- `action` MUST be allowlisted for the resolved target or integration.
- `parameters` MUST be validated against the selected action and bounded in size.
- `requiresConfirmation` MUST be true for any side effect; the service may override a
  false model value to true.
- `responseText` MUST be generated or filtered so it contains no credentials or private
  diagnostic data.
- `source` MUST be `local` unless the selected integration is enabled by policy.
- Invalid, incomplete, ambiguous, or unexpected output MUST be rejected without action.
