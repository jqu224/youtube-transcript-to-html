/**
 * If `config/gemini.local.json` exists, merges LLM-related keys into `.dev.vars` for Wrangler local dev.
 * Production uses Cloudflare Worker secrets; this is local-only.
 */

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

import {loadDevVars} from './load-dev-vars.mjs';

const repoRoot = path.join(fileURLToPath(new URL('.', import.meta.url)), '..');
const configPath = path.join(repoRoot, 'config/gemini.local.json');
const devVarsPath = path.join(repoRoot, '.dev.vars');

function serializeDevVars(obj) {
  const lines = [];
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === '') {
      continue;
    }
    const needsQuote = /[\s#]/.test(String(v));
    const val = needsQuote ? `"${String(v).replace(/"/g, '\\"')}"` : String(v);
    lines.push(`${k}=${val}`);
  }
  return lines.join('\n') + (lines.length ? '\n' : '');
}

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

export function syncGeminiLocalToDevVars(root = repoRoot) {
  if (!fs.existsSync(configPath)) {
    return {skipped: true, reason: 'config/gemini.local.json missing'};
  }

  let local;
  try {
    local = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (e) {
    console.warn('[sync-gemini] Could not parse config/gemini.local.json:', e.message);
    return {skipped: true, reason: 'parse error'};
  }

  const apiKey = local.GEMINI_API_KEY;
  const geminiModel = local.GEMINI_MODEL || 'gemini-2.5-flash';
  const geminiOk = !isPlaceholderGeminiKey(apiKey);

  const sfKey = local.SILICONFLOW_API_KEY;
  const siliconOk = !isPlaceholderSiliconKey(sfKey);
  const wantsLocal = String(local.AI_ENV || '')
    .toLowerCase()
    .trim() === 'local';

  if (wantsLocal && !siliconOk) {
    console.warn(
      '[sync-gemini] AI_ENV is local: set a real SILICONFLOW_API_KEY in config/gemini.local.json (see config/gemini.local.example.json)',
    );
    return {skipped: true, reason: 'local without silicon key'};
  }

  if (!wantsLocal && !geminiOk) {
    console.warn(
      '[sync-gemini] Set a real GEMINI_API_KEY in config/gemini.local.json, or set AI_ENV to local with SILICONFLOW_API_KEY (see config/gemini.local.example.json)',
    );
    return {skipped: true, reason: 'placeholder key'};
  }

  const merged = {...loadDevVars(root)};

  if (local.AI_ENV != null && String(local.AI_ENV).trim()) {
    merged.AI_ENV = String(local.AI_ENV).trim();
  }

  if (wantsLocal && siliconOk) {
    merged.SILICONFLOW_API_KEY = String(sfKey).trim();
    if (local.SILICONFLOW_MODEL != null && String(local.SILICONFLOW_MODEL).trim()) {
      merged.SILICONFLOW_MODEL = String(local.SILICONFLOW_MODEL).trim();
    }
    if (local.SILICONFLOW_MESSAGES_URL != null && String(local.SILICONFLOW_MESSAGES_URL).trim()) {
      merged.SILICONFLOW_MESSAGES_URL = String(local.SILICONFLOW_MESSAGES_URL).trim();
    }
  }

  if (geminiOk) {
    merged.GEMINI_API_KEY = String(apiKey).trim();
    merged.GEMINI_MODEL = String(geminiModel).trim();
  } else if (wantsLocal && siliconOk) {
    delete merged.GEMINI_API_KEY;
    delete merged.GEMINI_MODEL;
  }

  fs.writeFileSync(devVarsPath, serializeDevVars(merged), 'utf8');
  console.log('[sync-gemini] Updated .dev.vars from config/gemini.local.json');
  return {skipped: false};
}

if (import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  syncGeminiLocalToDevVars();
}
