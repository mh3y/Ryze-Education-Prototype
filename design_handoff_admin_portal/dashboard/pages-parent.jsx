/* global React, RyzeIcons, RyzePages */
const {
  IconCalendar, IconClock, IconCheck, IconChevronRight, IconArrowRight,
  IconPlus, IconDownload, IconCard, IconBookOpen, IconClipboard, IconStar,
  IconArrowUpRight, IconWarn, IconTrend, IconMail, IconMore,
} = RyzeIcons;
const { PageHead, Stat, StatusTag, Bars } = RyzePages;

/* ────────────────────────────────────────────────────────────
   Parent data — two kids by default
   ──────────────────────────────────────────────────────────── */

const PARENT_KIDS = [
  {
    id: 1, name: "Amelia Tran", year: "Year 12 — HSC", initials: "AT", colour: "",
    course: "Maths Extension 1", next: "Tue 5:00pm with Daniel Kwok",
    avg: 86, attend: 100, recent: "Scored 10/10 on HW-309",
  },
  {
    id: 2, name: "Liam Tran", year: "Year 9", initials: "LT", colour: "blue",
    course: "Selective Prep", next: "Sat 9:00am with Priya Aiyar",
    avg: 74, attend: 92, recent: "Missed one practice paper",
  },
];

const PARENT_SCHEDULE = [
  { day: "Mon 13", time: "—",       title: "No lessons today",                kid: "—",      type: "free" },
  { day: "Tue 14", time: "17:00",   title: "Maths Extension 1",               kid: "Amelia", type: "lesson" },
  { day: "Wed 15", time: "—",       title: "Progress check-in (online)",      kid: "Amelia", type: "checkin" },
  { day: "Thu 16", time: "—",       title: "No lessons today",                kid: "—",      type: "free" },
  { day: "Fri 17", time: "—",       title: "Selective Prep — homework due",   kid: "Liam",   type: "due" },
  { day: "Sat 18", time: "09:00",   title: "Selective Prep",                  kid: "Liam",   type: "lesson" },
  { day: "Sun 19", time: "—",       title: "Free",                            kid: "—",      type: "free" },
];

const PARENT_REPORTS = [
  { id: "R-238", kid: "Amelia Tran", term: "Term 2 · 2026",  tutor: "Daniel Kwok",  state: "ready",   when: "2d ago"  },
  { id: "R-235", kid: "Liam Tran",   term: "Term 2 · 2026",  tutor: "Priya Aiyar",  state: "draft",   when: "—"       },
  { id: "R-211", kid: "Amelia Tran", term: "Term 1 · 2026",  tutor: "Daniel Kwok",  state: "archived", when: "3 mo ago" },
  { id: "R-209", kid: "Liam Tran",   term: "Term 1 · 2026",  tutor: "Priya Aiyar",  state: "archived", when: "3 mo ago" },
  { id: "R-187", kid: "Amelia Tran", term: "Term 4 · 2025",  tutor: "Daniel Kwok",  state: "archived", when: "6 mo ago" },
];

const PARENT_INVOICES = [
  { id: "INV-2840", kid: "Amelia Tran", amount: 540, due: "Tomorrow",  state: "due",     period: "May 2026" },
  { id: "INV-2841", kid: "Liam Tran",   amount: 320, due: "In 3 days", state: "due",     period: "May 2026" },
  { id: "INV-2820", kid: "Amelia Tran", amount: 540, due: "Paid",      state: "paid",    period: "Apr 2026" },
  { id: "INV-2819", kid: "Liam Tran",   amount: 320, due: "Paid",      state: "paid",    period: "Apr 2026" },
  { id: "INV-2799", kid: "Amelia Tran", amount: 540, due: "Paid",      state: "paid",    period: "Mar 2026" },
  { id: "INV-2798", kid: "Liam Tran",   amount: 320, due: "Paid",      state: "paid",    period: "Mar 2026" },
];

/* ────────────────────────────────────────────────────────────
   Parent — Dashboard
   ──────────────────────────────────────────────────────────── */

