import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaQuestionCircle, FaPlus, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';
import { Phone, ArrowRight, Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const LandingPage: React.FC = () => {
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
          setErrorMessage('Please enter a valid email address (e.g. name@example.com)');
          return;
        }
    
        if (!validatePhone(formData.phone)) {
            setStatus('error');
            setErrorMessage('Please enter a valid phone number (e.g. 0412 345 678)');
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
        <div className="bg-[#0D0D0D] text-white font-sans overflow-x-hidden">
            {/* Header */}
            <header className="container mx-auto px-6 py-6 flex justify-between items-center">
                <div className="text-3xl font-bold text-[#FFB000]">Ryze Education</div>
                <nav className="hidden md:flex items-center space-x-10">
                    <a href="#" className="hover:text-green-400 transition-colors text-lg">Features</a>
                    <a href="#" className="hover:text-green-400 transition-colors text-lg">How it works?</a>
                    <a href="#" className="hover:text-green-400 transition-colors text-lg">Testimonials</a>
                    <a href="#" className="hover:text-green-400 transition-colors text-lg">FAQ</a>
                </nav>
                <div>
                    <button className="border border-green-500 text-green-500 px-8 py-3 rounded-lg hover:bg-green-500 hover:text-black transition-colors font-semibold">
                        Sign up
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <main className="container mx-auto px-6 text-center pt-20 pb-16 relative">
                 {/* Background Glows */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-[150px]"></div>
                <div className="absolute top-1/4 right-0 w-96 h-96 bg-green-500/20 rounded-full blur-[150px]"></div>

                <div className="relative z-10">
                    <motion.h1 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className="text-5xl md:text-7xl font-bold leading-tight"
                    >
                        Become a straight <span className="relative inline-block">A+ <img src="https://res.cloudinary.com/dsvjhemjd/image/upload/v1769581194/tes8_rytlim.png" className="absolute bottom-0 left-0 w-full h-auto" alt="underline"/></span> student
                        <br />
                        with live tutoring
                    </motion.h1>
                    <motion.p 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeInOut" }}
                        className="text-lg md:text-xl text-gray-400 mt-8 max-w-2xl mx-auto"
                    >
                        Book 1.1 sessions with subjects matter experts that will unleash your true academic potential.
                    </motion.p>
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.4, ease: "easeInOut" }}
                        className="mt-12"
                    >
                        <button className="bg-green-500 text-black font-bold px-12 py-4 rounded-lg text-xl hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20">
                            Get Started for Free
                        </button>
                        <p className="text-gray-500 mt-5">Join 10K+ of other satisfied learners</p>
                    </motion.div>
                </div>
                 <div className="mt-24 text-gray-400 flex flex-wrap justify-center items-center gap-x-8 gap-y-2">
                    <span>+ English</span>
                    <span>+ Science</span>
                    <span>+ Maths</span>
                    <span>+ History</span>
                    <span>+ Geography</span>
                    <span>+ Civics</span>
                    <span>+ Economics</span>
                    <span>+ Physics</span>
                    <span>+ Chemistry</span>
                    <span>+ Biology</span>
                    <span>+ Accountancy</span>
                </div>
            </main>

            {/* Unlock Potential Section */}
            <section className="py-32">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-bold">Unlock your learning potential</h2>
                        <p className="text-lg text-gray-400 mt-4">We've crafted the platform to make sure you get the results you want</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-24 items-center">
                        <div className="space-y-16">
                            <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
                                <h3 className="text-3xl font-bold mb-4 text-green-400">1-to-1 Live Tutoring</h3>
                                <p className="text-gray-400 text-lg">Get undivided attention from top tutors in a live, interactive setting.</p>
                            </motion.div>
                             <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
                                <h3 className="text-3xl font-bold mb-4 text-green-400">Handpicked teacher</h3>
                                <p className="text-gray-400 text-lg">Our tutors are experts in their fields, dedicated to your success.</p>
                            </motion.div>
                             <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
                                <h3 className="text-3xl font-bold mb-4 text-green-400">Personalized Learning</h3>
                                <p className="text-gray-400 text-lg">Your learning plan is tailored to your unique needs and goals.</p>
                            </motion.div>
                        </div>
                        <div className="relative h-[500px] flex items-center justify-center">
                           <img src="https://res.cloudinary.com/dsvjhemjd/image/upload/v1764460809/588278725_1528730215077629_8325133640910985831_n_mr2y31.jpg" alt="Tutor 1" className="w-48 h-48 rounded-full object-cover absolute top-0 left-0 border-4 border-green-500 shadow-lg" />
                           <img src="https://res.cloudinary.com/dsvjhemjd/image/upload/v1769561928/869fcdd5dfa6efd8ee8853d9e0eea053_kiv4v2.jpg" alt="Tutor 2" className="w-64 h-64 rounded-full object-cover absolute border-4 border-purple-500 shadow-lg" />
                           <img src="https://res.cloudinary.com/dsvjhemjd/image/upload/v1769581194/gordon_rytlim.png" alt="Tutor 3" className="w-40 h-40 rounded-full object-cover absolute bottom-0 right-0 border-4 border-yellow-500 shadow-lg" />
                        </div>
                    </div>
                </div>
            </section>

             {/* Expertise Section */}
            <section className="py-24 bg-black">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold">Unmatched expertise at your fingertips</h2>
                    <p className="text-lg text-gray-400 mt-4">Be a part of the LandingPage success story, where numbers speak volumes about us</p>
                    <div className="grid md:grid-cols-4 gap-8 mt-16">
                        <div className="text-center p-8 border border-gray-800 rounded-2xl bg-gray-900/30">
                            <p className="text-5xl font-bold text-green-400">500</p>
                            <p className="text-gray-400 mt-2">students served & counting</p>
                        </div>
                        <div className="text-center p-8 border border-gray-800 rounded-2xl bg-gray-900/30">
                            <p className="text-5xl font-bold text-green-400">1500+</p>
                            <p className="text-gray-400 mt-2">certified tutors with subject expertise</p>
                        </div>
                        <div className="text-center p-8 border border-gray-800 rounded-2xl bg-gray-900/30">
                            <p className="text-5xl font-bold text-green-400">4.9/5</p>
                            <p className="text-gray-400 mt-2">Avg rating for tutor session</p>
                        </div>
                        <div className="text-center p-8 border border-gray-800 rounded-2xl bg-gray-900/30">
                            <p className="text-5xl font-bold text-green-400">100%</p>
                            <p className="text-gray-400 mt-2">students say their grades improved significantly</p>
                        </div>
                    </div>
                </div>
            </section>

             {/* Testimonials Section */}
            <section className="py-32">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-bold">Our students <span className="relative inline-block">love us<img src="https://res.cloudinary.com/dsvjhemjd/image/upload/v1769581194/tes8_rytlim.png" className="absolute bottom-0 left-0 w-full h-auto" alt="underline"/></span></h2>
                        <p className="text-lg text-gray-400 mt-4">Join over 10,000+ other students excelling in their academics with LandingPage</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div className="bg-gray-900/50 p-10 rounded-3xl border border-gray-800">
                             <p className="text-2xl italic text-gray-300">"As a Class 12 student preparing for board exams, I needed expert guidance. LandingPage connected me with a tutor who not only helped with my studies but also boosted my motivation. Highly recommend!"</p>
                            <div className="mt-8 flex items-center gap-4">
                                <img src="https://res.cloudinary.com/dsvjhemjd/image/upload/v1769581194/tutor2_rytlim.png" className="w-16 h-16 rounded-full object-cover border-2 border-green-400" alt="Rohan"/>
                                <div>
                                    <p className="font-bold text-lg">Rohan Nathani</p>
                                    <p className="text-gray-400">Class 12th, DPS Kaushambhi</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="grid grid-cols-4 gap-4 max-w-sm">
                                <img src="https://res.cloudinary.com/dsvjhemjd/image/upload/v1769601239/tes5_cropped_gdj3jx.png" className="w-20 h-20 rounded-full object-cover border-2 border-green-400 opacity-70 hover:opacity-100" alt="student"/>
                                <img src="https://res.cloudinary.com/dsvjhemjd/image/upload/v1769601232/tes4_cropped_bflbaz.png" className="w-20 h-20 rounded-full object-cover border-2 border-green-400 opacity-70 hover:opacity-100" alt="student"/>
                                <img src="https://res.cloudinary.com/dsvjhemjd/image/upload/v1769601239/tes1_cropped_slcxdg.png" className="w-20 h-20 rounded-full object-cover border-2 border-green-400 opacity-70 hover:opacity-100" alt="student"/>
                                <img src="https://res.cloudinary.com/dsvjhemjd/image/upload/v1769581187/tes7_ujk1je.png" className="w-20 h-20 rounded-full object-cover border-2 border-green-400 opacity-70 hover:opacity-100" alt="student"/>
                                <img src="https://res.cloudinary.com/dsvjhemjd/image/upload/v1769581193/tes6_dcowey.png" className="w-20 h-20 rounded-full object-cover border-2 border-green-400 opacity-70 hover:opacity-100" alt="student"/>
                                <img src="https://res.cloudinary.com/dsvjhemjd/image/upload/v1769601234/tes3_cropped_qh0olo.png" className="w-20 h-20 rounded-full object-cover border-2 border-green-400 opacity-70 hover:opacity-100" alt="student"/>
                                <img src="https://res.cloudinary.com/dsvjhemjd/image/upload/v1769601233/tes8_cropped_a3j3tv.png" className="w-20 h-20 rounded-full object-cover border-2 border-green-400 opacity-70 hover:opacity-100" alt="student"/>
                                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold text-lg">+250</div>
                            </div>
                            <p className="text-center mt-6 text-gray-400">Join the community of 10K+ students in becoming a better student</p>
                        </div>
                    </div>
                </div>
            </section>

             {/* CTA Section */}
            <section className="py-24">
                <div className="container mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <p className="text-lg text-green-400 font-bold">NO STRINGS ATTACHED</p>
                        <h2 className="text-4xl md:text-5xl font-bold mt-4">Your first session <br/> absolutely <span className="relative inline-block">free<img src="https://res.cloudinary.com/dsvjhemjd/image/upload/v1769581194/tes8_rytlim.png" className="absolute bottom-0 left-0 w-full h-auto" alt="underline"/></span></h2>
                        <p className="text-lg text-gray-400 mt-6 max-w-md">Claim your first FREE tutoring session now! Simply click the button below and witness the magic of personalized learning.</p>
                        <button className="bg-green-500 text-black font-bold px-10 py-4 rounded-lg text-lg hover:bg-green-600 transition-colors mt-8 shadow-lg shadow-green-500/20">
                            Get Started for Free
                        </button>
                    </div>
                    <div className="relative h-[400px] bg-black rounded-3xl border border-gray-800 flex items-center justify-center">
                        <img src="https://res.cloudinary.com/dsvjhemjd/image/upload/v1769581194/onlinev4_rytlim.png" className="w-full h-full object-cover rounded-3xl opacity-80" alt="online class"/>
                        <div className="absolute top-4 right-4 bg-red-600 px-3 py-1 text-sm rounded-full font-semibold animate-pulse">LIVE</div>
                    </div>
                </div>
            </section>

            {/* Contact Form Section */}
            <section id="contact-form-section" className="py-24">
                 <div className="max-w-2xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h3 className="text-3xl font-bold text-white mb-4">Send us a Message</h3>
                        <p className="text-slate-300">We typically respond within 24 hours.</p>
                    </div>
                    
                    {status === 'success' ? (
                      <div className="bg-green-900/50 backdrop-blur-md border border-green-400 rounded-[2rem] p-10 text-center animate-in fade-in zoom-in duration-300">
                         <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 size={40} />
                         </div>
                         <h4 className="text-2xl font-bold text-white mb-4">Message Sent!</h4>
                         <p className="text-green-200 mb-8 max-w-md mx-auto">
                            Thanks for reaching out to Ryze. We've received your enquiry and will be in touch with you shortly.
                         </p>
                         <button 
                            onClick={() => setStatus('idle')}
                            className="px-8 py-3 bg-slate-800 border border-slate-600 text-white font-bold rounded-xl hover:bg-slate-700 transition-colors"
                         >
                            Send Another Message
                         </button>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-6 relative">
                          {status === 'error' && (
                            <div className="bg-red-900/50 text-red-300 p-4 rounded-xl flex items-center gap-3 border border-red-500 mb-6 animate-in fade-in slide-in-from-top-2">
                               <AlertCircle size={20} className="shrink-0" />
                               <span className="font-medium">
                                 {errorMessage || "Something went wrong. Please try again or call us directly."}
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
                              <label htmlFor="name" className="block text-sm font-bold text-slate-200 uppercase tracking-wider">Name</label>
                              <input
                                type="text"
                                id="name"
                                name="name"
                                required
                                maxLength={100}
                                value={formData.name}
                                onChange={handleChange}
                                disabled={status === 'sending'}
                                className="w-full px-6 py-4 rounded-2xl bg-black/20 border-2 border-white/50 text-white focus:border-green-500 focus:bg-black/30 outline-none transition-all font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                                placeholder="Your Full Name"
                              />
                            </div>
                            <div className="space-y-2">
                              <label htmlFor="email" className="block text-sm font-bold text-slate-200 uppercase tracking-wider">Email</label>
                              <input
                                type="email"
                                id="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                disabled={status === 'sending'}
                                className="w-full px-6 py-4 rounded-2xl bg-black/20 border-2 border-white/50 text-white focus:border-green-500 focus:bg-black/30 outline-none transition-all font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                                placeholder="email@address.com"
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <label htmlFor="phone" className="block text-sm font-bold text-slate-200 uppercase tracking-wider">Phone</label>
                            <input
                              type="tel"
                              id="phone"
                              name="phone"
                              maxLength={20}
                              value={formData.phone}
                              onChange={handleChange}
                              disabled={status === 'sending'}
                              className="w-full px-6 py-4 rounded-2xl bg-black/20 border-2 border-white/50 text-white focus:border-green-500 focus:bg-black/30 outline-none transition-all font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                              placeholder="Mobile Number"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label htmlFor="message" className="block text-sm font-bold text-slate-200 uppercase tracking-wider">Message</label>
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
                              className="w-full px-6 py-4 rounded-2xl bg-black/20 border-2 border-white/50 text-white focus:border-green-500 focus:bg-black/30 outline-none transition-all font-medium resize-none disabled:opacity-70 disabled:cursor-not-allowed"
                              placeholder="How can we help you?"
                            ></textarea>
                          </div>

                          <button
                            type="submit"
                            disabled={status === 'sending'}
                            className="w-full bg-green-500 text-black font-bold py-5 rounded-2xl shadow-xl hover:bg-green-600 hover:-translate-y-1 active:scale-95 active:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-500/20 transition-all text-lg flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:active:scale-100"
                          >
                            {status === 'sending' ? (
                              <>
                                <Loader2 size={24} className="animate-spin" /> Sending...
                              </>
                            ) : (
                              <>Submit Enquiry</>
                            )}
                          </button>
                      </form>
                    )}
                 </div>
              </section>

            {/* FAQ Section */}
            <section className="py-32">
                <div className="container mx-auto px-6 grid md:grid-cols-2 gap-16 items-start">
                    <div>
                        <div className="w-16 h-16 bg-green-900/50 flex items-center justify-center rounded-2xl mb-6">
                            <FaQuestionCircle className="text-green-400 text-4xl" />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold">Still not convinced?</h2>
                        <p className="text-lg text-gray-400 mt-6">Talk to our customer support executives to resolve any other doubts you may have. <a href="#" className="text-green-400 underline">Contact us</a></p>
                    </div>
                    <div className="space-y-4">
                        {/* Accordion Item */}
                        <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
                            <div className="flex justify-between items-center cursor-pointer">
                                <h3 className="text-lg font-semibold">How does LandingPage work?</h3>
                                <FaPlus className="text-green-400"/>
                            </div>
                        </div>
                         <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
                            <div className="flex justify-between items-center cursor-pointer">
                                <h3 className="text-lg font-semibold">Are the tutors qualified?</h3>
                                <FaPlus className="text-green-400"/>
                            </div>
                        </div>
                         <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
                            <div className="flex justify-between items-center cursor-pointer">
                                <h3 className="text-lg font-semibold">How long is each tutoring session?</h3>
                                <FaPlus className="text-green-400"/>
                            </div>
                        </div>
                        <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
                            <div className="flex justify-between items-center cursor-pointer">
                                <h3 className="text-lg font-semibold">What if I need help with multiple subjects?</h3>
                                <FaPlus className="text-green-400"/>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="container mx-auto px-6 py-8 mt-10 border-t border-gray-800 flex justify-between items-center">
                <p className="text-gray-500">&copy; 2026, Ryze Education. All rights reserved</p>
                <div className="flex space-x-6 items-center">
                    <a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a>
                    <a href="#" className="text-gray-400 hover:text-white">Terms of service</a>
                    <div className="flex space-x-4">
                        <a href="#" className="text-gray-500 hover:text-white"><FaTwitter/></a>
                        <a href="#" className="text-gray-500 hover:text-white"><FaLinkedin/></a>
                        <a href="#" className="text-gray-500 hover:text-white"><FaInstagram/></a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
