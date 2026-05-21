/* global React, RyzeIcons */
const {
  IconHome, IconCalendar, IconBell, IconUsers, IconParent, IconBookOpen,
  IconLessons, IconCheck, IconClipboard, IconCard, IconDollar, IconShield,
  IconMegaphone, IconActivity, IconChevronRight, IconArrowRight, IconArrowUpRight,
  IconPlus, IconFilter, IconSort, IconDownload, IconRefresh, IconMore,
  IconClock, IconMail, IconPhone, IconTrend, IconWarn, IconSearch,
} = RyzeIcons;

/* ────────────────────────────────────────────────────────────
   Fake data — kept tight, no filler beyond what each page needs
   ──────────────────────────────────────────────────────────── */

const STUDENTS = [
  { id: 1, name: "Amelia Tran",      year: "Year 12 — HSC",  class: "Maths Ext 1 · Tue 5pm", parent: "Linda Tran",      progress: 92, status: "active",    last: "2h ago",  initials: "AT", colour: "" },
  { id: 2, name: "Noah Park",        year: "Year 11",        class: "Maths Adv · Mon 6pm",   parent: "Jin Park",        progress: 78, status: "active",    last: "1d ago",  initials: "NP", colour: "blue" },
  { id: 3, name: "Sofia Reyes",      year: "Year 10",        class: "Foundations · Wed 4pm", parent: "Maria Reyes",     progress: 64, status: "at-risk",   last: "5d ago",  initials: "SR", colour: "rose" },
  { id: 4, name: "Hayden Wong",      year: "Year 12 — HSC",  class: "Maths Ext 2 · Thu 7pm", parent: "Cindy Wong",      progress: 88, status: "active",    last: "3h ago",  initials: "HW", colour: "green" },
  { id: 5, name: "Priya Sharma",     year: "Year 9",         class: "Selective Prep · Sat",  parent: "Anjali Sharma",   progress: 81, status: "active",    last: "1h ago",  initials: "PS", colour: "purple" },
  { id: 6, name: "Lachlan O'Brien",  year: "Year 11",        class: "Maths Adv · Mon 6pm",   parent: "Peter O'Brien",   progress: 71, status: "trial",     last: "12h ago", initials: "LO", colour: "blue" },
  { id: 7, name: "Mei Chen",         year: "Year 12 — HSC",  class: "Maths Ext 1 · Tue 5pm", parent: "Wei Chen",        progress: 95, status: "active",    last: "20m ago", initials: "MC", colour: "" },
  { id: 8, name: "Eli Bernstein",    year: "Year 10",        class: "Foundations · Wed 4pm", parent: "Hannah Bernstein",progress: 58, status: "paused",    last: "2w ago",  initials: "EB", colour: "rose" },
];

const CLASSES = [
  { id: "ext1-tue", name: "Maths Extension 1",  level: "Year 12 — HSC",  tutor: "Daniel Kwok",   day: "Tue", time: "5:00–6:30pm", seats: "8 / 8",  rev: "$3,200/wk", state: "running" },
  { id: "ext2-thu", name: "Maths Extension 2",  level: "Year 12 — HSC",  tutor: "Priya Aiyar",   day: "Thu", time: "7:00–8:30pm", seats: "6 / 8",  rev: "$2,400/wk", state: "running" },
  { id: "adv-mon",  name: "Maths Advanced",     level: "Year 11",        tutor: "Daniel Kwok",   day: "Mon", time: "6:00–7:30pm", seats: "9 / 10", rev: "$2,700/wk", state: "running" },
  { id: "fnd-wed",  name: "Foundations",        level: "Year 10",        tutor: "Marcus Webb",   day: "Wed", time: "4:00–5:30pm", seats: "7 / 10", rev: "$1,890/wk", state: "running" },
  { id: "sel-sat",  name: "Selective Prep",     level: "Year 9",         tutor: "Priya Aiyar",   day: "Sat", time: "9:00–11:00am",seats: "10 / 12",rev: "$2,500/wk", state: "running" },
  { id: "oc-sun",   name: "OC Prep",            level: "Year 5",         tutor: "Aria Singh",    day: "Sun", time: "10:00–12:00pm",seats:"5 / 12",  rev: "$1,200/wk", state: "low-seat" },
];

