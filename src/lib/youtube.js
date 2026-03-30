import {normalizeTranscriptEntries} from './render-model.js';
import {
  fetchTranscriptPayloadViaYoutubeApi,
  fetchWorkspaceDataViaYoutubeApi,
  fetchWorkspaceMetadataViaYoutubeApi,
  isYoutubeDataApiConfigured,
} from './youtube-data-api.js';

const WATCH_BASE_URL = 'https://www.youtube.com/watch?v=';
const SEARCH_BASE_URL = 'https://www.youtube.com/results?search_query=';
const WATCH_PAGE_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36';

export function extractVideoId(input) {
  if (!input) {
    throw new Error('A YouTube URL or video ID is required.');
  }

  const trimmed = String(input).replace(/\\/g, '').trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  let url;
  try {
    url = new URL(trimmed);
  } catch {
    throw new Error('Enter a valid YouTube URL or video ID.');
  }

  const host = url.hostname.replace(/^www\./, '');
  if (host === 'youtu.be') {
    const value = url.pathname.split('/').filter(Boolean)[0];
    if (value && /^[a-zA-Z0-9_-]{11}$/.test(value)) {
      return value;
    }
  }

  if (host === 'youtube.com' || host.endsWith('.youtube.com')) {
    const directId = url.searchParams.get('v');
    if (directId && /^[a-zA-Z0-9_-]{11}$/.test(directId)) {
      return directId;
    }

    const match = url.pathname.match(/\/(?:embed|shorts|live)\/([a-zA-Z0-9_-]{11})/);
    if (match) {
      return match[1];
    }
  }

  throw new Error('Could not find a valid YouTube video ID.');
}

/**
 * @param {string} videoId
 * @param {string} [pageOrigin] Parent page origin for IFrame API postMessage; omit when unknown (e.g. server metadata)
 */
export function buildEmbedUrl(videoId, pageOrigin) {
  let url = `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?enablejsapi=1`;
  if (pageOrigin && typeof pageOrigin === 'string' && pageOrigin.trim()) {
    url += `&origin=${encodeURIComponent(pageOrigin.trim())}`;
  }
  return url;
}

async function loadWatchPageAndPlayerResponse(videoId, fetchFn) {
  const videoPage = await fetchYouTubeWatchPage(videoId, fetchFn);
  const playerResponse = extractJsonAssignment(videoPage, 'var ytInitialPlayerResponse = ')
    || extractJsonAssignment(videoPage, 'ytInitialPlayerResponse = ');

  if (!playerResponse) {
    throw new Error('Could not parse the YouTube video metadata.');
  }

  const video = extractVideoMetadata(playerResponse, videoId);
  return { videoPage, playerResponse, video };
}

/**
 * One watch-page fetch: video metadata + caption language hint only (no timedtext download).
 * Transcript cues load via {@link fetchTranscriptPayload}.
 */
/**
 * @param {string} input
 * @param {typeof fetch} [fetchFn]
 * @param {Record<string, string | undefined>} [env] Pass Worker env; when `YOUTUBE_KEY` + `YOUTUBE_ACCESS_TOKEN` are set, uses YouTube Data API (no watch-page scrape).
 */
export async function fetchWorkspaceMetadata(input, fetchFn = fetch, env) {
  const videoId = extractVideoId(input);
  if (!env || !isYoutubeDataApiConfigured(env)) {
    throw new Error(
      'YouTube Data API is not configured. Set YOUTUBE_KEY and YOUTUBE_ACCESS_TOKEN on this Worker.',
    );
  }
  return fetchWorkspaceMetadataViaYoutubeApi(videoId, env, fetchFn);
}

/**
 * Fetches caption JSON (and may re-fetch the watch page). Used by POST /api/transcript.
 */
export async function fetchTranscriptPayload(input, fetchFn = fetch, env) {
  const videoId = extractVideoId(input);
  if (!env || !isYoutubeDataApiConfigured(env)) {
    throw new Error(
      'YouTube Data API is not configured. Set YOUTUBE_KEY and YOUTUBE_ACCESS_TOKEN on this Worker.',
    );
  }
  return fetchTranscriptPayloadViaYoutubeApi(videoId, env, fetchFn);
}

/** Single request: metadata + full transcript (one watch-page fetch, or Data API when configured). */
export async function fetchWorkspaceData(input, fetchFn = fetch, env) {
  const videoId = extractVideoId(input);
  if (!env || !isYoutubeDataApiConfigured(env)) {
    throw new Error(
      'YouTube Data API is not configured. Set YOUTUBE_KEY and YOUTUBE_ACCESS_TOKEN on this Worker.',
    );
  }
  return fetchWorkspaceDataViaYoutubeApi(videoId, env, fetchFn);
}

