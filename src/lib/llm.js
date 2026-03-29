import {DEFAULT_GEMINI_MODEL} from './render-model.js';
import {generateGeminiJson, pingGemini, streamGeminiText} from './gemini.js';
import {
  DEFAULT_SILICONFLOW_MESSAGES_URL,
  DEFAULT_SILICONFLOW_MODEL,
  generateSiliconFlowJson,
  pingSiliconFlow,
  streamSiliconFlowText,
} from './siliconflow.js';

/**
 * Local dev: `AI_ENV=local` and `SILICONFLOW_API_KEY` → SiliconFlow /v1/messages (China-friendly).
 * Otherwise Google Gemini via `GEMINI_API_KEY`.
 * @param {Record<string, string | undefined>} env
 * @returns {boolean}
 */
export function isSiliconFlowLocalEnv(env) {
  return (
    String(env.AI_ENV || '')
      .toLowerCase()
      .trim() === 'local' &&
    Boolean(env.SILICONFLOW_API_KEY && String(env.SILICONFLOW_API_KEY).trim())
  );
}

/**
 * @param {Record<string, string | undefined>} env
 * @param {typeof fetch} [fetchFn]
 * @returns {Promise<{model: string, provider: 'siliconflow' | 'google'}>}
 */
export async function pingLlm(env, fetchFn = fetch) {
  if (isSiliconFlowLocalEnv(env)) {
    const model = env.SILICONFLOW_MODEL || DEFAULT_SILICONFLOW_MODEL;
    await pingSiliconFlow({
      apiKey: String(env.SILICONFLOW_API_KEY).trim(),
      model,
      messagesUrl: env.SILICONFLOW_MESSAGES_URL || DEFAULT_SILICONFLOW_MESSAGES_URL,
      fetchFn,
    });
    return {model, provider: 'siliconflow'};
  }
  const model = env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
  await pingGemini({
    apiKey: env.GEMINI_API_KEY,
    model,
    fetchFn,
  });
  return {model, provider: 'google'};
}

/**
 * @param {Record<string, string | undefined>} env
 * @param {object} opts
 * @param {string} opts.prompt
 * @param {number} [opts.temperature]
 * @param {typeof fetch} [opts.fetchFn]
 * @returns {Promise<void>}
 */
export async function streamLlmText(env, {prompt, temperature = 0.5, onTextChunk, fetchFn = fetch}) {
  if (isSiliconFlowLocalEnv(env)) {
    return streamSiliconFlowText({
      apiKey: String(env.SILICONFLOW_API_KEY).trim(),
      model: env.SILICONFLOW_MODEL || DEFAULT_SILICONFLOW_MODEL,
      messagesUrl: env.SILICONFLOW_MESSAGES_URL || DEFAULT_SILICONFLOW_MESSAGES_URL,
      prompt,
      temperature,
      onTextChunk,
      fetchFn,
    });
  }
  return streamGeminiText({
    apiKey: env.GEMINI_API_KEY,
    model: env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL,
    prompt,
    temperature,
    onTextChunk,
    fetchFn,
  });
}

/**
 * @param {Record<string, string | undefined>} env
 * @param {object} opts
 * @param {string} opts.prompt
 * @param {number} [opts.temperature]
 * @param {typeof fetch} [opts.fetchFn]
 * @returns {Promise<object>}
 */
export async function generateLlmJson(env, {prompt, temperature = 0.4, fetchFn = fetch}) {
  if (isSiliconFlowLocalEnv(env)) {
    return generateSiliconFlowJson({
      apiKey: String(env.SILICONFLOW_API_KEY).trim(),
      model: env.SILICONFLOW_MODEL || DEFAULT_SILICONFLOW_MODEL,
      messagesUrl: env.SILICONFLOW_MESSAGES_URL || DEFAULT_SILICONFLOW_MESSAGES_URL,
      prompt,
      temperature,
      fetchFn,
    });
  }
  return generateGeminiJson({
    apiKey: env.GEMINI_API_KEY,
    model: env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL,
    prompt,
    temperature,
    fetchFn,
  });
}
