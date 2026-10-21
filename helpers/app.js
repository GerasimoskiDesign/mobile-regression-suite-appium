/**
 * App lifecycle helpers.
 */
import { $, driver } from '@wdio/globals';
import logger from '@wdio/logger';
import { APP_ID } from '../selectors/strategies.js';
import { catalog } from '../selectors/index.js';
import { timeouts } from '../config/timeouts.js';

const log = logger('app');

/**
 * Cold-restart the app and wait for the catalog. The demo app keeps cart and login
 * in memory only, so this is also the cheapest way to get a clean state between
 * tests: seconds, versus a reinstall that takes close to a minute on CI.
 */
export async function restartApp() {
  log.info('Cold-restarting the app');
  await driver.terminateApp(APP_ID);
  await driver.activateApp(APP_ID);
  await $(catalog.list).waitForDisplayed({ timeout: timeouts.appStart });
}

/** Send the app to the background for `seconds`, then bring it back (warm resume). */
export async function backgroundApp(seconds = 3) {
  log.info(`Backgrounding the app for ${seconds}s`);
  await driver.execute('mobile: backgroundApp', { seconds });
}

/** Android back key. Closes drawers and dialogs and pops one screen. */
export async function pressBack() {
  await driver.back();
}

export async function hideKeyboardIfShown() {
  if (await driver.isKeyboardShown()) {
    await driver.hideKeyboard();
  }
}
