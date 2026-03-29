import {describe, expect, it} from 'vitest';

import {
  normalizeGenerationOptions,
  normalizeStyleOptions,
  serializeTranscriptForPrompt,
  summarizeTranscript,
} from '../src/lib/render-model.js';

describe('render model helpers', () => {
  it('merges generation defaults', () => {
    const options = normalizeGenerationOptions({tone: 'concise'});
    expect(options.tone).toBe('concise');
    expect(options.length).toBe('detailed');
  });

  it('defaults generation language to english and normalizes invalid values', () => {
    expect(normalizeGenerationOptions({}).language).toBe('en');
    expect(normalizeGenerationOptions({language: 'zh'}).language).toBe('zh');
    expect(normalizeGenerationOptions({language: 'fr'}).language).toBe('en');
  });

  it('clamps style values into safe ranges', () => {
    const style = normalizeStyleOptions({
      fontScale: 3,
      contentWidth: 2000,
      panelRatio: 10,
      paragraphSpacing: 0.1,
    });

    expect(style.fontScale).toBe(1.45);
    expect(style.contentWidth).toBe(1120);
    expect(style.panelRatio).toBe(30);
    expect(style.paragraphSpacing).toBe(0.8);
  });

  it('serializes and summarizes transcript entries', () => {
    const entries = [
      {id: 'cue-1', startMs: 0, durationMs: 800, text: 'Alpha'},
      {id: 'cue-2', startMs: 1500, durationMs: 800, text: 'Beta'},
    ];

    expect(serializeTranscriptForPrompt(entries)).toContain('[00:00] Alpha');
    expect(summarizeTranscript(entries)[1]).toEqual({
      id: 'cue-2',
      startLabel: '00:01',
      text: 'Beta',
    });
  });
});
