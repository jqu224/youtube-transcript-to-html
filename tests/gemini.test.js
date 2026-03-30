import {describe, expect, it} from 'vitest';

import {buildSummaryPrompt, generateSummary} from '../src/lib/gemini.js';

describe('buildSummaryPrompt', () => {
  it('wraps transcript text in a structured prompt', () => {
    const prompt = buildSummaryPrompt('Hello world transcript');

    expect(prompt).toContain('Hello world transcript');
    expect(prompt).toContain('semantic HTML tags');
    expect(prompt.length).toBeGreaterThan(50);
  });
});

describe('generateSummary', () => {
  it('throws when GEMINI_API_KEY is missing', async () => {
    await expect(generateSummary('sample transcript', {}))
      .rejects
      .toThrow(/GEMINI_API_KEY/);
  });
});
