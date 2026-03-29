export const LOCAL_FETCH_PROXY_BASE_URL = 'http://127.0.0.1:8791';

export function getLocalFetchProxyBaseUrl(requestUrl) {
  try {
    const url = new URL(requestUrl);
    return isLocalHostname(url.hostname) ? LOCAL_FETCH_PROXY_BASE_URL : '';
  } catch {
    return '';
  }
}

export function createRuntimeFetch({requestUrl, fetchImpl = fetch}) {
  const proxyBaseUrl = getLocalFetchProxyBaseUrl(requestUrl);

  const runtimeFetch = async function(input, init) {
    try {
      return await fetchImpl(input, init);
    } catch (error) {
      if (!proxyBaseUrl || !shouldProxyRequest(input)) {
        throw error;
      }
      return fetchViaLocalProxy({
        proxyBaseUrl,
        input,
        init,
        fetchImpl,
      });
    }
  };

  runtimeFetch.localProxyBaseUrl = proxyBaseUrl;
  return runtimeFetch;
}

function shouldProxyRequest(input) {
  const url = readRequestUrl(input);
  return Boolean(url) && !isLocalHostname(url.hostname);
}

function readRequestUrl(input) {
  try {
    if (input instanceof Request) {
      return new URL(input.url);
    }
    if (input instanceof URL) {
      return input;
    }
    const value = String(input);
    if (!/^https?:\/\//.test(value)) {
      return null;
    }
    return new URL(value);
  } catch {
    return null;
  }
}

function isLocalHostname(hostname) {
  return hostname === 'localhost'
    || hostname === '127.0.0.1'
    || hostname === '::1'
    || hostname === '[::1]';
}

function fetchViaLocalProxy({proxyBaseUrl, input, init, fetchImpl}) {
  const targetUrl = readRequestUrl(input);
  const proxyUrl = `${proxyBaseUrl}/proxy?url=${encodeURIComponent(targetUrl.toString())}`;
  return fetchImpl(proxyUrl, buildProxyInit(input, init));
}

function buildProxyInit(input, init = {}) {
  const requestInit = {
    method: init.method || (input instanceof Request ? input.method : 'GET'),
  };
  const headers = new Headers(init.headers || (input instanceof Request ? input.headers : undefined));
  headers.delete('host');

  const headerEntries = Object.fromEntries(headers.entries());
  if (Object.keys(headerEntries).length) {
    requestInit.headers = headerEntries;
  }

  if (requestInit.method !== 'GET' && requestInit.method !== 'HEAD') {
    const body = init.body !== undefined
      ? init.body
      : input instanceof Request
        ? input.body
        : undefined;
    if (body !== undefined) {
      requestInit.body = body;
    }
  }

  return requestInit;
}
