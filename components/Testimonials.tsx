
import React from 'react';
import { motion } from 'framer-motion';
import { Star, Award } from 'lucide-react';
import { testimonials } from '../data/testimonials';
import { useLanguage } from '../contexts/LanguageContext';

const TestimonialCard = ({ testimonial, index }) => {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.1 }}
      className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full"
    >
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 rounded-full bg-ryze/10 flex items-center justify-center mr-4">
          <Star className="text-ryze" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900">{t(testimonial.reviewerName)}</h3>
          <p className="text-sm text-slate-500">{t(testimonial.reviewerType)} - {t(testimonial.studentGrade)}</p>
        </div>
      </div>
      <p className="text-slate-600 mb-4 flex-grow">"{t(testimonial.message)}"</p>
      <div className="mt-auto pt-4 border-t border-slate-100">
        <div className="flex items-center text-sm font-bold text-ryze">
          <Award size={16} className="mr-2" />
          <span>{t(testimonial.highlight)}</span>
        </div>
      </div>
    </motion.div>
  );
};

const Testimonials = () => {
  const { t } = useLanguage();

  // Show a selection of testimonials
  const selectedTestimonials = testimonials.filter(t => ['hsc-1', 'sel-1', 'oc-1', 'pri-1'].includes(t.id));

  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-sans font-bold text-slate-900 mb-4">{t("Success Stories")}</h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">{t("Here's what our students and parents have to say about their experience with Ryze.")}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {selectedTestimonials.map((testimonial, index) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
