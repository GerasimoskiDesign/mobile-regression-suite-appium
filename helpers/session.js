/**
 * Session resilience.
 *
 * In the regression runs this suite is modelled on, the most common "failure" was not
 * a bug at all: the backend expired the session halfway through a long run and every
 * later test failed on a login screen it did not expect. `ensureLoggedIn()` is called
 * at the start of any step that needs a session, detects that state and logs back in,
 * so one expired token costs one extra login instead of a red run.
 */
import logger from '@wdio/logger';
import LoginPage from '../pages/LoginPage.js';
import MenuPage from '../pages/MenuPage.js';
import { users } from '../data/users.js';

const log = logger('session');

/**
 * Make sure a user is logged in, whatever screen the app is on.
 *
 * 1. If the login form is already on screen (the app redirected us), log in there.
 * 2. Otherwise ask the navigation drawer; if it offers "Log In", open it and log in.
 *
 * @returns {Promise<boolean>} true when a (re-)login was needed, false when the session
 *   was still valid. Tests use this to prove recovery actually happened.
 */
export async function ensureLoggedIn(user = users.standard) {
  if (await LoginPage.isDisplayed()) {
    log.warn('Login screen detected mid-run; logging back in');
    await LoginPage.loginAs(user);
    return true;
  }
  if (await MenuPage.isLoggedIn()) {
    return false;
  }
  log.warn('Session lost (menu offers "Log In"); logging back in');
  await MenuPage.openLogin();
  await LoginPage.loginAs(user);
  return true;
}

/** Log out through the UI. Used by tests that need to simulate an expired session. */
export async function forceLogout() {
  log.info('Forcing logout through the menu');
  await MenuPage.logout({ confirm: true });
  await LoginPage.waitForDisplayed();
}
