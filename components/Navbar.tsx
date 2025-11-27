
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate, Link } from 'react-router-dom';
import { Menu, X, ChevronRight, Zap, ChevronDown, ArrowRight, LogIn, ChevronUp, Globe } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const [coursesDropdownOpen, setCoursesDropdownOpen] = useState(false);
  
  // Mobile state management
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  const [mobileCoursesOpen, setMobileCoursesOpen] = useState(false);
  const [mobilePrimaryOpen, setMobilePrimaryOpen] = useState(false);
  const [mobileSecondaryOpen, setMobileSecondaryOpen] = useState(false);
  
  // Generic state for expanding year levels in mobile
  const [openYearLevels, setOpenYearLevels] = useState<Record<string, boolean>>({});

  const location = useLocation();
  const navigate = useNavigate();
  const { language, toggleLanguage, t } = useLanguage();

  const isAiPage = location.pathname === '/ryze-ai';
  const isLoginPage = location.pathname === '/login';

  // Toggle helper for year levels
  const toggleYearLevel = (yearName: string) => {
    setOpenYearLevels(prev => ({ ...prev, [yearName]: !prev[yearName] }));
  };

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
    { name: 'Meet the Team', path: '/meet-the-team', desc: "Expert educators." },
    { name: 'FAQ', path: '/faq', desc: "Common questions." },
  ];

  const primaryCourses = [
    { 
      name: 'Year 3', 
      subLinks: [
        { name: 'Mathematics', path: '/primary/year-3-maths' },
        { name: 'English', path: '/primary/year-3-english' },
      ]
    },
    { 
      name: 'Year 4', 
      subLinks: [
        { name: 'Mathematics', path: '/primary/year-4-maths' },
        { name: 'English', path: '/primary/year-4-english' },
      ]
    },
    { 
      name: 'Year 5', 
      subLinks: [
        { name: 'Mathematics', path: '/primary/year-5-maths' },
        { name: 'English', path: '/primary/year-5-english' },
      ]
    },
    { 
      name: 'Year 6', 
      subLinks: [
        { name: 'Mathematics', path: '/primary/year-6-maths' },
        { name: 'English', path: '/primary/year-6-english' },
      ]
    },
    { name: 'OC Exam Preparation', path: '/primary/oc-preparation', highlight: true },
    { name: 'Selective Exam Preparation', path: '/primary/selective-preparation', highlight: true },
  ];

  const secondaryCourses = [
    { name: 'Year 7 Maths', path: '/secondary/year-7-maths' },
    { name: 'Year 8 Maths', path: '/secondary/year-8-maths' },
    { name: 'Year 9 Maths', path: '/secondary/year-9-maths' },
    { name: 'Year 10 Maths', path: '/secondary/year-10-maths' },
    { 
      name: 'Year 11 Maths', 
      subLinks: [
        { name: 'Advanced', path: '/secondary/year-11-maths-advanced' },
        { name: 'Extension 1', path: '/secondary/year-11-maths-ext1' },
      ]
    },
    { 
      name: 'Year 12 Maths', 
      subLinks: [
        { name: 'Advanced', path: '/secondary/year-12-maths-advanced' },
        { name: 'Extension 1', path: '/secondary/year-12-maths-ext1' },
        { name: 'Extension 2', path: '/secondary/year-12-maths-ext2' },
      ]
    },
  ];

  const navClasses = `fixed w-full z-50 transition-all duration-300 border-b ${
    scrolled || isLoginPage
      ? isAiPage || isLoginPage
        ? 'bg-[#050510]/80 backdrop-blur-xl border-white/10 py-2' 
        : 'bg-white/80 backdrop-blur-xl border-slate-200/50 py-2 shadow-sm'
      : 'bg-transparent border-transparent py-6'
  }`;

  const linkClasses = (isActive: boolean) => `
    relative text-sm font-semibold tracking-wide transition-colors duration-300 whitespace-nowrap
    ${isActive 
      ? 'text-ryze' 
      : isAiPage || isLoginPage ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
    }
  `;

  // Animation variants for accordion
  const accordionVariants: Variants = {
    open: { opacity: 1, height: "auto", transition: { duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] } },
    collapsed: { opacity: 0, height: 0, transition: { duration: 0.2, ease: [0.04, 0.62, 0.23, 0.98] } }
  };

  const menuVariants: Variants = {
    closed: { x: "100%", opacity: 0, transition: { type: "tween", duration: 0.3 } },
    open: { x: 0, opacity: 1, transition: { type: "tween", duration: 0.3 } }
  };

  // Helper for dynamic language colors
  const getLangColorClass = () => {
    if (language === 'en') {
      return isAiPage || isLoginPage ? 'text-blue-400' : 'text-[#002B7F]';
    } else {
      return isAiPage || isLoginPage ? 'text-red-400' : 'text-[#DE2910]';
    }
  };

  return (
    <nav className={navClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          {/* Logo */}
          <div className="flex-shrink-0 cursor-pointer group z-50" onClick={() => { setIsOpen(false); navigate('/'); }}>
            <img 
              src="https://res.cloudinary.com/dsvjhemjd/image/upload/v1764105292/yellow_logo_png_bvs11z.png" 
              alt="Ryze Education" 
              className={`h-10 md:h-16 w-auto transition-all duration-500 ${isAiPage || isLoginPage ? 'brightness-0 invert' : 'group-hover:scale-105'}`}
            />
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-4 lg:gap-8">
            
            {/* About Dropdown */}
            <div 
              className="relative group"
              onMouseEnter={() => setAboutDropdownOpen(true)}
              onMouseLeave={() => setAboutDropdownOpen(false)}
            >
              <button 
                className={`flex items-center gap-1 text-sm font-semibold transition-colors duration-300 whitespace-nowrap ${
                  isAiPage || isLoginPage ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                } ${['/the-ryze-truth', '/meet-the-team', '/faq'].includes(location.pathname) ? 'text-ryze' : ''}`}
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
                      <span className={`block text-sm font-bold ${['/the-ryze-truth', '/meet-the-team', '/faq'].includes(location.pathname) && link.path === location.pathname ? 'text-ryze' : 'text-slate-800 group-hover/item:text-ryze'}`}>
                        {t(link.name)}
                      </span>
                      {language === 'en' && (
                        <span className="block text-xs text-slate-500 font-normal mt-0.5">
                          {link.desc}
                        </span>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            </div>

            <NavLink to="/how-it-works" className={({ isActive }: any) => linkClasses(isActive)}>{t('How It Works')}</NavLink>
            
            <NavLink to="/ryze-ai" className={({ isActive }: any) => linkClasses(isActive)}>
               <span className="flex items-center gap-1.5 whitespace-nowrap">
                 {t('Ryze AI')}
                 <span className={`flex items-center justify-center w-5 h-5 rounded-full ${isAiPage || isLoginPage ? 'bg-white/10 text-ryze' : 'bg-ryze/10 text-ryze'}`}>
                    <Zap size={10} fill="currentColor" />
                 </span>
               </span>
            </NavLink>

            {/* Courses Dropdown */}
            <div 
              className="relative group"
              onMouseEnter={() => setCoursesDropdownOpen(true)}
              onMouseLeave={() => setCoursesDropdownOpen(false)}
            >
              <button 
                className={`flex items-center gap-1 text-sm font-semibold transition-colors duration-300 whitespace-nowrap ${
                  isAiPage || isLoginPage ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                } ${location.pathname.includes('/primary') || location.pathname.includes('/secondary') ? 'text-ryze' : ''}`}
              >
                {t('Courses')} <ChevronDown size={14} className={`transition-transform duration-300 ${coursesDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <div className={`absolute top-full left-1/2 -translate-x-1/2 w-[600px] pt-4 transition-all duration-300 origin-top z-50 ${coursesDropdownOpen ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95'}`}>
                <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 p-6 grid grid-cols-12 gap-4 relative">
                  
                  {/* Primary Column */}
                  <div className="col-span-6 border-r border-slate-100 pr-4">
                     <Link to="/primary" className="flex items-center justify-between group/head mb-3 px-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest group-hover/head:text-ryze transition-colors">{t('Primary')}</h4>
                        <ArrowRight size={12} className="text-slate-300 opacity-0 group-hover/head:opacity-100 group-hover/head:text-ryze transition-all -translate-x-2 group-hover/head:translate-x-0"/>
                     </Link>
                     
                     <div className="space-y-1">
                        {primaryCourses.map((link) => (
                           <div key={link.name}>
                             {link.subLinks ? (
                               <div className="group/item relative flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer">
                                  <span>{t(link.name) || link.name}</span>
                                  <ChevronRight size={14} className="text-slate-400" />
                                  <div className="absolute left-[95%] top-[-10px] w-48 pl-2 opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all duration-200 z-[60]">
                                     <div className="bg-white rounded-xl shadow-xl border border-slate-100 p-2 overflow-hidden">
                                       {link.subLinks.map((sub) => (
                                          <NavLink
                                             key={sub.name}
                                             to={sub.path}
                                             className={({ isActive }: any) =>
                                               `block px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                                                 isActive ? 'bg-ryze-50 text-ryze' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                               }`
                                             }
                                           >
                                             {sub.name}
                                          </NavLink>
                                       ))}
                                     </div>
                                  </div>
                                </div>
                             ) : (
                               <NavLink
                                  to={link.path!}
                                  className={({ isActive }: any) =>
                                    `block px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                                      isActive ? 'bg-ryze-50 text-ryze' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    } ${link.highlight ? 'text-ryze font-bold' : ''}`
                                  }
                                >
                                  {t(link.name) || link.name}
                                </NavLink>
                             )}
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Secondary Column */}
                  <div className="col-span-6 pl-2 relative">
                     <Link to="/secondary" className="flex items-center justify-between group/head mb-3 px-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest group-hover/head:text-ryze transition-colors">{t('Secondary')}</h4>
                        <ArrowRight size={12} className="text-slate-300 opacity-0 group-hover/head:opacity-100 group-hover/head:text-ryze transition-all -translate-x-2 group-hover/head:translate-x-0"/>
                     </Link>

                     <div className="grid grid-cols-1 gap-1">
                        {secondaryCourses.map((link) => (
                           <div key={link.name}>
                             {link.subLinks ? (
                               <div className="group/item relative flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer">
                                  <span>{t(link.name) || link.name}</span>
                                  <ChevronRight size={14} className="text-slate-400" />
                                  <div className="absolute left-[95%] top-[-10px] w-48 pl-2 opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all duration-200 z-[60]">
                                     <div className="bg-white rounded-xl shadow-xl border border-slate-100 p-2 overflow-hidden">
                                       {link.subLinks.map((sub) => (
                                          <NavLink
                                             key={sub.name}
                                             to={sub.path}
                                             className={({ isActive }: any) =>
                                               `block px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                                                 isActive ? 'bg-ryze-50 text-ryze' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                               }`
                                             }
                                           >
                                             {sub.name}
                                          </NavLink>
                                       ))}
                                     </div>
                                  </div>
                                </div>
                             ) : (
                               <NavLink
                                  to={link.path!}
                                  className={({ isActive }: any) =>
                                    `block px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                                      isActive ? 'bg-ryze-50 text-ryze' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`
                                  }
                                >
                                  {t(link.name) || link.name}
                                </NavLink>
                             )}
                           </div>
                        ))}
                     </div>
                  </div>
                </div>
              </div>
            </div>

            <NavLink to="/pricing" className={({ isActive }: any) => linkClasses(isActive)}>{t('Pricing')}</NavLink>

            {/* Language Toggle - Desktop */}
            <button 
              onClick={toggleLanguage}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 border ${
                isAiPage || isLoginPage 
                  ? 'bg-white/10 border-white/20 hover:bg-white/20' 
                  : 'bg-slate-100 border-slate-200 hover:bg-slate-200'
              }`}
              title={language === 'en' ? "Switch to Chinese" : "Switch to English"}
            >
              <Globe 
                size={18} 
                className={`transition-colors duration-300 ${getLangColorClass()}`}
              />
              <span className={`text-xs font-bold w-4 transition-colors duration-300 ${getLangColorClass()}`}>
                {language === 'en' ? 'EN' : 'CN'}
              </span>
            </button>

            <div className={`h-6 w-px mx-2 ${isAiPage || isLoginPage ? 'bg-white/20' : 'bg-slate-200'}`}></div>

            <button
              onClick={() => navigate('/login')}
              className={`h-11 w-[130px] rounded-full border text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap ${
                isAiPage || isLoginPage
                ? 'text-white border-white/30 hover:bg-white hover:text-[#050510]'
                : 'text-slate-700 border-slate-200 hover:border-slate-900 hover:text-slate-900'
              }`}
            >
              <LogIn size={16} /> {t('Login')}
            </button>

            <button
              onClick={() => navigate('/contact')}
              className={`h-11 w-[130px] ml-2 rounded-full text-sm font-bold transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 active:translate-y-0 flex items-center justify-center whitespace-nowrap ${
                isAiPage || isLoginPage
                ? 'bg-[#FFB000] text-[#050510] hover:bg-white shadow-[0_0_20px_rgba(255,176,0,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.4)]' 
                : 'bg-slate-900 text-white hover:bg-ryze hover:text-white shadow-lg hover:shadow-ryze/40'
              }`}
            >
              {t('Book a Trial')}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4 z-50">
            {/* Mobile Language Toggle */}
            <button 
              onClick={toggleLanguage}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-full border transition-all ${
                 isAiPage || isLoginPage 
                  ? 'bg-white/10 border-white/20' 
                  : 'bg-slate-100 border-slate-200'
              }`}
            >
              <Globe 
                size={20} 
                className={`transition-colors duration-300 ${getLangColorClass()}`}
              />
              <span className={`text-xs font-bold transition-colors duration-300 ${getLangColorClass()}`}>
                {language === 'en' ? 'EN' : 'CN'}
              </span>
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 rounded-full transition-colors ${isOpen || isAiPage || isLoginPage ? 'text-white hover:bg-white/10' : 'text-slate-900 hover:bg-slate-100'} ${isOpen ? '!text-slate-900 hover:!bg-slate-100' : ''}`}
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
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
                
                {/* 1. About Accordion */}
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

                {/* 2. Direct Links */}
                <NavLink 
                  to="/how-it-works" 
                  onClick={() => setIsOpen(false)}
                  className="block text-xl font-bold text-slate-900 border-b border-slate-100 pb-4"
                >
                  {t('How It Works')}
                </NavLink>

                <NavLink 
                  to="/ryze-ai" 
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between text-xl font-bold text-slate-900 border-b border-slate-100 pb-4 group"
                >
                  <span className="flex items-center gap-2">{t('Ryze AI')} <Zap size={18} className="text-ryze" fill="currentColor" /></span>
                  <ChevronRight size={20} className="text-slate-300 group-hover:text-ryze" />
                </NavLink>

                {/* 3. Courses Accordion (Deep Nesting) */}
                <div className="border-b border-slate-100 pb-4">
                  <button 
                    onClick={() => setMobileCoursesOpen(!mobileCoursesOpen)}
                    className="w-full flex items-center justify-between text-xl font-bold text-slate-900 py-2"
                  >
                    {t('Courses')}
                    <ChevronDown size={20} className={`transition-transform duration-300 ${mobileCoursesOpen ? 'rotate-180 text-ryze' : 'text-slate-400'}`} />
                  </button>
                  <AnimatePresence>
                    {mobileCoursesOpen && (
                      <motion.div initial="collapsed" animate="open" exit="collapsed" variants={accordionVariants} className="overflow-hidden">
                        <div className="pl-4 pt-2 space-y-4">
                          
                          {/* Primary Sub-Accordion */}
                          <div>
                            <button 
                              onClick={() => setMobilePrimaryOpen(!mobilePrimaryOpen)}
                              className="w-full flex items-center justify-between text-lg font-bold text-slate-700 py-2"
                            >
                              {t('Primary')}
                              <div className={`transition-transform duration-300 ${mobilePrimaryOpen ? 'rotate-180' : ''}`}>
                                 {mobilePrimaryOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                              </div>
                            </button>
                            <AnimatePresence>
                              {mobilePrimaryOpen && (
                                <motion.div initial="collapsed" animate="open" exit="collapsed" variants={accordionVariants} className="overflow-hidden">
                                  <div className="pl-4 pt-1 space-y-3 border-l-2 border-slate-100 ml-1">
                                    <div className="mb-2">
                                       <NavLink to="/primary" onClick={() => setIsOpen(false)} className="text-sm font-bold text-ryze uppercase tracking-wide flex items-center gap-1">{t('View Overview')} <ArrowRight size={12}/></NavLink>
                                    </div>
                                    {primaryCourses.map((course) => (
                                       <div key={course.name}>
                                          {course.subLinks ? (
                                             <div>
                                                <button 
                                                   onClick={() => toggleYearLevel(course.name)}
                                                   className="w-full flex items-center justify-between text-base font-medium text-slate-600 py-1"
                                                >
                                                   {t(course.name) || course.name}
                                                   <ChevronDown size={14} className={`text-slate-400 transition-transform ${openYearLevels[course.name] ? 'rotate-180' : ''}`} />
                                                </button>
                                                <AnimatePresence>
                                                   {openYearLevels[course.name] && (
                                                      <motion.div initial="collapsed" animate="open" exit="collapsed" variants={accordionVariants} className="overflow-hidden">
                                                         <div className="pl-4 space-y-2 py-2">
                                                            {course.subLinks.map(sub => (
                                                               <NavLink key={sub.name} to={sub.path} onClick={() => setIsOpen(false)} className={({isActive}: any) => `block text-sm font-medium ${isActive ? 'text-ryze' : 'text-slate-500'}`}>{sub.name}</NavLink>
                                                            ))}
                                                         </div>
                                                      </motion.div>
                                                   )}
                                                </AnimatePresence>
                                             </div>
                                          ) : (
                                             <NavLink to={course.path!} onClick={() => setIsOpen(false)} className={({isActive}: any) => `block text-base font-medium py-1 ${isActive ? 'text-ryze' : 'text-slate-600'}`}>{t(course.name) || course.name}</NavLink>
                                          )}
                                       </div>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          {/* Secondary Sub-Accordion */}
                          <div>
                            <button 
                              onClick={() => setMobileSecondaryOpen(!mobileSecondaryOpen)}
                              className="w-full flex items-center justify-between text-lg font-bold text-slate-700 py-2"
                            >
                              {t('Secondary')}
                              <div className={`transition-transform duration-300 ${mobileSecondaryOpen ? 'rotate-180' : ''}`}>
                                 {mobileSecondaryOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                              </div>
                            </button>
                            <AnimatePresence>
                              {mobileSecondaryOpen && (
                                <motion.div initial="collapsed" animate="open" exit="collapsed" variants={accordionVariants} className="overflow-hidden">
                                  <div className="pl-4 pt-1 space-y-3 border-l-2 border-slate-100 ml-1">
                                    <div className="mb-2">
                                       <NavLink to="/secondary" onClick={() => setIsOpen(false)} className="text-sm font-bold text-ryze uppercase tracking-wide flex items-center gap-1">{t('View Overview')} <ArrowRight size={12}/></NavLink>
                                    </div>
                                    {secondaryCourses.map((course) => (
                                       <div key={course.name}>
                                          {course.subLinks ? (
                                             <div>
                                                <button 
                                                   onClick={() => toggleYearLevel(course.name)}
                                                   className="w-full flex items-center justify-between text-base font-medium text-slate-600 py-1"
                                                >
                                                   {t(course.name) || course.name}
                                                   <ChevronDown size={14} className={`text-slate-400 transition-transform ${openYearLevels[course.name] ? 'rotate-180' : ''}`} />
                                                </button>
                                                <AnimatePresence>
                                                   {openYearLevels[course.name] && (
                                                      <motion.div initial="collapsed" animate="open" exit="collapsed" variants={accordionVariants} className="overflow-hidden">
                                                         <div className="pl-4 space-y-2 py-2">
                                                            {course.subLinks.map(sub => (
                                                               <NavLink key={sub.name} to={sub.path} onClick={() => setIsOpen(false)} className={({isActive}: any) => `block text-sm font-medium ${isActive ? 'text-ryze' : 'text-slate-500'}`}>{sub.name}</NavLink>
                                                            ))}
                                                         </div>
                                                      </motion.div>
                                                   )}
                                                </AnimatePresence>
                                             </div>
                                          ) : (
                                             <NavLink to={course.path!} onClick={() => setIsOpen(false)} className={({isActive}: any) => `block text-base font-medium py-1 ${isActive ? 'text-ryze' : 'text-slate-600'}`}>{t(course.name) || course.name}</NavLink>
                                          )}
                                       </div>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <NavLink 
                  to="/pricing" 
                  onClick={() => setIsOpen(false)}
                  className="block text-xl font-bold text-slate-900 border-b border-slate-100 pb-4"
                >
                  {t('Pricing')}
                </NavLink>

              </div>

              {/* Bottom Actions */}
              <div className="mt-8 space-y-4">
                 <button 
                    onClick={() => { navigate('/login'); setIsOpen(false); }}
                    className="w-full py-3.5 border-2 border-slate-200 rounded-2xl text-slate-700 font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
                 >
                    <LogIn size={20} /> {t('Dashboard Login')}
                 </button>
                 <button 
                    onClick={() => { navigate('/contact'); setIsOpen(false); }}
                    className="w-full py-4 bg-ryze text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-ryze-600 active:scale-95 transition-all flex items-center justify-center gap-2"
                 >
                    {t('Book a Trial Lesson')} <ArrowRight size={20} />
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
