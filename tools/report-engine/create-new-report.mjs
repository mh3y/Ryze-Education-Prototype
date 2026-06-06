#!/usr/bin/env node
/**
 * create-new-report.mjs
 * Ryze Education — New Student Report Creator
 *
 * Copies the canonical template into a new per-student folder, renames
 * the file, and pre-fills only the two safe fields: <title> and student name.
 * Every other REPLACE — placeholder is left untouched so the validation
 * script can verify them later.
 *
 * Usage:
 *   node create-new-report.mjs "Jane Smith"
 *   node create-new-report.mjs            (interactive — prompts for name)
 *
 * After running:
 *   1. Edit all REPLACE — fields in the created HTML file
 *   2. Run:  node validate-report.mjs "students/<slug>/<name> - Progress Report.html"
 *   3. Open in Chrome to preview all pages
 *   4. Ctrl+P → Save as PDF (A4, margins None, background On)
 */

import fs       from 'fs';
import path     from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Paths ─────────────────────────────────────────────────────────────────────
const TEMPLATE_PATH = path.join(
  __dirname, 'students', '_template', 'Student Name - Progress Report.html'
);
const STUDENTS_DIR = path.join(__dirname, 'students');

// ── Terminal colour helpers (match validate-report.mjs style) ─────────────────
const C = {
  red:    s => `\x1b[31m${s}\x1b[0m`,
  green:  s => `\x1b[32m${s}\x1b[0m`,
  yellow: s => `\x1b[33m${s}\x1b[0m`,
  cyan:   s => `\x1b[36m${s}\x1b[0m`,
  bold:   s => `\x1b[1m${s}\x1b[0m`,
};
const LINE = C.bold('═'.repeat(61));

// ── Name → folder slug ────────────────────────────────────────────────────────
/**
 * Converts a student name to a safe lowercase folder slug.
 *   "Sienna Kim"     → "sienna-kim"
 *   "Mary-Jane W."   → "mary-jane-w"
 *   "François Dupont"→ "francois-dupont"
 */
function toSlug(name) {
  return name
    .normalize('NFD')                    // decompose accented characters
    .replace(/[̀-ͯ]/g, '')     // strip combining diacritical marks
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')        // non-alphanumeric runs → single hyphen
    .replace(/^-+|-+$/g, '');           // trim leading/trailing hyphens
}

// ── Name validation ───────────────────────────────────────────────────────────
/** Characters that Windows does not allow in filenames. */
const INVALID_FILENAME_CHARS = /[\\/:*?"<>|]/;

function validateName(name) {
  if (!name || !name.trim()) {
    return 'Student name cannot be empty.';
  }
  if (INVALID_FILENAME_CHARS.test(name)) {
    return `Student name contains characters not allowed in filenames: \\ / : * ? " < > |`;
  }
  const slug = toSlug(name.trim());
  if (!slug) {
    return 'Student name did not produce a usable folder name. Please use standard letters.';
  }
  return null; // valid
}

// ── Interactive prompt ────────────────────────────────────────────────────────
function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, answer => { rl.close(); resolve(answer.trim()); }));
}

// ── HTML patching — only two safe fields ─────────────────────────────────────
/**
 * Replaces the two fields it is safe to pre-fill automatically:
 *   1. The <title> tag (and removes its REPLACE instruction comment below it)
 *   2. The student: field value
 *
 * Everything else — tutor, course, dates, lessons, ratings, comments, etc. —
 * is deliberately left as REPLACE — placeholders.
 */
