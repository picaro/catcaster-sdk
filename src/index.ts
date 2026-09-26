import { HttpClient, type CatCasterClientOptions } from './http.js';

export { CatCasterError } from './errors.js';
export type { CatCasterClientOptions };

export class CatCaster {
  private readonly http: HttpClient;

  readonly projects: {
    list: () => Promise<{ data: unknown; requestId?: string }>;
    listChannels: (projectId: string) => Promise<{ data: unknown; requestId?: string }>;
  };

  readonly posts: {
    list: (query?: { projectId?: string; status?: string; cursor?: string; limit?: number }) => Promise<{
      data: unknown;
      nextCursor?: string;
      requestId?: string;
    }>;
    get: (postId: string) => Promise<{ data: unknown; requestId?: string }>;
    createDraft: (
      input: Record<string, unknown>,
      options?: { idempotencyKey?: string }
    ) => Promise<{ data: unknown; requestId?: string }>;
    updateDraft: (
      draftId: string,
      input: Record<string, unknown>,
      options?: { idempotencyKey?: string }
    ) => Promise<{ data: unknown; requestId?: string }>;
    generate: (input: Record<string, unknown>) => Promise<{ data: unknown; requestId?: string }>;
    schedule: (
      postId: string,
      input: Record<string, unknown>,
      options?: { idempotencyKey?: string }
    ) => Promise<{ data: unknown; requestId?: string }>;
    publish: (
      postId: string,
      input?: Record<string, unknown>,
      options?: { idempotencyKey?: string }
    ) => Promise<{ data: unknown; requestId?: string }>;
  };

  readonly jobs: {
    get: (jobId: string, query?: { jobType?: string; projectId?: string }) => Promise<{ data: unknown; requestId?: string }>;
  };

  constructor(options: CatCasterClientOptions) {
    this.http = new HttpClient(options);

    this.projects = {
      list: () => this.http.request('GET', '/api/v1/projects'),
      listChannels: (projectId) => this.http.request('GET', `/api/v1/projects/${projectId}/channels`),
    };

    this.posts = {
      list: (query) => {
        const params = new URLSearchParams();
        if (query?.projectId) params.set('projectId', query.projectId);
        if (query?.status) params.set('status', query.status);
        if (query?.cursor) params.set('cursor', query.cursor);
        if (query?.limit) params.set('limit', String(query.limit));
        const qs = params.toString();
        return this.http.request('GET', `/api/v1/posts${qs ? `?${qs}` : ''}`);
      },
      get: (postId) => this.http.request('GET', `/api/v1/posts/${postId}`),
      createDraft: (input, options) =>
        this.http.request('POST', '/api/v1/drafts', input, { idempotencyKey: options?.idempotencyKey }),
      updateDraft: (draftId, input, options) =>
        this.http.request('PATCH', `/api/v1/drafts/${draftId}`, input, { idempotencyKey: options?.idempotencyKey }),
      generate: (input) => this.http.request('POST', '/api/v1/posts/generate', input),
      schedule: (postId, input, options) =>
        this.http.request('POST', `/api/v1/posts/${postId}/schedule`, input, {
          idempotencyKey: options?.idempotencyKey,
        }),
      publish: (postId, input = {}, options) =>
        this.http.request('POST', `/api/v1/posts/${postId}/publish`, input, {
          idempotencyKey: options?.idempotencyKey,
        }),
    };

    this.jobs = {
      get: (jobId, query) => {
        const params = new URLSearchParams();
        if (query?.jobType) params.set('jobType', query.jobType);
        if (query?.projectId) params.set('projectId', query.projectId);
        const qs = params.toString();
        return this.http.request('GET', `/api/v1/jobs/${jobId}${qs ? `?${qs}` : ''}`);
      },
    };
  }
}
