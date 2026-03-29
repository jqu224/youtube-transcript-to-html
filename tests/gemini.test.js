import {describe, expect, it, vi} from 'vitest';

import {pingGemini} from '../src/lib/gemini.js';

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
});
