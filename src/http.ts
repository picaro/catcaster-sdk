import { CatCasterError, parseErrorResponse } from './errors.js';

export type CatCasterClientOptions = {
  apiKey: string;
  baseUrl?: string;
  fetch?: typeof fetch;
  timeoutMs?: number;
};

export class HttpClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly fetchFn: typeof fetch;
  private readonly timeoutMs: number;

  constructor(options: CatCasterClientOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = (options.baseUrl || 'https://www.catcaster.com').replace(/\/$/, '');
    this.fetchFn = options.fetch || fetch;
    this.timeoutMs = options.timeoutMs ?? 60_000;
  }

  async request<T>(
    method: string,
    path: string,
    body?: unknown,
    init?: { idempotencyKey?: string; signal?: AbortSignal }
  ): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    const signal = init?.signal ?? controller.signal;

    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${this.apiKey}`,
        Accept: 'application/json',
      };
      if (body !== undefined) headers['Content-Type'] = 'application/json';
      if (init?.idempotencyKey) headers['Idempotency-Key'] = init.idempotencyKey;

      const res = await this.fetchFn(`${this.baseUrl}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal,
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw parseErrorResponse(res.status, json);
      return json as T;
    } catch (error) {
      if (error instanceof CatCasterError) throw error;
      if (error instanceof Error && error.name === 'AbortError') {
        throw new CatCasterError('Request timed out', 'TIMEOUT');
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}
