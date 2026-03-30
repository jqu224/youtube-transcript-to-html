/**
 * Standalone script for /simplified-version — one NDJSON stream (workspace head + cue chunks).
 */
export const SIMPLIFIED_VERSION_CLIENT_SOURCE = String.raw`
(function() {
  var loadBtn = document.getElementById('simplified-version-load');
  var urlInput = document.getElementById('simplified-version-url');
  var statusEl = document.getElementById('simplified-version-status');
  var videoPanel = document.getElementById('simplified-version-video-panel');
  var videoTitle = document.getElementById('simplified-version-video-title');
  var videoMeta = document.getElementById('simplified-version-video-meta');
  var transcriptEl = document.getElementById('simplified-version-transcript');
  var abortCtl = null;

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatTimestamp(startMs) {
    var totalSeconds = Math.max(0, Math.floor(Number(startMs || 0) / 1000));
    var minutes = Math.floor(totalSeconds / 60);
    var seconds = totalSeconds % 60;
    return String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
  }

  function setStatus(text, kind) {
    statusEl.textContent = text || '';
    statusEl.dataset.kind = kind || '';
  }

  function renderCueRows(entries) {
    return entries.map(function(entry) {
      return (
        '<div class="simplified-version-cue">' +
          '<time>' + escapeHtml(formatTimestamp(entry.startMs)) + '</time>' +
          '<p>' + escapeHtml(entry.text) + '</p>' +
        '</div>'
      );
    }).join('');
  }

  function abortInFlight() {
    if (abortCtl) {
      abortCtl.abort();
      abortCtl = null;
    }
  }

  async function loadTranscript() {
    var url = (urlInput.value || '').trim();
    if (!url) {
      setStatus('Paste a YouTube URL first', 'error');
      return;
    }

    abortInFlight();
    abortCtl = new AbortController();
    var signal = abortCtl.signal;

    loadBtn.disabled = true;
    transcriptEl.innerHTML = '';
    videoPanel.hidden = true;
    setStatus('Loading video and captions', 'loading');

    try {
      var res = await fetch('/api/workspace?stream=1', {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({url: url}),
        signal: signal,
      });

      if (!res.ok) {
        var errPayload = await res.json().catch(function() {
          return {};
        });
        throw new Error(errPayload.error || 'Load failed');
      }

      var reader = res.body.getReader();
      var decoder = new TextDecoder();
      var buffer = '';
      var expectedTotal = 0;
      var loaded = 0;

      function processLine(line) {
        var msg = JSON.parse(line);
        if (msg.type === 'head' && msg.workspace) {
          var video = msg.workspace.video;
          videoTitle.textContent = video.title || 'Video';
          videoMeta.textContent = (video.channelTitle || '') + (video.watchUrl ? ' · ' + video.watchUrl : '');
          videoPanel.hidden = false;
          var tr = msg.workspace.transcript || {};
          expectedTotal = typeof tr.expectedTotal === 'number' ? tr.expectedTotal : 0;
          setStatus('Loading captions', 'loading');
          return;
        }
        if (msg.type === 'chunk' && Array.isArray(msg.entries)) {
          loaded += msg.entries.length;
          transcriptEl.insertAdjacentHTML('beforeend', renderCueRows(msg.entries));
          if (expectedTotal > 0) {
            setStatus('Loading captions ' + loaded + ' / ' + expectedTotal, 'loading');
          }
          return;
        }
        if (msg.type === 'done') {
          return;
        }
      }

      var NL = String.fromCharCode(10);
      while (true) {
        var next = await reader.read();
        buffer += decoder.decode(next.value || new Uint8Array(0), {stream: !next.done});
        var idx;
        while ((idx = buffer.indexOf(NL)) !== -1) {
          var line = buffer.slice(0, idx).trim();
          buffer = buffer.slice(idx + 1);
          if (line) {
            processLine(line);
          }
        }
        if (next.done) {
          break;
        }
      }

      var tail = buffer.trim();
      if (tail) {
        processLine(tail);
      }

      setStatus('Ready · ' + loaded + ' cues', 'success');
    } catch (err) {
      if (err.name === 'AbortError') {
        setStatus('', '');
        return;
      }
      setStatus(err.message || 'Load failed', 'error');
      transcriptEl.innerHTML = '<div class="simplified-version-error">' + escapeHtml(err.message || 'Load failed') + '</div>';
    } finally {
      loadBtn.disabled = false;
      abortCtl = null;
    }
  }

  loadBtn.addEventListener('click', loadTranscript);
  urlInput.addEventListener('keydown', function(ev) {
    if (ev.key === 'Enter') {
      loadTranscript();
    }
  });
})();
`;
