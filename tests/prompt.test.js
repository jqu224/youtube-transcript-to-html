import {describe, expect, it} from 'vitest';

import {
  buildMindmapPrompt,
  buildPeoplePrompt,
  buildRelatedVideosPrompt,
  buildSummaryPrompt,
  buildTranscriptTranslationPrompt,
} from '../src/lib/prompt.js';

const video = {
  title: 'Demo Video',
  channelTitle: 'Demo Channel',
};

const transcriptEntries = [
  {id: 'cue-1', startMs: 0, durationMs: 1000, text: 'First point about AI revenue growth.'},
  {id: 'cue-2', startMs: 1000, durationMs: 1000, text: 'Second point about competition and chips.'},
];

describe('prompt builders', () => {
  it('builds a summary prompt with transcript and html instructions', () => {
    const prompt = buildSummaryPrompt({
      video,
      transcriptEntries,
      options: {tone: 'analytical'},
    });

    expect(prompt).toContain('Demo Video');
    expect(prompt).toContain('Only output HTML fragments');
    expect(prompt).toContain('[00:00] First point about AI revenue growth.');
  });

  it('builds summary prompts in english when requested', () => {
    const prompt = buildSummaryPrompt({
      video,
      transcriptEntries,
      options: {language: 'en'},
    });

    expect(prompt).toContain('Write in fluent English.');
    expect(prompt).toContain('Start with one strong <h1> title in English.');
  });

  it('builds structured prompts for tabs', () => {
    expect(buildMindmapPrompt({video, transcriptEntries, options: {}})).toContain('"nodes"');
    expect(buildPeoplePrompt({video, transcriptEntries, options: {}})).toContain('"people"');
    expect(
      buildRelatedVideosPrompt({
        video,
        transcriptEntries,
        options: {},
        searchResults: [{title: 'Related', channelTitle: 'Elsewhere', url: 'https://youtube.com/watch?v=1'}],
      }),
    ).toContain('"recommendations"');
  });

  it('builds transcript translation prompts with target language instructions', () => {
    const prompt = buildTranscriptTranslationPrompt({
      transcriptEntries,
      targetLanguage: 'zh',
    });

    expect(prompt).toContain('"entries"');
    expect(prompt).toContain('Simplified Chinese');
    expect(prompt).toContain('cue-1');
  });
});
