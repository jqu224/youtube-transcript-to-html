import {renderAppPage} from './ui/page.js';
import {APP_STYLES} from './ui/styles.js';
import {LOGO_ASSET_PATH, LOGO_PNG_BYTES} from './ui/brand.js';
import {CLIENT_APP_SOURCE} from './ui/app-client.js';

const CHROME_DEVTOOLS_WELL_KNOWN_PATH = '/.well-known/appspecific/com.chrome.devtools.json';
const STATIC_ASSET_CACHE_CONTROL = 'public, max-age=3600';

export default {
  async fetch(request) {
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
