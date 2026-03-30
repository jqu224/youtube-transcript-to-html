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
  var analysisMain = document.getElementById('analysis-main');
  var analysisEmpty = document.getElementById('analysis-empty');
  var regenerateButton = document.getElementById('regenerate-summary');
  var playerPlaceholder = document.getElementById('player-placeholder');
  var youtubePlayer = document.getElementById('youtube-player');
  var playerTitle = document.getElementById('player-title');
  var videoSubtitle = document.getElementById('video-subtitle');
  var videoMeta = document.getElementById('video-meta');

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
    loadButton.addEventListener('click', async function () {
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

      try {
        loadButton.disabled = true;
        if (regenerateButton) regenerateButton.disabled = true;
        renderLiveVideo(videoId);

        setStatus('Fetching transcript', 'loading');
        var transcriptPayload = await postJson('/api/transcript', {url: url});
        setStatus('Generating AI summary', 'loading');

        var summaryPayload = await postJson('/api/summary', {
          transcript: transcriptPayload.fullText,
        });

        renderSummary(summaryPayload.html);
        var cueCount = Number(transcriptPayload.cueCount || 0);
        setStatus('Loaded ' + cueCount + ' cues and generated summary', 'success');
      } catch (error) {
        setStatus(error && error.message ? error.message : 'Failed to load workspace', 'error');
      } finally {
        loadButton.disabled = false;
      }
    });
  }

  if (videoUrl) {
    videoUrl.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter' && loadButton) loadButton.click();
    });
  }

  setStatus('Load a video to begin', 'success');

  async function postJson(path, payload) {
    var response = await fetch(path, {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify(payload || {}),
    });

    var json = await response.json().catch(function () {
      return {};
    });

    if (!response.ok) {
      throw new Error(json.error || 'Request failed');
    }

    return json;
  }

  function renderSummary(html) {
    if (!analysisMain) return;
    if (analysisEmpty) analysisEmpty.remove();
    analysisMain.innerHTML = String(html || '');
  }

  function renderLiveVideo(videoId) {
    if (!youtubePlayer) return;
    var safeVideoId = encodeURIComponent(String(videoId || ''));
    var embedUrl = 'https://www.youtube.com/embed/' + safeVideoId
      + '?autoplay=0&rel=0&modestbranding=1&origin=' + encodeURIComponent(window.location.origin);
    youtubePlayer.innerHTML = '<iframe'
      + ' src="' + embedUrl + '"'
      + ' title="Live Video"'
      + ' frameborder="0"'
      + ' allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"'
      + ' allowfullscreen'
      + '></iframe>';
    youtubePlayer.hidden = false;
    if (playerPlaceholder) playerPlaceholder.hidden = true;
    if (playerTitle) playerTitle.textContent = 'Live Video';
    if (videoSubtitle) videoSubtitle.textContent = 'YouTube ID: ' + videoId;
    if (videoMeta) {
      videoMeta.innerHTML = '<div class="video-meta-bar">'
        + '<span class="video-meta-channel">Now playing ' + escapeHtml(videoId) + '</span>'
        + '<a class="inline-link" href="https://www.youtube.com/watch?v=' + safeVideoId + '" target="_blank" rel="noopener noreferrer">Open on YouTube</a>'
        + '</div>';
    }
  }
})();
`;
