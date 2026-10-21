import { $, driver } from '@wdio/globals';
import { menu, dialog } from '../selectors/index.js';
import { waitAndTap, isPresent } from '../helpers/gestures.js';
import { timeouts } from '../config/timeouts.js';
import Header from './Header.js';

/** Navigation drawer. Its last entry is either "Log In" or "Log Out", which tells us the session state. */
class MenuPage {
  async open() {
    await Header.openMenu();
    await $(menu.container).waitForDisplayed({ timeout: timeouts.element });
  }

  /**
   * Close the drawer by tapping the dimmed area to its right. The Android back key is
   * not an option here: on the catalog screen it closes the whole app instead of the
   * drawer. The tap point is computed from the drawer's own bounds, so it adapts to
   * any screen size.
   */
  async close() {
    const drawer = await $(menu.container);
    if (!(await drawer.isDisplayed().catch(() => false))) {
      return;
    }
    const { x } = await drawer.getLocation();
    const { width } = await drawer.getSize();
    const screen = await driver.getWindowSize();
    const tapX = Math.round((x + width + screen.width) / 2);
    const tapY = Math.round(screen.height / 2);
    await driver
      .action('pointer', { parameters: { pointerType: 'touch' } })
      .move({ x: tapX, y: tapY })
      .down()
      .pause(50)
      .up()
      .perform();
    await drawer.waitForDisplayed({ reverse: true, timeout: timeouts.element });
  }

  /** Reads the session state from the drawer, then closes it again. */
  async isLoggedIn() {
    await this.open();
    const loggedIn = await isPresent(menu.logout, timeouts.probe);
    await this.close();
    return loggedIn;
  }

  async goTo(label) {
    await this.open();
    await waitAndTap(menu.item(label));
  }

  async openLogin() {
    await this.open();
    await waitAndTap(menu.login);
  }

  /** Log out through the drawer. `confirm: false` taps Cancel on the confirmation dialog. */
  async logout({ confirm = true } = {}) {
    await this.open();
    await waitAndTap(menu.logout);
    await $(dialog.title).waitForDisplayed({ timeout: timeouts.element });
    await waitAndTap(confirm ? dialog.confirm : dialog.cancel);
  }
}

export default new MenuPage();
