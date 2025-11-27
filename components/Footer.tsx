
import React, { useState } from 'react';
import { Facebook, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

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

  return (
    <footer className="bg-white pt-20 pb-10 border-t border-slate-100">
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
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs font-medium">
              Education that sees you. Diagnosing gaps, building understanding, and creating confidence in every student.
            </p>
            <div className="flex gap-4 pt-2">
              {socialLinks.map(({ Icon, href }, i) => (
                <a 
                  key={i} 
                  href={href} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-ryze hover:text-white transition-all duration-300"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-2">
            <h4 className="font-bold text-slate-900 mb-6 text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-4 text-sm text-slate-500 font-medium">
              <li><Link to="/the-ryze-truth" className="hover:text-ryze transition-colors flex items-center gap-1">The Ryze Truth</Link></li>
              <li><Link to="/meet-the-team" className="hover:text-ryze transition-colors">Meet the Team</Link></li>
              <li><Link to="/how-it-works" className="hover:text-ryze transition-colors">Methodology</Link></li>
              <li><Link to="/ryze-ai" className="hover:text-ryze transition-colors flex items-center gap-2">Ryze AI <span className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded font-bold">NEW</span></Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="font-bold text-slate-900 mb-6 text-sm uppercase tracking-wider">Resources</h4>
            <ul className="space-y-4 text-sm text-slate-500 font-medium">
              <li><Link to="/pricing" className="hover:text-ryze transition-colors">Pricing</Link></li>
              <li><Link to="/contact" className="hover:text-ryze transition-colors">Contact Support</Link></li>
              <li><Link to="/portal" className="hover:text-ryze transition-colors">Student Portal</Link></li>
              <li><Link to="/parent-portal" className="hover:text-ryze transition-colors">Parent Portal</Link></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="lg:col-span-4">
            <h4 className="font-bold text-slate-900 mb-6 text-sm uppercase tracking-wider">Contact</h4>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-ryze shrink-0 mt-1" />
                <span className="text-sm text-slate-600 font-medium">Sydney, NSW Australia</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-ryze shrink-0" />
                <a href="tel:+61413885839" className="text-sm text-slate-600 font-medium hover:text-ryze">+61 413 885 839</a>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-ryze shrink-0" />
                <a href="mailto:ryzeeducation@outlook.com" className="text-sm text-slate-600 font-medium hover:text-ryze">ryzeeducation@outlook.com</a>
              </div>
            </div>
          </div>

        </div>

        <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-400 font-medium">
            © {new Date().getFullYear()} Ryze Education. All rights reserved.
          </p>
          <div className="flex space-x-6 text-xs text-slate-400 font-medium">
            <Link to="/privacy" className="hover:text-ryze transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-ryze transition-colors">Terms and Conditions</Link>
            <Link to="/sitemap" className="hover:text-ryze transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
