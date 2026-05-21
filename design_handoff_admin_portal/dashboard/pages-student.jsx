/* global React, RyzeIcons, RyzePages */
const {
  IconCalendar, IconClock, IconCheck, IconChevronRight, IconArrowRight,
  IconPlus, IconDownload, IconBookOpen, IconPen, IconClipboard, IconStar,
  IconArrowUpRight, IconWarn, IconTrend,
} = RyzeIcons;
const { PageHead, Stat, StatusTag } = RyzePages;

/* ────────────────────────────────────────────────────────────
   Student data
   ──────────────────────────────────────────────────────────── */

const STUDENT_COURSES = [
  { id: "ext1", name: "Maths Extension 1", tutor: "Daniel Kwok", next: "Tue 5:00pm", progress: 78, topic: "Inverse trig differentiation", colour: "" },
  { id: "ext2", name: "Maths Extension 2", tutor: "Priya Aiyar", next: "Thu 7:00pm", progress: 65, topic: "Mechanics: projectile motion", colour: "blue" },
];

const STUDENT_HOMEWORK = [
  { id: "HW-318", title: "Inverse trig derivatives",      course: "Maths Ext 1", due: "Tomorrow",  state: "open",     submitted: false },
  { id: "HW-314", title: "Volumes of revolution",         course: "Maths Ext 2", due: "Friday",    state: "open",     submitted: false },
  { id: "HW-315", title: "Mechanics — projectile motion", course: "Maths Ext 2", due: "Mon 12 May",state: "graded",   submitted: true,  score: "9/10" },
  { id: "HW-311", title: "Vectors quick sheet",           course: "Maths Ext 2", due: "Mon 5 May", state: "graded",   submitted: true,  score: "8/10" },
  { id: "HW-309", title: "Combinatorics review",          course: "Maths Ext 1", due: "Fri 2 May", state: "graded",   submitted: true,  score: "10/10" },
];

const STUDENT_GRADES = [
  { topic: "Differentiation",  mark: 92, cls: 84 },
  { topic: "Integration",      mark: 86, cls: 78 },
  { topic: "Vectors",          mark: 88, cls: 82 },
  { topic: "Combinatorics",    mark: 78, cls: 72 },
  { topic: "Mechanics",        mark: 81, cls: 76 },
  { topic: "Complex numbers",  mark: 74, cls: 70 },
];

/* ────────────────────────────────────────────────────────────
   Student — Dashboard
   ──────────────────────────────────────────────────────────── */

