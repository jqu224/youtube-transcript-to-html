# AGENT SKILLS MANIFEST

> **INSTRUCTION FOR AI AGENTS**: This repository has custom skills installed under `.cursor/skills/`.
> Before responding to ANY request — including clarifying questions — you MUST:
> 1. Check this list to find the relevant skill(s) for the task.
> 2. Read the matching `SKILL.md` file using the Read tool.
> 3. Follow the instructions inside before proceeding.

## Installed Skills

| Skill folder | When to use |
|---|---|
| `brainstorming` | Before any creative work — new features, components, or behavior changes |
| `coding-essentials` | When implementing features, fixing bugs, reviewing code, or bootstrapping the repo |
| `dispatching-parallel-agents` | When facing 2+ independent tasks that can be done without shared state |
| `executing-plans` | When you have a written implementation plan to execute |
| `finishing-a-development-branch` | When implementation is complete and you need to merge, create a PR, or clean up |
| `nodejs-coding` | When working with Node.js, editing `package.json`, or writing JS/TS backend or CLI code |
| `receiving-code-review` | When receiving code review feedback before implementing suggestions |
| `requesting-code-review` | When completing tasks or major features before merging |
| `subagent-driven-development` | When executing implementation plans with independent tasks in the current session |
| `systematic-debugging` | When encountering any bug, test failure, or unexpected behavior |
| `test-driven-development` | When implementing any feature or bugfix, before writing implementation code |
| `ui-ux-pro-max` | When building or modifying UI components or user-facing design |
| `using-git-worktrees` | Before starting feature work that needs isolation from the current workspace |
| `using-superpowers` | At the START of every conversation — establishes skill discovery and invocation |
| `verification-before-completion` | Before claiming work is complete, fixed, or passing |
| `writing-plans` | When you have a spec or requirements for a multi-step task, before touching code |
| `writing-skills` | When creating, editing, or verifying skills |

## How to load a skill

```
Read: .cursor/skills/<skill-folder>/SKILL.md
```

> These are repo-local skills only. Global skills at `~/.cursor/skills-cursor/` are separate and not listed here.
