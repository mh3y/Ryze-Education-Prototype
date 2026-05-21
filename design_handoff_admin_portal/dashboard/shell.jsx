/* global React, RyzeIcons */
const {
  IconHome, IconCalendar, IconBell, IconUsers, IconParent, IconTutor,
  IconBookOpen, IconLessons, IconCheck, IconClipboard, IconPen,
  IconFolder, IconCard, IconDollar, IconShield, IconMegaphone, IconActivity,
  IconSettings, IconLogout, IconSearch, IconChevronRight,
} = RyzeIcons;

/* ────────────────────────────────────────────────────────────
   Sidebar
   Always-expanded by default. Tweakable: "expanded" | "rail" | "grouped"
   "expanded" – 248px, labels visible, dividers between groups
   "rail"     – 72px icon-only with hover tooltip
   "grouped"  – 248px, group headers collapsible (default open)
   ──────────────────────────────────────────────────────────── */

const NAV = {
  admin: [
    {
      group: "Today",
      items: [
        { key: "overview",      label: "Overview",          icon: IconHome },
        { key: "calendar",      label: "Calendar",          icon: IconCalendar },
        { key: "alerts",        label: "Alerts",            icon: IconShield, badge: 3 },
      ],
    },
    {
      group: "People",
      items: [
        { key: "students",      label: "Students",          icon: IconUsers },
        { key: "parents",       label: "Parents",           icon: IconParent },
        { key: "tutors",        label: "Tutors",            icon: IconTutor },
      ],
    },
    {
      group: "Teaching",
      items: [
        { key: "classes",       label: "Classes",           icon: IconBookOpen },
        { key: "lessons",       label: "Lessons",           icon: IconLessons },
        { key: "attendance",    label: "Attendance",        icon: IconCheck },
        { key: "homework",      label: "Homework",          icon: IconPen },
        { key: "reports",       label: "Progress reports",  icon: IconClipboard },
        { key: "resources",     label: "Resources",         icon: IconFolder },
      ],
    },
    {
      group: "Finance",
      items: [
        { key: "payments",      label: "Payments",          icon: IconCard },
        { key: "tutor-pay",     label: "Tutor payments",    icon: IconDollar },
      ],
    },
    {
      group: "System",
      items: [
        { key: "announcements", label: "Announcements",     icon: IconMegaphone },
        { key: "bot",           label: "Bot health",        icon: IconActivity },
        { key: "settings",      label: "Settings",          icon: IconSettings },
      ],
    },
  ],
  student: [
    { group: "Learning", items: [
      { key: "overview",   label: "Dashboard",   icon: IconHome },
      { key: "courses",    label: "Courses",     icon: IconBookOpen },
      { key: "homework",   label: "Homework",    icon: IconPen },
      { key: "calendar",   label: "Calendar",    icon: IconCalendar },
      { key: "reports",    label: "Progress",    icon: IconClipboard },
    ]},
    { group: "Account", items: [
      { key: "settings",   label: "Settings",    icon: IconSettings },
    ]},
  ],
  tutor: [
    { group: "Today", items: [
      { key: "overview",   label: "Dashboard",   icon: IconHome },
      { key: "calendar",   label: "Schedule",    icon: IconCalendar },
    ]},
    { group: "Classes", items: [
      { key: "classes",    label: "Classes",     icon: IconBookOpen },
      { key: "lessons",    label: "Lessons",     icon: IconLessons },
      { key: "attendance", label: "Attendance",  icon: IconCheck },
      { key: "homework",   label: "Homework",    icon: IconPen },
      { key: "reports",    label: "Reports",     icon: IconClipboard },
      { key: "resources",  label: "Resources",   icon: IconFolder },
    ]},
    { group: "Account", items: [
      { key: "tutor-pay",  label: "My payments", icon: IconDollar },
      { key: "settings",   label: "Settings",    icon: IconSettings },
    ]},
  ],
  parent: [
    { group: "Family", items: [
      { key: "overview",   label: "Dashboard",   icon: IconHome },
      { key: "calendar",   label: "Schedule",    icon: IconCalendar },
      { key: "reports",    label: "Reports",     icon: IconClipboard },
      { key: "payments",   label: "Billing",     icon: IconCard },
    ]},
    { group: "Account", items: [
      { key: "settings",   label: "Settings",    icon: IconSettings },
    ]},
  ],
};

