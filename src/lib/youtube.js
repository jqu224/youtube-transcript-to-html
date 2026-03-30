import {fetchTranscript as fetchYouTubeTranscript} from 'youtube-transcript/dist/youtube-transcript.esm.js';
import {fetchTranscriptViaLocalFallback} from './local-transcript-fallback.js';

const VIDEO_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;
const TOO_MANY_REQUESTS_PATTERN = /(too many requests|captcha|unusual traffic|bot detected|rate limit)/i;

function makeHttpError(message, status, cause, code, data) {
  const error = new Error(message);
  error.status = status;
  if (code) error.code = code;
  if (data) error.data = data;
  if (cause) error.cause = cause;
  return error;
}

export function extractVideoId(input) {
  const trimmed = String(input || '').trim();
  if (VIDEO_ID_PATTERN.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);
    const fromSearch = url.searchParams.get('v');
    if (fromSearch && VIDEO_ID_PATTERN.test(fromSearch)) return fromSearch;

    if (url.hostname === 'youtu.be') {
      const fromShort = url.pathname.replace(/^\//, '').split('/')[0];
      if (VIDEO_ID_PATTERN.test(fromShort)) return fromShort;
    }

    const fromPath = url.pathname.match(/\/(?:embed|shorts|live)\/([a-zA-Z0-9_-]{11})/);
    if (fromPath) return fromPath[1];
  } catch (_) {}

  return null;
}

export async function fetchTranscript(videoId, options = {}) {
  const env = options && options.env ? options.env : {};
  const videoUrl = options && typeof options.videoUrl === 'string' ? options.videoUrl.trim() : '';
  let entries;
  try {
    entries = await fetchYouTubeTranscript(videoId);
  } catch (error) {
    const mappedError = mapTranscriptFetchError(error, {videoId});
    if (mappedError.code === 'youtube_captcha_required') {
      try {
        return await fetchTranscriptViaLocalFallback({videoId, videoUrl, env});
      } catch (fallbackError) {
        mappedError.data = {
          ...(mappedError.data || {}),
          fallback: {
            available: Boolean(env && env.LOCAL_TRANSCRIPT_FALLBACK_URL),
            error: String(fallbackError && fallbackError.message ? fallbackError.message : 'Unavailable'),
          },
        };
      }
    }
    throw mappedError;
  }
  const fullText = entries.map((entry) => entry.text).join(' ').trim();

  return {
    videoId,
    entries,
    fullText,
    cueCount: entries.length,
  };
}

export function mapTranscriptFetchError(error, _context = {}) {
  const rawMessage = String(error && error.message ? error.message : '').trim();
  const openUrl = 'https://www.youtube.com/';

  if (TOO_MANY_REQUESTS_PATTERN.test(rawMessage)) {
    return makeHttpError(
      'YouTube temporarily blocked transcript requests from this IP. Wait a bit, open YouTube once in your browser, or switch network and try again',
      429,
      error,
      'youtube_captcha_required',
      {
        recovery: {
          openUrl,
          retryHint: 'Complete any YouTube verification challenge in browser, then retry',
        },
      },
    );
  }

  if (/no transcript|transcripts? disabled|subtitles? unavailable/i.test(rawMessage)) {
    return makeHttpError('No transcript is available for this video', 404, error, 'youtube_transcript_unavailable');
  }

  if (/video unavailable|private video|not available/i.test(rawMessage)) {
    return makeHttpError('This video is unavailable or restricted', 404, error, 'youtube_video_unavailable');
  }

  if (/invalid video id/i.test(rawMessage)) {
    return makeHttpError('Could not extract a valid YouTube video ID from url', 400, error, 'youtube_invalid_video_id');
  }

  return makeHttpError(rawMessage || 'Failed to fetch transcript from YouTube', 502, error, 'youtube_transcript_fetch_failed');
}