const LESSONS_TODAY = [
  { id: 1, time: "16:00", end: "17:30", title: "Foundations — Algebraic fractions",        tutor: "Marcus Webb",  room: "Studio A",       seats: "7 / 10", state: "upcoming" },
  { id: 2, time: "17:00", end: "18:30", title: "Maths Ext 1 — Inverse trig differentiation", tutor: "Daniel Kwok",  room: "Studio B",       seats: "8 / 8",  state: "live" },
  { id: 3, time: "18:00", end: "19:30", title: "Maths Advanced — Combinatorics review",     tutor: "Daniel Kwok",  room: "Studio A",       seats: "9 / 10", state: "upcoming" },
  { id: 4, time: "19:00", end: "20:30", title: "Maths Ext 2 — Mechanics: projectiles",      tutor: "Priya Aiyar",  room: "Studio C",       seats: "6 / 8",  state: "upcoming" },
];

const PAYMENTS = [
  { id: "INV-2841", student: "Hayden Wong",     parent: "Cindy Wong",      amount: 480, due: "Tomorrow",  state: "due",      method: "Direct debit" },
  { id: "INV-2840", student: "Noah Park",       parent: "Jin Park",        amount: 360, due: "In 3 days", state: "due",      method: "Card" },
  { id: "INV-2839", student: "Sofia Reyes",     parent: "Maria Reyes",     amount: 420, due: "Overdue 2d",state: "overdue",  method: "Direct debit" },
  { id: "INV-2838", student: "Amelia Tran",     parent: "Linda Tran",      amount: 540, due: "Paid",      state: "paid",     method: "Card" },
  { id: "INV-2837", student: "Priya Sharma",    parent: "Anjali Sharma",   amount: 320, due: "Paid",      state: "paid",     method: "BPAY" },
  { id: "INV-2836", student: "Mei Chen",        parent: "Wei Chen",        amount: 540, due: "Paid",      state: "paid",     method: "Direct debit" },
  { id: "INV-2835", student: "Eli Bernstein",   parent: "Hannah Bernstein",amount: 280, due: "Paused",    state: "paused",   method: "—" },
];

const ALERTS = [
  { id: 1, severity: "high",   title: "3 students missed lesson check-ins",       body: "Foundations · Wed 4pm — automated reminders sent.",   when: "8m ago" },
  { id: 2, severity: "med",    title: "Sofia Reyes progress dropping",            body: "3 weeks below class median in Algebra topic.",        when: "1h ago" },
  { id: 3, severity: "low",    title: "Discord bot reconnected",                  body: "Brief outage 14:02–14:04, all reminders delivered.",  when: "2h ago" },
];

const QUICK_ACTIONS = [
  { key: "add-student",  label: "Add student",      icon: IconPlus,        accent: true },
  { key: "schedule",     label: "Schedule lesson",  icon: IconCalendar },
  { key: "invoice",      label: "Send invoice",     icon: IconCard },
  { key: "broadcast",    label: "Announcement",     icon: IconMegaphone },
  { key: "report",       label: "Build report",     icon: IconClipboard },
  { key: "export",       label: "Export data",      icon: IconDownload },
];

/* ────────────────────────────────────────────────────────────
   Page-level reusable bits
   ──────────────────────────────────────────────────────────── */

function PageHead({ eyebrow, title, sub, actions, children }) {
  return (
    <div className="page-head">
      <div>
        {eyebrow ? <div className="page-head__eyebrow">{eyebrow}</div> : null}
        <h1 className="page-head__title">{title}</h1>
        {sub ? <p className="page-head__sub">{sub}</p> : null}
        {children}
      </div>
      {actions ? <div className="page-head__actions">{actions}</div> : null}
    </div>
  );
}

function Stat({ label, value, deltaText, deltaDir, footRight }) {
  return (
    <div className="stat">
      <div className="stat__label">{label}</div>
      <div className="stat__value tnum">{value}</div>
      <div className="stat__foot">
        {deltaText ? (
          <span className={`stat__delta stat__delta--${deltaDir || "up"}`}>
            <IconTrend size={12} />
            {deltaText}
          </span>
        ) : <span />}
        <span>{footRight}</span>
      </div>
    </div>
  );
}

