export function renderOAuthPopupPage() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>YouTube Transcript Authorization</title>
    <style>
      :root {
        color-scheme: light dark;
      }
      body {
        margin: 0;
        padding: 20px;
        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      }
      .card {
        max-width: 640px;
        margin: 0 auto;
        border: 1px solid rgba(128, 128, 128, 0.4);
        border-radius: 12px;
        padding: 16px;
      }
      .actions {
        display: flex;
        gap: 8px;
        margin-top: 12px;
      }
      button {
        border: 1px solid rgba(128, 128, 128, 0.5);
        border-radius: 8px;
        background: transparent;
        padding: 8px 12px;
        cursor: pointer;
      }
      pre {
        margin-top: 12px;
        white-space: pre-wrap;
      }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>YouTube transcript authorization</h1>
      <p id="subtitle">Authorize and fetch transcript in browser</p>
      <div class="actions">
        <button id="authorize-and-fetch" type="button">Authorize and Fetch</button>
        <button id="close-window" type="button">Close</button>
      </div>
      <pre id="status"></pre>
    </div>

    <script src="https://accounts.google.com/gsi/client" async defer></script>
    <script>
      (function() {
        var statusEl = document.getElementById('status');
        var authorizeButton = document.getElementById('authorize-and-fetch');
        var closeButton = document.getElementById('close-window');
        var tokenClient = null;
        var accessToken = '';

        function setStatus(text) {
          statusEl.textContent = String(text || '');
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
              var shortId = url.pathname.replace(/^\\//, '').split('/')[0];
              if (/^[a-zA-Z0-9_-]{11}$/.test(shortId)) return shortId;
            }
            var match = url.pathname.match(/\\/(?:embed|shorts|live)\\/([a-zA-Z0-9_-]{11})/);
            if (match) return match[1];
          } catch (_) {}
          return '';
        }

        function parseVttEntries(vtt) {
          var lines = String(vtt || '').split(/\\r?\\n/);
          var entries = [];
          for (var i = 0; i < lines.length; i += 1) {
            if (!/-->/.test(lines[i])) continue;
            var parts = lines[i].split('-->');
            if (parts.length < 2) continue;
            var start = parseVttTime(parts[0].trim());
            var end = parseVttTime(parts[1].trim().split(/\\s+/)[0]);
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
            var text = textLines.join(' ').replace(/\\s+/g, ' ').trim();
            if (!text) continue;
            entries.push({
              text: text,
              offset: start,
              duration: Math.max(0.1, end - start),
            });
          }
          return entries;
        }

        function parseVttTime(value) {
          var match = String(value || '').match(/^(?:(\\d+):)?(\\d+):(\\d+)\\.(\\d+)$/);
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
          var language = String(items[0] && items[0].snippet && items[0].snippet.language || '').trim();
          if (!language) {
            throw new Error('Caption track language missing');
          }
          var timedtextUrl = new URL('https://www.youtube.com/api/timedtext');
          timedtextUrl.searchParams.set('v', videoId);
          timedtextUrl.searchParams.set('lang', language);
          timedtextUrl.searchParams.set('fmt', 'vtt');
          var transcriptResponse = await fetch(timedtextUrl.toString());
          if (!transcriptResponse.ok) {
            throw new Error('timedtext request failed');
          }
          var transcriptVtt = await transcriptResponse.text();
          var entries = parseVttEntries(transcriptVtt);
          if (!entries.length) {
            throw new Error('No transcript entries parsed from timedtext');
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
            setStatus(error && error.message ? error.message : 'Popup flow failed');
          } finally {
            authorizeButton.disabled = false;
          }
        }

        authorizeButton.addEventListener('click', run);
        closeButton.addEventListener('click', function() {
          window.close();
        });
      })();
    </script>
  </body>
</html>`;
}
