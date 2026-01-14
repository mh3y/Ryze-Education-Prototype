
import React from 'react';
import { Facebook, Instagram, Linkedin, Mail, Phone, MapPin, ArrowUp } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'framer-motion';

const WhatsappIcon = ({ size = 24, className }: { size?: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" /><path d="M17.5 14.38c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.39-1.47-.89-.79-1.49-1.76-1.66-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.91-2.21-.24-.58-.49-.5-.67-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.72.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.42.25-.69.25-1.29.17-1.42-.07-.12-.27-.2-.57-.34z" /></svg>
);

const Footer: React.FC = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const isRyzeAi = location.pathname === '/ryze-ai';
  if (isRyzeAi) return null; // Do not render footer on Ryze AI page

  const socialLinks = [
    { Icon: Facebook, href: "https://www.facebook.com/people/Ryze-Education/61583067491158/" },
    { Icon: Instagram, href: "https://www.instagram.com/ryzeeducation/" },
    { Icon: Linkedin, href: "https://www.linkedin.com/company/ryze-education" },
    { Icon: WhatsappIcon, href: "https://api.whatsapp.com/message/6GUJFT6GY2DHG1?autoload=1&app_absent=0" },
  ];

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="bg-black text-gray-300 pt-24 pb-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="absolute top-8 right-8">
          <motion.button 
            onClick={scrollToTop} 
            whileHover={{ scale: 1.1, y: -5 }} 
            whileTap={{ scale: 0.9 }} 
            className="w-14 h-14 rounded-full bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-yellow-400 hover:bg-yellow-400/20 hover:shadow-[0_0_20px_rgba(255,255,100,0.3)] transition-all duration-300"
            aria-label="Scroll to top"
          >
            <ArrowUp size={24} />
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-20">
          
          <div className="lg:col-span-4 space-y-5">
            <Link to="/">
              <img src="https://res.cloudinary.com/dsvjhemjd/image/upload/v1764105292/yellow_logo_png_bvs11z.png" alt="Ryze Education" className="h-14 w-auto"/>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs font-light">
              {t("Education that sees you. Diagnosing gaps, building understanding, and creating confidence in every student.")}
            </p>
            <div className="flex gap-3 pt-2">
              {socialLinks.map(({ Icon, href }, i) => (
                <motion.a key={i} href={href} target="_blank" rel="noopener noreferrer" whileHover={{ y: -3, scale: 1.1 }} className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-800/60 text-gray-400 hover:text-yellow-400 hover:bg-gray-800 transition-colors duration-300">
                  <Icon size={20} />
                </motion.a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h4 className="font-semibold text-white mb-6 text-base tracking-wide">{t("Company")}</h4>
            <ul className="space-y-4 text-sm font-light text-gray-400">
              <li><Link to="/the-ryze-truth" className="hover:text-yellow-400 transition-colors">{t("The Ryze Truth")}</Link></li>
              <li><Link to="/meet-the-team" className="hover:text-yellow-400 transition-colors">{t("Meet Our Team")}</Link></li>
              <li><Link to="/how-ryze-works" className="hover:text-yellow-400 transition-colors">{t("How It Works")}</Link></li>
              <li><Link to="/testimonials" className="hover:text-yellow-400 transition-colors">{t("Our Success Stories")}</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="font-semibold text-white mb-6 text-base tracking-wide">{t("Resources")}</h4>
            <ul className="space-y-4 text-sm font-light text-gray-400">
              <li><Link to="/pricing" className="hover:text-yellow-400 transition-colors">{t("Pricing")}</Link></li>
              <li><Link to="/login" className="hover:text-yellow-400 transition-colors">{t("Dashboard Login")}</Link></li>
              <li><Link to="/contact" className="hover:text-yellow-400 transition-colors">{t("Contact Us")}</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-4">
            <h4 className="font-semibold text-white mb-6 text-base tracking-wide">{t("Get in Touch")}</h4>
            <div className="space-y-4 font-light text-gray-400">
                <a href="mailto:ryzeeducationgroup@gmail.com" className="flex items-center gap-3 hover:text-yellow-400 transition-colors"><Mail size={18} className="text-yellow-400/80" /> ryzeeducationgroup@gmail.com</a>
                <a href="tel:+61413885839" className="flex items-center gap-3 hover:text-yellow-400 transition-colors"><Phone size={18} className="text-yellow-400/80" /> +61 413 885 839</a>
                <p className="flex items-start gap-3"><MapPin size={18} className="text-yellow-400/80 mt-1 shrink-0" /> Sydney, NSW Australia</p>
            </div>
          </div>

        </div>

        <div className="border-t border-gray-800/60 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Ryze Education. All Rights Reserved.
          </p>
          <div className="flex space-x-6 text-xs text-gray-500">
            <Link to="/privacy" className="hover:text-yellow-400 transition-colors">{t("Privacy Policy")}</Link>
            <Link to="/terms" className="hover:text-yellow-400 transition-colors">{t("Terms & Conditions")}</Link>
            <Link to="/sitemap" className="hover:text-yellow-400 transition-colors">{t("Sitemap")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
