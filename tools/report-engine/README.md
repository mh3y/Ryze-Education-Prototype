# Ryze Education — Report Engine

> **Active working location:** `Ryze-Education-Prototype/tools/report-engine/` (this folder)
>
> The Google Drive copy at `G:\My Drive\Resources\Ryze Education Content\Reports\ryze-report-engine\` is the **backup/archive** — do not use it as the primary working location.
>
> **Git note:** This folder lives inside the `Ryze-Education-Prototype` repo. Real student reports, completed HTML files, and generated PDFs are excluded from Git via `.gitignore`. The engine files, template, and CLI scripts are tracked. See the `.gitignore` in this folder for the exact rules.

A data-driven, print-ready student progress report system. Each report is a single HTML file containing a student data object; the shared engine (`engine/ryze-report.js` + `engine/ryze-report.css`) derives every page, chart, average, and page number automatically.

---

## Architecture

```
ryze-report-engine/
├── README.md               ← this file
├── HOWTO-PDF.md            ← PDF export instructions
├── engine/
│   ├── ryze-report.js      ← core rendering engine (all logic)
│   ├── ryze-report.css     ← design system (all styles)
│   └── ryze-icon.png       ← Ryze phoenix brand icon
├── data/
│   └── sample-report-data.js   ← template: copy this to create a new student report
└── reports/
    └── Sienna Kim - Progress Report.html   ← live working example
```

The engine is **vanilla HTML/CSS/JavaScript** — no build step, no dependencies, no server required. Open any report HTML file directly in a browser to preview it.

---

## How to create a new student report

1. **Copy** `data/sample-report-data.js` and rename it (e.g. `data/john-smith-data.js`) — or copy the working example report.
2. **Edit only the `REPORT` object** — change student name, tutor, lessons, comments etc.
3. **Save** the file.
4. **Open in a browser** to preview.
5. **Export to PDF** — see `HOWTO-PDF.md`.

---

## REPORT data object reference

Every report is driven by a single `const REPORT = { ... }` object. All fields are documented below.

```js
const REPORT = {

  // ─── BRAND ───────────────────────────────────────────────────────────────
  brand: {
    name: 'RYZE',
    sub:  'EDUCATION',
    site: 'ryzeeducation.com.au',
    logo: '../engine/ryze-logo.png',   // path relative to the HTML file
    icon: '../engine/ryze-icon.png',   // path relative to the HTML file
  },

  // ─── REPORT METADATA ─────────────────────────────────────────────────────
  reportType: 'Mid-Term Progress Report',   // shown on cover
  prepared:   '2 June 2026',               // preparation date
  id:         'RPT.Y11ADV.T2.2026.SK',     // report code shown in footer

  // ─── STUDENT ─────────────────────────────────────────────────────────────
  student:    'Sienna Kim',               // full name — displayed large on cover
  course:     'Year 11 Advanced Maths',   // short course name
  courseLine: 'Year 11 Advanced Mathematics',  // long form for cover kicker
  tutor:      'Conrad Liu',   // FULL name — engine auto-formats to "Conrad L" for output
                              // (tutorDisplay() strips the surname to first name + initial)

  // ─── PERIOD ──────────────────────────────────────────────────────────────
  period: {
    stamp:    'T2 2026',          // shown in header stamp: PROGRESS REPORT · T2 2026
    label:    'Term 2 · Weeks 1–6',  // shown in cover kicker
    metaTerm: 'T2 2026',         // shown in cover student-info block
    metaWeeks:'Wk 1–6',          // shown in cover student-info block
  },

  // ─── METRICS ─────────────────────────────────────────────────────────────
  // Order defines columns everywhere. Add or remove metrics freely.
  metrics:     ['Performance', 'Understanding', 'Confidence', 'Engagement'],
  growthMetric:'Confidence',   // charted as the hero line; highlighted in dials

  // ─── SNAPSHOT CONTENT ────────────────────────────────────────────────────
  headline:   'Steady, positive progress — with {Confidence} the area now building.',
  // Wrap metric name in {curly braces} to italicise and colour it in the headline.

  summary:    'The overall summary paragraph shown at the top of the snapshot page.',

  growthNote: 'The paragraph shown in the Confidence chart card.',

  strengths: [
    'Strength one',
    'Strength two',
    'Strength three',
  ],

  focus: [
    'Focus area one',
    'Focus area two',
    'Focus area three',
  ],

  // ─── LESSONS ─────────────────────────────────────────────────────────────
  // Each lesson is one entry. Add as many weeks as needed.
  // Cancelled/rescheduled lessons are excluded from all averages automatically.
  lessons: [

    // Standard completed lesson:
    {
      week:       1,
      date:       '21 Apr 2026',
      topic:      'Assessment Review',
      ref:        '',             // optional textbook/chapter reference
      completion: 100,            // percentage 0–100
      ratings: {
        Performance:  4,          // 1–5 scale
        Understanding:4,
        Confidence:   3,
        Engagement:   4,
      },
      summary: 'Tutor comment — verbatim from lesson feedback form.',
    },

    // Cancelled lesson:
    {
      week:      3,
      date:      '5 May 2026',
      cancelled: true,
      summary:   'Reason for cancellation. Excluded from progress averages.',
    },

    // Rescheduled lesson:
    {
      week:          3,
      date:          '5 May 2026',
      rescheduled:   true,
      rescheduledTo: 'Saturday, 4 July 2026',
      summary:       'Context note shown on the card.',
    },

  ],

  // ─── PARENT COMMENT ──────────────────────────────────────────────────────
  comment: {
    lead:  'Opening sentence — shown in italic.',
    paras: [
      'First paragraph.',
      'Second paragraph.',
      'Third paragraph (next steps).',
    ],
  },

  // ─── FINAL PAGE ──────────────────────────────────────────────────────────
  nextReport: 'End of Term 2',   // shown in the bottom band on the last page

};
```

---

## Privacy rules (built into the engine)

- **Tutor surname is never shown** in parent-facing output. The engine's `tutorDisplay()` function automatically converts `"Conrad Liu"` → `"Conrad L"`. Store the full name in the data; the engine handles privacy.
- **Cancelled/rescheduled lessons are excluded from all averages** automatically via `delivered()` / `isSkipped()` helpers.
- **Tutor signature block is not shown** — Ryze Education is the report author.

---

## Rating colour system

Scores 1–5 map to a consistent colour palette across the ratings table, lesson card pips, metric dials, and the scale legend:

| Score | Colour | Label |
|-------|--------|-------|
| 1 | `#B85C4F` muted red | Needs significant support |
| 2 | `#D7833F` orange | Needs support |
| 3 | `#D4AF45` amber/gold | Developing |
| 4 | `#7F936D` sage green | Proficient |
| 5 | `#2F6B54` deep green | Excellent |

