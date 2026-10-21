/**
 * Pure parsing / comparison helpers. Kept free of WebdriverIO so they can be unit
 * tested without a device, which is where the subtle bugs (float sums, locale-ish
 * price strings) usually hide.
 */

/** "$ 29.99" -> 29.99. Throws on anything that is not a price, so a broken label fails loudly. */
export function parsePrice(text) {
  const match = /^\s*\$\s*(\d+(?:\.\d{1,2})?)\s*$/.exec(String(text));
  if (!match) {
    throw new Error(`Not a price label: "${text}"`);
  }
  return Number(match[1]);
}

/** "3 Items" / "1 Item" -> 3 / 1. */
export function parseItemCount(text) {
  const match = /^\s*(\d+)\s+Items?\s*$/i.exec(String(text));
  if (!match) {
    throw new Error(`Not an item count label: "${text}"`);
  }
  return Number(match[1]);
}

/** Sum money values in integer cents so 3 x 29.99 is 89.97, not 89.97000000000001. */
export function sumMoney(values) {
  const cents = values.reduce((acc, value) => acc + Math.round(value * 100), 0);
  return cents / 100;
}

export function multiplyMoney(price, quantity) {
  return (Math.round(price * 100) * quantity) / 100;
}

/**
 * True when every neighbouring pair satisfies `compare(a, b) <= 0`.
 * Equal neighbours are allowed: many products share a price.
 */
export function isSorted(values, compare) {
  for (let i = 1; i < values.length; i += 1) {
    if (compare(values[i - 1], values[i]) > 0) {
      return false;
    }
  }
  return true;
}

/**
 * The app sorts names with Java's String.compareTo (UTF-16 code units, case-sensitive),
 * so `localeCompare` would disagree on edge cases. Mirror the app, not the browser.
 */
export const byCodeUnits = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
export const ascending = (a, b) => a - b;
export const descending = (a, b) => b - a;
export const reverse = (compare) => (a, b) => compare(b, a);
