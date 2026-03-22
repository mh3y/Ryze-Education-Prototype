import React from 'react';
import { Phone } from 'lucide-react';

type SalesBannerProps = {
  onPhoneClick: () => void;
};

const SalesBanner: React.FC<SalesBannerProps> = ({ onPhoneClick }) => (
  <div className="sticky top-0 z-50 border-b border-[rgba(184,132,30,0.24)] bg-[rgba(23,29,40,0.92)] ryze-text-inverse text-center p-2.5 sm:p-3 shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-500">
    <div className="ryze-container">
      <p className="font-semibold text-xs sm:text-sm md:text-base leading-relaxed">
        Save up to 50% through early enrolment, multiple subjects, upfront payments, and referrals.
        <a href="tel:+61413885839" onClick={onPhoneClick} className="underline hover:text-[var(--ryze-200)] font-bold ml-1 sm:ml-2 inline-flex items-center gap-1 sm:gap-1.5">
          Call us!
          <Phone size={14} className="sm:hidden" />
          <Phone size={16} className="hidden sm:inline" />
        </a>
      </p>
    </div>
  </div>
);

export default SalesBanner;
