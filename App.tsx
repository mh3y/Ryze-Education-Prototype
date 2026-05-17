
import React, { useEffect, Suspense, lazy, Component } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import FeatureGate from './components/FeatureGate';
import { ROUTES } from './src/constants/routes';
import { initTrackingDeferred } from './src/analytics';
import { usePageTracking } from './src/analytics/router';
import { getMobileChromeConfig } from './src/utils/mobileChrome';

const Home = lazy(() => import('./pages/Home'));
const HscMathsTutoring = lazy(() => import('./pages/HscMathsTutoring'));
const SelectiveOcProgram = lazy(() => import('./pages/SelectiveOcProgram'));
const AcceleratedMathsProgram = lazy(() => import('./pages/AcceleratedMathsProgram'));
const PrimaryMathsProgram = lazy(() => import('./pages/PrimaryMathsProgram'));
const JuniorFoundationsProgram = lazy(() => import('./pages/JuniorFoundationsProgram'));
const Navbar = lazy(() => import('./components/Navbar'));
const Footer = lazy(() => import('./components/Footer'));
const Starfield = lazy(() =>
  import('./components/Starfield').then((module) => ({ default: module.Starfield })),
);
const MathsTutoring = lazy(() => import('./pages/MathsTutoring'));
// Auth pages
const Login = lazy(() => import('./pages/Login'));
const DiscordCallback = lazy(() => import('./pages/DiscordCallback'));
const SetPassword = lazy(() => import('./pages/SetPassword'));
const TheRyzeTruth = lazy(() => import('./pages/TheRyzeTruth'));
const MeetTheTeam = lazy(() => import('./pages/MeetOurTeam'));
const HowItWorks = lazy(() => import('./pages/HowItWorks'));
const RyzeAI = lazy(() => import('./pages/RyzeAI'));
const Contact = lazy(() => import('./pages/Contact'));
const LearningStyle = lazy(() => import('./pages/LearningStyle'));
// Dashboard layout + page components
const DashboardLayout     = lazy(() => import('./components/dashboard/DashboardLayout'));
const OverviewPage        = lazy(() => import('./pages/dashboard/OverviewPage'));
const PlaceholderPage     = lazy(() => import('./pages/dashboard/PlaceholderPage'));
// Legacy dashboard admin views (kept for bot/ops routes not yet replaced)
const BotHealth      = lazy(() => import('./components/dashboard/admin/BotHealth').then(m => ({ default: m.BotHealth })));
const StudentsView   = lazy(() => import('./components/dashboard/admin/StudentsView').then(m => ({ default: m.StudentsView })));
const AttendanceView = lazy(() => import('./components/dashboard/admin/AttendanceView').then(m => ({ default: m.AttendanceView })));
const RemindersView  = lazy(() => import('./components/dashboard/admin/RemindersView').then(m => ({ default: m.RemindersView })));
const AiArena        = lazy(() => import('./components/dashboard/AiArena').then(m => ({ default: m.AiArena })));
const IngestionStudio = lazy(() => import('./components/dashboard/IngestionStudio').then(m => ({ default: m.IngestionStudio })));
// Phase 3 admin pages
const AdminOverview   = lazy(() => import('./pages/dashboard/admin/AdminOverview'));
const StudentsPage    = lazy(() => import('./pages/dashboard/admin/StudentsPage'));
const StudentDetail   = lazy(() => import('./pages/dashboard/admin/StudentDetail'));
const ParentsPage     = lazy(() => import('./pages/dashboard/admin/ParentsPage'));
const ParentDetail    = lazy(() => import('./pages/dashboard/admin/ParentDetail'));
const ClassesPage     = lazy(() => import('./pages/dashboard/admin/ClassesPage'));
const ClassDetail     = lazy(() => import('./pages/dashboard/admin/ClassDetail'));
const LessonsPage     = lazy(() => import('./pages/dashboard/admin/LessonsPage'));
const PaymentsPage    = lazy(() => import('./pages/dashboard/admin/PaymentsPage'));
const AlertsPage      = lazy(() => import('./pages/dashboard/admin/AlertsPage'));
const ProgressReportsPage = lazy(() => import('./pages/dashboard/admin/ProgressReportsPage'));
const LessonDetail        = lazy(() => import('./pages/dashboard/admin/LessonDetail'));
const TutorPaymentsPage   = lazy(() => import('./pages/dashboard/admin/TutorPaymentsPage'));
const ResourcesPage       = lazy(() => import('./pages/dashboard/admin/ResourcesPage'));
const AnnouncementsPage   = lazy(() => import('./pages/dashboard/admin/AnnouncementsPage'));
const HomeworkPage        = lazy(() => import('./pages/dashboard/admin/HomeworkPage'));
const SettingsPage        = lazy(() => import('./pages/dashboard/SettingsPage'));
const CalendarPage        = lazy(() => import('./pages/dashboard/CalendarPage'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Sitemap = lazy(() => import('./pages/Sitemap'));

const ENABLE_DASHBOARD =
  String((import.meta as any).env?.VITE_ENABLE_DASHBOARD || '').toLowerCase() === 'true';

/**
 * Catches Starfield render errors so a WebGL/worker failure doesn't blank the entire page.
 * Falls back to the solid #050510 background that is already in the DOM behind the canvas.
 */
class StarfieldErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      // Degrade gracefully — solid dark background is shown by the div beneath Starfield
      return (
        <div className="pointer-events-none fixed inset-0 z-0 bg-[#050510]" />
      );
    }
    return this.props.children;
  }
}

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scrollBehavior: ScrollBehavior = prefersReducedMotion ? 'auto' : 'smooth';

    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }

    const id = hash.replace('#', '');
    let attempts = 0;
    const maxAttempts = 50;

    const attemptScroll = () => {
      attempts++;
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: scrollBehavior, block: 'start' });
        return true;
      }

      if (attempts >= maxAttempts) return true;
      return false;
    };

    if (attemptScroll()) return;

    const interval = setInterval(() => {
      if (attemptScroll()) clearInterval(interval);
    }, 100);

    return () => clearInterval(interval);
  }, [pathname, hash]);

  return null;
};

