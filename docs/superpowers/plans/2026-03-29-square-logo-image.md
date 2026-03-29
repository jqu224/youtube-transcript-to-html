# Square Logo Image Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the generated SVG logo usage with the provided `src/ui/image.png`, keeping the visible UI logo in a square 1:1 frame and serving the same asset as the favicon.

**Architecture:** Add one shared logo asset constant in the UI branding module, expose the PNG through the worker as `/assets/logo.png`, and update the page markup plus hero styles to render the image inside a square container with `object-fit: contain`. Cover the public behavior with a page-render test and a worker asset-route test.

**Tech Stack:** Node.js ESM, Cloudflare Worker runtime, Vitest, HTML template strings, CSS string assets

---

### Task 1: Lock in visible logo and favicon markup

**Files:**
- Modify: `tests/page.test.js`
- Modify: `src/ui/page.js`
- Modify: `src/ui/brand.js`

- [ ] **Step 1: Write the failing test**

```js
it('renders the png favicon and square hero logo image', () => {
  const html = renderAppPage();

  expect(html).toContain('rel="icon" type="image/png" href="/assets/logo.png"');
  expect(html).toContain('<img class="hero-logo-image" src="/assets/logo.png" alt="YouTube AI Workspace logo">');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/page.test.js`
Expected: FAIL because the page still renders the old SVG data URI favicon and no hero logo image exists

- [ ] **Step 3: Write minimal implementation**

```js
export const LOGO_ASSET_PATH = '/assets/logo.png';
```

Update the page template to:
- use `LOGO_ASSET_PATH` for the favicon link
- add a visible square logo wrapper before the hero copy

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/page.test.js`
Expected: PASS

### Task 2: Serve the PNG asset and style the square frame

**Files:**
- Create: `tests/worker.test.js`
- Modify: `src/worker.js`
- Modify: `src/ui/styles.js`
- Modify: `src/ui/brand.js`

- [ ] **Step 1: Write the failing test**

```js
it('serves the logo asset as png', async () => {
  const response = await worker.fetch(new Request('https://example.com/assets/logo.png'), {});

  expect(response.status).toBe(200);
  expect(response.headers.get('content-type')).toContain('image/png');
  expect((await response.arrayBuffer()).byteLength).toBeGreaterThan(0);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/worker.test.js`
Expected: FAIL with a 404 or missing asset route

- [ ] **Step 3: Write minimal implementation**

```js
if (request.method === 'GET' && url.pathname === '/assets/logo.png') {
  return pngResponse(LOGO_PNG_BYTES);
}
```

Also add hero styles for:
- a square logo shell with a stable 1 / 1 aspect ratio
- an inner image using `width: 100%`, `height: 100%`, and `object-fit: contain`

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/worker.test.js`
Expected: PASS

### Task 3: Verify the integrated change and document it

**Files:**
- Modify: `UPDATE_LOG/2026-03-29_skills-manifest-and-ui-refinement.md`

- [ ] **Step 1: Run focused regression tests**

Run: `npm test -- tests/page.test.js tests/worker.test.js`
Expected: PASS

- [ ] **Step 2: Run broader repo verification**

Run: `npm test`
Expected: PASS

- [ ] **Step 3: Update the daily log**

Append a short section describing the square logo update, the shared PNG asset route, and the affected files.