function StudentDashboard({ user }) {
  return (
    <div className="section-stack">
      <PageHead
        eyebrow="Year 12 — HSC"
        title={<>Hey, <span className="accent-text">{user.first}</span>.</>}
        sub="Your next lesson is in 4 hours. Two homeworks are due this week, and you're sitting in the top quartile across Extension 1 — keep it up."
        actions={<button className="btn btn--primary"><IconBookOpen size={14} /> Open AI tutor</button>}
      />

      <div className="row row--12-5">
        {/* Up next card — big, hero-style */}
        <div className="card" style={{ background: "linear-gradient(135deg, color-mix(in oklab, var(--accent) 8%, var(--bg-surface)), var(--bg-surface))" }}>
          <div className="eyebrow accent-text">Up next · in 4h 12m</div>
          <div className="display" style={{ fontSize: 36, marginTop: 10, color: "var(--fg-strong)" }}>
            Inverse trig differentiation
          </div>
          <div className="muted" style={{ marginTop: 10, fontSize: 14 }}>
            <strong className="strong">Maths Extension 1</strong> · Daniel Kwok · Studio B
          </div>
          <div className="row-inline" style={{ marginTop: 22, gap: 10 }}>
            <button className="btn btn--primary">Open lesson plan <IconArrowRight size={13} /></button>
            <button className="btn btn--ghost"><IconCalendar size={13} /> Add to calendar</button>
          </div>
        </div>

        {/* Stat strip vertical */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-md)" }}>
          <Stat label="Homework due"  value="02" footRight="this week" />
          <Stat label="Term average"  value="86%" deltaText="+4 vs last term" deltaDir="up" />
        </div>
      </div>

      {/* Courses */}
      <div className="row row--2">
        {STUDENT_COURSES.map((c) => (
          <div className="card" key={c.id} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="row-inline" style={{ justifyContent: "space-between", width: "100%" }}>
              <div className="eyebrow">{c.tutor}</div>
              <span className="tag tag--accent">Next · {c.next}</span>
            </div>
            <div className="display" style={{ fontSize: 28, color: "var(--fg-strong)", letterSpacing: "-0.015em" }}>
              {c.name}
            </div>
            <div className="muted" style={{ fontSize: 13 }}>Currently studying · <strong className="strong">{c.topic}</strong></div>
            <div className="progress" style={{ marginTop: 6 }}>
              <div className="progress__bar"><span style={{ width: `${c.progress}%` }} /></div>
              <span className="progress__pct tnum">{c.progress}%</span>
            </div>
            <div className="row-inline" style={{ justifyContent: "space-between", marginTop: 4 }}>
              <span className="muted" style={{ fontSize: 12 }}>Through the term syllabus</span>
              <button className="btn btn--quiet">Open <IconArrowUpRight size={13} /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Homework + recent grades */}
      <div className="row row--8-4">
        <div className="card card--flush">
          <div className="card__head">
            <div>
              <div className="card__title">Homework</div>
              <div className="card__sub">2 due this week · 3 graded recently</div>
            </div>
            <button className="btn btn--quiet">View all <IconArrowRight size={13} /></button>
          </div>
          <div>
            {STUDENT_HOMEWORK.slice(0, 4).map((h) => (
              <div key={h.id} className="lesson-row">
                <div className="lesson-row__time">
                  <div className="lesson-row__start" style={{ fontSize: 13 }}>{h.state === "open" ? "Open" : "Graded"}</div>
                  <div className="lesson-row__end">{h.due}</div>
                </div>
                <div className="lesson-row__body">
                  <div className="lesson-row__title">{h.title}</div>
                  <div className="lesson-row__meta">{h.course}{h.score ? ` · scored ${h.score}` : ""}</div>
                </div>
                <div className="lesson-row__state">
                  {h.state === "open"
                    ? <button className="btn btn--primary" style={{ height: 32 }}>Submit</button>
                    : <span className="tag tag--ok">{h.score}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card__title" style={{ marginBottom: 4 }}>Streak</div>
          <div className="card__sub" style={{ marginBottom: 16 }}>You're on a 12-week roll. Don't stop now.</div>
          <div className="display tnum" style={{ fontSize: 64, color: "var(--accent)", letterSpacing: "-0.025em" }}>12</div>
          <div className="muted" style={{ fontSize: 13, marginTop: -4 }}>weeks attended in a row</div>

          <div className="divider" style={{ margin: "20px 0" }} />

          <div className="card__title" style={{ marginBottom: 12 }}>This week's wins</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
            <div className="row-inline" style={{ justifyContent: "space-between" }}>
              <span><IconStar size={12} className="accent-text" /> Best score: <strong className="strong">HW-309</strong></span>
              <span className="tnum strong accent-text">10/10</span>
            </div>
            <div className="row-inline" style={{ justifyContent: "space-between" }}>
              <span><IconTrend size={12} className="accent-text" /> Topic mastered</span>
              <span className="muted">Differentiation</span>
            </div>
            <div className="row-inline" style={{ justifyContent: "space-between" }}>
              <span><IconClock size={12} className="accent-text" /> Time on AI tutor</span>
              <span className="tnum strong">2h 14m</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Student — Courses
   ──────────────────────────────────────────────────────────── */

function StudentCourses() {
  return (
    <div className="section-stack">
      <PageHead
        eyebrow="Enrolled"
        title="Courses"
        sub="Your active courses, term progress and the lessons your tutor has planned next."
      />

      <div className="row row--2">
        {STUDENT_COURSES.map((c) => (
          <div className="card" key={c.id}>
            <div className="row-inline" style={{ justifyContent: "space-between" }}>
              <div className="eyebrow">{c.tutor}</div>
              <span className="tag tag--accent">Next · {c.next}</span>
            </div>
            <div className="display" style={{ fontSize: 32, color: "var(--fg-strong)", marginTop: 10 }}>
              {c.name}
            </div>
            <div className="muted" style={{ fontSize: 13, marginTop: 6 }}>Year 12 · HSC track</div>

            <div className="divider" style={{ margin: "20px 0 16px" }} />

            <div className="muted s-row__hint" style={{ marginBottom: 8 }}>Current topic</div>
            <div className="strong" style={{ fontSize: 15 }}>{c.topic}</div>

            <div className="progress" style={{ marginTop: 16 }}>
              <div className="progress__bar"><span style={{ width: `${c.progress}%` }} /></div>
              <span className="progress__pct tnum">{c.progress}%</span>
            </div>
            <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>Through the term syllabus</div>

            <div className="row-inline" style={{ marginTop: 18, gap: 8 }}>
              <button className="btn btn--ghost">Lesson plan <IconArrowUpRight size={13} /></button>
              <button className="btn btn--quiet">Past lessons</button>
              <button className="btn btn--quiet">Resources</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Student — Homework
   ──────────────────────────────────────────────────────────── */

function StudentHomework() {
  return (
    <div className="section-stack">
      <PageHead
        eyebrow="Across your courses"
        title="Homework"
        sub="What's due, what's graded, and how you scored. Click any row to open the assignment."
      />

      <div className="row row--4">
        <Stat label="Due this week" value="02" />
        <Stat label="Submitted"     value="03" footRight="this term" />
        <Stat label="Average score" value="86%" deltaText="+4 vs last term" deltaDir="up" />
        <Stat label="On time"       value="100%" footRight="all 12 weeks" />
      </div>

      <div className="card card--flush">
        <div className="card__head">
          <div>
            <div className="card__title">All homework</div>
            <div className="card__sub">Most recent first</div>
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Assignment</th>
              <th>Course</th>
              <th>Due</th>
              <th>Status</th>
              <th>Score</th>
              <th style={{ width: 120 }}></th>
            </tr>
          </thead>
          <tbody>
            {STUDENT_HOMEWORK.map((h) => (
              <tr key={h.id}>
                <td>
                  <div className="cell-name">{h.title}</div>
                  <div className="cell-sub mono">{h.id}</div>
                </td>
                <td className="muted">{h.course}</td>
                <td className="muted">{h.due}</td>
                <td><StatusTag state={h.state === "graded" ? "paid" : "due"} /></td>
                <td className="strong tnum">{h.score || "—"}</td>
                <td>
                  {h.state === "open"
                    ? <button className="btn btn--primary" style={{ height: 32 }}>Submit</button>
                    : <button className="btn btn--quiet">View</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Student — Progress (reports + topic mastery)
   ──────────────────────────────────────────────────────────── */

function StudentProgress() {
  return (
    <div className="section-stack">
      <PageHead
        eyebrow="Term 2 · 2026"
        title="Progress"
        sub="Topic-by-topic mastery, your class rank, and tutor-written progress reports."
        actions={<button className="btn btn--ghost"><IconDownload size={14} /> Download report</button>}
      />

      <div className="row row--4">
        <Stat label="Term average"      value="86%" deltaText="+4 vs last term" deltaDir="up" />
        <Stat label="Class rank"        value="3" footRight="of 8 students" />
        <Stat label="Topics mastered"   value="04" footRight="of 6 covered" />
        <Stat label="Tutor sentiment"   value="A" footRight="excellent" />
      </div>

      <div className="row row--8-4">
        <div className="card card--flush">
          <div className="card__head">
            <div>
              <div className="card__title">Topic mastery</div>
              <div className="card__sub">Your mark vs the class average for each topic covered this term.</div>
            </div>
          </div>
          <div style={{ padding: "8px 22px 22px" }}>
            {STUDENT_GRADES.map((g) => (
              <div key={g.topic} className="topic-row">
                <div className="topic-row__name">{g.topic}</div>
                <div className="topic-row__bar">
                  <div className="topic-row__cls" style={{ width: `${g.cls}%` }} />
                  <div className="topic-row__you" style={{ width: `${g.mark}%` }} />
                </div>
                <div className="topic-row__nums tnum">
                  <span className="strong">{g.mark}%</span>
                  <span className="muted">cls {g.cls}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card__title" style={{ marginBottom: 4 }}>Tutor note</div>
          <div className="card__sub" style={{ marginBottom: 16 }}>From Daniel Kwok · 2 days ago</div>
          <p style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 18, color: "var(--fg-strong)", lineHeight: 1.4, margin: 0 }}>
            "Amelia continues to lead the class on differentiation. Push her on harder integration cases next term — the foundation is there."
          </p>
          <div className="divider" style={{ margin: "20px 0" }} />
          <div className="muted" style={{ fontSize: 13 }}>Past reports</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
            {["Term 1 · 2026", "Term 4 · 2025", "Term 3 · 2025"].map((t) => (
              <button key={t} className="row-inline" style={{ justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border-faint)" }}>
                <span className="strong" style={{ fontSize: 13 }}>{t}</span>
                <span className="muted row-inline"><IconDownload size={12} /> PDF</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

window.RyzeStudent = { StudentDashboard, StudentCourses, StudentHomework, StudentProgress };