const PageLoader = () => (
  <div className="flex min-h-[60vh] items-center justify-center bg-transparent">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#b8841e]"></div>
  </div>
);

const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="relative z-10 flex w-full flex-grow flex-col">{children}</div>
);

const RouteTracking = () => {
  usePageTracking();
  return null;
};

/**
 * AdminGuard — layout route that restricts /dashboard/admin/* to admin and tutor roles.
 * Renders <Outlet /> when authorised, redirects to /dashboard otherwise.
 */
const AdminGuard: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null; // ProtectedRoute above already handles unauthenticated
  if (user.role !== 'admin' && user.role !== 'tutor') {
    return <Navigate to="/dashboard/overview" replace />;
  }
  return <Outlet />;
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');
  const isHome = location.pathname === ROUTES.HOME;
  const programLandingPaths = [
    ROUTES.HSC_MATHS_PROGRAM,
    ROUTES.SELECTIVE_OC_PROGRAM,
    ROUTES.ACCELERATED_MATHS_PROGRAM,
    ROUTES.PRIMARY_MATHS_PROGRAM,
    ROUTES.JUNIOR_FOUNDATIONS_PROGRAM,
  ];
  const isHscLanding = location.pathname.toLowerCase() === ROUTES.HSC_MATHS_PROGRAM;
  const isMathsLanding = location.pathname.toLowerCase() === ROUTES.MATHS_TUTORING;
  const isProgramLanding = programLandingPaths.includes(location.pathname.toLowerCase() as any);
  const isLanding = isProgramLanding || isMathsLanding;
  const mobileChrome = getMobileChromeConfig(location.pathname);

  const shouldShowStarfield =
    location.pathname === '/login' ||
    location.pathname === '/admin' ||
    location.pathname === '/portal' ||
    location.pathname === '/parent-portal' ||
    location.pathname === '/tutor-portal' ||
    location.pathname.startsWith('/auth/') ||
    isDashboard;

  const bgClass =
    shouldShowStarfield || location.pathname === '/ryze-ai' || isLanding
      ? 'bg-[#0D0D0D]'
      : isHome
        ? 'bg-[#171d28] md:bg-[var(--bg)]'
        : 'bg-[var(--bg)]';

  useEffect(() => {
    const root = document.documentElement;
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');

    const applyThemeColor = () => {
      if (!themeColorMeta) return;
      themeColorMeta.setAttribute('content', window.innerWidth >= 768 ? '#171d28' : mobileChrome.themeColor);
    };

    root.style.setProperty('--ryze-mobile-chrome-top', mobileChrome.top);
    root.style.setProperty('--ryze-mobile-chrome-bottom', mobileChrome.bottom);
    root.style.setProperty('--ryze-mobile-chrome-solid', mobileChrome.solid);
    root.dataset.ryzeMobileChromeTone = mobileChrome.tone;

    applyThemeColor();
    window.addEventListener('resize', applyThemeColor);

    return () => {
      window.removeEventListener('resize', applyThemeColor);
    };
  }, [mobileChrome.bottom, mobileChrome.solid, mobileChrome.themeColor, mobileChrome.tone, mobileChrome.top]);

  return (
    <div className={`ryze-marketing-shell relative flex min-h-screen min-h-[100dvh] flex-col overflow-x-hidden font-sans transition-colors duration-300 ${bgClass}`}>
      <a
        href="#main-content"
        className="sr-only fixed left-4 top-4 z-[120] rounded-full bg-[#171d28] px-4 py-2 text-sm font-semibold text-[#f8f3ea] shadow-lg focus:not-sr-only"
      >
        Skip to main content
      </a>

      {shouldShowStarfield && (
        <StarfieldErrorBoundary>
          <Suspense fallback={<div className="pointer-events-none fixed inset-0 z-0 bg-[#050510]" />}>
            <div className="pointer-events-none fixed inset-0 z-0">
              <div className="absolute inset-0 bg-[#050510]"></div>
              <Starfield />
            </div>
          </Suspense>
        </StarfieldErrorBoundary>
      )}

      {!isDashboard && !shouldShowStarfield && (
        <Suspense fallback={null}>
          <Navbar />
        </Suspense>
      )}

      <main id="main-content" className="ryze-main-with-sticky relative z-10 flex w-full flex-grow flex-col" tabIndex={-1}>
        <Routes location={location}>
          <Route path={ROUTES.HOME} element={<PageWrapper><Home /></PageWrapper>} />
          <Route path={ROUTES.HSC_MATHS_PROGRAM} element={<HscMathsTutoring />} />
          <Route path="/hsc-maths-tutoring" element={<Navigate to={ROUTES.HSC_MATHS_PROGRAM} replace />} />
          <Route path={ROUTES.SELECTIVE_OC_PROGRAM} element={<SelectiveOcProgram />} />
          <Route path={ROUTES.ACCELERATED_MATHS_PROGRAM} element={<AcceleratedMathsProgram />} />
          <Route path={ROUTES.PRIMARY_MATHS_PROGRAM} element={<PrimaryMathsProgram />} />
          <Route path={ROUTES.JUNIOR_FOUNDATIONS_PROGRAM} element={<JuniorFoundationsProgram />} />
          <Route path={ROUTES.MATHS_TUTORING} element={<MathsTutoring />} />
          <Route path="/landing" element={<Navigate to={ROUTES.MATHS_TUTORING} replace />} />
          <Route path="/the-ryze-truth" element={<PageWrapper><TheRyzeTruth /></PageWrapper>} />
          <Route path="/meet-the-team" element={<PageWrapper><MeetTheTeam /></PageWrapper>} />
          <Route path="/about" element={<PageWrapper><TheRyzeTruth /></PageWrapper>} />
          <Route path={ROUTES.HOW_IT_WORKS} element={<PageWrapper><HowItWorks /></PageWrapper>} />
          <Route path={ROUTES.RYZE_AI} element={<PageWrapper><RyzeAI /></PageWrapper>} />
          <Route path={ROUTES.CONTACT} element={<PageWrapper><Contact /></PageWrapper>} />
          <Route path="/learning-style" element={<PageWrapper><LearningStyle /></PageWrapper>} />
          {/* ── Auth routes (new unified login system) ── */}
          <Route
            path="/login"
            element={
              <FeatureGate enabled={ENABLE_DASHBOARD}>
                <PageWrapper><Login /></PageWrapper>
              </FeatureGate>
            }
          />
          {/* /admin is an alias for /login — kept for backward compat */}
          <Route
            path="/admin"
            element={
              <FeatureGate enabled={ENABLE_DASHBOARD}>
                <Navigate to="/login" replace />
              </FeatureGate>
            }
          />
          {/* Discord OAuth2 callback — exchanges code for JWT */}
          <Route
            path="/auth/discord/callback"
            element={
              <FeatureGate enabled={ENABLE_DASHBOARD}>
                <DiscordCallback />
              </FeatureGate>
            }
          />
          {/* Parent invite / set-password flow */}
          <Route
            path="/auth/invite"
            element={
              <FeatureGate enabled={ENABLE_DASHBOARD}>
                <PageWrapper><SetPassword /></PageWrapper>
              </FeatureGate>
            }
          />
          {/* Legacy portal routes — kept for any existing bookmarks */}
          <Route
            path="/portal"
            element={
              <FeatureGate enabled={ENABLE_DASHBOARD}>
                <Navigate to="/login" replace />
              </FeatureGate>
            }
          />
          <Route
            path="/parent-portal"
            element={
              <FeatureGate enabled={ENABLE_DASHBOARD}>
                <Navigate to="/login" replace />
              </FeatureGate>
            }
          />
          <Route
            path="/tutor-portal"
            element={
              <FeatureGate enabled={ENABLE_DASHBOARD}>
                <Navigate to="/login" replace />
              </FeatureGate>
            }
          />
          {/* ── Dashboard (nested routes) ─────────────────────────────────── */}
          <Route
            path="/dashboard"
            element={
              <FeatureGate enabled={ENABLE_DASHBOARD}>
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              </FeatureGate>
            }
          >
            {/* Index: redirect to overview */}
            <Route index element={<Navigate to="overview" replace />} />

            {/* ── LMS routes ── */}
            <Route path="overview"    element={<OverviewPage />} />
            <Route path="ryze-ai"     element={<AiArena />} />
            <Route path="upload"      element={<IngestionStudio />} />
            <Route path="analytics"   element={<PlaceholderPage title="Analytics" />} />
            <Route path="courses"     element={<PlaceholderPage title="Courses" />} />
            <Route path="assignments" element={<PlaceholderPage title="Assignments" />} />
            <Route path="settings"    element={<SettingsPage />} />
            <Route path="calendar"    element={<CalendarPage />} />

            {/* ── Bot / ops routes ── */}
            <Route path="bot-health"  element={<BotHealth />} />
            <Route path="members"     element={<StudentsView />} />
            <Route path="reminders"   element={<RemindersView />} />

            {/* ── Admin routes (Phase 3+) — guarded to admin + tutor roles ── */}
            <Route path="admin" element={<AdminGuard />}>
              {/* /dashboard/admin → admin overview */}
              <Route index element={<AdminOverview />} />
              <Route path="students"        element={<StudentsPage />} />
              <Route path="students/:id"    element={<StudentDetail />} />
              <Route path="classes"         element={<ClassesPage />} />
              <Route path="classes/:id"    element={<ClassDetail />} />
              <Route path="lessons"         element={<LessonsPage />} />
              <Route path="lessons/:id"    element={<LessonDetail />} />
              <Route path="attendance"      element={<AttendanceView />} />
              <Route path="parents"         element={<ParentsPage />} />
              <Route path="parents/:id"    element={<ParentDetail />} />
              <Route path="payments"        element={<PaymentsPage />} />
              <Route path="tutor-payments"  element={<TutorPaymentsPage />} />
              <Route path="progress-reports" element={<ProgressReportsPage />} />
              <Route path="homework"        element={<HomeworkPage />} />
              <Route path="alerts"          element={<AlertsPage />} />
              <Route path="resources"       element={<ResourcesPage />} />
              <Route path="announcements"   element={<AnnouncementsPage />} />
            </Route>

            {/* Catch-all — redirect unknown paths to overview */}
            <Route path="*" element={<Navigate to="overview" replace />} />
          </Route>
          <Route path={ROUTES.TERMS} element={<PageWrapper><Terms /></PageWrapper>} />
          <Route path={ROUTES.PRIVACY} element={<PageWrapper><Privacy /></PageWrapper>} />
          <Route path={ROUTES.SITEMAP} element={<PageWrapper><Sitemap /></PageWrapper>} />
        </Routes>
      </main>

      {!isDashboard && !shouldShowStarfield && !isLanding && (
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      )}
    </div>
  );
};

const App: React.FC = () => {
  useEffect(() => {
    initTrackingDeferred();

    if (import.meta.env.PROD) {
      console.info(`[FeatureGate] Dashboard routes enabled: ${ENABLE_DASHBOARD}`);
    }
  }, []);

  return (
    <Router>
      <AuthProvider>
        <LanguageProvider>
          <RouteTracking />
          <ScrollToTop />
          <Suspense fallback={<PageLoader />}>
            <AppContent />
          </Suspense>
        </LanguageProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
