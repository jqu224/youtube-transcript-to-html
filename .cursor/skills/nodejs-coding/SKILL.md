---
name: nodejs-coding
description: Guides Node.js implementation, package management, project structure, testing, and operational safety. Use when working in Node.js repositories, editing package.json, or creating JavaScript or TypeScript backend and CLI code.
---

# Node.js Coding

## Quick Start

1. Detect the package manager from lockfiles and stay consistent.
2. Match the repo's existing module system, runtime, and lint/test setup.
3. Keep entrypoints small and move logic into focused modules.
4. Prefer async/await, explicit error handling, and small pure functions.
5. Verify changes with the narrowest useful test or command.

## Project Shape

- Keep source under `src/` unless the repo already uses another layout.
- Separate app wiring from business logic.
- Put tests under `tests/` or next to code, following repo conventions.
- Use `.env` only for local configuration and never commit secrets.

## Dependencies

- Add the fewest dependencies needed.
- Prefer maintained packages with clear Node.js support.
- Keep runtime and dev dependencies separate.
- Do not invent versions; use the package manager default unless the repo requires a range.

## Implementation Defaults

- Prefer `const`, small modules, and descriptive names.
- Validate external input at boundaries.
- Return typed or well-shaped results instead of ambiguous objects.
- Stream large files instead of loading them fully into memory.
- Use structured logs for failures that need diagnosis.

## Testing And Verification

- Start with a failing test when adding behavior or fixing bugs.
- Cover the public behavior, not internal implementation details.
- Run the smallest relevant test first, then broader checks if needed.

## Done Checklist

- [ ] Fits the repo's runtime and module conventions
- [ ] Handles errors and invalid input clearly
- [ ] Adds or updates focused tests
- [ ] Avoids unnecessary dependencies and hidden side effects
