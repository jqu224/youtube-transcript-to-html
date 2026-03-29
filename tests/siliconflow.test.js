import {describe, expect, it} from 'vitest';

import {extractSiliconFlowAssistantText} from '../src/lib/siliconflow.js';

describe('extractSiliconFlowAssistantText', () => {
  it('joins text blocks from SiliconFlow message response', () => {
    const text = extractSiliconFlowAssistantText({
      content: [
        {type: 'thinking', thinking: 'x'},
        {type: 'text', text: 'Hello'},
        {type: 'text', text: ' world'},
      ],
    });
    expect(text).toBe('Hello world');
  });

  it('returns empty string for unexpected shape', () => {
    expect(extractSiliconFlowAssistantText({})).toBe('');
    expect(extractSiliconFlowAssistantText(null)).toBe('');
  });
});
