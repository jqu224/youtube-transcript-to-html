import {describe, expect, it} from 'vitest';

import {translateTranscript} from '../src/lib/transcript.js';

describe('translateTranscript', () => {
  it('preserves cue metadata while replacing text with translated output', async () => {
    const entries = [
      {id: 'cue-1', startMs: 0, durationMs: 1000, text: 'Hello world'},
      {id: 'cue-2', startMs: 1000, durationMs: 1000, text: 'Second cue'},
    ];

    const result = await translateTranscript({
      apiKey: 'demo-key',
      model: 'demo-model',
      transcriptEntries: entries,
      targetLanguage: 'zh',
      fetchFn: async () => ({
        ok: true,
        async json() {
          return {
            candidates: [
              {
                content: {
                  parts: [
                    {
                      text: JSON.stringify({
                        entries: [
                          {id: 'cue-1', text: '你好，世界'},
                          {id: 'cue-2', text: '第二条字幕'},
                        ],
                      }),
                    },
                  ],
                },
              },
            ],
          };
        },
      }),
    });

    expect(result.entries).toEqual([
      {id: 'cue-1', startMs: 0, durationMs: 1000, text: '你好，世界'},
      {id: 'cue-2', startMs: 1000, durationMs: 1000, text: '第二条字幕'},
    ]);
  });
});
