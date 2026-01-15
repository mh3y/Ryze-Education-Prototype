
import React from 'react';
import { Star, UserCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { testimonials } from '../data/testimonials';
import { schoolLogos } from '../data/schoolLogos';
import './Testimonials.css';

const TestimonialCard = ({ testimonial, index, className }) => {
  const { t } = useLanguage();

  return (
    <li 
      className={`testimonial-card flex-shrink-0 w-[380px] bg-white p-6 rounded-xl shadow-md border border-slate-100 flex flex-col ${className}`}>
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
        <p className="font-semibold text-base text-[#FFB000]">{t(testimonial.achievement)}</p>
      </div>
    </li>
  );
};

const Testimonials = () => {
  const { t } = useLanguage();
  const quadrupedLogos = [...schoolLogos, ...schoolLogos, ...schoolLogos, ...schoolLogos];
  const topPanelTestimonials = testimonials.filter(testimonial => testimonial.category === 'HSC' || testimonial.studentGrade === 'Year 12');
  const bottomPanelTestimonials = testimonials.filter(testimonial => testimonial.category !== 'HSC' && testimonial.studentGrade !== 'Year 12');

  const duplicatedTopRow = [...topPanelTestimonials, ...topPanelTestimonials];
  const duplicatedBottomRow = [...bottomPanelTestimonials, ...bottomPanelTestimonials];

  return (
    <section className="bg-[#f9f5ed] text-slate-800 py-32 sm:py-40 overflow-hidden font-sans">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="font-serif text-7xl md:text-8xl font-bold text-slate-900 tracking-tight">5.0 <span className="text-[#ffb000]">★★★★★</span></h2>
          <p className="text-slate-500 mt-5 text-xl">Based on 250+ happy students and satisfied parents.</p>
        </div>

        <div className="mb-32">
           <p className="text-center text-black text-xl font-bold tracking-widest mb-12 text-halo">TRUSTED BY STUDENTS FROM AUSTRALIA'S TOP INSTITUTIONS</p>
           <div className="relative w-full overflow-hidden group">
              <div className="flex animate-scroll-x">
                {quadrupedLogos.map((school, index) => (
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
        </div>
      </div>

      <div className="space-y-8">
          <div className="relative w-full overflow-hidden">
              <div className="flex testimonial-scroll-x">
                {duplicatedTopRow.map((testimonial, index) => (
                  <TestimonialCard testimonial={testimonial} index={index} key={`${testimonial.id}-1-${index}`} className="mx-4" />
                ))}
              </div>
          </div>
          <div className="relative w-full overflow-hidden">
              <div className="flex testimonial-scroll-x-reverse">
                 {duplicatedBottomRow.map((testimonial, index) => (
                  <TestimonialCard testimonial={testimonial} index={index} key={`${testimonial.id}-2-${index}`} className="mx-4" />
                ))}
              </div>
          </div>
      </div>
    </section>
  );
};

export default Testimonials;
