import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseJunit, totals, renderMarkdown, renderHtml } from '../../scripts/junit-summary.js';

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<testsuites tests="3" failures="1" errors="0" skipped="1">
  <testsuite name="Cart" timestamp="2026-01-01T00:00:00" time="30" tests="3" failures="1">
    <properties>
      <property name="file" value="file:///repo/test/specs/cart.spec.js"/>
    </properties>
    <testcase classname="android.Cart" name="CART-01 updates the badge" time="10.5"/>
    <testcase classname="android.Cart" name="CART-02 totals &quot;line&quot; prices" time="12">
      <failure message="expected 59.98"/>
      <system-out><![CDATA[log]]></system-out>
    </testcase>
    <testcase classname="android.Cart" name="CART-03 skipped one" time="0">
      <skipped/>
    </testcase>
  </testsuite>
</testsuites>`;

test('parseJunit reads suites, statuses, times and the spec file name', () => {
  const [suite] = parseJunit(xml);
  assert.equal(suite.suite, 'Cart');
  assert.equal(suite.file, 'cart.spec.js');
  assert.deepEqual(
    suite.tests.map((t) => [t.name, t.status, t.time]),
    [
      ['CART-01 updates the badge', 'passed', 10.5],
      ['CART-02 totals "line" prices', 'failed', 12],
      ['CART-03 skipped one', 'skipped', 0],
    ],
  );
});

test('totals and markdown report the counts', () => {
  const suites = parseJunit(xml);
  assert.deepEqual(totals(suites), { tests: 3, passed: 1, failed: 1, skipped: 1, seconds: 22.5 });
  const md = renderMarkdown(suites);
  assert.match(md, /\*\*1\/3 passed\*\*, 1 failed, 1 skipped/);
  assert.match(md, /\| Cart \| cart\.spec\.js \| 3 \| 1 \| 1 \|/);
});

test('html output escapes test names', () => {
  const html = renderHtml([
    { suite: 'S', file: 'f.js', tests: [{ name: '<b>x</b>', time: 1, status: 'passed' }] },
  ]);
  assert.ok(html.includes('&lt;b&gt;x&lt;/b&gt;'));
  assert.ok(!html.includes('<b>x</b>'));
});
