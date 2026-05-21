/* global React, ReactDOM, RyzeShell, RyzePages, RyzeSettings, RyzeTutor, RyzeStudent, RyzeParent */
const { useState, useEffect, useMemo } = React;
const { Sidebar, Topbar, NAV } = RyzeShell;
const { OverviewPage, StudentsPage, ClassesPage, LessonsPage, PaymentsPage, PlaceholderPage } = RyzePages;
const { SettingsPage } = RyzeSettings;
const { TutorOverview, TutorClasses, TutorAttendance, TutorHomework } = RyzeTutor;
const { StudentDashboard, StudentCourses, StudentHomework, StudentProgress } = RyzeStudent;
const { ParentDashboard, ParentReports, ParentBilling } = RyzeParent;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "dark",
  "sidebar": "expanded",
  "accent": "#b8841e",
  "density": "balanced",
  "font": "editorial",
  "role": "admin"
}/*EDITMODE-END*/;

const ACCENTS = [
  { hex: "#b8841e", label: "Ryze gold" },
  { hex: "#1f8a5b", label: "Sage" },
  { hex: "#2a6fdb", label: "Cobalt" },
  { hex: "#8b3a3a", label: "Claret" },
];

const TITLE_BY_ROUTE = {
  overview:      { eyebrow: "Today",     title: "Overview" },
  calendar:      { eyebrow: "Today",     title: "Calendar" },
  alerts:        { eyebrow: "Today",     title: "Alerts" },
  students:      { eyebrow: "People",    title: "Students" },
  parents:       { eyebrow: "People",    title: "Parents" },
  tutors:        { eyebrow: "People",    title: "Tutors" },
  classes:       { eyebrow: "Teaching",  title: "Classes" },
  lessons:       { eyebrow: "Teaching",  title: "Lessons" },
  attendance:    { eyebrow: "Teaching",  title: "Attendance" },
  homework:      { eyebrow: "Teaching",  title: "Homework" },
  reports:       { eyebrow: "Teaching",  title: "Progress reports" },
  resources:     { eyebrow: "Teaching",  title: "Resources" },
  payments:      { eyebrow: "Finance",   title: "Payments" },
  "tutor-pay":   { eyebrow: "Finance",   title: "Tutor payments" },
  announcements: { eyebrow: "System",    title: "Announcements" },
  bot:           { eyebrow: "System",    title: "Bot health" },
  settings:      { eyebrow: "System",    title: "Settings" },
  courses:       { eyebrow: "Learning",  title: "Courses" },
};

function applyAccent(hex) {
  const root = document.documentElement.style;
  root.setProperty("--accent", hex);

  // soft fills derived from the accent
  root.setProperty("--accent-soft",   hexA(hex, 0.16));
  root.setProperty("--accent-soft-2", hexA(hex, 0.08));

  // For light accents (gold), white text on the accent fill works. For dark
  // accents, we still use white to keep CTA legibility consistent.
  root.setProperty("--accent-fg",  "#ffffff");
  root.setProperty("--accent-ink", contrastInk(hex));
}

function hexA(hex, a) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function contrastInk(hex) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  // Approx luminance — pick a dark ink for light accents, a near-white for dark ones.
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.5 ? "#1a1305" : "#fffaf2";
}

