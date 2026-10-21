/**
 * Render the two README charts as plain SVG (no plotting dependency):
 *
 *   docs/img/matrix-coverage.svg  automated vs not automated, per case type (from TEST_MATRIX.md)
 *   docs/img/suite-durations.svg  test time per spec file (from reports/junit of the last run)
 *
 * Usage: npm run charts   (run `npm test` first for the durations chart)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MATRIX_PATH, TYPES, parseMatrix } from './matrix.js';
import { parseJunit, totals } from './junit-summary.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const imgDir = path.join(root, 'docs', 'img');

const COLORS = { automated: '#2f6fbd', manual: '#b8c2cc', text: '#1f2328', muted: '#59636e' };
const FONT = 'font-family="Segoe UI, Helvetica, Arial, sans-serif"';

function svg(width, height, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" ${FONT}>
<rect width="100%" height="100%" fill="#ffffff"/>
${body}
</svg>
`;
}

const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');

function horizontalBars({ title, subtitle, rows, unit, stacked }) {
  const left = 170;
  const right = 60;
  const width = 720;
  const barH = 26;
  const gap = 12;
  const top = 70;
  const height = top + rows.length * (barH + gap) + 40;
  const max = Math.max(...rows.map((r) => r.values.reduce((a, b) => a + b, 0)), 1);
  const scale = (width - left - right) / max;
  let body = `<text x="20" y="28" font-size="17" font-weight="600" fill="${COLORS.text}">${esc(title)}</text>
<text x="20" y="50" font-size="12" fill="${COLORS.muted}">${esc(subtitle)}</text>`;
  rows.forEach((row, i) => {
    const y = top + i * (barH + gap);
    body += `<text x="${left - 10}" y="${y + barH / 2 + 4}" font-size="13" text-anchor="end" fill="${COLORS.text}">${esc(row.label)}</text>`;
    let x = left;
    row.values.forEach((value, j) => {
      const w = value * scale;
      if (w > 0) {
        body += `<rect x="${x.toFixed(1)}" y="${y}" width="${w.toFixed(1)}" height="${barH}" fill="${stacked[j].color}" rx="2"/>`;
        if (w > 24) {
          body += `<text x="${(x + w / 2).toFixed(1)}" y="${y + barH / 2 + 4}" font-size="12" text-anchor="middle" fill="${j === 0 ? '#ffffff' : COLORS.text}">${value}${unit}</text>`;
        }
      }
      x += w;
    });
    const total = row.values.reduce((a, b) => a + b, 0);
    body += `<text x="${(x + 6).toFixed(1)}" y="${y + barH / 2 + 4}" font-size="12" fill="${COLORS.muted}">${row.total ?? total + unit}</text>`;
  });
  const legendY = height - 18;
  stacked.forEach((s, j) => {
    const lx = left + j * 150;
    body += `<rect x="${lx}" y="${legendY - 10}" width="12" height="12" fill="${s.color}" rx="2"/><text x="${lx + 18}" y="${legendY}" font-size="12" fill="${COLORS.text}">${esc(s.label)}</text>`;
  });
  return svg(width, height, body);
}

function matrixChart() {
  const rows = parseMatrix(fs.readFileSync(MATRIX_PATH, 'utf8'));
  const automated = rows.filter((r) => r.automated).length;
  return horizontalBars({
    title: 'Regression cases by type',
    subtitle: `${rows.length} cases in docs/TEST_MATRIX.md, ${automated} automated`,
    unit: '',
    stacked: [
      { label: 'automated', color: COLORS.automated },
      { label: 'not automated', color: COLORS.manual },
    ],
    rows: TYPES.map((type) => {
      const ofType = rows.filter((r) => r.type === type);
      const auto = ofType.filter((r) => r.automated).length;
      return { label: type, values: [auto, ofType.length - auto] };
    }),
  });
}

function durationChart() {
  const junitDir = path.join(root, 'reports', 'junit');
  if (!fs.existsSync(junitDir)) {
    return null;
  }
  const suites = fs
    .readdirSync(junitDir)
    .filter((n) => n.endsWith('.xml'))
    .flatMap((n) => parseJunit(fs.readFileSync(path.join(junitDir, n), 'utf8')));
  if (suites.length === 0) {
    return null;
  }
  const t = totals(suites);
  const rows = suites
    .map((s) => {
      const st = totals([s]);
      return {
        label: s.file.replace('.spec.js', ''),
        values: [Math.round(st.seconds)],
        total: `${Math.round(st.seconds)}s (${st.passed}/${st.tests})`,
      };
    })
    .sort((a, b) => b.values[0] - a.values[0]);
  return horizontalBars({
    title: 'Test time per spec file (seconds)',
    subtitle: `Last run: ${t.passed}/${t.tests} passed, total test time ${Math.round(t.seconds / 60)} min`,
    unit: '',
    stacked: [{ label: 'seconds (passed/total tests)', color: COLORS.automated }],
    rows,
  });
}

fs.mkdirSync(imgDir, { recursive: true });
fs.writeFileSync(path.join(imgDir, 'matrix-coverage.svg'), matrixChart());
console.log('Wrote docs/img/matrix-coverage.svg');
const durations = durationChart();
if (durations) {
  fs.writeFileSync(path.join(imgDir, 'suite-durations.svg'), durations);
  console.log('Wrote docs/img/suite-durations.svg');
} else {
  console.log('No JUnit results in reports/junit; skipped the durations chart.');
}
