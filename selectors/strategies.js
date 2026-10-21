/**
 * Locator builders. Every locator in the suite is created through one of these
 * functions, so the allowed strategies are enforced in exactly one place.
 *
 * Why only accessibility ids and resource ids: they are the two attributes the app
 * team controls on purpose. XPath couples the test to the view hierarchy, which
 * changes with every layout refactor and is also the slowest strategy on UiAutomator2.
 */

export const APP_ID = 'com.saucelabs.mydemoapp.android';

/** Accessibility id (Android content-desc). Preferred strategy. */
export function byA11y(description) {
  assertNonEmpty(description, 'accessibility id');
  return `~${description}`;
}

/** Fully-qualified Android resource id, e.g. `com.app:id/loginBtn`. */
export function byId(resourceName) {
  assertNonEmpty(resourceName, 'resource id');
  return `id:${resourceId(resourceName)}`;
}

/**
 * Resource id narrowed by visible text. Needed for recycler rows that share one
 * resource id (menu entries, product tiles). The anchor is still the resource id;
 * text only picks the row.
 */
export function byIdAndText(resourceName, text) {
  assertNonEmpty(resourceName, 'resource id');
  assertNonEmpty(text, 'text');
  return `android=${uiSelector(resourceName, text)}`;
}

/**
 * Scrolls the first scrollable container until a row with this resource id and
 * text is on screen, then returns it. This is how `scrollToText` avoids
 * coordinate-based swipes that break on different screen sizes.
 */
export function scrollIntoViewByIdAndText(resourceName, text) {
  assertNonEmpty(resourceName, 'resource id');
  assertNonEmpty(text, 'text');
  return (
    'android=new UiScrollable(new UiSelector().scrollable(true))' +
    `.scrollIntoView(${uiSelector(resourceName, text)})`
  );
}

/**
 * A sibling of the row identified by resource id + text, e.g. the tappable image next
 * to a product title. Scrolls it into view first. Still anchored on resource ids only.
 */
export function scrollToSiblingOfIdAndText(resourceName, text, siblingResourceName) {
  assertNonEmpty(resourceName, 'resource id');
  assertNonEmpty(text, 'text');
  assertNonEmpty(siblingResourceName, 'sibling resource id');
  const sibling = `new UiSelector().resourceId("${resourceId(siblingResourceName)}")`;
  return (
    'android=new UiScrollable(new UiSelector().scrollable(true))' +
    `.scrollIntoView(${uiSelector(resourceName, text)}.fromParent(${sibling}))`
  );
}

function uiSelector(resourceName, text) {
  return `new UiSelector().resourceId("${resourceId(resourceName)}").text("${escapeJava(text)}")`;
}

function resourceId(resourceName) {
  return resourceName.includes(':id/') ? resourceName : `${APP_ID}:id/${resourceName}`;
}

/** UiSelector arguments are Java string literals: escape backslashes and quotes. */
export function escapeJava(text) {
  return String(text).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function assertNonEmpty(value, label) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new TypeError(`Locator ${label} must be a non-empty string, got: ${value}`);
  }
}
