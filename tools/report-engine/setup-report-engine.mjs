#!/usr/bin/env node
/**
 * setup-report-engine.mjs
 * Ryze Education — One-Time Machine Setup
 *
 * Installs puppeteer-core (required by export-report-pdf) into
 *   %USERPROFILE%\.ryze-engine\
 * rather than into the Google Drive folder, where npm corrupts package
 * files during extraction.
 *
 * Also verifies Node.js >= 18 and a Chromium browser (Edge / Chrome).
 *
 * Run ONCE per computer. Re-run any time with --force to reinstall.
 *
 * Usage:
 *   node setup-report-engine.mjs
 *   node setup-report-engine.mjs --force    re-installs even if present
 */

import { spawnSync }     from 'child_process';
import fs                from 'fs';
import path              from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FORCE     = process.argv.includes('--force');

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

// ── Local deps directory (outside Google Drive) ───────────────────────────────
const HOME       = process.env['USERPROFILE'] || process.env['HOME'] || '';
const LOCAL_DIR  = path.join(HOME, '.ryze-engine');

// puppeteer-core paths inside LOCAL_DIR
const PC_PKG   = path.join(LOCAL_DIR, 'node_modules', 'puppeteer-core', 'package.json');
const PC_ENTRY = path.join(LOCAL_DIR, 'node_modules', 'puppeteer-core',
                           'lib', 'puppeteer', 'puppeteer-core.js');

// npm command (Windows requires .cmd suffix when not using shell:true)
const NPM = process.platform === 'win32' ? 'npm.cmd' : 'npm';

