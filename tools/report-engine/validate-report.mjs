#!/usr/bin/env node
/**
 * validate-report.mjs
 * Ryze Education — Report Pre-Export Validator
 *
 * Checks a student report HTML file for common mistakes before PDF export:
 *   - unreplaced REPLACE placeholders
 *   - wrong or missing student/tutor/course details
 *   - placeholder dates, ratings, lesson comments
 *   - accidental reuse of another student's content
 *
 * Usage:
 *   node validate-report.mjs "<path-to-report.html>"
 *
 * Examples:
 *   node validate-report.mjs "students/john-smith/John Smith - Progress Report.html"
 *   node validate-report.mjs "reports/Sienna Kim - Progress Report.html"
 *
 * Exit codes:
 *   0 = PASS (or pass with warnings)
 *   1 = FAIL (one or more blocking issues found)
 */

import vm   from 'vm';
import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Terminal colour helpers ───────────────────────────────────────────────────
const C = {
  red:    s => `\x1b[31m${s}\x1b[0m`,
  green:  s => `\x1b[32m${s}\x1b[0m`,
  yellow: s => `\x1b[33m${s}\x1b[0m`,
  cyan:   s => `\x1b[36m${s}\x1b[0m`,
  bold:   s => `\x1b[1m${s}\x1b[0m`,
  dim:    s => `\x1b[2m${s}\x1b[0m`,
};

// ── Issue / warning collectors ────────────────────────────────────────────────
const issues   = [];   // blocking — must fix before export
const warnings = [];   // non-blocking — worth reviewing

function fail(section, message) { issues.push({ section, message }); }
function warn(section, message) { warnings.push({ section, message }); }

// ── Placeholder detection ─────────────────────────────────────────────────────
/**
 * Returns true if the value is clearly a placeholder:
 *   - contains the literal word REPLACE
 *   - is an empty string
 *   - matches known date/code templates
 */
function isPlaceholder(val) {
  if (typeof val !== 'string') return false;
  if (/REPLACE/i.test(val))   return true;
  if (/^\s*$/.test(val))      return true;
  if (/^DD\s+(Mon|Month)\s+YYYY$/i.test(val.trim())) return true;
  return false;
}

// ── Extract REPORT object from the HTML file ──────────────────────────────────
/**
 * Finds the inline <script> block(s), evaluates them in a Node.js vm sandbox,
 * and returns the REPORT object.
 *
 * The template uses  const REPORT = {...}
 * In vm, `const` is scoped to the script and not exported to the sandbox context.
 * We strip the `const`/`let`/`var` keyword from the REPORT declaration so the
 * assignment lands on the sandbox's global object and is retrievable afterwards.
 */
function extractReport(html) {
  // Collect all inline <script> blocks (skip <script src="..."> tags)
  const blocks = [];
  const re = /<script(?![^>]*\bsrc\b)[^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const body = m[1].trim();
    if (body) blocks.push(body);
  }

  if (blocks.length === 0) {
    throw new Error('No inline <script> block found. Is this a valid report HTML file?');
  }

  // Strip const/let/var from the REPORT declaration so vm exports it to the sandbox
  const script = blocks
    .join('\n')
    .replace(/\b(?:const|let|var)\s+(REPORT)\b/g, '$1');

  // Provide a minimal browser-global mock so (window.__resources||{}).brandIcon works
  const sandbox = {
    window:  { __resources: {} },
    REPORT:  undefined,
  };
  vm.createContext(sandbox);

  try {
    vm.runInContext(script, sandbox, { timeout: 5000 });
  } catch (e) {
    throw new Error(`Script evaluation failed: ${e.message}`);
  }

  if (!sandbox.REPORT || typeof sandbox.REPORT !== 'object') {
    throw new Error('REPORT object not found after evaluating the script block.');
  }

  return sandbox.REPORT;
}

// ── Individual check functions ────────────────────────────────────────────────

function checkTitle(html, R) {
  const sec = 'HTML <title> tag';
  const m = html.match(/<title>([^<]*)<\/title>/i);
  const title = m ? m[1].trim() : null;

  if (!title) {
    fail(sec, 'No <title> tag found in the file.');
    return;
  }
  if (/\[Student Name\]/i.test(title)) {
    fail(sec, `<title> still has "[Student Name]" placeholder: "${title}"`);
    return;
  }
  if (/REPLACE/i.test(title)) {
    fail(sec, `<title> still contains REPLACE placeholder: "${title}"`);
    return;
  }
  // Loose check: title should contain the student's first name
  if (R.student && !isPlaceholder(R.student)) {
    const first = R.student.trim().split(/\s+/)[0];
    if (!title.includes(first)) {
      warn(sec, `<title> "${title}" does not appear to match student name "${R.student}" — verify it was updated.`);
    }
  }
}

