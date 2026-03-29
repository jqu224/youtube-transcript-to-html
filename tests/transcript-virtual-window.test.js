import {describe, expect, it} from 'vitest';

import {computeTranscriptVirtualWindow} from '../src/lib/transcript-virtual-window.js';

describe('computeTranscriptVirtualWindow', () => {
  const row = 30;
  const overscan = 14;

  it('returns full range when viewport fits all entries', () => {
    const r = computeTranscriptVirtualWindow({
      scrollTop: 0,
      clientHeight: 2000,
      entryCount: 50,
      rowEstPx: row,
      overscan,
      currentCueIndex: -1,
    });
    expect(r.start).toBe(0);
    expect(r.end).toBe(50);
    expect(r.totalHeight).toBe(50 * row);
    expect(r.bottomPad).toBe(0);
  });

  it('windows large lists from scroll position', () => {
    const r = computeTranscriptVirtualWindow({
      scrollTop: 3000,
      clientHeight: 480,
      entryCount: 2800,
      rowEstPx: row,
      overscan,
      currentCueIndex: -1,
    });
    expect(r.start).toBeGreaterThan(0);
    expect(r.end).toBeLessThan(2800);
    expect(r.end - r.start).toBeLessThan(200);
    expect(r.topPad + (r.end - r.start) * row + r.bottomPad).toBe(r.totalHeight);
  });

  it('expands window to include current cue when outside slice', () => {
    const r = computeTranscriptVirtualWindow({
      scrollTop: 0,
      clientHeight: 480,
      entryCount: 500,
      rowEstPx: row,
      overscan,
      currentCueIndex: 400,
    });
    expect(r.start).toBeLessThanOrEqual(400);
    expect(r.end).toBeGreaterThan(400);
  });
});
