import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronRight, Zap, ChevronDown, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { trackPrimaryCtaClick } from '../src/analytics';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);

  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);

  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const brandLogoUrl = 'https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto:good,c_limit,w_320,dpr_auto/v1764105292/yellow_logo_png_bvs11z.png';
  const bookConsultationLabel = 'Book Consultation';
  const darkTopBlendRoutes = ['/', '/ryze-ai', '/contact', '/learning-style'];

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
      setIsScrolled(window.scrollY > 16);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const aboutSubLinks = [
    { name: 'The Ryze Truth', path: '/the-ryze-truth', desc: 'Our philosophy and story.' },
    { name: 'How Ryze Works', path: '/how-ryze-works', desc: 'Our process explained.' },
  ];

  // --- DYNAMIC STYLING ---

  // Double transition: blend at top, become solid after scroll or when menu opens.
  const navClasses = `fixed top-3 left-0 w-full z-50 px-3 sm:px-4 transition-all duration-300 border-b ${
    isScrolled || isOpen
      ? 'bg-white/95 backdrop-blur-md border-[#E4E8EE] py-2.5 rounded-2xl shadow-[0_8px_24px_-18px_rgba(15,23,42,0.35)]'
      : 'bg-transparent border-transparent py-3 rounded-2xl'
  }`;
  const isSolidNav = isScrolled || isOpen;
  const useLightTopText = !isSolidNav && darkTopBlendRoutes.includes(pathname);
  const logoClasses = `h-10 md:h-16 w-auto transition duration-200 group-hover:scale-105 ${
    useLightTopText ? 'brightness-0 invert drop-shadow-[0_1px_0_rgba(0,0,0,0.2)]' : 'drop-shadow-[0_1px_0_rgba(0,0,0,0.12)] contrast-110'
  }`;
  const zapBadgeClass = `flex items-center justify-center w-5 h-5 rounded-full ${
    isSolidNav
      ? 'bg-ryze-brand/10 text-ryze-brand'
      : useLightTopText
        ? 'bg-white/15 text-ryze-brand border border-white/30'
        : 'bg-ryze-brand/15 text-ryze-brand border border-[#FFB000]/25'
  }`;

  const linkClasses = (isActive: boolean) => {
    if (isActive) {
      return 'text-[#B87400]';
    }
    return useLightTopText ? 'text-white hover:text-[#FFD580]' : 'text-[#1B2430] hover:text-[#B87400]';
  };

  const aboutButtonClasses = () => {
    const isActive = ['/the-ryze-truth', '/how-ryze-works'].includes(pathname);
    if (isActive) return 'text-[#B87400]';
    return useLightTopText ? 'text-white hover:text-[#FFD580]' : 'text-[#1B2430] hover:text-[#B87400]';
  };

  const navDividerClasses = `h-6 w-px mx-3 ${isSolidNav ? 'bg-[#D7DDE4]' : useLightTopText ? 'bg-white/30' : 'bg-[#C5CED8]'}`;

  const ctaStateClasses = isSolidNav
    ? 'bg-transparent text-[#B87400] border-[3px] border-[#FFB000]/70 backdrop-blur-[6px] shadow-[0_8px_22px_-16px_rgba(15,23,42,0.35)] hover:bg-[#FFB000]/10 hover:shadow-[0_12px_26px_-16px_rgba(15,23,42,0.38)] focus-visible:ring-offset-white'
    : 'bg-white/10 text-white border-[3px] border-white/75 backdrop-blur-[8px] shadow-[0_10px_24px_-16px_rgba(15,23,42,0.45)] hover:bg-white/16 hover:shadow-[0_14px_30px_-16px_rgba(15,23,42,0.52)] focus-visible:ring-offset-transparent';

  const ctaBaseClasses = `group h-10 px-5 rounded-xl text-sm font-semibold tracking-[0.02em] inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all duration-200 hover:-translate-y-px active:translate-y-0 active:shadow-[0_6px_16px_-12px_rgba(15,23,42,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(255,176,0,0.5)] focus-visible:ring-offset-2 ${ctaStateClasses}`;

  const desktopCtaButtonClasses = `${ctaBaseClasses} shrink-0`;
  const mobileCtaButtonClasses = `${ctaBaseClasses} w-full`;

  const mobileMenuToggleClasses = `p-2 rounded-full transition-colors text-ryze-ink2 ${
    isSolidNav
      ? 'hover:bg-ryze-surface2'
      : useLightTopText
        ? 'text-white hover:bg-white/10'
        : 'hover:bg-black/5'
  }`;

  // --- ANIMATION VARIANTS ---
  const accordionVariants: Variants = {
    open: { opacity: 1, height: 'auto', transition: { duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] } },
    collapsed: { opacity: 0, height: 0, transition: { duration: 0.2, ease: [0.04, 0.62, 0.23, 0.98] } },
  };

  const menuVariants: Variants = {
    closed: { x: '100%', opacity: 0, transition: { type: 'tween', duration: 0.3 } },
    open: { x: 0, opacity: 1, transition: { type: 'tween', duration: 0.3 } },
  };

  return (
    <nav className={navClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-6">
        <div className="flex justify-between items-center">
          <div className="flex-shrink-0 cursor-pointer group z-50" onClick={() => { setIsOpen(false); navigate('/'); }}>
            <img
              src={brandLogoUrl}
              alt="Ryze Education"
              width={250}
              height={64}
              className={logoClasses}
            />
          </div>

          <div className="hidden md:flex items-center gap-5 lg:gap-9">
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

              <div className={`absolute top-full left-1/2 -translate-x-1/2 w-64 pt-4 transition-[opacity,transform] duration-200 origin-top ${aboutDropdownOpen ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95'}`}>
                <div className="bg-white rounded-xl2 shadow-card border border-ryze-line p-2 overflow-hidden">
                  {aboutSubLinks.map((link) => (
                    <NavLink
                      key={link.name}
                      to={link.path}
                      className={({ isActive }: any) =>
                        `block px-4 py-3 rounded-xl transition-colors duration-200 group/item ${
                          isActive ? 'bg-ryze-brandSoft' : 'hover:bg-ryze-surface2'
                        }`
                      }
                    >
                      <span className="block text-sm font-bold text-ryze-ink2 group-hover/item:text-ryze-brand">
                        {t(link.name)}
                      </span>
                      {language === 'en' && (
                        <span className="block text-xs text-ryze-ink2/70 font-normal mt-0.5">
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
                <span className={zapBadgeClass}>
                  <Zap size={10} fill="currentColor" />
                </span>
              </span>
            </NavLink>

            <NavLink to="/learning-style" className={({ isActive }: any) => `relative text-sm font-semibold tracking-wide transition-colors duration-300 whitespace-nowrap ${linkClasses(isActive)}`}>{t('Learning Style')}</NavLink>

            <NavLink to="/contact" className={({ isActive }: any) => `relative text-sm font-semibold tracking-wide transition-colors duration-300 whitespace-nowrap ${linkClasses(isActive)}`}>{t('Contact')}</NavLink>
            
            <div className={navDividerClasses} aria-hidden="true"></div>

            <button
              onClick={() => {
                trackPrimaryCtaClick('nav', 'nav_desktop');
                navigate('/contact');
              }}
              className={desktopCtaButtonClasses}
            >
              <span>{bookConsultationLabel}</span>
              <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-px" />
            </button>
          </div>

          <div className="md:hidden flex items-center gap-4 z-50">
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              className={mobileMenuToggleClasses}
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
                <div className="border-b border-ryze-line pb-4">
                  <button
                    onClick={() => setMobileAboutOpen(!mobileAboutOpen)}
                    className="w-full flex items-center justify-between text-xl font-bold text-ryze-ink2 py-2"
                  >
                    {t('About')}
                    <ChevronDown size={20} className={`transition-transform duration-300 ${mobileAboutOpen ? 'rotate-180 text-ryze-brand' : 'text-ryze-ink2/40'}`} />
                  </button>
                  <AnimatePresence>
                    {mobileAboutOpen && (
                      <motion.div
                        initial="collapsed" animate="open" exit="collapsed" variants={accordionVariants}
                        className="overflow-hidden"
                      >
                        <div className="pl-4 pt-2 space-y-3">
                          {aboutSubLinks.map((link) => (
                            <NavLink
                              key={link.name}
                              to={link.path}
                              onClick={() => setIsOpen(false)}
                              className={({ isActive }: any) => `block text-base font-medium transition-colors ${isActive ? 'text-ryze-brand' : 'text-ryze-ink2/70'}`}
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
                  className="block text-xl font-bold text-ryze-ink2 border-b border-ryze-line pb-4"
                >
                  {t('Meet Our Team')}
                </NavLink>

                <NavLink
                  to="/ryze-ai"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between text-xl font-bold text-ryze-ink2 border-b border-ryze-line pb-4 group"
                >
                  <span className="flex items-center gap-2">{t('Ryze AI')} <Zap size={18} className="text-ryze-brand" fill="currentColor" /></span>
                  <ChevronRight size={20} className="text-ryze-ink2/40 group-hover:text-ryze-brand" />
                </NavLink>

                <NavLink
                  to="/learning-style"
                  onClick={() => setIsOpen(false)}
                  className="block text-xl font-bold text-ryze-ink2 border-b border-ryze-line pb-4"
                >
                  {t('Learning Style')}
                </NavLink>

                <NavLink
                  to="/contact"
                  onClick={() => setIsOpen(false)}
                  className="block text-xl font-bold text-ryze-ink2 border-b border-ryze-line pb-4"
                >
                  {t('Contact')}
                </NavLink>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => {
                    trackPrimaryCtaClick('nav', 'nav_mobile');
                    navigate('/contact');
                    setIsOpen(false);
                  }}
                  className={mobileCtaButtonClasses}
                >
                  <span>{bookConsultationLabel}</span>
                  <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-px" />
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

