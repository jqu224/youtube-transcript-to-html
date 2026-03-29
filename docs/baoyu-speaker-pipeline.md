# Baoyu speaker transcript + Gemini (streaming)

This pipeline follows [`.cursor/skills/baoyu-youtube-transcript/SKILL.md`](../.cursor/skills/baoyu-youtube-transcript/SKILL.md): fetch captions with the Bun CLI, then stream a **speaker-labeled verbatim** markdown through Gemini using the bundled [`speaker-transcript.md`](../.cursor/skills/baoyu-youtube-transcript/prompts/speaker-transcript.md) instructions.

## 1. Fetch raw `--speakers` markdown (local)

Use **single-quoted** URLs in zsh to avoid `?` glob errors.

```bash
npm run speakers:fetch -- 'https://www.youtube.com/watch?v=VIDEO_ID' --speakers
```

Requires [Bun](https://bun.sh/). If you do not have Bun, run the same path with `bun` / `npx -y bun` as described in the skill.

Output layout (default base dir `youtube-transcript/`):

```text
youtube-transcript/{channel-slug}/{title-slug}/
  meta.json
  transcript-raw.json
  transcript.md   # raw speakers file for the next step
  imgs/cover.jpg
  ...
```

Note the path printed by the CLI or open `youtube-transcript/.index.json` to locate the latest run.

## 2. Stream Gemini locally (CLI)

Set `GEMINI_API_KEY` (or use `.dev.vars` in the repo root). Optional: `GEMINI_MODEL`.

```bash
npm run speakers:stream -- --raw youtube-transcript/.../transcript.md -o speaker-final.md
```

Without `-o`, text is written to **stdout** only.

Implementation: [`scripts/stream-speaker-transcript.mjs`](../scripts/stream-speaker-transcript.mjs) uses [`buildSpeakerTranscriptPrompt`](../src/lib/speaker-transcript.js) and [`streamGeminiText`](../src/lib/gemini.js).

## 3. Worker SSE endpoint (optional)

`POST /api/speaker-transcript/stream` with JSON body:

```json
{
  "rawMarkdown": "<full contents of baoyu raw speakers .md>"
}
```

Same SSE shape as summary streaming: events `status`, `speaker_chunk` (payload `{ chunk }`), `error`. Requires `GEMINI_API_KEY` in the Worker environment.

Cloudflare Workers cannot run the Bun CLI; the **fetch step stays local or in CI**. The Worker only runs **raw markdown → Gemini stream**.

## 4. Keep the bundled prompt in sync

If you edit the skill file [`.cursor/skills/baoyu-youtube-transcript/prompts/speaker-transcript.md`](../.cursor/skills/baoyu-youtube-transcript/prompts/speaker-transcript.md), regenerate the JSON bundle consumed by the Worker:

```bash
npm run speakers:sync-prompt
```

This updates [`src/lib/speaker-transcript-instruction.json`](../src/lib/speaker-transcript-instruction.json).

## 5. `ref/example.txt` vs baoyu speaker output

- **[`ref/example.txt`](../ref/example.txt)** is a **thematic summary** with `##` / `###` headings and bullet Q&A lines (`- **Name:** …`). That style is **not** what `speaker-transcript.md` asks for.
- **Baoyu + `speaker-transcript.md`** produces **verbatim dialogue** with chapters, `**Speaker:**` turns, and `[HH:MM:SS → HH:MM:SS]` at the end of paragraphs (see the prompt’s “Transcription Fidelity” and “Dialogue Paragraphs” sections).

If you need the example-style summary, use a separate prompt or the app’s existing **AI Summary** tab (HTML editorial summary), not this pipeline.
