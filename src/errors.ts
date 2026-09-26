export class CatCasterError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly requestId?: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = 'CatCasterError';
  }
}

export function parseErrorResponse(status: number, body: unknown): CatCasterError {
  const record = body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
  const err = record.error && typeof record.error === 'object' ? (record.error as Record<string, unknown>) : {};
  const code = String(err.code || 'API_ERROR');
  const message = String(err.message || 'Request failed');
  const requestId = typeof err.requestId === 'string' ? err.requestId : undefined;
  return new CatCasterError(message, code, requestId, status);
}
