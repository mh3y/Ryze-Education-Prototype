import React from 'react';
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone } from 'lucide-react';
// @ts-ignore
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { ROUTES } from '../src/constants/routes';
import { trackEvent } from '../src/analytics';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

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
  const brandLogoUrl =
    'https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto:good,c_limit,w_320,dpr_auto/v1764105292/yellow_logo_png_bvs11z.png';

  const handlePhoneClick = () => {
    trackEvent('phone_click', { page: 'global_footer', placement: 'footer' });
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'conversion', {
        send_to: 'AW-17763964178/xkRDCOqQr_wbEJKqwpZC',
        event_callback: () => {
          console.log('Google Ads conversion event successfully sent from Footer.');
        },
      });
    }
  };

  const socialLinks = [
    {
      Icon: Facebook,
      href: 'https://www.facebook.com/people/Ryze-Education/61583067491158/?mibextid=wwXIfr&rdid=pqwYdpqBoSmmo7cn&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1Ch1Yo8qHp%2F%3Fmibextid%3DwwXIfr',
      label: 'Ryze Education on Facebook',
    },
    {
      Icon: Instagram,
      href: 'https://www.instagram.com/ryzeeducation/?igsh=MTI3Z21xcHRzZnFxZA%3D%3D&utm_source=qr#',
      label: 'Ryze Education on Instagram',
    },
    {
      Icon: Linkedin,
      href: 'https://www.linkedin.com/company/ryze-education',
      label: 'Ryze Education on LinkedIn',
    },
    {
      Icon: WhatsappIcon,
      href: 'https://api.whatsapp.com/message/6GUJFT6GY2DHG1?autoload=1&app_absent=0',
      label: 'Chat with Ryze Education on WhatsApp',
    },
  ];

  const footerClass = isRyzeAi
    ? 'bg-[#050510]/90 border-white/10 backdrop-blur-md'
    : 'bg-[var(--primary)] border-white/10 text-[var(--primary-foreground)]';
  const headingClass = isRyzeAi ? 'text-white' : 'text-[var(--primary-foreground)]';
  const bodyClass = isRyzeAi ? 'text-slate-400' : 'text-[rgba(248,243,234,0.72)]';
  const linkClass = isRyzeAi ? 'hover:text-[var(--color-ryze)]' : 'hover:text-[var(--ryze-200)]';
  const contactIconClass = isRyzeAi ? 'text-[var(--color-ryze)]' : 'text-[var(--ryze-200)]';
  const socialClass = isRyzeAi
    ? 'bg-white/10 text-slate-300 hover:bg-[var(--color-ryze)]'
    : 'bg-white/8 text-[var(--primary-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]';

  return (
    <footer className={`relative z-20 isolate border-t pb-8 pt-18 transition-colors duration-300 ${footerClass}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-8">
          <div className="space-y-4 lg:col-span-5">
            <Link to={ROUTES.HOME} className="block">
              <img src={brandLogoUrl} alt="Ryze Education" width={250} height={64} className="mb-2 h-14 w-auto" />
            </Link>
            <p className={`max-w-md text-[1.02rem] font-medium leading-relaxed ${bodyClass}`}>
              {t(
                'Specialist maths tuition for families who value rigour, clarity, and genuine academic care. Private tutoring and small-group classes, guided by experienced teachers and high-performing mentors.',
              )}
            </p>
            <div className="flex gap-3 pt-1">
              {socialLinks.map(({ Icon, href, label }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className={`flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 hover:-translate-y-px ${socialClass}`}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h4 className={`mb-4 text-[0.94rem] font-bold uppercase tracking-[0.12em] ${headingClass}`}>{t('Company')}</h4>
            <ul className={`space-y-3 text-[1rem] font-medium ${bodyClass}`}>
              <li>
                <Link to={ROUTES.HSC_MATHS_TUTORING} className={`transition-colors ${linkClass}`}>
                  {t('HSC Maths Tutoring')}
                </Link>
              </li>
              <li>
                <Link to={ROUTES.HOW_IT_WORKS} className={`transition-colors ${linkClass}`}>
                  {t('How It Works')}
                </Link>
              </li>
              <li>
                <Link to={ROUTES.RYZE_AI} className={`flex items-center gap-2 transition-colors ${linkClass}`}>
                  {t('Ryze AI')}
                  <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-bold">NEW</span>
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className={`mb-4 text-[0.94rem] font-bold uppercase tracking-[0.12em] ${headingClass}`}>{t('Resources')}</h4>
            <ul className={`space-y-3 text-[1rem] font-medium ${bodyClass}`}>
              <li>
                <Link to={ROUTES.HOME} className={`transition-colors ${linkClass}`}>
                  {t('Home')}
                </Link>
              </li>
              <li>
                <Link to={ROUTES.HSC_MATHS_TUTORING} className={`transition-colors ${linkClass}`}>
                  {t('HSC Maths Tutoring')}
                </Link>
              </li>
              <li>
                <Link to={ROUTES.MATHS_TUTORING} className={`transition-colors ${linkClass}`}>
                  {t('Maths Tutoring')}
                </Link>
              </li>
              <li>
                <Link to={ROUTES.CONTACT} className={`transition-colors ${linkClass}`}>
                  {t('Contact Us')}
                </Link>
              </li>
            </ul>
          </div>

          <div className="min-w-0 lg:col-span-3">
            <h4 className={`mb-4 text-[0.94rem] font-bold uppercase tracking-[0.12em] ${headingClass}`}>{t('Contact')}</h4>
            <div className="grid gap-4 rounded-[1.75rem] border border-white/10 bg-white/5 p-5 sm:p-6">
              <div className="flex min-w-0 items-start gap-3.5">
                <MapPin size={16} className={`mt-[0.3rem] shrink-0 ${contactIconClass}`} />
                <span className={`min-w-0 text-[0.96rem] font-medium leading-[1.55] ${bodyClass}`}>Sydney, NSW Australia</span>
              </div>
              <div className="flex min-w-0 items-start gap-3.5">
                <Phone size={16} className={`mt-[0.3rem] shrink-0 ${contactIconClass}`} />
                <a
                  href="tel:+61413885839"
                  onClick={handlePhoneClick}
                  className={`min-w-0 text-[0.96rem] font-medium leading-[1.55] transition-colors ${bodyClass} ${linkClass}`}
                >
                  +61 413 885 839
                </a>
              </div>
              <div className="flex min-w-0 items-start gap-3.5">
                <Mail size={16} className={`mt-[0.3rem] shrink-0 ${contactIconClass}`} />
                <a
                  href="mailto:ryzeeducationgroup@gmail.com"
                  className={`min-w-0 break-words text-[0.94rem] font-medium leading-[1.55] [overflow-wrap:anywhere] transition-colors ${bodyClass} ${linkClass}`}
                >
                  ryzeeducationgroup@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 md:flex-row">
          <p className={`text-[0.92rem] font-medium ${isRyzeAi ? 'text-slate-500' : 'text-[rgba(248,243,234,0.6)]'}`}>
            {'\u00A9'} {new Date().getFullYear()} Ryze Education. All rights reserved.
          </p>
          <div className={`flex space-x-6 text-[0.92rem] font-medium ${isRyzeAi ? 'text-slate-500' : 'text-[rgba(248,243,234,0.6)]'}`}>
            <Link to={ROUTES.PRIVACY} className={`transition-colors ${linkClass}`}>
              {t('Privacy Policy')}
            </Link>
            <Link to={ROUTES.TERMS} className={`transition-colors ${linkClass}`}>
              {t('Terms and Conditions')}
            </Link>
            <Link to={ROUTES.SITEMAP} className={`transition-colors ${linkClass}`}>
              {t('Sitemap')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