export async function fetchTranscriptFromPage({videoId, videoPage, playerResponse, fetchFn = fetch}) {
  const tracks = extractCaptionTracks(playerResponse);
  if (!tracks.length) {
    throw new Error('This video does not expose any captions.');
  }

  const selectedTrack = pickCaptionTrack(tracks);
  const transcriptUrl = appendJson3Format(selectedTrack.baseUrl);
  const response = await fetchFn(transcriptUrl, {
    headers: defaultYoutubeHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch transcript (${response.status}).`);
  }

  let entries = [];
  try {
    const data = await response.json();
    entries = parseJson3Transcript(data);
  } catch (error) {
    const fallbackTranscript = await fetchTranscriptFromLocalHelper({
      videoId,
      languageCode: selectedTrack.languageCode || '',
      fetchFn,
    });
    if (fallbackTranscript) {
      return fallbackTranscript;
    }
    throw error;
  }

  if (!entries.length) {
    const fallbackTranscript = await fetchTranscriptFromLocalHelper({
      videoId,
      languageCode: selectedTrack.languageCode || '',
      fetchFn,
    });
    if (fallbackTranscript) {
      return fallbackTranscript;
    }
    throw new Error('The transcript was empty after parsing.');
  }

  return {
    language: selectedTrack.languageCode || selectedTrack.name?.simpleText || '',
    source: 'youtube-captions',
    entries,
  };
}

async function fetchTranscriptFromLocalHelper({videoId, languageCode, fetchFn}) {
  const proxyBaseUrl = fetchFn?.localProxyBaseUrl;
  if (!proxyBaseUrl) {
    return null;
  }

  const helperUrl = new URL(`${proxyBaseUrl}/youtube-transcript`);
  helperUrl.searchParams.set('videoId', videoId);
  if (languageCode) {
    helperUrl.searchParams.set('language', languageCode);
  }

  const response = await fetchFn(helperUrl.toString(), {
    headers: defaultYoutubeHeaders(),
  }).catch(() => null);
  if (!response || !response.ok) {
    return null;
  }

  const payload = await response.json().catch(() => null);
  const entries = normalizeTranscriptEntries(payload?.entries || []);
  if (!entries.length) {
    return null;
  }

  return {
    language: payload.language || languageCode || '',
    source: payload.source || 'local-transcript-proxy',
    entries,
  };
}

export async function searchYouTubeVideos(query, fetchFn = fetch, limit = 8) {
  const response = await fetchFn(`${SEARCH_BASE_URL}${encodeURIComponent(query)}`, {
    headers: defaultYoutubeHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Failed to search YouTube (${response.status}).`);
  }

  const html = await response.text();
  const initialData = extractJsonAssignment(html, 'var ytInitialData = ')
    || extractJsonAssignment(html, 'ytInitialData = ');
  if (!initialData) {
    return [];
  }

  const results = [];
  visitObject(initialData, (value) => {
    const renderer = value?.videoRenderer;
    if (!renderer) {
      return;
    }
    results.push({
      videoId: renderer.videoId,
      title: joinRuns(renderer.title?.runs) || renderer.title?.simpleText || 'Untitled',
      channelTitle: joinRuns(renderer.ownerText?.runs) || joinRuns(renderer.longBylineText?.runs) || '',
      duration: renderer.lengthText?.simpleText || '',
      views: renderer.viewCountText?.simpleText || '',
      query,
      url: `${WATCH_BASE_URL}${renderer.videoId}`,
      thumbnailUrl: renderer.thumbnail?.thumbnails?.slice(-1)?.[0]?.url || '',
    });
  });

  return dedupeVideoResults(results).slice(0, limit);
}

export function parseJson3Transcript(data) {
  const entries = (data?.events || [])
    .map((event, index) => {
      const text = (event?.segs || [])
        .map((segment) => segment?.utf8 || '')
        .join('')
        .replace(/\s+/g, ' ')
        .trim();
      if (!text) {
        return null;
      }
      return {
        id: `cue-${index + 1}`,
        startMs: Number(event?.tStartMs || 0),
        durationMs: Number(event?.dDurationMs || 0),
        text,
      };
    })
    .filter(Boolean);
  return normalizeTranscriptEntries(entries);
}

export function extractCaptionTracks(playerResponse) {
  return playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
}

export function pickCaptionTrack(tracks = []) {
  const preference = ['zh-Hans', 'zh-Hant', 'zh-HK', 'zh-TW', 'zh-CN', 'zh', 'en'];
  for (const code of preference) {
    const match = tracks.find((track) => track.languageCode === code && track.kind !== 'asr');
    if (match) {
      return match;
    }
  }
  for (const code of preference) {
    const match = tracks.find((track) => track.languageCode === code);
    if (match) {
      return match;
    }
  }
  return tracks.find((track) => track.kind !== 'asr') || tracks[0];
}

