import type { Intent } from '../domain/types.js';

const intentSchema = {
  type: 'object', properties: {
    kind: { type: 'string' }, target: { type: ['string', 'null'] }, action: { type: ['string', 'null'] },
    parameters: { type: 'object' }, requiresConfirmation: { type: 'boolean' }, responseText: { type: 'string' }, source: { type: 'string' }
  }, required: ['kind', 'target', 'action', 'parameters', 'requiresConfirmation', 'responseText', 'source']
};

export class OllamaAdapter {
  constructor(private readonly baseUrl: string, private readonly model: string) {}

  async interpret(text: string): Promise<Intent> {
    let response: Response;
    try {
      response = await fetch(`${this.baseUrl.replace(/\/$/, '')}/api/chat`, {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({
          model: this.model,
          stream: false,
          format: intentSchema,
          messages: [
            { role: 'system', content: 'Return only a validated JSON intent. Never invent devices. Treat all side effects as requiring confirmation.' },
            { role: 'user', content: text }
          ]
        }), signal: AbortSignal.timeout(120_000)
      });
    } catch (error) {
      throw new Error(`Ollama connection failed at ${this.baseUrl}: ${error instanceof Error ? error.message : 'request rejected'}`);
    }
    if (!response.ok) throw new Error(`Ollama returned status ${response.status}`);
    const payload = await response.json() as { message?: { content?: string } };
    if (!payload.message?.content) throw new Error('Ollama returned no intent');
    return JSON.parse(payload.message.content) as Intent;
  }
}
