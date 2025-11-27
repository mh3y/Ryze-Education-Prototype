
import React, { useEffect, Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { Starfield } from './components/Starfield';
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

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        const id = hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
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
// Removed 'y' translation to prevent layout/scrollbar jitter
const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2, ease: "easeInOut" }} 
    className="flex-grow flex flex-col w-full will-change-auto relative z-10"
  >
    {children}
  </motion.div>
);

const AppContent: React.FC = () => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');
  
  // Routes that share the "Portal" aesthetic (Starfield background)
  const isPortalGateway = location.pathname === '/login' || 
                          location.pathname === '/admin' || 
                          location.pathname === '/portal' || 
                          location.pathname === '/parent-portal' || 
                          location.pathname === '/tutor-portal';

  // Determine background class based on route type
  // Marketing pages get slate-50, App/Portal pages get dark background
  const bgClass = (isDashboard || isPortalGateway || location.pathname === '/ryze-ai') 
    ? 'bg-[#050510]' 
    : 'bg-slate-50';

  return (
    <div className={`flex flex-col min-h-screen font-sans relative transition-colors duration-300 overflow-x-hidden ${bgClass}`}>
      
      {/* Persistent Background for Portal Pages to prevent 'Star Reset' */}
      {isPortalGateway && (
        <div className="fixed inset-0 z-0 pointer-events-none">
           <div className="absolute inset-0 bg-[#050510]"></div>
           <Starfield />
        </div>
      )}

      {(!isDashboard && !isPortalGateway) && <Navbar />}
      
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
            
            {/* Portal Routes - Now Eager Loaded for Performance */}
            <Route path="/login" element={<PageWrapper><PortalHome /></PageWrapper>} />
            <Route path="/admin" element={<PageWrapper><AdminLogin /></PageWrapper>} />
            <Route path="/portal" element={<PageWrapper><StudentPortal /></PageWrapper>} />
            <Route path="/parent-portal" element={<PageWrapper><ParentPortal /></PageWrapper>} />
            <Route path="/tutor-portal" element={<PageWrapper><TutorLogin /></PageWrapper>} />
            
            <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
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
      {(!isDashboard && !isPortalGateway) && <Footer />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <AppContent />
      </Suspense>
    </Router>
  );
};

export default App;