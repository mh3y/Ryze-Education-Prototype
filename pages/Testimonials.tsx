
import React, { useState } from 'react';
import { testimonials } from '../data/testimonials';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Award, CheckCircle, Search, ChevronDown } from 'lucide-react';

const categories = ['All', 'HSC', 'OC', 'Selective', 'Primary (K-6)', 'High School (7-12)'];

const TestimonialsPage: React.FC = () => {
  const [filter, setFilter] = useState('All';
  const [search, setSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const filteredTestimonials = testimonials.filter(t => {
    const categoryMatch = filter === 'All' ? true : t.category === filter;
    const searchMatch = 
      t.reviewerName.toLowerCase().includes(search.toLowerCase()) ||
      t.highlight.toLowerCase().includes(search.toLowerCase()) ||
      t.message.toLowerCase().includes(search.toLowerCase()) ||
      t.achievement.toLowerCase().includes(search.toLowerCase()) ||
      t.school.toLowerCase().includes(search.toLowerCase());
    return categoryMatch && searchMatch;
  });

  return (
    <div className="bg-black font-sans text-white min-h-screen pt-24">
      {/* Hero Section */}
      <header className="py-24 px-4 text-center relative overflow-hidden">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(250,204,21,0.08),transparent_40%)]"></div>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
          Student Success Stories
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }} className="text-xl text-gray-400 max-w-3xl mx-auto">
          Real results from students who have transformed their skills and confidence with Ryze. These are their stories.
        </motion.p>
      </header>

      {/* Filter & Search Section */}
      <div className="sticky top-16 bg-black/80 backdrop-blur-lg z-20 py-6 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-auto">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full md:w-auto flex items-center justify-between gap-2 px-5 py-2.5 bg-gray-900 border border-gray-700 rounded-full font-semibold transition-colors hover:bg-gray-800"
              >
                {filter === 'All' ? 'All Categories' : filter}
                <ChevronDown size={16} className={`transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full mt-2 w-full md:w-48 bg-gray-900 border border-gray-700 rounded-xl shadow-lg overflow-hidden"
                  >
                    {categories.map(category => (
                      <button 
                        key={category}
                        onClick={() => { setFilter(category); setDropdownOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${filter === category ? 'bg-yellow-400/10 text-yellow-400' : 'hover:bg-gray-800'}`}>
                        {category}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="relative w-full md:w-1/3">
                <input 
                    type="text" 
                    placeholder="Search stories..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-full focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all"
                />
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"/>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Grid */}
      <main className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatePresence>
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTestimonials.map((testimonial) => (
                <motion.div 
                  key={testimonial.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="border border-gray-800/80 rounded-3xl p-8 bg-gray-900/40 backdrop-blur-sm h-full flex flex-col justify-between hover:border-yellow-400/30"
                >
                  <div>
                    <div className="flex items-center mb-5">
                      <div className="w-12 h-12 rounded-full bg-yellow-400/10 flex items-center justify-center mr-4 border border-yellow-400/20 text-yellow-400">
                        <Award size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg">{testimonial.reviewerName}</h3>
                        <p className="text-sm text-gray-400">{testimonial.reviewerType} ({testimonial.studentGrade})</p>
                      </div>
                    </div>
                    <p className="text-xl font-semibold text-white/90 leading-snug mb-4">"{testimonial.highlight}"</p>
                    <p className="text-gray-400 leading-relaxed">"{testimonial.message}"</p>
                  </div>
                  <div className="mt-6 pt-6 border-t border-gray-800">
                      <div className="flex items-center text-sm text-gray-300 font-medium">
                          <CheckCircle size={16} className="text-green-400 mr-2.5 shrink-0"/>
                          <div>
                            <span className="font-semibold text-white">Achievement:</span> {testimonial.achievement} at {testimonial.school}
                          </div>
                      </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
          {filteredTestimonials.length === 0 && (
             <div className="text-center py-20">
                <p className="text-xl text-gray-500">No stories found. Try a different filter or search.</p>
             </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default TestimonialsPage;
