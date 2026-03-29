import {describe, expect, it, vi} from 'vitest';

import {
  extractJsonAssignment,
  extractVideoId,
  fetchTranscriptFromPage,
  parseJson3Transcript,
  pickCaptionTrack,
} from '../src/lib/youtube.js';

describe('extractVideoId', () => {
  it('accepts raw video ids and common url formats', () => {
    expect(extractVideoId('xRh2sVcNXQ8')).toBe('xRh2sVcNXQ8');
    expect(extractVideoId('https://www.youtube.com/watch?v=xRh2sVcNXQ8')).toBe('xRh2sVcNXQ8');
    expect(extractVideoId('https://youtu.be/xRh2sVcNXQ8?t=12')).toBe('xRh2sVcNXQ8');
    expect(extractVideoId('https://www.youtube.com/shorts/xRh2sVcNXQ8')).toBe('xRh2sVcNXQ8');
  });

  it('throws for invalid input', () => {
    expect(() => extractVideoId('https://example.com')).toThrow(/video ID/i);
  });
});

describe('parseJson3Transcript', () => {
  it('parses events into normalized transcript cues', () => {
    const parsed = parseJson3Transcript({
      events: [
        {
          tStartMs: 0,
          dDurationMs: 2400,
          segs: [{utf8: 'Hello '}, {utf8: 'world'}],
        },
        {
          tStartMs: 2500,
          dDurationMs: 1800,
          segs: [{utf8: 'Second cue'}],
        },
      ],
    });

    expect(parsed).toHaveLength(2);
    expect(parsed[0]).toMatchObject({
      id: 'cue-1',
      startMs: 0,
      durationMs: 2400,
      text: 'Hello world',
    });
  });
});

describe('pickCaptionTrack', () => {
  it('prefers Chinese tracks when available', () => {
    const track = pickCaptionTrack([
      {languageCode: 'en', baseUrl: 'https://example.com/en'},
      {languageCode: 'zh-Hans', baseUrl: 'https://example.com/zh'},
    ]);

    expect(track.languageCode).toBe('zh-Hans');
  });
});

describe('fetchTranscriptFromPage', () => {
  it('falls back to the local transcript helper when timedtext parsing fails', async () => {
    const fetchFn = vi.fn(async (url) => {
      if (String(url).startsWith('https://www.youtube.com/api/timedtext')) {
        return {
          ok: true,
          async json() {
            throw new SyntaxError('Unexpected end of JSON input');
          },
        };
      }

      if (String(url).startsWith('http://127.0.0.1:8791/youtube-transcript')) {
        return {
          ok: true,
          async json() {
            return {
              language: 'en',
              source: 'local-transcript-proxy',
              entries: [
                {id: 'cue-1', startMs: 0, durationMs: 1200, text: 'Hello from fallback'},
              ],
            };
          },
        };
      }

      throw new Error(`Unexpected fetch url: ${url}`);
    });
    fetchFn.localProxyBaseUrl = 'http://127.0.0.1:8791';

    const transcript = await fetchTranscriptFromPage({
      videoId: 'xRh2sVcNXQ8',
      videoPage: '',
      playerResponse: {
        captions: {
          playerCaptionsTracklistRenderer: {
            captionTracks: [
              {
                languageCode: 'en',
                baseUrl: 'https://www.youtube.com/api/timedtext?v=xRh2sVcNXQ8',
              },
            ],
          },
        },
      },
      fetchFn,
    });

    expect(transcript.source).toBe('local-transcript-proxy');
    expect(transcript.entries[0]).toMatchObject({
      id: 'cue-1',
      text: 'Hello from fallback',
    });
  });
});

describe('extractJsonAssignment', () => {
  it('parses embedded player response JSON blocks', () => {
    const payload = extractJsonAssignment(
      '<script>var ytInitialPlayerResponse = {"videoDetails":{"title":"Demo"}};</script>',
      'var ytInitialPlayerResponse = ',
    );

    expect(payload.videoDetails.title).toBe('Demo');
  });
});
