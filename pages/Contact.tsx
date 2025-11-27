
import React, { useState } from 'react';
import { Phone, ArrowRight, Send, MapPin, Mail } from 'lucide-react';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Thanks for contacting Ryze! We'll be in touch shortly.");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-white bg-slate-50 min-h-screen font-sans pt-20">
      
      <div className="bg-white pb-20 pt-24 px-4 border-b border-slate-100">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-sans font-bold text-slate-900 mb-6 tracking-tight">Get in Touch</h1>
          <p className="text-xl font-light text-slate-500">
             Have questions? Ready to enroll? We'd love to hear from you.
          </p>
        </div>
      </div>

        <div className="bg-[#f8fafc] px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto -mt-32">
            
            {/* Card 1: Speak Now */}
            <div className="bg-white rounded-[2.5rem] shadow-xl p-12 flex flex-col items-center text-center border border-slate-100 h-full hover:-translate-y-2 transition-transform duration-300 group">
                <div className="w-20 h-20 bg-ryze rounded-full flex items-center justify-center text-white mb-8 shadow-lg shadow-ryze/30 group-hover:scale-110 transition-transform">
                  <Phone size={32} />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Prefer to Speak now?</h2>
                
                <p className="text-slate-500 mb-12 text-lg font-normal leading-relaxed">
                  Sometimes it's just easier to talk. Call us directly and we'll help you out.
                </p>

                <a href="tel:+61413885839" className="mt-auto w-full py-5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-ryze hover:text-white transition-all flex items-center justify-center gap-3 shadow-lg">
                  +61 413 885 839 <Phone size={20} fill="currentColor" />
                </a>
            </div>

            {/* Card 2: Message Us */}
            <div className="bg-white rounded-[2.5rem] shadow-xl p-12 flex flex-col items-center text-center border border-slate-100 h-full hover:-translate-y-2 transition-transform duration-300 group">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 mb-8 group-hover:bg-slate-200 transition-colors">
                  <Send size={32} />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Message Us</h2>
                
                <p className="text-slate-500 mb-12 text-lg font-normal leading-relaxed">
                  Send us your question or request a call back at a time that suits you.
                </p>

                <button 
                  onClick={() => {
                    const formElement = document.getElementById('contact-form-section');
                    formElement?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="mt-auto w-full py-5 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-2xl hover:border-slate-900 hover:text-slate-900 transition-all flex items-center justify-center gap-3"
                >
                  Send Message <ArrowRight size={20} />
                </button>
            </div>

          </div>
        </div>

      {/* Contact Form Section */}
      <section id="contact-form-section" className="py-24 bg-white border-t border-slate-100">
         <div className="max-w-2xl mx-auto px-4">
            <div className="text-center mb-12">
                <h3 className="text-3xl font-bold text-slate-900 mb-4">Send us a Message</h3>
                <p className="text-slate-500">We typically respond within 24 hours.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-ryze focus:bg-white outline-none transition-all font-medium"
                      placeholder="Your Full Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-ryze focus:bg-white outline-none transition-all font-medium"
                      placeholder="email@address.com"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="phone" className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-ryze focus:bg-white outline-none transition-all font-medium"
                    placeholder="Mobile Number"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="message" className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    required
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-ryze focus:bg-white outline-none transition-all font-medium resize-none"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-ryze text-white font-bold py-5 rounded-2xl shadow-xl hover:bg-ryze-600 hover:-translate-y-1 transition-all text-lg"
                >
                  Submit Enquiry
                </button>
            </form>
         </div>
      </section>

      {/* Footer Info Strips */}
      <div className="bg-[#0f172a] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-10">
           <div className="flex items-center gap-6 p-6 rounded-3xl bg-white/5 border border-white/10">
              <div className="w-12 h-12 bg-ryze rounded-full flex items-center justify-center text-[#0f172a]"><MapPin size={20} /></div>
              <div>
                 <div className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Location</div>
                 <div className="font-bold text-lg">Sydney, NSW Australia</div>
              </div>
           </div>
           <div className="flex items-center gap-6 p-6 rounded-3xl bg-white/5 border border-white/10">
              <div className="w-12 h-12 bg-ryze rounded-full flex items-center justify-center text-[#0f172a]"><Phone size={20} /></div>
              <div>
                 <div className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Phone</div>
                 <div className="font-bold text-lg">+61 413 885 839</div>
              </div>
           </div>
           <div className="flex items-center gap-6 p-6 rounded-3xl bg-white/5 border border-white/10">
              <div className="w-12 h-12 bg-ryze rounded-full flex items-center justify-center text-[#0f172a]"><Mail size={20} /></div>
              <div>
                 <div className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Email</div>
                 <div className="font-bold text-lg">ryzeeducation@outlook.com</div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
