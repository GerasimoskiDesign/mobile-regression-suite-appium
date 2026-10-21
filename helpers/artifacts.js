/**
 * Failure evidence. A red test on a CI emulator is only debuggable if you can see the
 * screen and the view hierarchy at the moment it failed, so both are saved next to
 * the JUnit report and uploaded as a workflow artifact.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import logger from '@wdio/logger';

const log = logger('artifacts');

/** Turn a test title into a safe, short file name. */
export function slugify(text, maxLength = 80) {
  return (
    String(text)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, maxLength) || 'test'
  );
}

/**
 * Save screenshot + page source for a failed test. Never throws: if the session is
 * already dead, losing the artifact is better than masking the real failure.
 */
export async function saveFailureArtifacts(driver, test, outputDir, now = new Date()) {
  // Timestamp suffix: a spec-file retry must not overwrite the first attempt's evidence.
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\..+$/, '');
  const base = `${slugify(test.parent)}--${slugify(test.title)}--${stamp}`;
  await fs.mkdir(outputDir, { recursive: true });
  try {
    await driver.saveScreenshot(path.join(outputDir, `${base}.png`));
  } catch (err) {
    log.warn(`Could not save screenshot: ${err.message}`);
  }
  try {
    await fs.writeFile(path.join(outputDir, `${base}.xml`), await driver.getPageSource(), 'utf8');
  } catch (err) {
    log.warn(`Could not save page source: ${err.message}`);
  }
  return base;
}
