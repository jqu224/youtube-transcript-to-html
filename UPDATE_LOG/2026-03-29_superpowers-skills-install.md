# 2026-03-29 — Superpowers Skills Install

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
