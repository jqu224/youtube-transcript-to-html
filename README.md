# YouTube Transcript To AI Notes

Minimal Cloudflare Worker app that turns a YouTube URL into transcript-backed AI notes.

Current branch scope is intentionally small:
- Fetch captions with `youtube-transcript`
- Generate notes with `@google/genai`
- Render notes in the existing `AI Summary` panel

## Architecture

- `src/worker.js`: serves app shell and API routes
  - `POST /api/transcript` -> returns transcript payload for a YouTube URL
  - `POST /api/summary` -> returns Gemini-generated summary HTML
- `src/lib/youtube.js`: video ID extraction + transcript fetching
- `src/lib/gemini.js`: prompt construction + Gemini summary call
- `src/ui/page.js`: static app HTML
- `src/ui/app-client.js`: browser logic for loading transcript + summary

## Quick Start

1. Install dependencies

```bash
npm install
```

2. Configure local env

```bash
cp .dev.vars.example .dev.vars
```

Set `GEMINI_API_KEY` in `.dev.vars`.

3. Run locally

```bash
npm run dev
```

4. Open

`http://127.0.0.1:8787`

## API Examples

Transcript:

```bash
curl -X POST http://127.0.0.1:8787/api/transcript \
  -H 'content-type: application/json' \
  -d '{"url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'
```

Summary:

```bash
curl -X POST http://127.0.0.1:8787/api/summary \
  -H 'content-type: application/json' \
  -d '{"transcript":"Paste transcript text here"}'
```

## Environment

```bash
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

## Tests

```bash
npm test
```

## Notes

- `README` now reflects only the minimal core refactor
- Larger features (mindmap, people, related videos, streaming, local fallbacks) are deferred to follow-up tasks

