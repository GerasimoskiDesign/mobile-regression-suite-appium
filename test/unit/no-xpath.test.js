import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findXPathViolations, scanProject } from '../../scripts/check-no-xpath.js';

const rulesHit = (source) => findXPathViolations(source).map((v) => v.rule);

test('flags explicit XPath locators', () => {
  assert.ok(rulesHit(`$('//android.widget.Button[@text="Login"]')`).includes('double-slash'));
  assert.ok(rulesHit(`$('(//android.widget.TextView)[2]')`).includes('double-slash'));
  assert.ok(rulesHit(`$('/hierarchy/android.widget.FrameLayout')`).includes('absolute-path'));
  assert.ok(rulesHit(`const s = { using: 'xpath', value: 'x' };`).includes('xpath-keyword'));
  assert.ok(rulesHit(`$('*[@content-desc="Cart"]')`).includes('attribute-predicate'));
});

test('flags strings WebdriverIO silently converts to XPath', () => {
  assert.ok(rulesHit(`$('android.widget.Button')`).includes('implicit-class-xpath'));
});

test('flags XPath hidden in template literals', () => {
  const source = 'const name = "x"; $(`//*[@text="${name}"]`);';
  assert.ok(rulesHit(source).includes('double-slash'));
});

test('ignores comments, URLs, imports and allowed strategies', () => {
  const source = [
    '// Comments with // slashes and the word xpath are fine.',
    '/* block comment: //android.widget.Button */',
    "import x from '../selectors/index.js';",
    "const docs = 'https://webdriver.io/docs/selectors';",
    "$('~View cart');",
    "$('id:com.example:id/loginBtn');",
    `$('android=new UiSelector().resourceId("com.example:id/titleTV").text("A")');`,
    'const re = /\\/\\/xpath/;',
  ].join('\n');
  assert.deepEqual(findXPathViolations(source), []);
});

test('reports file, line and column of each violation', () => {
  const [violation] = findXPathViolations("const a = 1;\nconst b = '//x';\n", 'pages/X.js');
  assert.equal(violation.file, 'pages/X.js');
  assert.equal(violation.line, 2);
  assert.equal(violation.column, 11);
});

test('the real project is XPath-free', () => {
  const { files, violations } = scanProject();
  assert.ok(files.length > 15, 'scan should cover selectors, pages, helpers, specs and config');
  assert.deepEqual(violations, []);
});
