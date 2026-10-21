/**
 * Timeouts in one place. CI emulators run without hardware acceleration for the
 * GPU and are noticeably slower than a local device, so everything scales with
 * TIMEOUT_FACTOR instead of being tuned test by test.
 */
const factor = Number(process.env.TIMEOUT_FACTOR || 1) || 1;

export const timeouts = {
  /** Normal wait for an element that should be there. */
  element: Math.round(10_000 * factor),
  /** Wait after an app (re)start until the first screen is drawn. */
  appStart: Math.round(30_000 * factor),
  /** Scrolling a long list with UiScrollable. */
  scroll: Math.round(20_000 * factor),
  /** Short probe for "is this on screen right now?" checks. */
  probe: Math.round(2_000 * factor),
};
