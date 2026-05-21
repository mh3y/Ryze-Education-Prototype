/* global React, RyzeIcons, RyzePages */
const {
  IconCalendar, IconClock, IconCheck, IconChevronRight, IconArrowRight,
  IconPlus, IconFilter, IconSort, IconDownload, IconMore, IconSearch,
  IconBookOpen, IconUsers, IconPen, IconClipboard, IconStar, IconArrowUpRight,
  IconWarn, IconMail,
} = RyzeIcons;
const { PageHead, Stat, StatusTag } = RyzePages;

/* ────────────────────────────────────────────────────────────
   Tutor data (light fixtures — easy to swap later)
   ──────────────────────────────────────────────────────────── */

const TUTOR_TODAY = [
  { id: 1, time: "16:00", end: "17:30", class: "Foundations · Year 10",   roster: 7,  state: "upcoming",  room: "Studio A" },
  { id: 2, time: "18:00", end: "19:30", class: "Maths Advanced · Year 11", roster: 9,  state: "upcoming",  room: "Studio A" },
];

const TUTOR_CLASSES = [
  { id: "fnd-wed", name: "Foundations",       level: "Year 10",       day: "Wed", time: "4:00–5:30pm",  size: "7 / 10",  hw: "3 / 7 graded",  state: "running" },
  { id: "adv-mon", name: "Maths Advanced",    level: "Year 11",       day: "Mon", time: "6:00–7:30pm",  size: "9 / 10",  hw: "All graded",    state: "running" },
  { id: "ext1-tue",name: "Maths Extension 1", level: "Year 12 — HSC", day: "Tue", time: "5:00–6:30pm",  size: "8 / 8",   hw: "5 / 8 graded",  state: "running" },
];

const TUTOR_ROSTER = [
  { id: 1, name: "Amelia Tran",     yr: "Year 12", initials: "AT", colour: "",       last: "Last lesson · present", state: "present" },
  { id: 2, name: "Mei Chen",        yr: "Year 12", initials: "MC", colour: "blue",   last: "Last lesson · present", state: "present" },
  { id: 3, name: "Hayden Wong",     yr: "Year 12", initials: "HW", colour: "green",  last: "Last lesson · present", state: "present" },
  { id: 4, name: "Sofia Reyes",     yr: "Year 10", initials: "SR", colour: "rose",   last: "Missed 2 lessons",      state: "missing" },
  { id: 5, name: "Eli Bernstein",   yr: "Year 10", initials: "EB", colour: "rose",   last: "Paused enrolment",      state: "paused" },
  { id: 6, name: "Priya Sharma",    yr: "Year 9",  initials: "PS", colour: "purple", last: "Last lesson · late",    state: "late" },
  { id: 7, name: "Lachlan O'Brien", yr: "Year 11", initials: "LO", colour: "blue",   last: "Last lesson · present", state: "present" },
];

const TUTOR_HOMEWORK = [
  { id: "HW-318", title: "Inverse trig derivatives",        cls: "Maths Ext 1",  due: "Tomorrow",  submitted: 6, total: 8,  state: "open" },
  { id: "HW-317", title: "Combinatorics problem set",       cls: "Maths Adv",    due: "In 3 days", submitted: 4, total: 9,  state: "open" },
  { id: "HW-316", title: "Algebraic fractions worksheet",   cls: "Foundations",  due: "Yesterday", submitted: 7, total: 7,  state: "grading" },
  { id: "HW-315", title: "Mechanics — projectile motion",   cls: "Maths Ext 2",  due: "1 week ago",submitted: 6, total: 6,  state: "graded" },
];

/* ────────────────────────────────────────────────────────────
   Tutor — Overview
   ──────────────────────────────────────────────────────────── */

