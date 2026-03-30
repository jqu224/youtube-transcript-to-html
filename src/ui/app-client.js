/**
 * Minimal client bootstrap — ground-up refactor baseline.
 * Wires theme toggle, locale toggle, and a placeholder load button.
 * Replace this file as backend endpoints are rebuilt.
 */
export const CLIENT_APP_SOURCE = String.raw`
(function () {
  var themeToggle = document.getElementById('theme-toggle');
  var localeToggle = document.getElementById('locale-toggle');
  var localeToggleText = document.getElementById('locale-toggle-text');
  var loadButton = document.getElementById('load-workspace');
  var videoUrl = document.getElementById('video-url');
  var statusLine = document.getElementById('status-line');

  var theme = 'light';
  var locale = 'en';

  function setStatus(message, kind) {
    if (!statusLine) return;
    var prefix = kind === 'error' ? '<strong>Error</strong> '
      : kind === 'success' ? '<strong>Ready</strong> '
      : '<strong>Working</strong> ';
    statusLine.innerHTML = prefix + escapeHtml(message);
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function quickExtractVideoId(input) {
    var trimmed = String(input || '').trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
    try {
      var url = new URL(trimmed);
      var v = url.searchParams.get('v');
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
      if (url.hostname === 'youtu.be') {
        var id = url.pathname.replace(/^\//, '').split('/')[0];
        if (/^[a-zA-Z0-9_-]{11}$/.test(id)) return id;
      }
      var m = url.pathname.match(/\/(?:embed|shorts|live)\/([a-zA-Z0-9_-]{11})/);
      if (m) return m[1];
    } catch (_) {}
    return null;
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      theme = theme === 'light' ? 'dark' : 'light';
      document.body.dataset.theme = theme;
    });
  }

  if (localeToggle) {
    localeToggle.addEventListener('click', function () {
      locale = locale === 'en' ? 'zh' : 'en';
      if (localeToggleText) {
        localeToggleText.textContent = 'EN / 中文';
      }
      document.documentElement.lang = locale === 'zh' ? 'zh-Hans' : 'en';
    });
  }

  if (loadButton) {
    loadButton.addEventListener('click', function () {
      var url = (videoUrl ? videoUrl.value : '').trim();
      if (!url) {
        setStatus('Paste a YouTube URL first', 'error');
        return;
      }
      var videoId = quickExtractVideoId(url);
      if (!videoId) {
        setStatus('Could not extract a valid YouTube video ID', 'error');
        return;
      }
      setStatus('Video ID: ' + videoId + ' — backend not yet implemented', 'loading');
    });
  }

  if (videoUrl) {
    videoUrl.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter' && loadButton) loadButton.click();
    });
  }

  setStatus('Load a video to begin', 'success');
})();
`;
