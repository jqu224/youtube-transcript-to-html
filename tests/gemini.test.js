import {describe, expect, it} from 'vitest';

import {buildSmartnotePrompt, buildSummaryPrompt, generateSummary} from '../src/lib/gemini.js';

describe('buildSummaryPrompt', () => {
  it('wraps transcript text in a structured prompt', () => {
    const prompt = buildSummaryPrompt('Hello world transcript');

    expect(prompt).toContain('Hello world transcript');
    expect(prompt).toContain('semantic HTML tags');
    expect(prompt.length).toBeGreaterThan(50);
  });
});

describe('buildSmartnotePrompt', () => {
  it('includes transcript and smartnote format instructions', () => {
    const prompt = buildSmartnotePrompt('Hello world transcript');
    expect(prompt).toContain('Hello world transcript');
    expect(prompt).toContain('lightweight smartnotes');
    expect(prompt).toContain('<h2>');
  });
});

describe('generateSummary', () => {
  it('throws when GEMINI_API_KEY is missing', async () => {
    await expect(generateSummary('sample transcript', {}))
      .rejects
      .toThrow(/GEMINI_API_KEY/);
  });
});
