import React, { useEffect, useMemo, useState } from 'react';
import { Star } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { testimonials } from '../data/testimonials';
import { schoolLogos } from '../data/schoolLogos';
import { Testimonial } from '../types';
import './Testimonials.css';

type TestimonialCardProps = {
  testimonial: Testimonial;
  isDuplicate?: boolean;
};

type StoryMetadata = {
  categoryPill: string;
  programTitle: string;
  trackLabel: string;
  verifiedLabel: string;
};

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');

const parseYear = (grade: string) => {
  const match = grade.match(/(\d+)/);
  return match ? Number(match[1]) : null;
};

const getStoryMetadata = (testimonial: Testimonial, reviewerTypeText: string): StoryMetadata => {
  const category = (testimonial.category || '').toLowerCase();
  const grade = (testimonial.studentGrade || '').toLowerCase();
  const achievementAndMessage = `${testimonial.achievement} ${testimonial.message}`.toLowerCase();
  const year = parseYear(testimonial.studentGrade);
  const isHsc = category.includes('hsc') || testimonial.studentGrade === 'Year 12';
  const isSelective = category.includes('selective') || category.includes('oc');
  const isPrimary = category.includes('primary') || category.includes('naplan') || (year !== null && year <= 6);

  let categoryPill = 'ACADEMIC SUCCESS';
  if (isHsc) categoryPill = 'HSC SUCCESS';
  else if (isSelective) categoryPill = 'SELECTIVE SUCCESS';
  else if (isPrimary) categoryPill = 'PRIMARY SUCCESS';

  let programTitle = 'Student & Parent Story';
  if (isHsc) {
    if (achievementAndMessage.includes('extension 2') || achievementAndMessage.includes('4u')) {
      programTitle = 'Mathematics Extension 2';
    } else if (
      achievementAndMessage.includes('advanced') ||
      achievementAndMessage.includes('2u') ||
      achievementAndMessage.includes('ext 1') ||
      achievementAndMessage.includes('3u')
    ) {
      programTitle = 'HSC Advanced Mathematics';
    } else {
      programTitle = 'HSC Mathematics';
    }
  } else if (isSelective) {
    programTitle = 'Selective School Prep';
  } else if (isPrimary) {
    programTitle = 'Primary Foundations';
  }

  const reviewer = reviewerTypeText.toLowerCase();
  const isParent = reviewer.includes('parent');
  const isStudent = reviewer.includes('student');

  let trackLabel = 'STORY';
  if (isParent) trackLabel = 'PARENT STORY';
  else if (isStudent) trackLabel = 'STUDENT STORY';

  let verifiedLabel = 'VERIFIED REVIEW';
  if (isParent) verifiedLabel = 'VERIFIED PARENT';
  else if (isStudent) verifiedLabel = 'VERIFIED STUDENT';

  return {
    categoryPill,
    programTitle,
    trackLabel,
    verifiedLabel
  };
};

const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial, isDuplicate = false }) => {
  const { t } = useLanguage();
  const reviewerName = t(testimonial.reviewerName);
  const reviewerType = t(testimonial.reviewerType);
  const reviewerGrade = t(testimonial.studentGrade);
  const storyMeta = getStoryMetadata(testimonial, reviewerType);

  return (
    <li
      className="testimonial-card p-6 md:p-7"
      aria-hidden={isDuplicate || undefined}
    >
      <div className="testimonial-top-row">
        <div className="testimonial-stars" aria-label="5 out of 5 stars">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={13} className="text-[#ffb000] fill-[#ffb000]" />
          ))}
        </div>
        <div className="testimonial-label-group">
          <span className="testimonial-track-label">{storyMeta.trackLabel}</span>
          <span className="testimonial-category-pill">{storyMeta.categoryPill}</span>
        </div>
      </div>

      <h3 className="testimonial-title">{storyMeta.programTitle}</h3>
      <p className="testimonial-result">
        <span aria-hidden="true" className="testimonial-result-icon">🏆</span> {t(testimonial.achievement)}
      </p>

      <blockquote className="testimonial-quote text-slate-700">
        "{t(testimonial.message)}"
      </blockquote>

      <div className="testimonial-meta">
        <div className="testimonial-identity">
          <span className="testimonial-avatar" aria-hidden="true">
            {getInitials(reviewerName)}
          </span>
          <div>
            <p className="font-semibold text-slate-900">{reviewerName}</p>
            <p className="text-sm text-slate-600">
              {reviewerType} - {reviewerGrade}
            </p>
          </div>
        </div>
        <span className="testimonial-verified-label">{storyMeta.verifiedLabel}</span>
      </div>
    </li>
  );
};