function ParentDashboard({ user }) {
  return (
    <div className="section-stack">
      <PageHead
        eyebrow="Family overview"
        title={<>Welcome, <span className="accent-text">{user.first}</span>.</>}
        sub="Two children enrolled, three lessons this week, and one invoice due tomorrow. Everything else is on track."
        actions={<>
          <button className="btn btn--ghost"><IconCard size={14} /> Pay $860 due</button>
          <button className="btn btn--primary"><IconMail size={14} /> Message tutor</button>
        </>}
      />

      <div className="row row--4">
        <Stat label="Children enrolled" value="02" footRight="Amelia · Liam" />
        <Stat label="Lessons this week" value="03" footRight="next: Tue 5pm" />
        <Stat label="Term average"      value="80%" deltaText="across both" deltaDir="up" />
        <Stat label="Outstanding"       value="$860" deltaText="2 invoices"  deltaDir="down" />
      </div>

      {/* Kids cards */}
      <div className="row row--2">
        {PARENT_KIDS.map((k) => (
          <div className="card" key={k.id}>
            <div className="row-inline" style={{ justifyContent: "space-between" }}>
              <div className="cell-primary">
                <div className={`cell-avatar ${k.colour ? `cell-avatar--${k.colour}` : ""}`} style={{ width: 44, height: 44, fontSize: 15 }}>{k.initials}</div>
                <div className="cell-meta">
                  <div className="display" style={{ fontSize: 22, color: "var(--fg-strong)" }}>{k.name}</div>
                  <div className="muted" style={{ fontSize: 12.5 }}>{k.year}</div>
                </div>
              </div>
              <button className="btn btn--quiet">Open profile <IconArrowUpRight size={13} /></button>
            </div>

            <div className="divider" style={{ margin: "18px 0" }} />

            <div className="row-inline" style={{ justifyContent: "space-between", marginBottom: 10 }}>
              <span className="muted s-row__hint">Currently enrolled in</span>
              <span className="strong">{k.course}</span>
            </div>
            <div className="row-inline" style={{ justifyContent: "space-between", marginBottom: 10 }}>
              <span className="muted s-row__hint">Next lesson</span>
              <span className="strong">{k.next}</span>
            </div>

            <div className="divider" style={{ margin: "16px 0" }} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <div className="eyebrow" style={{ marginBottom: 6 }}>Term avg</div>
                <div className="display tnum" style={{ fontSize: 32, color: "var(--fg-strong)" }}>{k.avg}%</div>
              </div>
              <div>
                <div className="eyebrow" style={{ marginBottom: 6 }}>Attendance</div>
                <div className="display tnum" style={{ fontSize: 32, color: "var(--fg-strong)" }}>{k.attend}%</div>
              </div>
            </div>

            <div className="row-inline" style={{ marginTop: 16, justifyContent: "space-between" }}>
              <span className="tag tag--ok"><span className="dot" /> {k.recent}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Schedule + outstanding */}
      <div className="row row--8-4">
        <div className="card card--flush">
          <div className="card__head">
            <div>
              <div className="card__title">This week's schedule</div>
              <div className="card__sub">Across both children — Mon to Sun.</div>
            </div>
            <button className="btn btn--quiet">Calendar view <IconArrowRight size={13} /></button>
          </div>
          <div>
            {PARENT_SCHEDULE.map((s, i) => (
              <div key={i} className="lesson-row">
                <div className="lesson-row__time">
                  <div className="lesson-row__start" style={{ fontSize: 13 }}>{s.day}</div>
                  <div className="lesson-row__end">{s.time}</div>
                </div>
                <div className="lesson-row__body">
                  <div className="lesson-row__title" style={{ color: s.type === "free" ? "var(--fg-muted)" : "var(--fg-strong)" }}>{s.title}</div>
                  <div className="lesson-row__meta">{s.kid !== "—" ? s.kid : "—"}</div>
                </div>
                <div className="lesson-row__state">
                  {s.type === "lesson" && <StatusTag state="upcoming" />}
                  {s.type === "due"    && <StatusTag state="due" />}
                  {s.type === "checkin"&& <StatusTag state="trial" />}
                  {s.type === "free"   && <span className="tag muted">Free</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card__title" style={{ marginBottom: 4 }}>Outstanding</div>
          <div className="card__sub" style={{ marginBottom: 18 }}>2 invoices to settle</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {PARENT_INVOICES.slice(0, 2).map((iv) => (
              <div key={iv.id} className="row-inline" style={{ justifyContent: "space-between", padding: "12px 14px", background: "var(--bg-surface-2)", borderRadius: 10, border: "1px solid var(--border-faint)" }}>
                <div>
                  <div className="strong" style={{ fontSize: 14 }}>{iv.kid}</div>
                  <div className="muted" style={{ fontSize: 11.5, marginTop: 2 }}>{iv.period} · due {iv.due.toLowerCase()}</div>
                </div>
                <div className="strong tnum" style={{ fontSize: 16 }}>${iv.amount}</div>
              </div>
            ))}
          </div>

          <div className="divider" style={{ margin: "20px 0" }} />

          <button className="btn btn--primary" style={{ width: "100%", justifyContent: "center", height: 42 }}>
            <IconCard size={14} /> Pay all $860
          </button>
          <button className="btn btn--quiet" style={{ width: "100%", justifyContent: "center", marginTop: 8 }}>
            Update payment method
          </button>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Parent — Reports
   ──────────────────────────────────────────────────────────── */

function ParentReports() {
  return (
    <div className="section-stack">
      <PageHead
        eyebrow="Across both children"
        title="Progress reports"
        sub="Term-by-term reports written by your children's tutors. New reports appear automatically when finalised."
      />

      <div className="row row--4">
        <Stat label="Ready to read" value="01" deltaText="new" deltaDir="up" footRight="Amelia · Term 2" />
        <Stat label="In progress"   value="01" footRight="Liam · Term 2" />
        <Stat label="Archived"      value="03" footRight="all terms" />
        <Stat label="Avg sentiment" value="A−" footRight="encouraging" />
      </div>

      <div className="card card--flush">
        <div className="toolbar">
          {["All", "Amelia Tran", "Liam Tran"].map((f, i) => (
            <button key={f} className={`toolbar__chip ${i === 0 ? "is-active" : ""}`}>{f}</button>
          ))}
          <div style={{ flex: 1 }} />
          <button className="btn btn--ghost"><IconDownload size={14} /> Download all</button>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Report</th>
              <th>Child</th>
              <th>Tutor</th>
              <th>Status</th>
              <th>Updated</th>
              <th style={{ width: 120 }}></th>
            </tr>
          </thead>
          <tbody>
            {PARENT_REPORTS.map((r) => (
              <tr key={r.id}>
                <td>
                  <div className="cell-name">{r.term}</div>
                  <div className="cell-sub mono">{r.id}</div>
                </td>
                <td>{r.kid}</td>
                <td className="muted">{r.tutor}</td>
                <td><StatusTag state={r.state === "ready" ? "active" : r.state === "draft" ? "trial" : "paused"} /></td>
                <td className="muted">{r.when}</td>
                <td>
                  {r.state === "ready"
                    ? <button className="btn btn--primary" style={{ height: 32 }}>Read</button>
                    : r.state === "draft"
                      ? <button className="btn btn--quiet" disabled style={{ opacity: 0.6 }}>Pending</button>
                      : <button className="btn btn--quiet">Open</button>}
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
   Parent — Billing (their invoices, not workspace billing)
   ──────────────────────────────────────────────────────────── */

function ParentBilling() {
  return (
    <div className="section-stack">
      <PageHead
        eyebrow="Your account"
        title="Billing"
        sub="Tuition invoices, payment method and your monthly billing history with Ryze."
        actions={<button className="btn btn--ghost"><IconDownload size={14} /> Statement (PDF)</button>}
      />

      <div className="row row--4">
        <Stat label="Outstanding" value="$860"   deltaText="due tomorrow" deltaDir="down" />
        <Stat label="This month"  value="$860"   footRight="2 invoices" />
        <Stat label="YTD spend"   value="$3,140" footRight="across both" />
        <Stat label="Auto-pay"    value="On"     footRight="Visa •• 4242" />
      </div>

      <div className="row row--12-5">
        <div className="card card--flush">
          <div className="toolbar">
            {["All", "Due", "Paid"].map((f, i) => (
              <button key={f} className={`toolbar__chip ${i === 0 ? "is-active" : ""}`}>{f}</button>
            ))}
            <div style={{ flex: 1 }} />
            <button className="btn btn--primary"><IconCard size={14} /> Pay $860</button>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Child</th>
                <th>Period</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Due</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {PARENT_INVOICES.map((iv) => (
                <tr key={iv.id}>
                  <td className="mono strong" style={{ fontSize: 12.5 }}>{iv.id}</td>
                  <td>{iv.kid}</td>
                  <td className="muted">{iv.period}</td>
                  <td className="strong tnum">${iv.amount}</td>
                  <td><StatusTag state={iv.state} /></td>
                  <td className="muted">{iv.due}</td>
                  <td><button className="row-act"><IconMore size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card__title" style={{ marginBottom: 4 }}>Spend by month</div>
          <div className="card__sub" style={{ marginBottom: 18 }}>Last 8 months</div>
          <Bars />
          <div className="divider" style={{ margin: "20px 0" }} />
          <div className="card__title" style={{ marginBottom: 4 }}>Payment method</div>
          <div className="card__sub" style={{ marginBottom: 14 }}>Used for automatic monthly billing.</div>
          <div className="bill-card" style={{ padding: 18 }}>
            <div className="bill-card__brand">Visa</div>
            <div className="bill-card__num mono">•••• •••• •••• 4242</div>
            <div className="bill-card__exp">Expires 08 / 28</div>
            <button className="btn btn--quiet bill-card__edit">Change</button>
          </div>
        </div>
      </div>
    </div>
  );
}

window.RyzeParent = { ParentDashboard, ParentReports, ParentBilling };
