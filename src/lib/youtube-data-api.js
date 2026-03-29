/**
 * YouTube Data API v3 — captions.list + captions.download (no youtube.com/watch scrape).
 * Requires env: YOUTUBE_KEY (query `key`) and YOUTUBE_ACCESS_TOKEN (Authorization: Bearer).
 * @see https://developers.google.com/youtube/v3/docs/captions/list
 * @see https://developers.google.com/youtube/v3/docs/captions/download
 */

import {normalizeTranscriptEntries} from './render-model.js';

/** Official v3 base (same resource paths as youtube.googleapis.com). */
const API_BASE = 'https://www.googleapis.com/youtube/v3';

const CAPTION_LANG_PREFERENCE = ['zh-Hans', 'zh-Hant', 'zh-HK', 'zh-TW', 'zh-CN', 'zh', 'en'];

/**
 * @param {Record<string, unknown>} [env]
 * @returns {boolean}
 */
export function isYoutubeDataApiConfigured(env) {
  if (!env || typeof env !== 'object') {
    return false;
  }
  const key = String(env.YOUTUBE_KEY ?? env.YOUTUBE_API_KEY ?? '').trim();
  const token = String(env.YOUTUBE_ACCESS_TOKEN ?? '').trim();
  return Boolean(key && token);
}

/**
 * @param {string} iso e.g. PT1H2M3S
 * @returns {number}
 */
export function parseIso8601DurationSeconds(iso) {
  if (!iso || typeof iso !== 'string') {
    return 0;
  }
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) {
    return 0;
  }
  const h = Number(m[1] || 0);
  const min = Number(m[2] || 0);
  const s = Number(m[3] || 0);
  return h * 3600 + min * 60 + s;
}

function buildEmbedUrl(videoId) {
  return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=https://example.com`;
}

/**
 * @param {object} item videos#resource from videos.list
 * @param {string} videoId
 */
export function videoFromVideosListItem(item, videoId) {
  const sn = item?.snippet || {};
  const cd = item?.contentDetails || {};
  const thumbs = sn.thumbnails || {};
  return {
    id: videoId,
    title: sn.title || 'Untitled video',
    channelTitle: sn.channelTitle || '',
    description: sn.description || '',
    lengthSeconds: parseIso8601DurationSeconds(cd.duration || ''),
    embedUrl: buildEmbedUrl(videoId),
    watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
    thumbnailUrl: thumbs.high?.url || thumbs.medium?.url || thumbs.default?.url || '',
  };
}

/**
 * @param {string} videoId
 * @param {Record<string, string | undefined>} env
 * @param {typeof fetch} fetchFn
 */
export async function fetchVideoItem(videoId, env, fetchFn = fetch) {
  const key = String(env.YOUTUBE_KEY ?? env.YOUTUBE_API_KEY ?? '').trim();
  const token = String(env.YOUTUBE_ACCESS_TOKEN ?? '').trim();
  const url = new URL(`${API_BASE}/videos`);
  url.searchParams.set('part', 'snippet,contentDetails');
  url.searchParams.set('id', videoId);
  url.searchParams.set('key', key);

  const response = await fetchFn(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      `YouTube videos.list failed (${response.status}): ${data?.error?.message || 'Unknown error'}`,
    );
  }
  const item = data.items?.[0];
  if (!item) {
    throw new Error('Video not found or not accessible with this API key.');
  }
  return item;
}

/**
 * @param {string} videoId
 * @param {Record<string, string | undefined>} env
 * @param {typeof fetch} fetchFn
 * @returns {Promise<{ items: object[] }>}
 */
export async function listCaptions(videoId, env, fetchFn = fetch) {
  const key = String(env.YOUTUBE_KEY ?? env.YOUTUBE_API_KEY ?? '').trim();
  const token = String(env.YOUTUBE_ACCESS_TOKEN ?? '').trim();
  const url = new URL(`${API_BASE}/captions`);
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('videoId', videoId);
  url.searchParams.set('key', key);

  const response = await fetchFn(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      `YouTube captions.list failed (${response.status}): ${data?.error?.message || JSON.stringify(data).slice(0, 280)}`,
    );
  }
  return {items: normalizeCaptionListItems(data)};
}

