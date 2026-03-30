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
  const oauthAccessToken = options && typeof options.oauthAccessToken === 'string'
    ? options.oauthAccessToken.trim()
    : '';
  if (oauthAccessToken) {
    try {
      return await fetchTranscriptViaOAuth(videoId, {oauthAccessToken, env});
    } catch (_) {}
  }
  if (env && env.YOUTUBE_KEY) {
    try {
      return await fetchTranscriptViaApiKey(videoId, {env});
    } catch (_) {}
  }
  try {
    return await fetchTranscriptViaCaptionExtractor(videoId, {env});
  } catch (_) {}
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
    source: 'youtube_transcript_library',
  };
}

export async function fetchTranscriptViaCaptionExtractor(videoId, options = {}) {
  const extractCaptionsImpl = options && typeof options.extractCaptionsImpl === 'function'
    ? options.extractCaptionsImpl
    : await loadCaptionExtractor();

  const language = String(
    (options && options.env && options.env.YOUTUBE_CAPTION_LANG)
      ? options.env.YOUTUBE_CAPTION_LANG
      : 'en',
  ).trim() || 'en';

  const rawCaptions = await extractCaptionsImpl({
    videoId: String(videoId || ''),
    lang: language,
  });

  const entries = normalizeCaptionExtractorEntries(rawCaptions);
  if (!entries.length) {
    throw makeHttpError(
      'youtube-caption-extractor returned no transcript entries',
      404,
      null,
      'youtube_caption_extractor_empty',
    );
  }

  const fullText = entries.map((entry) => entry.text).join(' ').trim();
  return {
    videoId,
    entries,
    fullText,
    cueCount: entries.length,
    source: 'youtube_caption_extractor',
    language,
  };
}

export async function fetchTranscriptViaApiKey(videoId, options = {}) {
  return fetchTranscriptViaGoogleCaptions(videoId, {
    env: options && options.env ? options.env : {},
    fetchImpl: options && typeof options.fetchImpl === 'function' ? options.fetchImpl : fetch,
    source: 'youtube_data_api_key_timedtext',
  });
}

export async function fetchTranscriptViaOAuth(videoId, options = {}) {
  const oauthAccessToken = String(options && options.oauthAccessToken ? options.oauthAccessToken : '').trim();
  if (!oauthAccessToken) {
    throw makeHttpError('YouTube OAuth access token is missing', 400, null, 'youtube_oauth_token_missing');
  }
  return fetchTranscriptViaGoogleCaptions(videoId, {
    env: options && options.env ? options.env : {},
    fetchImpl: options && typeof options.fetchImpl === 'function' ? options.fetchImpl : fetch,
    oauthAccessToken,
    source: 'youtube_oauth_timedtext',
  });
}

