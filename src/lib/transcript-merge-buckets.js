/** Merge adjacent cues into fixed time buckets (one timestamp per bucket). Duplicated in `src/ui/client.js` (CLIENT_APP_SOURCE). */

export const DEFAULT_TRANSCRIPT_MERGE_BUCKET_MS = 15000;

/**
 * @param {Array<{id?: string, startMs?: number, durationMs?: number, text?: string}>} entries
 * @param {number} [bucketMs]
 * @returns {Array<{id: string, startMs: number, durationMs: number, text: string}>}
 */
export function mergeTranscriptEntriesIntoBuckets(entries, bucketMs = DEFAULT_TRANSCRIPT_MERGE_BUCKET_MS) {
  if (!Array.isArray(entries) || !entries.length) {
    return [];
  }
  const ms = Math.max(1000, Number(bucketMs) || DEFAULT_TRANSCRIPT_MERGE_BUCKET_MS);
  /** @type {Map<number, {id: string, startMs: number, durationMs: number, parts: string[]}>} */
  const map = new Map();
  for (const entry of entries) {
    const start = Number(entry.startMs) || 0;
    const bi = Math.floor(start / ms);
    if (!map.has(bi)) {
      map.set(bi, {
        id: 'tb-' + bi,
        startMs: bi * ms,
        durationMs: ms,
        parts: [],
      });
    }
    const g = map.get(bi);
    const t = String(entry.text || '').trim();
    if (t) {
      g.parts.push(t);
    }
  }
  return Array.from(map.keys())
    .sort(function(a, b) {
      return a - b;
    })
    .map(function(bi) {
      const g = map.get(bi);
      return {
        id: g.id,
        startMs: g.startMs,
        durationMs: g.durationMs,
        text: g.parts.join(' ').replace(/\s+/g, ' ').trim(),
      };
    })
    .filter(function(row) {
      return row.text.length > 0;
    });
}
