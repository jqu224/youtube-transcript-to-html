# Hide Logo And Purple Favicon Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the visible hero logo from the webpage and switch the favicon to a transparent SVG with a purple gradient play triangle.

**Architecture:** Keep the existing PNG asset route available, but stop using it in the page shell. Define a new inline SVG favicon data URI in the branding module, update the page template to use it, and remove the hero-logo markup plus unused CSS.

**Tech Stack:** Node.js ESM, Cloudflare Worker runtime, Vitest, HTML template strings, CSS string assets

---

### Task 1: Lock in the page-shell behavior

**Files:**
- Modify: `tests/page.test.js`
- Modify: `src/ui/page.js`
- Modify: `src/ui/brand.js`

- [ ] **Step 1: Write the failing test**

```js
it('renders the svg favicon and no visible hero logo image', () => {
  const html = renderAppPage();

  expect(html).toContain('<title id="app-title">YouTube AI Notes</title>');
  expect(html).toContain('rel="icon" type="image/svg+xml"');
  expect(html).toContain('data:image/svg+xml,');
  expect(html).not.toContain('hero-logo-image');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/page.test.js`
Expected: FAIL because the page still uses the PNG favicon and still renders the visible hero logo image

- [ ] **Step 3: Write minimal implementation**

```js
const FAVICON_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>...</defs>
  <path d="M22 16L48 32L22 48Z" fill="url(#play)" />
</svg>
`.trim();
```

Also remove the hero logo markup from the page template.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/page.test.js`
Expected: PASS

### Task 2: Clean up styling and document the change

**Files:**
- Modify: `src/ui/styles.js`
- Modify: `UPDATE_LOG/2026-03-29_skills-manifest-and-ui-refinement.md`

- [ ] **Step 1: Remove unused hero logo styles**

Delete:
- `.hero-logo-frame`
- `.hero-logo-image`
- the dark-mode logo-frame override
- the mobile logo-frame override

Simplify `.hero-brand` to the non-logo layout.

- [ ] **Step 2: Run focused verification**

Run: `npm test -- tests/page.test.js tests/worker.test.js`
Expected: PASS

- [ ] **Step 3: Run full verification**

Run: `npm test`
Expected: PASS

- [ ] **Step 4: Update the daily log**

Append a short note that the visible webpage logo was removed and the favicon now uses a transparent purple SVG play icon.