// ── Browser detection ─────────────────────────────────────────────────────────
function findBrowser() {
  const pf86 = process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)';
  const pf   = process.env['PROGRAMFILES']       || 'C:\\Program Files';
  const lad  = process.env['LOCALAPPDATA']        || '';

  const candidates = [
    // Edge first (pre-installed on Windows 11)
    path.join(pf86, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    path.join(pf,   'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    // Chrome
    path.join(pf,   'Google', 'Chrome', 'Application', 'chrome.exe'),
    path.join(pf86, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    lad && path.join(lad, 'Google', 'Chrome', 'Application', 'chrome.exe'),
  ].filter(Boolean);

  for (const p of candidates) {
    if (fs.existsSync(p)) {
      return { path: p, name: /edge/i.test(p) ? 'Microsoft Edge' : 'Google Chrome' };
    }
  }
  return null;
}

// ── puppeteer-core validity check ─────────────────────────────────────────────
function isPuppeteerValid() {
  if (!fs.existsSync(PC_PKG))             return false;
  if (fs.statSync(PC_PKG).size === 0)     return false;
  if (!fs.existsSync(PC_ENTRY))           return false;
  try {
    const pkg = JSON.parse(fs.readFileSync(PC_PKG, 'utf-8'));
    return typeof pkg.version === 'string' && pkg.version.length > 0;
  } catch {
    return false;
  }
}

// ── Ensure LOCAL_DIR has its own package.json ─────────────────────────────────
function ensureLocalPackageJson() {
  const pkgPath = path.join(LOCAL_DIR, 'package.json');
  if (fs.existsSync(pkgPath)) return;
  fs.writeFileSync(pkgPath, JSON.stringify({
    name:        'ryze-engine-deps',
    version:     '1.0.0',
    private:     true,
    description: 'Local dependencies for the Ryze Education report engine. ' +
                 'Installed here to avoid Google Drive file-write issues.',
    dependencies: { 'puppeteer-core': '*' },
  }, null, 2) + '\n', 'utf-8');
}

// ── Main ──────────────────────────────────────────────────────────────────────
function main() {
  console.log('');
  console.log(LINE);
  console.log(C.bold('  RYZE EDUCATION — One-Time Machine Setup'));
  console.log(LINE);
  console.log('');

  if (!HOME) {
    console.log(`  ${C.red('Error:')} Could not determine user home directory.`);
    console.log(`  USERPROFILE and HOME environment variables are both unset.\n`);
    process.exit(1);
  }

  const results = [];  // { label, pass, note }

  // ── Check 1: Node.js version ─────────────────────────────────────────────
  {
    const ver   = process.versions.node;
    const major = parseInt(ver.split('.')[0], 10);
    const ok    = major >= 18;
    results.push({
      label: 'Node.js',
      pass:  ok,
      note:  ok ? `v${ver}` : `v${ver} — Node.js 18 or later is required. Download from nodejs.org.`,
    });
  }

  // ── Check 2: Local deps directory ────────────────────────────────────────
  {
    if (!fs.existsSync(LOCAL_DIR)) {
      fs.mkdirSync(LOCAL_DIR, { recursive: true });
      console.log(`  Created: ${LOCAL_DIR}`);
    }
    results.push({
      label: 'Local deps folder',
      pass:  true,
      note:  LOCAL_DIR,
    });
  }

  // ── Check 3: puppeteer-core ───────────────────────────────────────────────
  {
    const alreadyValid = !FORCE && isPuppeteerValid();

    if (alreadyValid) {
      const ver = JSON.parse(fs.readFileSync(PC_PKG, 'utf-8')).version;
      results.push({ label: 'puppeteer-core', pass: true, note: `v${ver} — already installed` });
    } else {
      const action = FORCE ? 'Re-installing' : 'Installing';
      console.log(`  ${action} puppeteer-core into ${LOCAL_DIR} ...`);
      console.log('');

      ensureLocalPackageJson();

      const install = spawnSync(
        NPM,
        ['install', 'puppeteer-core', '--omit=optional', '--no-audit', '--no-fund'],
        { cwd: LOCAL_DIR, stdio: 'inherit' }
      );

      console.log('');

      if (install.status !== 0) {
        results.push({
          label: 'puppeteer-core',
          pass:  false,
          note:  'npm install failed. Check your internet connection and try again.',
        });
      } else if (isPuppeteerValid()) {
        const ver = JSON.parse(fs.readFileSync(PC_PKG, 'utf-8')).version;
        results.push({ label: 'puppeteer-core', pass: true, note: `v${ver} — just installed` });
      } else {
        results.push({
          label: 'puppeteer-core',
          pass:  false,
          note:  'Install completed but package cannot be verified. Try running with --force.',
        });
      }
    }
  }

  // ── Check 4: Browser ─────────────────────────────────────────────────────
  {
    const browser = findBrowser();
    if (browser) {
      results.push({ label: 'Browser', pass: true, note: browser.name });
    } else {
      results.push({
        label: 'Browser',
        pass:  false,
        note:  'No Chromium browser found. Install Microsoft Edge or Google Chrome.',
      });
    }
  }

  // ── Print results ─────────────────────────────────────────────────────────
  for (const r of results) {
    const icon = r.pass ? C.green('✓') : C.red('✗');
    console.log(`  ${icon} ${C.bold(r.label.padEnd(22))} ${r.pass ? r.note : C.red(r.note)}`);
  }
  console.log('');

  const allPassed = results.every(r => r.pass);

  // ── Final verdict ─────────────────────────────────────────────────────────
  console.log(LINE);

  if (allPassed) {
    console.log(C.bold(`  ✓  Setup complete — this computer is ready to generate reports.`));
    console.log('');
    console.log(`  Next steps:`);
    console.log(`    node create-new-report.mjs "Student Name"`);
    console.log(`    — fill in all REPLACE — fields —`);
    console.log(`    node export-report-pdf.mjs "students/name/Name - Progress Report.html"`);
  } else {
    const failed = results.filter(r => !r.pass);
    console.log(C.bold(`  ${C.red('✗  Setup incomplete')} — resolve the issue(s) above and run setup again.`));
    console.log('');
    for (const r of failed) {
      console.log(`  ${C.red('→')} ${r.label}: ${r.note}`);
    }
    console.log('');
    console.log(`  Re-run:  ${C.cyan('setup-report-engine.bat')}`);
    console.log(`  Or:      ${C.cyan('node setup-report-engine.mjs')}`);
  }

  console.log(LINE + '\n');
  process.exit(allPassed ? 0 : 1);
}

main();
