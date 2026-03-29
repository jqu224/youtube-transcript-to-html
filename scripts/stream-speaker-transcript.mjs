#!/usr/bin/env node
/**
 * Streams Gemini output for baoyu `--speakers` raw markdown using the bundled
 * `speaker-transcript.md` instructions (see `src/lib/speaker-transcript.js`).
 *
 * Usage:
 *   node scripts/stream-speaker-transcript.mjs --raw path/to/transcript.md
 *   node scripts/stream-speaker-transcript.mjs --raw path/to/transcript.md -o out.md
 *
 * API key: `GEMINI_API_KEY` env or `.dev.vars` in repo root.
 */

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {streamGeminiText} from '../src/lib/gemini.js';
import {DEFAULT_GEMINI_MODEL} from '../src/lib/render-model.js';
import {buildSpeakerTranscriptPrompt} from '../src/lib/speaker-transcript.js';
import {resolveGeminiEnv} from './load-dev-vars.mjs';

const repoRoot = path.join(fileURLToPath(new URL('.', import.meta.url)), '..');

function parseArgs(argv) {
  let rawPath = '';
  let outPath = '';
  let temperature = 0.4;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--raw' && argv[i + 1]) {
      rawPath = argv[++i];
      continue;
    }
    if ((a === '-o' || a === '--output') && argv[i + 1]) {
      outPath = argv[++i];
      continue;
    }
    if (a === '--temperature' && argv[i + 1]) {
      temperature = Number(argv[++i]);
      continue;
    }
    if (a === '--help' || a === '-h') {
      console.error(`Usage: node scripts/stream-speaker-transcript.mjs --raw <speakers-raw.md> [-o out.md] [--temperature 0.4]`);
      process.exit(0);
    }
  }
  return {rawPath, outPath, temperature};
}

const {rawPath, outPath, temperature} = parseArgs(process.argv.slice(2));

if (!rawPath) {
  console.error('Missing --raw path to baoyu --speakers markdown file.');
  process.exit(1);
}

const resolvedRaw = path.isAbsolute(rawPath) ? rawPath : path.join(process.cwd(), rawPath);
if (!fs.existsSync(resolvedRaw)) {
  console.error(`File not found: ${resolvedRaw}`);
  process.exit(1);
}

const envVars = resolveGeminiEnv(repoRoot);
const apiKey = process.env.GEMINI_API_KEY || envVars.GEMINI_API_KEY;
const model = process.env.GEMINI_MODEL || envVars.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;

if (!apiKey) {
  console.error('Set GEMINI_API_KEY, or create config/gemini.local.json (see config/gemini.local.example.json), or use .dev.vars');
  process.exit(1);
}

const rawMarkdown = fs.readFileSync(resolvedRaw, 'utf8');
const prompt = buildSpeakerTranscriptPrompt(rawMarkdown);

let sink = null;
if (outPath) {
  const resolvedOut = path.isAbsolute(outPath) ? outPath : path.join(process.cwd(), outPath);
  sink = fs.createWriteStream(resolvedOut, {flags: 'w'});
}

await streamGeminiText({
  apiKey,
  model,
  prompt,
  temperature,
  onTextChunk(chunk) {
    process.stdout.write(chunk);
    if (sink) {
      sink.write(chunk);
    }
  },
});

if (sink) {
  sink.end();
  await new Promise((resolve, reject) => {
    sink.on('finish', resolve);
    sink.on('error', reject);
  });
}
