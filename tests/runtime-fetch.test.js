import {describe, expect, it, vi} from 'vitest';

import {
  createRuntimeFetch,
  getLocalFetchProxyBaseUrl,
  LOCAL_FETCH_PROXY_BASE_URL,
} from '../src/lib/runtime-fetch.js';

describe('getLocalFetchProxyBaseUrl', () => {
  it('uses the local proxy for localhost development hosts', () => {
    expect(getLocalFetchProxyBaseUrl('http://localhost:8787/')).toBe(LOCAL_FETCH_PROXY_BASE_URL);
    expect(getLocalFetchProxyBaseUrl('http://127.0.0.1:8787/')).toBe(LOCAL_FETCH_PROXY_BASE_URL);
  });

  it('does not use the local proxy for non-local hosts', () => {
    expect(getLocalFetchProxyBaseUrl('https://example.com/')).toBe('');
  });
});

describe('createRuntimeFetch', () => {
  it('passes through successful requests without proxying', async () => {
    const response = new Response('ok');
    const fetchImpl = vi.fn().mockResolvedValue(response);
    const runtimeFetch = createRuntimeFetch({
      requestUrl: 'http://localhost:8787/',
      fetchImpl,
    });

    const result = await runtimeFetch('https://example.com/data');

    expect(result).toBe(response);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('retries external requests through the local proxy after a fetch failure', async () => {
    const fetchImpl = vi.fn()
      .mockRejectedValueOnce(new TypeError('fetch failed'))
      .mockResolvedValueOnce(new Response('proxied'));
    const runtimeFetch = createRuntimeFetch({
      requestUrl: 'http://localhost:8787/',
      fetchImpl,
    });

    const response = await runtimeFetch('https://example.com/api?q=1', {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: '{"demo":true}',
    });

    expect(await response.text()).toBe('proxied');
    expect(fetchImpl).toHaveBeenCalledTimes(2);

    const proxyUrl = new URL(String(fetchImpl.mock.calls[1][0]));
    expect(proxyUrl.origin).toBe(LOCAL_FETCH_PROXY_BASE_URL);
    expect(proxyUrl.pathname).toBe('/proxy');
    expect(proxyUrl.searchParams.get('url')).toBe('https://example.com/api?q=1');
    expect(fetchImpl.mock.calls[1][1]).toMatchObject({
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: '{"demo":true}',
    });
  });

  it('does not proxy relative urls', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError('fetch failed'));
    const runtimeFetch = createRuntimeFetch({
      requestUrl: 'http://localhost:8787/',
      fetchImpl,
    });

    await expect(runtimeFetch('/api/workspace')).rejects.toThrow('fetch failed');
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('does not proxy external requests for non-local worker hosts', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError('fetch failed'));
    const runtimeFetch = createRuntimeFetch({
      requestUrl: 'https://example.workers.dev/',
      fetchImpl,
    });

    await expect(runtimeFetch('https://example.com/data')).rejects.toThrow('fetch failed');
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });
});
