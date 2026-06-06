/**
 * lint-no-hardcoded-people.mjs
 *
 * Guards against hardcoded fixture people re-appearing in the codebase.
 * Scans pages/ and components/ for:
 *   • The constant name TEAM_MEMBERS (signals a re-introduced static array)
 *   • Known fixture names that must never appear in production frontend code
 *
 * Run via:   node scripts/lint-no-hardcoded-people.mjs
 * npm alias: npm run lint:fixtures
 */

import { readdirSync, statSync, readFileSync } from 'fs';
import { join } from 'path';

// ── Patterns that must not appear in frontend source files ──────────────────

const BANNED_PATTERNS = [
  // Static team member array re-introduced in SettingsPage
  { pattern: /\bconst\s+TEAM_MEMBERS\b/,   reason: 'Hardcoded TEAM_MEMBERS constant — use the /api/admin/team endpoint instead.' },
  // Known fixture names from the original hardcoded array
  { pattern: /['"]Daniel Kwok['"]/,         reason: "Fixture name 'Daniel Kwok' — this person is not in the real database." },
  { pattern: /['"]Priya Aiyar['"]/,         reason: "Fixture name 'Priya Aiyar' — not a real team member." },
  { pattern: /['"]Sarah Tran['"]/,          reason: "Fixture name 'Sarah Tran' — not a real team member." },
];

const SCAN_DIRS = ['pages', 'components'];

function skip(fullPath) {
  return fullPath.includes('node_modules') || fullPath.includes('dist') || fullPath.endsWith('.min.js');
}

function scanDir(dir) {
  let hasErrors = false;
  let entries;
  try { entries = readdirSync(dir); } catch { return false; }

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    if (skip(fullPath)) continue;

    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      hasErrors = scanDir(fullPath) || hasErrors;
    } else if (/\.(tsx?|jsx?)$/.test(fullPath)) {
      const content = readFileSync(fullPath, 'utf8');
      const lines   = content.split('\n');
      for (const { pattern, reason } of BANNED_PATTERNS) {
        lines.forEach((line, idx) => {
          if (pattern.test(line)) {
            console.error(`\x1b[31mError:\x1b[0m Hardcoded fixture detected in ${fullPath}:${idx + 1}`);
            console.error(`  --> \x1b[33m${line.trim()}\x1b[0m`);
            console.error(`  Reason: \x1b[31m${reason}\x1b[0m\n`);
            hasErrors = true;
          }
        });
      }
    }
  }
  return hasErrors;
}

let overallError = false;
for (const dir of SCAN_DIRS) {
  console.log(`\x1b[36mScanning:\x1b[0m ${dir}`);
  overallError = scanDir(dir) || overallError;
}

if (overallError) {
  console.error('\n\x1b[31m[Fixtures Lint Failed]\x1b[0m Hardcoded people/fixture data detected. Remove it and wire to a real API endpoint.');
  process.exit(1);
} else {
  console.log('\n\x1b[32m[Fixtures Lint Passed]\x1b[0m No hardcoded fixture people found.');
  process.exit(0);
}
