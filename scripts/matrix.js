/**
 * Keeps docs/TEST_MATRIX.md and the specs in sync.
 *
 *   npm run matrix          rewrite the summary table from the case table
 *   npm run matrix -- --check   exit 1 if the summary is stale (used in CI)
 *
 * A test matrix that drifts from the code is worse than none: people trust the counts.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const MATRIX_PATH = path.join(root, 'docs', 'TEST_MATRIX.md');
export const SPEC_DIR = path.join(root, 'test', 'specs');
export const TYPES = ['UI-only', 'needs-backend', 'manual-only'];
const SUMMARY_START = '<!-- summary:start -->';
const SUMMARY_END = '<!-- summary:end -->';
const ID_PATTERN = /^[A-Z]+-\d{2}$/;

function splitRow(line) {
  return line
    .trim()
    .replace(/^\||\|$/g, '')
    .split('|')
    .map((cell) => cell.trim());
}

/** Parse the case table (the one whose header starts with "ID | Area"). */
export function parseMatrix(markdown) {
  const lines = markdown.split(/\r?\n/);
  const headerIndex = lines.findIndex((line) => /^\|\s*ID\s*\|\s*Area\s*\|/.test(line));
  if (headerIndex === -1) {
    throw new Error('Case table with header "| ID | Area | ..." not found');
  }
  const rows = [];
  for (const line of lines.slice(headerIndex + 2)) {
    if (!line.trim().startsWith('|')) {
      break;
    }
    const [id, area, title, type, automated, specFile] = splitRow(line);
    rows.push({ id, area, title, type, automated: automated === 'yes', specFile });
  }
  return rows;
}

/** Problems with the table itself (ids, types, consistency between columns). */
export function validateRows(rows) {
  const problems = [];
  const seen = new Set();
  for (const row of rows) {
    if (!ID_PATTERN.test(row.id)) problems.push(`${row.id}: id must look like AREA-01`);
    if (seen.has(row.id)) problems.push(`${row.id}: duplicate id`);
    seen.add(row.id);
    if (!TYPES.includes(row.type)) problems.push(`${row.id}: unknown type "${row.type}"`);
    if (row.automated && !row.specFile.startsWith('test/specs/')) {
      problems.push(`${row.id}: automated row needs a spec file`);
    }
    if (!row.automated && row.specFile !== '-') {
      problems.push(`${row.id}: not automated, spec file must be "-"`);
    }
    if (row.type === 'manual-only' && row.automated) {
      problems.push(`${row.id}: manual-only case cannot be automated`);
    }
  }
  return problems;
}

/** Every `it('ID-NN ...')` in the spec folder, with its file and quarantine tag. */
export function collectSpecTests(specDir = SPEC_DIR) {
  const tests = [];
  for (const name of fs.readdirSync(specDir).filter((n) => n.endsWith('.spec.js'))) {
    const source = fs.readFileSync(path.join(specDir, name), 'utf8');
    for (const match of source.matchAll(/\bit\(\s*(['"`])([A-Z]+-\d{2}) ([^'"`]*)\1/g)) {
      tests.push({
        id: match[2],
        title: match[3],
        specFile: `test/specs/${name}`,
        quarantined: match[3].includes('@known-defect'),
      });
    }
  }
  return tests;
}

export function summarize(rows, specTests) {
  const quarantinedIds = new Set(specTests.filter((t) => t.quarantined).map((t) => t.id));
  const count = (predicate) => rows.filter(predicate).length;
  return {
    total: rows.length,
    automated: count((r) => r.automated),
    quarantined: count((r) => r.automated && quarantinedIds.has(r.id)),
    notAutomated: count((r) => !r.automated),
    uiOnly: count((r) => r.type === 'UI-only'),
    needsBackend: count((r) => r.type === 'needs-backend'),
    manualOnly: count((r) => r.type === 'manual-only'),
  };
}

export function renderSummary(s) {
  const header = [
    'Total cases',
    'Automated',
    'of which quarantined',
    'Not automated',
    'UI-only',
    'needs-backend',
    'manual-only',
  ];
  const values = [
    s.total,
    s.automated,
    s.quarantined,
    s.notAutomated,
    s.uiOnly,
    s.needsBackend,
    s.manualOnly,
  ].map(String);
  const widths = header.map((h, i) => Math.max(h.length, values[i].length));
  const row = (cells) => `| ${cells.map((c, i) => c.padEnd(widths[i])).join(' | ')} |`;
  return [row(header), row(widths.map((w) => '-'.repeat(w))), row(values)].join('\n');
}

export function replaceSummary(markdown, summaryTable) {
  const start = markdown.indexOf(SUMMARY_START);
  const end = markdown.indexOf(SUMMARY_END);
  if (start === -1 || end === -1) {
    throw new Error('Summary markers not found');
  }
  return `${markdown.slice(0, start + SUMMARY_START.length)}\n\n${summaryTable}\n\n${markdown.slice(end)}`;
}

function main() {
  const check = process.argv.includes('--check');
  const markdown = fs.readFileSync(MATRIX_PATH, 'utf8');
  const rows = parseMatrix(markdown);
  const problems = validateRows(rows);
  if (problems.length > 0) {
    console.error(problems.join('\n'));
    process.exit(1);
  }
  const updated = replaceSummary(markdown, renderSummary(summarize(rows, collectSpecTests())));
  if (updated === markdown) {
    console.log('TEST_MATRIX.md summary is up to date.');
  } else if (check) {
    console.error('TEST_MATRIX.md summary is stale. Run `npm run matrix`.');
    process.exit(1);
  } else {
    fs.writeFileSync(MATRIX_PATH, updated);
    console.log('TEST_MATRIX.md summary updated.');
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main();
}
