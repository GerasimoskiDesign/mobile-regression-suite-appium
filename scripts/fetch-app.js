/**
 * Download the public Sauce Labs "My Demo App" APK into apps/.
 *
 * The release is pinned (APP_RELEASE, default below) so a new upstream release cannot
 * change the app under test between two runs. Bump it deliberately and re-run the suite.
 *
 * Usage:  npm run fetch-app            (uses the pinned release)
 *         APP_RELEASE=2.3.0 npm run fetch-app
 * Needs the GitHub CLI (`gh`). In CI, GH_TOKEN is provided by the workflow.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = 'saucelabs/my-demo-app-android';
const DEFAULT_RELEASE = '2.3.0';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const appsDir = path.join(root, 'apps');
const target = path.join(appsDir, 'my-demo-app.apk');
const release = process.env.APP_RELEASE || DEFAULT_RELEASE;
// Release assets are named mda-<version>-<build>.apk; the androidTest APK is excluded.
const pattern = `mda-${release}-*.apk`;

function run(args) {
  console.log(`> gh ${args.join(' ')}`);
  const result = spawnSync('gh', args, { stdio: 'inherit' });
  if (result.error) {
    console.error(
      'Could not run the GitHub CLI. Install it from cli.github.com and run `gh auth login`.',
    );
    process.exit(1);
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

fs.mkdirSync(appsDir, { recursive: true });
const before = new Set(fs.readdirSync(appsDir));
run([
  'release',
  'download',
  release,
  '--repo',
  REPO,
  '--pattern',
  pattern,
  '--dir',
  appsDir,
  '--clobber',
]);

const downloaded = fs
  .readdirSync(appsDir)
  .filter((name) => name.startsWith(`mda-${release}-`) && name.endsWith('.apk'));
if (downloaded.length !== 1) {
  console.error(
    `Expected exactly one APK for release ${release}, found: ${downloaded.join(', ') || 'none'}`,
  );
  process.exit(1);
}
fs.copyFileSync(path.join(appsDir, downloaded[0]), target);
if (!before.has(downloaded[0])) {
  fs.rmSync(path.join(appsDir, downloaded[0]));
}
const sizeMb = (fs.statSync(target).size / 1024 / 1024).toFixed(1);
console.log(`Saved ${path.relative(root, target)} (${release}, ${sizeMb} MB)`);
