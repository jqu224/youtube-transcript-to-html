import {describe, expect, it} from 'vitest';

import worker, {resolveApiErrorPayload, resolveHttpStatus} from '../src/worker.js';

describe('worker api routes', () => {
  it('uses explicit error status when provided', () => {
    expect(resolveHttpStatus({status: 429})).toBe(429);
    expect(resolveHttpStatus({status: 400})).toBe(400);
  });

  it('exposes structured api error payload details', () => {
    const payload = resolveApiErrorPayload({
      message: 'Captcha required',
      code: 'youtube_captcha_required',
      data: {recovery: {openUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'}},
    });

    expect(payload.error).toBe('Captcha required');
    expect(payload.code).toBe('youtube_captcha_required');
    expect(payload.data && payload.data.recovery && payload.data.recovery.openUrl).toContain('youtube.com');
  });

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
