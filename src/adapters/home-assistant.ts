import type { DeviceEntity } from '../domain/types.js';

export class HomeAssistantAdapter {
  constructor(private readonly baseUrl: string, private readonly token: string) {}

  private headers(): HeadersInit { return { authorization: `Bearer ${this.token}`, 'content-type': 'application/json' }; }

  async healthCheck(): Promise<boolean> {
    const response = await fetch(`${this.baseUrl.replace(/\/$/, '')}/api/`, { headers: this.headers() });
    return response.ok;
  }

  async callService(device: DeviceEntity, service: string, data: Record<string, unknown> = {}): Promise<void> {
    const response = await fetch(`${this.baseUrl.replace(/\/$/, '')}/api/services/${device.domain}/${service}`, {
      method: 'POST', headers: this.headers(), body: JSON.stringify({ ...data, entity_id: device.entityId })
    });
    if (!response.ok) throw new Error(`Home Assistant service failed with status ${response.status}`);
  }
}
