import { $ } from '@wdio/globals';
import { login } from '../selectors/index.js';
import { waitAndTap, replaceText, isPresent } from '../helpers/gestures.js';
import { hideKeyboardIfShown } from '../helpers/app.js';
import { timeouts } from '../config/timeouts.js';

class LoginPage {
  async isDisplayed(timeout = timeouts.probe) {
    return isPresent(login.submit, timeout);
  }

  async waitForDisplayed() {
    await $(login.submit).waitForDisplayed({ timeout: timeouts.element });
  }

  /** Fill the form and submit. Empty strings leave a field blank on purpose (validation tests). */
  async submit(username, password) {
    await this.waitForDisplayed();
    await replaceText(login.username, username);
    await replaceText(login.password, password);
    await hideKeyboardIfShown();
    await waitAndTap(login.submit);
  }

  async loginAs(user) {
    await this.submit(user.username, user.password);
    await $(login.submit).waitForDisplayed({ reverse: true, timeout: timeouts.element });
  }

  async usernameError() {
    const el = await $(login.usernameError);
    await el.waitForDisplayed({ timeout: timeouts.element });
    return el.getText();
  }

  async passwordError() {
    const el = await $(login.passwordError);
    await el.waitForDisplayed({ timeout: timeouts.element });
    return el.getText();
  }
}

export default new LoginPage();
