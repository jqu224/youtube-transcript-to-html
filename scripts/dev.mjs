import {spawn} from 'node:child_process';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const repoRoot = path.join(__dirname, '..');
const proxyScript = path.join(__dirname, 'local_fetch_proxy.py');
const requirementsFile = path.join(repoRoot, 'requirements.txt');
const venvDir = path.join(repoRoot, '.venv');
const venvPython = path.join(venvDir, 'bin', 'python3');
const wranglerArgs = ['wrangler', 'dev', ...process.argv.slice(2)];

const children = [];

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: repoRoot,
      env: {
        ...process.env,
        ...options.extraEnv,
      },
      stdio: options.stdio || 'inherit',
    });
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${command} ${args.join(' ')} exited with code ${code || 1}`));
    });
  });
}

async function ensurePythonEnvironment() {
  if (!fs.existsSync(venvPython)) {
    await runCommand('python3', ['-m', 'venv', venvDir]);
  }

  try {
    await runCommand(venvPython, ['-c', 'import youtube_transcript_api'], {
      stdio: 'ignore',
    });
  } catch {
    await runCommand(venvPython, ['-m', 'pip', 'install', '-r', requirementsFile]);
  }
}

function startProcess(command, args, extraEnv = {}) {
  const child = spawn(command, args, {
    cwd: repoRoot,
    env: {
      ...process.env,
      ...extraEnv,
    },
    stdio: 'inherit',
  });
  child.on('exit', (code, signal) => {
    if (signal || code) {
      shutdown(signal ? 1 : code || 0);
    }
  });
  children.push(child);
  return child;
}

function shutdown(exitCode = 0) {
  while (children.length) {
    const child = children.pop();
    if (child && !child.killed) {
      child.kill('SIGTERM');
    }
  }
  process.exit(exitCode);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

await ensurePythonEnvironment();

startProcess(venvPython, [proxyScript], {
  PYTHONUNBUFFERED: '1',
});
startProcess('npx', wranglerArgs);
