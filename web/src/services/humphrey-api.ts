import type { HistoryViewRecord, PublicConfig, RequestResponse } from '../types/contracts';
const json = { headers: { 'content-type': 'application/json' } };
async function request<T>(url: string, options?: RequestInit): Promise<T> { const response = await fetch(url, options); if (!response.ok) throw new Error(`Local service returned ${response.status}`); return response.json() as Promise<T>; }
export const api = {
  config: () => request<PublicConfig>('/api/config/public'),
  submit: (text: string) => request<RequestResponse>('/api/requests', { ...json, method: 'POST', body: JSON.stringify({ text }) }),
  history: () => request<{ mode: string; records: HistoryViewRecord[] }>('/api/request-history'),
  deleteHistory: () => request<{ deleted: boolean }>('/api/request-history', { ...json, method: 'DELETE', body: JSON.stringify({ confirm: true }) })
};
