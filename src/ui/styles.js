export const APP_STYLES = `
[hidden] { display: none !important; }

:root {
  --app-bg: #f4f6fb;
  --panel-bg: rgba(255, 255, 255, 0.94);
  --panel-muted: #f5f7fb;
  --panel-border: rgba(15, 23, 42, 0.08);
  --panel-shadow: 0 18px 60px rgba(15, 23, 42, 0.12);
  --text-primary: #172033;
  --text-secondary: #56627a;
  --brand: #4263eb;
  --brand-soft: rgba(66, 99, 235, 0.12);
  --success: #1f9d68;
  --danger: #d9485f;
  --font-scale: 1;
  --content-width: 880px;
  --panel-ratio: 38%;
  --paragraph-spacing: 1;
  --radius-xl: 28px;
  --radius-lg: 20px;
  --radius-md: 14px;
}

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  min-height: 100%;
  color: var(--text-primary);
  background:
    radial-gradient(circle at top left, rgba(219, 39, 119, 0.15), transparent 26%),
    radial-gradient(circle at top right, rgba(59, 130, 246, 0.18), transparent 28%),
    linear-gradient(180deg, #fff, var(--app-bg));
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

body[data-theme="dark"] {
  --app-bg: #09111f;
  --panel-bg: rgba(13, 22, 38, 0.88);
  --panel-muted: rgba(18, 29, 49, 0.92);
  --panel-border: rgba(148, 163, 184, 0.18);
  --panel-shadow: 0 18px 60px rgba(2, 6, 23, 0.42);
  --text-primary: #f8fbff;
  --text-secondary: #9aa8c0;
  --brand-soft: rgba(96, 165, 250, 0.16);
  background:
    radial-gradient(circle at top left, rgba(124, 58, 237, 0.2), transparent 24%),
    radial-gradient(circle at top right, rgba(37, 99, 235, 0.22), transparent 30%),
    linear-gradient(180deg, #07101c, #0a1527);
}

a {
  color: inherit;
}

.app-shell {
  max-width: 1600px;
  margin: 0 auto;
  padding: 24px;
}

.hero-card,
.workspace-card {
  background: var(--panel-bg);
  backdrop-filter: blur(18px);
  border: 1px solid var(--panel-border);
  box-shadow: var(--panel-shadow);
}

.hero-card {
  position: relative;
  border-radius: calc(var(--radius-xl) + 8px);
  padding: 16px 24px 12px;
  margin-bottom: 16px;
  overflow: hidden;
}

#hero-description {
  text-align: right;
}

.hero-sublink {
  margin: 0;
  font-size: 0.88rem;
  color: var(--text-muted, #52525b);
  text-align: left;
  pointer-events: auto;
}

.hero-sublink a {
  color: var(--accent, #7c3aed);
  font-weight: 600;
  text-decoration: none;
}

.hero-sublink a:hover {
  text-decoration: underline;
}

.hero-wordmark {
  position: relative;
  z-index: 0;
  margin: 0;
  text-align: left;
  max-width: min(72%, 720px);
  padding: 0 0 10px;
  font-size: clamp(1.5rem, 0.95rem + 2.1vw, 3rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1.08;
  color: color-mix(in srgb, var(--brand) 26%, var(--text-primary) 74%);
  opacity: 0.18;
  text-transform: none;
  pointer-events: none;
}

.hero-title-zone {
  position: relative;
  padding: 14px 0 22px;
}

.hero-chrome-cluster {
  position: absolute;
  top: 14px;
  right: 0;
  z-index: 10;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.hero-chrome-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 9px 14px;
  border-radius: 999px;
  border: 1px solid var(--panel-border);
  background: color-mix(in srgb, var(--panel-bg) 82%, white 18%);
  color: var(--text-primary);
  font-size: 0.88rem;
  font-weight: 700;
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.1);
  cursor: pointer;
}

.locale-toggle-icon {
  font-size: 1rem;
  line-height: 1;
}

.hero-chrome-btn:hover {
  background: color-mix(in srgb, var(--panel-muted) 88%, white 12%);
}

.hero-chrome-btn:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--brand) 72%, white 28%);
  outline-offset: 2px;
}

.theme-toggle {
  gap: 6px;
  font-size: 1rem;
  line-height: 1;
}

.theme-toggle .material-symbols-outlined {
  display: inline-block;
  font-size: 1.2rem;
  line-height: 1;
  vertical-align: -0.2em;
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  -webkit-font-smoothing: antialiased;
}

.theme-toggle-sun,
.theme-toggle-moon {
  opacity: 0.38;
  transition: opacity 0.15s ease;
}

.theme-toggle-sep {
  opacity: 0.4;
  font-weight: 700;
  font-size: 0.82rem;
  user-select: none;
}

body[data-theme='light'] .theme-toggle .theme-toggle-sun {
  opacity: 1;
  filter: none;
}

body[data-theme='dark'] .theme-toggle .theme-toggle-moon {
  opacity: 1;
  filter: none;
}

.hero-topline {
  position: relative;
  z-index: 0;
  box-sizing: border-box;
  max-width: 100%;
  padding: 0 clamp(96px, 22vw, 220px) 0 0;
  margin: 0;
  /* Let clicks reach .hero-chrome-cluster above the wordmark row */
  pointer-events: none;
}

.hero-topline p {
  max-width: none;
}

.control-section {
  position: relative;
  z-index: 1;
  margin: 14px -24px 0;
  padding: 14px 24px 16px;
  border-top: 1px solid var(--panel-border);
  background: color-mix(in srgb, var(--panel-muted) 70%, transparent 30%);
}

.hero-card h1 {
  margin: 0 0 4px;
  font-size: clamp(1.6rem, 2.6vw, 2.4rem);
  line-height: 1.05;
}

.hero-card p {
  margin: 0;
  max-width: 860px;
  color: var(--text-secondary);
  font-size: 1rem;
}

.control-grid {
  margin-top: 0;
  display: grid;
  grid-template-columns: minmax(340px, 1.2fr) repeat(4, minmax(0, 1fr)) auto;
  gap: 10px;
}

.control-field {
  display: grid;
  gap: 4px;
}

.control-field label,
.section-label {
  font-size: 0.86rem;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.045em;
}

.control-field input,
.control-field select,
.control-field button,
.mini-controls select,
.mini-controls input[type="range"] {
  width: 100%;
  border-radius: 14px;
  border: 1px solid var(--panel-border);
  background: var(--panel-muted);
  color: var(--text-primary);
  font-size: 0.95rem;
}

.control-field input,
.control-field select {
  padding: 11px 13px;
}

.control-field select,
.mini-controls select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  padding-right: 38px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='M2.25 4.5L6 8.25L9.75 4.5' stroke='%2362738d' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  background-size: 12px 12px;
}

body[data-theme="dark"] .control-field select,
body[data-theme="dark"] .mini-controls select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='M2.25 4.5L6 8.25L9.75 4.5' stroke='%239aa8c0' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
}

.action-stack {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-self: end;
  justify-content: flex-end;
}

button {
  border: 0;
  cursor: pointer;
  transition: transform 180ms ease, box-shadow 180ms ease, background 180ms ease;
}

button:hover {
  transform: translateY(-1px);
}

.primary-button,
.secondary-button {
  padding: 7px 18px;
  font-size: 0.875rem;
  font-weight: 700;
  min-height: 34px;
  border-radius: 999px;
  white-space: nowrap;
  width: fit-content;
}

.primary-button {
  color: white;
  background: linear-gradient(135deg, #2563eb, #9333ea);
  box-shadow: 0 10px 28px rgba(59, 130, 246, 0.24);
}

.secondary-button {
  color: var(--text-primary);
  background: var(--panel-muted);
  border: 1px solid var(--panel-border);
}

.secondary-button[disabled],
.primary-button[disabled] {
  cursor: not-allowed;
  opacity: 0.55;
  transform: none;
  box-shadow: none;
}

.workspace-card {
  border-radius: calc(var(--radius-xl) + 8px);
  padding: 18px;
  min-height: 0;
}

/* Viewport-bounded workbench: transcript scrolls inside, page does not grow with cue count */
.workspace-grid {
  display: grid;
  grid-template-columns: minmax(360px, var(--panel-ratio)) minmax(0, 1fr);
  gap: 18px;
  align-items: stretch;
  min-height: 0;
  height: clamp(380px, calc(100dvh - 260px), 2000px);
  max-height: calc(100dvh - 200px);
}

.left-column,
.right-column {
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-height: 0;
}

.left-column > .panel--video {
  flex: 0 0 auto;
}

.left-column > .panel--transcript {
  flex: 1 1 0;
  min-height: 0;
}

.panel {
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.panel-header {
  padding: 16px 18px 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid var(--panel-border);
}

.panel-header-copy {
  min-width: 0;
}

.panel-header-tabs {
  display: grid;
  grid-template-columns: 1fr;
  align-items: start;
  gap: 14px;
}

.panel-header h2,
.panel-header h3 {
  margin: 0;
  font-size: 1rem;
}

.panel-subtitle {
  margin-top: 4px;
  font-size: 0.88rem;
  color: var(--text-secondary);
}

.panel-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.panel--video .panel-body.player-stage {
  flex: 0 1 auto;
  min-height: 0;
  overflow: visible;
}

.panel--transcript .panel-body.transcript-scroll {
  flex: 1 1 0;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.panel--transcript .transcript-list {
  flex: 1 1 auto;
  min-height: 0;
}

.right-column > .panel {
  flex: 1 1 0;
  min-height: 0;
}

.transcript-virtual {
  position: relative;
  width: 100%;
}

.transcript-virtual-spacer {
  flex-shrink: 0;
  width: 100%;
  pointer-events: none;
}


.player-stage {
  padding: 14px;
}

.player-shell {
  position: relative;
  aspect-ratio: 16 / 9;
  border-radius: 22px;
  background: linear-gradient(145deg, rgba(37, 99, 235, 0.18), rgba(124, 58, 237, 0.3));
  overflow: hidden;
  display: grid;
  place-items: center;
}

.player-shell::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0) 50%, rgba(15, 23, 42, 0.26));
  pointer-events: none;
}

#youtube-player,
.player-placeholder,
.player-shell iframe {
  width: 100%;
  height: 100%;
}

.player-placeholder {
  display: grid;
  place-items: center;
  color: white;
  text-align: center;
  padding: 24px;
}

.video-meta {
  padding: 8px 14px 0;
  flex-shrink: 0;
}

.video-meta-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 12px;
  padding: 8px 10px;
  border-radius: 12px;
  background: var(--panel-muted);
  border: 1px solid var(--panel-border);
  font-size: 0.82rem;
  color: var(--text-secondary);
}

.video-meta-bar .video-meta-channel {
  font-weight: 600;
  color: var(--text-primary);
  min-width: 0;
}

.video-meta-bar .inline-link {
  flex-shrink: 0;
}

.video-pill-list,
.mini-controls {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}

.pill {
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 0.85rem;
  background: var(--brand-soft);
  color: var(--brand);
  font-weight: 700;
}

.transcript-list {
  padding: 6px 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.transcript-item {
  padding: 5px 10px;
  border-radius: 8px;
  background: transparent;
  border: 1px solid transparent;
  display: flex;
  align-items: baseline;
  gap: 10px;
  text-align: left;
  width: 100%;
}

.transcript-item:hover,
.transcript-item.is-active {
  background: var(--panel-muted);
  border-color: var(--panel-border);
}

.transcript-item time {
  font-size: 0.75rem;
  color: var(--brand);
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
}

.transcript-item p {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.4;
  color: color-mix(in srgb, var(--text-primary) 85%, var(--text-secondary) 15%);
}

.transcript-item.is-active p {
  color: var(--text-primary);
  font-weight: 500;
}

.tab-strip {
  display: flex;
  gap: 8px;
  flex-wrap: nowrap;
  overflow-x: auto;
  align-self: end;
  padding: 6px 2px 0;
  scrollbar-width: none;
}

.tab-strip::-webkit-scrollbar {
  display: none;
}

.tab-button {
  position: relative;
  padding: 12px 18px 11px;
  border-radius: 16px 16px 0 0;
  background: linear-gradient(180deg, color-mix(in srgb, var(--panel-muted) 92%, white 8%), color-mix(in srgb, var(--panel-bg) 88%, var(--panel-muted) 12%));
  border: 1px solid var(--panel-border);
  border-bottom-color: transparent;
  color: var(--text-secondary);
  font-weight: 700;
  white-space: nowrap;
  flex: 0 0 auto;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.55);
  transform: translateY(1px);
}

.tab-button.is-active {
  color: var(--brand);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(255, 255, 255, 0.9));
  border-color: rgba(66, 99, 235, 0.22);
  box-shadow:
    0 -10px 24px rgba(66, 99, 235, 0.08),
    inset 0 2px 0 rgba(66, 99, 235, 0.14);
  transform: translateY(0);
  z-index: 2;
}

body[data-theme="dark"] .tab-button {
  background: linear-gradient(180deg, rgba(19, 31, 52, 0.98), rgba(14, 24, 40, 0.94));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

body[data-theme="dark"] .tab-button.is-active {
  background: linear-gradient(180deg, rgba(25, 39, 66, 0.98), rgba(17, 29, 49, 0.98));
  border-color: rgba(96, 165, 250, 0.34);
  box-shadow:
    0 -10px 28px rgba(30, 64, 175, 0.18),
    inset 0 2px 0 rgba(96, 165, 250, 0.14);
}

body[data-theme="dark"] .hero-chrome-btn {
  background: color-mix(in srgb, var(--panel-bg) 84%, #0f172a 16%);
  box-shadow: 0 12px 28px rgba(2, 6, 23, 0.34);
}

.analysis-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  min-height: 0;
  height: 100%;
}

.analysis-main {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.analysis-sidebar {
  border-left: 1px solid var(--panel-border);
  background: color-mix(in srgb, var(--panel-bg) 78%, var(--panel-muted) 22%);
  display: flex;
  flex-direction: column;
}

.sidebar-section {
  padding: 16px;
  border-bottom: 1px solid var(--panel-border);
}

.sidebar-section:last-child {
  border-bottom: 0;
}

.mini-controls {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.mini-controls label {
  display: grid;
  gap: 8px;
  font-size: 0.86rem;
  color: var(--text-secondary);
}

.mini-controls select,
.mini-controls input[type="range"] {
  padding: 9px 11px;
}

.mini-controls select {
  padding-right: 36px;
  background-position: right 12px center;
}

.status-line {
  padding: 12px 18px;
  font-size: 0.9rem;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--panel-border);
  background: color-mix(in srgb, var(--panel-muted) 80%, white 20%);
}

.status-line strong {
  color: var(--text-primary);
}

.summary-scroll,
.detail-scroll {
  flex: 1;
  overflow: auto;
}

.summary-frame {
  max-width: min(100%, var(--content-width));
  margin: 0 auto;
  padding: 28px 28px 80px;
  font-size: calc(18px * var(--font-scale));
  line-height: calc(1.78 * var(--paragraph-spacing));
}

.summary-frame article,
.summary-frame section,
.summary-frame div {
  display: block;
}

.summary-frame h1 {
  margin: 0 0 24px;
  font-size: calc(2.5rem * var(--font-scale));
  line-height: 1.1;
  letter-spacing: -0.03em;
}

.summary-frame h2 {
  margin: 38px 0 16px;
  padding-bottom: 10px;
  font-size: calc(1.6rem * var(--font-scale));
  line-height: 1.25;
  border-bottom: 2px solid var(--panel-border);
}

.summary-frame h3 {
  margin: 26px 0 12px;
  font-size: calc(1.18rem * var(--font-scale));
  line-height: 1.3;
}

.summary-frame p,
.summary-frame li,
.summary-frame blockquote {
  margin: 0 0 calc(16px * var(--paragraph-spacing));
}

.summary-frame p,
.summary-frame li {
  color: color-mix(in srgb, var(--text-primary) 88%, var(--text-secondary) 12%);
}

.summary-frame strong {
  font-weight: 760;
}

.summary-frame li > strong:first-child {
  text-decoration: underline;
  text-underline-offset: 3px;
}

.summary-frame blockquote {
  padding: 18px 20px;
  border-left: 4px solid var(--brand);
  background: color-mix(in srgb, var(--brand-soft) 75%, white 25%);
  border-radius: 0 18px 18px 0;
}

body[data-emphasis-density="quiet"] .summary-frame strong {
  font-weight: 650;
}

body[data-emphasis-density="quiet"] .summary-frame blockquote {
  background: color-mix(in srgb, var(--brand-soft) 50%, white 50%);
}

body[data-emphasis-density="high"] .summary-frame strong {
  font-weight: 820;
}

body[data-emphasis-density="high"] .summary-frame blockquote {
  border-left-width: 6px;
}

.summary-frame hr {
  margin: 30px 0;
  border: 0;
  height: 1px;
  background: var(--panel-border);
}

.summary-frame ul,
.summary-frame ol {
  padding-left: 1.25em;
}

.empty-state,
.loading-state,
.error-state,
.notice-card {
  margin: 18px;
  padding: 18px;
  border-radius: 18px;
  background: var(--panel-muted);
  color: var(--text-secondary);
  border: 1px solid var(--panel-border);
}

.error-state {
  color: var(--danger);
}

.mindmap-root {
  display: grid;
  gap: 14px;
  padding: 18px;
}

.mindmap-node {
  border-left: 2px solid color-mix(in srgb, var(--brand) 28%, transparent 72%);
  padding-left: 16px;
}

.mindmap-card {
  padding: 14px 16px;
  border-radius: 18px;
  background: var(--panel-muted);
  border: 1px solid var(--panel-border);
}

.mindmap-card h4 {
  margin: 0 0 8px;
  font-size: 1rem;
}

.mindmap-card p {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.55;
}

.recommendation-grid,
.people-grid,
.person-video-grid {
  display: grid;
  gap: 12px;
  padding: 18px;
}

.recommendation-card,
.person-card,
.person-video-card {
  padding: 16px;
  border-radius: 18px;
  background: var(--panel-muted);
  border: 1px solid var(--panel-border);
  display: grid;
  gap: 10px;
}

.recommendation-card h4,
.person-card h4,
.person-video-card h4 {
  margin: 0;
  font-size: 1rem;
}

.recommendation-meta,
.card-meta {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.confidence-bar {
  height: 8px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.2);
  overflow: hidden;
}

.confidence-bar span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #2563eb, #8b5cf6);
}

.person-card {
  cursor: pointer;
  text-align: left;
}

.person-card.is-selected {
  border-color: rgba(66, 99, 235, 0.28);
  box-shadow: inset 0 0 0 1px rgba(66, 99, 235, 0.12);
}

.person-links {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.person-links a,
.inline-link {
  color: var(--brand);
  text-decoration: none;
  font-weight: 700;
}

.person-links a:hover,
.inline-link:hover {
  text-decoration: underline;
}

.detail-card {
  display: grid;
  gap: 16px;
  padding: 18px;
}

.detail-card h3,
.detail-card h4 {
  margin: 0;
}

.detail-card p {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.62;
}

.detail-badge-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.footer-note {
  padding: 0 18px 18px;
  color: var(--text-secondary);
  font-size: 0.85rem;
}

@media (max-width: 1200px) {
  .workspace-grid {
    height: auto;
    max-height: none;
    min-height: min(76vh, 720px);
  }

  .control-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .action-stack {
    grid-column: span 2;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .workspace-grid,
  .analysis-layout {
    grid-template-columns: 1fr;
  }

  .analysis-sidebar {
    border-left: 0;
    border-top: 1px solid var(--panel-border);
  }
}

@media (max-width: 720px) {
  .app-shell {
    padding: 14px;
  }

  .hero-card,
  .workspace-card {
    border-radius: 24px;
  }

  .control-grid,
  .mini-controls {
    grid-template-columns: 1fr;
  }

  .action-stack {
    grid-column: auto;
    flex-direction: column;
  }

  .summary-frame {
    padding: 22px 18px 64px;
  }

  .hero-wordmark {
    max-width: 100%;
    padding-bottom: 8px;
    font-size: clamp(1.35rem, 0.85rem + 2.4vw, 2.5rem);
  }

  .hero-chrome-cluster {
    top: 10px;
    right: 0;
    gap: 8px;
  }

  .hero-title-zone {
    padding: 10px 0 18px;
  }

  .hero-topline {
    padding-right: min(200px, 46vw);
  }
}

/* --- Simplified version transcript page (/simplified-version) --- */
.simplified-version-body {
  margin: 0;
  min-height: 100vh;
  background: var(--app-bg, #f4f4f5);
  color: var(--text-primary, #18181b);
}

.simplified-version-shell {
  max-width: 720px;
  margin: 0 auto;
  padding: 28px 20px 48px;
}

.simplified-version-header {
  margin-bottom: 24px;
}

.simplified-version-back {
  display: inline-block;
  font-size: 0.9rem;
  margin-bottom: 12px;
  color: var(--accent, #7c3aed);
  text-decoration: none;
}

.simplified-version-back:hover {
  text-decoration: underline;
}

.simplified-version-header h1 {
  margin: 0 0 8px;
  font-size: clamp(1.5rem, 4vw, 1.85rem);
  font-weight: 700;
}

.simplified-version-lead {
  margin: 0;
  font-size: 0.95rem;
  color: var(--text-muted, #52525b);
  line-height: 1.45;
}

.simplified-version-controls label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.simplified-version-input-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.simplified-version-input-row input[type='url'] {
  flex: 1 1 220px;
  min-width: 0;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid var(--panel-border, #e4e4e7);
  font-size: 0.95rem;
  background: var(--input-bg, #fff);
}

.simplified-version-status {
  margin: 12px 0 0;
  min-height: 1.35em;
  font-size: 0.9rem;
  color: var(--text-muted, #52525b);
}

.simplified-version-status[data-kind='error'] {
  color: #b91c1c;
}

.simplified-version-status[data-kind='success'] {
  color: #15803d;
}

.simplified-version-video-panel {
  margin-bottom: 20px;
  padding: 16px 18px;
  border-radius: 16px;
  background: var(--panel-bg, #fff);
  border: 1px solid var(--panel-border, #e4e4e7);
}

.simplified-version-video-panel h2 {
  margin: 0 0 6px;
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.35;
}

.simplified-version-video-meta {
  margin: 0;
  font-size: 0.82rem;
  color: var(--text-muted, #52525b);
  word-break: break-all;
}

.simplified-version-transcript-wrap {
  border-radius: 16px;
  border: 1px solid var(--panel-border, #e4e4e7);
  background: var(--panel-bg, #fff);
  overflow: hidden;
}

.simplified-version-transcript {
  max-height: min(70vh, 640px);
  overflow: auto;
  padding: 12px 14px 16px;
  -webkit-overflow-scrolling: touch;
}

.simplified-version-cue {
  display: grid;
  grid-template-columns: 52px 1fr;
  gap: 10px 12px;
  padding: 8px 0;
  border-bottom: 1px solid var(--panel-border, #f4f4f5);
  align-items: start;
}

.simplified-version-cue:last-child {
  border-bottom: 0;
}

.simplified-version-cue time {
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
  color: var(--text-muted, #71717a);
  padding-top: 2px;
}

.simplified-version-cue p {
  margin: 0;
  font-size: 0.92rem;
  line-height: 1.45;
}

.simplified-version-error {
  padding: 16px;
  color: #b91c1c;
  font-size: 0.9rem;
}
`;
