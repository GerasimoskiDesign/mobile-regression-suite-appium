/**
 * Runs the device-free unit tests in test/unit with Node's built-in test runner.
 *
 * Why a wrapper: `node --test <dir>` and glob arguments behave differently between
 * Node 20 and 22+, and Windows shells do not expand globs. Passing an explicit file
 * list works the same everywhere.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const unitDir = path.join(root, 'test', 'unit');
const files = fs
  .readdirSync(unitDir)
  .filter((name) => name.endsWith('.test.js'))
  .sort()
  .map((name) => path.join(unitDir, name));

const result = spawnSync(process.execPath, ['--test', ...files], { cwd: root, stdio: 'inherit' });
process.exit(result.status ?? 1);
