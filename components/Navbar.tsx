
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate, Link } from 'react-router-dom';
import { Menu, X, ChevronRight, Zap, ChevronDown, ArrowRight, LogIn, Globe } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { trackPrimaryCtaClick } from '../src/analytics';
import { PRIMARY_CTA_LABEL } from './PrimaryCTA';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { language, toggleLanguage, t } = useLanguage();
  const brandLogoUrl = 'https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto:good,c_limit,w_320,dpr_auto/v1764105292/yellow_logo_png_bvs11z.png';

  // Centralized list for pages that require white navbar text when transparent
  const darkThemeRoutes = ['/ryze-ai', '/login', '/contact', '/learning-style'];
  const isDarkThemePage = darkThemeRoutes.includes(location.pathname);
  const isHomePage = location.pathname === '/';

  // Determine if the navbar is transparent at the top of the homepage
  const isHomePageAtTop = isHomePage && !scrolled && !isOpen;

  // Unified condition for when text/icons should be white
  // White text is used for dark pages OR the homepage when at the top.
  const useWhiteText = isDarkThemePage || isHomePageAtTop;

  // Scroll locking for mobile menu
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  // Detect scroll position
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  const aboutSubLinks = [
    { name: 'The Ryze Truth', path: '/the-ryze-truth', desc: "Our philosophy and story." },
    { name: 'How Ryze Works', path: '/how-ryze-works', desc: "Our process explained." },
  ];

  // --- DYNAMIC STYLING ---

  // Navbar background: Transparent at top, then colored on scroll/open
  const navClasses = `fixed w-full z-50 transition-all duration-300 border-b ${
    scrolled || isOpen
      ? isDarkThemePage // When scrolled/open, pick bg based on page theme
        ? 'bg-[#050510]/80 backdrop-blur-xl border-white/10 py-2' 
        : 'bg-white/80 backdrop-blur-xl border-slate-200/50 py-2 shadow-sm'
      : 'bg-transparent border-transparent py-6' // Transparent at the top
  }`;

  // Nav links color: White for dark pages/homepage-top, dark for light pages
  const linkClasses = (isActive: boolean) => {
    if (isActive) {
      // Special active color for the Learning Style page
      if (location.pathname === '/learning-style') return 'text-[#FFB000]';
      return 'text-ryze';
    }
    if (useWhiteText) {
      // Homepage gets a different hover color
      if (isHomePageAtTop) return 'text-white hover:text-yellow-300';
      return 'text-white hover:text-slate-300'; // Other dark pages
    }
    return 'text-slate-900 hover:text-ryze'; // Default for light pages
  };

  const aboutButtonClasses = () => {
    const isActive = ['/the-ryze-truth', '/how-ryze-works'].includes(location.pathname);
    if (isActive) return 'text-ryze';
    
    if (useWhiteText) {
      if (isHomePageAtTop) return 'text-white hover:text-yellow-300';
      return 'text-white hover:text-slate-300';
    }
    return 'text-slate-900 hover:text-ryze';
  };

  const loginButtonClasses = `h-11 w-[130px] rounded-full text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap transform hover:-translate-y-0.5 active:scale-95 active:translate-y-0 ${
    isHomePageAtTop 
      ? 'bg-[#ffb000]/70 border-2 border-[#FFB000] text-white hover:bg-[#FFB000] hover:text-black' 
      : 'bg-[#ffb000] text-white shadow-[0_0_20px_rgba(255,176,0,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.4)]'
  }`;
  
  const trialButtonClasses = `h-11 px-4 ml-2 rounded-full text-sm font-bold transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 active:translate-y-0 flex items-center justify-center whitespace-nowrap ${
    isHomePageAtTop 
      ? 'bg-[#ffb000]/70 border-2 border-[#FFB000] text-white hover:bg-[#FFB000] hover:text-black'
      : 'bg-[#ffb000] text-white shadow-[0_0_20px_rgba(255,176,0,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.4)]'
  }`;

  // --- ANIMATION VARIANTS ---
  const accordionVariants: Variants = {
    open: { opacity: 1, height: "auto", transition: { duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] } },
    collapsed: { opacity: 0, height: 0, transition: { duration: 0.2, ease: [0.04, 0.62, 0.23, 0.98] } }
  };

  const menuVariants: Variants = {
    closed: { x: "100%", opacity: 0, transition: { type: "tween", duration: 0.3 } },
    open: { x: 0, opacity: 1, transition: { type: "tween", duration: 0.3 } }
  };

  return (
    <nav className={navClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          <div className="flex-shrink-0 cursor-pointer group z-50" onClick={() => { setIsOpen(false); navigate('/'); }}>
            <img 
              src={brandLogoUrl}
              alt="Ryze Education" 
              width={250}
              height={64}
              className={`h-10 md:h-16 w-auto transition-all duration-500 ${useWhiteText ? 'brightness-0 invert' : 'group-hover:scale-105'}`}
            />
          </div>

          <div className="hidden md:flex items-center gap-4 lg:gap-8">
            
            <div 
              className="relative group"
              onMouseEnter={() => setAboutDropdownOpen(true)}
              onMouseLeave={() => setAboutDropdownOpen(false)}
            >
              <button 
                className={`flex items-center gap-1 text-sm font-semibold transition-colors duration-300 whitespace-nowrap ${aboutButtonClasses()}`}
              >
                {t('About')} <ChevronDown size={14} className={`transition-transform duration-300 ${aboutDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <div className={`absolute top-full left-1/2 -translate-x-1/2 w-64 pt-4 transition-all duration-300 origin-top ${aboutDropdownOpen ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95'}`}>
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-2 overflow-hidden">
                  {aboutSubLinks.map((link) => (
                    <NavLink
                      key={link.name}
                      to={link.path}
                      className={({ isActive }: any) =>
                        `block px-4 py-3 rounded-xl transition-all duration-200 group/item ${
                          isActive ? 'bg-ryze-50' : 'hover:bg-slate-50'
                        }`
                      }
                    >
                      <span className={`block text-sm font-bold text-slate-800 group-hover/item:text-ryze`}>
                        {t(link.name)}
                      </span>
                      {language === 'en' && (
                        <span className="block text-xs text-slate-500 font-normal mt-0.5">
                          {t(link.desc)}
                        </span>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            </div>

            <NavLink to="/meet-the-team" className={({ isActive }: any) => `relative text-sm font-semibold tracking-wide transition-colors duration-300 whitespace-nowrap ${linkClasses(isActive)}`}>{t('Meet Our Team')}</NavLink>
            
            <NavLink to="/ryze-ai" className={({ isActive }: any) => `relative text-sm font-semibold tracking-wide transition-colors duration-300 whitespace-nowrap ${linkClasses(isActive)}`}>
               <span className="flex items-center gap-1.5 whitespace-nowrap">
                 {t('Ryze AI')}
                 <span className={`flex items-center justify-center w-5 h-5 rounded-full ${useWhiteText ? 'bg-white/10 text-ryze' : 'bg-ryze/10 text-ryze'}`}>
                    <Zap size={10} fill="currentColor" />
                 </span>
               </span>
            </NavLink>

            <NavLink to="/learning-style" className={({ isActive }: any) => `relative text-sm font-semibold tracking-wide transition-colors duration-300 whitespace-nowrap ${linkClasses(isActive)}`}>{t('Learning Style')}</NavLink>

            <div className={`h-6 w-px mx-2 ${useWhiteText ? 'bg-white/20' : 'bg-slate-200'}`}></div>

            <button
              onClick={() => navigate('/login')}
              className={loginButtonClasses}
            >
              <LogIn size={16} /> {t('Login')}
            </button>

            <button
              onClick={() => {
                trackPrimaryCtaClick('nav', 'nav_desktop');
                navigate('/hsc-maths-tutoring#book');
              }}
              className={trialButtonClasses}
            >
              {PRIMARY_CTA_LABEL}
            </button>
          </div>

          <div className="md:hidden flex items-center gap-4 z-50">
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              className={`p-2 rounded-full transition-colors ${useWhiteText && !isOpen ? 'text-white hover:bg-white/10' : 'text-slate-900 hover:bg-slate-100'}`}
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className="fixed inset-0 top-0 z-40 bg-white h-screen overflow-y-auto"
          >
            <div className="pt-24 pb-12 px-6 flex flex-col min-h-screen">
              
              <div className="flex-grow space-y-6">
                
                <div className="border-b border-slate-100 pb-4">
                  <button 
                    onClick={() => setMobileAboutOpen(!mobileAboutOpen)}
                    className="w-full flex items-center justify-between text-xl font-bold text-slate-900 py-2"
                  >
                    {t('About')}
                    <ChevronDown size={20} className={`transition-transform duration-300 ${mobileAboutOpen ? 'rotate-180 text-ryze' : 'text-slate-400'}`} />
                  </button>
                  <AnimatePresence>
                    {mobileAboutOpen && (
                      <motion.div 
                        initial="collapsed" animate="open" exit="collapsed" variants={accordionVariants}
                        className="overflow-hidden"
                      >
                        <div className="pl-4 pt-2 space-y-3">
                          {aboutSubLinks.map(link => (
                            <NavLink 
                              key={link.name} 
                              to={link.path} 
                              onClick={() => setIsOpen(false)}
                              className={({isActive}: any) => `block text-base font-medium transition-colors ${isActive ? 'text-ryze' : 'text-slate-500'}`}
                            >
                              {t(link.name)}
                            </NavLink>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <NavLink 
                  to="/meet-the-team" 
                  onClick={() => setIsOpen(false)}
                  className="block text-xl font-bold text-slate-900 border-b border-slate-100 pb-4"
                >
                  {t('Meet Our Team')}
                </NavLink>

                <NavLink 
                  to="/ryze-ai" 
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between text-xl font-bold text-slate-900 border-b border-slate-100 pb-4 group"
                >
                  <span className="flex items-center gap-2">{t('Ryze AI')} <Zap size={18} className="text-ryze" fill="currentColor" /></span>
                  <ChevronRight size={20} className="text-slate-300 group-hover:text-ryze" />
                </NavLink>

                <NavLink 
                  to="/learning-style" 
                  onClick={() => setIsOpen(false)}
                  className="block text-xl font-bold text-slate-900 border-b border-slate-100 pb-4"
                >
                  {t('Learning Style')}
                </NavLink>

              </div>

              <div className="mt-8 space-y-4">
                 <button 
                    onClick={() => { navigate('/login'); setIsOpen(false); }}
                    className="w-full py-4 bg-[#ffb000] text-black rounded-2xl font-bold text-lg shadow-lg hover:bg-[#ffb000]/80 active:scale-95 transition-all flex items-center justify-center gap-2"
                 >
                    <LogIn size={20} /> {t('Dashboard Login')}
                 </button>
                 <button 
                    onClick={() => {
                      trackPrimaryCtaClick('nav', 'nav_mobile');
                      navigate('/hsc-maths-tutoring#book');
                      setIsOpen(false);
                    }}
                    className="w-full py-4 bg-[#ffb000] text-black rounded-2xl font-bold text-lg shadow-lg hover:bg-[#ffb000]/80 active:scale-95 transition-all flex items-center justify-center gap-2"
                 >
                    {PRIMARY_CTA_LABEL} <ArrowRight size={20} />
                 </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
