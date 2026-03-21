
import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import ProtectedRoute from './components/ProtectedRoute';
import FeatureGate from './components/FeatureGate';
import { ROUTES } from './src/constants/routes';
import { initTrackingDeferred } from './src/analytics';
import { usePageTracking } from './src/analytics/router';

const Home = lazy(() => import('./pages/Home'));
const HscMathsTutoring = lazy(() => import('./pages/HscMathsTutoring'));
const Navbar = lazy(() => import('./components/Navbar'));
const Footer = lazy(() => import('./components/Footer'));
const Starfield = lazy(() =>
  import('./components/Starfield').then((module) => ({ default: module.Starfield })),
);
const MathsTutoring = lazy(() => import('./pages/MathsTutoring'));
const PortalHome = lazy(() => import('./pages/PortalHome'));
const StudentPortal = lazy(() => import('./pages/StudentPortal'));
const ParentPortal = lazy(() => import('./pages/ParentPortal'));
const TutorLogin = lazy(() => import('./pages/TutorLogin'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const TheRyzeTruth = lazy(() => import('./pages/TheRyzeTruth'));
const MeetTheTeam = lazy(() => import('./pages/MeetOurTeam'));
const HowItWorks = lazy(() => import('./pages/HowItWorks'));
const RyzeAI = lazy(() => import('./pages/RyzeAI'));
const Contact = lazy(() => import('./pages/Contact'));
const LearningStyle = lazy(() => import('./pages/LearningStyle'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Sitemap = lazy(() => import('./pages/Sitemap'));

const ENABLE_DASHBOARD =
  String((import.meta as any).env?.VITE_ENABLE_DASHBOARD || '').toLowerCase() === 'true';

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
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
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

const AppContent: React.FC = () => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');
  const isHscLanding = location.pathname.toLowerCase() === ROUTES.HSC_MATHS_TUTORING;
  const isMathsLanding = location.pathname.toLowerCase() === ROUTES.MATHS_TUTORING;
  const isLanding = isHscLanding || isMathsLanding;

  const shouldShowStarfield =
    location.pathname === '/login' ||
    location.pathname === '/admin' ||
    location.pathname === '/portal' ||
    location.pathname === '/parent-portal' ||
    location.pathname === '/tutor-portal' ||
    isDashboard;

  const bgClass =
    shouldShowStarfield || location.pathname === '/ryze-ai' || isLanding ? 'bg-[#0D0D0D]' : 'bg-[var(--bg)]';

  return (
    <div className={`relative flex min-h-screen flex-col overflow-x-hidden font-sans transition-colors duration-300 ${bgClass}`}>
      {shouldShowStarfield && (
        <Suspense fallback={null}>
          <div className="pointer-events-none fixed inset-0 z-0">
            <div className="absolute inset-0 bg-[#050510]"></div>
            <Starfield />
          </div>
        </Suspense>
      )}

      {!isDashboard && !shouldShowStarfield && !isLanding && (
        <Suspense fallback={null}>
          <Navbar />
        </Suspense>
      )}

      <main className="ryze-main-with-sticky relative z-10 flex w-full flex-grow flex-col">
        <Routes location={location}>
          <Route path={ROUTES.HOME} element={<PageWrapper><Home /></PageWrapper>} />
          <Route path={ROUTES.HSC_MATHS_TUTORING} element={<HscMathsTutoring />} />
          <Route path={ROUTES.MATHS_TUTORING} element={<MathsTutoring />} />
          <Route path="/landing" element={<Navigate to={ROUTES.MATHS_TUTORING} replace />} />
          <Route path="/the-ryze-truth" element={<PageWrapper><TheRyzeTruth /></PageWrapper>} />
          <Route path="/meet-the-team" element={<PageWrapper><MeetTheTeam /></PageWrapper>} />
          <Route path="/about" element={<PageWrapper><TheRyzeTruth /></PageWrapper>} />
          <Route path={ROUTES.HOW_IT_WORKS} element={<PageWrapper><HowItWorks /></PageWrapper>} />
          <Route path={ROUTES.RYZE_AI} element={<PageWrapper><RyzeAI /></PageWrapper>} />
          <Route path={ROUTES.CONTACT} element={<PageWrapper><Contact /></PageWrapper>} />
          <Route path="/learning-style" element={<PageWrapper><LearningStyle /></PageWrapper>} />
          <Route
            path="/login"
            element={
              <FeatureGate enabled={ENABLE_DASHBOARD}>
                <PageWrapper><PortalHome /></PageWrapper>
              </FeatureGate>
            }
          />
          <Route
            path="/admin"
            element={
              <FeatureGate enabled={ENABLE_DASHBOARD}>
                <PageWrapper><AdminLogin /></PageWrapper>
              </FeatureGate>
            }
          />
          <Route
            path="/portal"
            element={
              <FeatureGate enabled={ENABLE_DASHBOARD}>
                <PageWrapper><StudentPortal /></PageWrapper>
              </FeatureGate>
            }
          />
          <Route
            path="/parent-portal"
            element={
              <FeatureGate enabled={ENABLE_DASHBOARD}>
                <PageWrapper><ParentPortal /></PageWrapper>
              </FeatureGate>
            }
          />
          <Route
            path="/tutor-portal"
            element={
              <FeatureGate enabled={ENABLE_DASHBOARD}>
                <PageWrapper><TutorLogin /></PageWrapper>
              </FeatureGate>
            }
          />
          <Route
            path="/dashboard/*"
            element={
              <FeatureGate enabled={ENABLE_DASHBOARD}>
                <ProtectedRoute>
                  <PageWrapper><Dashboard /></PageWrapper>
                </ProtectedRoute>
              </FeatureGate>
            }
          />
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
      <LanguageProvider>
        <RouteTracking />
        <ScrollToTop />
        <Suspense fallback={<PageLoader />}>
          <AppContent />
        </Suspense>
      </LanguageProvider>
    </Router>
  );
};

export default App;
