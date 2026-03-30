import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const repoRoot = path.join(fileURLToPath(new URL('.', import.meta.url)), '..');

/**
 * Parses Wrangler-style `.dev.vars` (KEY=value per line, # comments).
 * @param {string} [root]
 * @returns {Record<string, string>}
 */
export function loadDevVars(root = repoRoot) {
  const filePath = path.join(root, '.dev.vars');
  if (!fs.existsSync(filePath)) {
    return {};
  }
  const text = fs.readFileSync(filePath, 'utf8');
  const out = {};
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    const eq = trimmed.indexOf('=');
    if (eq === -1) {
      continue;
    }
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

/**
 * Local-only JSON (gitignored). Overrides `.dev.vars` for GEMINI_* when present.
 * @param {string} [root]
 * @returns {Record<string, string>}
 */
export function loadGeminiLocalJson(root = repoRoot) {
  const filePath = path.join(root, 'config/gemini.local.json');
  if (!fs.existsSync(filePath)) {
    return {};
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const out = {};
    if (parsed.GEMINI_API_KEY != null && String(parsed.GEMINI_API_KEY).trim()) {
      out.GEMINI_API_KEY = String(parsed.GEMINI_API_KEY).trim();
    }
    if (parsed.GEMINI_MODEL != null && String(parsed.GEMINI_MODEL).trim()) {
      out.GEMINI_MODEL = String(parsed.GEMINI_MODEL).trim();
    }
    if (parsed.AI_ENV != null && String(parsed.AI_ENV).trim()) {
      out.AI_ENV = String(parsed.AI_ENV).trim();
    }
    if (parsed.SILICONFLOW_API_KEY != null && String(parsed.SILICONFLOW_API_KEY).trim()) {
      out.SILICONFLOW_API_KEY = String(parsed.SILICONFLOW_API_KEY).trim();
    }
    if (parsed.SILICONFLOW_MODEL != null && String(parsed.SILICONFLOW_MODEL).trim()) {
      out.SILICONFLOW_MODEL = String(parsed.SILICONFLOW_MODEL).trim();
    }
    if (parsed.SILICONFLOW_MESSAGES_URL != null && String(parsed.SILICONFLOW_MESSAGES_URL).trim()) {
      out.SILICONFLOW_MESSAGES_URL = String(parsed.SILICONFLOW_MESSAGES_URL).trim();
    }
    return out;
  } catch {
    return {};
  }
}

/**
 * Gemini env for Node scripts: `.dev.vars` then `config/gemini.local.json` (local JSON wins).
 * @param {string} [root]
 * @returns {Record<string, string>}
 */
export function resolveGeminiEnv(root = repoRoot) {
  return {
    ...loadDevVars(root),
    ...loadGeminiLocalJson(root),
  };
}
