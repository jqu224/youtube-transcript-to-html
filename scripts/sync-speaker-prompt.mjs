#!/usr/bin/env node
/**
 * Regenerates `src/lib/speaker-transcript-instruction.json` from the baoyu skill prompt.
 * Run after updating `.cursor/skills/baoyu-youtube-transcript/prompts/speaker-transcript.md`.
 */

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.join(fileURLToPath(new URL('.', import.meta.url)), '..');
const src = path.join(
  root,
  '.cursor/skills/baoyu-youtube-transcript/prompts/speaker-transcript.md',
);
const dest = path.join(root, 'src/lib/speaker-transcript-instruction.json');

const md = fs.readFileSync(src, 'utf8');
fs.writeFileSync(dest, JSON.stringify({text: md}));
console.log('Updated', path.relative(root, dest), 'from', path.relative(root, src));