/**
 * captions.list returns { kind, items: youtube#caption[] }; each caption has top-level `id` and `snippet`.
 * @param {unknown} data
 * @returns {object[]}
 */
export function normalizeCaptionListItems(data) {
  const raw = data && typeof data === 'object' ? data.items : null;
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.filter(
    (it) =>
      it &&
      typeof it === 'object' &&
      typeof it.id === 'string' &&
      it.id.length > 0,
  );
}

/**
 * Compact rows for Worker logs / optional NDJSON head debug.
 * @param {object[]} items normalized caption resources
 */
export function summarizeCaptionItemsForDebug(items) {
  if (!Array.isArray(items)) {
    return [];
  }
  return items.map((it) => ({
    id: it.id,
    language: it.snippet?.language,
    trackKind: it.snippet?.trackKind,
    name: it.snippet?.name,
    isCC: it.snippet?.isCC,
  }));
}

/**
 * @param {object[]} items captions.list items
 * @returns {object | null}
 */
export function pickCaptionListItem(items) {
  if (!Array.isArray(items) || !items.length) {
    return null;
  }
  const usable = items.filter((it) => it && typeof it.id === 'string' && it.id.length > 0);
  if (!usable.length) {
    return null;
  }
  const isAsr = (it) => String(it?.snippet?.trackKind || '').toUpperCase() === 'ASR';

  for (const code of CAPTION_LANG_PREFERENCE) {
    const m = usable.find((it) => it?.snippet?.language === code && !isAsr(it));
    if (m) {
      return m;
    }
  }
  for (const code of CAPTION_LANG_PREFERENCE) {
    const m = usable.find((it) => it?.snippet?.language === code);
    if (m) {
      return m;
    }
  }
  const nonAsr = usable.find((it) => !isAsr(it));
  return nonAsr || usable[0];
}

/**
 * @param {string} captionId
 * @param {Record<string, string | undefined>} env
 * @param {typeof fetch} fetchFn
 * @returns {Promise<string>} WebVTT text
 */
export async function downloadCaptionVtt(captionId, env, fetchFn = fetch) {
  const key = String(env.YOUTUBE_KEY ?? env.YOUTUBE_API_KEY ?? '').trim();
  const token = String(env.YOUTUBE_ACCESS_TOKEN ?? '').trim();
  const url = new URL(`${API_BASE}/captions/${encodeURIComponent(captionId)}`);
  url.searchParams.set('key', key);
  url.searchParams.set('tfmt', 'vtt');

  const response = await fetchFn(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => response.statusText);
    throw new Error(`YouTube captions.download failed (${response.status}): ${String(errText).slice(0, 280)}`);
  }
  const buf = await response.arrayBuffer();
  return new TextDecoder('utf-8').decode(buf);
}

/**
 * @param {string} raw
 * @returns {ReturnType<typeof normalizeTranscriptEntries>}
 */
export function parseWebVttToEntries(raw) {
  const text = String(raw || '').replace(/\r\n/g, '\n');
  const lines = text.split('\n');
  let i = 0;
  if (lines[0]?.startsWith('WEBVTT')) {
    i = 1;
  }

  const entries = [];

  function vttTimeToMs(t) {
    const s = String(t || '').trim();
    const parts = s.split(':');
    if (parts.length === 3) {
      return Math.round(
        (parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60 + parseFloat(parts[2])) * 1000,
      );
    }
    if (parts.length === 2) {
      return Math.round((parseInt(parts[0], 10) * 60 + parseFloat(parts[1])) * 1000);
    }
    return 0;
  }

  while (i < lines.length) {
    while (i < lines.length && !lines[i].trim()) {
      i += 1;
    }
    if (i >= lines.length) {
      break;
    }
    const line = lines[i];
    if (!line.includes('-->')) {
      i += 1;
      continue;
    }
    const arrow = line.split('-->');
    const startMs = vttTimeToMs(arrow[0]);
    const right = (arrow[1] || '').trim().split(/\s+/)[0] || '';
    const endMs = vttTimeToMs(right);
    i += 1;
    const textLines = [];
    while (i < lines.length && lines[i].trim() && !lines[i].includes('-->')) {
      textLines.push(lines[i]);
      i += 1;
    }
    const cueText = textLines
      .join(' ')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (cueText) {
      entries.push({
        id: `cue-${entries.length + 1}`,
        startMs,
        durationMs: Math.max(0, endMs - startMs),
        text: cueText,
      });
    }
  }

  return normalizeTranscriptEntries(entries);
}

