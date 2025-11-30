import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Cookie } from 'lucide-react';

const CookieConsent: React.FC = () => {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('ryze_cookie_consent');
    if (!consent) {
      // Delay showing the banner slightly for better UX
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('ryze_cookie_consent', 'accepted');
    setIsVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem('ryze_cookie_consent', 'rejected');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 bg-[#0f172a]/95 backdrop-blur-md border-t border-white/10 shadow-2xl transition-all duration-500 animate-in slide-in-from-bottom-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1 flex items-start gap-4">
           <div className="p-3 bg-white/5 rounded-xl text-[#FFB000] shrink-0 border border-white/5 hidden md:block">
              <Cookie size={24} />
           </div>
           <div>
              <h3 className="text-white font-bold mb-1 text-sm md:text-base flex items-center gap-2">
                <Cookie size={18} className="md:hidden text-[#FFB000]" />
                {t("We value your privacy")}
              </h3>
              <p className="text-slate-400 text-xs md:text-sm leading-relaxed max-w-2xl">
                {t("We use cookies to enhance your browsing experience, serve personalised content, and analyse our traffic. By clicking \"Accept All\", you consent to our use of cookies.")}
                <span className="block mt-1 md:inline md:mt-0 md:ml-1 opacity-80">
                  {t("Read our")} <Link to="/privacy" className="text-[#FFB000] hover:underline">{t("Privacy Policy")}</Link> {t("to learn more.")}
                </span>
              </p>
           </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
           <button 
             onClick={handleReject}
             className="flex-1 md:flex-none px-6 py-2.5 rounded-xl border border-white/10 text-slate-300 text-sm font-medium hover:bg-white/5 hover:text-white transition-colors whitespace-nowrap"
           >
             {t("Reject All")}
           </button>
           <button 
             onClick={handleAccept}
             className="flex-1 md:flex-none px-6 py-2.5 rounded-xl bg-[#FFB000] text-[#050510] text-sm font-bold hover:bg-[#e6a000] transition-colors shadow-lg shadow-orange-500/10 whitespace-nowrap"
           >
             {t("Accept All")}
           </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;