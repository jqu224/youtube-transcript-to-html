/**
 * Pure helpers for transcript virtual list (matches client scroll-window math).
 * Used by tests; keep in sync with renderTranscriptList virtual branch in src/ui/client.js.
 */

export function computeTranscriptVirtualWindow({
  scrollTop,
  clientHeight,
  entryCount,
  rowEstPx,
  overscan,
  currentCueIndex,
}) {
  const safeHeight = Math.max(1, clientHeight || 480);
  const visibleRows = Math.ceil(safeHeight / rowEstPx) + 2 * overscan;
  let start = Math.max(0, Math.floor(scrollTop / rowEstPx) - overscan);
  let end = Math.min(entryCount, start + visibleRows);

  if (currentCueIndex >= 0 && currentCueIndex < entryCount) {
    if (currentCueIndex < start) {
      start = Math.max(0, currentCueIndex - overscan);
      end = Math.min(entryCount, start + visibleRows);
    } else if (currentCueIndex >= end) {
      end = Math.min(entryCount, currentCueIndex + overscan + 1);
      start = Math.max(0, end - visibleRows);
    }
  }

  const totalHeight = entryCount * rowEstPx;
  const topPad = start * rowEstPx;
  const bottomPad = (entryCount - end) * rowEstPx;

  return {start, end, totalHeight, topPad, bottomPad, visibleRows};
}
