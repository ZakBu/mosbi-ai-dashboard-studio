# mos.bi AI Dashboard Studio

Figma-like dashboard editor for assembling BI screens from trusted widget libraries.

The current product path is intentionally narrow:

- `/` — landing / router page;
- `/dashboard-kit` — Tremor-first widget library;
- `/dashboards/editor` — Figma-like editor with AI chat, 16:9 canvas, inspector and toolbar;
- `/settings/ai` — AI provider settings;
- `/embed/:id` — iframe-ready published editor document.

Legacy MVP routes and the old Anthropic studio were removed from the packaged version.

## Stack

- Next.js 15
- React 19
- Tailwind CSS
- `@tremor/react` as the first base widget library
- `react-rnd` for canvas drag/resize
- `@tabler/icons-react` for editor controls
- OpenAI / Ollama / demo AI provider gateway

## Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000/dashboard-kit](http://localhost:3000/dashboard-kit).

## AI Providers

The app works without secrets in `demo` mode. To enable real providers, create `.env.local` locally. Do not commit it.

```bash
AI_PROVIDER=demo

# Optional
OPENAI_API_KEY=your-local-key
OPENAI_MODEL=gpt-4.1-mini

# Optional local model
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1
```

## API Smoke

Run the production server first:

```bash
npm run build
npm start
```

Then in another terminal:

```bash
npm run test:api
npm run test:ui
```

`test:api` verifies:

- AI settings;
- editor build;
- Tremor-only active registry;
- scoped comment patch;
- patch apply;
- iframe embed rendering.

## Product Notes

- AI must return JSON dashboard schema, not arbitrary React/CSS.
- The active component registry is currently Tremor-only.
- Comment patches are scoped to selected widgets and return locked widget ids.
- Embed rendering uses `DashboardDocument` from the editor store.

## Roadmap

See [ROADMAP.md](ROADMAP.md).
