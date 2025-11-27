
import React, { useEffect, Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { Starfield } from './components/Starfield';
import { LanguageProvider } from './contexts/LanguageContext';
import ProtectedRoute from './components/ProtectedRoute'; // Import Protection Middleware
import Home from './pages/Home';
import Pricing from './pages/Pricing';

// Eager load Portal pages for instant navigation and zero lag
import PortalHome from './pages/PortalHome';
import StudentPortal from './pages/StudentPortal';
import ParentPortal from './pages/ParentPortal';
import TutorLogin from './pages/TutorLogin';
import AdminLogin from './pages/AdminLogin';

// Lazy load heavy pages to enable code splitting
const TheRyzeTruth = lazy(() => import('./pages/TheRyzeTruth'));
const MeetTheTeam = lazy(() => import('./pages/MeetTheTeam'));
const HowItWorks = lazy(() => import('./pages/HowItWorks'));
const RyzeAI = lazy(() => import('./pages/RyzeAI'));
const Contact = lazy(() => import('./pages/Contact'));
const PrimaryCourse = lazy(() => import('./pages/courses/PrimaryCourse'));
const SecondaryCourse = lazy(() => import('./pages/courses/SecondaryCourse'));
const PrimaryOverview = lazy(() => import('./pages/courses/PrimaryOverview'));
const SecondaryOverview = lazy(() => import('./pages/courses/SecondaryOverview'));
const Dashboard = lazy(() => import('./pages/Dashboard')); // New SaaS Dashboard
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Sitemap = lazy(() => import('./pages/Sitemap'));
const FAQ = lazy(() => import('./pages/FAQ'));

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
    style={{ willChange: "opacity, transform" }}
    className="flex-grow flex flex-col w-full relative z-10"
  >
    {children}
  </motion.div>
);

const AppContent: React.FC = () => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');
  
  // Routes that share the "Portal" aesthetic (Starfield background)
  // We include Dashboard here to keep the background persistent when logging in
  const shouldShowStarfield = location.pathname === '/login' || 
                              location.pathname === '/admin' || 
                              location.pathname === '/portal' || 
                              location.pathname === '/parent-portal' || 
                              location.pathname === '/tutor-portal' ||
                              isDashboard;

  // Determine background class based on route type
  // Marketing pages get slate-50, App/Portal pages get dark background
  const bgClass = (shouldShowStarfield || location.pathname === '/ryze-ai') 
    ? 'bg-[#050510]' 
    : 'bg-slate-50';

  return (
    <div className={`flex flex-col min-h-screen font-sans relative transition-colors duration-300 overflow-x-hidden ${bgClass}`}>
      
      {/* Persistent Background for Portal & Dashboard Pages to prevent 'Star Reset' */}
      {shouldShowStarfield && (
        <div className="fixed inset-0 z-0 pointer-events-none">
           <div className="absolute inset-0 bg-[#050510]"></div>
           <Starfield />
        </div>
      )}

      {(!isDashboard && !shouldShowStarfield) && <Navbar />}
      
      <main className="flex-grow flex flex-col relative z-10 w-full">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
            <Route path="/the-ryze-truth" element={<PageWrapper><TheRyzeTruth /></PageWrapper>} />
            <Route path="/meet-the-team" element={<PageWrapper><MeetTheTeam /></PageWrapper>} />
            <Route path="/about" element={<PageWrapper><TheRyzeTruth /></PageWrapper>} />
            <Route path="/how-it-works" element={<PageWrapper><HowItWorks /></PageWrapper>} />
            <Route path="/ryze-ai" element={<PageWrapper><RyzeAI /></PageWrapper>} />
            <Route path="/contact" element={<PageWrapper><Contact /></PageWrapper>} />
            <Route path="/pricing" element={<PageWrapper><Pricing /></PageWrapper>} />
            <Route path="/faq" element={<PageWrapper><FAQ /></PageWrapper>} />
            
            {/* Portal Routes - Now Eager Loaded for Performance */}
            <Route path="/login" element={<PageWrapper><PortalHome /></PageWrapper>} />
            <Route path="/admin" element={<PageWrapper><AdminLogin /></PageWrapper>} />
            <Route path="/portal" element={<PageWrapper><StudentPortal /></PageWrapper>} />
            <Route path="/parent-portal" element={<PageWrapper><ParentPortal /></PageWrapper>} />
            <Route path="/tutor-portal" element={<PageWrapper><TutorLogin /></PageWrapper>} />
            
            {/* Protected Dashboard Route */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <PageWrapper><Dashboard /></PageWrapper>
                </ProtectedRoute>
              } 
            />
            
            <Route path="/terms" element={<PageWrapper><Terms /></PageWrapper>} />
            <Route path="/privacy" element={<PageWrapper><Privacy /></PageWrapper>} />
            <Route path="/sitemap" element={<PageWrapper><Sitemap /></PageWrapper>} />
            
            {/* Overview Routes */}
            <Route path="/primary" element={<PageWrapper><PrimaryOverview /></PageWrapper>} />
            <Route path="/secondary" element={<PageWrapper><SecondaryOverview /></PageWrapper>} />

            {/* Specific Course Routes */}
            <Route path="/primary/:courseId" element={<PageWrapper><PrimaryCourse /></PageWrapper>} />
            <Route path="/secondary/:courseId" element={<PageWrapper><SecondaryCourse /></PageWrapper>} />
          </Routes>
        </AnimatePresence>
      </main>
      {(!isDashboard && !shouldShowStarfield) && <Footer />}
    </div>
  );
};

const App: React.FC = () => {
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