function checkStudentIdentity(R, displayPath) {
  const sec = 'Student identity';

  // student name
  if (!R.student || isPlaceholder(R.student)) {
    fail(sec, `student: is a placeholder — "${R.student}"`);
  } else if (/^(student full name|jane smith|john smith)$/i.test(R.student.trim())) {
    fail(sec, `student: looks like a generic placeholder — "${R.student}"`);
  }

  // Sienna Kim reuse guard
  const isSiennaPath = /sienna.?kim/i.test(displayPath);
  if (!isSiennaPath && R.student && /sienna\s+kim/i.test(R.student)) {
    fail(sec, `student: shows "Sienna Kim" but this file is not in a sienna-kim/ folder. ` +
              `Was a previous student's report copied instead of using the template?`);
  }

  // course (short form)
  if (!R.course || isPlaceholder(R.course)) {
    fail(sec, `course: is a placeholder — "${R.course}"`);
  } else if (/year\s+xx/i.test(R.course)) {
    fail(sec, `course: still has generic year group "Year XX" — "${R.course}"`);
  }

  // courseLine (long form)
  if (!R.courseLine || isPlaceholder(R.courseLine)) {
    fail(sec, `courseLine: is a placeholder — "${R.courseLine}"`);
  } else if (/year\s+xx/i.test(R.courseLine)) {
    fail(sec, `courseLine: still has generic year group "Year XX" — "${R.courseLine}"`);
  }
}

function checkTutor(R) {
  const sec = 'Tutor';
  if (!R.tutor || isPlaceholder(R.tutor)) {
    fail(sec, `tutor: is a placeholder — "${R.tutor}"`);
  } else if (/^tutor(\s+full)?\s+name$/i.test(R.tutor.trim())) {
    fail(sec, `tutor: is the generic placeholder — "${R.tutor}"`);
  }
}

function checkReportMetadata(R) {
  const sec = 'Report metadata';

  // reportType
  if (!R.reportType || isPlaceholder(R.reportType)) {
    fail(sec, `reportType: is a placeholder — "${R.reportType}"`);
  }

  // prepared date
  if (!R.prepared || isPlaceholder(R.prepared)) {
    fail(sec, `prepared: is a placeholder — "${R.prepared}"`);
  } else if (/^(dd\s+month\s+yyyy|replace|dd\s+mon)/i.test(R.prepared.trim())) {
    fail(sec, `prepared: still contains a date placeholder — "${R.prepared}"`);
  }

  // report ID
  if (!R.id || isPlaceholder(R.id)) {
    fail(sec, `id: is a placeholder — "${R.id}"`);
  } else if (/RPT\.XXXXX/i.test(R.id) || /\.XX$/i.test(R.id.trim())) {
    fail(sec, `id: still has placeholder segments — "${R.id}"`);
  }
}

function checkPeriod(R) {
  const sec = 'Report period';
  const p   = R.period || {};

  if (!p.stamp || isPlaceholder(p.stamp) || /^TX\s+YYYY$/i.test(p.stamp.trim())) {
    fail(sec, `period.stamp: is a placeholder — "${p.stamp}"`);
  }
  if (!p.label || isPlaceholder(p.label) || /term\s+x\b/i.test(p.label)) {
    fail(sec, `period.label: is a placeholder — "${p.label}"`);
  }
  if (!p.metaTerm || isPlaceholder(p.metaTerm) || /^TX\s+YYYY$/i.test(p.metaTerm.trim())) {
    fail(sec, `period.metaTerm: is a placeholder — "${p.metaTerm}"`);
  }
  if (!p.metaWeeks || isPlaceholder(p.metaWeeks)) {
    fail(sec, `period.metaWeeks: is a placeholder — "${p.metaWeeks}"`);
  }
}

function checkGrowthMetric(R) {
  const sec = 'Growth metric';
  if (!R.growthMetric || isPlaceholder(R.growthMetric)) {
    fail(sec, `growthMetric: is a placeholder — "${R.growthMetric}"`);
    return;
  }
  if (Array.isArray(R.metrics) && !R.metrics.includes(R.growthMetric)) {
    fail(sec, `growthMetric: "${R.growthMetric}" is not listed in metrics ` +
              `[${R.metrics.join(', ')}]. It must exactly match one of those values.`);
  }
}