async function fetchTranscriptViaGoogleCaptions(videoId, options = {}) {
  const env = options && options.env ? options.env : {};
  const fetchImpl = options && typeof options.fetchImpl === 'function' ? options.fetchImpl : fetch;
  const source = String(options && options.source ? options.source : 'youtube_google_api_timedtext');
  const oauthAccessToken = String(options && options.oauthAccessToken ? options.oauthAccessToken : '').trim();
  const apiKey = String(env.YOUTUBE_KEY || '').trim();
  if (!apiKey && !oauthAccessToken) {
    throw makeHttpError('YOUTUBE_KEY or OAuth access token is required', 400, null, 'youtube_api_auth_missing');
  }

  const captionsUrl = new URL('https://youtube.googleapis.com/youtube/v3/captions');
  captionsUrl.searchParams.set('part', 'snippet');
  captionsUrl.searchParams.set('videoId', String(videoId || ''));
  if (apiKey) captionsUrl.searchParams.set('key', apiKey);

  const headers = {};
  if (oauthAccessToken) {
    headers.Authorization = `Bearer ${oauthAccessToken}`;
  }
  const captionsResponse = await fetchImpl(captionsUrl.toString(), {
    headers,
  });
  const captionsPayload = await captionsResponse.json().catch(() => ({}));
  if (!captionsResponse.ok) {
    throw makeHttpError(
      resolveGoogleApiErrorMessage(captionsPayload, 'YouTube captions.list failed'),
      captionsResponse.status,
      null,
      'youtube_api_key_request_failed',
    );
  }

  const items = Array.isArray(captionsPayload && captionsPayload.items) ? captionsPayload.items : [];
  if (!items.length) {
    throw makeHttpError(
      'No caption tracks were returned by YouTube Data API for this video',
      404,
      null,
      'youtube_api_key_no_caption_tracks',
    );
  }

  const language = String(items[0] && items[0].snippet && items[0].snippet.language ? items[0].snippet.language : '').trim();
  if (!language) {
    throw makeHttpError(
      'YouTube Data API returned caption tracks without language metadata',
      502,
      null,
      'youtube_api_key_missing_language',
    );
  }

  const timedtextUrl = new URL('https://www.youtube.com/api/timedtext');
  timedtextUrl.searchParams.set('v', String(videoId || ''));
  timedtextUrl.searchParams.set('lang', language);
  timedtextUrl.searchParams.set('fmt', 'json3');

  const transcriptResponse = await fetchImpl(timedtextUrl.toString());
  const transcriptText = await transcriptResponse.text();
  if (!transcriptResponse.ok) {
    throw makeHttpError(
      `YouTube timedtext fetch failed (${transcriptResponse.status})`,
      transcriptResponse.status,
      null,
      'youtube_timedtext_fetch_failed',
    );
  }

  const entries = parseJson3Entries(transcriptText);
  if (!entries.length) {
    throw makeHttpError(
      'YouTube timedtext returned no entries for selected caption language',
      404,
      null,
      'youtube_timedtext_empty',
    );
  }

  const fullText = entries.map((entry) => entry.text).join(' ').trim();
  return {
    videoId,
    entries,
    fullText,
    cueCount: entries.length,
    source,
    language,
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

function resolveGoogleApiErrorMessage(payload, fallback) {
  const fallbackMessage = String(fallback || 'Request failed');
  if (!payload || typeof payload !== 'object') return fallbackMessage;
  const apiError = payload.error;
  if (!apiError || typeof apiError !== 'object') return fallbackMessage;
  if (typeof apiError.message === 'string' && apiError.message.trim()) {
    return apiError.message.trim();
  }
  return fallbackMessage;
}

function parseJson3Entries(source) {
  let payload;
  try {
    payload = JSON.parse(String(source || ''));
  } catch (_) {
    return [];
  }

  const events = Array.isArray(payload && payload.events) ? payload.events : [];
  const entries = [];
  for (const event of events) {
    const segs = Array.isArray(event && event.segs) ? event.segs : [];
    const text = segs
      .map((segment) => String(segment && segment.utf8 ? segment.utf8 : ''))
      .join('')
      .replace(/\s+/g, ' ')
      .trim();
    if (!text) continue;
    const offset = Number(event && event.tStartMs ? event.tStartMs : 0) / 1000;
    const duration = Number(event && event.dDurationMs ? event.dDurationMs : 0) / 1000;
    entries.push({
      text,
      offset: Number.isFinite(offset) ? offset : 0,
      duration: Number.isFinite(duration) ? Math.max(0.1, duration) : 0.1,
    });
  }
  return entries;
}

function normalizeCaptionExtractorEntries(rawCaptions) {
  const list = Array.isArray(rawCaptions) ? rawCaptions : [];
  const entries = [];
  for (const item of list) {
    const text = String(item && item.text ? item.text : '').trim();
    if (!text) continue;

    const rawOffset = firstFiniteNumber(
      item && item.offset,
      item && item.start,
      item && item.startSeconds,
      item && item.startSec,
      item && item.startMs,
    );
    const rawDuration = firstFiniteNumber(
      item && item.duration,
      item && item.dur,
      item && item.durationSeconds,
      item && item.durationSec,
      item && item.durationMs,
    );

    const offset = normalizeSeconds(rawOffset);
    const duration = Math.max(0.1, normalizeSeconds(rawDuration));
    entries.push({text, offset, duration});
  }
  return entries;
}

async function loadCaptionExtractor() {
  const module = await import('youtube-caption-extractor');
  const extractCaptions = module && typeof module.extractCaptions === 'function'
    ? module.extractCaptions
    : null;
  if (!extractCaptions) {
    throw makeHttpError(
      'youtube-caption-extractor does not export extractCaptions',
      500,
      null,
      'youtube_caption_extractor_invalid_module',
    );
  }
  return extractCaptions;
}

function normalizeSeconds(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return n > 1000 ? n / 1000 : n;
}

function firstFiniteNumber(...values) {
  for (const value of values) {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return 0;
}
