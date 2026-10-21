/**
 * Fails the build if an XPath locator appears anywhere in the suite code.
 *
 * Why a dedicated check instead of a code-review rule: XPath creeps in when someone is
 * in a hurry ("just copy it from Appium Inspector"). Each one couples a test to the
 * view hierarchy and is the slowest strategy on UiAutomator2. A failing CI job is a
 * better reminder than a comment in a review.
 *
 * The check parses each file with espree (ESLint's parser) and inspects only string
 * literals and template strings, so `// comments` never trigger it.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as espree from 'espree';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Folders that contain locators or code that uses them. Unit tests and this script are excluded on purpose. */
export const SCANNED_DIRS = ['selectors', 'pages', 'helpers', 'test/specs', 'config', 'data'];

/**
 * Each rule describes one way XPath can enter a WebdriverIO + Appium project.
 * WebdriverIO treats strings starting with "/", "(" or "android.widget." as XPath
 * implicitly, so those prefixes are banned too, not just the word "xpath".
 */
export const RULES = [
  { id: 'xpath-keyword', test: (s) => /xpath/i.test(s), message: 'mentions "xpath"' },
  {
    id: 'double-slash',
    // "//node" but not "https://host": the character before "//" must not be ":".
    test: (s) => /(^|[^:])\/\/[A-Za-z*@.(]/.test(s),
    message: 'contains an XPath "//" axis',
  },
  {
    id: 'absolute-path',
    test: (s) => /^\s*\(*\s*\/[A-Za-z*]/.test(s),
    message: 'starts like an absolute XPath ("/hierarchy", "(/...")',
  },
  {
    id: 'attribute-predicate',
    test: (s) => /\[\s*@[\w-]+/.test(s),
    message: 'contains an XPath attribute predicate "[@...]"',
  },
  {
    id: 'implicit-class-xpath',
    test: (s) => /^\s*android\.(widget|view)\./.test(s),
    message: 'starts with an Android class name, which WebdriverIO turns into XPath',
  },
];

function* stringNodes(node) {
  if (!node || typeof node !== 'object') {
    return;
  }
  if (Array.isArray(node)) {
    for (const child of node) {
      yield* stringNodes(child);
    }
    return;
  }
  if (node.type === 'Literal' && typeof node.value === 'string') {
    yield { value: node.value, loc: node.loc };
  } else if (node.type === 'TemplateElement') {
    yield { value: node.value.cooked ?? node.value.raw, loc: node.loc };
  }
  for (const [key, child] of Object.entries(node)) {
    if (key !== 'loc' && key !== 'range' && child && typeof child === 'object') {
      yield* stringNodes(child);
    }
  }
}

/**
 * @param {string} source JavaScript source code
 * @param {string} [file] label used in the returned violations
 * @returns {{file: string, line: number, column: number, rule: string, message: string, value: string}[]}
 */
export function findXPathViolations(source, file = '<source>') {
  const ast = espree.parse(source, { ecmaVersion: 'latest', sourceType: 'module', loc: true });
  const violations = [];
  for (const { value, loc } of stringNodes(ast)) {
    for (const rule of RULES) {
      if (rule.test(value)) {
        violations.push({
          file,
          line: loc.start.line,
          column: loc.start.column + 1,
          rule: rule.id,
          message: rule.message,
          value,
        });
      }
    }
  }
  return violations;
}

export function listJsFiles(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...listJsFiles(full));
    } else if (/\.(c|m)?js$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

export function scanProject(projectRoot = root) {
  const files = SCANNED_DIRS.flatMap((dir) => listJsFiles(path.join(projectRoot, dir)));
  const violations = files.flatMap((file) =>
    findXPathViolations(
      fs.readFileSync(file, 'utf8'),
      path.relative(projectRoot, file).split(path.sep).join('/'),
    ),
  );
  return { files, violations };
}

function main() {
  const { files, violations } = scanProject();
  if (violations.length > 0) {
    for (const v of violations) {
      console.error(`${v.file}:${v.line}:${v.column}  ${v.message}  ${JSON.stringify(v.value)}`);
    }
    console.error(
      `\nNo-XPath check FAILED: ${violations.length} violation(s). Use selectors/strategies.js.`,
    );
    process.exit(1);
  }
  console.log(`No-XPath check passed: ${files.length} files scanned, 0 XPath locators.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main();
}