To update colours globally, change the CSS variables in `engine/ryze-report.css`:
```css
:root {
  --rating-1: #B85C4F;
  --rating-2: #D7833F;
  --rating-3: #D4AF45;
  --rating-4: #7F936D;
  --rating-5: #2F6B54;
}
```
And the matching JS arrays in `engine/ryze-report.js`:
```js
const RATING_BG = ['','#B85C4F','#D7833F','#D4AF45','#7F936D','#2F6B54'];
const RATING_FG = ['','#FCFAF5','#FCFAF5','#0F2236','#FCFAF5','#FCFAF5'];
```

---

## Report wording — where to find it

| Content | Location |
|---------|----------|
| Cover kicker / sub-line | Auto-generated from `REPORT.courseLine`, `REPORT.period.label`, `REPORT.metrics` |
| Snapshot headline | `REPORT.headline` |
| Snapshot summary | `REPORT.summary` |
| Growth area note | `REPORT.growthNote` |
| Key strengths | `REPORT.strengths[]` |
| Focus areas | `REPORT.focus[]` |
| Weekly lesson comments | `REPORT.lessons[].summary` |
| Overall parent comment | `REPORT.comment.lead` + `REPORT.comment.paras[]` |
| Next report note | `REPORT.nextReport` |
| Section labels (01, 02, 03) | `engine/ryze-report.js` → `runhead()` calls |

---

## Cancelled vs rescheduled lessons

| Property | Behaviour |
|----------|-----------|
| `cancelled: true` | Striped card, "Lesson Cancelled", excluded from averages, chart shows dashed column |
| `rescheduled: true` | Striped card, "Lesson Rescheduled / Special Schedule", excluded from averages, chart shows dashed column |
| `rescheduledTo: '...'` | Additional line on rescheduled card: "This week's class has been moved to ..." |

---

## CRM integration notes

The `REPORT` object is the single source of truth. To integrate with a CRM or database:

1. Query student, lesson, and tutor data from your database.
2. Map the data to the `REPORT` object shape (see reference above).
3. Generate the HTML file server-side (e.g. string interpolation into the HTML template).
4. Serve the HTML to a headless browser (e.g. Puppeteer, Playwright) to generate the PDF.
5. Store the PDF in the student's file in the CRM.

The engine JS and CSS files are static assets that can be hosted on a CDN or bundled inline for offline use.

---

## File sizes

| File | Size | Notes |
|------|------|-------|
| `engine/ryze-report.js` | ~15 KB | Full rendering engine |
| `engine/ryze-report.css` | ~18 KB | Full design system |
| Per-student report HTML | ~7 KB | Data only |
| Standalone (bundled) HTML | ~805 KB | Self-contained, works offline |

---

*Ryze Education Report Engine — built June 2026*