function StatusTag({ state }) {
  const map = {
    active:    { cls: "tag tag--ok",     label: "Active" },
    trial:     { cls: "tag tag--info",   label: "Trial" },
    paused:    { cls: "tag",             label: "Paused" },
    "at-risk": { cls: "tag tag--warn",   label: "At risk" },

    running:   { cls: "tag tag--ok",     label: "Running" },
    "low-seat":{ cls: "tag tag--warn",   label: "Low seats" },

    live:      { cls: "tag tag--accent", label: "Live now" },
    upcoming:  { cls: "tag tag--info",   label: "Upcoming" },
    done:      { cls: "tag",             label: "Done" },

    due:       { cls: "tag tag--warn",   label: "Due" },
    overdue:   { cls: "tag tag--danger", label: "Overdue" },
    paid:      { cls: "tag tag--ok",     label: "Paid" },

    high:      { cls: "tag tag--danger", label: "High" },
    med:       { cls: "tag tag--warn",   label: "Medium" },
    low:       { cls: "tag tag--info",   label: "Low" },
  };
  const m = map[state] || { cls: "tag", label: state };
  return <span className={m.cls}>{m.label}</span>;
}

/* ────────────────────────────────────────────────────────────
   Page: Overview
   ──────────────────────────────────────────────────────────── */

