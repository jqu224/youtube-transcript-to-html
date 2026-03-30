import {describe, expect, it} from 'vitest';

import {extractVideoId, mapTranscriptFetchError} from '../src/lib/youtube.js';

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
    expect(error.data && error.data.recovery && error.data.recovery.openUrl).toBeTypeOf('string');
    expect(error.message).toMatch(/temporarily blocked transcript requests/i);
    expect(error.message).toMatch(/switch network/i);
  });
});
