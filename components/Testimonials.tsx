
import React from 'react';
import { motion } from 'framer-motion';
import { Star, UserCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { testimonials } from '../data/testimonials';
import { schoolLogos } from '../data/schoolLogos';
import './Testimonials.css';

const TestimonialCard = ({ testimonial, index }) => {
  const { t } = useLanguage();

  return (
    <motion.li 
      className="testimonial-card flex-shrink-0 w-[380px] bg-white p-6 rounded-xl shadow-md border border-slate-100 flex flex-col"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <div className="flex items-center mb-4">
        <UserCircle className="text-slate-400 w-12 h-12 mr-4" />
        <div>
          <h3 className="font-semibold text-slate-900">{t(testimonial.reviewerName)}</h3>
          <p className="text-sm text-slate-500">{t(testimonial.reviewerType)} - {t(testimonial.studentGrade)}</p>
        </div>
      </div>
      
      <div className="flex items-center mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={18} className="text-[#ffb000] fill-[#ffb000] mr-1" />
        ))}
      </div>
      
      <blockquote className="text-slate-700 text-base leading-relaxed flex-grow mb-5">
        {t(testimonial.message)}
      </blockquote>

      <div className="mt-auto pt-5 border-t border-slate-100 text-center">
        <p className="font-semibold text-sm text-[#B37C00]">{t(testimonial.achievement)}</p>
      </div>
    </motion.li>
  );
};

const Testimonials = () => {
  const { t } = useLanguage();
  const duplicatedLogos = [...schoolLogos, ...schoolLogos, ...schoolLogos];
  const firstRow = testimonials.slice(0, Math.ceil(testimonials.length / 2));
  const secondRow = testimonials.slice(Math.ceil(testimonials.length / 2));

  return (
    <section className="bg-[#f9f5ed] text-slate-800 py-32 sm:py-40 overflow-hidden font-sans">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-150px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-20"
        >
          <h2 className="font-serif text-7xl md:text-8xl font-bold text-slate-900 tracking-tight">5.0 <span className="text-[#ffb000]">★★★★★</span></h2>
          <p className="text-slate-500 mt-5 text-lg">Based on 100+ happy students.</p>
        </motion.div>

        <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="mb-32"
        >
           <p className="text-center text-slate-400 text-sm font-bold tracking-widest mb-12">TRUSTED BY STUDENTS FROM AUSTRALIA'S TOP INSTITUTIONS</p>
           <div className="relative w-full overflow-hidden group">
              <div className="flex animate-scroll-x pause-animation">
                {duplicatedLogos.map((school, index) => (
                    <div key={index} className="flex-shrink-0 w-[200px] h-[80px] flex items-center justify-center mx-8">
                      <img 
                        src={school.src} 
                        alt={school.alt} 
                        className="max-w-full max-h-[50px] object-contain" 
                      />
                    </div>
                ))}
              </div>
           </div>
        </motion.div>
      </div>

      <div className="space-y-8">
          <div className="relative w-full overflow-hidden">
              <div className="flex animate-scroll-x pause-animation">
                {[...firstRow, ...firstRow].map((testimonial, index) => (
                  <div className='mx-4' key={`${testimonial.id}-1-${index}`}><TestimonialCard testimonial={testimonial} index={index} /></div>
                ))}
              </div>
          </div>
          <div className="relative w-full overflow-hidden">
              <div className="flex animate-scroll-x-reverse pause-animation">
                 {[...secondRow, ...secondRow].map((testimonial, index) => (
                  <div className='mx-4' key={`${testimonial.id}-2-${index}`}><TestimonialCard testimonial={testimonial} index={index} /></div>
                ))}
              </div>
          </div>
      </div>
    </section>
  );
};

export default Testimonials;
