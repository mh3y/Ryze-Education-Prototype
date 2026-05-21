/* global React, RyzeIcons */
const {
  IconHome, IconUsers, IconBell, IconShield, IconActivity, IconSettings,
  IconCard, IconMail, IconPhone, IconCheck, IconChevronRight, IconArrowUpRight,
  IconArrowRight, IconPlus, IconDownload, IconRefresh, IconMore, IconClock,
  IconSearch, IconWarn, IconBookOpen, IconLogout, IconStar, IconParent,
} = RyzeIcons;

/* ────────────────────────────────────────────────────────────
   Settings — internal section list
   ──────────────────────────────────────────────────────────── */

const SECTIONS = [
  { key: "appearance",    label: "Appearance",    icon: IconStar,        desc: "Theme, type, density" },
  { key: "profile",       label: "Profile",       icon: IconUsers,       desc: "Name, email, timezone" },
  { key: "notifications", label: "Notifications", icon: IconBell,        desc: "Email, SMS, Discord" },
  { key: "security",      label: "Security",      icon: IconShield,      desc: "Password, 2FA, sessions" },
  { key: "integrations",  label: "Integrations",  icon: IconActivity,    desc: "Discord, Xero, Calendar" },
  { key: "team",          label: "Team & roles",  icon: IconParent,      desc: "Admins, tutors, parents" },
  { key: "billing",       label: "Billing",       icon: IconCard,        desc: "Plan, seats, invoices" },
  { key: "danger",        label: "Danger zone",   icon: IconWarn,        desc: "Export, archive, delete", tone: "danger" },
];

const ACCENT_SWATCHES = [
  { hex: "#b8841e", label: "Ryze gold" },
  { hex: "#1f8a5b", label: "Sage" },
  { hex: "#2a6fdb", label: "Cobalt" },
  { hex: "#8b3a3a", label: "Claret" },
];

/* ────────────────────────────────────────────────────────────
   Tiny form primitives
   ──────────────────────────────────────────────────────────── */

function Row({ label, hint, children, full }) {
  return (
    <div className={`s-row ${full ? "s-row--full" : ""}`}>
      <div className="s-row__lbl">
        <div className="s-row__label">{label}</div>
        {hint ? <div className="s-row__hint">{hint}</div> : null}
      </div>
      <div className="s-row__ctrl">{children}</div>
    </div>
  );
}

