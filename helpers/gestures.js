/**
 * Reusable low-level actions. Page objects call these instead of raw `click()` /
 * `setValue()` so waiting rules live in one place.
 */
import { $, $$, driver } from '@wdio/globals';
import logger from '@wdio/logger';
import { catalog } from '../selectors/index.js';
import { timeouts } from '../config/timeouts.js';

const log = logger('gestures');

/**
 * Wait for an element to be displayed, then tap it. Most flaky failures on emulators
 * are taps that land while a screen transition is still running; waiting for
 * "displayed" first removes that whole class.
 */
export async function waitAndTap(selector, timeout = timeouts.element) {
  const element = await $(selector);
  await element.waitForDisplayed({ timeout });
  await element.click();
  return element;
}

/**
 * Type one character at a time with a short pause. Some Android text fields run
 * formatters (card numbers, expiry dates) on every keystroke and drop characters
 * when the whole string arrives at once.
 */
export async function typeSlowly(selector, text, delayMs = 40) {
  const element = await $(selector);
  await element.waitForDisplayed({ timeout: timeouts.element });
  await element.clearValue();
  for (const char of String(text)) {
    await element.addValue(char);
    if (delayMs > 0) {
      await driver.pause(delayMs);
    }
  }
  return element;
}

/** Replace a field's content in one go (fast path for plain text fields). */
export async function replaceText(selector, text) {
  const element = await $(selector);
  await element.waitForDisplayed({ timeout: timeouts.element });
  await element.clearValue();
  if (text !== '') {
    await element.setValue(text);
  }
  return element;
}

/**
 * Scroll the catalog until the product tile with this title is visible. Uses
 * UiScrollable, so it works on any screen size without hard-coded coordinates.
 */
export async function scrollToText(title) {
  log.info(`Scrolling catalog to "${title}"`);
  const element = await $(catalog.scrollToTitle(title));
  await element.waitForDisplayed({ timeout: timeouts.scroll });
  return element;
}

/** Read the text of every element matching a selector, in on-screen order. */
export async function textsOf(selector) {
  const elements = await $$(selector);
  const texts = [];
  for (const element of elements) {
    texts.push(await element.getText());
  }
  return texts;
}

/** True if the element shows up within `timeout`, false otherwise (never throws). */
export async function isPresent(selector, timeout = timeouts.probe) {
  try {
    await $(selector).waitForDisplayed({ timeout });
    return true;
  } catch {
    return false;
  }
}