function checkSnapshotContent(R) {
  const sec = 'Snapshot content';

  if (!R.headline || isPlaceholder(R.headline)) {
    fail(sec, `headline: is a placeholder — "${(R.headline || '').slice(0, 70)}"`);
  } else if (R.headline.length < 20) {
    warn(sec, `headline: only ${R.headline.length} characters — check it is the full text.`);
  }

  if (!R.summary || isPlaceholder(R.summary)) {
    fail(sec, `summary: is a placeholder — "${(R.summary || '').slice(0, 70)}"`);
  } else if (R.summary.length < 80) {
    warn(sec, `summary: only ${R.summary.length} characters — a typical summary is 3–5 sentences. Check it is complete.`);
  }

  if (!R.growthNote || isPlaceholder(R.growthNote)) {
    fail(sec, `growthNote: is a placeholder — "${(R.growthNote || '').slice(0, 70)}"`);
  } else if (R.growthNote.length < 30) {
    warn(sec, `growthNote: only ${R.growthNote.length} characters — check it is complete.`);
  }
}

function checkStrengths(R) {
  const sec = 'Strengths';
  if (!Array.isArray(R.strengths) || R.strengths.length === 0) {
    fail(sec, 'strengths: array is empty or missing.');
    return;
  }
  if (R.strengths.length < 3) {
    warn(sec, `strengths: only ${R.strengths.length} item(s) — the template expects 3.`);
  }
  R.strengths.forEach((s, i) => {
    if (isPlaceholder(s)) fail(sec, `strengths[${i}]: is a placeholder — "${s}"`);
  });
}

function checkFocusAreas(R) {
  const sec = 'Focus areas';
  if (!Array.isArray(R.focus) || R.focus.length === 0) {
    fail(sec, 'focus: array is empty or missing.');
    return;
  }
  if (R.focus.length < 3) {
    warn(sec, `focus: only ${R.focus.length} item(s) — the template expects 3.`);
  }
  R.focus.forEach((f, i) => {
    if (isPlaceholder(f)) fail(sec, `focus[${i}]: is a placeholder — "${f}"`);
  });
}

function checkLessons(R, displayPath) {
  const sec = 'Lessons';
  const isSiennaPath = /sienna.?kim/i.test(displayPath);

  if (!Array.isArray(R.lessons) || R.lessons.length === 0) {
    fail(sec, 'lessons: array is empty. At least one lesson entry is required.');
    return;
  }

  let deliveredCount = 0;
  const ratingSnapshots = [];

  R.lessons.forEach((l, idx) => {
    const wk = `Week ${l.week != null ? l.week : idx + 1}`;

    // Date placeholder check (applies to all lesson types)
    if (!l.date || isPlaceholder(l.date) || /^(dd\s+mon|replace)/i.test((l.date || '').trim())) {
      fail(sec, `${wk}: date is a placeholder — "${l.date}"`);
    }

    if (l.cancelled || l.rescheduled) {
      // Rescheduled: rescheduledTo must not be a placeholder
      if (l.rescheduled) {
        if (!l.rescheduledTo || isPlaceholder(l.rescheduledTo) ||
            /^(replace|day,\s*dd)/i.test((l.rescheduledTo || '').trim())) {
          fail(sec, `${wk}: rescheduledTo is a placeholder — "${l.rescheduledTo}"`);
        }
      }
      // Cancelled/rescheduled summary note
      if (!l.summary || isPlaceholder(l.summary)) {
        warn(sec, `${wk}: cancelled/rescheduled lesson has a placeholder or missing summary note.`);
      }
    } else {
      // Delivered lesson
      deliveredCount++;

      // Topic
      if (!l.topic || isPlaceholder(l.topic) || /^replace/i.test((l.topic || '').trim())) {
        fail(sec, `${wk}: topic is a placeholder — "${l.topic}"`);
      }

      // Tutor comment
      if (!l.summary || isPlaceholder(l.summary)) {
        fail(sec, `${wk}: tutor comment is a placeholder — "${(l.summary || '').slice(0, 60)}"`);
      } else if (l.summary.length < 25) {
        warn(sec, `${wk}: tutor comment is very short (${l.summary.length} chars) — paste the full feedback.`);
      }

      // Ratings
      if (!l.ratings || typeof l.ratings !== 'object') {
        fail(sec, `${wk}: missing ratings object.`);
      } else {
        const vals = Object.values(l.ratings);
        const invalid = vals.filter(v => typeof v !== 'number' || !Number.isInteger(v) || v < 1 || v > 5);
        if (invalid.length > 0) {
          fail(sec, `${wk}: ratings contain invalid values (must be whole numbers 1–5). Got: ${JSON.stringify(l.ratings)}`);
        }
        ratingSnapshots.push(JSON.stringify(l.ratings));
      }

      // Sienna Kim content reuse check
      if (!isSiennaPath && l.summary && /\bsienna\b/i.test(l.summary)) {
        fail(sec, `${wk}: lesson comment mentions "Sienna" but this is not Sienna's report file. ` +
                  `Was a previous report copied by mistake?`);
      }
    }
  });

  // Identical-ratings warning: unusual to have every lesson score identically
  if (deliveredCount >= 3 && ratingSnapshots.length >= 3) {
    const unique = new Set(ratingSnapshots);
    if (unique.size === 1) {
      warn(sec,
        `All ${deliveredCount} delivered lessons have identical ratings ${ratingSnapshots[0]}. ` +
        `Confirm these come from the actual lesson feedback forms and were not left at template defaults.`
      );
    }
  }
}

