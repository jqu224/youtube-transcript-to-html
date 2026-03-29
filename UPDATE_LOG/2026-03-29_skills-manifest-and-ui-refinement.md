# 2026-03-29 — Skills Manifest And UI Refinement

## Superpowers Skills Installed

- **What**: Installed 14 skills from [obra/superpowers](https://github.com/obra/superpowers) (v5.0.6) into `.cursor/skills/`.
- **Skills Added**:
  - `using-superpowers` — entry-point skill that enforces skill-lookup before every response
  - `brainstorming` — structured design-before-code workflow
  - `writing-plans` — produces bite-sized implementation plans (TDD, DRY, YAGNI)
  - `executing-plans` — inline plan execution with review checkpoints
  - `subagent-driven-development` — per-task subagent dispatch with two-stage review; includes `implementer-prompt.md`, `spec-reviewer-prompt.md`, `code-quality-reviewer-prompt.md`
  - `test-driven-development` — Red-Green-Refactor with Iron Law
  - `systematic-debugging` — four-phase root-cause-first debugging
  - `finishing-a-development-branch` — structured merge/PR/discard flow
  - `verification-before-completion` — evidence-before-claims gate
  - `requesting-code-review` — code-reviewer subagent dispatch (includes `code-reviewer.md` template)
  - `receiving-code-review` — technical-rigor reception (no performative agreement)
  - `using-git-worktrees` — isolated workspace creation with safety checks
  - `dispatching-parallel-agents` — parallel agent dispatch for independent tasks
  - `writing-skills` — TDD-adapted skill authoring methodology
- **Files Changed**: 17 new files under `.cursor/skills/` (14 `SKILL.md` + 3 supporting `.md` templates)

### Dialog Summary

- **User asked**: Add `superpowers@claude-plugins-official` to this repo.
- **LLM did**: Fetched all skill files directly from the GitHub source (git clone was hanging), adapted the `using-superpowers` entry point for Cursor's Read-tool pattern, and wrote all 14 skills to `.cursor/skills/`.

## Repo-Local Skills Manifest

- **What**: Added an LLM-facing manifest under `.cursor/skills/AGENT_SKILLS.md` and kept that file trackable while ignoring the rest of `.cursor/skills/`.
- **Files Changed**: `.cursor/skills/AGENT_SKILLS.md`, `.gitignore`

### Dialog Summary

- **User asked**: Keep only repo-local skill names in a tracked manifest and hide the installed skill folders from git.
- **LLM did**: Added `AGENT_SKILLS.md`, documented the installed repo skills and when to use them, and updated `.gitignore` so only the manifest stays visible to git.

## Hero Layout Refinement

- **What**: Restored a separated hero layout with a dedicated title zone and a divided control section below it.
- **Files Changed**: `src/ui/page.js`, `src/ui/styles.js`

### Dialog Summary

- **User asked**: Tighten the top controls, keep the wordmark visible, and put the inputs in their own section below the title area.
- **LLM did**: Reduced control bulk, added spacing so the wordmark fits, vertically centered the title copy, and restored the title/control split layout with a divider and separate control background.

## Bilingual Language Switch

- **What**: Added an `EN / 中文` globe toggle that localizes the UI shell, regenerates AI tabs in the selected language, and switches the transcript panel through cached translation when needed.
- **Files Changed**: `src/ui/page.js`, `src/ui/styles.js`, `src/ui/client.js`, `src/worker.js`, `src/lib/prompt.js`, `src/lib/render-model.js`, `src/lib/transcript.js`, `src/lib/people.js`, `src/lib/recommendations.js`, `tests/prompt.test.js`, `tests/render-model.test.js`, `tests/transcript.test.js`, `docs/superpowers/plans/2026-03-29-bilingual-language-switch.md`

### Dialog Summary

- **User asked**: Put a globe switch in the upper-right title area so the full page, including the transcript, can toggle between English and Chinese.
- **LLM did**: Added the hero toggle, introduced locale-aware prompt generation and transcript translation, cached bilingual content client-side, and covered the new language behavior with focused Vitest tests.

## Locale Toggle Follow-Up Fix

- **What**: Made the toggle update form labels and native select values more reliably by rebuilding option text instead of mutating it in place.
- **Files Changed**: `src/ui/client.js`, `src/ui/locale-utils.js`, `tests/locale-utils.test.js`

### Dialog Summary

- **User asked**: The top controls like `YouTube URL`, `Tone`, and `Length` still stayed in English after clicking `EN / 中文`.
- **LLM did**: Traced the issue to fragile client-side form relabeling, switched the locale updater to explicit label-node updates plus select-option rebuilding, and added a focused test for localized option generation.

## Skills Manifest Cleanup

- **What**: Removed selected local-only skills from the tracked manifest so they stay machine-local instead of being advertised through git.
- **Files Changed**: `.cursor/skills/AGENT_SKILLS.md`

### Dialog Summary

- **User asked**: Keep `ui-ux-pro-max`, `nodejs-coding`, and `coding-essentials` local-only and make sure the tracked repo state no longer exposes them.
- **LLM did**: Confirmed the folders were already ignored by git, removed those entries from the tracked manifest, and verified `ref/image.png` plus `ref/html-example.png` remain tracked in the branch.
