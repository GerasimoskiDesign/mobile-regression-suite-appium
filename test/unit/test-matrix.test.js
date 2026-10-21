import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  MATRIX_PATH,
  parseMatrix,
  validateRows,
  collectSpecTests,
  summarize,
  renderSummary,
  replaceSummary,
} from '../../scripts/matrix.js';

const markdown = fs.readFileSync(MATRIX_PATH, 'utf8');
const rows = parseMatrix(markdown);
const specTests = collectSpecTests();

test('matrix rows are well formed', () => {
  assert.ok(rows.length >= 30);
  assert.deepEqual(validateRows(rows), []);
});

test('every automated row exists as a test in the named spec file', () => {
  const bySpec = new Map(specTests.map((t) => [t.id, t.specFile]));
  for (const row of rows.filter((r) => r.automated)) {
    assert.equal(bySpec.get(row.id), row.specFile, `${row.id} not found in ${row.specFile}`);
  }
});

test('every test in the specs has a matrix row marked automated', () => {
  const automated = new Set(rows.filter((r) => r.automated).map((r) => r.id));
  for (const t of specTests) {
    assert.ok(automated.has(t.id), `${t.id} (${t.specFile}) is missing from TEST_MATRIX.md`);
  }
});

test('test ids are unique across all spec files', () => {
  const ids = specTests.map((t) => t.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('quarantined tests are documented as known defects', () => {
  for (const t of specTests.filter((s) => s.quarantined)) {
    const row = rows.find((r) => r.id === t.id);
    assert.match(row.title, /KNOWN-\d{2}/, `${t.id} is quarantined but its row names no defect`);
  }
});

test('the summary table matches the case table', () => {
  const expected = replaceSummary(markdown, renderSummary(summarize(rows, specTests)));
  assert.equal(markdown, expected, 'summary is stale: run `npm run matrix`');
});

test('validateRows catches the mistakes it is meant to catch', () => {
  const bad = [
    { id: 'X-1', type: 'UI-only', automated: false, specFile: '-' },
    { id: 'PAY-01', type: 'manual-only', automated: true, specFile: 'test/specs/a.spec.js' },
    { id: 'PAY-01', type: 'UI-only', automated: false, specFile: '-' },
    { id: 'PAY-02', type: 'backend', automated: true, specFile: '-' },
  ];
  const problems = validateRows(bad).join('\n');
  assert.match(problems, /X-1: id must look like/);
  assert.match(problems, /PAY-01: manual-only case cannot be automated/);
  assert.match(problems, /PAY-01: duplicate id/);
  assert.match(problems, /PAY-02: unknown type/);
  assert.match(problems, /PAY-02: automated row needs a spec file/);
});
