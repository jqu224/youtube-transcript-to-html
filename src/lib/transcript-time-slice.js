/**
 * Pure helpers for transcript time-window batching (client list filtering).
 * Keep in sync with the copy in `src/ui/client.js` (CLIENT_APP_SOURCE).
 */

/**
 * @param {object} p
 * @param {number} p.videoLengthMs Total video duration (0 = unknown)
 * @param {number} p.sliceDurationMs Length of each window
 * @param {number} p.sliceIndex 0-based slice index
 * @returns {{startMs: number, endMs: number, sliceCount: number, sliceIndex: number}}
 */
export function computeTranscriptTimeSliceBounds({videoLengthMs, sliceDurationMs, sliceIndex}) {
  const dur = Math.max(1, Number(sliceDurationMs) || 60000);
  const len = Math.max(0, Number(videoLengthMs) || 0);
  let sliceCount;
  let idx = Math.max(0, Number(sliceIndex) || 0);

  if (len <= 0) {
    sliceCount = 1;
    idx = 0;
    return {
      startMs: 0,
      endMs: Number.POSITIVE_INFINITY,
      sliceCount,
      sliceIndex: idx,
    };
  }

  sliceCount = Math.max(1, Math.ceil(len / dur));
  idx = Math.min(idx, sliceCount - 1);
  const startMs = idx * dur;
  const endMs = Math.min(len, (idx + 1) * dur);
  return {startMs, endMs, sliceCount, sliceIndex: idx};
}

/**
 * Cues that overlap [startMs, endMs). When endMs is +Infinity, all cues with start >= startMs match.
 * @param {Array<{startMs?: number, durationMs?: number}>} entries
 * @param {number} startMs
 * @param {number} endMs
 * @returns {typeof entries}
 */
export function filterTranscriptEntriesByTimeSlice(entries, startMs, endMs) {
  if (!Array.isArray(entries) || !entries.length) {
    return [];
  }
  const s = Number(startMs) || 0;
  const e = Number(endMs);
  const endIsInf = !Number.isFinite(e) || e === Number.POSITIVE_INFINITY;

  return entries.filter(function(entry) {
    const start = Number(entry.startMs) || 0;
    const dur = Math.max(0, Number(entry.durationMs) || 0);
    const cueEnd = dur > 0 ? start + dur : start + 1;
    if (endIsInf) {
      return start >= s;
    }
    return start < e && cueEnd > s;
  });
}

/**
 * @param {{video?: {lengthSeconds?: number}}} workspace
 * @param {Array<{startMs?: number, durationMs?: number}>} entries
 * @returns {number}
 */
export function inferVideoLengthMsFromWorkspace(workspace, entries) {
  const sec = Number(workspace?.video?.lengthSeconds || 0);
  if (sec > 0) {
    return sec * 1000;
  }
  if (!Array.isArray(entries) || !entries.length) {
    return 0;
  }
  const last = entries[entries.length - 1];
  const start = Number(last.startMs) || 0;
  const dur = Math.max(0, Number(last.durationMs) || 0);
  return start + (dur > 0 ? dur : 2000);
}
