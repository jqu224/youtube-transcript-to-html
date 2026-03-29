import {parsePossiblyFencedJson} from './gemini.js';

export const DEFAULT_SILICONFLOW_MODEL = 'Pro/zai-org/GLM-4.7';
export const DEFAULT_SILICONFLOW_MESSAGES_URL = 'https://api.siliconflow.cn/v1/messages';

const JSON_SUFFIX = '\n\nRespond with valid JSON only. Do not wrap in markdown code fences.';

/**
 * Concatenates assistant text blocks from SiliconFlow /v1/messages response (Anthropic-style content array).
 * @param {unknown} data
 * @returns {string}
 */
export function extractSiliconFlowAssistantText(data) {
  const d = data && typeof data === 'object' ? data : {};
  const content = /** @type {{type?: string, text?: string}[]} */ (d.content);
  if (!Array.isArray(content)) {
    return '';
  }
  let out = '';
  for (const block of content) {
    if (block && block.type === 'text' && typeof block.text === 'string') {
      out += block.text;
    }
  }
  return out;
}

async function safeReadText(response) {
  try {
    return await response.text();
  } catch {
    return 'unreadable response body';
  }
}

/**
 * @param {object} opts
 * @param {string} opts.apiKey
 * @param {string} opts.model
 * @param {string} opts.messagesUrl
 * @param {Record<string, unknown>} opts.body
 * @param {typeof fetch} [opts.fetchFn]
 * @returns {Promise<unknown>}
 */
async function postMessagesJson(opts) {
  const {apiKey, messagesUrl, body, fetchFn = fetch} = opts;
  const response = await fetchFn(messagesUrl, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: 'Bearer ' + apiKey,
    },
    body: JSON.stringify(body),
  });
  const text = await safeReadText(response);
  if (!response.ok) {
    throw new Error('SiliconFlow request failed (' + response.status + '): ' + text.slice(0, 1200));
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('SiliconFlow returned non-JSON: ' + text.slice(0, 400));
  }
}

/**
 * Minimal messages call to verify API key and model (mirrors Worker ping intent).
 */
export async function pingSiliconFlow({
  apiKey,
  model = DEFAULT_SILICONFLOW_MODEL,
  messagesUrl = DEFAULT_SILICONFLOW_MESSAGES_URL,
  fetchFn = fetch,
}) {
  if (!apiKey) {
    throw new Error('Missing SILICONFLOW_API_KEY.');
  }
  const m = String(model).trim() || DEFAULT_SILICONFLOW_MODEL;
  const data = await postMessagesJson({
    apiKey,
    messagesUrl,
    fetchFn,
    body: {
      model: m,
      max_tokens: 128,
      temperature: 0,
      messages: [{role: 'user', content: 'Reply with the single word OK'}],
    },
  });
  const text = extractSiliconFlowAssistantText(data).trim();
  if (!text) {
    throw new Error('SiliconFlow ping returned no assistant text.');
  }
  return {model: m};
}

/**
 * Single-shot completion; emits chunks to match streaming UX (local-friendly).
 */
export async function streamSiliconFlowText({
  apiKey,
  model = DEFAULT_SILICONFLOW_MODEL,
  messagesUrl = DEFAULT_SILICONFLOW_MESSAGES_URL,
  prompt,
  temperature = 0.5,
  onTextChunk,
  fetchFn = fetch,
}) {
  if (!apiKey) {
    throw new Error('Missing SILICONFLOW_API_KEY.');
  }
  const m = String(model).trim() || DEFAULT_SILICONFLOW_MODEL;
  const data = await postMessagesJson({
    apiKey,
    messagesUrl,
    fetchFn,
    body: {
      model: m,
      max_tokens: 8192,
      temperature,
      messages: [{role: 'user', content: prompt}],
    },
  });
  const full = extractSiliconFlowAssistantText(data);
  if (!full) {
    throw new Error('SiliconFlow returned no text.');
  }
  const step = 160;
  for (let i = 0; i < full.length; i += step) {
    onTextChunk(full.slice(i, i + step));
    await Promise.resolve();
  }
}

/**
 * JSON-shaped completion (prompts already request JSON; suffix reinforces format).
 */
export async function generateSiliconFlowJson({
  apiKey,
  model = DEFAULT_SILICONFLOW_MODEL,
  messagesUrl = DEFAULT_SILICONFLOW_MESSAGES_URL,
  prompt,
  temperature = 0.4,
  fetchFn = fetch,
}) {
  if (!apiKey) {
    throw new Error('Missing SILICONFLOW_API_KEY.');
  }
  const m = String(model).trim() || DEFAULT_SILICONFLOW_MODEL;
  const data = await postMessagesJson({
    apiKey,
    messagesUrl,
    fetchFn,
    body: {
      model: m,
      max_tokens: 8192,
      temperature,
      messages: [{role: 'user', content: prompt + JSON_SUFFIX}],
    },
  });
  const text = extractSiliconFlowAssistantText(data);
  if (!text || !String(text).trim()) {
    throw new Error('SiliconFlow did not return any text.');
  }
  return parsePossiblyFencedJson(text);
}