function patchHtml(html, studentName) {
  // ── 1. <title> ─────────────────────────────────────────────────────────────
  // The template has this exact pair of lines:
  //   <title>Ryze · Progress Report — [Student Name]</title>
  //   <!-- ↑ REPLACE [Student Name] with the actual student name, e.g. "Jane Smith" -->
  //
  // Replace the title value and remove the now-redundant instruction comment.
  html = html.replace(
    '<title>Ryze · Progress Report — [Student Name]</title>',
    `<title>Ryze · Progress Report — ${studentName}</title>`
  );
  html = html.replace(
    /\r?\n<!-- ↑ REPLACE \[Student Name\] with the actual student name[^\n]*/,
    ''
  );

  // ── 2. student: field ──────────────────────────────────────────────────────
  // The template has:
  //   student:    'REPLACE — Student Full Name',
  //
  // Replace the placeholder value. Escape any single quotes in the name
  // (e.g. O'Brien → O\'Brien) so the JS remains valid.
  const safeStudentName = studentName.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  html = html.replace(
    /student:\s+'REPLACE — Student Full Name',/,
    `student:    '${safeStudentName}',`
  );

  return html;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('');
  console.log(LINE);
  console.log(C.bold('  RYZE EDUCATION — New Student Report Creator'));
  console.log(LINE);
  console.log('');

  // ── Help flag ───────────────────────────────────────────────────────────────
  const arg = process.argv[2];
  if (arg === '--help' || arg === '-h') {
    console.log(`  Usage:   node create-new-report.mjs "<Student Full Name>"`);
    console.log(`  Example: node create-new-report.mjs "Jane Smith"`);
    console.log(`\n  Omit the name to be prompted interactively.\n`);
    console.log(LINE + '\n');
    process.exit(0);
  }

  // ── Get student name ────────────────────────────────────────────────────────
  let studentName = arg ? arg.trim() : '';

  if (!studentName) {
    studentName = await ask('  Student full name: ');
  } else {
    console.log(`  Student full name: ${C.cyan(studentName)}`);
  }

  const nameError = validateName(studentName);
  if (nameError) {
    console.log(`\n  ${C.red('Error:')} ${nameError}\n`);
    console.log(LINE + '\n');
    process.exit(1);
  }

  studentName = studentName.trim();

  // ── Derive slug, paths, filenames ───────────────────────────────────────────
  const slug         = toSlug(studentName);
  const folderPath   = path.join(STUDENTS_DIR, slug);
  const htmlFileName = `${studentName} - Progress Report.html`;
  const htmlFilePath = path.join(folderPath, htmlFileName);
  const displayFile  = `students/${slug}/${htmlFileName}`;

  console.log('');
  console.log(`  Folder slug:  ${C.cyan(`students/${slug}/`)}`);
  console.log(`  Report file:  ${C.cyan(htmlFileName)}`);
  console.log('');

  // ── Overwrite guard ─────────────────────────────────────────────────────────
  if (fs.existsSync(folderPath)) {
    const existing = fs.readdirSync(folderPath);
    console.log(`  ${C.yellow('⚠')} Folder "students/${slug}/" already exists.`);
    if (existing.length > 0) {
      console.log(`     Contains: ${existing.join(', ')}`);
    }
    const confirm = await ask(`\n  Continue and overwrite? [y/N] `);
    console.log('');
    if (!/^y(es)?$/i.test(confirm)) {
      console.log(`  Cancelled — no files were changed.`);
      console.log('');
      console.log(LINE + '\n');
      process.exit(0);
    }
  }

  // ── Template check ──────────────────────────────────────────────────────────
  if (!fs.existsSync(TEMPLATE_PATH)) {
    console.log(`  ${C.red('Error:')} Canonical template not found at:`);
    console.log(`  ${TEMPLATE_PATH}`);
    console.log(`\n  Make sure the students/_template/ folder has not been moved or renamed.\n`);
    console.log(LINE + '\n');
    process.exit(1);
  }

  // ── Create folder ───────────────────────────────────────────────────────────
  fs.mkdirSync(folderPath, { recursive: true });
  console.log(`  ${C.green('✓')} Created: students/${slug}/`);

  // ── Read, patch, write ──────────────────────────────────────────────────────
  let html = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
  html = patchHtml(html, studentName);
  fs.writeFileSync(htmlFilePath, html, 'utf-8');
  console.log(`  ${C.green('✓')} Created: ${C.cyan(displayFile)}`);

  // ── Confirm what was pre-filled ─────────────────────────────────────────────
  // Read back and check the replacements landed correctly
  const written  = fs.readFileSync(htmlFilePath, 'utf-8');
  const titleOk  = written.includes(`<title>Ryze · Progress Report — ${studentName}</title>`);
  const studentOk = written.includes(`student:    '${studentName.replace(/'/g, "\\'")}'`);

  console.log('');
  console.log(`  Pre-filled fields:`);
  console.log(`    ${titleOk   ? C.green('✓') : C.red('✗')} <title>   → "Ryze · Progress Report — ${studentName}"`);
  console.log(`    ${studentOk ? C.green('✓') : C.red('✗')} student   → "${studentName}"`);

  if (!titleOk || !studentOk) {
    console.log('');
    console.log(`  ${C.yellow('⚠')} One or more pre-fill replacements did not match.`);
    console.log(`  The template may have changed. Open the file and update manually.`);
  }

  // ── Remaining placeholders reminder ────────────────────────────────────────
  const replaceCount = (written.match(/REPLACE/g) || []).length;
  console.log('');
  console.log(`  ${C.yellow(`⚠  ${replaceCount} REPLACE — placeholder(s) still need filling in.`)}`);
  console.log(`     These fields require your input and cannot be pre-filled:`);
  console.log(`     tutor · course · year group · report period · prepared date`);
  console.log(`     lessons (dates, topics, ratings, comments) · strengths`);
  console.log(`     focus areas · summary · growth note · parent comment`);

  // ── Next steps ──────────────────────────────────────────────────────────────
  console.log('');
  console.log(LINE);
  console.log(C.bold(`  ✓  Report file ready.  What to do next:`));
  console.log(LINE);
  console.log('');
  console.log(`  1.  ${C.bold('Open the file')} in Notepad or VS Code — not Word or Chrome`);
  console.log(`      ${htmlFilePath}`);
  console.log('');
  console.log(`  2.  ${C.bold('Fill in every REPLACE — field')} from top to bottom`);
  console.log(`      Use the README checklist for the full list of required fields`);
  console.log('');
  console.log(`  3.  ${C.bold('Run validation')} — confirms no placeholders remain`);
  console.log(`      ${C.cyan(`node validate-report.mjs "${displayFile}"`)}`);
  console.log('');
  console.log(`  4.  ${C.bold('Preview in Google Chrome')} — scroll through every page`);
  console.log('');
  console.log(`  5.  ${C.bold('Export PDF')}: Ctrl+P → A4, margins None, background On`);
  console.log(`      Save to: generated-reports/`);
  console.log('');
  console.log(LINE + '\n');
}

main().catch(e => {
  console.error(`\n  ${C.red('Unexpected error:')} ${e.message}\n`);
  process.exit(1);
});
