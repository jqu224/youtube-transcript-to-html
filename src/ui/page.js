import {TAB_CONFIG} from '../lib/render-model.js';

export function renderAppPage() {
  const tabButtons = TAB_CONFIG.map((tab) => {
    return `
      <button class="tab-button${tab.id === 'summary' ? ' is-active' : ''}" type="button" data-tab-button="${tab.id}">
        ${tab.label}
      </button>
    `;
  }).join('');

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>YouTube Transcript To HTML</title>
    <meta
      name="description"
      content="Live YouTube transcript workspace with streamed Chinese AI summary, mindmap, related videos, and people tabs."
    >
    <link rel="stylesheet" href="/assets/styles.css">
  </head>
  <body data-theme="light">
    <div class="app-shell">
      <section class="hero-card">
        <div class="hero-wordmark">/ Youtube Transcript To HTML /</div>
        <div class="hero-topline">
          <div class="hero-brand">
            <div>
              <h1>YouTube Caption → AI workspace.</h1>
              <p>Paste a URL. Stream a live summary, mindmap, related videos, and people intel.</p>
            </div>
          </div>
        </div>

        <div class="control-grid">
          <div class="control-field">
            <label for="video-url">YouTube URL</label>
            <input
              id="video-url"
              name="video-url"
              type="url"
              placeholder="https://www.youtube.com/watch?v=xRh2sVcNXQ8"
              spellcheck="false"
            >
          </div>

          <div class="control-field">
            <label for="tone">Tone</label>
            <select id="tone">
              <option value="insightful">Insightful</option>
              <option value="analytical">Analytical</option>
              <option value="concise">Concise</option>
              <option value="dramatic">Dramatic</option>
            </select>
          </div>

          <div class="control-field">
            <label for="length">Length</label>
            <select id="length">
              <option value="detailed">Detailed</option>
              <option value="balanced">Balanced</option>
              <option value="compact">Compact</option>
            </select>
          </div>

          <div class="control-field">
            <label for="section-density">Section Density</label>
            <select id="section-density">
              <option value="balanced">Balanced</option>
              <option value="dense">Dense</option>
              <option value="spacious">Spacious</option>
            </select>
          </div>

          <div class="control-field">
            <label for="related-focus">Related Focus</label>
            <select id="related-focus">
              <option value="adjacent">Adjacent topics</option>
              <option value="same-speakers">Same speakers</option>
              <option value="deeper-dive">Deeper dive</option>
            </select>
          </div>

          <div class="action-stack">
            <button class="primary-button" type="button" id="load-workspace">Load Workspace</button>
            <button class="secondary-button" type="button" id="regenerate-summary" disabled>Regenerate</button>
          </div>
        </div>
      </section>

      <section class="workspace-card">
        <div class="workspace-grid">
          <div class="left-column">
            <section class="panel">
              <header class="panel-header">
                <div>
                  <h2>Live Video</h2>
                  <div class="panel-subtitle" id="video-subtitle">Load a video to start the workspace.</div>
                </div>
                <div class="video-pill-list" id="video-badges"></div>
              </header>

              <div class="panel-body player-stage">
                <div class="player-shell">
                  <div class="player-placeholder" id="player-placeholder">
                    <div>
                      <strong>Paste a captioned YouTube video</strong>
                      <p>The player, transcript, and AI tabs will populate together.</p>
                    </div>
                  </div>
                  <div id="youtube-player" hidden></div>
                </div>
                <div class="video-meta" id="video-meta"></div>
              </div>
            </section>

            <section class="panel">
              <header class="panel-header">
                <div>
                  <h2>Live Transcript</h2>
                  <div class="panel-subtitle" id="transcript-subtitle">Transcript cues will appear here.</div>
                </div>
                <div class="mini-controls">
                  <label>
                    Auto Follow
                    <select id="auto-follow">
                      <option value="on">On</option>
                      <option value="off">Off</option>
                    </select>
                  </label>
                  <label>
                    Transcript Window
                    <select id="transcript-window">
                      <option value="all">All cues</option>
                      <option value="short">Compact</option>
                    </select>
                  </label>
                </div>
              </header>
              <div class="panel-body">
                <div class="transcript-list" id="transcript-list">
                  <div class="empty-state">Transcript cues will become clickable once the workspace is loaded.</div>
                </div>
              </div>
            </section>
          </div>

          <div class="right-column">
            <section class="panel">
              <header class="panel-header panel-header-tabs">
                <div class="panel-header-copy">
                  <h2>AI Workspace</h2>
                  <div class="panel-subtitle" id="workspace-subtitle">
                    Summary is the default tab. Mindmap, related videos, and people load on demand.
                  </div>
                </div>
                <div class="tab-strip" role="tablist" aria-label="Workspace tabs">
                  ${tabButtons}
                </div>
              </header>
              <div class="status-line" id="status-line"><strong>Ready.</strong> Load a video to begin.</div>
              <div class="panel-body analysis-layout">
                <div class="analysis-main">
                  <div class="summary-scroll" id="analysis-main">
                    <div class="empty-state" id="analysis-empty">
                      The summary tab will stream HTML here as soon as you load a workspace.
                    </div>
                  </div>
                </div>

                <aside class="analysis-sidebar">
                  <section class="sidebar-section">
                    <div class="section-label">Realtime Style</div>
                    <div class="mini-controls">
                      <label>
                        Theme
                        <select id="theme-select">
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                        </select>
                      </label>
                      <label>
                        Font Scale
                        <input id="font-scale" type="range" min="0.85" max="1.45" step="0.05" value="1">
                      </label>
                      <label>
                        Content Width
                        <input id="content-width" type="range" min="680" max="1120" step="20" value="880">
                      </label>
                      <label>
                        Panel Ratio
                        <input id="panel-ratio" type="range" min="30" max="55" step="1" value="38">
                      </label>
                      <label>
                        Paragraph Space
                        <input id="paragraph-spacing" type="range" min="0.8" max="1.5" step="0.05" value="1">
                      </label>
                      <label>
                        Emphasis
                        <select id="emphasis-density">
                          <option value="balanced">Balanced</option>
                          <option value="quiet">Quiet</option>
                          <option value="high">High</option>
                        </select>
                      </label>
                    </div>
                  </section>

                  <section class="sidebar-section">
                    <div class="section-label">Generation Controls</div>
                    <div class="mini-controls">
                      <label>
                        Title Style
                        <select id="title-style">
                          <option value="editorial">Editorial</option>
                          <option value="plain">Plain</option>
                          <option value="bold">Bold</option>
                        </select>
                      </label>
                      <label>
                        Quote Emphasis
                        <select id="quote-emphasis">
                          <option value="high">High</option>
                          <option value="balanced">Balanced</option>
                          <option value="low">Low</option>
                        </select>
                      </label>
                      <label>
                        Mindmap Depth
                        <select id="mindmap-depth">
                          <option value="balanced">Balanced</option>
                          <option value="deep">Deep</option>
                          <option value="overview">Overview</option>
                        </select>
                      </label>
                      <label>
                        People Depth
                        <select id="people-depth">
                          <option value="balanced">Balanced</option>
                          <option value="deep">Deep</option>
                          <option value="light">Light</option>
                        </select>
                      </label>
                    </div>
                  </section>

                  <section class="sidebar-section">
                    <div class="section-label">Detail Pane</div>
                    <div class="detail-scroll" id="detail-pane">
                      <div class="notice-card">Click a person in the People tab to load wiki-style details and related videos.</div>
                    </div>
                  </section>
                </aside>
              </div>
            </section>
          </div>
        </div>
      </section>
    </div>

    <script src="https://www.youtube.com/iframe_api"></script>
    <script type="module" src="/assets/app.js"></script>
  </body>
</html>`;   
}
