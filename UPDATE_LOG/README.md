# Update Log

This folder keeps short, GitHub-renderable records of meaningful repo work by LLMs and humans.

## Repo Status

- **Latest entry**: [2026-03-30 - workspace layout and transcript virtualization](2026-03-30_summary.md)
- **Current branch focus**: recover workspace loading, keep the live player embedded and syncable, and stabilize local transcript extraction
- **Local runtime status**:
  - Browser tab branding is wired through the app shell
  - Workspace loading now restores transcript data locally through the dev fetch proxy plus transcript helper
  - The `Live Video` mount now waits for the real YouTube API instead of dropping into the non-syncable iframe fallback
  - `Related Videos` still works locally through its fallback recommendation path
  - `Summary`, `Mindmap`, `People`, and transcript translation still need local `.dev.vars` with `GEMINI_API_KEY`

## Current Todo

- Unhide **Detail Pane** (`#detail-pane-section` in [`src/ui/page.js`](src/ui/page.js)) when the sidebar should ship again
- Unhide **Generation Controls** (`#generation-controls-section` in [`src/ui/page.js`](src/ui/page.js)) when the sidebar should ship again
- Add local `.dev.vars` with `GEMINI_API_KEY` and re-verify `Summary`, `Mindmap`, `People`, and transcript translation
- Browser-check that transcript auto-follow rolls against real playback inside `Live Video`
- Watch first-load latency on local transcript recovery and trim it if it becomes a recurring pain point

## Conventions

- Use one daily file named `YYYY-MM-DD_summary.md`
- Keep `2026-03-28_000000_initial-plan.md` as the special standalone initial log
- Append multiple updates for the same day into that day's file
- Review the current daily filename summary whenever the repo is updated, and rename the file if the summary no longer fits
- Keep entries sorted newest-first by day
- Summarize the request, work completed, and files changed
- Keep dialog summaries concise

## Daily Entries

- [2026-03-30 - workspace layout and transcript virtualization](2026-03-30_summary.md)
- [2026-03-29 - skills, branding, and runtime recovery](2026-03-29_summary.md)
- [2026-03-28 - repo-setup-and-worker-app](2026-03-28_repo-setup-and-worker-app.md)

## Initial Plan

- [2026-03-28 00:00:00 - initial-plan](2026-03-28_000000_initial-plan.md)
