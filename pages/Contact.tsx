
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, ArrowRight, Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const pageVariants = {
    initial: {
        opacity: 0,
    },
    animate: {
        opacity: 1,
        transition: {
            duration: 0.5,
            ease: 'easeInOut'
        }
    },
    exit: {
        opacity: 0,
        transition: {
            duration: 0.5,
            ease: 'easeInOut'
        }
    }
};

const Contact: React.FC = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    honey: '' // Honeypot field
  });

  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  };

  const validatePhone = (phone: string) => {
    const stripped = phone.replace(/[\s\-]/g, '');
    return /^\+?[\d]{8,15}$/.test(stripped);
  };

  const handlePhoneClick = async () => {
    try {
      await fetch('/api/meta-conversion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventName: 'Lead',
          userAgent: navigator.userAgent,
          sourceUrl: window.location.href,
        }),
      });
    } catch (capiError) {
      console.error('Meta CAPI (Lead) submission error:', capiError);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(''); 
    
    if (formData.honey) {
      setStatus('success');
      setFormData({ name: '', email: '', phone: '', message: '', honey: '' });
      return;
    }

    if (!validateEmail(formData.email)) {
      setStatus('error');
      setErrorMessage(t('Please enter a valid email address (e.g. name@example.com)'));
      return;
    }

    if (!validatePhone(formData.phone)) {
        setStatus('error');
        setErrorMessage(t('Please enter a valid phone number (e.g. 0412 345 678)'));
        return;
    }

    setStatus('sending');

    try {
      const response = await fetch("https://formsubmit.co/ryzeeducationhq@gmail.com", {
        method: "POST",
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          _subject: `New Enquiry from ${formData.name}`,
          _template: 'table',
          _captcha: 'false',
          _honey: ''
        })
      });

      if (response.ok) {
        setStatus('success');
        
        // --- META CAPI INTEGRATION ---
        try {
          await fetch('/api/meta-conversion', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              eventName: 'Contact',
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              userAgent: navigator.userAgent,
              sourceUrl: window.location.href,
            }),
          });
        } catch (capiError) {
          console.error('Meta CAPI submission error:', capiError);
        }
        // --- END META CAPI INTEGRATION ---

        setFormData({ name: '', email: '', phone: '', message: '', honey: '' });

      } else {
        setStatus('error');
        setErrorMessage('');
      }
    } catch (error) {
      console.error("Submission error:", error);
      setStatus('error');
      setErrorMessage('');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (status === 'error') setStatus('idle');
  };

  return (
    <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
    >
        <div className="font-sans">
          <div className="relative pt-20">
            {/* Background Image and Overlay Layer */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-fixed"
              style={{ backgroundImage: `url('/images/home-background-overlayv2.png')` }}
            />
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Content Layer */}
            <div className="relative">
              <div className="pb-20 pt-24 px-4">
                <div className="max-w-4xl mx-auto text-center">
                  <h1 className="text-5xl md:text-7xl font-sans font-bold text-white mb-6 tracking-tight">{t("Get in Touch")}</h1>
                  <p className="text-xl font-light text-slate-200">
                    {t("Ready to experience the Ryze difference? Have questions? We'd love to chat with you.")}
                  </p>
                </div>
              </div>

              <div className="px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto -mt-32">
                  
                  {/* Card 1: Speak Now */}
                  <div className="bg-slate-900/60 backdrop-blur-md rounded-[2.5rem] shadow-xl p-12 flex flex-col items-center text-center border border-white/20 h-full hover:-translate-y-2 transition-transform duration-300 group">
                      <div className="w-20 h-20 bg-ryze rounded-full flex items-center justify-center text-white mb-8 shadow-lg shadow-ryze/30 group-hover:scale-110 transition-transform">
                        <Phone size={32} />
                      </div>
                      <h2 className="text-3xl font-bold text-white mb-4">{t("Prefer to Speak now?")}</h2>
                      
                      <p className="text-slate-300 mb-12 text-lg font-normal leading-relaxed">
                        {t("Sometimes it's just easier to talk. Call us directly and we'll help you out.")}
                      </p>

                      <a href="tel:+61413885839" onClick={handlePhoneClick} className="mt-auto w-full py-5 bg-white/0 text-white font-bold rounded-2xl hover:bg-ryze hover:text-white transition-all flex items-center border border-white justify-center gap-3 shadow-lg">
                        Give us a call! <Phone size={20} fill="currentColor" />
                      </a>
                  </div>

                  {/* Card 2: Message Us */}
                  <div className="bg-slate-900/60 backdrop-blur-md rounded-[2.5rem] shadow-xl p-12 flex flex-col items-center text-center border border-white/20 h-full hover:-translate-y-2 transition-transform duration-300 group">
                      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 mb-8 group-hover:bg-slate-200 transition-colors">
                        <Send size={32} />
                      </div>
                      <h2 className="text-3xl font-bold text-white mb-4">{t("Message Us")}</h2>
                      
                      <p className="text-slate-300 mb-12 text-lg font-normal leading-relaxed">
                        {t("Send us your question or request a call back at a time that suits you.")}
                      </p>

                      <button 
                        onClick={() => {
                          const formElement = document.getElementById('contact-form-section');
                          formElement?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="mt-auto w-full py-5 bg-transparent border-2 border-slate-300 text-slate-300 font-bold rounded-2xl hover:bg-slate-700 hover:text-white transition-all flex items-center justify-center gap-3"
                      >
                        {t("Send Message")} <ArrowRight size={20} />
                      </button>
                  </div>

                </div>
              </div>

              {/* Contact Form Section */}
              <section id="contact-form-section" className="py-24">
                 <div className="max-w-2xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h3 className="text-3xl font-bold text-white mb-4">{t("Send us a Message")}</h3>
                        <p className="text-slate-300">{t("We typically respond within 24 hours.")}</p>
                    </div>
                    
                    {status === 'success' ? (
                      <div className="bg-green-900/50 backdrop-blur-md border border-green-400 rounded-[2rem] p-10 text-center animate-in fade-in zoom-in duration-300">
                         <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 size={40} />
                         </div>
                         <h4 className="text-2xl font-bold text-white mb-4">{t("Message Sent!")}</h4>
                         <p className="text-green-200 mb-8 max-w-md mx-auto">
                            {t("Thanks for reaching out to Ryze. We've received your enquiry and will be in touch with you shortly.")}
                         </p>
                         <button 
                            onClick={() => setStatus('idle')}
                            className="px-8 py-3 bg-slate-800 border border-slate-600 text-white font-bold rounded-xl hover:bg-slate-700 transition-colors"
                         >
                            {t("Send Another Message")}
                         </button>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-6 relative">
                          {status === 'error' && (
                            <div className="bg-red-900/50 text-red-300 p-4 rounded-xl flex items-center gap-3 border border-red-500 mb-6 animate-in fade-in slide-in-from-top-2">
                               <AlertCircle size={20} className="shrink-0" />
                               <span className="font-medium">
                                 {t(errorMessage || "Something went wrong. Please try again or call us directly.")}
                               </span>
                            </div>
                          )}

                          {/* Honeypot Field - Hidden from humans */}
                          <input 
                            type="text" 
                            name="honey" 
                            value={formData.honey}
                            onChange={handleChange}
                            style={{ display: 'none' }}
                            tabIndex={-1}
                            autoComplete="off"
                          />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label htmlFor="name" className="block text-sm font-bold text-slate-200 uppercase tracking-wider">{t("Name")}</label>
                              <input
                                type="text"
                                id="name"
                                name="name"
                                required
                                maxLength={100}
                                value={formData.name}
                                onChange={handleChange}
                                disabled={status === 'sending'}
                                className="w-full px-6 py-4 rounded-2xl bg-black/20 border-2 border-white/50 text-white focus:border-ryze focus:bg-black/30 outline-none transition-all font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                                placeholder={t("Your Full Name")}
                              />
                            </div>
                            <div className="space-y-2">
                              <label htmlFor="email" className="block text-sm font-bold text-slate-200 uppercase tracking-wider">{t("Email")}</label>
                              <input
                                type="email"
                                id="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                disabled={status === 'sending'}
                                className="w-full px-6 py-4 rounded-2xl bg-black/20 border-2 border-white/50 text-white focus:border-ryze focus:bg-black/30 outline-none transition-all font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                                placeholder={t("email@address.com")}
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <label htmlFor="phone" className="block text-sm font-bold text-slate-200 uppercase tracking-wider">{t("Phone")}</label>
                            <input
                              type="tel"
                              id="phone"
                              name="phone"
                              maxLength={20}
                              value={formData.phone}
                              onChange={handleChange}
                              disabled={status === 'sending'}
                              className="w-full px-6 py-4 rounded-2xl bg-black/20 border-2 border-white/50 text-white focus:border-ryze focus:bg-black/30 outline-none transition-all font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                              placeholder={t("Mobile Number")}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label htmlFor="message" className="block text-sm font-bold text-slate-200 uppercase tracking-wider">{t("Message")}</label>
                                <span className={`text-xs font-medium ${formData.message.length >= 2000 ? 'text-red-500' : 'text-slate-400'}`}>
                                    {formData.message.length}/2000
                                </span>
                            </div>
                            <textarea
                              id="message"
                              name="message"
                              rows={6}
                              required
                              maxLength={2000}
                              value={formData.message}
                              onChange={handleChange}
                              disabled={status === 'sending'}
                              className="w-full px-6 py-4 rounded-2xl bg-black/20 border-2 border-white/50 text-white focus:border-ryze focus:bg-black/30 outline-none transition-all font-medium resize-none disabled:opacity-70 disabled:cursor-not-allowed"
                              placeholder={t("How can we help you?")}
                            ></textarea>
                          </div>

                          <button
                            type="submit"
                            disabled={status === 'sending'}
                            className="w-full bg-ryze text-white font-bold py-5 rounded-2xl shadow-xl hover:bg-ryze-600 hover:-translate-y-1 active:scale-95 active:bg-ryze-700 focus:outline-none focus:ring-4 focus:ring-ryze/20 transition-all text-lg flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:active:scale-100"
                          >
                            {status === 'sending' ? (
                              <>
                                <Loader2 size={24} className="animate-spin" /> {t("Sending...")}
                              </>
                            ) : (
                              <>{t("Submit Enquiry")}</>
                            )}
                          </button>
                      </form>
                    )}
                 </div>
              </section>
            </div>
          </div>
        </div>
    </motion.div>
  );
};

export default Contact;
