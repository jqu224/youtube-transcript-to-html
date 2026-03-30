export function bootstrapAppClient() {
  var themeToggle = document.getElementById('theme-toggle');
  var localeToggle = document.getElementById('locale-toggle');
  var localeToggleText = document.getElementById('locale-toggle-text');
  var authorizeYouTubeButton = document.getElementById('authorize-youtube');
  var loadButton = document.getElementById('load-workspace');
  var videoUrl = document.getElementById('video-url');
  var statusLine = document.getElementById('status-line');
  var analysisMain = document.getElementById('analysis-main');
  var analysisEmpty = document.getElementById('analysis-empty');
  var playerPlaceholder = document.getElementById('player-placeholder');
  var youtubePlayer = document.getElementById('youtube-player');
  var playerTitle = document.getElementById('player-title');
  var videoSubtitle = document.getElementById('video-subtitle');
  var videoMeta = document.getElementById('video-meta');
  var controlSection = document.getElementById('control-section');
  var controlCollapseToggle = document.getElementById('control-collapse-toggle');
  var transcriptList = document.getElementById('transcript-list');
  var transcriptSubtitle = document.getElementById('transcript-subtitle');
  var transcriptWindow = document.getElementById('transcript-window');
  var autoFollow = document.getElementById('auto-follow');
  var tabButtons = Array.prototype.slice.call(document.querySelectorAll('[data-tab-button]'));

  var theme = 'light';
  var locale = 'en';
  var currentVideoId = '';
  var currentVideoUrl = '';
  var transcriptEntries = [];
  var transcriptRows = [];
  var activeRowId = '';
  var hasLoadedWorkspace = false;
  var ytPlayer = null;
  var ytApiReadyPromise = null;
  var autoFollowTimerId = 0;
  var activeWorkspaceTab = 'smartnote';
  var summaryHtml = '';
  var smartnoteHtml = '';
  var pendingCaptchaOpenUrl = '';
  var youtubeOAuthToken = '';
  var youtubeOAuthTokenExpiresAt = 0;
  var youtubeTokenClient = null;

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

  if (authorizeYouTubeButton) {
    authorizeYouTubeButton.addEventListener('click', function () {
      requestYouTubeOAuthToken(true).then(function () {
        setStatus('YouTube authorization ready', 'success');
      }).catch(function (error) {
        setStatus(error && error.message ? error.message : 'YouTube authorization failed', 'error');
      });
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
        hasLoadedWorkspace = true;
        setControlSectionCollapsed(true);
        renderLiveVideo(videoId, url);

        setStatus('Fetching transcript', 'loading');
        var transcriptRequest = {url: url};
        if (hasValidYouTubeOAuthToken()) {
          transcriptRequest.oauthAccessToken = youtubeOAuthToken;
        }
        var transcriptPayload = await postJson('/api/transcript', transcriptRequest);
        transcriptEntries = normalizeTranscriptEntries(transcriptPayload.entries || []);
        renderTranscriptRows();
        startAutoFollowLoop();
        var cueCount = Number(transcriptPayload.cueCount || transcriptEntries.length || 0);
        var sourceLabel = describeTranscriptSource(transcriptPayload && transcriptPayload.source);
        setStatus('Loaded ' + cueCount + ' cues via ' + sourceLabel, 'success');
        var generated = await Promise.all([
          postJson('/api/smartnote', {transcript: transcriptPayload.fullText}),
          postJson('/api/summary', {transcript: transcriptPayload.fullText}),
        ]);
        smartnoteHtml = generated[0] && generated[0].html ? generated[0].html : '';
        summaryHtml = generated[1] && generated[1].html ? generated[1].html : '';
        renderActiveWorkspaceTab();
        setStatus('Loaded ' + cueCount + ' cues and generated notes', 'success');
      } catch (error) {
        if (error && error.code === 'youtube_captcha_required') {
          renderCaptchaRecoveryNotice(error);
          setStatus('YouTube verification required before retry', 'error');
          return;
        }
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

  if (transcriptWindow) {
    transcriptWindow.addEventListener('change', function () {
      renderTranscriptRows();
      syncTranscriptToPlayback();
    });
  }

  if (autoFollow) {
    autoFollow.addEventListener('change', function () {
      syncTranscriptToPlayback();
    });
  }

  if (transcriptList) {
    transcriptList.addEventListener('click', function (ev) {
      var target = ev.target && ev.target.closest ? ev.target.closest('[data-row-id]') : null;
      if (!target) return;
      var rowId = target.getAttribute('data-row-id') || '';
      var startSec = Number(target.getAttribute('data-start-sec') || 0);
      activeRowId = rowId;
      refreshActiveTranscriptRow();
      seekVideoTo(startSec);
      if (autoFollow && autoFollow.value === 'on') {
        target.scrollIntoView({block: 'center', behavior: 'smooth'});
      }
    });
  }

  if (controlCollapseToggle) {
    controlCollapseToggle.addEventListener('click', function () {
      var isCollapsed = controlSection && controlSection.classList.contains('is-collapsed');
      setControlSectionCollapsed(!isCollapsed);
    });
  }

  if (tabButtons.length) {
    tabButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        var tabId = String(button.getAttribute('data-tab-button') || '');
        setActiveWorkspaceTab(tabId);
      });
    });
  }

  if (analysisMain) {
    analysisMain.addEventListener('click', function (ev) {
      var trigger = ev.target && ev.target.closest ? ev.target.closest('[data-recovery-action]') : null;
      if (!trigger) return;
      var action = String(trigger.getAttribute('data-recovery-action') || '');
      if (action === 'open-youtube-check') {
        var popupUrl = '/popup/youtube-transcript-auth?videoUrl=' + encodeURIComponent(String(currentVideoUrl || ''));
        var opened = window.open(String(popupUrl), '_blank', 'noopener,noreferrer');
        if (!opened) {
          window.location.href = String(popupUrl);
        }
        setStatus('Authorize in popup and return transcript to workspace', 'loading');
        return;
      }
      if (action === 'retry-load-workspace') {
        if (loadButton && !loadButton.disabled) {
          loadButton.click();
        }
      }
    });
  }

  window.addEventListener('message', function (event) {
    if (!event || event.origin !== window.location.origin) return;
    var data = event.data || {};
    if (data.type !== 'youtube-transcript-from-popup') return;
    var payload = data.payload || {};
    transcriptEntries = normalizeTranscriptEntries(payload.entries || []);
    if (!transcriptEntries.length) {
      setStatus('Popup returned empty transcript', 'error');
      return;
    }
    renderTranscriptRows();
    startAutoFollowLoop();
    var cueCount = Number(payload.cueCount || transcriptEntries.length || 0);
    setStatus('Loaded ' + cueCount + ' cues via browser OAuth popup', 'success');
  });

  setStatus('Load a video to begin', 'success');
  setupYouTubeOAuth();
  renderActiveWorkspaceTab();

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
      var error = new Error(json.error || 'Request failed');
      error.status = response.status;
      if (json && typeof json.code === 'string') error.code = json.code;
      if (json && json.data && typeof json.data === 'object') error.data = json.data;
      throw error;
    }

    return json;
  }

  async function setupYouTubeOAuth() {
    if (!authorizeYouTubeButton) return;
    authorizeYouTubeButton.hidden = true;
    var config = await fetchJson('/api/config').catch(function () {
      return {};
    });
    var clientId = String(config && config.youtubeClientId ? config.youtubeClientId : '').trim();
    if (!clientId) return;
    if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) return;
    youtubeTokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'https://www.googleapis.com/auth/youtube.force-ssl',
      callback: function () {},
    });
    authorizeYouTubeButton.hidden = false;
  }

  async function fetchJson(path) {
    var response = await fetch(path, {
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error('Request failed');
    }
    return response.json().catch(function () {
      return {};
    });
  }

  function hasValidYouTubeOAuthToken() {
    return Boolean(youtubeOAuthToken) && Date.now() < youtubeOAuthTokenExpiresAt;
  }

  function requestYouTubeOAuthToken(interactive) {
    return new Promise(function (resolve, reject) {
      if (!youtubeTokenClient) {
        reject(new Error('YouTube OAuth is not configured'));
        return;
      }
      youtubeTokenClient.callback = function (tokenResponse) {
        if (tokenResponse && tokenResponse.error) {
          reject(new Error(String(tokenResponse.error_description || tokenResponse.error || 'YouTube OAuth failed')));
          return;
        }
        youtubeOAuthToken = String(tokenResponse && tokenResponse.access_token ? tokenResponse.access_token : '');
        var expiresIn = Number(tokenResponse && tokenResponse.expires_in ? tokenResponse.expires_in : 0);
        youtubeOAuthTokenExpiresAt = Date.now() + (Number.isFinite(expiresIn) ? expiresIn * 1000 : 0) - 15000;
        resolve(tokenResponse);
      };
      youtubeTokenClient.requestAccessToken({
        prompt: interactive ? 'consent' : '',
      });
    });
  }

  function setActiveWorkspaceTab(tabId) {
    if (!tabId) return;
    activeWorkspaceTab = tabId;
    tabButtons.forEach(function (button) {
      var id = String(button.getAttribute('data-tab-button') || '');
      button.classList.toggle('is-active', id === activeWorkspaceTab);
    });
    renderActiveWorkspaceTab();
  }

  function describeTranscriptSource(source) {
    var key = String(source || '').trim();
    if (key === 'youtube_oauth_timedtext') return 'YouTube OAuth';
    if (key === 'youtube_data_api_key_timedtext') return 'YouTube API key';
    if (key === 'local_yt_dlp_fallback') return 'local yt-dlp fallback';
    if (key === 'youtube_transcript_library') return 'youtube-transcript library';
    return 'default transcript path';
  }

  function renderCaptchaRecoveryNotice(error) {
    if (!analysisMain) return;
    if (analysisEmpty) analysisEmpty.remove();
    var recovery = error && error.data && error.data.recovery ? error.data.recovery : {};
    pendingCaptchaOpenUrl = String(recovery.openUrl || 'https://www.youtube.com/');
    var fallback = error && error.data && error.data.fallback ? error.data.fallback : {};
    var fallbackNote = '';
    if (fallback && fallback.error) {
      fallbackNote = '<p>' + escapeHtml('Local fallback status: ' + String(fallback.error)) + '</p>';
    }
    analysisMain.innerHTML = ''
      + '<div class="notice-card">'
      + '<h3>YouTube verification needed</h3>'
      + '<p>YouTube asked for a captcha or anti-bot check for this IP.</p>'
      + '<p>Use browser OAuth popup to fetch transcript on local network and return here.</p>'
      + '<p><a class="inline-link" href="/popup/youtube-transcript-auth?videoUrl=' + encodeURIComponent(String(currentVideoUrl || '')) + '" target="_blank" rel="noopener noreferrer">Open Browser OAuth Popup</a></p>'
      + fallbackNote
      + '<div class="action-stack">'
      + '<button type="button" class="primary-button" data-recovery-action="open-youtube-check" data-open-url="' + escapeHtml(pendingCaptchaOpenUrl) + '">Open Browser OAuth Popup</button>'
      + '<button type="button" class="primary-button" data-recovery-action="retry-load-workspace">Retry Load Workspace</button>'
      + '</div>'
      + '</div>';
  }

  function renderActiveWorkspaceTab() {
    if (!analysisMain) return;
    if (analysisEmpty) analysisEmpty.remove();
    if (activeWorkspaceTab === 'smartnote') {
      if (!smartnoteHtml) {
        analysisMain.innerHTML = '<div class="notice-card">Smartnote will appear after the workspace loads.</div>';
        return;
      }
      analysisMain.innerHTML = '<div class="summary-frame smartnote-frame">' + String(smartnoteHtml) + '</div>';
      return;
    }
    if (activeWorkspaceTab === 'summary') {
      if (!summaryHtml) {
        analysisMain.innerHTML = '<div class="notice-card">AI Summary will appear after the workspace loads.</div>';
        return;
      }
      analysisMain.innerHTML = '<div class="summary-frame">' + String(summaryHtml) + '</div>';
      return;
    }
    analysisMain.innerHTML = '<div class="notice-card">This tab is not part of the current minimal refactor yet.</div>';
  }

  function renderLiveVideo(videoId, videoUrl) {
    if (!youtubePlayer) return;
    currentVideoId = String(videoId || '');
    currentVideoUrl = String(videoUrl || ('https://www.youtube.com/watch?v=' + videoId));
    mountYouTubePlayer(videoId);
    youtubePlayer.hidden = false;
    if (playerPlaceholder) playerPlaceholder.hidden = true;
    if (playerTitle) playerTitle.textContent = 'Live Video';
    if (videoSubtitle) videoSubtitle.textContent = 'YouTube ID: ' + videoId;
    if (videoMeta) {
      var safeVideoId = encodeURIComponent(String(videoId || ''));
      videoMeta.innerHTML = '<div class="video-meta-bar">'
        + '<span class="video-meta-channel">Now playing<br>' + escapeHtml(videoId) + '</span>'
        + '<a class="inline-link" href="https://www.youtube.com/watch?v=' + safeVideoId + '" target="_blank" rel="noopener noreferrer">Open on YouTube</a>'
        + '</div>';
      resolveVideoTitle(currentVideoUrl, videoId).then(function (title) {
        var channel = videoMeta.querySelector('.video-meta-channel');
        if (!channel) return;
        channel.innerHTML = 'Now playing<br>' + escapeHtml(title);
      });
    }
  }

  function seekVideoTo(seconds) {
    if (!currentVideoId) return;
    var start = Math.max(0, Math.floor(Number(seconds || 0)));
    if (ytPlayer && typeof ytPlayer.seekTo === 'function') {
      try {
        ytPlayer.seekTo(start, true);
        if (typeof ytPlayer.playVideo === 'function') {
          ytPlayer.playVideo();
        }
        return;
      } catch (_) {}
    }
    mountIframeFallback(currentVideoId, start, 1);
  }

  function normalizeTranscriptEntries(entries) {
    var normalized = [];
    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i] || {};
      var text = String(entry.text || '').trim();
      if (!text) continue;
      var startSec = toSeconds(entry.offset);
      var durationSec = Math.max(0.1, toSeconds(entry.duration));
      normalized.push({
        id: 'cue-' + i,
        startSec: startSec,
        endSec: startSec + durationSec,
        text: text,
      });
    }
    normalized.sort(function (a, b) { return a.startSec - b.startSec; });
    return normalized;
  }

  function toSeconds(value) {
    var n = Number(value);
    if (!Number.isFinite(n) || n < 0) return 0;
    return n > 1000 ? n / 1000 : n;
  }

  function renderTranscriptRows() {
    if (!transcriptList) return;
    if (!transcriptEntries.length) {
      transcriptRows = [];
      transcriptList.innerHTML = '<div class="empty-state">Transcript cues will become clickable once the workspace is loaded.</div>';
      if (transcriptSubtitle) transcriptSubtitle.textContent = 'Transcript cues will appear here.';
      return;
    }

    var mode = transcriptWindow && transcriptWindow.value ? transcriptWindow.value : 'smart';
    if (mode === 'blocks') {
      transcriptRows = buildBlockRows(transcriptEntries, 15);
    } else if (mode === 'all') {
      transcriptRows = buildAllCueRows(transcriptEntries);
    } else {
      transcriptRows = buildSmartRows(transcriptEntries);
    }
    if (!transcriptRows.length) {
      transcriptList.innerHTML = '<div class="empty-state">Transcript is empty.</div>';
      return;
    }
    if (!activeRowId) activeRowId = transcriptRows[0].id;
    var html = '';
    for (var i = 0; i < transcriptRows.length; i++) {
      var row = transcriptRows[i];
      var activeClass = row.id === activeRowId ? ' is-active' : '';
      html += '<button type="button" class="transcript-item' + activeClass + '" data-row-id="' + row.id + '" data-start-sec="' + row.startSec + '">';
      html += '<time>' + formatTime(row.startSec) + '</time>';
      html += '<p>' + escapeHtml(row.text) + '</p>';
      html += '</button>';
    }
    transcriptList.innerHTML = html;
    if (transcriptSubtitle) {
      transcriptSubtitle.textContent = transcriptRows.length + ' slices from ' + transcriptEntries.length + ' cues.';
    }
  }

  function refreshActiveTranscriptRow() {
    if (!transcriptList) return;
    var nodes = transcriptList.querySelectorAll('.transcript-item');
    for (var i = 0; i < nodes.length; i++) {
      var isActive = nodes[i].getAttribute('data-row-id') === activeRowId;
      nodes[i].classList.toggle('is-active', isActive);
    }
  }

  function buildAllCueRows(entries) {
    var rows = [];
    for (var i = 0; i < entries.length; i++) {
      rows.push({
        id: entries[i].id,
        startSec: entries[i].startSec,
        text: entries[i].text,
      });
    }
    return rows;
  }

  function buildBlockRows(entries, blockSizeSec) {
    var byBlock = new Map();
    for (var i = 0; i < entries.length; i++) {
      var cue = entries[i];
      var blockIndex = Math.floor(cue.startSec / blockSizeSec);
      var key = String(blockIndex);
      var existing = byBlock.get(key);
      if (!existing) {
        byBlock.set(key, {
          id: 'block-' + blockIndex,
          startSec: blockIndex * blockSizeSec,
          text: cue.text,
        });
      } else {
        existing.text += ' ' + cue.text;
      }
    }
    return Array.from(byBlock.values());
  }

  function buildSmartRows(entries) {
    var rows = [];
    var current = null;
    for (var i = 0; i < entries.length; i++) {
      var cue = entries[i];
      if (!current) {
        current = {
          id: 'smart-' + rows.length,
          startSec: cue.startSec,
          endSec: cue.endSec,
          text: cue.text,
          words: countWords(cue.text),
        };
      } else {
        current.endSec = Math.max(current.endSec, cue.endSec);
        current.text += ' ' + cue.text;
        current.words += countWords(cue.text);
      }
      var elapsed = current.endSec - current.startSec;
      var shouldClose = elapsed >= 25 || (elapsed >= 5 && current.words >= 18);
      if (shouldClose) {
        rows.push({
          id: current.id,
          startSec: current.startSec,
          text: current.text.trim(),
        });
        current = null;
      }
    }
    if (current) {
      rows.push({
        id: current.id,
        startSec: current.startSec,
        text: current.text.trim(),
      });
    }
    return rows;
  }

  function countWords(text) {
    var cleaned = String(text || '').trim();
    if (!cleaned) return 0;
    return cleaned.split(/\s+/).filter(Boolean).length;
  }

  function formatTime(totalSeconds) {
    var sec = Math.max(0, Math.floor(Number(totalSeconds || 0)));
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return m + ':' + String(s).padStart(2, '0');
  }

  function startAutoFollowLoop() {
    if (autoFollowTimerId) return;
    autoFollowTimerId = window.setInterval(syncTranscriptToPlayback, 200);
  }

  function syncTranscriptToPlayback() {
    if (!autoFollow || autoFollow.value !== 'on') return;
    if (!transcriptRows.length) return;
    if (!ytPlayer || typeof ytPlayer.getCurrentTime !== 'function') return;
    var currentTime = Number(ytPlayer.getCurrentTime());
    if (!Number.isFinite(currentTime)) return;
    var lookaheadTime = currentTime + 0.5;
    var row = findRowForTime(lookaheadTime);
    if (!row || row.id === activeRowId) return;
    activeRowId = row.id;
    refreshActiveTranscriptRow();
    if (!transcriptList) return;
    var target = transcriptList.querySelector('[data-row-id="' + row.id + '"]');
    if (target) {
      target.scrollIntoView({block: 'center', behavior: 'auto'});
    }
  }

  function findRowForTime(timeSec) {
    var chosen = transcriptRows[0];
    for (var i = 0; i < transcriptRows.length; i++) {
      if (transcriptRows[i].startSec <= timeSec) {
        chosen = transcriptRows[i];
      } else {
        break;
      }
    }
    return chosen;
  }

  function mountYouTubePlayer(videoId) {
    waitForYouTubeApi().then(function () {
      if (!youtubePlayer || !window.YT || typeof window.YT.Player !== 'function') {
        mountIframeFallback(videoId, 0, 0);
        return;
      }
      if (ytPlayer && typeof ytPlayer.loadVideoById === 'function') {
        ytPlayer.loadVideoById({
          videoId: videoId,
          startSeconds: 0,
        });
        return;
      }
      ytPlayer = new window.YT.Player('youtube-player', {
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          rel: 0,
          modestbranding: 1,
          origin: window.location.origin,
        },
      });
    }).catch(function () {
      mountIframeFallback(videoId, 0, 0);
    });
  }

  function waitForYouTubeApi() {
    if (window.YT && typeof window.YT.Player === 'function') {
      return Promise.resolve();
    }
    if (ytApiReadyPromise) {
      return ytApiReadyPromise;
    }
    ytApiReadyPromise = new Promise(function (resolve, reject) {
      var started = Date.now();
      var timer = window.setInterval(function () {
        if (window.YT && typeof window.YT.Player === 'function') {
          window.clearInterval(timer);
          resolve();
          return;
        }
        if (Date.now() - started > 10000) {
          window.clearInterval(timer);
          reject(new Error('YouTube API load timeout'));
        }
      }, 80);
    });
    return ytApiReadyPromise;
  }

  function mountIframeFallback(videoId, startSec, autoplay) {
    if (!youtubePlayer) return;
    var safeVideoId = encodeURIComponent(String(videoId || ''));
    var start = Math.max(0, Math.floor(Number(startSec || 0)));
    var embedUrl = 'https://www.youtube.com/embed/' + safeVideoId
      + '?autoplay=' + (autoplay ? '1' : '0')
      + '&rel=0&modestbranding=1&start=' + start
      + '&origin=' + encodeURIComponent(window.location.origin);
    youtubePlayer.innerHTML = '<iframe'
      + ' src="' + embedUrl + '"'
      + ' title="Live Video"'
      + ' frameborder="0"'
      + ' allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"'
      + ' allowfullscreen'
      + '></iframe>';
  }

  function setControlSectionCollapsed(collapsed) {
    if (!controlSection || !controlCollapseToggle) return;
    controlSection.classList.toggle('is-collapsed', collapsed);
    controlCollapseToggle.hidden = !hasLoadedWorkspace && !collapsed;
    controlCollapseToggle.textContent = collapsed ? '▼' : '▲';
    controlCollapseToggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
  }

  async function resolveVideoTitle(videoUrl, fallbackTitle) {
    try {
      var endpoint = 'https://www.youtube.com/oembed?url=' + encodeURIComponent(videoUrl) + '&format=json';
      var response = await fetch(endpoint);
      if (!response.ok) return fallbackTitle;
      var payload = await response.json();
      if (payload && typeof payload.title === 'string' && payload.title.trim()) {
        return payload.title.trim();
      }
      return fallbackTitle;
    } catch (_) {
      return fallbackTitle;
    }
  }
}
