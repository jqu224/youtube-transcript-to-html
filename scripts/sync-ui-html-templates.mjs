import {readFile, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const targets = [
  {
    source: 'src/ui/templates/app-page.html',
    output: 'src/ui/app-page-template.js',
    exportName: 'APP_PAGE_TEMPLATE',
  },
  {
    source: 'src/ui/templates/simplified-version-page.html',
    output: 'src/ui/simplified-version-page-template.js',
    exportName: 'SIMPLIFIED_VERSION_PAGE_TEMPLATE',
  },
  {
    source: 'src/ui/templates/oauth-popup-markup.html',
    output: 'src/ui/oauth-popup-template.js',
    exportName: 'OAUTH_POPUP_TEMPLATE',
  },
];

for (const target of targets) {
  const sourcePath = path.join(repoRoot, target.source);
  const outputPath = path.join(repoRoot, target.output);
  const html = await readFile(sourcePath, 'utf8');
  const normalized = html.replace(/\r\n/g, '\n');
  const output = [
    '// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.',
    `// Source: ${target.source}`,
    `export const ${target.exportName} = ${JSON.stringify(normalized)};`,
    '',
  ].join('\n');
  await writeFile(outputPath, output, 'utf8');
}

process.stdout.write('Synced UI HTML templates to JS modules\n');
