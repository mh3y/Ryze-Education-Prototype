
import React, { useEffect, Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { Starfield } from './components/Starfield';
import CookieConsent from './components/CookieConsent';
import { LanguageProvider } from './contexts/LanguageContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Pricing from './pages/Pricing';

// Eager load Portal pages
import PortalHome from './pages/PortalHome';
import StudentPortal from './pages/StudentPortal';
import ParentPortal from './pages/ParentPortal';
import TutorLogin from './pages/TutorLogin';
import AdminLogin from './pages/AdminLogin';

// Lazy load other pages
const TheRyzeTruth = lazy(() => import('./pages/TheRyzeTruth'));
const MeetTheTeam = lazy(() => import('./pages/MeetOurTeam'));
const HowRyzeWorks = lazy(() => import('./pages/HowRyzeWorks'));
const Testimonials = lazy(() => import('./pages/Testimonials'));
const RyzeAI = lazy(() => import('./pages/RyzeAI'));
const Contact = lazy(() => import('./pages/Contact'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Sitemap = lazy(() => import('./pages/Sitemap'));

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);
  return null;
};

const PageLoader = () => (
  <div className="flex items-center justify-center h-screen bg-black">
    <div className="w-10 h-10 border-4 border-gray-800 border-t-yellow-400 rounded-full animate-spin"></div>
  </div>
);

const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    className="flex-grow flex flex-col w-full"
  >
    {children}
  </motion.div>
);

const AppContent: React.FC = () => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');
  const isAiPage = location.pathname === '/ryze-ai';

  const isPortalPage = location.pathname === '/login' ||
                       location.pathname === '/admin' ||
                       location.pathname === '/portal' ||
                       location.pathname === '/parent-portal' ||
                       location.pathname === '/tutor-portal' ||
                       isDashboard;

  const useModernDesign = !isPortalPage && !isAiPage;

  let bgClass = 'bg-black';
  if (isPortalPage || isAiPage) {
    bgClass = 'bg-[#050510]';
  }

  return (
    <div className={`flex flex-col min-h-screen font-sans relative transition-colors duration-500 overflow-x-hidden ${bgClass}`}>
      {useModernDesign && (
        <div className="fixed inset-0 w-full h-full bg-[url('https://res.cloudinary.com/dsvjhemjd/image/upload/v1716352933/noise_qs9f1z.png')] opacity-15 pointer-events-none z-0"></div>
      )}
      
      {(isPortalPage || isAiPage) && (
        <div className="fixed inset-0 z-0 pointer-events-none">
           <div className="absolute inset-0 bg-[#050510]"></div>
           <Starfield />
        </div>
      )}

      <div className="relative z-10 flex flex-col flex-grow">
        {!isDashboard && <Navbar />}
        
        <main className="flex-grow flex flex-col w-full">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
              <Route path="/the-ryze-truth" element={<PageWrapper><TheRyzeTruth /></PageWrapper>} />
              <Route path="/meet-the-team" element={<PageWrapper><MeetTheTeam /></PageWrapper>} />
              <Route path="/about" element={<PageWrapper><TheRyzeTruth /></PageWrapper>} />
              <Route path="/how-ryze-works" element={<PageWrapper><HowRyzeWorks /></PageWrapper>} />
              <Route path="/testimonials" element={<PageWrapper><Testimonials /></PageWrapper>} />
              <Route path="/ryze-ai" element={<RyzeAI />} />
              <Route path="/contact" element={<PageWrapper><Contact /></PageWrapper>} />
              <Route path="/pricing" element={<PageWrapper><Pricing /></PageWrapper>} />
              
              <Route path="/login" element={<PageWrapper><PortalHome /></PageWrapper>} />
              <Route path="/admin" element={<PageWrapper><AdminLogin /></PageWrapper>} />
              <Route path="/portal" element={<PageWrapper><StudentPortal /></PageWrapper>} />
              <Route path="/parent-portal" element={<PageWrapper><ParentPortal /></PageWrapper>} />
              <Route path="/tutor-portal" element={<PageWrapper><TutorLogin /></PageWrapper>} />
              
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
            </Routes>
          </AnimatePresence>
        </main>
        
        {!isDashboard && !isPortalPage && !isAiPage && <Footer />}
      </div>
      <CookieConsent />
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
