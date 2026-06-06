/**
 * RYZE EDUCATION — STUDENT REPORT DATA TEMPLATE
 *
 * Copy this file and edit the REPORT object to generate a new student report.
 *
 * Steps:
 * 1. Copy the HTML template file (reports/template.html) and rename it.
 * 2. Copy this file and rename it for the student.
 * 3. Replace all placeholder values below with real data.
 * 4. Open the HTML file in Chrome to preview.
 * 5. See HOWTO-PDF.md to export as PDF.
 */

const REPORT = {

  // ─── BRAND ───────────────────────────────────────────────────────────────
  // Do not change unless rebranding.
  brand: {
    name: 'RYZE',
    sub:  'EDUCATION',
    site: 'ryzeeducation.com.au',
    logo: '../engine/ryze-logo.png',
    icon: '../engine/ryze-icon.png',
  },

  // ─── REPORT METADATA ─────────────────────────────────────────────────────
  reportType: 'Mid-Term Progress Report',
  prepared:   '2 June 2026',           // Date the report was prepared
  id:         'RPT.Y11ADV.T2.2026.XX', // Unique report code — update XX with student initials

  // ─── STUDENT ─────────────────────────────────────────────────────────────
  student:    'Jane Smith',                       // Full name shown on cover
  course:     'Year 11 Advanced Maths',           // Short course name
  courseLine: 'Year 11 Advanced Mathematics',     // Full course name (cover + cards)
  tutor:      'Conrad Liu',  // FULL name — engine auto-formats to "Conrad L" for parent output

  // ─── PERIOD ──────────────────────────────────────────────────────────────
  period: {
    stamp:    'T2 2026',          // e.g. "T2 2026"
    label:    'Term 2 · Weeks 1–6',
    metaTerm: 'T2 2026',
    metaWeeks:'Wk 1–6',
  },

  // ─── METRICS ─────────────────────────────────────────────────────────────
  // Defines which metrics are tracked and the order they appear.
  // growthMetric is the hero metric shown in the chart and highlighted in dials.
  metrics:     ['Performance', 'Understanding', 'Confidence', 'Engagement'],
  growthMetric:'Confidence',

  // ─── SNAPSHOT CONTENT ────────────────────────────────────────────────────
  // Wrap a metric name in {curly braces} to italicise + colour it in the headline.
  headline: 'Steady, positive progress — with {Confidence} the area now building.',

  summary: `Replace this with the 01.1 Overall Summary paragraph.
This is displayed prominently at the top of the snapshot page.
Keep it to 3–5 sentences: overall progress, key strength, growth area, and next step.`,

  growthNote: 'Replace this with the paragraph shown in the Confidence chart card. Explain what confidence means in context and how it will be developed.',

  strengths: [
    'Key strength one',
    'Key strength two',
    'Key strength three',
  ],

  focus: [
    'Focus area one',
    'Focus area two',
    'Focus area three',
  ],

  // ─── LESSONS ─────────────────────────────────────────────────────────────
  // Add one entry per week. The engine paginates lessons automatically.
  // Cancelled and rescheduled lessons are excluded from all averages.
  lessons: [

    // ── Completed lesson ──────────────────────────────────────────────────
    {
      week:       1,
      date:       '21 Apr 2026',   // Display date shown on the card
      topic:      'Lesson Topic',  // Topic shown as card heading
      ref:        '',              // Optional: textbook/chapter reference e.g. 'Cambridge 6F'
      completion: 100,             // Percentage 0–100
      ratings: {
        Performance:  4,           // 1–5 integer scores
        Understanding:4,
        Confidence:   3,
        Engagement:   4,
      },
      summary: 'Verbatim tutor comment from the lesson feedback form. Paste exactly as written.',
    },

    {
      week:       2,
      date:       '28 Apr 2026',
      topic:      'Lesson Topic',
      ref:        '',
      completion: 100,
      ratings: {
        Performance:  4,
        Understanding:4,
        Confidence:   4,
        Engagement:   4,
      },
      summary: 'Verbatim tutor comment.',
    },

    // ── Cancelled lesson ──────────────────────────────────────────────────
    // Use this for a lesson that did not take place and will not be rescheduled.
    // Excluded from all averages. Shown with a striped muted card.
    {
      week:      3,
      date:      '5 May 2026',
      cancelled: true,
      summary:   'Brief reason e.g. "No lesson this week. Excluded from progress averages."',
    },

    // ── Rescheduled lesson ────────────────────────────────────────────────
    // Use this for a lesson that was moved to a different date.
    // Excluded from averages until the rescheduled lesson is completed.
    // {
    //   week:          3,
    //   date:          '5 May 2026',
    //   rescheduled:   true,
    //   rescheduledTo: 'Saturday, 4 July 2026',
    //   summary:       'Optional context note.',
    // },

    {
      week:       4,
      date:       '15 May 2026',
      topic:      'Lesson Topic',
      ref:        '',
      completion: 100,
      ratings: {
        Performance:  4,
        Understanding:4,
        Confidence:   4,
        Engagement:   4,
      },
      summary: 'Verbatim tutor comment.',
    },

    {
      week:       5,
      date:       '25 May 2026',
      topic:      'Lesson Topic',
      ref:        '',
      completion: 100,
      ratings: {
        Performance:  4,
        Understanding:4,
        Confidence:   3,
        Engagement:   4,
      },
      summary: 'Verbatim tutor comment.',
    },

    {
      week:       6,
      date:       '31 May 2026',
      topic:      'Lesson Topic',
      ref:        '',
      completion: 100,
      ratings: {
        Performance:  4,
        Understanding:4,
        Confidence:   4,
        Engagement:   4,
      },
      summary: 'Verbatim tutor comment.',
    },

  ],

  // ─── PARENT COMMENT ──────────────────────────────────────────────────────
  // Shown in the bordered box on the final page (section 03.2).
  // lead = italic opening sentence.
  // paras = body paragraphs (use 2–3).
  comment: {
    lead: 'Opening sentence about the student. This is italicised.',
    paras: [
      'First paragraph — observations from lessons this term.',
      'Second paragraph — next steps, practice plan, areas to focus on.',
      'Third paragraph — encouragement and forward look.',
    ],
  },

  // ─── FINAL PAGE ──────────────────────────────────────────────────────────
  nextReport: 'End of Term 2',   // Keep this short — shown in the bottom band

};
