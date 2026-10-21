import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as selectors from '../../selectors/index.js';
import {
  APP_ID,
  byA11y,
  byId,
  byIdAndText,
  escapeJava,
  scrollIntoViewByIdAndText,
  scrollToSiblingOfIdAndText,
} from '../../selectors/strategies.js';
import { findXPathViolations } from '../../scripts/check-no-xpath.js';

/** Allowed prefixes: accessibility id, resource id, or UiAutomator anchored on a resource id. */
const ALLOWED = [
  /^~\S/,
  /^id:[\w.]+:id\/\w+$/,
  /^android=new UiSelector\(\)\.resourceId\("[\w.]+:id\/\w+"\)/,
  /^android=new UiScrollable\(new UiSelector\(\)\.scrollable\(true\)\)\.scrollIntoView\(new UiSelector\(\)\.resourceId\("[\w.]+:id\/\w+"\)/,
];

/** Flatten the selector modules into [name, selector] pairs; functions are called with a sample. */
function allSelectors() {
  const out = [];
  const walk = (prefix, value) => {
    if (typeof value === 'string') {
      out.push([prefix, value]);
    } else if (typeof value === 'function') {
      out.push([`${prefix}("Sample")`, value('Sample "quoted" text')]);
    } else if (value && typeof value === 'object') {
      for (const [key, child] of Object.entries(value)) walk(`${prefix}.${key}`, child);
    }
  };
  for (const [name, group] of Object.entries(selectors)) walk(name, group);
  return out;
}

test('every exported selector uses an allowed strategy', () => {
  const all = allSelectors();
  assert.ok(all.length > 50, `expected the full selector set, got ${all.length}`);
  for (const [name, selector] of all) {
    assert.ok(
      ALLOWED.some((re) => re.test(selector)),
      `${name} uses a disallowed strategy: ${selector}`,
    );
  }
});

test('no exported selector would be treated as XPath by WebdriverIO', () => {
  const source = allSelectors()
    .map(([, s], i) => `export const s${i} = ${JSON.stringify(s)};`)
    .join('\n');
  assert.deepEqual(findXPathViolations(source), []);
});

test('no two locators in the same screen group are identical (copy-paste guard)', () => {
  for (const [group, entries] of Object.entries(selectors)) {
    const strings = Object.values(entries).filter((v) => typeof v === 'string');
    assert.equal(new Set(strings).size, strings.length, `duplicate selector in "${group}"`);
  }
});

test('byA11y and byId build the WebdriverIO strategy strings', () => {
  assert.equal(byA11y('View cart'), '~View cart');
  assert.equal(byId('loginBtn'), `id:${APP_ID}:id/loginBtn`);
  assert.equal(byId('android:id/button1'), 'id:android:id/button1');
});

test('builders reject empty input instead of producing a match-anything locator', () => {
  assert.throws(() => byA11y(''), TypeError);
  assert.throws(() => byId('  '), TypeError);
  assert.throws(() => byIdAndText('titleTV', ''), TypeError);
  assert.throws(() => byIdAndText(undefined, 'x'), TypeError);
});

test('text inside UiSelector is escaped as a Java string literal', () => {
  assert.equal(escapeJava('a "b" \\ c'), 'a \\"b\\" \\\\ c');
  const selector = byIdAndText('titleTV', 'Test.allTheThings() "T-Shirt"');
  assert.match(selector, /\.text\("Test\.allTheThings\(\) \\"T-Shirt\\""\)$/);
});

test('scroll selectors wrap the anchored UiSelector in UiScrollable', () => {
  const scroll = scrollIntoViewByIdAndText('titleTV', 'Sauce Labs Onesie');
  assert.ok(scroll.startsWith('android=new UiScrollable('));
  assert.ok(scroll.includes(`resourceId("${APP_ID}:id/titleTV").text("Sauce Labs Onesie")`));

  const sibling = scrollToSiblingOfIdAndText('titleTV', 'Sauce Labs Onesie', 'productIV');
  assert.ok(
    sibling.endsWith(`.fromParent(new UiSelector().resourceId("${APP_ID}:id/productIV")))`),
  );
});