function TutorOverview({ user }) {
  return (
    <div className="section-stack">
      <PageHead
        eyebrow="Wednesday 15 May"
        title={<>Welcome back, <span className="accent-text">{user.first}</span>.</>}
        sub="Two lessons today, three ungraded homeworks across your classes, and one student you might want to check in on."
        actions={<>
          <button className="btn btn--ghost"><IconCheck size={14} /> Take attendance</button>
          <button className="btn btn--primary"><IconPlus size={14} /> New homework</button>
        </>}
      />

      <div className="row row--4">
        <Stat label="Today's lessons"   value="02"  footRight="Studio A · both" />
        <Stat label="Students taught"   value="24"  deltaText="+2 trial" deltaDir="up" footRight="across 3 classes" />
        <Stat label="Hours this week"   value="12"  footRight="of 16 booked" />
        <Stat label="To grade"          value="03"  deltaText="2 overdue" deltaDir="down" />
      </div>

      <div className="row row--8-4">
        {/* Today's lessons */}
        <div className="card card--flush">
          <div className="card__head">
            <div>
              <div className="card__title">Your lessons today</div>
              <div className="card__sub">2 scheduled · take attendance from each row.</div>
            </div>
            <button className="btn btn--quiet">Open week <IconArrowRight size={13} /></button>
          </div>
          <div>
            {TUTOR_TODAY.map((l) => (
              <div key={l.id} className="lesson-row">
                <div className="lesson-row__time">
                  <div className="lesson-row__start">{l.time}</div>
                  <div className="lesson-row__end">→ {l.end}</div>
                </div>
                <div className="lesson-row__body">
                  <div className="lesson-row__title">{l.class}</div>
                  <div className="lesson-row__meta">{l.room} · {l.roster} students enrolled</div>
                </div>
                <div className="lesson-row__state row-inline" style={{ gap: 8 }}>
                  <button className="btn btn--quiet"><IconCheck size={13} /> Mark</button>
                  <StatusTag state={l.state} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Needs attention */}
        <div className="card card--flush">
          <div className="card__head">
            <div>
              <div className="card__title">Needs attention</div>
              <div className="card__sub">3 items across your classes</div>
            </div>
          </div>
          <div>
            <div className="alert-row">
              <div className="alert-row__pip alert-row__pip--med"><IconWarn size={13} /></div>
              <div className="alert-row__body">
                <div className="alert-row__title">Sofia Reyes — 2 lessons missed</div>
                <div className="alert-row__sub">Foundations · last absent Wed 8 May.</div>
              </div>
              <div className="alert-row__when">3d</div>
            </div>
            <div className="alert-row">
              <div className="alert-row__pip alert-row__pip--low"><IconPen size={13} /></div>
              <div className="alert-row__body">
                <div className="alert-row__title">HW-317 — half the class hasn't submitted</div>
                <div className="alert-row__sub">Maths Advanced · combinatorics set, due in 3 days.</div>
              </div>
              <div className="alert-row__when">12h</div>
            </div>
            <div className="alert-row">
              <div className="alert-row__pip alert-row__pip--low"><IconClipboard size={13} /></div>
              <div className="alert-row__body">
                <div className="alert-row__title">Progress report due — Amelia Tran</div>
                <div className="alert-row__sub">Term 2 progress report waiting on you.</div>
              </div>
              <div className="alert-row__when">1d</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions row (lighter version for tutor) */}
      <div className="card">
        <div className="quick">
          <div className="quick__label">
            <div className="eyebrow">Shortcuts</div>
            <div className="quick__hint">Day-to-day tutor actions, one click away.</div>
          </div>
          <div className="quick__grid">
            <button className="quick-btn is-accent">
              <span className="quick-btn__icon"><IconCheck size={16} /></span>
              <span className="quick-btn__label">Take attendance</span>
            </button>
            <button className="quick-btn">
              <span className="quick-btn__icon"><IconPen size={16} /></span>
              <span className="quick-btn__label">Assign homework</span>
            </button>
            <button className="quick-btn">
              <span className="quick-btn__icon"><IconClipboard size={16} /></span>
              <span className="quick-btn__label">Write report</span>
            </button>
            <button className="quick-btn">
              <span className="quick-btn__icon"><IconBookOpen size={16} /></span>
              <span className="quick-btn__label">Lesson plan</span>
            </button>
            <button className="quick-btn">
              <span className="quick-btn__icon"><IconMail size={16} /></span>
              <span className="quick-btn__label">Message parent</span>
            </button>
            <button className="quick-btn">
              <span className="quick-btn__icon"><IconDownload size={16} /></span>
              <span className="quick-btn__label">Export grades</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Tutor — Classes
   ──────────────────────────────────────────────────────────── */

function TutorClasses() {
  return (
    <div className="section-stack">
      <PageHead
        eyebrow="My teaching"
        title="Classes"
        sub="Three recurring classes this term. Click any class to open the roster, attendance and homework tools."
        actions={<button className="btn btn--ghost"><IconCalendar size={14} /> Week view</button>}
      />

      <div className="class-grid">
        {TUTOR_CLASSES.map((c) => (
          <div className="class-card" key={c.id}>
            <div className="class-card__head">
              <div className="class-card__day">
                <div className="class-card__dow">{c.day}</div>
                <div className="class-card__time tnum">{c.time.split("–")[0]}</div>
              </div>
              <StatusTag state={c.state} />
            </div>
            <div className="class-card__name">{c.name}</div>
            <div className="class-card__level muted">{c.level}</div>
            <div className="class-card__divider" />
            <div className="class-card__meta">
              <div>
                <div className="eyebrow">Size</div>
                <div className="strong tnum">{c.size}</div>
              </div>
              <div>
                <div className="eyebrow">Time</div>
                <div className="strong">{c.time}</div>
              </div>
              <div>
                <div className="eyebrow">Homework</div>
                <div className="strong">{c.hw}</div>
              </div>
            </div>
            <div className="class-card__foot">
              <button className="btn btn--quiet">Open class <IconArrowUpRight size={13} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Tutor — Attendance (mark-present roster)
   ──────────────────────────────────────────────────────────── */

function TutorAttendance() {
  const [marks, setMarks] = React.useState(
    () => Object.fromEntries(TUTOR_ROSTER.map((s) => [s.id, s.state]))
  );
  const tally = Object.values(marks).reduce((a, v) => ({ ...a, [v]: (a[v] || 0) + 1 }), {});

  function setMark(id, val) {
    setMarks((m) => ({ ...m, [id]: val }));
  }

  return (
    <div className="section-stack">
      <PageHead
        eyebrow="Wednesday 15 May · Studio A"
        title="Attendance"
        sub="Foundations · Year 10 — mark who's in the room. Roll persists per-lesson and feeds the parent dashboard."
        actions={<>
          <button className="btn btn--ghost">Mark all present</button>
          <button className="btn btn--primary"><IconCheck size={14} /> Save roll</button>
        </>}
      />

      <div className="row row--4">
        <Stat label="Roll size"   value={String(TUTOR_ROSTER.length).padStart(2, "0")} footRight="enrolled" />
        <Stat label="Present"     value={String(tally.present || 0).padStart(2, "0")}  deltaText="Looking good" deltaDir="up" />
        <Stat label="Late"        value={String(tally.late || 0).padStart(2, "0")}    footRight="counts as present" />
        <Stat label="Absent"      value={String((tally.missing || 0) + (tally.paused || 0)).padStart(2, "0")} deltaText={(tally.missing || 0) > 0 ? "Reminder sent" : "—"} deltaDir="down" />
      </div>

      <div className="card card--flush">
        <div className="toolbar">
          <div className="toolbar__search">
            <IconSearch size={14} />
            <input placeholder="Search by name…" />
          </div>
          <button className="toolbar__chip is-active">All</button>
          <button className="toolbar__chip">Present</button>
          <button className="toolbar__chip">Late</button>
          <button className="toolbar__chip">Absent</button>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Year</th>
              <th>Last seen</th>
              <th style={{ width: 280 }}>Today</th>
            </tr>
          </thead>
          <tbody>
            {TUTOR_ROSTER.map((s) => (
              <tr key={s.id}>
                <td>
                  <div className="cell-primary">
                    <div className={`cell-avatar ${s.colour ? `cell-avatar--${s.colour}` : ""}`}>{s.initials}</div>
                    <div className="cell-meta">
                      <div className="cell-name">{s.name}</div>
                      <div className="cell-sub">{s.last}</div>
                    </div>
                  </div>
                </td>
                <td className="muted">{s.yr}</td>
                <td><StatusTag state={s.state === "present" ? "active" : s.state === "missing" ? "at-risk" : s.state === "late" ? "trial" : "paused"} /></td>
                <td>
                  <div className="seg" style={{ width: "100%" }}>
                    {["present", "late", "missing", "paused"].map((v) => (
                      <button
                        key={v}
                        className={`seg__btn ${marks[s.id] === v ? "is-active" : ""}`}
                        onClick={() => setMark(s.id, v)}
                      >
                        {v === "missing" ? "Absent" : v.charAt(0).toUpperCase() + v.slice(1)}
                      </button>
                    ))}
                  </div>
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
   Tutor — Homework
   ──────────────────────────────────────────────────────────── */

function TutorHomework() {
  return (
    <div className="section-stack">
      <PageHead
        eyebrow="Across your classes"
        title="Homework"
        sub="Assignments you've set, ordered by due date. Drill in to grade or send a reminder."
        actions={<button className="btn btn--primary"><IconPlus size={14} /> New homework</button>}
      />

      <div className="row row--4">
        <Stat label="Open"      value="02" footRight="this week" />
        <Stat label="To grade"  value="01" deltaText="overdue 1d" deltaDir="down" />
        <Stat label="Graded"    value="01" footRight="this term" />
        <Stat label="Avg score" value="78%" deltaText="+4 vs last" deltaDir="up" />
      </div>

      <div className="card card--flush">
        <div className="toolbar">
          <div className="toolbar__search">
            <IconSearch size={14} />
            <input placeholder="Search homework…" />
          </div>
          {["All", "Open", "To grade", "Graded"].map((f, i) => (
            <button key={f} className={`toolbar__chip ${i === 0 ? "is-active" : ""}`}>{f}</button>
          ))}
          <button className="btn btn--ghost"><IconFilter size={14} /> Filters</button>
          <button className="btn btn--quiet"><IconSort size={14} /> Sort</button>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Assignment</th>
              <th>Class</th>
              <th>Submitted</th>
              <th>Due</th>
              <th>Status</th>
              <th style={{ width: 40 }}></th>
            </tr>
          </thead>
          <tbody>
            {TUTOR_HOMEWORK.map((h) => {
              const pct = (h.submitted / h.total) * 100;
              return (
                <tr key={h.id}>
                  <td>
                    <div className="cell-name">{h.title}</div>
                    <div className="cell-sub mono">{h.id}</div>
                  </td>
                  <td className="muted">{h.cls}</td>
                  <td style={{ minWidth: 160 }}>
                    <div className="progress">
                      <div className="progress__bar"><span style={{ width: `${pct}%` }} /></div>
                      <span className="progress__pct tnum">{h.submitted}/{h.total}</span>
                    </div>
                  </td>
                  <td className="muted">{h.due}</td>
                  <td><StatusTag state={h.state === "graded" ? "paid" : h.state === "grading" ? "due" : "upcoming"} /></td>
                  <td><button className="row-act"><IconMore size={16} /></button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

window.RyzeTutor = { TutorOverview, TutorClasses, TutorAttendance, TutorHomework };
