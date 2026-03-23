import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, Menu, X, Zap } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import PrimaryCTA from './PrimaryCTA';
import { trackPrimaryCtaClick } from '../src/analytics';
import { ROUTES } from '../src/constants/routes';

const DARK_TOP_NAV_ROUTES = new Set<string>([
  ROUTES.HOME,
  ROUTES.HSC_MATHS_PROGRAM,
  ROUTES.SELECTIVE_OC_PROGRAM,
  ROUTES.ACCELERATED_MATHS_PROGRAM,
  ROUTES.PRIMARY_MATHS_PROGRAM,
  ROUTES.JUNIOR_FOUNDATIONS_PROGRAM,
  ROUTES.MATHS_TUTORING,
  ROUTES.RYZE_AI,
  ROUTES.CONTACT,
]);

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const [programsDropdownOpen, setProgramsDropdownOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  const [mobileProgramsOpen, setMobileProgramsOpen] = useState(false);

  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const normalizedPathname = pathname.replace(/\/+$/, '') || ROUTES.HOME;
  const brandLogoUrl =
    'https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto:good,c_limit,w_320/v1764105292/yellow_logo_png_bvs11z.png';
  const bookConsultationLabel = 'Book Consultation';
  const enrolNowLabel = 'Enrol Now';
  const aboutSubLinks = [
    { name: 'The Ryze Truth', path: '/the-ryze-truth', desc: 'Our philosophy and story.' },
    { name: 'How Ryze Works', path: ROUTES.HOW_IT_WORKS, desc: 'Our process explained.' },
  ];
  const programSubLinks = [
    { name: 'HSC | Year 11 and 12', path: ROUTES.HSC_MATHS_PROGRAM, desc: 'Senior maths for Year 11 and 12 students in Advanced and Extension pathways.' },
    { name: 'Accelerated Pathways', path: ROUTES.ACCELERATED_MATHS_PROGRAM, desc: 'For ambitious students ready for a faster and more advanced mathematical pace.' },
    { name: 'Junior Foundations | Year 7 -10', path: ROUTES.JUNIOR_FOUNDATIONS_PROGRAM, desc: 'Year 7-10 support aligned with the NSW curriculum.' },
    { name: 'OC & Selective Exam Preparation', path: ROUTES.SELECTIVE_OC_PROGRAM, desc: 'OC and selective preparation with stronger reasoning.' },
    { name: 'Primary | Year 3 - 6', path: ROUTES.PRIMARY_MATHS_PROGRAM, desc: 'Years 3-6 building confidence and fluency early.' },
  ];

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isOpen) setIsOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  useEffect(() => {
    const readScrollTop = () => {
      const documentTop =
        window.scrollY ||
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        document.scrollingElement?.scrollTop ||
        0;
      const shellTop = Array.from(
        document.querySelectorAll<HTMLElement>('.ryze-marketing-shell, .ryze-page-shell--hero-bleed, .ryze-main-with-sticky'),
      ).reduce((highestTop, element) => Math.max(highestTop, element.scrollTop), 0);

      return Math.max(documentTop, shellTop);
    };

    const updateScrolledState = () => setIsScrolled(readScrollTop() > 12);
    const scrollTargets: Array<Window | Document | HTMLElement> = [window, document];

    document
      .querySelectorAll<HTMLElement>('.ryze-marketing-shell, .ryze-page-shell--hero-bleed, .ryze-main-with-sticky')
      .forEach((element) => {
        const { overflowY } = window.getComputedStyle(element);
        const isScrollable = /(auto|scroll|overlay)/.test(overflowY) && element.scrollHeight > element.clientHeight;

        if (isScrollable) {
          scrollTargets.push(element);
        }
      });

    updateScrolledState();
    scrollTargets.forEach((target) => target.addEventListener('scroll', updateScrolledState, { passive: true }));

    return () => {
      scrollTargets.forEach((target) => target.removeEventListener('scroll', updateScrolledState));
    };
  }, [pathname]);

  const isSolidNav = isScrolled || isOpen;
  const useInverseRestState = !isSolidNav && DARK_TOP_NAV_ROUTES.has(normalizedPathname);
  const useLightTopText = useInverseRestState;
  const navClasses = 'fixed top-0 left-0 z-[70] w-full px-3 sm:px-4 pt-[max(env(safe-area-inset-top),0.35rem)]';
  const navShellClasses = 'relative rounded-[1.2rem] px-4 py-1.5 sm:px-5 sm:py-2 lg:px-6';
  const navSurfaceClasses = `pointer-events-none absolute inset-0 overflow-hidden rounded-[1.2rem] border transition-[background,border-color,box-shadow,transform] duration-500 ease-out ${
    isSolidNav
      ? 'rounded-[1.2rem] border-[rgba(255,255,255,0.82)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(250,247,243,0.94)_100%)] shadow-[0_18px_42px_-30px_rgba(17,21,29,0.18)] backdrop-blur-xl'
      : useInverseRestState
        ? 'rounded-[1.2rem] border-white/18 bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.04)_100%)] shadow-[0_16px_36px_-28px_rgba(0,0,0,0.34)] backdrop-blur-[14px]'
        : 'rounded-[1.2rem] border-[rgba(23,29,40,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.82)_0%,rgba(248,243,234,0.72)_100%)] shadow-[0_16px_36px_-30px_rgba(17,21,29,0.14)] backdrop-blur-[18px]'
  }`;
  const navHighlightClasses = `pointer-events-none absolute inset-[1px] rounded-[calc(1.2rem-1px)] transition-opacity duration-500 ${
    isSolidNav
      ? 'bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.44),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.36)_0%,rgba(255,255,255,0.08)_42%,rgba(255,255,255,0)_78%)] opacity-100'
      : useInverseRestState
        ? 'bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0.04)_40%,rgba(255,255,255,0)_78%)] opacity-100'
        : 'bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.58),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.46)_0%,rgba(255,255,255,0.16)_44%,rgba(255,255,255,0)_78%)] opacity-100'
  }`;
  const logoClasses = `relative top-[2px] h-7 w-auto transition duration-200 group-hover:opacity-90 md:top-[3px] md:h-10 ${
    useLightTopText ? 'brightness-0 invert' : ''
  }`;
  const textClass = useLightTopText ? 'text-white' : 'text-[#171d28]';
  const activeTextClass = 'text-[#8f6517]';
  const linkClass = (isActive: boolean) =>
    `${isActive ? activeTextClass : `${textClass} hover:text-[#b87400]`} text-[0.95rem] font-semibold tracking-[-0.01em] transition-colors duration-300`;
  const dropdownWrapperClass = (isOpenState: boolean, widthClass: string) =>
    `absolute top-full left-1/2 z-[90] ${widthClass} -translate-x-1/2 pt-5 transition-[opacity,transform] duration-200 ${
      isOpenState ? 'visible scale-100 opacity-100' : 'invisible scale-95 opacity-0'
    }`;
  const dropdownPanelClass =
    'overflow-hidden rounded-[1.2rem] border border-[rgba(255,255,255,0.72)] bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(248,245,240,0.88)_100%)] p-2 shadow-[0_26px_60px_-36px_rgba(17,21,29,0.24)] backdrop-blur-2xl';

  const aboutButtonClass = () => {
    const isActive = ['/the-ryze-truth', ROUTES.HOW_IT_WORKS].includes(normalizedPathname);
    return isActive ? activeTextClass : `${textClass} hover:text-[#b87400]`;
  };

  const programsButtonClass = () => {
    const isActive = programSubLinks.some((item) => item.path === normalizedPathname);
    return isActive ? activeTextClass : `${textClass} hover:text-[#b87400]`;
  };

  const navDividerClass = `mx-3 h-6 w-px ${
    isSolidNav ? 'bg-[rgba(23,29,40,0.12)]' : useInverseRestState ? 'bg-white/18' : 'bg-[rgba(23,29,40,0.12)]'
  }`;
  const desktopCtaClass = isSolidNav
    ? '!min-h-[2.1rem] !rounded-full !border !border-[#171d28]/8 !bg-[#171d28] !px-4 !py-1.5 !text-sm !font-semibold !tracking-[0.01em] !text-[#f8f3ea] !shadow-[0_14px_28px_-20px_rgba(17,21,29,0.36)] hover:!bg-[#11151d]'
    : useInverseRestState
      ? '!min-h-[2.1rem] !rounded-full !border !border-white/24 !bg-[linear-gradient(180deg,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0.06)_100%)] !px-4 !py-1.5 !text-sm !font-semibold !tracking-[0.01em] !text-white !shadow-[0_10px_22px_-18px_rgba(0,0,0,0.34)] !backdrop-blur-xl hover:!bg-[linear-gradient(180deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.1)_100%)]'
      : '!min-h-[2.1rem] !rounded-full !border !border-[#171d28]/10 !bg-[rgba(23,29,40,0.92)] !px-4 !py-1.5 !text-sm !font-semibold !tracking-[0.01em] !text-[#f8f3ea] !shadow-[0_14px_28px_-22px_rgba(17,21,29,0.22)] hover:!bg-[#11151d]';
  const mobileInlineCtaClass = `inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm font-semibold tracking-[0.02em] transition-all duration-200 ${
    isSolidNav
      ? 'border-[#171d28]/8 bg-[#171d28] text-[#f8f3ea] shadow-[0_14px_26px_-18px_rgba(17,21,29,0.34)] hover:bg-[#11151d]'
      : 'border-white/24 bg-[linear-gradient(180deg,rgba(255,255,255,0.16)_0%,rgba(255,255,255,0.08)_100%)] text-white shadow-[0_12px_22px_-18px_rgba(0,0,0,0.3)] backdrop-blur-xl hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0.1)_100%)]'
  }`;
  const mobileMenuToggleClass = `rounded-full border p-2 transition-all duration-300 ${
    isSolidNav
      ? 'border-[#171d28]/8 bg-white/72 text-[#171d28] shadow-[0_10px_22px_-18px_rgba(17,21,29,0.2)] hover:bg-white/88'
      : useInverseRestState
        ? 'border-white/24 bg-[linear-gradient(180deg,rgba(255,255,255,0.16)_0%,rgba(255,255,255,0.08)_100%)] text-white shadow-[0_10px_22px_-18px_rgba(0,0,0,0.28)] backdrop-blur-xl hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0.1)_100%)]'
        : 'border-[#171d28]/10 bg-white/72 text-[#171d28] shadow-[0_10px_22px_-18px_rgba(17,21,29,0.16)] backdrop-blur-xl hover:bg-white/88'
  }`;

  const handleContactNavigate = (placement: string) => {
    trackPrimaryCtaClick('nav', placement);
    navigate(ROUTES.CONTACT);
  };

  return (
    <nav className={navClasses}>
      <div className="relative mx-auto max-w-7xl">
        <div className={navShellClasses}>
          <div aria-hidden="true" className={navSurfaceClasses}>
            <div className={navHighlightClasses} />
          </div>
          <div className="relative z-10 flex items-center justify-between">
            <button
              type="button"
              className="group z-50 flex-shrink-0 cursor-pointer"
              onClick={() => {
                setIsOpen(false);
                navigate(ROUTES.HOME);
              }}
            >
              <img
                src={brandLogoUrl}
                alt="Ryze Education"
                width={250}
                height={64}
                className={logoClasses}
              />
            </button>

            <div className="hidden items-center gap-5 md:flex lg:gap-9">
              <div className="relative" onMouseEnter={() => setAboutDropdownOpen(true)} onMouseLeave={() => setAboutDropdownOpen(false)}>
                <button className={`flex items-center gap-1 text-[0.95rem] font-semibold tracking-[-0.01em] transition-colors duration-300 ${aboutButtonClass()}`}>
                  {t('About')}
                  <ChevronDown size={14} className={`transition-transform duration-300 ${aboutDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                <div className={dropdownWrapperClass(aboutDropdownOpen, 'w-64')}>
                  <div className={dropdownPanelClass}>
                    {aboutSubLinks.map((link) => (
                      <NavLink
                        key={link.name}
                        to={link.path}
                        className={({ isActive }: any) =>
                          `block rounded-[1rem] px-4 py-3 transition-colors duration-200 ${isActive ? 'bg-[rgba(184,132,30,0.12)]' : 'hover:bg-[rgba(23,29,40,0.04)]'}`
                        }
                      >
                        <span className="block text-[0.95rem] font-bold ryze-text-primary">{t(link.name)}</span>
                        {language === 'en' && <span className="mt-0.5 block text-[0.82rem] ryze-text-secondary">{t(link.desc)}</span>}
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative" onMouseEnter={() => setProgramsDropdownOpen(true)} onMouseLeave={() => setProgramsDropdownOpen(false)}>
                <button className={`flex items-center gap-1 text-[0.95rem] font-semibold tracking-[-0.01em] transition-colors duration-300 ${programsButtonClass()}`}>
                  {t('Programs')}
                  <ChevronDown size={14} className={`transition-transform duration-300 ${programsDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                <div className={dropdownWrapperClass(programsDropdownOpen, 'w-[23rem]')}>
                  <div className={dropdownPanelClass}>
                    {programSubLinks.map((link) => (
                      <NavLink
                        key={link.name}
                        to={link.path}
                        className={({ isActive }: any) =>
                          `block rounded-[1rem] px-4 py-3 transition-colors duration-200 ${isActive ? 'bg-[rgba(184,132,30,0.12)]' : 'hover:bg-[rgba(23,29,40,0.04)]'}`
                        }
                      >
                        <span className="block text-[0.95rem] font-bold ryze-text-primary">{t(link.name)}</span>
                        {language === 'en' && <span className="mt-0.5 block text-[0.82rem] ryze-text-secondary">{t(link.desc)}</span>}
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>

              <NavLink to="/meet-the-team" className={({ isActive }: any) => linkClass(isActive)}>
                {t('Meet Our Team')}
              </NavLink>
              <NavLink to="/ryze-ai" className={({ isActive }: any) => linkClass(isActive)}>
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  {t('Ryze AI')}
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full ${
                      isSolidNav
                        ? 'bg-[rgba(143,101,23,0.12)] text-[var(--accent)]'
                        : useInverseRestState
                          ? 'border border-white/20 bg-white/10 text-white/80'
                          : 'border border-[#171d28]/10 bg-[#171d28]/6 text-[#171d28]/72'
                    }`}
                  >
                  <Zap size={10} fill="currentColor" />
                  </span>
                </span>
              </NavLink>
              <NavLink to="/learning-style" className={({ isActive }: any) => linkClass(isActive)}>
                {t('Learning Style')}
              </NavLink>
              <div className={navDividerClass} aria-hidden="true" />
              <PrimaryCTA
                page="nav"
                placement="nav_desktop"
                styleVariant="ghost"
                size="sm"
                className={desktopCtaClass}
                label={bookConsultationLabel}
              />
            </div>

            <div className="absolute top-1/2 right-0 z-50 flex -translate-y-1/2 items-center gap-2 md:hidden">
              {isScrolled && !isOpen && (
                <button
                  type="button"
                  onClick={() => handleContactNavigate('nav_mobile_scroll_inline')}
                  className={mobileInlineCtaClass}
                  aria-label="Enrol Now"
                >
                  <span>{enrolNowLabel}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? 'Close menu' : 'Open menu'}
                className={`${mobileMenuToggleClass} ${isOpen ? 'bg-white/90' : ''}`}
              >
                {isOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 top-0 z-40 h-screen overflow-y-auto ryze-bg-primary transition-transform duration-300 ease-out">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
            className="absolute top-[calc(env(safe-area-inset-top)+1.15rem)] right-6 z-50 rounded-full border border-white/10 bg-[rgba(23,29,40,0.72)] p-2 text-white shadow-[0_20px_40px_-24px_rgba(0,0,0,0.7)] backdrop-blur-md md:hidden"
          >
            <X size={22} />
          </button>
          <div className="flex min-h-screen flex-col px-6 pt-24 pb-[calc(env(safe-area-inset-bottom)+3rem)]">
            <div className="flex-grow space-y-6">
              <div className="border-b ryze-border-subtle pb-4">
                <button
                  onClick={() => setMobileAboutOpen(!mobileAboutOpen)}
                  className="flex w-full items-center justify-between py-2 text-xl font-semibold ryze-text-primary"
                >
                  {t('About')}
                  <ChevronDown size={20} className={`transition-transform duration-300 ${mobileAboutOpen ? 'rotate-180 text-[var(--accent)]' : 'ryze-text-secondary'}`} />
                </button>
                {mobileAboutOpen && (
                  <div className="overflow-hidden">
                    <div className="space-y-3 pl-4 pt-2">
                      {aboutSubLinks.map((link) => (
                        <NavLink
                          key={link.name}
                          to={link.path}
                          onClick={() => setIsOpen(false)}
                          className={({ isActive }: any) => `block text-base font-medium transition-colors ${isActive ? 'text-[var(--accent)]' : 'ryze-text-secondary'}`}
                        >
                          {t(link.name)}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="border-b ryze-border-subtle pb-4">
                <button
                  onClick={() => setMobileProgramsOpen(!mobileProgramsOpen)}
                  className="flex w-full items-center justify-between py-2 text-xl font-semibold ryze-text-primary"
                >
                  {t('Programs')}
                  <ChevronDown size={20} className={`transition-transform duration-300 ${mobileProgramsOpen ? 'rotate-180 text-[var(--accent)]' : 'ryze-text-secondary'}`} />
                </button>
                {mobileProgramsOpen && (
                  <div className="overflow-hidden">
                    <div className="space-y-3 pl-4 pt-2">
                      {programSubLinks.map((link) => (
                        <NavLink
                          key={link.name}
                          to={link.path}
                          onClick={() => setIsOpen(false)}
                          className={({ isActive }: any) => `block text-base font-medium transition-colors ${isActive ? 'text-[var(--accent)]' : 'ryze-text-secondary'}`}
                        >
                          {t(link.name)}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <NavLink to="/meet-the-team" onClick={() => setIsOpen(false)} className="block border-b ryze-border-subtle pb-4 text-xl font-semibold ryze-text-primary">
                {t('Meet Our Team')}
              </NavLink>
              <NavLink to="/ryze-ai" onClick={() => setIsOpen(false)} className="group flex items-center justify-between border-b ryze-border-subtle pb-4 text-xl font-semibold ryze-text-primary">
                <span className="flex items-center gap-2">{t('Ryze AI')} <Zap size={18} className="text-[var(--accent)]" fill="currentColor" /></span>
                <ChevronRight size={20} className="ryze-text-secondary group-hover:text-[var(--accent)]" />
              </NavLink>
              <NavLink to="/learning-style" onClick={() => setIsOpen(false)} className="block border-b ryze-border-subtle pb-4 text-xl font-semibold ryze-text-primary">
                {t('Learning Style')}
              </NavLink>
              <NavLink to="/contact" onClick={() => setIsOpen(false)} className="block border-b ryze-border-subtle pb-4 text-xl font-semibold ryze-text-primary">
                {t('Contact')}
              </NavLink>
            </div>

            <div className="mt-8">
              <PrimaryCTA
                page="nav"
                placement="nav_mobile"
                styleVariant="dark"
                className="w-full"
                onClick={() => setIsOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
