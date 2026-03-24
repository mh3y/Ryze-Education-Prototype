import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, Menu, X, Zap } from 'lucide-react';
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

const EXPANDED_NAV_OFFSET = 'calc(env(safe-area-inset-top, 0px) + 6.15rem)';
const COMPACT_NAV_OFFSET = 'calc(env(safe-area-inset-top, 0px) + 5.3rem)';

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
  const menuPanelId = 'ryze-mobile-nav-panel';
  const brandLogoUrl =
    'https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto:good,c_limit,w_320/v1764105292/yellow_logo_png_bvs11z.png';
  const bookConsultationLabel = 'Book Consultation';
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
    setIsOpen(false);
    setAboutDropdownOpen(false);
    setProgramsDropdownOpen(false);
    setMobileAboutOpen(false);
    setMobileProgramsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) {
      setMobileAboutOpen(false);
      setMobileProgramsOpen(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
        setMobileAboutOpen(false);
        setMobileProgramsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setAboutDropdownOpen(false);
        setProgramsDropdownOpen(false);
        setMobileAboutOpen(false);
        setMobileProgramsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--ryze-nav-offset',
      isScrolled && !isOpen ? COMPACT_NAV_OFFSET : EXPANDED_NAV_OFFSET,
    );

    return () => {
      document.documentElement.style.setProperty('--ryze-nav-offset', EXPANDED_NAV_OFFSET);
    };
  }, [isScrolled, isOpen]);

  const isSolidNav = isScrolled || isOpen || aboutDropdownOpen || programsDropdownOpen;
  const useInverseRestState = !isSolidNav && DARK_TOP_NAV_ROUTES.has(normalizedPathname);
  const useLightTopText = useInverseRestState;
  const textClass = useLightTopText ? 'text-white' : 'text-[#171d28]';
  const activeTextClass = 'text-[#8f6517]';
  const focusRingClass =
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent';
  const navClasses =
    'fixed top-0 left-0 z-[70] w-full px-3 sm:px-4 pt-[max(env(safe-area-inset-top),0.35rem)]';
  const navShellClasses = `relative rounded-[1.2rem] px-4 transition-[padding] duration-300 sm:px-5 lg:px-6 ${
    isScrolled && !isOpen ? 'py-1.5 sm:py-2' : 'py-2 sm:py-2.5'
  }`;
  const navSurfaceClasses = `pointer-events-none absolute inset-0 overflow-hidden rounded-[1.2rem] border transition-[background,border-color,box-shadow,transform] duration-500 ease-out ${
    isSolidNav
      ? 'border-[rgba(255,255,255,0.82)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(250,247,243,0.94)_100%)] shadow-[0_18px_42px_-30px_rgba(17,21,29,0.18)] backdrop-blur-xl'
      : useInverseRestState
        ? 'border-white/18 bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.04)_100%)] shadow-[0_16px_36px_-28px_rgba(0,0,0,0.34)] backdrop-blur-[14px]'
        : 'border-[rgba(23,29,40,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.82)_0%,rgba(248,243,234,0.72)_100%)] shadow-[0_16px_36px_-30px_rgba(17,21,29,0.14)] backdrop-blur-[18px]'
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
  const linkClass = (isActive: boolean) =>
    `${isActive ? activeTextClass : `${textClass} hover:text-[#b87400]`} ${focusRingClass} rounded-full px-1 py-1 text-[0.95rem] font-semibold tracking-[-0.01em] transition-colors duration-300`;
  const dropdownWrapperClass = (isOpenState: boolean, widthClass: string) =>
    `absolute top-full left-1/2 z-[90] ${widthClass} -translate-x-1/2 pt-5 transition-[opacity,transform] duration-200 ${
      isOpenState ? 'visible scale-100 opacity-100' : 'invisible scale-95 opacity-0'
    }`;
  const dropdownPanelClass =
    'overflow-hidden rounded-[1.2rem] border border-[rgba(255,255,255,0.72)] bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(248,245,240,0.88)_100%)] p-2 shadow-[0_26px_60px_-36px_rgba(17,21,29,0.24)] backdrop-blur-2xl';
  const aboutButtonClass = ['/the-ryze-truth', ROUTES.HOW_IT_WORKS].includes(normalizedPathname)
    ? activeTextClass
    : `${textClass} hover:text-[#b87400]`;
  const programsButtonClass = programSubLinks.some((item) => item.path === normalizedPathname)
    ? activeTextClass
    : `${textClass} hover:text-[#b87400]`;
  const navDividerClass = `mx-3 h-6 w-px ${
    isSolidNav ? 'bg-[rgba(23,29,40,0.12)]' : useInverseRestState ? 'bg-white/18' : 'bg-[rgba(23,29,40,0.12)]'
  }`;
  const desktopCtaClass = isSolidNav
    ? '!min-h-[2.1rem] !rounded-full !border !border-[#171d28]/8 !bg-[#171d28] !px-4 !py-1.5 !text-sm !font-semibold !tracking-[0.01em] !text-[#f8f3ea] !shadow-[0_14px_28px_-20px_rgba(17,21,29,0.36)] hover:!bg-[#11151d]'
    : useInverseRestState
      ? '!min-h-[2.1rem] !rounded-full !border !border-white/24 !bg-[linear-gradient(180deg,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0.06)_100%)] !px-4 !py-1.5 !text-sm !font-semibold !tracking-[0.01em] !text-white !shadow-[0_10px_22px_-18px_rgba(0,0,0,0.34)] !backdrop-blur-xl hover:!bg-[linear-gradient(180deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.1)_100%)]'
      : '!min-h-[2.1rem] !rounded-full !border !border-[#171d28]/10 !bg-[rgba(23,29,40,0.92)] !px-4 !py-1.5 !text-sm !font-semibold !tracking-[0.01em] !text-[#f8f3ea] !shadow-[0_14px_28px_-22px_rgba(17,21,29,0.22)] hover:!bg-[#11151d]';
  const mobileControlShellClass = `flex items-center gap-1 rounded-full border p-1 transition-[background,border-color,box-shadow] duration-300 ${
    isSolidNav
      ? 'border-[rgba(23,29,40,0.1)] bg-white/78 shadow-[0_12px_28px_-20px_rgba(17,21,29,0.22)] backdrop-blur-xl'
      : useInverseRestState
        ? 'border-white/24 bg-[linear-gradient(180deg,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0.06)_100%)] shadow-[0_10px_22px_-18px_rgba(0,0,0,0.3)] backdrop-blur-xl'
        : 'border-[rgba(23,29,40,0.1)] bg-white/74 shadow-[0_12px_28px_-20px_rgba(17,21,29,0.18)] backdrop-blur-xl'
  }`;
  const mobileBookClass = `inline-flex min-h-10 items-center justify-center rounded-full px-3.5 text-[0.82rem] font-semibold tracking-[0.03em] transition-colors ${
    isSolidNav
      ? 'bg-[#171d28] text-[#f8f3ea] hover:bg-[#11151d]'
      : useInverseRestState
        ? 'bg-white/10 text-white hover:bg-white/16'
        : 'bg-[#171d28] text-[#f8f3ea] hover:bg-[#11151d]'
  }`;
  const mobileMenuButtonClass = `inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
    isSolidNav
      ? 'text-[#171d28] hover:bg-[#171d28]/6'
      : useInverseRestState
        ? 'text-white hover:bg-white/10'
        : 'text-[#171d28] hover:bg-[#171d28]/6'
  }`;
  const mobilePanelShellClass = `md:hidden transition-[max-height,opacity,transform,margin] duration-300 ease-out ${
    isOpen ? 'pointer-events-auto mt-3 max-h-[36rem] translate-y-0 opacity-100' : 'pointer-events-none mt-0 max-h-0 -translate-y-2 opacity-0'
  }`;
  const mobilePanelSurfaceClass =
    'overflow-hidden rounded-[1.3rem] border border-[rgba(255,255,255,0.72)] bg-[linear-gradient(180deg,rgba(255,255,255,0.95)_0%,rgba(248,245,240,0.9)_100%)] p-2 shadow-[0_28px_60px_-38px_rgba(17,21,29,0.28)] backdrop-blur-2xl';
  const mobileSectionButtonClass =
    'flex w-full items-center justify-between rounded-[1rem] px-4 py-3 text-left text-base font-semibold text-[#171d28] transition-colors hover:bg-[rgba(23,29,40,0.05)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]';
  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block rounded-[1rem] px-4 py-3 text-base font-semibold transition-colors ${
      isActive ? 'bg-[rgba(184,132,30,0.12)] text-[var(--accent)]' : 'text-[#171d28] hover:bg-[rgba(23,29,40,0.04)]'
    } ${focusRingClass}`;

  const handleContactNavigate = (placement: string) => {
    trackPrimaryCtaClick('nav', placement);
    setIsOpen(false);
    navigate(ROUTES.CONTACT);
  };

  return (
    <nav className={navClasses} aria-label="Primary">
      <div className="relative mx-auto max-w-7xl">
        <div className={navShellClasses}>
          <div aria-hidden="true" className={navSurfaceClasses}>
            <div className={navHighlightClasses} />
          </div>

          <div className="relative z-10 flex items-center justify-between gap-4">
            <Link
              to={ROUTES.HOME}
              className={`${focusRingClass} group inline-flex shrink-0 rounded-full`}
              onClick={() => setIsOpen(false)}
            >
              <img
                src={brandLogoUrl}
                alt="Ryze Education"
                width={250}
                height={64}
                className={logoClasses}
              />
            </Link>

            <div className="hidden items-center gap-5 md:flex lg:gap-9">
              <div
                className="relative"
                onMouseEnter={() => {
                  setAboutDropdownOpen(true);
                  setProgramsDropdownOpen(false);
                }}
                onMouseLeave={() => setAboutDropdownOpen(false)}
              >
                <button
                  type="button"
                  aria-expanded={aboutDropdownOpen}
                  aria-haspopup="true"
                  className={`${focusRingClass} ${aboutButtonClass} flex items-center gap-1 rounded-full px-1 py-1 text-[0.95rem] font-semibold tracking-[-0.01em] transition-colors duration-300`}
                  onClick={() => {
                    setAboutDropdownOpen((current) => !current);
                    setProgramsDropdownOpen(false);
                  }}
                >
                  {t('About')}
                  <ChevronDown size={14} className={`transition-transform duration-300 ${aboutDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                <div className={dropdownWrapperClass(aboutDropdownOpen, 'w-64')}>
                  <div className={dropdownPanelClass}>
                    {aboutSubLinks.map((link) => (
                      <NavLink
                        key={link.name}
                        to={link.path}
                        className={({ isActive }) =>
                          `block rounded-[1rem] px-4 py-3 transition-colors duration-200 ${focusRingClass} ${
                            isActive ? 'bg-[rgba(184,132,30,0.12)]' : 'hover:bg-[rgba(23,29,40,0.04)]'
                          }`
                        }
                        onClick={() => setAboutDropdownOpen(false)}
                      >
                        <span className="block text-[0.95rem] font-bold ryze-text-primary">{t(link.name)}</span>
                        {language === 'en' && <span className="mt-0.5 block text-[0.82rem] ryze-text-secondary">{t(link.desc)}</span>}
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>

              <div
                className="relative"
                onMouseEnter={() => {
                  setProgramsDropdownOpen(true);
                  setAboutDropdownOpen(false);
                }}
                onMouseLeave={() => setProgramsDropdownOpen(false)}
              >
                <button
                  type="button"
                  aria-expanded={programsDropdownOpen}
                  aria-haspopup="true"
                  className={`${focusRingClass} ${programsButtonClass} flex items-center gap-1 rounded-full px-1 py-1 text-[0.95rem] font-semibold tracking-[-0.01em] transition-colors duration-300`}
                  onClick={() => {
                    setProgramsDropdownOpen((current) => !current);
                    setAboutDropdownOpen(false);
                  }}
                >
                  {t('Programs')}
                  <ChevronDown size={14} className={`transition-transform duration-300 ${programsDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                <div className={dropdownWrapperClass(programsDropdownOpen, 'w-[23rem]')}>
                  <div className={dropdownPanelClass}>
                    {programSubLinks.map((link) => (
                      <NavLink
                        key={link.name}
                        to={link.path}
                        className={({ isActive }) =>
                          `block rounded-[1rem] px-4 py-3 transition-colors duration-200 ${focusRingClass} ${
                            isActive ? 'bg-[rgba(184,132,30,0.12)]' : 'hover:bg-[rgba(23,29,40,0.04)]'
                          }`
                        }
                        onClick={() => setProgramsDropdownOpen(false)}
                      >
                        <span className="block text-[0.95rem] font-bold ryze-text-primary">{t(link.name)}</span>
                        {language === 'en' && <span className="mt-0.5 block text-[0.82rem] ryze-text-secondary">{t(link.desc)}</span>}
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>

              <NavLink to="/meet-the-team" className={({ isActive }) => linkClass(isActive)}>
                {t('Meet Our Team')}
              </NavLink>
              <NavLink to="/ryze-ai" className={({ isActive }) => linkClass(isActive)}>
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
              <NavLink to="/learning-style" className={({ isActive }) => linkClass(isActive)}>
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

            <div className="md:hidden">
              <div className={mobileControlShellClass}>
                <button
                  type="button"
                  onClick={() => handleContactNavigate('nav_mobile_banner')}
                  className={`${focusRingClass} ${mobileBookClass}`}
                  aria-label={bookConsultationLabel}
                >
                  Book
                </button>
                <div
                  aria-hidden="true"
                  className={`h-6 w-px ${
                    isSolidNav ? 'bg-[#171d28]/10' : useInverseRestState ? 'bg-white/20' : 'bg-[#171d28]/10'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setIsOpen((current) => !current)}
                  aria-controls={menuPanelId}
                  aria-expanded={isOpen}
                  aria-label={isOpen ? 'Close menu' : 'Open menu'}
                  className={`${focusRingClass} ${mobileMenuButtonClass}`}
                >
                  {isOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>
            </div>
          </div>

          <div className={mobilePanelShellClass}>
            <div id={menuPanelId} className={mobilePanelSurfaceClass}>
              <div className="space-y-1">
                <button
                  type="button"
                  className={mobileSectionButtonClass}
                  aria-expanded={mobileAboutOpen}
                  onClick={() => {
                    setMobileAboutOpen((current) => !current);
                    setMobileProgramsOpen(false);
                  }}
                >
                  <span>{t('About')}</span>
                  <ChevronDown size={18} className={`transition-transform duration-200 ${mobileAboutOpen ? 'rotate-180 text-[var(--accent)]' : 'text-[#5b5752]'}`} />
                </button>
                {mobileAboutOpen && (
                  <div className="space-y-1 px-1 pb-2">
                    {aboutSubLinks.map((link) => (
                      <NavLink key={link.name} to={link.path} className={mobileLinkClass} onClick={() => setIsOpen(false)}>
                        {t(link.name)}
                      </NavLink>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  className={mobileSectionButtonClass}
                  aria-expanded={mobileProgramsOpen}
                  onClick={() => {
                    setMobileProgramsOpen((current) => !current);
                    setMobileAboutOpen(false);
                  }}
                >
                  <span>{t('Programs')}</span>
                  <ChevronDown size={18} className={`transition-transform duration-200 ${mobileProgramsOpen ? 'rotate-180 text-[var(--accent)]' : 'text-[#5b5752]'}`} />
                </button>
                {mobileProgramsOpen && (
                  <div className="space-y-1 px-1 pb-2">
                    {programSubLinks.map((link) => (
                      <NavLink key={link.name} to={link.path} className={mobileLinkClass} onClick={() => setIsOpen(false)}>
                        {t(link.name)}
                      </NavLink>
                    ))}
                  </div>
                )}

                <NavLink to="/meet-the-team" className={mobileLinkClass} onClick={() => setIsOpen(false)}>
                  {t('Meet Our Team')}
                </NavLink>
                <NavLink to="/ryze-ai" className={mobileLinkClass} onClick={() => setIsOpen(false)}>
                  <span className="flex items-center justify-between gap-3">
                    <span>{t('Ryze AI')}</span>
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[rgba(184,132,30,0.12)] text-[var(--accent)]">
                      <Zap size={12} fill="currentColor" />
                    </span>
                  </span>
                </NavLink>
                <NavLink to="/learning-style" className={mobileLinkClass} onClick={() => setIsOpen(false)}>
                  {t('Learning Style')}
                </NavLink>
                <NavLink to="/contact" className={mobileLinkClass} onClick={() => setIsOpen(false)}>
                  {t('Contact')}
                </NavLink>
              </div>

              <div className="mt-3 border-t border-[rgba(23,29,40,0.08)] px-2 pt-3">
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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
