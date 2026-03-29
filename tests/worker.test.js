import {describe, expect, it} from 'vitest';

import worker from '../src/worker.js';

describe('worker asset routes', () => {
  it('serves the simplified version transcript page and script', async () => {
    const page = await worker.fetch(new Request('https://example.com/simplified-version'), {});
    expect(page.status).toBe(200);
    const html = await page.text();
    expect(html).toContain('simplified-version-transcript');

    const script = await worker.fetch(new Request('https://example.com/assets/simplified-version.js'), {});
    expect(script.status).toBe(200);
    expect(script.headers.get('content-type')).toContain('javascript');
  });

  it('returns ping failure when GEMINI_API_KEY is unset and not using local SiliconFlow', async () => {
    const response = await worker.fetch(
      new Request('https://example.com/api/gemini/ping', {
        method: 'POST',
        headers: {'content-type': 'application/json'},
      }),
      {},
    );

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.ok).toBe(false);
    expect(payload.error).toMatch(/GEMINI_API_KEY/i);
  });

  it('returns ping failure when AI_ENV is local but SILICONFLOW_API_KEY is unset', async () => {
    const response = await worker.fetch(
      new Request('https://example.com/api/gemini/ping', {
        method: 'POST',
        headers: {'content-type': 'application/json'},
      }),
      {AI_ENV: 'local'},
    );

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.ok).toBe(false);
    expect(payload.error).toMatch(/SILICONFLOW_API_KEY/i);
  });

  it('rejects speaker transcript stream without rawMarkdown', async () => {
    const response = await worker.fetch(
      new Request('https://example.com/api/speaker-transcript/stream', {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({}),
      }),
      {},
    );

    expect(response.status).toBe(400);
    const payload = await response.json();
    expect(payload.error).toMatch(/rawMarkdown/i);
  });

  it('rejects transcript request without url', async () => {
    const response = await worker.fetch(
      new Request('https://example.com/api/transcript', {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({}),
      }),
      {},
    );

    expect(response.status).toBe(400);
    const payload = await response.json();
    expect(payload.error).toMatch(/url/i);
  });

  it('serves the logo asset as png', async () => {
    const response = await worker.fetch(new Request('https://example.com/assets/logo.png'), {});

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('image/png');
    expect((await response.arrayBuffer()).byteLength).toBeGreaterThan(0);
  });

  it('serves Chrome DevTools well-known probe as empty JSON', async () => {
    const response = await worker.fetch(
      new Request('https://example.com/.well-known/appspecific/com.chrome.devtools.json'),
      {},
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/json');
    expect(await response.text()).toBe('{}');
  });
});
