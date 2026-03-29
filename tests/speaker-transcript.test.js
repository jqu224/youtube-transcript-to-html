import {describe, expect, it} from 'vitest';

import {buildSpeakerTranscriptPrompt} from '../src/lib/speaker-transcript.js';

describe('buildSpeakerTranscriptPrompt', () => {
  it('includes instruction and raw markdown', () => {
    const out = buildSpeakerTranscriptPrompt('---\ntitle: "T"\n---\n\n# Transcript\n\n1\n00:00:00,000 --> 00:00:01,000\nHi\n');
    expect(out).toContain('Speaker & Chapter Transcript Processing');
    expect(out).toContain('Below is the raw transcript file to process');
    expect(out).toContain('# Transcript');
  });

  it('throws when raw is empty', () => {
    expect(() => buildSpeakerTranscriptPrompt('')).toThrow(/required/);
    expect(() => buildSpeakerTranscriptPrompt('   ')).toThrow(/required/);
  });
});
