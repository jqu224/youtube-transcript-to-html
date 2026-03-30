export function bootstrapOAuthPopup() {
  var statusEl = document.getElementById('status');
  var debugEl = document.getElementById('debug');
  var authorizeButton = document.getElementById('authorize-and-fetch');
  var closeButton = document.getElementById('close-window');
  var tokenClient = null;
  var accessToken = '';
  var debugState = {
    pickedLanguage: '',
    trackKind: '',
    captionId: '',
    captionsDownloadStatus: '',
    captionsDownloadLength: 0,
    json3Status: '',
    json3Length: 0,
    vttStatus: '',
    vttLength: 0,
    selectedFormat: '',
    entryCount: 0,
    error: '',
  };

  function setStatus(text) {
    statusEl.textContent = String(text || '');
  }

  function setDebug(patch) {
    debugState = Object.assign({}, debugState, patch || {});
    if (!debugEl) return;
    debugEl.textContent = [
      'picked language: ' + String(debugState.pickedLanguage || '-'),
      'trackKind: ' + String(debugState.trackKind || '-'),
      'captionId: ' + String(debugState.captionId || '-'),
      'captions.download status: ' + String(debugState.captionsDownloadStatus || '-'),
      'captions.download length: ' + String(debugState.captionsDownloadLength || 0),
      'json3 status: ' + String(debugState.json3Status || '-'),
      'json3 length: ' + String(debugState.json3Length || 0),
      'vtt status: ' + String(debugState.vttStatus || '-'),
      'vtt length: ' + String(debugState.vttLength || 0),
      'selected format: ' + String(debugState.selectedFormat || '-'),
      'entry count: ' + String(debugState.entryCount || 0),
      'error: ' + String(debugState.error || '-'),
    ].join('\n');
  }

  function readVideoUrl() {
    try {
      var u = new URL(window.location.href);
      return String(u.searchParams.get('videoUrl') || '').trim();
    } catch (_) {
      return '';
    }
  }

  function extractVideoId(input) {
    var trimmed = String(input || '').trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
    try {
      var url = new URL(trimmed);
      var fromQuery = url.searchParams.get('v');
      if (fromQuery && /^[a-zA-Z0-9_-]{11}$/.test(fromQuery)) return fromQuery;
      if (url.hostname === 'youtu.be') {
        var shortId = url.pathname.replace(/^\//, '').split('/')[0];
        if (/^[a-zA-Z0-9_-]{11}$/.test(shortId)) return shortId;
      }
      var match = url.pathname.match(/\/(?:embed|shorts|live)\/([a-zA-Z0-9_-]{11})/);
      if (match) return match[1];
    } catch (_) {}
    return '';
  }

  function parseVttEntries(vtt) {
    var lines = String(vtt || '').split(/\r?\n/);
    var entries = [];
    for (var i = 0; i < lines.length; i += 1) {
      if (!/-->/.test(lines[i])) continue;
      var parts = lines[i].split('-->');
      if (parts.length < 2) continue;
      var start = parseVttTime(parts[0].trim());
      var end = parseVttTime(parts[1].trim().split(/\s+/)[0]);
      if (!Number.isFinite(start) || !Number.isFinite(end)) continue;
      var textLines = [];
      for (var j = i + 1; j < lines.length; j += 1) {
        var line = lines[j];
        if (!line.trim()) {
          i = j;
          break;
        }
        textLines.push(line.trim());
      }
      var text = textLines.join(' ').replace(/\s+/g, ' ').trim();
      if (!text) continue;
      entries.push({
        text: text,
        offset: start,
        duration: Math.max(0.1, end - start),
      });
    }
    return entries;
  }

  function parseJson3Entries(source) {
    var payload;
    try {
      payload = JSON.parse(String(source || ''));
    } catch (_) {
      return [];
    }
    var events = Array.isArray(payload && payload.events) ? payload.events : [];
    var entries = [];
    for (var i = 0; i < events.length; i += 1) {
      var event = events[i] || {};
      var segs = Array.isArray(event.segs) ? event.segs : [];
      var text = segs.map(function(seg) {
        return String(seg && seg.utf8 ? seg.utf8 : '');
      }).join('').replace(/\s+/g, ' ').trim();
      if (!text) continue;
      var offset = Number(event.tStartMs || 0) / 1000;
      var duration = Number(event.dDurationMs || 0) / 1000;
      entries.push({
        text: text,
        offset: Number.isFinite(offset) ? offset : 0,
        duration: Number.isFinite(duration) ? Math.max(0.1, duration) : 0.1,
      });
    }
    return entries;
  }

  function parseVttTime(value) {
    var match = String(value || '').match(/^(?:(\d+):)?(\d+):(\d+)\.(\d+)$/);
    if (!match) return Number.NaN;
    var hours = Number(match[1] || 0);
    var minutes = Number(match[2] || 0);
    var seconds = Number(match[3] || 0);
    var millis = Number(match[4] || 0);
    return (hours * 3600) + (minutes * 60) + seconds + (millis / 1000);
  }

  async function fetchConfig() {
    var response = await fetch('/api/config');
    if (!response.ok) throw new Error('Failed to load OAuth config');
    return response.json().catch(function() { return {}; });
  }

  async function ensureTokenClient() {
    if (tokenClient) return;
    var config = await fetchConfig();
    var clientId = String(config && config.youtubeClientId ? config.youtubeClientId : '').trim();
    if (!clientId) throw new Error('YOUTUBE_CLIENT_ID is not configured on server');
    if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
      throw new Error('Google OAuth client is not available');
    }
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'https://www.googleapis.com/auth/youtube.force-ssl',
      callback: function() {},
    });
  }

  function requestAccessToken() {
    return new Promise(function(resolve, reject) {
      tokenClient.callback = function(resp) {
        if (resp && resp.error) {
          reject(new Error(String(resp.error_description || resp.error || 'OAuth failed')));
          return;
        }
        accessToken = String(resp && resp.access_token ? resp.access_token : '');
        if (!accessToken) {
          reject(new Error('OAuth token missing'));
          return;
        }
        resolve(accessToken);
      };
      tokenClient.requestAccessToken({prompt: 'consent'});
    });
  }

  async function fetchTranscriptThroughYouTubeApi(videoId) {
    setDebug({
      pickedLanguage: '',
      trackKind: '',
      captionId: '',
      captionsDownloadStatus: '',
      captionsDownloadLength: 0,
      json3Status: '',
      json3Length: 0,
      vttStatus: '',
      vttLength: 0,
      selectedFormat: '',
      entryCount: 0,
      error: '',
    });
    var listUrl = new URL('https://youtube.googleapis.com/youtube/v3/captions');
    listUrl.searchParams.set('part', 'snippet');
    listUrl.searchParams.set('videoId', videoId);
    var listResponse = await fetch(listUrl.toString(), {
      headers: {Authorization: 'Bearer ' + accessToken},
    });
    var listPayload = await listResponse.json().catch(function() { return {}; });
    if (!listResponse.ok) {
      throw new Error((listPayload && listPayload.error && listPayload.error.message) || 'captions.list failed');
    }
    var items = Array.isArray(listPayload.items) ? listPayload.items : [];
    if (!items.length) {
      throw new Error('No caption tracks returned by YouTube API');
    }
    var track = pickBestCaptionTrack(items);
    var snippet = track.snippet || {};
    var captionId = String(track.id || '').trim();
    var language = String(snippet.language || '').trim();
    var trackKind = String(snippet.trackKind || '').trim();
    setDebug({
      captionId: captionId || '-',
      pickedLanguage: language,
      trackKind: trackKind || 'standard',
    });
    if (!language) {
      throw new Error('Caption track language missing');
    }
    var isAuto = String(trackKind).toUpperCase() === 'ASR';
    var entries = [];

    if (captionId) {
      var downloadUrl = new URL('https://youtube.googleapis.com/youtube/v3/captions/' + encodeURIComponent(captionId));
      downloadUrl.searchParams.set('tfmt', 'vtt');
      var downloadResponse = await fetch(downloadUrl.toString(), {
        headers: {Authorization: 'Bearer ' + accessToken},
      });
      var downloadText = await downloadResponse.text();
      setDebug({
        captionsDownloadStatus: String(downloadResponse.status),
        captionsDownloadLength: String(downloadText || '').length,
      });
      if (downloadResponse.ok) {
        entries = parseVttEntries(downloadText);
        if (entries.length) {
          setDebug({
            selectedFormat: 'captions.download(vtt)',
            entryCount: entries.length,
          });
        }
      }
    }

    if (entries.length) {
      return {
        entries: entries,
        fullText: entries.map(function(entry) { return entry.text; }).join(' ').trim(),
        cueCount: entries.length,
        source: 'browser_oauth_popup',
        language: language,
      };
    }

    var timedtextJson3Url = new URL('https://www.youtube.com/api/timedtext');
    timedtextJson3Url.searchParams.set('v', videoId);
    timedtextJson3Url.searchParams.set('lang', language);
    timedtextJson3Url.searchParams.set('fmt', 'json3');
    if (isAuto) timedtextJson3Url.searchParams.set('kind', 'asr');
    var json3Response = await fetch(timedtextJson3Url.toString());
    var json3Text = await json3Response.text();
    setDebug({
      json3Status: String(json3Response.status),
      json3Length: String(json3Text || '').length,
    });
    if (json3Response.ok) {
      entries = parseJson3Entries(json3Text);
      if (entries.length) {
        setDebug({
          selectedFormat: 'json3',
          entryCount: entries.length,
        });
      }
    }

    if (!entries.length) {
      var timedtextVttUrl = new URL('https://www.youtube.com/api/timedtext');
      timedtextVttUrl.searchParams.set('v', videoId);
      timedtextVttUrl.searchParams.set('lang', language);
      timedtextVttUrl.searchParams.set('fmt', 'vtt');
      if (isAuto) timedtextVttUrl.searchParams.set('kind', 'asr');
      var vttResponse = await fetch(timedtextVttUrl.toString());
      var vttText = await vttResponse.text();
      setDebug({
        vttStatus: String(vttResponse.status),
        vttLength: String(vttText || '').length,
      });
      if (vttResponse.ok) {
        entries = parseVttEntries(vttText);
        if (entries.length) {
          setDebug({
            selectedFormat: 'vtt',
            entryCount: entries.length,
          });
        }
      }
    }

    if (!entries.length) {
      throw new Error('No transcript entries parsed from timedtext (tried json3/vtt, auto=' + String(isAuto) + ')');
    }
    return {
      entries: entries,
      fullText: entries.map(function(entry) { return entry.text; }).join(' ').trim(),
      cueCount: entries.length,
      source: 'browser_oauth_popup',
      language: language,
    };
  }

  async function run() {
    authorizeButton.disabled = true;
    try {
      setStatus('Initializing OAuth...');
      await ensureTokenClient();
      setStatus('Waiting for authorization...');
      await requestAccessToken();
      var videoUrl = readVideoUrl();
      var videoId = extractVideoId(videoUrl);
      if (!videoId) throw new Error('Invalid video URL');
      setStatus('Fetching transcript via browser OAuth...');
      var payload = await fetchTranscriptThroughYouTubeApi(videoId);
      if (window.opener && window.opener !== window) {
        window.opener.postMessage({
          type: 'youtube-transcript-from-popup',
          payload: payload,
        }, window.location.origin);
      }
      setStatus('Transcript sent to main window. You can close this popup');
    } catch (error) {
      setDebug({
        error: String(error && error.message ? error.message : 'Popup flow failed'),
      });
      setStatus(error && error.message ? error.message : 'Popup flow failed');
    } finally {
      authorizeButton.disabled = false;
    }
  }

  setDebug({});
  authorizeButton.addEventListener('click', run);
  closeButton.addEventListener('click', function() {
    window.close();
  });
}

function pickBestCaptionTrack(items) {
  var list = Array.isArray(items) ? items : [];
  if (!list.length) return {};
  var standard = list.find(function(item) {
    var kind = String(item && item.snippet && item.snippet.trackKind ? item.snippet.trackKind : '').toUpperCase();
    return kind !== 'ASR';
  });
  return standard || list[0] || {};
}
