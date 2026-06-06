#!/usr/bin/env node
/**
 * export-report-pdf.mjs
 * Ryze Education — Validated PDF Exporter
 *
 * Validates a completed student report, then exports it to PDF using the
 * installed Edge or Chrome browser via Puppeteer. The PDF is saved to
 * generated-reports/ with a clean, dated filename.
 *
 * Usage:
 *   node export-report-pdf.mjs "students/jane-smith/Jane Smith - Progress Report.html"
 *
 * PDF export requires puppeteer-core (installed to ~/.ryze-engine/).
 * If not present, the script prints setup instructions and exits.
 *
 * Workflow:
 *   create-new-report  →  fill REPLACE fields  →  validate-report  →  export-report-pdf  →  open PDF for visual check
 */

import { spawnSync }              from 'child_process';
import vm                         from 'vm';
import fs                         from 'fs';
import path                       from 'path';
import readline                   from 'readline';
import { fileURLToPath,
         pathToFileURL }          from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Colour helpers ────────────────────────────────────────────────────────────
const C = {
  red:    s => `\x1b[31m${s}\x1b[0m`,
  green:  s => `\x1b[32m${s}\x1b[0m`,
  yellow: s => `\x1b[33m${s}\x1b[0m`,
  cyan:   s => `\x1b[36m${s}\x1b[0m`,
  bold:   s => `\x1b[1m${s}\x1b[0m`,
  dim:    s => `\x1b[2m${s}\x1b[0m`,
};
const LINE = C.bold('═'.repeat(61));

// ── Paths ─────────────────────────────────────────────────────────────────────
const OUT_DIR    = path.join(__dirname, 'generated-reports');
const VALIDATE   = path.join(__dirname, 'validate-report.mjs');

// puppeteer-core is installed to ~/.ryze-engine to avoid Google Drive
// file-corruption issues. The engine node_modules is tried as a fallback.
const HOME       = process.env['USERPROFILE'] || process.env['HOME'] || '';
const LOCAL_P    = path.join(HOME, '.ryze-engine', 'node_modules', 'puppeteer-core',
                             'lib', 'puppeteer', 'puppeteer-core.js');
const ENGINE_P   = path.join(__dirname, 'node_modules', 'puppeteer-core',
                             'lib', 'puppeteer', 'puppeteer-core.js');

// ── Browser detection ─────────────────────────────────────────────────────────
function findBrowser() {
  const pf86 = process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)';
  const pf   = process.env['PROGRAMFILES']       || 'C:\\Program Files';
  const lad  = process.env['LOCALAPPDATA']        || '';

  const candidates = [
    path.join(pf,   'Google', 'Chrome', 'Application', 'chrome.exe'),
    path.join(pf86, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    lad && path.join(lad, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    path.join(pf86, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    path.join(pf,   'Microsoft', 'Edge', 'Application', 'msedge.exe'),
  ].filter(Boolean);

  return candidates.find(p => fs.existsSync(p)) || null;
}

// ── puppeteer-core loader ─────────────────────────────────────────────────────
/**
 * Tries to load puppeteer-core from:
 *   1. ~/.ryze-engine/node_modules/  (stable local install, immune to cloud issues)
 *   2. <engine-dir>/node_modules/     (fallback)
 * Returns the default export (the Puppeteer object) or null if not found.
 */
async function loadPuppeteer() {
  for (const entryPath of [LOCAL_P, ENGINE_P]) {
    if (!fs.existsSync(entryPath)) continue;
    // Quick sanity: make sure the package.json is non-empty before importing
    const pkgJson = path.join(path.dirname(entryPath), '..', '..', 'package.json');
    if (fs.existsSync(pkgJson) && fs.statSync(pkgJson).size === 0) continue;
    try {
      const mod = await import(pathToFileURL(entryPath).href);
      return mod.default ?? mod;
    } catch { /* try next */ }
  }
  return null;
}

// ── Placeholder detection (mirrors validate-report.mjs) ──────────────────────
function isPlaceholder(val) {
  if (typeof val !== 'string') return false;
  if (/REPLACE/i.test(val))   return true;
  if (/^\s*$/.test(val))      return true;
  if (/^DD\s+(Mon|Month)\s+YYYY$/i.test(val.trim())) return true;
  return false;
}

// ── REPORT extraction (mirrors validate-report.mjs) ──────────────────────────
function extractReport(html) {
  const blocks = [];
  const re = /<script(?![^>]*\bsrc\b)[^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const body = m[1].trim();
    if (body) blocks.push(body);
  }
  if (blocks.length === 0) throw new Error('No inline <script> block found.');
  const script = blocks.join('\n').replace(/\b(?:const|let|var)\s+(REPORT)\b/g, '$1');
  const sandbox = { window: { __resources: {} }, REPORT: undefined };
  vm.createContext(sandbox);
  vm.runInContext(script, sandbox, { timeout: 5000 });
  if (!sandbox.REPORT || typeof sandbox.REPORT !== 'object') {
    throw new Error('REPORT variable not found after evaluating the script.');
  }
  return sandbox.REPORT;
}

// ── Safe filename helper ──────────────────────────────────────────────────────
function safeFilename(s) {
  return String(s).replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, ' ').trim();
}

// ── Interactive prompt ────────────────────────────────────────────────────────
function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, a => { rl.close(); resolve(a.trim()); }));
}