function Brand({ collapsed }) {
  return (
    <div className="brand">
      <div className="brand__mark" aria-hidden="true">
        <span>R</span>
      </div>
      {!collapsed && (
        <div className="brand__word">
          <div className="brand__name">Ryze</div>
          <div className="brand__sub">Admin Console</div>
        </div>
      )}
    </div>
  );
}

function NavItem({ item, active, onSelect, collapsed }) {
  const Ic = item.icon;
  return (
    <button
      className={`nav-item ${active ? "is-active" : ""} ${collapsed ? "is-collapsed" : ""}`}
      onClick={() => onSelect(item.key)}
      title={collapsed ? item.label : undefined}
    >
      <span className="nav-item__rail" aria-hidden="true" />
      <Ic size={17} strokeWidth={active ? 1.9 : 1.6} />
      {!collapsed && <span className="nav-item__label">{item.label}</span>}
      {!collapsed && item.badge ? (
        <span className="nav-item__badge">{item.badge}</span>
      ) : null}
      {collapsed && item.badge ? (
        <span className="nav-item__dot" aria-hidden="true" />
      ) : null}
    </button>
  );
}

function Sidebar({ role, route, onSelect, sidebar, user }) {
  const groups = NAV[role] || NAV.admin;
  const collapsed = sidebar === "rail";

  return (
    <aside className={`side ${collapsed ? "side--rail" : "side--wide"}`} data-sidebar={sidebar}>
      <Brand collapsed={collapsed} />

      <div className="side__scroll scroll-thin">
        {groups.map((g) => (
          <div className="side__group" key={g.group}>
            {!collapsed && <div className="side__group-label">{g.group}</div>}
            <div className="side__items">
              {g.items.map((it) => (
                <NavItem
                  key={it.key}
                  item={it}
                  active={route === it.key}
                  onSelect={onSelect}
                  collapsed={collapsed}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="side__foot">
        <div className={`side__user ${collapsed ? "is-collapsed" : ""}`}>
          <div className="side__avatar">{(user?.name || "A").charAt(0)}</div>
          {!collapsed && (
            <div className="side__user-meta">
              <div className="side__user-name">{user?.name || "Admin"}</div>
              <div className="side__user-sub">{user?.email || "ops@ryzeeducation.com.au"}</div>
            </div>
          )}
          {!collapsed && (
            <button className="side__user-act" title="Sign out">
              <IconLogout size={15} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

/* ────────────────────────────────────────────────────────────
   Topbar
   Breadcrumb left · search center · bell + theme + avatar right
   ──────────────────────────────────────────────────────────── */

function Topbar({ crumbs, onCmdK }) {
  return (
    <header className="top">
      <div className="top__crumbs">
        {crumbs.map((c, i) => (
          <React.Fragment key={c.label + i}>
            {i > 0 && <IconChevronRight size={14} className="top__crumbs-sep" />}
            <span className={`top__crumb ${i === crumbs.length - 1 ? "is-current" : ""}`}>
              {c.label}
            </span>
          </React.Fragment>
        ))}
      </div>

      <div className="top__search" onClick={onCmdK}>
        <IconSearch size={15} />
        <span>Search students, classes, invoices…</span>
        <span className="kbd">⌘K</span>
      </div>

      <div className="top__right">
        <button className="top__icon" title="Notifications">
          <IconBell size={16} />
          <span className="top__icon-dot" />
        </button>
        <div className="top__divider" />
        <div className="top__me">
          <div className="top__me-meta">
            <div className="top__me-name">Sasha Lim</div>
            <div className="top__me-role">Admin</div>
          </div>
          <div className="top__me-avatar">SL</div>
        </div>
      </div>
    </header>
  );
}

window.RyzeShell = { Sidebar, Topbar, NAV };
