import http from 'node:http';
import {spawn} from 'node:child_process';

const PORT = Number(process.env.LOCAL_TRANSCRIPT_FALLBACK_PORT || 8799);
const HOST = process.env.LOCAL_TRANSCRIPT_FALLBACK_HOST || '127.0.0.1';
const LANG_PRIORITY = String(process.env.TRANSCRIPT_LANG_PRIORITY || 'en,zh-Hans,zh,en-US')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url || '/', `http://${HOST}:${PORT}`);
    if (request.method === 'GET' && url.pathname === '/health') {
      return sendJson(response, {ok: true});
    }

    if (request.method === 'POST' && url.pathname === '/transcript') {
      const payload = await readJsonBody(request);
      const videoId = String(payload.videoId || '').trim();
      const inputUrl = String(payload.url || '').trim();
      const watchUrl = inputUrl || (videoId ? `https://www.youtube.com/watch?v=${videoId}` : '');
      if (!watchUrl) {
        return sendJson(response, {error: 'Missing videoId or url'}, 400);
      }

      const dump = await loadVideoJsonFromYtDlp(watchUrl);
      const track = selectCaptionTrack(dump);
      if (!track || !track.url) {
        return sendJson(response, {error: 'No caption track found via yt-dlp'}, 404);
      }

      const captionsResponse = await fetch(track.url);
      if (!captionsResponse.ok) {
        return sendJson(response, {error: `Caption download failed (${captionsResponse.status})`}, 502);
      }
      const captionText = await captionsResponse.text();
      const entries = track.ext === 'json3' || /fmt=json3/.test(track.url)
        ? parseJson3Entries(captionText)
        : parseVttEntries(captionText);

      if (!entries.length) {
        return sendJson(response, {error: 'Caption payload parsed but no entries were found'}, 502);
      }

      const fullText = entries.map((entry) => entry.text).join(' ').trim();
      return sendJson(response, {
        videoId: videoId || String(dump.id || ''),
        entries,
        fullText,
        cueCount: entries.length,
        source: 'local_yt_dlp_fallback',
        language: track.language || '',
      });
    }

    return sendJson(response, {error: 'Not found'}, 404);
  } catch (error) {
    return sendJson(response, {error: error && error.message ? error.message : 'Unexpected server error'}, 500);
  }
});

server.listen(PORT, HOST, () => {
  process.stdout.write(`Local transcript fallback listening on http://${HOST}:${PORT}\n`);
});

function sendJson(response, payload, status = 200) {
  response.statusCode = status;
  response.setHeader('content-type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(payload));
}

async function readJsonBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch (_) {
    return {};
  }
}

async function loadVideoJsonFromYtDlp(watchUrl) {
  const args = ['--dump-single-json', '--skip-download', '--no-warnings', watchUrl];
  const cookiesFromBrowser = String(process.env.YTDLP_COOKIES_FROM_BROWSER || '').trim();
  if (cookiesFromBrowser) {
    args.unshift(cookiesFromBrowser);
    args.unshift('--cookies-from-browser');
  }
  const {stdout, stderr, code} = await runCommand('yt-dlp', args);
  if (code !== 0) {
    throw new Error(`yt-dlp failed: ${stderr || stdout || 'unknown error'}`);
  }
  try {
    return JSON.parse(stdout);
  } catch (error) {
    throw new Error(`yt-dlp returned non-JSON output: ${error && error.message ? error.message : 'parse error'}`);
  }
}

function selectCaptionTrack(dump) {
  const subtitles = dump && dump.subtitles && typeof dump.subtitles === 'object' ? dump.subtitles : {};
  const autoCaptions = dump && dump.automatic_captions && typeof dump.automatic_captions === 'object'
    ? dump.automatic_captions
    : {};

  return findTrackByLanguage(subtitles)
    || findTrackByLanguage(autoCaptions)
    || findFirstTrack(subtitles)
    || findFirstTrack(autoCaptions);
}

function findTrackByLanguage(pool) {
  for (const preferred of LANG_PRIORITY) {
    if (Array.isArray(pool[preferred])) {
      const selected = selectBestTrackFromFormats(pool[preferred]);
      if (selected) return {...selected, language: preferred};
    }
    const matchedKey = Object.keys(pool).find((lang) => lang === preferred || lang.startsWith(`${preferred}-`));
    if (matchedKey && Array.isArray(pool[matchedKey])) {
      const selected = selectBestTrackFromFormats(pool[matchedKey]);
      if (selected) return {...selected, language: matchedKey};
    }
  }
  return null;
}

function findFirstTrack(pool) {
  for (const language of Object.keys(pool || {})) {
    const formats = pool[language];
    if (!Array.isArray(formats)) continue;
    const selected = selectBestTrackFromFormats(formats);
    if (selected) return {...selected, language};
  }
  return null;
}

function selectBestTrackFromFormats(formats) {
  const byExt = (ext) => formats.find((item) => item && item.ext === ext && item.url);
  return byExt('json3')
    || byExt('srv3')
    || byExt('vtt')
    || formats.find((item) => item && typeof item.url === 'string');
}

function parseJson3Entries(source) {
  let payload;
  try {
    payload = JSON.parse(source);
  } catch (_) {
    return [];
  }

  const events = Array.isArray(payload && payload.events) ? payload.events : [];
  const entries = [];
  for (const event of events) {
    const segs = Array.isArray(event && event.segs) ? event.segs : [];
    const text = segs
      .map((segment) => String(segment && segment.utf8 ? segment.utf8 : ''))
      .join('')
      .replace(/\s+/g, ' ')
      .trim();
    if (!text) continue;
    const offset = Number(event && event.tStartMs ? event.tStartMs : 0) / 1000;
    const duration = Number(event && event.dDurationMs ? event.dDurationMs : 0) / 1000;
    entries.push({text, offset, duration});
  }
  return entries;
}

function parseVttEntries(source) {
  const lines = String(source || '').split(/\r?\n/);
  const entries = [];
  for (let i = 0; i < lines.length; i += 1) {
    if (!/-->/.test(lines[i])) continue;
    const timeLine = lines[i];
    const parts = timeLine.split('-->');
    if (parts.length < 2) continue;
    const startSec = parseVttTime(parts[0].trim());
    const endSec = parseVttTime(parts[1].trim().split(/\s+/)[0]);
    if (!Number.isFinite(startSec) || !Number.isFinite(endSec)) continue;
    const textLines = [];
    for (let j = i + 1; j < lines.length; j += 1) {
      const line = lines[j];
      if (!line.trim()) {
        i = j;
        break;
      }
      textLines.push(line.trim());
    }
    const text = textLines.join(' ').replace(/\s+/g, ' ').trim();
    if (!text) continue;
    entries.push({
      text,
      offset: startSec,
      duration: Math.max(0.1, endSec - startSec),
    });
  }
  return entries;
}

function parseVttTime(value) {
  const match = String(value || '').trim().match(/^(?:(\d+):)?(\d+):(\d+)\.(\d+)$/);
  if (!match) return Number.NaN;
  const hours = Number(match[1] || 0);
  const minutes = Number(match[2] || 0);
  const seconds = Number(match[3] || 0);
  const millis = Number(match[4] || 0);
  return (hours * 3600) + (minutes * 60) + seconds + (millis / 1000);
}

function runCommand(command, args) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: process.env,
    });

    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    child.on('error', (error) => {
      resolve({stdout, stderr: `${stderr}\n${error.message}`, code: -1});
    });
    child.on('close', (code) => {
      resolve({stdout, stderr, code: Number(code)});
    });
  });
}