export function extractVideoMetadata(playerResponse, videoId) {
  const details = playerResponse?.videoDetails || {};
  const micro = playerResponse?.microformat?.playerMicroformatRenderer || {};
  return {
    id: videoId,
    title: details.title || micro.title?.simpleText || 'Untitled video',
    channelTitle: details.author || micro.ownerChannelName || '',
    description: micro.description?.simpleText || '',
    lengthSeconds: Number(details.lengthSeconds || 0),
    embedUrl: buildEmbedUrl(videoId),
    watchUrl: `${WATCH_BASE_URL}${videoId}`,
    thumbnailUrl: details.thumbnail?.thumbnails?.slice(-1)?.[0]?.url || '',
  };
}

function appendJson3Format(baseUrl) {
  const url = new URL(decodeHtmlEntities(baseUrl));
  url.searchParams.set('fmt', 'json3');
  return url.toString();
}

/** YouTube often returns 429 for datacenter / shared egress IPs; retry brief outages. */
const WATCH_PAGE_RETRYABLE_STATUSES = new Set([429, 503]);
const WATCH_PAGE_MAX_ATTEMPTS = 4;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * @param {Response} response
 * @returns {number | null} Milliseconds to wait, capped for Workers CPU bounds
 */
function parseRetryAfterMs(response) {
  const raw = response.headers.get('retry-after');
  if (!raw) {
    return null;
  }
  const seconds = Number(raw);
  if (!Number.isNaN(seconds) && seconds >= 0) {
    return Math.min(seconds * 1000, 120_000);
  }
  const when = Date.parse(raw);
  if (!Number.isNaN(when)) {
    const delta = when - Date.now();
    return delta > 0 ? Math.min(delta, 120_000) : null;
  }
  return null;
}

function watchPageError(status) {
  if (status === 429) {
    return new Error(
      'YouTube rate-limited this request (429). Wait a minute and try again, or open the video in your browser once',
    );
  }
  return new Error(`Failed to fetch the YouTube watch page (${status}).`);
}

async function fetchYouTubeWatchPage(videoId, fetchFn) {
  const watchUrl = `${WATCH_BASE_URL}${videoId}&hl=en&persist_hl=1&has_verified=1&bpctr=9999999999`;
  let lastStatus = 0;

  for (let attempt = 0; attempt < WATCH_PAGE_MAX_ATTEMPTS; attempt += 1) {
    const response = await fetchFn(watchUrl, {
      headers: defaultYoutubeHeaders(),
    });
    lastStatus = response.status;

    if (response.ok) {
      return response.text();
    }

    const retryable = WATCH_PAGE_RETRYABLE_STATUSES.has(response.status);
    const attemptsLeft = attempt < WATCH_PAGE_MAX_ATTEMPTS - 1;
    if (!retryable || !attemptsLeft) {
      throw watchPageError(response.status);
    }

    const fromHeader = parseRetryAfterMs(response);
    const backoffMs =
      fromHeader ?? Math.min(1000 * 2 ** attempt + Math.floor(Math.random() * 500), 12_000);
    await sleep(backoffMs);
  }

  throw watchPageError(lastStatus);
}

function defaultYoutubeHeaders() {
  return {
    'accept-language': 'en-US,en;q=0.9',
    'user-agent': WATCH_PAGE_USER_AGENT,
  };
}

export function extractJsonAssignment(html, marker) {
  const startIndex = html.indexOf(marker);
  if (startIndex === -1) {
    return null;
  }
  const jsonStart = html.indexOf('{', startIndex + marker.length);
  if (jsonStart === -1) {
    return null;
  }

  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = jsonStart; index < html.length; index += 1) {
    const character = html[index];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (character === '\\') {
        escaped = true;
      } else if (character === '"') {
        inString = false;
      }
      continue;
    }

    if (character === '"') {
      inString = true;
      continue;
    }

    if (character === '{') {
      depth += 1;
    } else if (character === '}') {
      depth -= 1;
      if (depth === 0) {
        const raw = html.slice(jsonStart, index + 1);
        try {
          return JSON.parse(decodeHtmlEntities(raw));
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

function joinRuns(runs = []) {
  return runs.map((run) => run?.text || '').join('').trim();
}

function decodeHtmlEntities(value) {
  return value
    .replace(/\\u0026/g, '&')
    .replace(/\\u003d/g, '=')
    .replace(/\\\//g, '/');
}

function visitObject(value, callback) {
  if (!value || typeof value !== 'object') {
    return;
  }
  callback(value);
  if (Array.isArray(value)) {
    value.forEach((item) => visitObject(item, callback));
    return;
  }
  Object.values(value).forEach((item) => visitObject(item, callback));
}

function dedupeVideoResults(results) {
  const seen = new Set();
  return results.filter((item) => {
    if (!item.videoId || seen.has(item.videoId)) {
      return false;
    }
    seen.add(item.videoId);
    return true;
  });
}
