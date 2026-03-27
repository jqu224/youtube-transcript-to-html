---
name: coding-essentials
description: Applies repo-aware engineering fundamentals such as planning, minimal changes, TDD, verification, documentation, and clean code. Use when implementing features, fixing bugs, reviewing code, or bootstrapping a repository.
---

# Coding Essentials

## Working Style

1. Read the repo before changing it.
2. Prefer the smallest change that solves the problem cleanly.
3. Reuse existing patterns before introducing new abstractions.
4. Keep code easy to review, test, and revert.

## Development Flow

1. Clarify the goal and affected files.
2. Write or identify the test that should fail first.
3. Implement the minimum change to pass.
4. Refactor only after behavior is covered.
5. Run targeted verification and fix follow-up issues.

## Code Quality

- Use clear names and focused functions.
- Keep side effects near boundaries.
- Make invalid states hard to represent.
- Document non-obvious decisions, not trivial code.
- Prefer explicit behavior over hidden magic.

## Collaboration

- Preserve user changes you did not make.
- Keep commits focused and explain the why.
- Update project documentation when behavior or workflow changes.
- Record meaningful progress in the repo's update log when the project uses one.

## Review Checklist

- [ ] The change solves the stated problem
- [ ] Tests or verification cover the risky behavior
- [ ] Error handling and edge cases are addressed
- [ ] Docs, rules, or logs were updated if needed
