/**
 * Run only the quarantined tests tagged @known-defect.
 *
 * They are expected to FAIL while the defect is open. When one starts passing, the bug
 * is fixed upstream: remove the tag so the test joins the regular regression run.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const specDir = path.join(root, 'test', 'specs');
const specs = fs
  .readdirSync(specDir)
  .filter((name) => name.endsWith('.spec.js'))
  .filter((name) => fs.readFileSync(path.join(specDir, name), 'utf8').includes('@known-defect'))
  .map((name) => path.join(specDir, name));

if (specs.length === 0) {
  console.log('No @known-defect tests found.');
  process.exit(0);
}

const wdio = path.join(root, 'node_modules', '@wdio', 'cli', 'bin', 'wdio.js');
const args = [
  wdio,
  'run',
  path.join('config', 'wdio.conf.js'),
  ...specs.flatMap((s) => ['--spec', s]),
];
const result = spawnSync(process.execPath, args, {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, KNOWN_DEFECTS: 'only', SPEC_FILE_RETRIES: '0' },
});
process.exit(result.status ?? 1);
