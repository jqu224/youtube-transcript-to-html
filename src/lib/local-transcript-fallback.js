function normalizeBaseUrl(input) {
  const trimmed = String(input || '').trim();
  if (!trimmed) return '';
  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
}

function makeFallbackError(message, code) {
  const error = new Error(message);
  error.code = code || 'local_fallback_failed';
  return error;
}

export async function fetchTranscriptViaLocalFallback({videoId, videoUrl, env}) {
  const baseUrl = normalizeBaseUrl(env && env.LOCAL_TRANSCRIPT_FALLBACK_URL);
  if (!baseUrl) {
    throw makeFallbackError(
      'Local transcript fallback is not configured. Set LOCAL_TRANSCRIPT_FALLBACK_URL to enable yt-dlp fallback',
      'local_fallback_not_configured',
    );
  }

  const response = await fetch(`${baseUrl}/transcript`, {
    method: 'POST',
    headers: {'content-type': 'application/json'},
    body: JSON.stringify({
      videoId: String(videoId || ''),
      url: String(videoUrl || ''),
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw makeFallbackError(
      String(payload && payload.error ? payload.error : 'Local transcript fallback request failed'),
      'local_fallback_http_error',
    );
  }

  const entries = Array.isArray(payload.entries) ? payload.entries : [];
  if (!entries.length) {
    throw makeFallbackError('Local transcript fallback returned an empty transcript', 'local_fallback_empty');
  }

  const fullText = typeof payload.fullText === 'string'
    ? payload.fullText
    : entries.map((entry) => String(entry && entry.text ? entry.text : '')).join(' ').trim();

  return {
    videoId,
    entries,
    fullText,
    cueCount: Number.isFinite(Number(payload.cueCount)) ? Number(payload.cueCount) : entries.length,
    source: payload.source || 'local_yt_dlp_fallback',
  };
}
