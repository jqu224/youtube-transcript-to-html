import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.join(__dirname, '..');

const child = spawn('npx', ['wrangler', 'dev', ...process.argv.slice(2)], {
  cwd: repoRoot,
  env: process.env,
  stdio: 'inherit',
});

child.on('exit', (code, signal) => {
  process.exit(signal ? 1 : code || 0);
});

process.on('SIGINT', () => {
  if (!child.killed) child.kill('SIGTERM');
  process.exit(0);
});
process.on('SIGTERM', () => {
  if (!child.killed) child.kill('SIGTERM');
  process.exit(0);
});
