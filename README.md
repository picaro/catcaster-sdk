# @catcaster/sdk

TypeScript client for the [CatCaster](https://www.catcaster.com) public HTTP API (`/api/v1`).

```typescript
import { CatCaster } from '@catcaster/sdk';

const catcaster = new CatCaster({
  apiKey: process.env.CATCASTER_API_KEY!,
});

const { data: projects } = await catcaster.projects.list();
await catcaster.posts.createDraft({
  projectId: 'workspace-uuid',
  content: 'Launch day!',
  channel_ids: ['channel-uuid'],
});
```

Create an API key in **Settings → Developer**. The default base URL is `https://www.catcaster.com`.

```bash
npm install @catcaster/sdk
```

OpenAPI: `https://www.catcaster.com/openapi.json`
