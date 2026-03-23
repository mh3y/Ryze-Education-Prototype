import React from 'react';
import { ArrowRight } from 'lucide-react';
// @ts-ignore
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import PrimaryCTA from './PrimaryCTA';
import { ROUTES } from '../src/constants/routes';
import { trackPhoneClick } from '../src/lib/tracking';
import { socialLinks } from '../data/socialLinks';

const WhatsappIcon = ({ size = 24, className }: { size?: number; className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
    <path d="M17.5 14.38c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.39-1.47-.89-.79-1.49-1.76-1.66-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.91-2.21-.24-.58-.49-.5-.67-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.72.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.42.25-.69.25-1.29.17-1.42-.07-.12-.27-.2-.57-.34z" />
  </svg>
);

const Footer: React.FC = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const isRyzeAi = location.pathname === ROUTES.RYZE_AI;
  
  // Choose correct logo variant based on theme
  const brandLogoUrl = isRyzeAi
    ? 'https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto:good,c_limit,w_320/v1764105292/white_logo_png_bvs11z.png'
    : 'https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto:good,c_limit,w_320/v1764105292/yellow_logo_png_bvs11z.png';

  const handlePhoneClick = () => trackPhoneClick('global_footer', 'footer');

  const footerSocialLinks = socialLinks.map((link) =>
    link.label.includes('WhatsApp') ? { ...link, Icon: WhatsappIcon as any } : link,
  );

  // Deep structural CSS driven purely by semantic tokens. 
  // We decouple the CTA background conceptually so it floats on standard page background.
  const footerContainerClass = isRyzeAi
    ? 'ryze-bg-midnight backdrop-blur-xl ryze-text-midnight-muted'
    : 'ryze-bg-surface-dark ryze-text-inverse-muted';
    
  const headingClass = isRyzeAi 
    ? 'ryze-text-midnight' 
    : 'ryze-text-inverse';
    
  const linkHoverClass = isRyzeAi 
    ? 'hover:text-[var(--ryze-primary)]' 
    : 'hover:text-[var(--ryze-100)]';

  // The CTA layout is strictly muted into a clean surface box
  const ctaCardClass = isRyzeAi
    ? 'ryze-bg-midnight border border-white/5'
    : 'ryze-bg-surface ryze-border-subtle';

  return (
    <div className="ryze-footer-edge flex flex-col" style={{ ['--ryze-footer-edge-rgb' as string]: isRyzeAi ? '5, 5, 16' : '23, 29, 40' }}>
      {/* 1. SEPARATED PRE-FOOTER CTA (SUBTLE) */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className={`relative isolate flex flex-col items-center justify-between gap-4 overflow-hidden rounded-[1.5rem] border px-6 py-7 sm:px-8 sm:py-8 lg:flex-row ${ctaCardClass}`}>
           <div className="max-w-2xl text-center lg:text-left">
              <h2 className={`mb-2 ryze-heading-3 ${isRyzeAi ? 'ryze-text-inverse' : 'ryze-text-primary'}`}>
                {t('Accelerate ahead of the curve')}
              </h2>
              <p className={`text-[0.95rem] leading-relaxed max-w-[50ch] mx-auto lg:mx-0 ${isRyzeAi ? 'ryze-text-midnight-muted' : 'ryze-text-secondary'}`}>
                {t("Ryze students build lasting confidence, stronger marks, and genuine understanding. Take the first step today.")}
              </p>
           </div>
           
           <div className="mt-1 w-full shrink-0 sm:w-auto lg:mt-0">
             <PrimaryCTA
                page="global_footer"
                placement="footer"
                styleVariant={isRyzeAi ? 'ghost' : 'dark'}
                className="w-full sm:w-auto"
              />
           </div>
        </div>
      </div>

      {/* 2. FORMAL MINIMALIST FOOTER */}
      <footer className={`relative z-20 border-t border-[rgba(255,255,255,0.06)] pt-10 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] transition-colors duration-300 sm:pt-12 sm:pb-6 ${footerContainerClass}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-6">
            
            {/* Left Column: Brand & Manifesto (Span 4) */}
            <div className="space-y-4 lg:col-span-4 lg:pr-6">
              <Link to={ROUTES.HOME} className="block w-fit">
                <img src={brandLogoUrl} alt="Ryze Education" width={180} height={46} className="h-9 w-auto" />
              </Link>
              <p className="max-w-sm text-sm leading-6">
                {t('Education that sees you. Diagnosing gaps, building understanding, and creating confidence in every student.')}
              </p>
              <div className="flex gap-3 pt-1">
                {footerSocialLinks.map(({ Icon, href, label }, i) => (
                  <a
                    key={i}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    title={label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(255,255,255,0.15)] bg-transparent text-[rgba(255,255,255,0.8)] transition-all duration-300 hover:border-[var(--accent)] hover:bg-[var(--accent)]/10 hover:text-[var(--accent)] hover:-translate-y-0.5"
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>

            {/* Middle Columns: Math Navigation (Span 2) */}
            <div className="lg:col-span-2 lg:col-start-6">
              <h4 className={`mb-3 text-[1.08rem] font-extrabold uppercase tracking-[0.1em] ${headingClass}`}>{t('Programs')}</h4>
              <ul className="space-y-2.5 text-sm leading-6">
                <li><Link to={ROUTES.HSC_MATHS_PROGRAM} className={`transition-colors flex ${linkHoverClass}`}>{t('HSC')}</Link></li>
                <li><Link to={ROUTES.ACCELERATED_MATHS_PROGRAM} className={`transition-colors flex ${linkHoverClass}`}>{t('Accelerated Pathways')}</Link></li>
                <li><Link to={ROUTES.JUNIOR_FOUNDATIONS_PROGRAM} className={`transition-colors flex ${linkHoverClass}`}>{t('Junior Foundations')}</Link></li>
                <li><Link to={ROUTES.SELECTIVE_OC_PROGRAM} className={`transition-colors flex ${linkHoverClass}`}>{t('OC & Selective Exam Preparation')}</Link></li>
                <li><Link to={ROUTES.PRIMARY_MATHS_PROGRAM} className={`transition-colors flex ${linkHoverClass}`}>{t('Primary')}</Link></li>
              </ul>
            </div>
            
            {/* Middle Columns: Platform Nav (Span 2) */}
            <div className="lg:col-span-2">
              <h4 className={`mb-3 text-[1.08rem] font-extrabold uppercase tracking-[0.1em] ${headingClass}`}>{t('Company')}</h4>
              <ul className="space-y-2.5 text-sm leading-6">
                <li><Link to={ROUTES.HOW_IT_WORKS} className={`transition-colors flex ${linkHoverClass}`}>{t('How It Works')}</Link></li>
                <li>
                  <Link to={ROUTES.RYZE_AI} className={`flex items-center gap-2 transition-colors ${linkHoverClass}`}>
                    {t('Ryze AI')} <span className="rounded bg-[var(--accent)]/10 text-[var(--accent)] px-1.5 py-0.5 text-[0.65rem] font-bold">NEW</span>
                  </Link>
                </li>
                <li><Link to={ROUTES.CONTACT} className={`transition-colors flex ${linkHoverClass}`}>{t('Contact Us')}</Link></li>
              </ul>
            </div>

            {/* Right Column: Contact Details (Span 3) */}
            <div className="lg:col-span-3">
              <h4 className={`mb-3 text-[1.08rem] font-extrabold uppercase tracking-[0.1em] ${headingClass}`}>{t('Contact')}</h4>
              <ul className="space-y-2.5 text-sm leading-6">
                <li>
                  <a href="mailto:ryzeeducationgroup@gmail.com" className={`flex transition-colors ${linkHoverClass}`}>
                    <span className="opacity-70 w-[70px] shrink-0 font-medium">Email</span> 
                    <span className="truncate">ryzeeducationgroup@gmail.com</span>
                  </a>
                </li>
                <li>
                  <a href="tel:+61413885839" onClick={handlePhoneClick} className={`flex transition-colors ${linkHoverClass}`}>
                    <span className="opacity-70 w-[70px] shrink-0 font-medium">Phone</span> 
                    <span>+61 413 885 839</span>
                  </a>
                </li>
                <li>
                  <span className="flex">
                    <span className="opacity-70 w-[70px] shrink-0 font-medium">Location</span> 
                    <span>Sydney, NSW Australia</span>
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-3 border-t border-[rgba(255,255,255,0.06)] pt-5 md:flex-row">
            <p className="text-[0.8rem] opacity-70">
              {'\u00A9'} {new Date().getFullYear()} Ryze Education. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-[0.8rem] opacity-70">
              <Link to={ROUTES.PRIVACY} className={`transition-colors ${linkHoverClass}`}>Privacy Policy</Link>
              <Link to={ROUTES.TERMS} className={`transition-colors ${linkHoverClass}`}>Terms and Conditions</Link>
              <Link to={ROUTES.SITEMAP} className={`transition-colors ${linkHoverClass}`}>Sitemap</Link>
            </div>
          </div>
          
        </div>
      </footer>
    </div>
  );
};

export default Footer;
