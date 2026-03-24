import React, { useEffect } from 'react';
import { Phone, ArrowRight, Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { FadeInSection, InteractiveLift } from '../src/components/animation';
import { useContactForm } from '../src/hooks/useContactForm';
import { trackPhoneClick } from '../src/lib/tracking';
import { applySeo } from '../src/utils/seo';
import { ROUTES } from '../src/constants/routes';

const Contact: React.FC = () => {
  const { t } = useLanguage();
  const { formData, status, errorMessage, handleChange, handleSubmit, resetForm } = useContactForm({
    page: 'contact',
    subjectPrefix: 'New Enquiry',
  });

  const handlePhoneClick = () => trackPhoneClick('contact', 'contact_speak_now');

  useEffect(() => {
    applySeo({
      title: 'Contact Ryze Education | Sydney Maths Tutoring',
      description:
        'Speak with Ryze Education about private tutoring, small-group maths classes, and the right program for your child in Sydney.',
      path: ROUTES.CONTACT,
      ogTitle: 'Contact Ryze Education',
      ogDescription:
        'Book a consultation or send an enquiry about private tutoring and small-group maths programs in Sydney.',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        name: 'Contact Ryze Education',
        url: `${window.location.origin}${ROUTES.CONTACT}`,
      },
    });
  }, []);

  return (
        <div className="ryze-page">
          <div className="relative isolate overflow-hidden pt-20">
            {/* Background Image and Overlay Layer */}
            <img
              src="https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto,w_1280/ryze/images/home-background-overlayv2"
              srcSet="
                https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto,w_640/ryze/images/home-background-overlayv2 640w,
                https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto,w_960/ryze/images/home-background-overlayv2 960w,
                https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto,w_1280/ryze/images/home-background-overlayv2 1280w,
                https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto,w_1440/ryze/images/home-background-overlayv2 1440w
              "
              sizes="100vw"
              width={1440}
              height={900}
              fetchPriority="high"
              loading="eager"
              decoding="async"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,21,29,0.72),rgba(17,21,29,0.82))]" />

            {/* Content Layer */}
            <div className="relative">
              <div className="pb-20 pt-24 px-4">
                <div className="max-w-4xl mx-auto text-center">
                  <h1 className="ryze-heading-1 ryze-text-inverse mb-6">{t("Get in Touch")}</h1>
                  <p className="text-xl font-light text-[rgba(248,243,234,0.8)]">
                    {t("Ready to experience the Ryze difference? Have questions? We'd love to chat with you.")}
                  </p>
                </div>
              </div>

              <div className="px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto -mt-32">
                  
                  {/* Card 1: Speak Now */}
                  <InteractiveLift as="article" className="bg-[rgba(17,21,29,0.72)] backdrop-blur-md rounded-[2.5rem] shadow-xl p-12 flex flex-col items-center text-center border border-white/14 h-full group">
                      <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-ryze)] text-[var(--accent-foreground)] shadow-lg shadow-[rgba(255,176,0,0.16)] transition-transform group-hover:scale-110">
                        <Phone size={32} />
                      </div>
                      <h2 className="ryze-heading-3 ryze-text-inverse mb-4">{t("Prefer to Speak Now?")}</h2>
                      
                      <p className="ryze-text-inverse-muted mb-12 text-lg font-normal leading-relaxed">
                        {t("Sometimes it's just easier to talk. Call us directly and we'll help you out.")}
                      </p>

                      <a href="tel:+61413885839" onClick={handlePhoneClick} className="mt-auto flex w-full items-center justify-center gap-3 rounded-2xl border border-[rgba(255,176,0,0.38)] bg-[rgba(255,176,0,0.12)] py-5 font-bold text-[#fff5db] shadow-lg transition-[transform,background-color,border-color,color,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-px hover:bg-[var(--color-ryze)] hover:text-[var(--accent-foreground)] hover:shadow-[0_22px_44px_-26px_rgba(184,132,30,0.42)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]">
                        Give us a call <Phone size={20} fill="currentColor" />
                      </a>
                  </InteractiveLift>

                  {/* Card 2: Message Us */}
                  <InteractiveLift as="article" className="bg-[rgba(17,21,29,0.72)] backdrop-blur-md rounded-[2.5rem] shadow-xl p-12 flex flex-col items-center text-center border border-white/14 h-full group">
                      <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-[rgba(243,231,201,0.92)] text-[var(--accent)] transition-[background-color,color,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:bg-[rgba(255,176,0,0.18)] group-hover:text-[#fff5db] group-hover:scale-105">
                        <Send size={32} />
                      </div>
                      <h2 className="ryze-heading-3 ryze-text-inverse mb-4">{t("Message Us")}</h2>
                      
                      <p className="ryze-text-inverse-muted mb-12 text-lg font-normal leading-relaxed">
                        {t("Send us your question or request a call back at a time that suits you.")}
                      </p>

                      <button 
                        type="button"
                        onClick={() => {
                          const formElement = document.getElementById('contact-form-section');
                          const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                          formElement?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
                        }}
                        className="mt-auto flex w-full items-center justify-center gap-3 rounded-2xl border border-white/20 bg-white/6 py-5 font-bold text-[rgba(248,243,234,0.84)] transition-[transform,background-color,border-color,color,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-px hover:border-[rgba(255,176,0,0.34)] hover:bg-[rgba(243,231,201,0.14)] hover:text-[#fff5db] hover:shadow-[0_22px_44px_-28px_rgba(17,21,29,0.32)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                      >
                        {t("Send Message")} <ArrowRight size={20} />
                      </button>
                  </InteractiveLift>

                </div>
              </div>

              {/* Contact Form Section */}
              <FadeInSection as="section" id="contact-form-section" className="ryze-section-padding">
                 <div className="max-w-2xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h3 className="ryze-heading-1 ryze-text-inverse mb-6 whitespace-nowrap">{t("Send us a Message")}</h3>
                        <p className="text-xl font-light text-[rgba(248,243,234,0.8)]">{t("We typically respond within 24 hours.")}</p>
                    </div>
                    
                    {status === 'success' ? (
                      <div className="bg-green-900/50 backdrop-blur-md border border-green-400 rounded-[2rem] p-10 text-center animate-in fade-in zoom-in duration-300">
                         <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 size={40} />
                         </div>
                         <h4 className="mb-4 ryze-heading-3 ryze-text-inverse">{t("Message Sent!")}</h4>
                         <p className="text-green-200 mb-8 max-w-md mx-auto">
                            {t("Thanks for reaching out to Ryze. We've received your enquiry and will be in touch with you shortly.")}
                         </p>
                         <button
                            type="button"
                            onClick={resetForm}
                            className="rounded-xl border border-slate-600 ryze-bg-surface-dark px-8 py-3 font-sans text-base font-semibold ryze-text-inverse transition-colors hover:bg-slate-700"
                         >
                            {t("Send Another Message")}
                         </button>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="relative space-y-6 font-sans">
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
                              <label htmlFor="name" className="block font-sans text-sm font-semibold uppercase tracking-[0.12em] text-slate-200">{t("Name")}</label>
                              <input
                                type="text"
                                id="name"
                                name="name"
                                required
                                maxLength={100}
                                value={formData.name}
                                onChange={handleChange}
                                disabled={status === 'sending'}
                                className="w-full rounded-2xl border border-white/22 bg-black/18 px-6 py-4 font-sans text-[1.02rem] font-medium ryze-text-inverse outline-none transition-all placeholder:font-sans placeholder:text-[rgba(248,243,234,0.56)] focus:border-[var(--color-ryze)] focus:bg-black/30 focus:ring-2 focus:ring-[rgba(255,176,0,0.16)] disabled:cursor-not-allowed disabled:opacity-70"
                                placeholder={t("Your Full Name")}
                              />
                            </div>
                            <div className="space-y-2">
                              <label htmlFor="email" className="block font-sans text-sm font-semibold uppercase tracking-[0.12em] text-slate-200">{t("Email")}</label>
                              <input
                                type="email"
                                id="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                disabled={status === 'sending'}
                                className="w-full rounded-2xl border border-white/22 bg-black/18 px-6 py-4 font-sans text-[1.02rem] font-medium ryze-text-inverse outline-none transition-all placeholder:font-sans placeholder:text-[rgba(248,243,234,0.56)] focus:border-[var(--color-ryze)] focus:bg-black/30 focus:ring-2 focus:ring-[rgba(255,176,0,0.16)] disabled:cursor-not-allowed disabled:opacity-70"
                                placeholder={t("email@address.com")}
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <label htmlFor="phone" className="block font-sans text-sm font-semibold uppercase tracking-[0.12em] text-slate-200">{t("Phone")}</label>
                            <input
                              type="tel"
                              id="phone"
                              name="phone"
                              maxLength={20}
                              value={formData.phone}
                              onChange={handleChange}
                              disabled={status === 'sending'}
                              className="w-full rounded-2xl border border-white/22 bg-black/18 px-6 py-4 font-sans text-[1.02rem] font-medium ryze-text-inverse outline-none transition-all placeholder:font-sans placeholder:text-[rgba(248,243,234,0.56)] focus:border-[var(--color-ryze)] focus:bg-black/30 focus:ring-2 focus:ring-[rgba(255,176,0,0.16)] disabled:cursor-not-allowed disabled:opacity-70"
                              placeholder={t("Mobile Number")}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label htmlFor="message" className="block font-sans text-sm font-semibold uppercase tracking-[0.12em] text-slate-200">{t("Message")}</label>
                                <span className={`font-sans text-xs font-medium ${formData.message.length >= 2000 ? 'text-red-500' : 'ryze-text-muted'}`}>
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
                              className="w-full resize-none rounded-2xl border border-white/22 bg-black/18 px-6 py-4 font-sans text-[1.02rem] font-medium ryze-text-inverse outline-none transition-all placeholder:font-sans placeholder:text-[rgba(248,243,234,0.56)] focus:border-[var(--color-ryze)] focus:bg-black/30 focus:ring-2 focus:ring-[rgba(255,176,0,0.16)] disabled:cursor-not-allowed disabled:opacity-70"
                              placeholder={t("How can we help you?")}
                            ></textarea>
                          </div>

                          <InteractiveLift as="div" className="w-full">
                            <button
                              type="submit"
                              disabled={status === 'sending'}
                              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[var(--color-ryze)] py-5 font-sans text-lg font-semibold text-[var(--accent-foreground)] shadow-xl shadow-[rgba(255,176,0,0.18)] transition-all hover:bg-[#ffc133] active:scale-95 focus:outline-none focus:ring-4 focus:ring-[rgba(255,176,0,0.2)] disabled:cursor-not-allowed disabled:opacity-70 disabled:transform-none disabled:active:scale-100"
                            >
                              {status === 'sending' ? (
                                <>
                                  <Loader2 size={24} className="animate-spin" /> {t("Sending...")}
                                </>
                              ) : (
                                <>{t("Submit Enquiry")}</>
                              )}
                            </button>
                          </InteractiveLift>
                      </form>
                    )}
                 </div>
              </FadeInSection>
            </div>
          </div>
        </div>
  );
};

export default Contact;
