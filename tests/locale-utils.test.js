import {describe, expect, it} from 'vitest';

import {buildLocalizedSelectOptions} from '../src/ui/locale-utils.js';

describe('buildLocalizedSelectOptions', () => {
  it('rebuilds select labels from locale copy while preserving values', () => {
    const result = buildLocalizedSelectOptions(
      [
        {value: 'insightful', text: 'Insightful'},
        {value: 'analytical', text: 'Analytical'},
      ],
      {
        insightful: '有洞察',
        analytical: '偏分析',
      },
    );

    expect(result).toEqual([
      {value: 'insightful', text: '有洞察'},
      {value: 'analytical', text: '偏分析'},
    ]);
  });

  it('falls back to existing text when a locale label is missing', () => {
    const result = buildLocalizedSelectOptions(
      [{value: 'balanced', text: 'Balanced'}],
      {},
    );

    expect(result).toEqual([{value: 'balanced', text: 'Balanced'}]);
  });
});