const Testimonials: React.FC = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);
    updatePreference();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updatePreference);
      return () => mediaQuery.removeEventListener('change', updatePreference);
    }

    mediaQuery.addListener(updatePreference);
    return () => mediaQuery.removeListener(updatePreference);
  }, []);

  const optimizeCloudinaryImage = (url: string, width: number, height: number) => {
    if (!url.includes('res.cloudinary.com')) return url;
    return url.replace(
      /\/image\/upload\/(?:[^/]+\/)?/,
      `/image/upload/f_auto,q_auto:good,c_limit,w_${width},h_${height},dpr_auto/`
    );
  };

  const loopLogos = useMemo(() => [...schoolLogos, ...schoolLogos], []);
  const topPanelTestimonials = useMemo(
    () => testimonials.filter((testimonial) => testimonial.category === 'HSC' || testimonial.studentGrade === 'Year 12'),
    []
  );
  const bottomPanelTestimonials = useMemo(
    () => testimonials.filter((testimonial) => testimonial.category !== 'HSC' && testimonial.studentGrade !== 'Year 12'),
    []
  );

  const topLoopItems = prefersReducedMotion ? topPanelTestimonials : [...topPanelTestimonials, ...topPanelTestimonials];
  const bottomLoopItems = prefersReducedMotion ? bottomPanelTestimonials : [...bottomPanelTestimonials, ...bottomPanelTestimonials];

  return (
    <section className="overflow-hidden bg-[#f9f5ed] py-32 font-sans text-slate-800 sm:py-40">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="mb-20 text-center">
          <h2 className="font-serif text-7xl font-bold tracking-tight text-slate-900 md:text-8xl">
            5.0 <span className="text-[#ffb000]">{'\u2605\u2605\u2605\u2605\u2605'}</span>
          </h2>
          <p className="mt-5 text-xl text-slate-700">Based on 250+ happy students and satisfied parents.</p>
        </div>

        <div className="mb-32">
          <p className="text-halo mb-12 text-center text-xl font-bold tracking-widest text-black">
            TRUSTED BY STUDENTS FROM AUSTRALIA'S TOP INSTITUTIONS
          </p>
          <div className="group relative w-full overflow-hidden">
            <div className="school-logos-marquee">
              {loopLogos.map((school, index) => (
                <div key={`${school.alt}-${index}`} className="mx-8 flex h-[80px] w-[200px] flex-shrink-0 items-center justify-center">
                  <img
                    src={optimizeCloudinaryImage(school.src, 220, 80)}
                    alt={school.alt}
                    width={220}
                    height={80}
                    loading="lazy"
                    decoding="async"
                    className="max-h-[50px] max-w-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="testimonial-marquee-wrapper" tabIndex={0} aria-label="Senior student testimonials">
          <ul
            className="testimonial-track testimonial-track--forward"
            aria-label="Senior student testimonials"
          >
            {topLoopItems.map((testimonial, index) => (
              <TestimonialCard
                testimonial={testimonial}
                key={`${testimonial.id}-top-${index}`}
                isDuplicate={!prefersReducedMotion && index >= topPanelTestimonials.length}
              />
            ))}
          </ul>
        </div>

        <div className="testimonial-marquee-wrapper" tabIndex={0} aria-label="Junior student testimonials">
          <ul
            className="testimonial-track testimonial-track--reverse"
            aria-label="Junior student testimonials"
          >
            {bottomLoopItems.map((testimonial, index) => (
              <TestimonialCard
                testimonial={testimonial}
                key={`${testimonial.id}-bottom-${index}`}
                isDuplicate={!prefersReducedMotion && index >= bottomPanelTestimonials.length}
              />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

