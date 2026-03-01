
import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { Starfield } from './components/Starfield';
// import CookieConsent from './components/CookieConsent';
import { LanguageProvider } from './contexts/LanguageContext';
import ProtectedRoute from './components/ProtectedRoute'; // Import Protection Middleware
import FeatureGate from './components/FeatureGate';
import Home from './pages/Home';
import Landing from './pages/Landing';
import { ROUTES } from './src/constants/routes';
import { initTrackingDeferred } from './src/analytics';
import StickyMobileCTA from './components/StickyMobileCTA';

// Lazy load portal and heavy pages to keep the marketing bundle lean.
const PortalHome = lazy(() => import('./pages/PortalHome'));
const StudentPortal = lazy(() => import('./pages/StudentPortal'));
const ParentPortal = lazy(() => import('./pages/ParentPortal'));
const TutorLogin = lazy(() => import('./pages/TutorLogin'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));

// Lazy load heavy pages to enable code splitting
const TheRyzeTruth = lazy(() => import('./pages/TheRyzeTruth'));
const MeetTheTeam = lazy(() => import('./pages/MeetOurTeam'));
const HowItWorks = lazy(() => import('./pages/HowItWorks'));
const RyzeAI = lazy(() => import('./pages/RyzeAI'));
const Contact = lazy(() => import('./pages/Contact'));
const LearningStyle = lazy(() => import('./pages/LearningStyle'));
const Dashboard = lazy(() => import('./pages/Dashboard')); // New SaaS Dashboard
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
    const maxAttempts = 50; // Try for ~5 seconds to allow lazy chunks to load

    const attemptScroll = () => {
      attempts++;
      const element = document.getElementById(id);

      if (element) {
        // Found the element, scroll to it
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return true;
      }

      if (attempts >= maxAttempts) return true; // Stop trying
      return false; // Keep trying
    };

    // Attempt immediately
    if (attemptScroll()) return;

    // Poll for existence
    const interval = setInterval(() => {
      if (attemptScroll()) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [pathname, hash]);

  return null;
};

// Minimal loader
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh] bg-transparent">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-[#FFB000] rounded-full animate-spin"></div>
  </div>
);

// Performance-optimized Page Wrapper for smooth transitions
const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -15 }}
    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    style={{ willChange: 'opacity, transform' }}
    className="flex-grow flex flex-col w-full relative z-10"
  >
    {children}
  </motion.div>
);

const AppContent: React.FC = () => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');
  const isLanding = location.pathname.toLowerCase() === ROUTES.HSC_MATHS_TUTORING;
  const isHome = location.pathname === ROUTES.HOME;
  const showStickyPrimaryCta = isHome || isLanding;

  // Routes that share the "Portal" aesthetic (Starfield background)
  // We include Dashboard here to keep the background persistent when logging in
  const shouldShowStarfield =
    location.pathname === '/login' ||
    location.pathname === '/admin' ||
    location.pathname === '/portal' ||
    location.pathname === '/parent-portal' ||
    location.pathname === '/tutor-portal' ||
    isDashboard;

  // Determine background class based on route type
  // Marketing pages get slate-50, App/Portal pages get dark background
  const bgClass = shouldShowStarfield || location.pathname === '/ryze-ai' || isLanding ? 'bg-[#0D0D0D]' : 'bg-slate-50';

  return (
    <div className={`flex flex-col min-h-screen font-sans relative transition-colors duration-300 overflow-x-hidden ${bgClass}`}>
      {/* Persistent Background for Portal & Dashboard Pages to prevent 'Star Reset' */}
      {shouldShowStarfield && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[#050510]"></div>
          <Starfield />
        </div>
      )}

      {!isDashboard && !shouldShowStarfield && !isLanding && <Navbar />}

      <main className="ryze-main-with-sticky flex-grow flex flex-col relative z-10 w-full">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path={ROUTES.HOME} element={<PageWrapper><Home /></PageWrapper>} />
            <Route path={ROUTES.HSC_MATHS_TUTORING} element={<Landing />} />
            <Route path="/landing" element={<Navigate to={ROUTES.HSC_MATHS_TUTORING} replace />} />
            <Route path="/the-ryze-truth" element={<PageWrapper><TheRyzeTruth /></PageWrapper>} />
            <Route path="/meet-the-team" element={<PageWrapper><MeetTheTeam /></PageWrapper>} />
            <Route path="/about" element={<PageWrapper><TheRyzeTruth /></PageWrapper>} />
            <Route path={ROUTES.HOW_IT_WORKS} element={<PageWrapper><HowItWorks /></PageWrapper>} />
            <Route path={ROUTES.RYZE_AI} element={<PageWrapper><RyzeAI /></PageWrapper>} />
            <Route path={ROUTES.CONTACT} element={<PageWrapper><Contact /></PageWrapper>} />
            <Route path="/learning-style" element={<PageWrapper><LearningStyle /></PageWrapper>} />

            {/* Portal Routes - Feature gated in production */}
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

            {/* Protected Dashboard Route (deep links included) */}
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
        </AnimatePresence>
      </main>
      {showStickyPrimaryCta && (
        <StickyMobileCTA
          page={isHome ? 'home' : 'hsc_landing'}
          href={isHome ? `${ROUTES.HSC_MATHS_TUTORING}#book` : '#book'}
        />
      )}
      {!isDashboard && !shouldShowStarfield && !isLanding && <Footer />}
      {/* <CookieConsent /> */}
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
        <ScrollToTop />
        <Suspense fallback={<PageLoader />}>
          <AppContent />
        </Suspense>
      </LanguageProvider>
    </Router>
  );
};

export default App;

