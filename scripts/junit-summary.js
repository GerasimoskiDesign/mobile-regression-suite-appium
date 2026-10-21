/**
 * Turn the JUnit XML files in reports/junit into a readable run summary:
 *
 *   reports/summary.md    (also appended to the GitHub Actions job summary in CI)
 *   reports/summary.html  (self-contained page; the README screenshot is taken from it)
 *
 * Exits 1 if no results were found, so a CI run that silently executed nothing is red.
 * A regex parser is enough here: the reporter's output format is fixed and simple, and
 * it avoids an XML dependency for one script.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const reportsDir = path.join(root, 'reports');

const attr = (tag, name) => {
  const match = new RegExp(`\\b${name}="([^"]*)"`).exec(tag);
  return match ? decodeEntities(match[1]) : '';
};

function decodeEntities(text) {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

/** @returns {{suite: string, file: string, tests: {name: string, time: number, status: string}[]}[]} */
export function parseJunit(xml) {
  const suites = [];
  for (const suiteMatch of xml.matchAll(/<testsuite\b[^>]*>([\s\S]*?)<\/testsuite>/g)) {
    const openTag = /<testsuite\b[^>]*>/.exec(suiteMatch[0])[0];
    const body = suiteMatch[1];
    const fileProp = /<property name="file" value="([^"]*)"/.exec(body);
    const tests = [];
    for (const caseMatch of body.matchAll(/<testcase\b[^>]*?(?:\/>|>([\s\S]*?)<\/testcase>)/g)) {
      const tag = /<testcase\b[^>]*>/.exec(caseMatch[0])[0];
      const inner = caseMatch[1] ?? '';
      const status = /<(failure|error)\b/.test(inner)
        ? 'failed'
        : /<skipped\b/.test(inner)
          ? 'skipped'
          : 'passed';
      tests.push({ name: attr(tag, 'name'), time: Number(attr(tag, 'time')) || 0, status });
    }
    suites.push({
      suite: attr(openTag, 'name'),
      file: fileProp ? path.basename(decodeEntities(fileProp[1])) : '',
      tests,
    });
  }
  return suites;
}

export function totals(suites) {
  const all = suites.flatMap((s) => s.tests);
  const count = (status) => all.filter((t) => t.status === status).length;
  return {
    tests: all.length,
    passed: count('passed'),
    failed: count('failed'),
    skipped: count('skipped'),
    seconds: all.reduce((acc, t) => acc + t.time, 0),
  };
}

const fmtTime = (seconds) => `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;

export function renderMarkdown(suites, meta = {}) {
  const t = totals(suites);
  const lines = [
    '## Android regression run',
    '',
    meta.subtitle ? `${meta.subtitle}\n` : '',
    `**${t.passed}/${t.tests} passed**, ${t.failed} failed, ${t.skipped} skipped, test time ${fmtTime(t.seconds)}`,
    '',
    '| Suite | Spec file | Tests | Passed | Failed | Time |',
    '| ----- | --------- | ----- | ------ | ------ | ---- |',
    ...suites.map((s) => {
      const st = totals([s]);
      return `| ${s.suite} | ${s.file} | ${st.tests} | ${st.passed} | ${st.failed} | ${fmtTime(st.seconds)} |`;
    }),
    '',
  ];
  return lines.filter((line, i) => line !== '' || lines[i - 1] !== '').join('\n');
}

const escapeHtml = (text) =>
  String(text).replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c],
  );

export function renderHtml(suites, meta = {}) {
  const t = totals(suites);
  const rows = suites
    .map((s) => {
      const tests = s.tests
        .map(
          (test) =>
            `<tr class="${test.status}"><td class="status">${test.status === 'passed' ? '&#10003;' : test.status === 'failed' ? '&#10007;' : '&#8211;'}</td><td>${escapeHtml(test.name)}</td><td class="num">${test.time.toFixed(1)}s</td></tr>`,
        )
        .join('');
      return `<tr class="suite"><td></td><td>${escapeHtml(s.suite)} <span class="file">${escapeHtml(s.file)}</span></td><td></td></tr>${tests}`;
    })
    .join('');
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Regression run summary</title>
<style>
body{font-family:Segoe UI,Helvetica,Arial,sans-serif;margin:24px;color:#1f2328;background:#fff}
h1{font-size:20px;margin:0 0 4px}.sub{color:#59636e;margin:0 0 16px;font-size:13px}
.kpis{display:flex;gap:12px;margin-bottom:16px}.kpi{border:1px solid #d1d9e0;border-radius:6px;padding:8px 14px}
.kpi b{display:block;font-size:22px}.kpi span{font-size:12px;color:#59636e}
table{border-collapse:collapse;width:100%;font-size:13px}td{padding:3px 8px;border-bottom:1px solid #eef1f4}
tr.suite td{font-weight:600;background:#f6f8fa;padding-top:8px}.file{font-weight:400;color:#59636e;font-size:12px}
td.status{width:18px;text-align:center}tr.passed td.status{color:#1a7f37}tr.failed td.status{color:#cf222e}
td.num{text-align:right;color:#59636e;width:60px}
</style></head><body>
<h1>Android regression run</h1>
<p class="sub">${escapeHtml(meta.subtitle || '')}</p>
<div class="kpis">
<div class="kpi"><b>${t.tests}</b><span>tests</span></div>
<div class="kpi"><b style="color:#1a7f37">${t.passed}</b><span>passed</span></div>
<div class="kpi"><b style="color:${t.failed ? '#cf222e' : '#1f2328'}">${t.failed}</b><span>failed</span></div>
<div class="kpi"><b>${fmtTime(t.seconds)}</b><span>test time</span></div>
</div>
<table>${rows}</table>
</body></html>
`;
}

function main() {
  const junitDir = path.join(reportsDir, 'junit');
  const files = fs.existsSync(junitDir)
    ? fs.readdirSync(junitDir).filter((name) => name.endsWith('.xml'))
    : [];
  const suites = files
    .flatMap((name) => parseJunit(fs.readFileSync(path.join(junitDir, name), 'utf8')))
    .sort((a, b) => a.file.localeCompare(b.file));
  if (suites.length === 0) {
    console.error('No JUnit results found in reports/junit. Did the suite run?');
    process.exit(1);
  }
  const meta = { subtitle: process.env.RUN_SUBTITLE || '' };
  const markdown = renderMarkdown(suites, meta);
  fs.writeFileSync(path.join(reportsDir, 'summary.md'), `${markdown}\n`);
  fs.writeFileSync(path.join(reportsDir, 'summary.html'), renderHtml(suites, meta));
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${markdown}\n`);
  }
  console.log(markdown);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main();
}
