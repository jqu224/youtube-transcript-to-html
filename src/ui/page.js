import {TAB_CONFIG} from '../lib/render-model.js';
import {APP_TITLE, FAVICON_DATA_URI} from './brand.js';

export function renderAppPage() {
  const tabButtons = TAB_CONFIG.map((tab) => {
    return `
      <button class="tab-button${tab.id === 'smartnote' ? ' is-active' : ''}" type="button" data-tab-button="${tab.id}">
        ${tab.label}
      </button>
    `;
  }).join('');

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title id="app-title">${APP_TITLE}</title>
    <meta
      id="app-description"
      name="description"
      content="Live YouTube transcript workspace with streamed Chinese AI summary, mindmap, related videos, and people tabs."
    >
    <link rel="icon" type="image/svg+xml" href="${FAVICON_DATA_URI}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
    >
    <link rel="stylesheet" href="/assets/styles.css">
  </head>
  <body data-theme="light">
    <div class="app-shell">
      <section class="hero-card">
        <div class="hero-title-zone">

          <div class="hero-chrome-cluster">
            <button class="hero-chrome-btn theme-toggle" type="button" id="theme-toggle" aria-label="Toggle color theme">
              <span class="material-symbols-outlined theme-toggle-sun" aria-hidden="true">light_mode</span>
              <span class="theme-toggle-sep" aria-hidden="true">/</span>
              <span class="material-symbols-outlined theme-toggle-moon" aria-hidden="true">bedtime</span>
            </button>
            <button class="hero-chrome-btn locale-toggle" type="button" id="locale-toggle" aria-label="Switch language">
              <span class="locale-toggle-icon" aria-hidden="true">&#127760;</span>
              <span id="locale-toggle-text">EN / 中文</span>
            </button>
          </div>
          <div class="hero-topline">
            <div class="hero-wordmark">/ YouTube Transcript To AI Notes /</div>
            </div>
        </div>

        <div class="control-section" id="control-section">
          <button
            class="control-collapse-toggle"
            id="control-collapse-toggle"
            type="button"
            aria-expanded="true"
            aria-label="Toggle URL controls"
            hidden
          >▼</button>
          <div class="control-grid">
          <div class="control-field">
            <label for="video-url" id="label-video-url">YouTube URL</label>
            <input
              id="video-url"
              name="video-url"
              type="url"
              value="https://www.youtube.com/watch?v=xRh2sVcNXQ8"
              placeholder="https://www.youtube.com/watch?v=xRh2sVcNXQ8"
              spellcheck="false"
            >
          </div>

          <div class="control-field" hidden>
            <label for="tone" id="label-tone">Tone</label>
            <select id="tone">
              <option value="insightful">Insightful</option>
              <option value="analytical">Analytical</option>
              <option value="concise">Concise</option>
              <option value="dramatic">Dramatic</option>
            </select>
          </div>

          <div class="control-field" hidden>
            <label for="length" id="label-length">Length</label>
            <select id="length">
              <option value="detailed">Detailed</option>
              <option value="balanced">Balanced</option>
              <option value="compact">Compact</option>
            </select>
          </div>

          <div class="control-field" hidden>
            <label for="section-density" id="label-section-density">Section Density</label>
            <select id="section-density">
              <option value="balanced">Balanced</option>
              <option value="dense">Dense</option>
              <option value="spacious">Spacious</option>
            </select>
          </div>

          <div class="control-field" hidden>
            <label for="related-focus" id="label-related-focus">Related Focus</label>
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
        </div>
      </section>

      <section class="workspace-card">
        <div class="workspace-grid">
          <div class="left-column">
            <section class="panel panel--video">
              <header class="panel-header">
                <div>
                  <h2 id="player-title">Live Video</h2>
                  <div class="panel-subtitle" id="video-subtitle">Load a video to start the workspace.</div>
                </div>
                <div class="video-pill-list" id="video-badges"></div>
              </header>

              <div class="panel-body player-stage">
                <div class="player-shell">
                  <div class="player-placeholder" id="player-placeholder">
                    <div>
                      <strong id="player-placeholder-title">Paste a captioned YouTube video</strong>
                      <p id="player-placeholder-copy">The player, transcript, and AI tabs will populate together.</p>
                    </div>
                  </div>
                  <div id="youtube-player" hidden></div>
                </div>
                <div class="video-meta" id="video-meta"></div>
              </div>
            </section>

            <section class="panel panel--transcript">
              <header class="panel-header">
                <div>
                  <h2 id="transcript-title">Live Transcript</h2>
                  <div class="panel-subtitle" id="transcript-subtitle">Transcript cues will appear here.</div>
                </div>
                <div class="mini-controls">
                  <label id="label-auto-follow">
                    Auto Follow
                    <select id="auto-follow">
                      <option value="on">On</option>
                      <option value="off">Off</option>
                    </select>
                  </label>
                  <label id="label-transcript-window">
                    Transcript Window
                    <select id="transcript-window">
                      <option value="all">All cues</option>
                      <option value="blocks">15 sec blocks</option>
                      <option value="smart" selected>Smart slices</option>
                    </select>
                  </label>
                </div>
              </header>
              <div class="panel-body transcript-scroll" id="transcript-scroll">
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
                  <h2 id="workspace-title">AI Workspace</h2>
                  <div class="panel-subtitle" id="workspace-subtitle">
                    Smartnote is the default tab. AI Summary is also available.
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
                      Smartnote will appear here as soon as you load a workspace.
                    </div>
                  </div>
                </div>

                <aside class="analysis-sidebar" hidden>
                  <section class="sidebar-section" id="generation-controls-section" hidden>
                    <div class="section-label" id="generation-section-title">Generation Controls</div>
                    <div class="mini-controls">
                      <label id="label-title-style">
                        Title Style
                        <select id="title-style">
                          <option value="editorial">Editorial</option>
                          <option value="plain">Plain</option>
                          <option value="bold">Bold</option>
                        </select>
                      </label>
                      <label id="label-quote-emphasis">
                        Quote Emphasis
                        <select id="quote-emphasis">
                          <option value="high">High</option>
                          <option value="balanced">Balanced</option>
                          <option value="low">Low</option>
                        </select>
                      </label>
                      <label id="label-mindmap-depth">
                        Mindmap Depth
                        <select id="mindmap-depth">
                          <option value="balanced">Balanced</option>
                          <option value="deep">Deep</option>
                          <option value="overview">Overview</option>
                        </select>
                      </label>
                      <label id="label-people-depth">
                        People Depth
                        <select id="people-depth">
                          <option value="balanced">Balanced</option>
                          <option value="deep">Deep</option>
                          <option value="light">Light</option>
                        </select>
                      </label>
                    </div>
                  </section>

                  <section class="sidebar-section" id="detail-pane-section" hidden>
                    <div class="section-label" id="detail-pane-title">Detail Pane</div>
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
