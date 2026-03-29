# Bilingual Language Switch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an `EN / 中文` globe toggle that switches the full workspace between English and Chinese, including static UI copy, AI-generated tabs, and the transcript panel.

**Architecture:** Keep English as the default server-rendered shell, then let the client own locale state and rerender localized copy. The worker will accept a selected output language for all AI generation endpoints and expose a transcript-translation endpoint so transcript cues can be translated and cached per locale on demand.

**Tech Stack:** Cloudflare Worker, vanilla JavaScript, Gemini API, Vitest

---

### Task 1: Add locale-aware model and prompt tests

**Files:**
- Modify: `tests/render-model.test.js`
- Modify: `tests/prompt.test.js`

- [ ] **Step 1: Write the failing render-model test**

```js
it('defaults generation language to english and normalizes invalid values', () => {
  expect(normalizeGenerationOptions({}).language).toBe('en');
  expect(normalizeGenerationOptions({language: 'zh'}).language).toBe('zh');
  expect(normalizeGenerationOptions({language: 'fr'}).language).toBe('en');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/render-model.test.js`
Expected: FAIL because `language` is missing or not normalized.

- [ ] **Step 3: Write the failing prompt tests**

```js
it('builds summary prompts in english when requested', () => {
  const prompt = buildSummaryPrompt({
    video,
    transcriptEntries,
    options: {language: 'en'},
  });

  expect(prompt).toContain('Write in fluent English.');
  expect(prompt).toContain('Start with one strong <h1> title in English.');
});

it('builds transcript translation prompts with target language instructions', () => {
  const prompt = buildTranscriptTranslationPrompt({
    transcriptEntries,
    targetLanguage: 'zh',
  });

  expect(prompt).toContain('"entries"');
  expect(prompt).toContain('Simplified Chinese');
});
```

- [ ] **Step 4: Run tests to verify they fail**

Run: `npm test -- tests/render-model.test.js tests/prompt.test.js`
Expected: FAIL because language-aware prompt behavior and transcript translation prompts do not exist yet.

### Task 2: Add locale-aware generation and transcript translation helpers

**Files:**
- Modify: `src/lib/render-model.js`
- Modify: `src/lib/prompt.js`
- Create: `src/lib/transcript.js`
- Test: `tests/render-model.test.js`
- Test: `tests/prompt.test.js`

- [ ] **Step 1: Implement generation language normalization**

```js
export const SUPPORTED_LANGUAGES = new Set(['en', 'zh']);

function normalizeLanguage(value) {
  return SUPPORTED_LANGUAGES.has(value) ? value : 'en';
}
```

- [ ] **Step 2: Implement localized prompt instructions**

```js
function getLanguageInstruction(language) {
  return language === 'zh'
    ? {
        proseName: 'Simplified Chinese',
        writingRule: 'Write in fluent Simplified Chinese.',
      }
    : {
        proseName: 'English',
        writingRule: 'Write in fluent English.',
      };
}
```

- [ ] **Step 3: Add transcript translation prompt and helper**

```js
export async function translateTranscript(...) {
  // chunk transcript entries, ask Gemini for JSON-only translations,
  // and merge translated text back onto the original cue metadata
}
```

- [ ] **Step 4: Run focused tests**

Run: `npm test -- tests/render-model.test.js tests/prompt.test.js`
Expected: PASS

### Task 3: Add worker API support for selected language

**Files:**
- Modify: `src/worker.js`
- Modify: `src/lib/people.js`
- Modify: `src/lib/recommendations.js`
- Modify: `src/lib/prompt.js`

- [ ] **Step 1: Pass selected language through every AI endpoint**

```js
options: normalizeGenerationOptions(body.options)
```

- [ ] **Step 2: Add transcript translation endpoint**

```js
if (request.method === 'POST' && url.pathname === '/api/transcript/translate') {
  return handleTranscriptTranslation(request, env);
}
```

- [ ] **Step 3: Localize server fallback strings**

```js
const fallbackMessage = language === 'zh'
  ? '暂时没有抓到可用的 YouTube 搜索结果。'
  : 'No usable YouTube search results were available yet.';
```

- [ ] **Step 4: Run tests to verify worker-adjacent behavior stays green**

Run: `npm test -- tests/prompt.test.js tests/render-model.test.js tests/youtube.test.js`
Expected: PASS

### Task 4: Add bilingual client UI and locale caching

**Files:**
- Modify: `src/ui/page.js`
- Modify: `src/ui/client.js`
- Modify: `src/ui/styles.js`

- [ ] **Step 1: Add the globe language toggle in the hero title area**

```js
<button id="locale-toggle" type="button">
  <span aria-hidden="true">...</span>
  <span>EN / 中文</span>
</button>
```

- [ ] **Step 2: Add a client-side translation dictionary and locale state**

```js
const state = {
  locale: 'en',
  localized: {
    en: createLocaleCache(),
    zh: createLocaleCache(),
  },
};
```

- [ ] **Step 3: Re-render static copy, transcript, and active AI tab on switch**

```js
refs.localeToggle.addEventListener('click', toggleLocale);
```

- [ ] **Step 4: Translate transcript on demand and cache by locale**

```js
if (!localeCache.transcriptEntries) {
  await loadTranscriptTranslation(nextLocale);
}
```

- [ ] **Step 5: Run the app tests**

Run: `npm test`
Expected: PASS

### Task 5: Update repo logs and verify completion

**Files:**
- Modify: `UPDATE_LOG/2026-03-29_skills-manifest-and-ui-refinement.md`
- Modify: `UPDATE_LOG/README.md`

- [ ] **Step 1: Append a short update-log entry for the bilingual switch**

```md
## Bilingual Language Switch
- **What**: Added an EN / 中文 toggle with localized UI, AI outputs, and transcript translation.
```

- [ ] **Step 2: Review whether the daily filename summary still fits**

```md
- [2026-03-29 - skills-manifest-and-ui-refinement](...)
```

- [ ] **Step 3: Run final verification**

Run: `npm test`
Expected: PASS
