import {DEFAULT_GEMINI_MODEL} from './render-model.js';

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

/** Minimum ms between starts of Gemini HTTP calls (helps free-tier RPM; override with GEMINI_MIN_REQUEST_INTERVAL_MS). */
const DEFAULT_GEMINI_MIN_REQUEST_INTERVAL_MS = 15000;

let geminiRateLastStartTime = 0;
let geminiRateQueue = Promise.resolve();

/**
 * Min ms between Gemini HTTP call starts. Uses Worker `env` when provided (Cloudflare bindings),
 * else `process.env` (Node / Wrangler), else 15s. Vitest runs with 0 delay.
 * @param {Record<string, string | undefined> | undefined} [env]
 * @returns {number}
 */
export function resolveGeminiMinIntervalMs(env) {
  if (typeof process !== 'undefined' && process.env && process.env.VITEST === 'true') {
    return 0;
  }
  const fromEnvObj = env && env.GEMINI_MIN_REQUEST_INTERVAL_MS;
  if (fromEnvObj != null && String(fromEnvObj).trim() !== '') {
    const n = Number(fromEnvObj);
    if (Number.isFinite(n) && n >= 0) {
      return n;
    }
  }
  const raw = typeof process !== 'undefined' && process.env && process.env.GEMINI_MIN_REQUEST_INTERVAL_MS;
  const n = raw != null && String(raw).trim() !== '' ? Number(raw) : NaN;
  if (Number.isFinite(n) && n >= 0) {
    return n;
  }
  return DEFAULT_GEMINI_MIN_REQUEST_INTERVAL_MS;
}

/**
 * Serializes Gemini calls and waits so consecutive requests are at least `minMs` apart (by start time).
 * @template T
 * @param {() => Promise<T>} fn
 * @param {number} minMs
 * @returns {Promise<T>}
 */
export function withGeminiRateLimit(fn, minMs) {
  const run = async () => {
    if (minMs <= 0) {
      return fn();
    }
    const now = Date.now();
    const waitMs =
      geminiRateLastStartTime === 0
        ? 0
        : Math.max(0, minMs - (now - geminiRateLastStartTime));
    if (waitMs > 0) {
      await new Promise((r) => setTimeout(r, waitMs));
    }
    geminiRateLastStartTime = Date.now();
    return fn();
  };
  const p = geminiRateQueue.then(run, run);
  geminiRateQueue = p.catch(() => {});
  return p;
}

/**
 * @param {object} opts
 * @param {string | undefined} opts.apiKey
 * @param {string} opts.prompt
 * @param {string} [opts.model]
 * @param {(chunk: string) => void} [opts.onTextChunk]
 * @param {number} [opts.temperature]
 * @param {typeof fetch} [opts.fetchFn]
 * @param {Record<string, string | undefined>} [opts.env] Worker env for rate-limit config
 */
