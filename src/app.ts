import Fastify from 'fastify';
import { loadConfig, requireSecret } from './config/load-config.js';
import { HomeAssistantAdapter } from './adapters/home-assistant.js';
import { OllamaAdapter } from './adapters/ollama.js';
import { PiperTextToSpeechAdapter } from './adapters/text-to-speech.js';
import { RequestOrchestrator } from './domain/request-orchestrator.js';
import { registerHealthRoutes } from './api/health-routes.js';
import { registerRequestRoutes } from './api/request-routes.js';
import { registerRequestHistoryRoutes } from './api/request-history-routes.js';
import { registerConfigRoutes } from './api/config-routes.js';
import { registerEventServer } from './api/event-server.js';
import { RequestHistoryStore } from './domain/request-history.js';
import { registerStaticServing } from './api/static-serving.js';

export async function buildApp() {
  const config = await loadConfig();
  const app = Fastify({ logger: true });
  const homeAssistant = new HomeAssistantAdapter(config.homeAssistant.baseUrl, requireSecret(config.homeAssistant.tokenEnv));
  const ollama = new OllamaAdapter(config.ollama.baseUrl, config.ollama.model);
  const speech = new PiperTextToSpeechAdapter(config.audio.piperExecutable, config.audio.piperModel);
  const orchestrator = new RequestOrchestrator(config.devices, homeAssistant, ollama, speech);
  const endpoint = { id: 'main', inputDevice: config.audio.inputDevice, outputDevice: config.audio.outputDevice, fallbackOutput: config.audio.fallbackOutput ?? undefined, displayAvailable: false };
  const history = new RequestHistoryStore('data/request-history.json', config.history.mode, config.history.retentionDays);
  await registerStaticServing(app);
  await registerHealthRoutes(app, config);
  await registerRequestRoutes(app, orchestrator, endpoint, history);
  await registerRequestHistoryRoutes(app, history);
  await registerConfigRoutes(app, config);
  registerEventServer(app);
  return { app, config };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { app, config } = await buildApp();
  await app.listen({ host: config.server.host, port: config.server.port });
}
