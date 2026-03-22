import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronDown, ChevronRight, Menu, X, Zap } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import PrimaryCTA from './PrimaryCTA';
import { trackPrimaryCtaClick } from '../src/analytics';
import { ROUTES } from '../src/constants/routes';

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
  const brandLogoUrl =
    'https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto:good,c_limit,w_320/v1764105292/yellow_logo_png_bvs11z.png';
  const aboutSubLinks = [
    { name: 'The Ryze Truth', path: '/the-ryze-truth', desc: 'Our philosophy and story.' },
    { name: 'How Ryze Works', path: ROUTES.HOW_IT_WORKS, desc: 'Our process explained.' },
  ];
  const programSubLinks = [
    { name: 'HSC Mathematics', path: ROUTES.HSC_MATHS_PROGRAM, desc: 'Senior maths for Advanced and Extension students.' },
    { name: 'Accelerated Maths', path: ROUTES.ACCELERATED_MATHS_PROGRAM, desc: 'For ambitious students ready for a faster and more advanced mathematical pace.' },
    { name: 'Junior Foundations', path: ROUTES.JUNIOR_FOUNDATIONS_PROGRAM, desc: 'Years 7-10 support aligned with the NSW curriculum.' },
    { name: 'OC & Selective Exam Preparation', path: ROUTES.SELECTIVE_OC_PROGRAM, desc: 'OC and selective preparation with stronger reasoning.' },
    { name: 'Primary Maths', path: ROUTES.PRIMARY_MATHS_PROGRAM, desc: 'Years 3-6 building confidence and fluency early.' },
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
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHeroRoute = ['/', '/ryze-ai', '/contact'].includes(pathname);
  const isSolid = isScrolled || isOpen || !isHeroRoute;
  const textClass = isSolid ? 'ryze-text-primary' : 'ryze-text-inverse';
  const shellClass = isSolid
    ? 'border-[rgba(23,29,40,0.08)] bg-[rgba(248,243,234,0.84)] shadow-[0_24px_60px_-38px_rgba(17,21,29,0.42)] backdrop-blur-xl'
    : 'border-white/12 bg-transparent';
  const desktopCtaClass = isSolid
    ? '!min-h-[2.2rem] !rounded-full !border !border-[rgba(23,29,40,0.1)] !bg-[rgba(255,255,255,0.58)] !px-4 !py-2 !text-[0.84rem] !font-semibold !tracking-[0.01em] !text-[var(--ryze-text-primary)] !shadow-none hover:!border-[rgba(184,132,30,0.28)] hover:!bg-[rgba(184,132,30,0.12)] hover:!text-[var(--accent)]'
    : '!min-h-[2.2rem] !rounded-full !border !border-white/14 !bg-white/[0.06] !px-4 !py-2 !text-[0.84rem] !font-semibold !tracking-[0.01em] !text-white !shadow-none hover:!border-white/28 hover:!bg-white/[0.12] hover:!text-white';
  const linkClass = (isActive: boolean) =>
    `${isActive ? 'text-[var(--accent)]' : textClass} text-[0.95rem] font-semibold tracking-[-0.01em] transition-colors duration-300 hover:text-[var(--accent)]`;

  const handleContactNavigate = (placement: string) => {
    trackPrimaryCtaClick('nav', placement);
    navigate('/contact');
  };

  return (
    <nav className="fixed top-0 left-0 z-50 w-full px-3 pt-[max(env(safe-area-inset-top),0.5rem)] sm:px-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-6">
        <div className={`relative flex items-center justify-between rounded-full border px-4 sm:px-5 lg:px-6 ${shellClass}`}>
          <button
            type="button"
            className="group z-50 flex-shrink-0 cursor-pointer"
            onClick={() => {
              setIsOpen(false);
              navigate('/');
            }}
          >
            <img
              src={brandLogoUrl}
              alt="Ryze Education"
              width={250}
              height={64}
              className={`mt-1 h-10 w-auto transition duration-200 group-hover:scale-[1.02] md:h-16 ${!isSolid ? 'brightness-0 invert' : ''}`}
            />
          </button>

          <div className="hidden items-center gap-5 md:flex lg:gap-9">
            <div className="relative" onMouseEnter={() => setAboutDropdownOpen(true)} onMouseLeave={() => setAboutDropdownOpen(false)}>
              <button className={`${textClass} flex items-center gap-1 text-[0.95rem] font-semibold tracking-[-0.01em] transition-colors duration-300 hover:text-[var(--accent)]`}>
                {t('About')}
                <ChevronDown size={14} className={`transition-transform duration-300 ${aboutDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              <div className={`absolute top-full left-1/2 w-64 -translate-x-1/2 pt-4 transition-[opacity,transform] duration-200 ${aboutDropdownOpen ? 'visible scale-100 opacity-100' : 'invisible scale-95 opacity-0'}`}>
                <div className="overflow-hidden rounded-[1.5rem] border border-[rgba(23,29,40,0.08)] bg-[rgba(248,243,234,0.96)] p-2 shadow-[0_24px_60px_-36px_rgba(17,21,29,0.45)] backdrop-blur-xl">
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
              <button className={`${textClass} flex items-center gap-1 text-[0.95rem] font-semibold tracking-[-0.01em] transition-colors duration-300 hover:text-[var(--accent)]`}>
                {t('Programs')}
                <ChevronDown size={14} className={`transition-transform duration-300 ${programsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              <div className={`absolute top-full left-1/2 w-80 -translate-x-1/2 pt-4 transition-[opacity,transform] duration-200 ${programsDropdownOpen ? 'visible scale-100 opacity-100' : 'invisible scale-95 opacity-0'}`}>
                <div className="overflow-hidden rounded-[1.5rem] border border-[rgba(23,29,40,0.08)] bg-[rgba(248,243,234,0.96)] p-2 shadow-[0_24px_60px_-36px_rgba(17,21,29,0.45)] backdrop-blur-xl">
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
                    isSolid
                      ? 'bg-[rgba(184,132,30,0.12)] text-[var(--accent)]'
                      : 'border border-white/20 bg-white/10 text-[var(--ryze-200)]'
                  }`}
                >
                  <Zap size={10} fill="currentColor" />
                </span>
              </span>
            </NavLink>
            <NavLink to="/learning-style" className={({ isActive }: any) => linkClass(isActive)}>
              {t('Learning Style')}
            </NavLink>
            <div className={`mx-3 h-6 w-px ${isSolid ? 'bg-[rgba(23,29,40,0.12)]' : 'bg-white/20'}`} />
            <PrimaryCTA
              page="nav"
              placement="nav_desktop"
              styleVariant="ghost"
              size="sm"
              className={desktopCtaClass}
            />
          </div>

          <div className="absolute top-1/2 right-0 z-50 flex -translate-y-1/2 items-center gap-2 md:hidden">
            {isScrolled && !isOpen && (
              <button
                onClick={() => handleContactNavigate('nav_mobile_scroll_inline')}
                className={`inline-flex h-10 items-center justify-center rounded-full px-4 text-[0.92rem] font-semibold shadow-[0_18px_42px_-28px_rgba(17,21,29,0.42)] ${
                  isSolid ? 'ryze-bg-surface-dark ryze-text-inverse' : 'border border-white/20 bg-white/10 ryze-text-inverse'
                }`}
                aria-label="Enrol Now"
              >
                <span>Enrol Now</span>
              </button>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              className={`${textClass} rounded-full p-2 transition-colors duration-300 hover:bg-black/5 ${isOpen ? 'bg-[rgba(23,29,40,0.06)]' : ''}`}
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
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
