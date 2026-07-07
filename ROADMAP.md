# mos.bi AI Dashboard Studio — development roadmap

## Product Direction

mos.bi should become a Figma-like environment for building executive, analytical and operational dashboards from trusted data and ready-made widget libraries.

The user workflow stays:

1. Open landing page.
2. Choose a widget or composition in the dashboard kit.
3. Open the Figma-like editor.
4. Describe the management question in AI chat.
5. AI builds a dashboard schema from approved components.
6. User edits the canvas, inspector settings and scoped comments.
7. Publish as an iframe-ready dashboard.

## Current Packaged Scope

Included:

- Landing page.
- Tremor widget library.
- Dashboard editor with left AI chat, center 16:9 canvas, right inspector, top menu and bottom toolbar.
- Drag, resize and select on canvas.
- AI settings for demo, OpenAI and Ollama.
- Editor build API.
- Editor patch API.
- Scoped comment patch API.
- Editor iframe embed route.
- Tremor-only active component registry.

Removed:

- Old MVP generator.
- Old Anthropic studio.
- Legacy `/api/mvp/*`, `/api/plan`, `/api/data`.
- MVP dashboard renderer and engine.

## P0.1 — Make The Editor Feel Real

- Make every top menu item open a real lightweight menu: File, Edit, Insert, View, Data, Publish.
- Implement real undo / redo stack.
- Add copy, paste, duplicate, delete and lock keyboard shortcuts.
- Add canvas zoom controls and fit-to-screen.
- Add snap guides and alignment helpers.
- Add page background controls.
- Add multi-select and group / ungroup.
- Persist editor documents beyond in-memory storage.

## P0.2 — Expand The Widget Library

- Keep Tremor as the first clean baseline.
- Add a second library track for Tabler-style dashboard blocks.
- Add a third track for motion/visual blocks only where they are real imported or vendored source components.
- Store source metadata for every component:
  - `componentId`;
  - `sourceLibrary`;
  - `sourceUrl`;
  - `propsSchema`;
  - `dataRequirements`;
  - `minSize`;
  - `defaultSize`;
  - `supportedIntents`;
  - `aiDescription`.
- Add visual regression tests for each widget card and editor adapter.

## P0.3 — AI Integration

- Replace demo editor build with a real registry-constrained AI planner.
- System prompt rules:
  - use only registry components;
  - never generate raw React or CSS;
  - return `DashboardDocument` JSON;
  - preserve locked and manually edited widgets;
  - use patches for comments;
  - explain data assumptions.
- Add provider selection per workspace.
- Add Ollama local model health checks.
- Add token budget controls:
  - send dataset profile, not full dataset;
  - send selected widgets, not the full document, for scoped comments;
  - summarize previous chat turns;
  - cap output to schema patches.

## P0.4 — Data And Trust

- Add CSV upload to editor.
- Add PostgreSQL connector.
- Add semantic metric catalog:
  - name;
  - formula;
  - source;
  - owner;
  - allowed dimensions;
  - update frequency;
  - access rules.
- Add widget trust panel: source, formula, filters, freshness, owner and query id.
- Add validation before publish.

## P1 — Product Workflows

- Workspace and dashboard list.
- Drafts, published dashboards and templates.
- Comments as first-class objects on canvas coordinates, widgets and selected regions.
- Version history and diff preview before AI changes.
- Saved views and filter states.
- PDF / PNG export.
- Mobile preview.
- TV mode.

## P2 — Platform

- Multi-library component marketplace.
- Custom widget adapters.
- MCP integration for design references and enterprise tools.
- Role-based AI agents: analyst, BI designer, data steward, admin.
- Co-editing.
- Scheduled refresh and alert rules.
- Presentation and executive memo generation from dashboards.
