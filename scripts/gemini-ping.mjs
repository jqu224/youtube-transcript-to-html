/**
 * Verifies local LLM config by calling the same ping as the Worker (`src/lib/llm.js` → `pingLlm`).
 * With `AI_ENV=local` and `SILICONFLOW_API_KEY`, uses SiliconFlow; otherwise Google Gemini.
 *
 * Usage: npm run gemini:ping
 * Env: `resolveGeminiEnv` — `.dev.vars` merged with `config/gemini.local.json` (JSON wins).
 */

import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {pingLlm} from '../src/lib/llm.js';
import {DEFAULT_GEMINI_MODEL} from '../src/lib/render-model.js';
import {DEFAULT_SILICONFLOW_MODEL} from '../src/lib/siliconflow.js';
import {resolveGeminiEnv} from './load-dev-vars.mjs';

const repoRoot = path.join(fileURLToPath(new URL('.', import.meta.url)), '..');

function isPlaceholderGeminiKey(apiKey) {
  return (
    !apiKey ||
    typeof apiKey !== 'string' ||
    apiKey.includes('your_gemini_api_key') ||
    apiKey.includes('your_')
  );
}

function isPlaceholderSiliconKey(apiKey) {
  return (
    !apiKey ||
    typeof apiKey !== 'string' ||
    apiKey.includes('your_siliconflow') ||
    apiKey.includes('your_silicon')
  );
}

/**
 * Node's fetch often throws `TypeError: fetch failed` with the real reason on `error.cause` (DNS, TLS, proxy, etc.).
 * @param {unknown} err
 * @returns {string}
 */
function formatCliError(err) {
  const base = err && typeof err === 'object' && 'message' in err ? String(err.message) : String(err);
  const parts = [base];
  let c = err && typeof err === 'object' && 'cause' in err ? err.cause : undefined;
  let depth = 0;
  while (c != null && depth < 4) {
    if (c instanceof Error) {
      parts.push(c.message);
      if ('code' in c && c.code) {
        parts.push('code=' + String(c.code));
      }
    } else if (typeof c === 'object' && c !== null) {
      const code = 'code' in c ? c.code : undefined;
      const msg = 'message' in c && c.message != null ? String(c.message) : JSON.stringify(c);
      parts.push(msg + (code != null ? ' (code=' + String(code) + ')' : ''));
    } else {
      parts.push(String(c));
    }
    c =
      c && typeof c === 'object' && 'cause' in c
        ? /** @type {{cause?: unknown}} */ (c).cause
        : undefined;
    depth += 1;
  }
  let hint = '';
  const joined = parts.join(' — ');
  if (/fetch failed/i.test(base) && /ENOTFOUND|getaddrinfo/i.test(joined)) {
    hint =
      ' (DNS failed — check network/VPN/firewall for the API host you are using)';
  } else if (
    /fetch failed/i.test(base) &&
    /UND_ERR_CONNECT_TIMEOUT|Connect Timeout/i.test(joined)
  ) {
    hint =
      ' (TCP connect timed out — try another network or VPN, or confirm the API host is reachable)';
  } else if (/fetch failed/i.test(base) && /ECONNRESET|ETIMEDOUT|ECONNREFUSED/i.test(joined)) {
    hint = ' (connection issue — proxy/VPN/firewall may block HTTPS)';
  } else if (/fetch failed/i.test(base) && /certificate|CERT_|UNABLE_TO_VERIFY/i.test(joined)) {
    hint = ' (TLS/certificate issue — try updating Node or check corporate SSL inspection)';
  }
  return joined + hint;
}

async function main() {
  const env = resolveGeminiEnv(repoRoot);
  const wantsLocal =
    String(env.AI_ENV || '')
      .toLowerCase()
      .trim() === 'local';

  if (wantsLocal) {
    if (isPlaceholderSiliconKey(env.SILICONFLOW_API_KEY)) {
      console.error(
        '[gemini-ping] AI_ENV=local: set SILICONFLOW_API_KEY in config/gemini.local.json (see config/gemini.local.example.json)',
      );
      process.exitCode = 1;
      return;
    }
    const model = (env.SILICONFLOW_MODEL || DEFAULT_SILICONFLOW_MODEL).trim();
    console.log('[gemini-ping] SiliconFlow /v1/messages ping model=' + model + ' …');
    try {
      const out = await pingLlm(env, fetch);
      console.log(
        '[gemini-ping] OK — provider=' + out.provider + ' model=' + out.model + ' (same as Worker pingLlm)',
      );
    } catch (err) {
      console.error('[gemini-ping] Failed:', formatCliError(err));
      process.exitCode = 1;
    }
    return;
  }

  const apiKey = env.GEMINI_API_KEY;
  const model = (env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL).trim();
  if (!apiKey) {
    console.error(
      '[gemini-ping] No GEMINI_API_KEY. For SiliconFlow locally, set AI_ENV to local and SILICONFLOW_API_KEY (see config/gemini.local.example.json)',
    );
    process.exitCode = 1;
    return;
  }
  if (isPlaceholderGeminiKey(apiKey)) {
    console.error('[gemini-ping] Set a real GEMINI_API_KEY in config/gemini.local.json (same check as sync-gemini-local-to-dev-vars)');
    process.exitCode = 1;
    return;
  }

  console.log('[gemini-ping] Gemini generateContent ping model=' + model + ' …');
  try {
    const out = await pingLlm(env, fetch);
    console.log(
      '[gemini-ping] OK — provider=' + out.provider + ' model=' + out.model + ' (same as Worker pingLlm)',
    );
  } catch (err) {
    console.error('[gemini-ping] Failed:', formatCliError(err));
    process.exitCode = 1;
  }
}

await main();