function OverviewPage({ user }) {
  const today = new Date().toLocaleDateString("en-AU", {
    weekday: "long", day: "numeric", month: "long",
  });

  return (
    <div className="section-stack">
      <PageHead
        eyebrow={today}
        title={<>Good morning, <span className="accent-text">{user.first}</span>.</>}
        sub="Four lessons running today, two payments due tomorrow, and one progress report needs your signature. Everything else is quiet."
        actions={
          <>
            <button className="btn btn--ghost"><IconRefresh size={14} /> Refresh</button>
            <button className="btn btn--primary"><IconPlus size={14} /> Quick action</button>
          </>
        }
      />

      {/* Stats */}
      <div className="row row--4">
        <Stat label="Active students"  value="142"   deltaText="+6 this week"  deltaDir="up"   footRight="92% retention" />
        <Stat label="Classes running"  value="18"    deltaText="2 with low seats" deltaDir="down" footRight="5 tutors" />
        <Stat label="Lessons today"    value="04"    deltaText="1 live now"    deltaDir="up"   footRight="08 tomorrow" />
        <Stat label="Outstanding"      value="$2.4k" deltaText="3 overdue"     deltaDir="down" footRight="of $24k due" />
      </div>

      {/* Two-up: Today + Alerts */}
      <div className="row row--8-4">
        <div className="card card--flush">
          <div className="card__head">
            <div>
              <div className="card__title">Today's lessons</div>
              <div className="card__sub">4 scheduled · 1 live now</div>
            </div>
            <button className="btn btn--quiet">View calendar <IconArrowRight size={13} /></button>
          </div>
          <div>
            {LESSONS_TODAY.map((l) => (
              <div key={l.id} className="lesson-row">
                <div className="lesson-row__time tnum">
                  <div className="lesson-row__start">{l.time}</div>
                  <div className="lesson-row__end">→ {l.end}</div>
                </div>
                <div className="lesson-row__body">
                  <div className="lesson-row__title">{l.title}</div>
                  <div className="lesson-row__meta">
                    {l.tutor} · {l.room} · <span className="tnum">{l.seats}</span>
                  </div>
                </div>
                <div className="lesson-row__state">
                  <StatusTag state={l.state} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card card--flush">
          <div className="card__head">
            <div>
              <div className="card__title">Needs attention</div>
              <div className="card__sub">3 open alerts</div>
            </div>
            <button className="btn btn--quiet">All alerts <IconArrowRight size={13} /></button>
          </div>
          <div>
            {ALERTS.map((a) => (
              <div key={a.id} className="alert-row">
                <div className={`alert-row__pip alert-row__pip--${a.severity}`}>
                  <IconWarn size={13} />
                </div>
                <div className="alert-row__body">
                  <div className="alert-row__title">{a.title}</div>
                  <div className="alert-row__sub">{a.body}</div>
                </div>
                <div className="alert-row__when">{a.when}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="card">
        <div className="quick">
          <div className="quick__label">
            <div className="eyebrow">Shortcuts</div>
            <div className="quick__hint">Frequent tasks, one click away.</div>
          </div>
          <div className="quick__grid">
            {QUICK_ACTIONS.map((q) => {
              const Ic = q.icon;
              return (
                <button key={q.key} className={`quick-btn ${q.accent ? "is-accent" : ""}`}>
                  <span className="quick-btn__icon"><Ic size={16} /></span>
                  <span className="quick-btn__label">{q.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer health strip */}
      <div className="health">
        <div className="health__item">
          <span className="dot" /> <strong className="strong">Discord bot</strong>
          <span className="muted">· online · 13ms latency</span>
        </div>
        <div className="health__item">
          <span className="dot" /> <strong className="strong">Calendar sync</strong>
          <span className="muted">· last 14s ago</span>
        </div>
        <div className="health__item">
          <span className="dot" /> <strong className="strong">Payments</strong>
          <span className="muted">· 6 webhooks queued</span>
        </div>
        <div className="health__sep" />
        <div className="health__time">Sydney · <span className="tnum">11:42 AM</span></div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Page: Students
   ──────────────────────────────────────────────────────────── */

function StudentsPage() {
  const [filter, setFilter] = React.useState("All");
  const filtered = STUDENTS.filter((s) => filter === "All" || s.status === filter.toLowerCase().replace(" ", "-"));
  return (
    <div className="section-stack">
      <PageHead
        eyebrow="Roster"
        title="Students"
        sub="142 enrolled across 18 classes. Sort, filter and drill in — every row links to a full profile."
        actions={
          <>
            <button className="btn btn--ghost"><IconDownload size={14} /> Export</button>
            <button className="btn btn--primary"><IconPlus size={14} /> Add student</button>
          </>
        }
      />

      <div className="row row--4">
        <Stat label="Active" value="124" footRight="87%" />
        <Stat label="Trial"  value="08"  footRight="4 converting" />
        <Stat label="Paused" value="06"  footRight="2 returning soon" />
        <Stat label="At risk"value="04"  deltaText="+1 this week" deltaDir="down" />
      </div>

      <div className="card card--flush">
        <div className="toolbar">
          <div className="toolbar__search">
            <IconSearch size={14} />
            <input placeholder="Search by name, parent, class…" />
          </div>
          {["All", "Active", "Trial", "Paused", "At-risk"].map((f) => (
            <button
              key={f}
              className={`toolbar__chip ${filter === f ? "is-active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
          <button className="btn btn--ghost"><IconFilter size={14} /> More filters</button>
          <button className="btn btn--quiet"><IconSort size={14} /> Sort</button>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Year & class</th>
              <th>Parent</th>
              <th>Progress</th>
              <th>Status</th>
              <th>Last seen</th>
              <th style={{ width: 40 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id}>
                <td>
                  <div className="cell-primary">
                    <div className={`cell-avatar ${s.colour ? `cell-avatar--${s.colour}` : ""}`}>{s.initials}</div>
                    <div className="cell-meta">
                      <div className="cell-name">{s.name}</div>
                      <div className="cell-sub">ID #RYZ-{1200 + s.id * 7}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="cell-name">{s.year}</div>
                  <div className="cell-sub">{s.class}</div>
                </td>
                <td>
                  <div className="cell-name">{s.parent}</div>
                  <div className="cell-sub muted-contact">
                    <IconMail size={11} /> contact preferred
                  </div>
                </td>
                <td style={{ minWidth: 160 }}>
                  <div className="progress">
                    <div className="progress__bar"><span style={{ width: `${s.progress}%` }} /></div>
                    <span className="progress__pct tnum">{s.progress}%</span>
                  </div>
                </td>
                <td><StatusTag state={s.status} /></td>
                <td className="muted tnum">{s.last}</td>
                <td><button className="row-act"><IconMore size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="table-foot">
          <div className="muted">Showing <span className="tnum strong">{filtered.length}</span> of <span className="tnum">142</span></div>
          <div className="pager">
            <button className="btn btn--quiet">‹</button>
            <span className="muted tnum">1 / 18</span>
            <button className="btn btn--quiet">›</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Page: Classes
   ──────────────────────────────────────────────────────────── */

function ClassesPage() {
  return (
    <div className="section-stack">
      <PageHead
        eyebrow="Operations"
        title="Classes"
        sub="Recurring group sessions and their tutors. Click any class to manage roster, attendance and homework."
        actions={
          <>
            <button className="btn btn--ghost"><IconCalendar size={14} /> Week view</button>
            <button className="btn btn--primary"><IconPlus size={14} /> New class</button>
          </>
        }
      />

      <div className="class-grid">
        {CLASSES.map((c) => (
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
                <div className="eyebrow">Tutor</div>
                <div className="strong">{c.tutor}</div>
              </div>
              <div>
                <div className="eyebrow">Seats</div>
                <div className="strong tnum">{c.seats}</div>
              </div>
              <div>
                <div className="eyebrow">Revenue</div>
                <div className="strong tnum">{c.rev}</div>
              </div>
            </div>

            <div className="class-card__foot">
              <button className="btn btn--quiet">Open <IconArrowUpRight size={13} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Page: Lessons (today timeline)
   ──────────────────────────────────────────────────────────── */

function LessonsPage() {
  const HOURS = ["09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20"];

  // Map lessons onto timeline (1 hour = 64px)
  const blocks = [
    { id: 1, room: "Studio A", start: 16, end: 17.5, title: "Foundations",      tutor: "Marcus Webb",  state: "upcoming" },
    { id: 2, room: "Studio A", start: 18, end: 19.5, title: "Maths Advanced",   tutor: "Daniel Kwok",  state: "upcoming" },
    { id: 3, room: "Studio B", start: 17, end: 18.5, title: "Maths Ext 1",      tutor: "Daniel Kwok",  state: "live" },
    { id: 4, room: "Studio B", start: 10, end: 11.5, title: "OC Prep · Make-up",tutor: "Aria Singh",   state: "done" },
    { id: 5, room: "Studio C", start: 19, end: 20.5, title: "Maths Ext 2",      tutor: "Priya Aiyar",  state: "upcoming" },
    { id: 6, room: "Studio C", start: 11, end: 12,   title: "1:1 Intro",        tutor: "Priya Aiyar",  state: "done" },
  ];
  const rooms = ["Studio A", "Studio B", "Studio C"];

  const startHour = 9;
  const colW = 88;

  return (
    <div className="section-stack">
      <PageHead
        eyebrow="Today · Wed 15 May"
        title="Lessons"
        sub="The day, by studio. Drag to reschedule, click any block to manage attendance and homework."
        actions={
          <>
            <div className="seg">
              <button className="seg__btn is-active">Day</button>
              <button className="seg__btn">Week</button>
              <button className="seg__btn">Month</button>
            </div>
            <button className="btn btn--primary"><IconPlus size={14} /> Schedule</button>
          </>
        }
      />

      <div className="row row--4">
        <Stat label="Lessons today"  value="04" footRight="1 live now" />
        <Stat label="Attendance"     value="92%" deltaText="+3 vs last wk" deltaDir="up" />
        <Stat label="Make-ups owed"  value="03" footRight="2 booked" />
        <Stat label="Empty seats"    value="07" footRight="across 4 lessons" />
      </div>

      <div className="card card--flush">
        <div className="card__head">
          <div>
            <div className="card__title">Schedule · by studio</div>
            <div className="card__sub">3 studios · 4 lessons · 1 live</div>
          </div>
          <button className="btn btn--quiet">Print roster <IconArrowRight size={13} /></button>
        </div>
        <div className="schedule">
          <div className="schedule__rooms">
            <div className="schedule__corner" />
            {rooms.map((r) => (
              <div key={r} className="schedule__room">
                <div className="schedule__room-name">{r}</div>
                <div className="schedule__room-sub muted">Capacity 10</div>
              </div>
            ))}
          </div>
          <div className="schedule__scroll scroll-thin">
            <div className="schedule__grid" style={{ width: colW * HOURS.length + 1 }}>
              <div className="schedule__hours">
                {HOURS.map((h) => (
                  <div key={h} className="schedule__hour" style={{ width: colW }}>
                    <span className="tnum">{h}:00</span>
                  </div>
                ))}
              </div>
              {rooms.map((r) => (
                <div key={r} className="schedule__lane">
                  {HOURS.map((h, i) => (
                    <div key={i} className="schedule__cell" style={{ width: colW }} />
                  ))}
                  {blocks.filter((b) => b.room === r).map((b) => (
                    <div
                      key={b.id}
                      className={`schedule__block schedule__block--${b.state}`}
                      style={{
                        left: (b.start - startHour) * colW,
                        width: (b.end - b.start) * colW - 4,
                      }}
                    >
                      <div className="schedule__block-title">{b.title}</div>
                      <div className="schedule__block-meta">{b.tutor}</div>
                      <div className="schedule__block-state">
                        <StatusTag state={b.state} />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Page: Payments
   ──────────────────────────────────────────────────────────── */

function PaymentsPage() {
  return (
    <div className="section-stack">
      <PageHead
        eyebrow="Finance"
        title="Payments"
        sub="Invoices, direct debits and outstanding balances. Run a chase, mark paid, or export to Xero."
        actions={
          <>
            <button className="btn btn--ghost"><IconDownload size={14} /> Export to Xero</button>
            <button className="btn btn--primary"><IconPlus size={14} /> New invoice</button>
          </>
        }
      />

      <div className="row row--4">
        <Stat label="This week"    value="$8,420" deltaText="+12% vs last" deltaDir="up"   footRight="22 invoices" />
        <Stat label="Outstanding"  value="$2,400" deltaText="3 overdue"    deltaDir="down" footRight="of $24k due" />
        <Stat label="Overdue"      value="03"     footRight="$1,260"        />
        <Stat label="Auto-collect" value="78%"    deltaText="Direct debit"  deltaDir="up" />
      </div>

      <div className="row row--12-5">
        <div className="card card--flush">
          <div className="toolbar">
            <div className="toolbar__search">
              <IconSearch size={14} />
              <input placeholder="Search invoices, students, parents…" />
            </div>
            {["All", "Due", "Overdue", "Paid"].map((f, i) => (
              <button key={f} className={`toolbar__chip ${i === 0 ? "is-active" : ""}`}>{f}</button>
            ))}
            <button className="btn btn--ghost"><IconFilter size={14} /> Filters</button>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Student / Parent</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Due</th>
              </tr>
            </thead>
            <tbody>
              {PAYMENTS.map((p) => (
                <tr key={p.id}>
                  <td className="mono strong" style={{ fontSize: 12.5 }}>{p.id}</td>
                  <td>
                    <div className="cell-name">{p.student}</div>
                    <div className="cell-sub">{p.parent}</div>
                  </td>
                  <td className="strong tnum">${p.amount.toLocaleString()}</td>
                  <td className="muted">{p.method}</td>
                  <td><StatusTag state={p.state} /></td>
                  <td className="muted">{p.due}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card__title" style={{ marginBottom: 6 }}>Cash collected</div>
          <div className="card__sub" style={{ marginBottom: 18 }}>Last 8 weeks</div>
          <Bars />
          <div className="divider" style={{ margin: "20px 0" }} />
          <div className="card__title" style={{ marginBottom: 12 }}>Top earners</div>
          <div className="ranks">
            {[
              { who: "Maths Ext 2", v: "$2,400" },
              { who: "Maths Ext 1", v: "$3,200" },
              { who: "Maths Advanced", v: "$2,700" },
              { who: "Selective Prep", v: "$2,500" },
            ].map((r, i) => (
              <div key={r.who} className="ranks__row">
                <div className="ranks__rank tnum">{String(i + 1).padStart(2, "0")}</div>
                <div className="ranks__who">{r.who}</div>
                <div className="ranks__v tnum strong">{r.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Bars() {
  const heights = [44, 60, 52, 71, 58, 66, 78, 82];
  const labels  = ["W1","W2","W3","W4","W5","W6","W7","W8"];
  return (
    <div className="bars">
      {heights.map((h, i) => (
        <div key={i} className="bars__col">
          <div className="bars__bar" style={{ height: `${h}%` }} />
          <div className="bars__label">{labels[i]}</div>
        </div>
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Page: generic placeholder for nav items we haven't mocked
   ──────────────────────────────────────────────────────────── */

function PlaceholderPage({ title, sub }) {
  return (
    <div className="section-stack">
      <PageHead eyebrow="Coming up" title={title} sub={sub} />
      <div className="card">
        <div className="empty">
          <div className="empty__art"><IconClock size={26} /></div>
          <div className="empty__title">In design</div>
          <div className="empty__body">
            This module is part of the portal scope — wireframes ready,
            page-level mock coming in the next iteration. The shell, type, colour and
            density choices above apply here too.
          </div>
          <button className="btn btn--ghost">Open in Figma <IconArrowUpRight size={13} /></button>
        </div>
      </div>
    </div>
  );
}

window.RyzePages = {
  OverviewPage, StudentsPage, ClassesPage, LessonsPage, PaymentsPage, PlaceholderPage,
  // Shared building blocks reused by tutor/student/parent pages
  PageHead, Stat, StatusTag, Bars,
};
