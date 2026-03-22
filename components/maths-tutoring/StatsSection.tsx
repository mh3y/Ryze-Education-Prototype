import React from 'react';
import { Award, GraduationCap, Star, TrendingUp } from 'lucide-react';

const statsData = [
  {
    icon: <GraduationCap size={40} className="text-[var(--color-ryze-500)]" />,
    value: '500+',
    description: 'students served & counting',
  },
  {
    icon: <Award size={40} className="text-[var(--color-ryze-500)]" />,
    value: '13 years',
    description: 'of teaching experience and mentoring students',
  },
  {
    icon: <Star size={40} className="text-[var(--color-ryze-500)]" />,
    value: '4.9/5',
    description: 'overall experience at Ryze',
  },
  {
    icon: <TrendingUp size={40} className="text-[var(--color-ryze-500)]" />,
    value: '100%',
    description: "of students' grades improved significantly",
  },
];

const StatsSection: React.FC = () => (
  <section className="ryze-section-padding bg-[#f9f9f7]">
    <div className="ryze-container text-center">
      <h2 className="ryze-heading-2 ryze-text-primary">Unmatched expertise at your fingertips</h2>
      <p className="text-sm sm:text-base md:text-lg ryze-text-secondary mt-3 sm:mt-4 max-w-2xl mx-auto">Be a part of the Ryze success story, where numbers speak volumes about us</p>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mt-10 sm:mt-12 md:mt-16">
        {statsData.map((stat, index) => (
          <div key={index} className="text-center">
            <div className="flex justify-center mb-3 sm:mb-4">{stat.icon}</div>
            <p className="text-3xl sm:text-4xl md:text-5xl font-bold ryze-text-primary">{stat.value}</p>
            <p className="ryze-text-secondary mt-1.5 sm:mt-2 text-sm sm:text-base">{stat.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default StatsSection;