function App() {
  const [t, setTweak] = window.useTweaks(TWEAK_DEFAULTS);
  const [route, setRoute] = useState("overview");

  // Apply theme / density / font / accent to <body> + <html>
  useEffect(() => {
    document.body.dataset.theme   = t.theme;
    document.body.dataset.density = t.density;
    document.body.dataset.font    = t.font;
    applyAccent(t.accent);
  }, [t.theme, t.density, t.font, t.accent]);

  // Reset route when role changes — different roles have different nav
  useEffect(() => { setRoute("overview"); }, [t.role]);

  const user = useMemo(() => {
    if (t.role === "admin")   return { name: "Sasha Lim",       first: "Sasha",   role: "Admin",   email: "sasha@ryzeeducation.com.au" };
    if (t.role === "tutor")   return { name: "Daniel Kwok",     first: "Daniel",  role: "Tutor",   email: "daniel@ryzeeducation.com.au" };
    if (t.role === "student") return { name: "Amelia Tran",     first: "Amelia",  role: "Student", email: "amelia.t@student.ryze" };
    return { name: "Linda Tran", first: "Linda", role: "Parent", email: "linda.tran@gmail.com" };
  }, [t.role]);

  const meta = TITLE_BY_ROUTE[route] || { eyebrow: "Section", title: "Page" };
  const crumbs = [{ label: t.role.charAt(0).toUpperCase() + t.role.slice(1) }, { label: meta.eyebrow }, { label: meta.title }];

  function renderPage() {
    // Settings is shared across all roles
    if (route === "settings") return <SettingsPage t={t} setTweak={setTweak} user={user} />;

    if (t.role === "admin") {
      if (route === "overview") return <OverviewPage user={user} />;
      if (route === "students") return <StudentsPage />;
      if (route === "classes")  return <ClassesPage />;
      if (route === "lessons")  return <LessonsPage />;
      if (route === "payments") return <PaymentsPage />;
    }
    if (t.role === "tutor") {
      if (route === "overview")   return <TutorOverview user={user} />;
      if (route === "classes")    return <TutorClasses />;
      if (route === "attendance") return <TutorAttendance />;
      if (route === "homework")   return <TutorHomework />;
    }
    if (t.role === "student") {
      if (route === "overview") return <StudentDashboard user={user} />;
      if (route === "courses")  return <StudentCourses />;
      if (route === "homework") return <StudentHomework />;
      if (route === "reports")  return <StudentProgress />;
    }
    if (t.role === "parent") {
      if (route === "overview") return <ParentDashboard user={user} />;
      if (route === "reports")  return <ParentReports />;
      if (route === "payments") return <ParentBilling />;
    }

    return <PlaceholderPage title={meta.title} sub={`The ${meta.title.toLowerCase()} module is part of the portal scope. Mock coming next.`} />;
  }

  return (
    <div className="app" data-sidebar={t.sidebar}>
      <Sidebar
        role={t.role}
        route={route}
        onSelect={setRoute}
        sidebar={t.sidebar}
        user={user}
      />

      <div className="main">
        <Topbar crumbs={crumbs} onCmdK={() => {}} />
        <div className="main__body" data-screen-label={`Admin · ${meta.title}`}>
          {renderPage()}
        </div>
      </div>

      <window.TweaksPanel title="Tweaks">
        <window.TweakSection label="Theme" />
        <window.TweakRadio
          label="Mode"
          value={t.theme}
          options={["dark", "light"]}
          onChange={(v) => setTweak("theme", v)}
        />
        <window.TweakColor
          label="Accent"
          value={t.accent}
          options={ACCENTS.map((a) => a.hex)}
          onChange={(v) => setTweak("accent", v)}
        />

        <window.TweakSection label="Layout" />
        <window.TweakRadio
          label="Sidebar"
          value={t.sidebar}
          options={["expanded", "rail"]}
          onChange={(v) => setTweak("sidebar", v)}
        />
        <window.TweakRadio
          label="Density"
          value={t.density}
          options={["airy", "balanced", "dense"]}
          onChange={(v) => setTweak("density", v)}
        />

        <window.TweakSection label="Type" />
        <window.TweakSelect
          label="Font pairing"
          value={t.font}
          options={[
            { value: "editorial",  label: "Cormorant + Manrope (editorial)" },
            { value: "instrument", label: "Instrument + Manrope (literary)" },
            { value: "modern",     label: "Geist all-sans (modern SaaS)" },
          ]}
          onChange={(v) => setTweak("font", v)}
        />

        <window.TweakSection label="Role" />
        <window.TweakSelect
          label="View as"
          value={t.role}
          options={[
            { value: "admin",   label: "Admin" },
            { value: "tutor",   label: "Tutor" },
            { value: "student", label: "Student" },
            { value: "parent",  label: "Parent" },
          ]}
          onChange={(v) => setTweak("role", v)}
        />
      </window.TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
