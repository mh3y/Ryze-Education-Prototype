
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronRight, Zap, ChevronDown, ArrowRight, LogIn, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

const aboutSubLinks = [
  { name: 'The Ryze Truth', path: '/the-ryze-truth', desc: "Our philosophy and story" },
  { name: 'How Ryze Works', path: '/how-ryze-works', desc: "Our process from A-Z" },
  { name: 'Our Success Stories', path: '/testimonials', desc: "Real student results" },
];

const AnimatedNavLink = ({ to, children, isActive }: { to: string; children: React.ReactNode; isActive: boolean }) => (
  <NavLink to={to} className="relative text-sm font-medium text-gray-300 hover:text-white transition-colors duration-300">
    {children}
    {isActive && <motion.div layoutId="nav-underline" className="absolute bottom-[-8px] left-0 right-0 h-[2px] bg-yellow-400" />}
  </NavLink>
);

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { language, toggleLanguage, t } = useLanguage();

  const isAiPage = location.pathname === '/ryze-ai';
  const isPortalPage = ['/login', '/admin', '/portal', '/parent-portal', '/tutor-portal'].includes(location.pathname);
  const useModernDesign = !isPortalPage && !isAiPage;

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navClasses = `fixed w-full z-50 transition-all duration-300 ease-in-out ${
    scrolled || !useModernDesign
      ? isAiPage || isPortalPage 
        ? 'bg-[#050510]/80 backdrop-blur-xl border-b border-white/10 py-3' 
        : 'bg-black/80 backdrop-blur-xl border-b border-gray-800/60 py-3'
      : 'bg-transparent border-b border-transparent py-5'
  }`;

  const linkColor = isAiPage || isPortalPage ? 'text-slate-300 hover:text-white' : 'text-gray-300 hover:text-white';

  return (
    <nav className={navClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
            <NavLink to="/" className="flex-shrink-0 group z-50" onClick={() => setIsOpen(false)}>
              <img 
                src="https://res.cloudinary.com/dsvjhemjd/image/upload/v1764105292/yellow_logo_png_bvs11z.png" 
                alt="Ryze Education" 
                className={`h-12 w-auto transition-all duration-300 ${isAiPage || isPortalPage ? 'brightness-0 invert' : ''}`}
              />
            </NavLink>
          </motion.div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <div onMouseEnter={() => setAboutDropdownOpen(true)} onMouseLeave={() => setAboutDropdownOpen(false)} className="relative">
              <button className={`flex items-center gap-1.5 ${linkColor} text-sm font-medium`}>
                {t('About')} <ChevronDown size={16} className={`transition-transform duration-300 ${aboutDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {aboutDropdownOpen && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.3, ease: "easeOut" }} className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-max">
                    <div className="bg-gray-900/90 backdrop-blur-xl border border-gray-700/80 rounded-2xl shadow-2xl p-4 grid grid-cols-1 gap-1">
                      {aboutSubLinks.map((link) => (
                        <NavLink key={link.path} to={link.path} className={({ isActive }) => `group block px-4 py-3 rounded-xl transition-colors duration-200 ${isActive ? 'bg-yellow-400/10' : 'hover:bg-gray-800/70'}`}>
                          <p className={`text-sm font-semibold ${location.pathname === link.path ? 'text-yellow-400' : 'text-white'}`}>{t(link.name)}</p>
                          <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-200">{t(link.desc)}</p>
                        </NavLink>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AnimatedNavLink to="/meet-the-team" isActive={location.pathname === '/meet-the-team'}>{t('Meet Our Team')}</AnimatedNavLink>
            <AnimatedNavLink to="/ryze-ai" isActive={location.pathname === '/ryze-ai'}>
               <span className="flex items-center gap-1.5">
                 {t('Ryze AI')} 
                 <Zap size={14} className="text-yellow-400 fill-current" />
               </span>
            </AnimatedNavLink>
            <AnimatedNavLink to="/pricing" isActive={location.pathname === '/pricing'}>{t('Pricing')}</AnimatedNavLink>

            <div className="w-px h-5 bg-gray-700/80 mx-2"></div>

            <motion.button onClick={() => navigate('/login')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white">
              <LogIn size={16} /> {t('Login')}
            </motion.button>
            <motion.button onClick={() => navigate('/contact')} whileHover={{ y: -2 }} transition={{ duration: 0.2}} className="px-5 py-2.5 bg-yellow-400 text-black text-sm font-bold rounded-full shadow-[0_0_20px_rgba(255,255,100,0.2)] hover:shadow-[0_0_30px_rgba(255,255,100,0.4)] transition-shadow duration-300">
              {t('Book a Trial')}
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden z-50">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-full text-gray-300 hover:text-white hover:bg-gray-800/70 transition-colors duration-300">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl md:hidden">
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="absolute top-0 right-0 h-full w-full max-w-sm bg-gray-900/95 border-l border-gray-800 p-6 flex flex-col">
              <div className="flex-grow mt-16">
                <div className="border-b border-gray-800 pb-4 mb-4">
                  <button onClick={() => setMobileAboutOpen(!mobileAboutOpen)} className="w-full flex justify-between items-center text-lg font-semibold text-white py-2">
                    {t('About')} <ChevronDown size={20} className={`transition-transform duration-300 ${mobileAboutOpen ? 'rotate-180 text-yellow-400' : ''}`} />
                  </button>
                  <AnimatePresence>
                  {mobileAboutOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="pt-2 space-y-1">
                        {aboutSubLinks.map(link => (
                          <NavLink key={link.path} to={link.path} onClick={() => setIsOpen(false)} className={({isActive}) => `block pl-4 py-2.5 rounded-lg text-base font-medium ${isActive ? 'text-yellow-400 bg-yellow-400/10' : 'text-gray-300 hover:bg-gray-800'}`}>
                            {t(link.name)}
                          </NavLink>
                        ))}
                      </div>
                    </motion.div>
                  )}
                  </AnimatePresence>
                </div>
                <NavLink to="/meet-the-team" onClick={() => setIsOpen(false)} className={({isActive}) => `block py-3 text-lg font-semibold ${isActive ? 'text-yellow-400' : 'text-white'}`}> {t('Meet Our Team')} </NavLink>
                <NavLink to="/ryze-ai" onClick={() => setIsOpen(false)} className={({isActive}) => `flex items-center gap-2 py-3 text-lg font-semibold ${isActive ? 'text-yellow-400' : 'text-white'}`}> {t('Ryze AI')} <Zap size={18} className="text-yellow-400" /> </NavLink>
                <NavLink to="/pricing" onClick={() => setIsOpen(false)} className={({isActive}) => `block py-3 text-lg font-semibold ${isActive ? 'text-yellow-400' : 'text-white'}`}> {t('Pricing')} </NavLink>
              </div>
              <div className="space-y-4">
                <button onClick={() => { navigate('/login'); setIsOpen(false); }} className="w-full py-3.5 bg-gray-800 text-white rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-colors hover:bg-gray-700"> <LogIn size={18} /> {t('Login')} </button>
                <button onClick={() => { navigate('/contact'); setIsOpen(false); }} className="w-full py-4 bg-yellow-400 text-black rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-100"> {t('Book a Trial Lesson')} <ArrowRight size={18} /> </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
