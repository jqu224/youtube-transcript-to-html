import {describe, expect, it} from 'vitest';

import {
  DEFAULT_TRANSCRIPT_MERGE_BUCKET_MS,
  mergeTranscriptEntriesIntoBuckets,
} from '../src/lib/transcript-merge-buckets.js';

describe('mergeTranscriptEntriesIntoBuckets', () => {
  it('defaults to 15s buckets', () => {
    expect(DEFAULT_TRANSCRIPT_MERGE_BUCKET_MS).toBe(15000);
  });

  it('merges cues in the same 15s window with one startMs', () => {
    const out = mergeTranscriptEntriesIntoBuckets([
      {id: '1', startMs: 0, durationMs: 2000, text: 'Hello'},
      {id: '2', startMs: 5000, durationMs: 2000, text: 'world'},
      {id: '3', startMs: 14000, durationMs: 1000, text: 'end'},
    ]);
    expect(out).toHaveLength(1);
    expect(out[0].startMs).toBe(0);
    expect(out[0].id).toBe('tb-0');
    expect(out[0].text).toMatch(/Hello.*world.*end/);
  });

  it('splits across bucket boundaries', () => {
    const out = mergeTranscriptEntriesIntoBuckets([
      {id: 'a', startMs: 14000, text: 'late'},
      {id: 'b', startMs: 15000, text: 'next'},
    ]);
    expect(out).toHaveLength(2);
    expect(out[0].startMs).toBe(0);
    expect(out[1].startMs).toBe(15000);
  });

  it('drops buckets with no text', () => {
    const out = mergeTranscriptEntriesIntoBuckets([
      {id: 'x', startMs: 0, text: '   '},
      {id: 'y', startMs: 16000, text: 'only'},
    ]);
    expect(out).toHaveLength(1);
    expect(out[0].text).toBe('only');
  });
});
