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
  var transcriptList = document.getElementById('transcript-list');
  var transcriptSubtitle = document.getElementById('transcript-subtitle');
  var transcriptWindow = document.getElementById('transcript-window');
  var autoFollow = document.getElementById('auto-follow');

  var theme = 'light';
  var locale = 'en';
  var currentVideoId = '';
  var currentVideoUrl = '';
  var transcriptEntries = [];
  var transcriptRows = [];
  var activeRowId = '';

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
        renderLiveVideo(videoId, url);

        setStatus('Fetching transcript', 'loading');
        var transcriptPayload = await postJson('/api/transcript', {url: url});
        transcriptEntries = normalizeTranscriptEntries(transcriptPayload.entries || []);
        renderTranscriptRows();
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

  if (transcriptWindow) {
    transcriptWindow.addEventListener('change', function () {
      renderTranscriptRows();
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

  function renderLiveVideo(videoId, videoUrl) {
    if (!youtubePlayer) return;
    currentVideoId = String(videoId || '');
    currentVideoUrl = String(videoUrl || ('https://www.youtube.com/watch?v=' + videoId));
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
    if (!youtubePlayer || !currentVideoId) return;
    var safeVideoId = encodeURIComponent(currentVideoId);
    var start = Math.max(0, Math.floor(Number(seconds || 0)));
    var embedUrl = 'https://www.youtube.com/embed/' + safeVideoId
      + '?autoplay=1&rel=0&modestbranding=1&start=' + start
      + '&origin=' + encodeURIComponent(window.location.origin);
    youtubePlayer.innerHTML = '<iframe'
      + ' src="' + embedUrl + '"'
      + ' title="Live Video"'
      + ' frameborder="0"'
      + ' allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"'
      + ' allowfullscreen'
      + '></iframe>';
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

  // Smart mode: close slice when it reaches >=25 seconds,
  // or once it has >=18 words after at least 5 seconds.
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
})();
`;
