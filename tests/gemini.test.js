import {describe, expect, it, vi} from 'vitest';

import {formatGeminiPingEmptyError, pingGemini} from '../src/lib/gemini.js';

describe('pingGemini', () => {
  it('throws when API returns non-OK', async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: false,
      text: () => Promise.resolve('bad'),
    });
    await expect(
      pingGemini({apiKey: 'test-key', model: 'gemini-2.5-flash', fetchFn}),
    ).rejects.toThrow(/Gemini ping failed/);
  });

  it('parses successful response', async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          candidates: [{content: {parts: [{text: 'OK'}]}}],
        }),
    });
    const out = await pingGemini({apiKey: 'test-key', model: 'gemini-2.5-flash', fetchFn});
    expect(out.model).toBe('gemini-2.5-flash');
    expect(fetchFn).toHaveBeenCalled();
  });

  it('throws with finishReason when text is empty', async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          candidates: [{finishReason: 'SAFETY', content: {parts: [{text: ''}]}}],
        }),
    });
    await expect(pingGemini({apiKey: 'test-key', model: 'gemini-2.5-flash', fetchFn})).rejects.toThrow(
      /finishReason: SAFETY/,
    );
  });
});

describe('formatGeminiPingEmptyError', () => {
  it('mentions prompt blockReason', () => {
    const msg = formatGeminiPingEmptyError({
      promptFeedback: {blockReason: 'SAFETY', blockReasonMessage: 'test'},
    });
    expect(msg).toMatch(/prompt blocked: SAFETY/);
  });
});
