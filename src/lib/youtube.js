import {fetchTranscript as fetchYouTubeTranscript} from 'youtube-transcript/dist/youtube-transcript.esm.js';

const VIDEO_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

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

export async function fetchTranscript(videoId) {
  const entries = await fetchYouTubeTranscript(videoId);
  const fullText = entries.map((entry) => entry.text).join(' ').trim();

  return {
    videoId,
    entries,
    fullText,
    cueCount: entries.length,
  };
}
