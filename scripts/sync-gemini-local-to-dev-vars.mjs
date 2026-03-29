/**
 * If `config/gemini.local.json` exists, merges GEMINI_* into `.dev.vars` for Wrangler local dev.
 * Production uses Cloudflare Worker secrets (`env.GEMINI_API_KEY`); this is local-only.
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
  const model = local.GEMINI_MODEL || 'gemini-2.5-flash';

  if (
    !apiKey ||
    typeof apiKey !== 'string' ||
    apiKey.includes('your_gemini_api_key') ||
    apiKey.includes('your_')
  ) {
    console.warn('[sync-gemini] Set a real GEMINI_API_KEY in config/gemini.local.json (see config/gemini.local.example.json)');
    return {skipped: true, reason: 'placeholder key'};
  }

  const merged = {...loadDevVars(root)};

  merged.GEMINI_API_KEY = apiKey.trim();
  merged.GEMINI_MODEL = String(model).trim();

  fs.writeFileSync(devVarsPath, serializeDevVars(merged), 'utf8');
  console.log('[sync-gemini] Updated .dev.vars from config/gemini.local.json');
  return {skipped: false};
}

if (import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  syncGeminiLocalToDevVars();
}