function checkParentComment(R, displayPath) {
  const sec = 'Parent comment';
  const isSiennaPath = /sienna.?kim/i.test(displayPath);

  const lead = R.comment?.lead;
  if (!lead || isPlaceholder(lead)) {
    fail(sec, `comment.lead: is a placeholder — "${(lead || '').slice(0, 70)}"`);
  } else if (!isSiennaPath && /\bsienna\b/i.test(lead)) {
    fail(sec, `comment.lead: mentions "Sienna" in what appears to be a different student's report.`);
  }

  const paras = R.comment?.paras;
  if (!Array.isArray(paras) || paras.length === 0) {
    fail(sec, 'comment.paras: empty or missing. At least two paragraphs are expected.');
  } else {
    paras.forEach((p, i) => {
      if (isPlaceholder(p)) {
        fail(sec, `comment.paras[${i}]: is a placeholder — "${p.slice(0, 70)}"`);
      } else if (!isSiennaPath && /\bsienna\b/i.test(p)) {
        fail(sec, `comment.paras[${i}]: mentions "Sienna" in what appears to be a different student's report.`);
      }
    });
  }

  if (!R.nextReport || isPlaceholder(R.nextReport)) {
    fail(sec, `nextReport: is a placeholder — "${R.nextReport}"`);
  }
}

function checkCrossStudentContent(R, displayPath) {
  // Sweep snapshot fields for Sienna-specific content in non-Sienna reports
  const isSiennaPath = /sienna.?kim/i.test(displayPath);
  if (isSiennaPath) return;

  const sec = 'Cross-student content';
  const fields = [
    { name: 'summary',    val: R.summary },
    { name: 'growthNote', val: R.growthNote },
    { name: 'headline',   val: R.headline },
  ];
  for (const { name, val } of fields) {
    if (val && /\bsienna\b/i.test(val)) {
      fail(sec,
        `${name}: mentions "Sienna" in what appears to be a different student's report. ` +
        `Check whether a previous report was copied as the starting point.`
      );
    }
  }
  const strengths = R.strengths || [];
  const focus     = R.focus     || [];
  [...strengths, ...focus].forEach((item, i) => {
    if (item && /\bsienna\b/i.test(item)) {
      const arr = i < strengths.length ? `strengths[${i}]` : `focus[${i - strengths.length}]`;
      fail(sec, `${arr}: mentions "Sienna" in what appears to be a different student's report.`);
    }
  });
}

// ── Output helpers ────────────────────────────────────────────────────────────

const SECTIONS = [
  'HTML <title> tag',
  'Student identity',
  'Tutor',
  'Report metadata',
  'Report period',
  'Growth metric',
  'Snapshot content',
  'Strengths',
  'Focus areas',
  'Lessons',
  'Parent comment',
  'Cross-student content',
];

