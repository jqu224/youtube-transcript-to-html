import {describe, expect, it, vi} from 'vitest';

import {
  extractJsonAssignment,
  extractVideoId,
  fetchTranscriptFromPage,
  fetchWorkspaceMetadata,
  parseJson3Transcript,
  pickCaptionTrack,
} from '../src/lib/youtube.js';

function minimalWatchPageHtml(videoId) {
  const playerResponse = {
    videoDetails: {
      title: 'Test',
      author: 'Ch',
      lengthSeconds: '60',
      thumbnail: {thumbnails: [{url: 'https://i.ytimg.com/vi/x/hqdefault.jpg'}]},
    },
    microformat: {playerMicroformatRenderer: {}},
    captions: {
      playerCaptionsTracklistRenderer: {
        captionTracks: [
          {
            languageCode: 'en',
            baseUrl: `https://www.youtube.com/api/timedtext?v=${videoId}`,
          },
        ],
      },
    },
  };
  return `<!doctype html><script>var ytInitialPlayerResponse = ${JSON.stringify(playerResponse)};</script>`;
}

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

describe('fetchWorkspaceMetadata / YouTube watch fetch', () => {
  it('retries when the watch page returns 429 then succeeds', async () => {
    vi.useFakeTimers();
    const html = minimalWatchPageHtml('xRh2sVcNXQ8');
    let calls = 0;
    const fetchFn = vi.fn(async () => {
      calls += 1;
      if (calls === 1) {
        return {ok: false, status: 429, headers: new Headers()};
      }
      return {ok: true, status: 200, text: () => Promise.resolve(html)};
    });

    const p = fetchWorkspaceMetadata('https://www.youtube.com/watch?v=xRh2sVcNXQ8', fetchFn);
    await vi.runAllTimersAsync();
    const workspace = await p;

    expect(calls).toBe(2);
    expect(workspace.video.title).toBe('Test');
    vi.useRealTimers();
  });

  it('throws a clear rate-limit message after repeated 429 responses', async () => {
    vi.useFakeTimers();
    const fetchFn = vi.fn(async () => ({
      ok: false,
      status: 429,
      headers: new Headers(),
    }));

    const p = fetchWorkspaceMetadata('xRh2sVcNXQ8', fetchFn);
    const assertion = expect(p).rejects.toThrow(/rate-limited/i);
    await vi.runAllTimersAsync();
    await assertion;
    expect(fetchFn.mock.calls.length).toBe(4);
    vi.useRealTimers();
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
