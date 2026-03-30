import {describe, expect, it} from 'vitest';

import {extractVideoId, fetchTranscriptViaApiKey, fetchTranscriptViaOAuth, mapTranscriptFetchError} from '../src/lib/youtube.js';

describe('extractVideoId', () => {
  it('extracts from standard watch URL', () => {
    expect(extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ'))
      .toBe('dQw4w9WgXcQ');
  });

  it('extracts from youtu.be short URL', () => {
    expect(extractVideoId('https://youtu.be/dQw4w9WgXcQ'))
      .toBe('dQw4w9WgXcQ');
  });

  it('extracts from embed URL', () => {
    expect(extractVideoId('https://www.youtube.com/embed/dQw4w9WgXcQ'))
      .toBe('dQw4w9WgXcQ');
  });

  it('extracts bare 11-char ID', () => {
    expect(extractVideoId('dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('returns null for invalid input', () => {
    expect(extractVideoId('not-a-url')).toBeNull();
  });
});

describe('mapTranscriptFetchError', () => {
  it('maps captcha/rate-limit failures to 429 with actionable copy', () => {
    const error = mapTranscriptFetchError(new Error(
      '[YoutubeTranscript] YouTube is receiving too many requests from this IP and now requires solving a captcha to continue',
    ));

    expect(error.status).toBe(429);
    expect(error.code).toBe('youtube_captcha_required');
    expect(error.data && error.data.recovery && error.data.recovery.openUrl).toBe('https://www.youtube.com/');
    expect(error.message).toMatch(/temporarily blocked transcript requests/i);
    expect(error.message).toMatch(/switch network/i);
  });
});

describe('fetchTranscriptViaApiKey', () => {
  it('returns transcript payload from captions.list + timedtext', async () => {
    const calls = [];
    const mockFetch = async (url) => {
      calls.push(String(url));
      if (String(url).includes('/youtube/v3/captions')) {
        return new Response(JSON.stringify({
          items: [
            {
              id: 'caption-track-1',
              snippet: {language: 'en'},
            },
          ],
        }), {
          status: 200,
          headers: {'content-type': 'application/json'},
        });
      }

      return new Response(JSON.stringify({
        events: [
          {
            tStartMs: 0,
            dDurationMs: 1000,
            segs: [{utf8: 'hello world'}],
          },
        ],
      }), {
        status: 200,
        headers: {'content-type': 'application/json'},
      });
    };

    const payload = await fetchTranscriptViaApiKey('dQw4w9WgXcQ', {
      env: {YOUTUBE_KEY: 'test-key'},
      fetchImpl: mockFetch,
    });

    expect(payload.cueCount).toBe(1);
    expect(payload.fullText).toBe('hello world');
    expect(payload.source).toBe('youtube_data_api_key_timedtext');
    expect(calls.some((entry) => entry.includes('/youtube/v3/captions'))).toBe(true);
  });
});

describe('fetchTranscriptViaOAuth', () => {
  it('sends bearer token to captions.list request', async () => {
    const authorizationHeaders = [];
    const mockFetch = async (url, init) => {
      if (String(url).includes('/youtube/v3/captions')) {
        authorizationHeaders.push(String(init && init.headers && init.headers.Authorization || ''));
        return new Response(JSON.stringify({
          items: [{id: 'caption-track-1', snippet: {language: 'en'}}],
        }), {
          status: 200,
          headers: {'content-type': 'application/json'},
        });
      }
      return new Response(JSON.stringify({
        events: [{tStartMs: 0, dDurationMs: 500, segs: [{utf8: 'oauth flow'}]}],
      }), {
        status: 200,
        headers: {'content-type': 'application/json'},
      });
    };

    const payload = await fetchTranscriptViaOAuth('dQw4w9WgXcQ', {
      oauthAccessToken: 'oauth-token-1',
      env: {},
      fetchImpl: mockFetch,
    });

    expect(payload.source).toBe('youtube_oauth_timedtext');
    expect(payload.fullText).toBe('oauth flow');
    expect(authorizationHeaders[0]).toBe('Bearer oauth-token-1');
  });
});