function printResults() {
  // Build a lookup: section → { issues, warnings }
  const map = {};
  const ensure = s => (map[s] = map[s] || { issues: [], warnings: [] });
  issues.forEach  (({ section, message }) => ensure(section).issues.push(message));
  warnings.forEach(({ section, message }) => ensure(section).warnings.push(message));

  for (const sec of SECTIONS) {
    const g = map[sec];
    if (!g) {
      // All clear for this section
      console.log(`  ${C.green('✓')} ${C.dim(sec)}`);
      continue;
    }
    if (g.issues.length === 0 && g.warnings.length === 0) {
      console.log(`  ${C.green('✓')} ${C.dim(sec)}`);
      continue;
    }
    // Has issues or warnings — print expanded block
    const icon = g.issues.length > 0 ? C.red('✗') : C.yellow('⚠');
    console.log(`\n  ${icon} ${C.bold(sec)}`);
    for (const msg of g.issues)   console.log(`      ${C.red('✗')} ${msg}`);
    for (const msg of g.warnings) console.log(`      ${C.yellow('⚠')} ${msg}`);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

function main() {
  const LINE = C.bold('═'.repeat(61));

  console.log('');
  console.log(LINE);
  console.log(C.bold('  RYZE EDUCATION — Report Pre-Export Validator'));
  console.log(LINE);

  // ── Argument handling ──────────────────────────────────────────────────────
  const arg = process.argv[2];
  if (!arg || arg === '--help' || arg === '-h') {
    if (!arg) console.log(`\n  ${C.red('Error:')} No file path supplied.\n`);
    console.log(`  Usage:   node validate-report.mjs "<path-to-report.html>"`);
    console.log(`  Example: node validate-report.mjs "students/john-smith/John Smith - Progress Report.html"\n`);
    console.log(`  The path can be relative to the ryze-report-engine/ folder, or absolute.\n`);
    process.exit(arg ? 0 : 1);
  }

  // Resolve path (relative paths are relative to this script's directory)
  const filePath    = path.isAbsolute(arg) ? arg : path.resolve(__dirname, arg);
  const displayPath = path.relative(__dirname, filePath).replace(/\\/g, '/');

  console.log(`\n  File: ${C.cyan(displayPath)}`);

  // ── Template guard ─────────────────────────────────────────────────────────
  if (/[/\\]_template[/\\]/i.test(filePath)) {
    console.log(`\n  ${C.yellow('⚠  This is the master template file.')}`);
    console.log(`  The template is expected to have REPLACE placeholders — it will always`);
    console.log(`  fail validation. Validate a real student report instead:`);
    console.log(`  students/<firstname-lastname>/<Student Name> - Progress Report.html\n`);
    console.log(LINE + '\n');
    process.exit(0);
  }

  // ── File read ──────────────────────────────────────────────────────────────
  if (!fs.existsSync(filePath)) {
    console.log(`\n  ${C.red('Error:')} File not found.\n  Path: ${filePath}\n`);
    process.exit(1);
  }

  let html, R;
  try {
    html = fs.readFileSync(filePath, 'utf-8');
    R    = extractReport(html);
  } catch (e) {
    console.log(`\n  ${C.red('Error: Could not parse the report file.')}`);
    console.log(`  ${e.message}`);
    console.log(`\n  Make sure this is a valid Ryze report HTML file with a REPORT object.\n`);
    process.exit(1);
  }

  // ── Run all checks ─────────────────────────────────────────────────────────
  console.log('');
  checkTitle(html, R);
  checkStudentIdentity(R, displayPath);
  checkTutor(R);
  checkReportMetadata(R);
  checkPeriod(R);
  checkGrowthMetric(R);
  checkSnapshotContent(R);
  checkStrengths(R);
  checkFocusAreas(R);
  checkLessons(R, displayPath);
  checkParentComment(R, displayPath);
  checkCrossStudentContent(R, displayPath);

  // ── Print section results ──────────────────────────────────────────────────
  printResults();

  // ── Final verdict ──────────────────────────────────────────────────────────
  console.log('');
  console.log(LINE);

  if (issues.length === 0 && warnings.length === 0) {
    console.log(`  ${C.green(C.bold('✓  PASS'))} — report is ready for Chrome preview and PDF export.`);
    console.log('');
    console.log(`  Next: open the file in Google Chrome, scroll through every page,`);
    console.log(`  then press Ctrl+P → Save as PDF (A4, margins None, background On).`);

  } else if (issues.length === 0) {
    console.log(`  ${C.yellow(C.bold('⚠  PASS WITH WARNINGS'))} — no blocking issues, but review the ${warnings.length} warning(s) above.`);
    console.log('');
    console.log(`  Warnings will not stop export, but check them before sending to parents.`);

  } else {
    const n    = issues.length;
    const noun = n === 1 ? 'issue' : 'issues';
    const wstr = warnings.length > 0 ? ` + ${warnings.length} warning(s)` : '';
    console.log(`  ${C.red(C.bold(`✗  FAIL`))} — ${n} ${noun}${wstr} must be fixed before export.`);
    console.log('');
    console.log(`  Fix every item marked ${C.red('✗')} above, save the file, then run this`);
    console.log(`  script again to confirm.`);
  }

  console.log(LINE);
  console.log('');

  process.exit(issues.length > 0 ? 1 : 0);
}

main();
