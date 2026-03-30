# YouTube Transcript To AI Notes

Minimal Cloudflare Worker app that turns a YouTube URL into transcript-backed AI notes.

Current branch scope is intentionally small:
- Fetch captions with `youtube-transcript`
- Generate notes with `@google/genai`
- Render notes in the existing `AI Summary` panel
- Provide a local `yt-dlp` fallback when YouTube blocks transcript scraping

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
YOUTUBE_KEY=your_youtube_data_api_key_here
YOUTUBE_CLIENT_ID=your_google_oauth_web_client_id_here
LOCAL_TRANSCRIPT_FALLBACK_URL=http://127.0.0.1:8799
```

### Captcha/Rate-Limit Workaround

When YouTube blocks transcript requests with captcha/anti-bot checks:

1. Start local fallback server:

```bash
npm run dev:fallback
```

2. Keep `LOCAL_TRANSCRIPT_FALLBACK_URL` in `.dev.vars` (defaults to `http://127.0.0.1:8799`)
3. Retry in the UI after completing verification on YouTube

The app now shows a guided recovery card with:
- `Open YouTube Check`
- `Retry Load Workspace`

### About `YOUTUBE_KEY`

When `YOUTUBE_KEY` is set, the app now attempts:
1. `youtube/v3/captions.list` via API key
2. public `timedtext` fetch using discovered caption language

When `YOUTUBE_CLIENT_ID` is also set, the frontend shows `Authorize YouTube` and can send OAuth access token to Worker; transcript loading then tries OAuth captions path first, then API key path.  
If those paths fail, it now falls back to `youtube-caption-extractor`, then `youtube-transcript`, then local `yt-dlp` fallback (if configured).  
`YOUTUBE_KEY` can improve track discovery in some cases but still does not guarantee transcripts for every random video.

When Worker-side fetch hits anti-bot limits, the recovery card can open `/popup/youtube-transcript-auth`.  
That popup runs OAuth in the browser, fetches transcript on the user's local network, and sends transcript payload back to the main page via `postMessage`.

## Tests

```bash
npm test
```

## Notes

- `README` now reflects only the minimal core refactor
- Larger features (mindmap, people, related videos, streaming, local fallbacks) are deferred to follow-up tasks

