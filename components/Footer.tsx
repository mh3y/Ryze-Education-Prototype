
import React, { useState } from 'react';
import { Facebook, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
// @ts-ignore
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const WhatsappIcon = ({ size = 24, className }: { size?: number, className?: string }) => (
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
  const isRyzeAi = location.pathname === '/ryze-ai';

  const socialLinks = [
    { 
      Icon: Facebook, 
      href: "https://www.facebook.com/people/Ryze-Education/61583067491158/?mibextid=wwXIfr&rdid=pqwYdpqBoSmmo7cn&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1Ch1Yo8qHp%2F%3Fmibextid%3DwwXIfr" 
    },
    { 
      Icon: Instagram, 
      href: "https://www.instagram.com/ryzeeducation/?igsh=MTI3Z21xcHRzZnFxZA%3D%3D&utm_source=qr#" 
    },
    { 
      Icon: Linkedin, 
      href: "https://www.linkedin.com/company/ryze-education" 
    },
    { 
      Icon: WhatsappIcon, 
      href: "https://api.whatsapp.com/message/6GUJFT6GY2DHG1?autoload=1&app_absent=0" 
    }
  ];

  // Dynamic Styles based on Page
  const footerBg = isRyzeAi ? 'bg-[#050510]/90 backdrop-blur-md border-white/10' : 'bg-white border-slate-100';
  const headingColor = isRyzeAi ? 'text-white' : 'text-slate-900';
  const textColor = isRyzeAi ? 'text-slate-400' : 'text-slate-500';
  const linkHoverColor = isRyzeAi ? 'hover:text-[#FFB000]' : 'hover:text-ryze';
  const cardBg = isRyzeAi ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100';
  const socialBg = isRyzeAi ? 'bg-white/10 text-slate-300 hover:bg-[#FFB000]' : 'bg-slate-50 text-slate-400 hover:bg-ryze';

  return (
    <footer className={`${footerBg} pt-20 pb-10 border-t transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-6">
            <Link to="/" className="block">
              <img 
                src="https://res.cloudinary.com/dsvjhemjd/image/upload/v1764105292/yellow_logo_png_bvs11z.png" 
                alt="Ryze Education" 
                className="h-16 w-auto mb-4"
              />
            </Link>
            <p className={`${textColor} text-sm leading-relaxed max-w-xs font-medium`}>
              {t("Education that sees you. Diagnosing gaps, building understanding, and creating confidence in every student.")}
            </p>
            <div className="flex gap-4 pt-2">
              {socialLinks.map(({ Icon, href }, i) => (
                <a 
                  key={i} 
                  href={href} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={`w-10 h-10 rounded-full flex items-center justify-center hover:text-white transition-all duration-300 ${socialBg}`}
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-2">
            <h4 className={`font-bold mb-6 text-sm uppercase tracking-wider ${headingColor}`}>{t("Company")}</h4>
            <ul className={`space-y-4 text-sm font-medium ${textColor}`}>
              <li><Link to="/the-ryze-truth" className={`${linkHoverColor} transition-colors flex items-center gap-1`}>{t("The Ryze Truth")}</Link></li>
              <li><Link to="/meet-the-team" className={`${linkHoverColor} transition-colors`}>{t("Meet Our Team")}</Link></li>
              <li><Link to="/how-ryze-works" className={`${linkHoverColor} transition-colors`}>{t("How It Works")}</Link></li>
              <li><Link to="/ryze-ai" className={`${linkHoverColor} transition-colors flex items-center gap-2`}>{t("Ryze AI")} <span className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded font-bold">NEW</span></Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className={`font-bold mb-6 text-sm uppercase tracking-wider ${headingColor}`}>{t("Resources")}</h4>
            <ul className={`space-y-4 text-sm font-medium ${textColor}`}>
              <li><Link to="/learningstyle" className={`${linkHoverColor} transition-colors`}>{t("Learning Style")}</Link></li>
              <li><Link to="/login" className={`${linkHoverColor} transition-colors`}>{t("Dashboard Login")}</Link></li>
              <li><Link to="/contact" className={`${linkHoverColor} transition-colors`}>{t("Contact Us")}</Link></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="lg:col-span-4">
            <h4 className={`font-bold mb-6 text-sm uppercase tracking-wider ${headingColor}`}>{t("Contact")}</h4>
            <div className={`p-6 rounded-2xl border space-y-4 ${cardBg}`}>
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-[#FFB000] shrink-0 mt-1" />
                <span className={`text-sm font-medium ${isRyzeAi ? 'text-slate-300' : 'text-slate-600'}`}>Sydney, NSW Australia</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-[#FFB000] shrink-0" />
                <a href="tel:+61413885839" className={`text-sm font-medium ${isRyzeAi ? 'text-slate-300' : 'text-slate-600'} ${linkHoverColor}`}>+61 413 885 839</a>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-[#FFB000] shrink-0" />
                <a href="mailto:ryzeeducationgroup@gmail.com" className={`text-sm font-medium ${isRyzeAi ? 'text-slate-300' : 'text-slate-600'} ${linkHoverColor}`}>ryzeeducationgroup@gmail.com</a>
              </div>
            </div>
          </div>

        </div>

        <div className={`border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 ${isRyzeAi ? 'border-white/10' : 'border-slate-100'}`}>
          <p className={`text-xs font-medium ${isRyzeAi ? 'text-slate-500' : 'text-slate-400'}`}>
            © {new Date().getFullYear()} Ryze Education. All rights reserved.
          </p>
          <div className={`flex space-x-6 text-xs font-medium ${isRyzeAi ? 'text-slate-500' : 'text-slate-400'}`}>
            <Link to="/privacy" className={`${linkHoverColor} transition-colors`}>{t("Privacy Policy")}</Link>
            <Link to="/terms" className={`${linkHoverColor} transition-colors`}>{t("Terms and Conditions")}</Link>
            <Link to="/sitemap" className={`${linkHoverColor} transition-colors`}>{t("Sitemap")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