// ── PDF page count from raw binary ───────────────────────────────────────────
function countPdfPages(pdfPath) {
  const buf = fs.readFileSync(pdfPath, 'latin1');
  const m   = buf.match(/\/Type\s*\/Page[^s]/g);
  return m ? m.length : null;
}

// ── Render-complete gate (same pattern as the validation script) ──────────────
async function waitForRender(page) {
  await page.waitForFunction(() => {
    const pages = document.querySelectorAll('#report-root .page').length;
    const chart = document.querySelector('#trend polyline, svg polyline');
    return pages >= 3 && !!chart;
  }, { timeout: 15000 });
  await page.evaluateHandle(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 700));  // extra settle for async paint
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('');
  console.log(LINE);
  console.log(C.bold('  RYZE EDUCATION — Validated PDF Exporter'));
  console.log(LINE);
  console.log('');

  // ── Argument ────────────────────────────────────────────────────────────────
  const arg = process.argv[2];
  if (!arg || arg === '--help' || arg === '-h') {
    if (!arg) console.log(`  ${C.red('Error:')} No file path supplied.\n`);
    console.log(`  Usage:   node export-report-pdf.mjs "<path-to-report.html>"`);
    console.log(`  Example: node export-report-pdf.mjs "students/jane-smith/Jane Smith - Progress Report.html"\n`);
    process.exit(arg ? 0 : 1);
  }

  // ── Resolve and sanity-check the HTML file ───────────────────────────────────
  const htmlPath    = path.isAbsolute(arg) ? arg : path.resolve(__dirname, arg);
  const displayHtml = path.relative(__dirname, htmlPath).replace(/\\/g, '/');

  console.log(`  Report:  ${C.cyan(displayHtml)}`);

  if (!fs.existsSync(htmlPath)) {
    console.log(`\n  ${C.red('Error:')} File not found.\n  ${htmlPath}\n`);
    process.exit(1);
  }

  if (/[/\\]_template[/\\]/i.test(htmlPath)) {
    console.log(`\n  ${C.red('Error:')} This is the master template — it cannot be exported.\n`);
    process.exit(1);
  }

  // ── Extract REPORT object for filename generation ────────────────────────────
  let R;
  try {
    R = extractReport(fs.readFileSync(htmlPath, 'utf-8'));
  } catch (e) {
    console.log(`\n  ${C.red('Error: Could not read the REPORT object.')}`);
    console.log(`  ${e.message}\n`);
    process.exit(1);
  }

  // ── Build PDF output filename ────────────────────────────────────────────────
  // Student name — use REPORT.student if valid, otherwise fall back to folder name
  const studentName = (R.student && !isPlaceholder(R.student))
    ? R.student
    : safeFilename(path.basename(path.dirname(htmlPath)));

  // Term stamp — use REPORT.period.stamp if valid, otherwise prompt
  let termStamp = (R.period?.stamp && !isPlaceholder(R.period.stamp))
    ? R.period.stamp.replace(/\s+/g, ' ').trim()
    : '';

  if (!termStamp) {
    console.log(`  ${C.yellow('⚠')} period.stamp is not yet set in this report.`);
    termStamp = await ask(`  Enter term and year for the PDF filename (e.g. T2 2026): `);
    if (!termStamp.trim()) termStamp = new Date().getFullYear().toString();
    console.log('');
  }

  const pdfName    = `${safeFilename(studentName)} - Progress Report - ${safeFilename(termStamp)}.pdf`;
  const pdfPath    = path.join(OUT_DIR, pdfName);
  const displayPdf = `generated-reports/${pdfName}`;

  console.log(`  Output:  ${C.cyan(displayPdf)}`);
  console.log('');

  // ── Overwrite guard ──────────────────────────────────────────────────────────
  if (fs.existsSync(pdfPath)) {
    const sizeKB = Math.round(fs.statSync(pdfPath).size / 1024);
    console.log(`  ${C.yellow('⚠')} PDF already exists (${sizeKB} KB): ${displayPdf}`);
    const confirm = await ask(`  Overwrite existing PDF? [y/N] `);
    console.log('');
    if (!/^y(es)?$/i.test(confirm)) {
      console.log(`  Cancelled — no files were changed.`);
      console.log('');
      console.log(LINE + '\n');
      process.exit(0);
    }
  }

  // ══════════════════════════════════════════════════════════
  // Step 1 — Validation
  // ══════════════════════════════════════════════════════════
  console.log(C.bold(`  ── Step 1 of 2: Validation ${'─'.repeat(28)}`));
  console.log('');

  const relPath    = path.relative(__dirname, htmlPath).replace(/\\/g, '/');
  const validation = spawnSync(
    process.execPath,
    [VALIDATE, relPath],
    { stdio: 'inherit', cwd: __dirname }
  );

  if (validation.error) {
    console.log(`\n  ${C.red('Error:')} Could not run validate-report.mjs.`);
    console.log(`  ${validation.error.message}\n`);
    process.exit(1);
  }

  if (validation.status !== 0) {
    console.log('');
    console.log(LINE);
    console.log(`  ${C.red(C.bold('✗  PDF export blocked — validation failed.'))}`);
    console.log('');
    console.log(`  Fix every ${C.red('✗')} issue listed above, save the file,`);
    console.log(`  then run this script again.`);
    console.log(LINE + '\n');
    process.exit(1);
  }

  // ══════════════════════════════════════════════════════════
  // Step 2 — PDF Export
  // ══════════════════════════════════════════════════════════
  console.log('');
  console.log(C.bold(`  ── Step 2 of 2: PDF Export ${'─'.repeat(29)}`));
  console.log('');

  // ── Browser ───────────────────────────────────────────────
  const browserExe  = findBrowser();
  if (!browserExe) {
    console.log(`  ${C.red('Error:')} No Chromium-based browser found (checked Chrome and Edge).`);
    console.log(`  Install Google Chrome or Microsoft Edge, then try again.\n`);
    process.exit(1);
  }
  const browserName = /edge/i.test(browserExe) ? 'Microsoft Edge' : 'Google Chrome';
  console.log(`  Browser:  ${browserName}`);

  // ── Load puppeteer-core ───────────────────────────────────
  const puppeteer = await loadPuppeteer();
  if (!puppeteer) {
    console.log('');
    console.log(`  ${C.red('Error:')} puppeteer-core is not installed.`);
    console.log(`  Run the one-time setup script first:`);
    console.log('');
    console.log(`  ${C.cyan('setup-report-engine.bat')}   (or: node setup-report-engine.mjs)`);
    console.log('');
    console.log(`  Then run this script again.\n`);
    console.log(LINE + '\n');
    process.exit(1);
  }

  // ── Ensure output directory exists ───────────────────────
  fs.mkdirSync(OUT_DIR, { recursive: true });

  // ── Launch, render, export ────────────────────────────────
  console.log(`  Launching headless browser...`);

  const browser = await puppeteer.launch({
    executablePath: browserExe,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage',
           '--font-render-hinting=none'],
  });

  let pdfExported = false;
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 900, height: 1100 });

    const fileUrl = pathToFileURL(htmlPath).href;
    process.stdout.write(`  Rendering report`);
    await page.goto(fileUrl, { waitUntil: 'networkidle2', timeout: 20000 });
    process.stdout.write('.');

    await waitForRender(page);
    process.stdout.write('. done\n');

    // Get rendered page count for the summary
    const renderedPages = await page.evaluate(() =>
      document.querySelectorAll('#report-root .page').length
    );

    process.stdout.write(`  Exporting PDF`);
    await page.pdf({
      path:              pdfPath,
      format:            'A4',
      margin:            { top: 0, right: 0, bottom: 0, left: 0 },
      printBackground:   true,
      preferCSSPageSize: false,
    });
    process.stdout.write('. done\n');
    pdfExported = true;

    await page.close();
  } finally {
    await browser.close();
  }

  if (!pdfExported || !fs.existsSync(pdfPath)) {
    console.log(`\n  ${C.red('Error:')} PDF was not created. Check browser permissions or disk space.\n`);
    process.exit(1);
  }

  // ── Results ───────────────────────────────────────────────
  const sizeKB    = Math.round(fs.statSync(pdfPath).size / 1024);
  const pageCount = countPdfPages(pdfPath) ?? '?';

  console.log('');
  console.log(LINE);
  console.log(C.bold('  ✓  Export complete'));
  console.log(LINE);
  console.log('');
  console.log(`  ${C.green('✓')} Validation  passed`);
  console.log(`  ${C.green('✓')} Pages       ${pageCount}`);
  console.log(`  ${C.green('✓')} File size   ${sizeKB} KB`);
  console.log(`  ${C.green('✓')} Saved to    ${C.cyan(displayPdf)}`);
  console.log('');
  console.log(C.yellow(`  ⚠  Open the PDF and check every page visually before`));
  console.log(C.yellow(`     sending to parents. Automated export does not replace`));
  console.log(C.yellow(`     a manual review of the finished document.`));
  console.log('');
  console.log(`  Full path:`);
  console.log(`  ${C.dim(pdfPath)}`);
  console.log('');
  console.log(LINE + '\n');
}

main().catch(e => {
  console.error(`\n  ${C.red('Unexpected error:')} ${e.message}\n`);
  process.exit(1);
});
