import {describe, expect, it} from 'vitest';

import worker from '../src/worker.js';

describe('worker api routes', () => {
  it('returns 400 when transcript url is missing', async () => {
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

  it('returns 400 when summary transcript is missing', async () => {
    const response = await worker.fetch(
      new Request('https://example.com/api/summary', {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({}),
      }),
      {},
    );

    expect(response.status).toBe(400);
    const payload = await response.json();
    expect(payload.error).toMatch(/transcript/i);
  });

  it('returns 400 when smartnote transcript is missing', async () => {
    const response = await worker.fetch(
      new Request('https://example.com/api/smartnote', {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({}),
      }),
      {},
    );

    expect(response.status).toBe(400);
    const payload = await response.json();
    expect(payload.error).toMatch(/transcript/i);
  });

  it('serves the main page and static assets', async () => {
    const page = await worker.fetch(new Request('https://example.com/'), {});
    expect(page.status).toBe(200);
    expect(page.headers.get('content-type')).toContain('text/html');

    const app = await worker.fetch(new Request('https://example.com/assets/app.js'), {});
    expect(app.status).toBe(200);
    expect(app.headers.get('content-type')).toContain('javascript');
  });
});