/**
 * @param {string} videoId
 * @param {Record<string, string | undefined>} env
 * @param {typeof fetch} fetchFn
 */
export async function fetchWorkspaceDataViaYoutubeApi(videoId, env, fetchFn) {
  const [videoItem, {items}] = await Promise.all([
    fetchVideoItem(videoId, env, fetchFn),
    listCaptions(videoId, env, fetchFn),
  ]);

  const summary = summarizeCaptionItemsForDebug(items);
  console.log('[youtube-data-api] captions.list videoId=' + videoId + ' count=' + items.length, summary);

  const picked = pickCaptionListItem(items);
  if (!picked?.id) {
    console.error('[youtube-data-api] pickCaptionListItem returned no id', {videoId, summary});
    throw new Error('No caption tracks returned from YouTube Data API for this video.');
  }

  console.log('[youtube-data-api] picked caption track', {
    videoId,
    captionId: picked.id,
    language: picked.snippet?.language,
    trackKind: picked.snippet?.trackKind,
  });

  let vtt;
  try {
    vtt = await downloadCaptionVtt(picked.id, env, fetchFn);
    console.log('[youtube-data-api] captions.download ok bytes=' + (vtt && vtt.length));
  } catch (e) {
    console.error('[youtube-data-api] captions.download failed', picked.id, e);
    throw e;
  }

  const entries = parseWebVttToEntries(vtt);
  console.log('[youtube-data-api] parseWebVttToEntries cueCount=' + entries.length);
  if (!entries.length) {
    throw new Error('Caption file parsed to zero cues.');
  }

  const lang = picked.snippet?.language || '';
  const video = videoFromVideosListItem(videoItem, videoId);

  return {
    video,
    transcript: {
      language: lang,
      source: 'youtube-data-api-captions',
      entries,
    },
    _workspaceDebug: {
      videoId,
      captionList: summary,
      pickedCaptionId: picked.id,
      pickedLanguage: lang,
      cueCount: entries.length,
    },
  };
}

/**
 * Metadata + pending transcript (no caption download).
 * @param {string} videoId
 * @param {Record<string, string | undefined>} env
 * @param {typeof fetch} fetchFn
 */
export async function fetchWorkspaceMetadataViaYoutubeApi(videoId, env, fetchFn) {
  const [videoItem, {items}] = await Promise.all([
    fetchVideoItem(videoId, env, fetchFn),
    listCaptions(videoId, env, fetchFn),
  ]);

  const picked = pickCaptionListItem(items);
  if (!picked?.id) {
    throw new Error('No usable caption tracks returned from YouTube Data API for this video.');
  }

  const video = videoFromVideosListItem(videoItem, videoId);
  const lang = picked.snippet?.language || '';

  return {
    video,
    transcript: {
      language: lang,
      source: '',
      entries: [],
      pending: true,
    },
  };
}

/**
 * @param {string} videoId
 * @param {Record<string, string | undefined>} env
 * @param {typeof fetch} fetchFn
 */
export async function fetchTranscriptPayloadViaYoutubeApi(videoId, env, fetchFn) {
  const {items} = await listCaptions(videoId, env, fetchFn);
  const picked = pickCaptionListItem(items);
  if (!picked?.id) {
    throw new Error('No caption tracks returned from YouTube Data API for this video.');
  }

  const vtt = await downloadCaptionVtt(picked.id, env, fetchFn);
  const entries = parseWebVttToEntries(vtt);
  if (!entries.length) {
    throw new Error('Caption file parsed to zero cues.');
  }

  const lang = picked.snippet?.language || '';

  return {
    language: lang,
    source: 'youtube-data-api-captions',
    entries,
  };
}
