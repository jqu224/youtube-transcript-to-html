import {describe, expect, it} from 'vitest';

import {renderAppPage} from '../src/ui/page.js';

describe('renderAppPage', () => {
  it('renders the svg favicon and no visible hero logo image', () => {
    const html = renderAppPage();

    expect(html).toContain('<title id="app-title">YouTube AI Workspace</title>');
    expect(html).toContain('rel="icon" type="image/svg+xml"');
    expect(html).toContain('data:image/svg+xml,');
    expect(html).not.toContain('hero-logo-image');
  });

  it('uses viewport workbench panels and transcript scroll container', () => {
    const html = renderAppPage();
    expect(html).toContain('panel--video');
    expect(html).toContain('panel--transcript');
    expect(html).toContain('id="transcript-scroll"');
    expect(html).toContain('class="panel-body transcript-scroll"');
    expect(html).toContain('value="smart" selected');
    expect(html).toContain('data-tab-button="smartnote"');
    expect(html).toContain('Smartnote is the default tab');
  });
});
