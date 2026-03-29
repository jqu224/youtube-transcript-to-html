import {describe, expect, it} from 'vitest';
import {renderSimplifiedVersionTranscriptPage} from '../src/ui/simplified-version-page.js';

describe('renderSimplifiedVersionTranscriptPage', () => {
  it('renders shell markup and asset wiring', () => {
    const html = renderSimplifiedVersionTranscriptPage();
    expect(html).toContain('<!doctype html>');
    expect(html).toContain('Simplified version');
    expect(html).toContain('id="simplified-version-url"');
    expect(html).toContain('id="simplified-version-load"');
    expect(html).toContain('id="simplified-version-transcript"');
    expect(html).toContain('/assets/simplified-version.js');
  });
});
