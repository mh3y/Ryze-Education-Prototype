import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight, CheckCircle2, Loader2, Phone, Send } from 'lucide-react';
import PrimaryCTA from '../PrimaryCTA';
import { useContactForm } from '../../src/hooks/useContactForm';

type ContactSectionProps = {
  bgImage: string;
  onPhoneClick: () => void;
};

const ContactSection: React.FC<ContactSectionProps> = ({ bgImage, onPhoneClick }) => {
  const { formData, status, errorMessage, handleChange, handleSubmit } = useContactForm({
    page: 'maths_tutoring',
    subjectPrefix: 'New Enquiry',
  });

  return (
    <motion.div
      id="real-results-section"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={{
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.5, ease: 'easeInOut' } },
        exit: { opacity: 0, transition: { duration: 0.5, ease: 'easeInOut' } },
      }}
    >
      <div className="font-sans">
        <div className="relative isolate overflow-hidden pt-20">
          {/* Background Image and Overlay Layer */}
          <img
            src={bgImage}
            width={1440}
            height={900}
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            className="absolute inset-0 w-full h-full object-cover z-0"
            alt=""
            aria-hidden="true"
          />
          <div className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(17,21,29,0.72),rgba(17,21,29,0.82))]" />

          {/* Content Layer */}
          <div className="relative z-20">
            <div className="ryze-section-padding px-4">
              <div className="max-w-4xl mx-auto text-center">
                <h1 className="mb-4 sm:mb-6 ryze-heading-1 ryze-text-inverse">
                  Ready to see meaningful progress?
                </h1>
                <p className="text-base sm:text-lg md:text-xl font-light text-[rgba(248,243,234,0.8)] max-w-2xl mx-auto">
                  Talk with us about year level, goals, and whether private tutoring or a small-group class is
                  the right fit.
                </p>
              </div>
            </div>

            <div className="ryze-container ryze-section-padding">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-10 max-w-5xl mx-auto -mt-20 sm:-mt-28 md:-mt-32">
                {/* Card 1: Speak Now */}
                <div className="flex h-full flex-col items-center rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.5rem] border border-white/14 bg-[rgba(17,21,29,0.72)] p-6 sm:p-8 md:p-12 text-center shadow-xl backdrop-blur-md transition-transform duration-300 group hover:-translate-y-2">
                  <div className="mb-5 sm:mb-6 md:mb-8 flex h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 items-center justify-center rounded-full bg-[var(--color-ryze)] text-[var(--accent-foreground)] shadow-lg shadow-[rgba(255,176,0,0.16)] transition-transform group-hover:scale-110">
                    <Phone size={24} className="sm:hidden" />
                    <Phone size={32} className="hidden sm:block" />
                  </div>
                  <h2 className="mb-3 sm:mb-4 ryze-heading-3 ryze-text-inverse">Prefer to speak now?</h2>

                  <p className="mb-6 sm:mb-8 md:mb-12 text-base sm:text-lg font-normal leading-relaxed ryze-text-inverse-muted">
                    Sometimes it's just easier to talk. Call us directly and we'll help you out.
                  </p>

                  <PrimaryCTA
                    page="maths_tutoring"
                    placement="contact_speak_now"
                    styleVariant="dark"
                    icon="phone"
                    label="Give us a call"
                    href="tel:+61413885839"
                    className="mt-auto w-full"
                    onClick={onPhoneClick}
                  />
                </div>

                {/* Card 2: Message Us */}
                <div className="flex h-full flex-col items-center rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.5rem] border border-white/14 bg-[rgba(17,21,29,0.72)] p-6 sm:p-8 md:p-12 text-center shadow-xl backdrop-blur-md transition-transform duration-300 group hover:-translate-y-2">
                  <div className="mb-5 sm:mb-6 md:mb-8 flex h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 items-center justify-center rounded-full bg-[rgba(243,231,201,0.92)] text-[var(--accent)] transition-colors group-hover:bg-white">
                    <Send size={24} className="sm:hidden" />
                    <Send size={32} className="hidden sm:block" />
                  </div>
                  <h2 className="mb-3 sm:mb-4 ryze-heading-3 ryze-text-inverse">Message us</h2>

                  <p className="mb-6 sm:mb-8 md:mb-12 text-base sm:text-lg font-normal leading-relaxed ryze-text-inverse-muted">
                    Send us your question or request a call back at a time that suits you.
                  </p>

                  <PrimaryCTA
                    page="maths_tutoring"
                    placement="contact_message_us"
                    styleVariant="ghost"
                    label="Send Message"
                    href="#contact-form-section"
                    className="mt-auto w-full"
                  />
                </div>
              </div>
            </div>

            {/* Contact Form Section */}
            <section id="contact-form-section" className="ryze-section-padding">
              <div className="max-w-2xl mx-auto px-4">
                <div className="text-center mb-8 sm:mb-10 md:mb-12">
                  <h3 className="mb-3 sm:mb-4 ryze-heading-2 ryze-text-inverse">Send us a Message</h3>
                  <p className="text-sm sm:text-base text-[rgba(248,243,234,0.74)]">We typically respond within 24 hours.</p>
                </div>

                {status === 'success' ? (
                  <div className="animate-in fade-in zoom-in duration-300 rounded-[2rem] border border-[var(--ryze-success)] bg-[rgba(34,197,94,0.1)] p-10 text-center backdrop-blur-md">
                    <div className="w-20 h-20 bg-white/10 text-[var(--ryze-success)] rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 size={40} />
                    </div>
                    <h4 className="mb-4 ryze-heading-3 ryze-text-inverse">Message Sent!</h4>
                    <p className="mb-8 max-w-md mx-auto ryze-text-inverse-muted">
                      Thanks for reaching out to Ryze. We've received your enquiry and will be in touch with
                      you shortly.
                    </p>
                    <button
                      onClick={() => window.location.reload()}
                      className="ryze-cta-dark px-8 py-3"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="relative space-y-6 font-sans">
                    {status === 'error' && (
                      <div className="bg-[rgba(239,68,68,0.1)] ryze-text-error p-4 rounded-xl flex items-center gap-3 border border-[var(--ryze-error)] mb-6 animate-in fade-in slide-in-from-top-2">
                        <AlertCircle size={20} className="shrink-0" />
                        <span className="font-medium">
                          {errorMessage || 'Something went wrong. Please try again or call us directly.'}
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
                        <label
                          htmlFor="name"
                          className="ryze-form-label"
                        >
                          Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          required
                          maxLength={100}
                          value={formData.name}
                          onChange={handleChange}
                          disabled={status === 'sending'}
                          className="ryze-form-input"
                          placeholder="Your Full Name"
                        />
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="email"
                          className="ryze-form-label"
                        >
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          disabled={status === 'sending'}
                          className="ryze-form-input"
                          placeholder="email@address.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                        <label
                          htmlFor="phone"
                          className="ryze-form-label"
                        >
                          Phone
                        </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        maxLength={20}
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={status === 'sending'}
                        className="ryze-form-input"
                        placeholder="Mobile Number"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label
                          htmlFor="message"
                          className="ryze-form-label"
                        >
                          Message
                        </label>
                        <span
                          className={`font-sans text-xs font-medium ${formData.message.length >= 2000 ? 'ryze-text-error' : 'ryze-text-inverse-muted'}`}
                        >
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
                        className="ryze-form-input resize-none"
                        placeholder="How can we help you?"
                      ></textarea>
                    </div>

                    <PrimaryCTA
                      variant="button"
                      page="maths_tutoring"
                      placement="contact_form_submit"
                      styleVariant="primary"
                      label={status === 'sending' ? 'Sending...' : 'Submit Enquiry'}
                      className="w-full"
                      icon={status === 'sending' ? 'arrow' : 'arrow'}
                    />
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

export default ContactSection;