export async function streamGeminiText({
  apiKey,
  prompt,
  model = DEFAULT_GEMINI_MODEL,
  onTextChunk,
  temperature = 0.5,
  fetchFn = fetch,
  env,
}) {
  const minMs = resolveGeminiMinIntervalMs(env);
  return withGeminiRateLimit(async () => {
    ensureApiKey(apiKey);
    const endpoint = `${GEMINI_BASE_URL}/${model}:streamGenerateContent?alt=sse&key=${encodeURIComponent(apiKey)}`;
    const response = await fetchFn(endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(buildGeminiRequestBody(prompt, temperature)),
    });

    if (!response.ok || !response.body) {
      const message = await safeReadText(response);
      throw new Error(`Gemini streaming failed (${response.status}): ${message}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const {done, value} = await reader.read();
      if (done) {
        break;
      }
      buffer += decoder.decode(value, {stream: true});
      let boundary = buffer.indexOf('\n\n');
      while (boundary !== -1) {
        const eventChunk = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        const payload = parseSseData(eventChunk);
        if (payload) {
          const text = extractGeminiText(payload);
          if (text) {
            onTextChunk(text);
          }
        }
        boundary = buffer.indexOf('\n\n');
      }
    }
  }, minMs);
}

export async function generateGeminiJson({
  apiKey,
  prompt,
  model = DEFAULT_GEMINI_MODEL,
  temperature = 0.4,
  fetchFn = fetch,
  env,
}) {
  const minMs = resolveGeminiMinIntervalMs(env);
  return withGeminiRateLimit(async () => {
    ensureApiKey(apiKey);
    const endpoint = `${GEMINI_BASE_URL}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const response = await fetchFn(endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        ...buildGeminiRequestBody(prompt, temperature),
        generationConfig: {
          temperature,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      const message = await safeReadText(response);
      throw new Error(`Gemini JSON generation failed (${response.status}): ${message}`);
    }

    const data = await response.json();
    const text = extractGeminiText(data);
    if (!text) {
      throw new Error('Gemini did not return any text.');
    }
    return parsePossiblyFencedJson(text);
  }, minMs);
}

/**
 * Minimal generateContent call to verify the API key and model work (Worker-side).
 */
export async function pingGemini({
  apiKey,
  model = DEFAULT_GEMINI_MODEL,
  fetchFn = fetch,
  env,
}) {
  const minMs = resolveGeminiMinIntervalMs(env);
  return withGeminiRateLimit(async () => {
    ensureApiKey(apiKey);
    const endpoint = `${GEMINI_BASE_URL}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const response = await fetchFn(endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{text: 'Reply with the single word OK'}],
          },
        ],
        generationConfig: {
          temperature: 0,
          maxOutputTokens: 64,
        },
      }),
    });

    if (!response.ok) {
      const message = await safeReadText(response);
      throw new Error(`Gemini ping failed (${response.status}): ${message}`);
    }

    const data = await response.json();
    const text = extractGeminiText(data);
    if (!text || !String(text).trim()) {
      throw new Error(formatGeminiPingEmptyError(data));
    }
    return {model};
  }, minMs);
}

/**
 * Explains empty model text on HTTP 200 (safety block, finishReason, etc.).
 * @param {unknown} data
 * @returns {string}
 */
export function formatGeminiPingEmptyError(data) {
  const d = data && typeof data === 'object' ? data : {};
  const promptFeedback = /** @type {{blockReason?: string, blockReasonMessage?: string}} */ (d.promptFeedback);
  if (promptFeedback && promptFeedback.blockReason) {
    const msg = promptFeedback.blockReasonMessage || '';
    return `Gemini ping returned no text (prompt blocked: ${promptFeedback.blockReason}${msg ? ' — ' + msg : ''})`;
  }
  const c0 = Array.isArray(d.candidates) ? d.candidates[0] : null;
  if (c0 && typeof c0 === 'object') {
    const finishReason = c0.finishReason;
    if (finishReason && finishReason !== 'STOP') {
      return `Gemini ping returned no text (finishReason: ${finishReason})`;
    }
  }
  try {
    const snippet = JSON.stringify(data).slice(0, 400);
    return `Gemini ping returned empty text. Raw response snippet: ${snippet}`;
  } catch {
    return 'Gemini ping returned empty text.';
  }
}

function buildGeminiRequestBody(prompt, temperature) {
  return {
    contents: [
      {
        role: 'user',
        parts: [{text: prompt}],
      },
    ],
    generationConfig: {
      temperature,
    },
  };
}

function parseSseData(block) {
  const lines = block
    .split('\n')
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice(5).trim())
    .filter(Boolean);

  if (!lines.length || lines[0] === '[DONE]') {
    return null;
  }

  try {
    return JSON.parse(lines.join('\n'));
  } catch {
    return null;
  }
}

export function extractGeminiText(payload) {
  return payload?.candidates?.[0]?.content?.parts
    ?.map((part) => part?.text || '')
    .join('') || '';
}

export function parsePossiblyFencedJson(text) {
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();
  return JSON.parse(cleaned);
}

function ensureApiKey(apiKey) {
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY.');
  }
}

async function safeReadText(response) {
  try {
    return await response.text();
  } catch {
    return 'unreadable response body';
  }
}