function Segment({ value, options, onChange }) {
  return (
    <div className="seg">
      {options.map((o) => (
        <button
          key={o.value}
          className={`seg__btn ${value === o.value ? "is-active" : ""}`}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Toggle({ value, onChange, label, hint }) {
  return (
    <button
      role="switch"
      aria-checked={value}
      className={`tog ${value ? "is-on" : ""}`}
      onClick={() => onChange(!value)}
    >
      <span className="tog__track" aria-hidden="true">
        <span className="tog__thumb" />
      </span>
      {label ? <span className="tog__label">{label}</span> : null}
    </button>
  );
}

function Field({ value, onChange, placeholder, type = "text", suffix, prefix, mono }) {
  return (
    <label className={`field ${mono ? "field--mono" : ""}`}>
      {prefix ? <span className="field__prefix">{prefix}</span> : null}
      <input
        type={type}
        value={value || ""}
        placeholder={placeholder}
        onChange={(e) => onChange && onChange(e.target.value)}
      />
      {suffix ? <span className="field__suffix">{suffix}</span> : null}
    </label>
  );
}

function Select({ value, onChange, options }) {
  return (
    <label className="field field--select">
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

function Swatches({ value, options, onChange }) {
  return (
    <div className="swatches">
      {options.map((s) => {
        const active = value.toLowerCase() === s.hex.toLowerCase();
        return (
          <button
            key={s.hex}
            className={`swatch ${active ? "is-active" : ""}`}
            onClick={() => onChange(s.hex)}
            title={s.label}
          >
            <span className="swatch__chip" style={{ background: s.hex }} />
            <span className="swatch__label">{s.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function FontPicker({ value, onChange }) {
  const options = [
    { value: "editorial",  name: "Editorial",      sample: "Aa",     family: '"Cormorant Garamond", serif',  italic: true,  caption: "Cormorant + Manrope" },
    { value: "instrument", name: "Literary",       sample: "Aa",     family: '"Instrument Serif", serif',    italic: false, caption: "Instrument + Manrope" },
    { value: "modern",     name: "Modern SaaS",    sample: "Aa",     family: '"Geist", "Manrope", sans-serif', italic: false, caption: "Geist all-sans" },
  ];
  return (
    <div className="font-grid">
      {options.map((o) => (
        <button
          key={o.value}
          className={`font-card ${value === o.value ? "is-active" : ""}`}
          onClick={() => onChange(o.value)}
        >
          <div className="font-card__sample"
               style={{ fontFamily: o.family, fontStyle: o.italic ? "italic" : "normal", fontWeight: o.italic ? 500 : 600 }}>
            {o.sample}
          </div>
          <div className="font-card__name">{o.name}</div>
          <div className="font-card__caption">{o.caption}</div>
        </button>
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Section: Appearance — wired to live tweaks
   ──────────────────────────────────────────────────────────── */

function AppearanceSection({ t, setTweak, local, setLocal }) {
  return (
    <SectionShell
      title="Appearance"
      sub="Set how the Ryze console looks for you. Changes apply instantly across the portal."
    >
      <div className="s-card">
        <Row label="Theme" hint="The marketing site is warm-white; the console defaults to dark for long sessions.">
          <Segment
            value={t.theme}
            options={[
              { value: "dark",  label: "Dark"  },
              { value: "light", label: "Light" },
            ]}
            onChange={(v) => setTweak("theme", v)}
          />
        </Row>

        <Row label="Accent colour" hint="Used for active states, primary actions, and brand moments.">
          <Swatches
            value={t.accent}
            options={ACCENT_SWATCHES}
            onChange={(v) => setTweak("accent", v)}
          />
        </Row>

        <Row label="Sidebar" hint="Wide labels for discovery; rail for power-users on smaller screens.">
          <Segment
            value={t.sidebar}
            options={[
              { value: "expanded", label: "Expanded" },
              { value: "rail",     label: "Icon rail" },
            ]}
            onChange={(v) => setTweak("sidebar", v)}
          />
        </Row>

        <Row label="Density" hint="Affects row heights, card padding, and the page gutter.">
          <Segment
            value={t.density}
            options={[
              { value: "airy",     label: "Airy"     },
              { value: "balanced", label: "Balanced" },
              { value: "dense",    label: "Dense"    },
            ]}
            onChange={(v) => setTweak("density", v)}
          />
        </Row>

        <Row label="Type pairing" hint="Display headings will use the chosen serif; body text stays Manrope unless you pick Modern SaaS.">
          <FontPicker
            value={t.font}
            onChange={(v) => setTweak("font", v)}
          />
        </Row>
      </div>

      <div className="s-card">
        <div className="s-card__head">
          <div>
            <div className="s-card__title">Motion & accessibility</div>
            <div className="s-card__sub">Tone down animations or sharpen contrast for long work days.</div>
          </div>
        </div>
        <Row label="Reduce motion" hint="Disables decorative animation like the live-lesson pulse.">
          <Toggle value={local.reduceMotion} onChange={(v) => setLocal("reduceMotion", v)} />
        </Row>
        <Row label="High contrast" hint="Bumps body text and borders for clearer separation.">
          <Toggle value={local.highContrast} onChange={(v) => setLocal("highContrast", v)} />
        </Row>
        <Row label="Tabular numerals everywhere" hint="Align numbers across columns automatically.">
          <Toggle value={local.tnum} onChange={(v) => setLocal("tnum", v)} />
        </Row>
      </div>
    </SectionShell>
  );
}

/* ────────────────────────────────────────────────────────────
   Section: Profile
   ──────────────────────────────────────────────────────────── */

function ProfileSection({ user, local, setLocal }) {
  return (
    <SectionShell
      title="Profile"
      sub="The name and contact details parents and tutors see in the portal."
    >
      <div className="s-card">
        <Row label="Profile photo" hint="Square PNG or JPG · 256 × 256 minimum.">
          <div className="s-photo">
            <div className="s-photo__avatar">{user.name.charAt(0)}</div>
            <div className="s-photo__btns">
              <button className="btn btn--ghost">Upload</button>
              <button className="btn btn--quiet">Remove</button>
            </div>
          </div>
        </Row>
        <Row label="Display name">
          <Field value={local.name || user.name} onChange={(v) => setLocal("name", v)} />
        </Row>
        <Row label="Email">
          <Field type="email" value={local.email || user.email} onChange={(v) => setLocal("email", v)} prefix={<IconMail size={14} />} />
        </Row>
        <Row label="Phone" hint="Used as the SMS sender ID for parent reminders.">
          <Field value={local.phone || "+61 412 345 678"} onChange={(v) => setLocal("phone", v)} prefix={<IconPhone size={14} />} mono />
        </Row>
        <Row label="Timezone">
          <Select
            value={local.tz || "Australia/Sydney"}
            onChange={(v) => setLocal("tz", v)}
            options={[
              { value: "Australia/Sydney",   label: "Australia / Sydney (AEDT)" },
              { value: "Australia/Brisbane", label: "Australia / Brisbane" },
              { value: "Australia/Perth",    label: "Australia / Perth" },
              { value: "Pacific/Auckland",   label: "Pacific / Auckland" },
            ]}
          />
        </Row>
        <Row label="Time format">
          <Segment
            value={local.timeFmt || "12h"}
            onChange={(v) => setLocal("timeFmt", v)}
            options={[
              { value: "12h", label: "12-hour" },
              { value: "24h", label: "24-hour" },
            ]}
          />
        </Row>
      </div>

      <SaveBar />
    </SectionShell>
  );
}

/* ────────────────────────────────────────────────────────────
   Section: Notifications
   ──────────────────────────────────────────────────────────── */

function NotificationsSection({ local, setLocal }) {
  const channels = ["Email", "In-app", "SMS"];
  const events = [
    { key: "new-student",    label: "New student enrolled",    hint: "When admin or tutor adds a student.",        defaults: [true, true, false] },
    { key: "payment-paid",   label: "Payment received",        hint: "Successful direct debit or card capture.",   defaults: [true, true, false] },
    { key: "payment-due",    label: "Payment overdue",         hint: "Invoice past due date by 24h.",              defaults: [true, true, true]  },
    { key: "missed-lesson",  label: "Student missed lesson",   hint: "Marked absent without notice.",              defaults: [true, true, false] },
    { key: "report-due",     label: "Progress report due",     hint: "Term-end report waiting on you.",            defaults: [true, true, false] },
    { key: "bot-down",       label: "Discord bot offline",     hint: ">2min outage — wake an on-call admin.",      defaults: [true, true, true]  },
  ];

  const get = (k, ch) => (local.notif?.[k]?.[ch] !== undefined ? local.notif[k][ch] : events.find((e) => e.key === k).defaults[ch]);
  const set = (k, ch, v) => {
    const cur = local.notif || {};
    setLocal("notif", { ...cur, [k]: { ...(cur[k] || {}), [ch]: v } });
  };

  return (
    <SectionShell
      title="Notifications"
      sub="Per-channel preferences. Critical alerts (bot down, payment failures) always SMS regardless."
    >
      <div className="s-card">
        <Row label="Daily digest" hint="A morning email summarising overnight activity, payments and alerts.">
          <Segment
            value={local.digest || "daily"}
            onChange={(v) => setLocal("digest", v)}
            options={[
              { value: "daily",  label: "Daily" },
              { value: "weekly", label: "Weekly" },
              { value: "off",    label: "Off" },
            ]}
          />
        </Row>
        <Row label="Quiet hours" hint="Non-critical notifications are held until quiet hours end.">
          <div className="row-inline">
            <Field value={local.quietFrom || "21:00"} onChange={(v) => setLocal("quietFrom", v)} mono />
            <span className="muted">to</span>
            <Field value={local.quietTo || "07:00"} onChange={(v) => setLocal("quietTo", v)} mono />
          </div>
        </Row>
      </div>

      <div className="s-card s-card--flush">
        <div className="s-card__head">
          <div>
            <div className="s-card__title">Per-event channels</div>
            <div className="s-card__sub">Each event can route to email, in-app, or SMS independently.</div>
          </div>
        </div>
        <div className="ntable">
          <div className="ntable__head">
            <div>Event</div>
            {channels.map((c) => <div key={c} className="ntable__chan">{c}</div>)}
          </div>
          {events.map((e) => (
            <div className="ntable__row" key={e.key}>
              <div>
                <div className="strong">{e.label}</div>
                <div className="muted s-row__hint">{e.hint}</div>
              </div>
              {channels.map((c, i) => (
                <div key={c} className="ntable__chan">
                  <Toggle value={get(e.key, i)} onChange={(v) => set(e.key, i, v)} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <SaveBar />
    </SectionShell>
  );
}

/* ────────────────────────────────────────────────────────────
   Section: Security
   ──────────────────────────────────────────────────────────── */

function SecuritySection({ local, setLocal }) {
  const sessions = [
    { device: "MacBook Pro · Chrome",         where: "Sydney, AU",   when: "Active now",  current: true },
    { device: "iPhone 15 · Safari",           where: "Sydney, AU",   when: "2h ago" },
    { device: "Studio iPad · Safari",         where: "Bondi, AU",    when: "Yesterday" },
    { device: "Windows · Edge",               where: "Melbourne, AU",when: "5 days ago" },
  ];
  return (
    <SectionShell
      title="Security"
      sub="Manage how you sign in and where your account is active."
    >
      <div className="s-card">
        <Row label="Password" hint="Last changed 47 days ago.">
          <button className="btn btn--ghost">Change password <IconChevronRight size={13} /></button>
        </Row>
        <Row label="Two-factor authentication" hint="Required for admin and finance roles.">
          <div className="row-inline">
            <span className="tag tag--ok"><span className="dot" /> Enabled · Authenticator app</span>
            <button className="btn btn--quiet">Manage</button>
          </div>
        </Row>
        <Row label="Recovery codes" hint="10 single-use codes for if you lose your authenticator.">
          <button className="btn btn--ghost"><IconDownload size={13} /> Download codes</button>
        </Row>
        <Row label="Single sign-on" hint="Connect Google Workspace so the studio team signs in once.">
          <Toggle value={local.sso || false} onChange={(v) => setLocal("sso", v)} />
        </Row>
      </div>

      <div className="s-card s-card--flush">
        <div className="s-card__head">
          <div>
            <div className="s-card__title">Active sessions</div>
            <div className="s-card__sub">4 sessions on this account. Sign out of any you don't recognise.</div>
          </div>
          <button className="btn btn--quiet">Sign out all</button>
        </div>
        <div>
          {sessions.map((s, i) => (
            <div key={i} className="sess-row">
              <div>
                <div className="strong">{s.device}{s.current ? <span className="tag tag--accent" style={{ marginLeft: 10 }}>This device</span> : null}</div>
                <div className="muted s-row__hint">{s.where} · <span className="mono">{s.when}</span></div>
              </div>
              {!s.current && <button className="btn btn--quiet">Sign out</button>}
            </div>
          ))}
        </div>
      </div>

      <SaveBar />
    </SectionShell>
  );
}

/* ────────────────────────────────────────────────────────────
   Section: Integrations
   ──────────────────────────────────────────────────────────── */

function IntegrationsSection() {
  const integ = [
    { name: "Discord",         desc: "Reminder bot + announcement channel routing.",     state: "connected", meta: "Last sync 12s ago · ryze-studio guild", color: "#5865F2" },
    { name: "Xero",            desc: "Invoice export, payment reconciliation, GST.",     state: "connected", meta: "Synced this morning · 247 invoices",     color: "#13b5ea" },
    { name: "Google Calendar", desc: "Two-way sync of lessons across tutor calendars.",  state: "connected", meta: "All 5 tutor calendars in sync",         color: "#4285F4" },
    { name: "Stripe",          desc: "Card payments and direct debit collection.",       state: "connected", meta: "Live mode · AU + NZ",                    color: "#635bff" },
    { name: "Slack",           desc: "Optional alternative to Discord for ops alerts.",  state: "off",       meta: "Not connected",                          color: "#611f69" },
    { name: "Sentry",          desc: "Error monitoring for the portal and bot.",         state: "off",       meta: "Not connected",                          color: "#362d59" },
  ];
  return (
    <SectionShell
      title="Integrations"
      sub="Connect the third-party services Ryze depends on for ops, billing, and comms."
    >
      <div className="integ-grid">
        {integ.map((it) => (
          <div className={`integ-card ${it.state === "connected" ? "is-on" : ""}`} key={it.name}>
            <div className="integ-card__head">
              <div className="integ-card__logo" style={{ background: `${it.color}22`, color: it.color }}>
                <span>{it.name.charAt(0)}</span>
              </div>
              {it.state === "connected"
                ? <span className="tag tag--ok"><span className="dot" /> Connected</span>
                : <span className="tag">Not connected</span>}
            </div>
            <div className="integ-card__name">{it.name}</div>
            <div className="integ-card__desc">{it.desc}</div>
            <div className="integ-card__meta mono">{it.meta}</div>
            <div className="integ-card__foot">
              {it.state === "connected"
                ? <>
                    <button className="btn btn--quiet">Configure <IconArrowUpRight size={13} /></button>
                    <button className="btn btn--quiet">Disconnect</button>
                  </>
                : <button className="btn btn--ghost">Connect <IconArrowRight size={13} /></button>}
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

/* ────────────────────────────────────────────────────────────
   Section: Team & roles
   ──────────────────────────────────────────────────────────── */

function TeamSection() {
  const team = [
    { name: "Sasha Lim",     email: "sasha@ryzeeducation.com.au",  role: "Admin",      seen: "Active now",  initials: "SL" },
    { name: "Daniel Kwok",   email: "daniel@ryzeeducation.com.au", role: "Tutor",      seen: "12m ago",     initials: "DK" },
    { name: "Priya Aiyar",   email: "priya@ryzeeducation.com.au",  role: "Tutor",      seen: "2h ago",      initials: "PA" },
    { name: "Marcus Webb",   email: "marcus@ryzeeducation.com.au", role: "Tutor",      seen: "Yesterday",   initials: "MW" },
    { name: "Aria Singh",    email: "aria@ryzeeducation.com.au",   role: "Tutor",      seen: "3 days ago",  initials: "AS" },
    { name: "Cindy Wong",    email: "cindy@accounts.ryze.com",     role: "Finance",    seen: "1h ago",     initials: "CW" },
    { name: "Open invite",   email: "ben@ryzeeducation.com.au",    role: "Invited",    seen: "Pending",    initials: "B" },
  ];
  return (
    <SectionShell
      title="Team & roles"
      sub="Who has access to this portal, and at what level."
      action={<button className="btn btn--primary"><IconPlus size={13} /> Invite teammate</button>}
    >
      <div className="s-card s-card--flush">
        <div className="toolbar">
          <div className="toolbar__search">
            <IconSearch size={14} />
            <input placeholder="Search teammates…" />
          </div>
          {["All", "Admin", "Finance", "Tutor", "Invited"].map((f, i) => (
            <button key={f} className={`toolbar__chip ${i === 0 ? "is-active" : ""}`}>{f}</button>
          ))}
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Role</th>
              <th>Last seen</th>
              <th style={{ width: 40 }}></th>
            </tr>
          </thead>
          <tbody>
            {team.map((m, i) => (
              <tr key={i}>
                <td>
                  <div className="cell-primary">
                    <div className="cell-avatar">{m.initials}</div>
                    <div className="cell-meta">
                      <div className="cell-name">{m.name}</div>
                      <div className="cell-sub">{m.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`tag ${m.role === "Admin" ? "tag--accent" : m.role === "Finance" ? "tag--info" : m.role === "Invited" ? "tag--warn" : "tag--ok"}`}>
                    {m.role}
                  </span>
                </td>
                <td className="muted">{m.seen}</td>
                <td><button className="row-act"><IconMore size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="s-card">
        <div className="s-card__head">
          <div>
            <div className="s-card__title">Role permissions</div>
            <div className="s-card__sub">Four built-in roles. Define custom roles when this scales.</div>
          </div>
          <button className="btn btn--quiet">View matrix <IconArrowUpRight size={13} /></button>
        </div>
        <div className="role-grid">
          {[
            { name: "Admin",   what: "Full access including billing, integrations and danger zone." },
            { name: "Finance", what: "Read all, edit payments, invoices, and tutor pay only." },
            { name: "Tutor",   what: "Read assigned classes, manage attendance, homework, reports." },
            { name: "Parent",  what: "View their children, schedule, reports, and pay invoices." },
          ].map((r) => (
            <div className="role-card" key={r.name}>
              <div className="role-card__name">{r.name}</div>
              <div className="role-card__what">{r.what}</div>
            </div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

/* ────────────────────────────────────────────────────────────
   Section: Billing
   ──────────────────────────────────────────────────────────── */

function BillingSection() {
  const invoices = [
    { id: "RYZE-2026-05", date: "1 May 2026", amount: 240, state: "paid" },
    { id: "RYZE-2026-04", date: "1 Apr 2026", amount: 240, state: "paid" },
    { id: "RYZE-2026-03", date: "1 Mar 2026", amount: 240, state: "paid" },
    { id: "RYZE-2026-02", date: "1 Feb 2026", amount: 200, state: "paid" },
  ];
  return (
    <SectionShell title="Billing" sub="Your Ryze Studio plan and payment details.">
      <div className="bill-grid">
        <div className="s-card bill-plan">
          <div className="bill-plan__eyebrow eyebrow">Current plan</div>
          <div className="bill-plan__name display">Studio Pro</div>
          <div className="bill-plan__price"><span className="bill-plan__amt tnum">$240</span><span className="muted"> / month · AUD</span></div>
          <div className="bill-plan__notes muted">Renews on <span className="strong">1 Jun 2026</span> · Annual discount available</div>

          <div className="bill-plan__seats">
            <div className="bill-plan__seat-row">
              <span>Admin seats</span><span className="tnum">2 / 3</span>
            </div>
            <div className="bill-plan__seat-row">
              <span>Tutor seats</span><span className="tnum">4 / 10</span>
            </div>
            <div className="bill-plan__seat-row">
              <span>Active students</span><span className="tnum">142 / 250</span>
            </div>
          </div>

          <div className="bill-plan__btns">
            <button className="btn btn--primary">Manage plan</button>
            <button className="btn btn--ghost">Compare plans</button>
          </div>
        </div>

        <div className="s-card">
          <div className="s-card__title" style={{ marginBottom: 4 }}>Payment method</div>
          <div className="s-card__sub" style={{ marginBottom: 18 }}>Card on file for monthly renewal.</div>
          <div className="bill-card">
            <div className="bill-card__brand">Visa</div>
            <div className="bill-card__num mono">•••• •••• •••• 4242</div>
            <div className="bill-card__exp">Expires 08 / 28</div>
            <button className="btn btn--quiet bill-card__edit">Change</button>
          </div>
          <div className="divider" style={{ margin: "20px 0" }} />
          <Row label="Billing email" hint="Receipts and renewal notices.">
            <Field value="accounts@ryzeeducation.com.au" />
          </Row>
          <Row label="GST / ABN">
            <Field value="ABN 12 345 678 901" mono />
          </Row>
        </div>
      </div>

      <div className="s-card s-card--flush">
        <div className="s-card__head">
          <div>
            <div className="s-card__title">Invoice history</div>
            <div className="s-card__sub">Last 12 months of Ryze subscription invoices.</div>
          </div>
          <button className="btn btn--quiet"><IconDownload size={13} /> Download all</button>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th style={{ width: 40 }}></th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((iv) => (
              <tr key={iv.id}>
                <td className="mono strong" style={{ fontSize: 12.5 }}>{iv.id}</td>
                <td>{iv.date}</td>
                <td className="strong tnum">${iv.amount}.00</td>
                <td><span className="tag tag--ok">Paid</span></td>
                <td><button className="row-act"><IconDownload size={14} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionShell>
  );
}

/* ────────────────────────────────────────────────────────────
   Section: Danger zone
   ──────────────────────────────────────────────────────────── */

function DangerSection() {
  const items = [
    {
      title: "Export workspace data",
      body: "A zipped archive of all students, classes, lessons, attendance, homework and invoices. Sent as a download link within 1 hour.",
      cta: "Request export",
      destructive: false,
    },
    {
      title: "Archive workspace",
      body: "Freeze the workspace — students and parents lose access, scheduled lessons are cancelled, billing pauses. Reversible within 30 days.",
      cta: "Archive workspace",
      destructive: false,
    },
    {
      title: "Delete workspace",
      body: "Permanently remove this workspace and all associated data. This cannot be undone — please export your data first.",
      cta: "Delete workspace",
      destructive: true,
    },
  ];
  return (
    <SectionShell
      title="Danger zone"
      sub="Workspace-wide actions. Each requires a typed confirmation — there's no accidental click here."
    >
      {items.map((it) => (
        <div className={`danger-row ${it.destructive ? "is-destructive" : ""}`} key={it.title}>
          <div className="danger-row__body">
            <div className="danger-row__title">{it.title}</div>
            <div className="danger-row__sub muted">{it.body}</div>
          </div>
          <button className={`btn ${it.destructive ? "btn--danger" : "btn--ghost"}`}>{it.cta}</button>
        </div>
      ))}
    </SectionShell>
  );
}

/* ────────────────────────────────────────────────────────────
   Reusable: section shell + save bar
   ──────────────────────────────────────────────────────────── */

function SectionShell({ title, sub, action, children }) {
  return (
    <div className="s-section">
      <div className="s-section__head">
        <div>
          <h2 className="s-section__title display">{title}</h2>
          <div className="s-section__sub">{sub}</div>
        </div>
        {action}
      </div>
      <div className="s-section__body">{children}</div>
    </div>
  );
}

function SaveBar() {
  return (
    <div className="save-bar">
      <div className="save-bar__hint muted">
        Changes are saved per-field; the bar appears when you have unsaved edits.
      </div>
      <div className="save-bar__btns">
        <button className="btn btn--quiet">Discard</button>
        <button className="btn btn--primary">Save changes</button>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Settings page (root)
   ──────────────────────────────────────────────────────────── */

function SettingsPage({ t, setTweak, user }) {
  const [active, setActive] = React.useState("appearance");
  const [local, setLocalState] = React.useState({});
  const setLocal = (k, v) => setLocalState((prev) => ({ ...prev, [k]: v }));

  const sect = SECTIONS.find((s) => s.key === active);

  return (
    <div className="section-stack">
      <div className="page-head">
        <div>
          <div className="page-head__eyebrow">System</div>
          <h1 className="page-head__title">Settings</h1>
          <p className="page-head__sub">
            Workspace, account and appearance preferences for the Ryze admin console.
          </p>
        </div>
        <div className="page-head__actions">
          <button className="btn btn--ghost"><IconRefresh size={14} /> Restore defaults</button>
        </div>
      </div>

      <div className="settings-shell">
        {/* ── Inner section navigation ─────────────────────── */}
        <aside className="settings-nav">
          <div className="settings-nav__head eyebrow">Sections</div>
          <nav className="settings-nav__list">
            {SECTIONS.map((s) => {
              const Ic = s.icon;
              const isActive = s.key === active;
              return (
                <button
                  key={s.key}
                  className={`settings-nav__item ${isActive ? "is-active" : ""} ${s.tone === "danger" ? "is-danger" : ""}`}
                  onClick={() => setActive(s.key)}
                >
                  <Ic size={16} strokeWidth={isActive ? 1.9 : 1.6} />
                  <div className="settings-nav__meta">
                    <div className="settings-nav__label">{s.label}</div>
                    <div className="settings-nav__desc">{s.desc}</div>
                  </div>
                  <IconChevronRight size={13} className="settings-nav__chev" />
                </button>
              );
            })}
          </nav>
          <div className="settings-nav__foot">
            <button className="btn btn--quiet" style={{ width: "100%", justifyContent: "flex-start" }}>
              <IconLogout size={14} /> Sign out of this device
            </button>
          </div>
        </aside>

        {/* ── Content ──────────────────────────────────────── */}
        <main className="settings-content">
          {active === "appearance"    && <AppearanceSection    t={t} setTweak={setTweak} local={local} setLocal={setLocal} />}
          {active === "profile"       && <ProfileSection       user={user} local={local} setLocal={setLocal} />}
          {active === "notifications" && <NotificationsSection local={local} setLocal={setLocal} />}
          {active === "security"      && <SecuritySection      local={local} setLocal={setLocal} />}
          {active === "integrations"  && <IntegrationsSection />}
          {active === "team"          && <TeamSection />}
          {active === "billing"       && <BillingSection />}
          {active === "danger"        && <DangerSection />}
        </main>
      </div>
    </div>
  );
}

window.RyzeSettings = { SettingsPage };
