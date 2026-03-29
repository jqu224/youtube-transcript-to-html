# YouTube Transcript To AI Notes

![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-f38020?logo=cloudflare&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-ESM-43853d?logo=node.js&logoColor=white)
![Gemini API](https://img.shields.io/badge/Gemini-AI%20Studio-4285f4?logo=google-gemini&logoColor=white)
![Vitest](https://img.shields.io/badge/Tested_with-Vitest-6e9f18?logo=vitest&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue.svg)

Turn a captioned YouTube video into a live analysis workspace on Cloudflare Workers.

The app loads the video, fetches captions, streams a Chinese editorial HTML summary, and lets the user move across a mindmap, related-videos panel, and people intelligence view with realtime layout and generation controls.

## Screenshots
### Workspace Layout

![Workspace layout](./ref/image.png)

### Summary Style Baseline

![Summary style baseline](./ref/html-example.png)

## What It Ships
- A split-screen workspace inspired by modern AI document/video copilots.
- Upper-left live YouTube embed driven by the YouTube iframe API.
- Lower-left clickable transcript pane with cue-based seeking.
- Right-side tab system:
  - `AI Summary`: streamed Chinese editorial HTML.
  - `Mindmap`: transcript themes rendered as a hierarchy.
  - `Related Videos`: likely next-watch recommendations.
  - `People`: person cards, wiki/search links, and related videos.
- Realtime adjustment controls for theme, width, panel ratio, spacing, emphasis, and generation parameters.
- Cloudflare Worker deployment with a server-side Gemini integration.

## Experience Flow
```mermaid
flowchart LR
userInput[UserInputUrl] --> workerLoad[WorkerLoadsVideoAndCaptions]
workerLoad --> leftPane[LiveVideoAndTranscript]
workerLoad --> summaryStream[GeminiStreamsSummaryHtml]
summaryStream --> summaryTab[SummaryTab]
workerLoad --> mindmapTab[MindmapTab]
workerLoad --> relatedTab[RelatedVideosTab]
workerLoad --> peopleTab[PeopleTab]
styleControls[RealtimeStyleControls] --> summaryTab
generationControls[GenerationControls] --> summaryStream
generationControls --> mindmapTab
generationControls --> relatedTab
generationControls --> peopleTab
```

## Product Surfaces
### `AI Summary`
- Streams partial HTML from Gemini as it is generated.
- Sanitizes the rendered summary client-side before display.
- Targets a premium editorial Chinese article style rather than a plain transcript dump.

### `Mindmap`
- Uses Gemini to produce structured JSON.
- Renders the result as a readable topic tree in the browser.

### `Related Videos`
- Pulls YouTube search candidates from the public search results page.
- Uses Gemini to rank those candidates into likely next-watch picks.
- Falls back to raw ranked candidates if AI ranking is unavailable.

### `People`
- Extracts notable people from the transcript with Gemini.
- Lets the user click a person card to load a detail panel.
- Enriches the detail view with Wikipedia summary data and related YouTube searches.

## Architecture
### Server
- `src/worker.js`: request routing and API surface.
- `src/lib/youtube.js`: YouTube ID parsing, watch-page parsing, caption extraction, search parsing.
- `src/lib/gemini.js`: Gemini streaming and JSON helpers.
- `src/lib/speaker-transcript.js`: baoyu-style speaker transcript prompt (`speaker-transcript.md` bundled as JSON).
- `src/lib/prompt.js`: prompt builders for summary and derived tabs.
- `src/lib/recommendations.js`: related-video ranking flow.
- `src/lib/people.js`: people extraction and detail enrichment.

### Client
- `src/ui/page.js`: HTML shell for the workspace.
- `src/ui/client.js`: tab switching, stream parsing, player sync, transcript seeking, realtime controls.
- `src/ui/styles.js`: glassy dashboard layout plus editorial article styling.

## Project Structure
```text
.
├── src/
│   ├── lib/
│   ├── ui/
│   └── worker.js
├── tests/
├── ref/
├── UPDATE_LOG/
├── package.json
└── wrangler.toml
```

## Quick Start
### 1. Install dependencies

```bash
npm install
```

### 2. Local Gemini key (not committed)

**Recommended:** copy [`config/gemini.local.example.json`](config/gemini.local.example.json) to **`config/gemini.local.json`** and set `GEMINI_API_KEY`. That file is [gitignored](.gitignore). On `npm run dev`, **`predev`** runs [`scripts/sync-gemini-local-to-dev-vars.mjs`](scripts/sync-gemini-local-to-dev-vars.mjs) and merges those values into **`.dev.vars`** so Wrangler can read them.

**Alternative:** `cp .dev.vars.example .dev.vars` and edit the key there (`.dev.vars` is also gitignored).

**Production:** configure `GEMINI_API_KEY` as a Worker secret in the Cloudflare dashboard (`env.GEMINI_API_KEY`); do not rely on `config/gemini.local.json` on the server.

### 3. Run locally

```bash
npm run dev
```

### 4. Deploy

```bash
npm run deploy
```

Deploying from **GitHub** uses Wrangler in CI (see [docs/cloudflare-github-deploy.md](docs/cloudflare-github-deploy.md)). The app HTML is produced by **`src/worker.js`**, not by a static `index.html` at the site root; the repo [index.html](index.html) is only an explanatory stub if you open the project as static files.

### Dependencies

- **`@google/genai`** is installed for the repo (see `package.json`). The Worker currently calls Gemini via **`fetch`** in [`src/lib/gemini.js`](src/lib/gemini.js) for predictable Workers compatibility; you can migrate to the SDK later if you prefer.

## Environment
```bash
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

If a key was ever committed to git or shared in chat, **rotate it** in [Google AI Studio](https://aistudio.google.com/apikey) and update only local `config/gemini.local.json` or `.dev.vars`.

## Baoyu speaker pipeline (local CLI + optional Worker stream)

For captions via the vendored baoyu skill and **streaming Gemini** speaker labeling, see [docs/baoyu-speaker-pipeline.md](docs/baoyu-speaker-pipeline.md). Quick commands: `npm run speakers:fetch`, `npm run speakers:stream`, `npm run speakers:sync-prompt`.

## Scripts
```bash
npm run dev
npm run test
npm run deploy
npm run speakers:fetch -- '<youtube-url>' --speakers
npm run speakers:stream -- --raw path/to/transcript.md
npm run speakers:sync-prompt
```

## Verification
- `npm test`
- `npx wrangler deploy --dry-run`

Current automated coverage focuses on:
- YouTube URL parsing
- transcript normalization
- prompt construction
- render-model helpers

## Known Limitations
- YouTube transcript and search parsing relies on public page structures, so upstream markup changes can break adapters.
- The summary stream is the strongest experience today; the secondary tabs are intentionally built with graceful fallbacks.
- Person detail enrichment prefers Wikipedia plus search links rather than a fully curated knowledge graph.
- The client sanitizes summary HTML, but the app still assumes model output stays within the requested semantic tag set.

## Why This Repo Exists
- Demonstrate a clean Node.js + Cloudflare Worker implementation.
- Show streaming AI output in a UI that feels more like a product than a raw API demo.
- Turn a single YouTube URL into multiple user-facing analysis surfaces without needing a heavyweight frontend framework.

