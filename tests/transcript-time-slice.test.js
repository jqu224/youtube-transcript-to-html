import {describe, expect, it} from 'vitest';

import {
  computeTranscriptTimeSliceBounds,
  filterTranscriptEntriesByTimeSlice,
  inferVideoLengthMsFromWorkspace,
} from '../src/lib/transcript-time-slice.js';

describe('computeTranscriptTimeSliceBounds', () => {
  it('returns one infinite window when video length is unknown', () => {
    const b = computeTranscriptTimeSliceBounds({
      videoLengthMs: 0,
      sliceDurationMs: 300000,
      sliceIndex: 3,
    });
    expect(b.sliceCount).toBe(1);
    expect(b.sliceIndex).toBe(0);
    expect(b.startMs).toBe(0);
    expect(b.endMs).toBe(Number.POSITIVE_INFINITY);
  });

  it('computes non-overlapping windows along the timeline', () => {
    const tenMin = 600000;
    const b0 = computeTranscriptTimeSliceBounds({
      videoLengthMs: 25 * 60 * 1000,
      sliceDurationMs: tenMin,
      sliceIndex: 0,
    });
    expect(b0).toMatchObject({startMs: 0, endMs: tenMin, sliceCount: 3, sliceIndex: 0});

    const b2 = computeTranscriptTimeSliceBounds({
      videoLengthMs: 25 * 60 * 1000,
      sliceDurationMs: tenMin,
      sliceIndex: 2,
    });
    expect(b2).toMatchObject({
      startMs: 20 * 60 * 1000,
      endMs: 25 * 60 * 1000,
      sliceCount: 3,
      sliceIndex: 2,
    });
  });

  it('clamps slice index to the last window', () => {
    const b = computeTranscriptTimeSliceBounds({
      videoLengthMs: 100000,
      sliceDurationMs: 50000,
      sliceIndex: 99,
    });
    expect(b.sliceIndex).toBe(1);
    expect(b.sliceCount).toBe(2);
  });
});

describe('filterTranscriptEntriesByTimeSlice', () => {
  const entries = [
    {id: 'a', startMs: 0, durationMs: 1000, text: 'a'},
    {id: 'b', startMs: 5000, durationMs: 2000, text: 'b'},
    {id: 'c', startMs: 120000, durationMs: 1000, text: 'c'},
  ];

  it('keeps cues that overlap the window', () => {
    const out = filterTranscriptEntriesByTimeSlice(entries, 4000, 7000);
    expect(out.map((e) => e.id)).toEqual(['b']);
  });

  it('includes a cue that starts before the window but overlaps the start edge', () => {
    const out = filterTranscriptEntriesByTimeSlice(entries, 500, 6000);
    expect(out.map((e) => e.id)).toEqual(['a', 'b']);
  });

  it('with infinite end includes cues from start onward', () => {
    const out = filterTranscriptEntriesByTimeSlice(entries, 0, Number.POSITIVE_INFINITY);
    expect(out).toHaveLength(3);
  });
});

describe('inferVideoLengthMsFromWorkspace', () => {
  it('uses video length when present', () => {
    expect(
      inferVideoLengthMsFromWorkspace({video: {lengthSeconds: 90}}, []),
    ).toBe(90000);
  });

  it('infers from last cue when length is missing', () => {
    const ms = inferVideoLengthMsFromWorkspace({}, [{startMs: 10000, durationMs: 5000, text: 'x'}]);
    expect(ms).toBe(15000);
  });
});
