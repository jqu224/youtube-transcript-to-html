# YouTube Transcript To HTML

![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-f38020?logo=cloudflare&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-ESM-43853d?logo=node.js&logoColor=white)
![Gemini API](https://img.shields.io/badge/Gemini-AI%20Studio-4285f4?logo=google-gemini&logoColor=white)
![Vitest](https://img.shields.io/badge/Tested_with-Vitest-6e9f18?logo=vitest&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue.svg)

Turn a captioned YouTube video into a live analysis workspace on Cloudflare Workers.

The app loads the video, fetches captions, streams a Chinese editorial HTML summary, and lets the user move across a mindmap, related-videos panel, and people intelligence view with realtime layout and generation controls.

## Screenshots
### Workspace Layout

![Workspace layout](./ref/layout.png)

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

### 2. Create local Worker env vars

```bash
cp .dev.vars.example .dev.vars
```

Then add your Gemini API key to `.dev.vars`.

### 3. Run locally

```bash
npm run dev
```

### 4. Deploy

```bash
npm run deploy
```

## Environment
```bash
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

## Scripts
```bash
npm run dev
npm run test
npm run deploy
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

