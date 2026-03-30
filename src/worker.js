import {renderAppPage} from './ui/page.js';
import {APP_STYLES} from './ui/styles.js';
import {LOGO_ASSET_PATH, LOGO_PNG_BYTES} from './ui/brand.js';
import {CLIENT_APP_SOURCE} from './ui/app-client.js';
import {extractVideoId, fetchTranscript} from './lib/youtube.js';
import {generateSummary} from './lib/gemini.js';

const CHROME_DEVTOOLS_WELL_KNOWN_PATH = '/.well-known/appspecific/com.chrome.devtools.json';
const STATIC_ASSET_CACHE_CONTROL = 'no-store';

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);

      if (request.method === 'GET' && url.pathname === CHROME_DEVTOOLS_WELL_KNOWN_PATH) {
        return new Response('{}', {
          status: 200,
          headers: {
            'content-type': 'application/json; charset=utf-8',
            'cache-control': 'public, max-age=86400',
          },
        });
      }

      if (request.method === 'GET' && url.pathname === '/') {
        return htmlResponse(renderAppPage());
      }

      if (request.method === 'GET' && url.pathname === '/assets/app.js') {
        return javascriptResponse(CLIENT_APP_SOURCE);
      }

      if (request.method === 'POST' && url.pathname === '/api/transcript') {
        const body = await readJsonBody(request);
        const videoUrl = typeof body.url === 'string' ? body.url.trim() : '';
        if (!videoUrl) {
          return jsonResponse({error: 'Missing required field: url'}, 400);
        }

        const videoId = extractVideoId(videoUrl);
        if (!videoId) {
          return jsonResponse({error: 'Could not extract a valid YouTube video ID from url'}, 400);
        }

        const transcriptPayload = await fetchTranscript(videoId);
        return jsonResponse(transcriptPayload);
      }

      if (request.method === 'POST' && url.pathname === '/api/summary') {
        const body = await readJsonBody(request);
        const transcriptText = typeof body.transcript === 'string' ? body.transcript.trim() : '';
        if (!transcriptText) {
          return jsonResponse({error: 'Missing required field: transcript'}, 400);
        }

        const html = await generateSummary(transcriptText, env || {});
        return jsonResponse({html});
      }

      if (request.method === 'GET' && url.pathname === '/assets/styles.css') {
        return cssResponse(APP_STYLES);
      }

      if (request.method === 'GET' && url.pathname === LOGO_ASSET_PATH) {
        return pngResponse(LOGO_PNG_BYTES);
      }

      return jsonResponse({error: 'Not implemented yet.'}, 501);
    } catch (error) {
      return jsonResponse({error: error.message || 'Unexpected server error.'}, 500);
    }
  },
};

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {'content-type': 'application/json; charset=utf-8'},
  });
}

async function readJsonBody(request) {
  try {
    return await request.json();
  } catch (_) {
    return {};
  }
}

function htmlResponse(payload) {
  return new Response(payload, {
    headers: {'content-type': 'text/html; charset=utf-8'},
  });
}

function javascriptResponse(payload) {
  return new Response(payload, {
    headers: {
      'content-type': 'text/javascript; charset=utf-8',
      'cache-control': STATIC_ASSET_CACHE_CONTROL,
    },
  });
}

function cssResponse(payload) {
  return new Response(payload, {
    headers: {
      'content-type': 'text/css; charset=utf-8',
      'cache-control': STATIC_ASSET_CACHE_CONTROL,
    },
  });
}

function pngResponse(payload) {
  return new Response(payload, {
    headers: {
      'content-type': 'image/png',
      'cache-control': 'public, max-age=86400',
    },
  });
}
