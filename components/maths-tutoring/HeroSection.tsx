import React from 'react';
import { Activity, GraduationCap, Laptop, PenTool, Smile, Star, Trophy, Users } from 'lucide-react';

type HeroSectionProps = {
  onScrollToCta: () => void;
  isMobileViewport: boolean;
  reduceMotion: boolean | null;
};

const features = [
  {
    icon: Users,
    title: 'Small Classes',
    desc: "Max 6 students. You won't get lost in the crowd, ensuring personal attention.",
  },
  {
    icon: Star,
    title: 'Signature Curriculum',
    desc: 'Syllabus-aligned resources developed by expert NSW teachers for targeted learning.',
  },
  {
    icon: Trophy,
    title: 'Complete Support',
    desc: 'Holistic help between sessions, including subject selection and university pathways.',
  },
  {
    icon: Activity,
    title: 'Progress Tracking',
    desc: 'Regular monitoring and analysis to optimise your academic performance.',
  },
  {
    icon: GraduationCap,
    title: 'Expert Mentors',
    desc: 'Benefit from the genuine care and academic judgement of mentors who know how to teach with clarity.',
  },
  {
    icon: PenTool,
    title: 'Accredited Teachers',
    desc: 'Our founding team consists of leading NSW teachers and academics.',
  },
  {
    icon: Smile,
    title: 'Risk-Free Trial',
    desc: 'Your first lesson is free. You only pay if you decide to continue with us.',
  },
  {
    icon: Laptop,
    title: 'Flexible Options',
    desc: 'Choose from private, group, online, or in-person learning to suit your needs.',
  },
];

const heroImageBase = 'https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto,c_fill,g_auto';
const heroImageId = 'ryze/images/image-v1';
const heroImageSrc = `${heroImageBase},w_768/${heroImageId}`;
const heroImageSrcSet = [
  `${heroImageBase},w_360/${heroImageId} 360w`,
  `${heroImageBase},w_480/${heroImageId} 480w`,
  `${heroImageBase},w_640/${heroImageId} 640w`,
  `${heroImageBase},w_768/${heroImageId} 768w`,
  `${heroImageBase},w_960/${heroImageId} 960w`,
  `${heroImageBase},w_1200/${heroImageId} 1200w`,
  `${heroImageBase},w_1280/${heroImageId} 1280w`,
].join(', ');

const FeatureCarousel: React.FC<{ isMobileViewport: boolean; reduceMotion: boolean | null }> = ({
  isMobileViewport,
  reduceMotion,
}) =>
  isMobileViewport ? (
    <div className="grid grid-cols-1 gap-4 mt-12">
      {features.slice(0, 3).map((feature, idx) => (
        <div
          key={idx}
          className="rounded-3xl border border-white/10 bg-black/20 p-6 text-left backdrop-blur-lg"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-[rgba(184,132,30,0.3)] bg-[var(--color-ryze-500)]">
            <feature.icon size={24} className="ryze-text-inverse" />
          </div>
          <h3 className="mb-2 text-lg font-display font-bold ryze-text-inverse">{feature.title}</h3>
          <p className="ryze-text-inverse-muted text-sm leading-relaxed">{feature.desc}</p>
        </div>
      ))}
    </div>
  ) : (
    <div
      className="feature-marquee mt-24 w-full [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]"
      tabIndex={0}
      aria-label="Ryze learning features"
    >
      <div className="feature-marquee-track">
        {(reduceMotion ? features : [...features, ...features]).map((feature, idx) => (
          <div
            key={`${feature.title}-${idx}`}
            className="flex-shrink-0 w-[clamp(280px,56vw,420px)] bg-black/20 p-8 rounded-3xl border border-white/10 backdrop-blur-lg"
            aria-hidden={!reduceMotion && idx >= features.length}
          >
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl border border-[rgba(184,132,30,0.3)] bg-[var(--color-ryze-500)]">
              <feature.icon size={28} className="ryze-text-inverse" />
            </div>
            <h3 className="mb-3 text-xl font-display font-bold ryze-text-inverse">{feature.title}</h3>
            <p className="text-base leading-relaxed ryze-text-inverse-muted">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );

const HeroSection: React.FC<HeroSectionProps> = ({ onScrollToCta, isMobileViewport, reduceMotion }) => (
  <section className="relative ryze-text-inverse ryze-bg-surface-dark">
    <img
      src={heroImageSrc}
      srcSet={heroImageSrcSet}
      sizes="(max-width: 768px) 100vw, 1200px"
      alt="Maths tutoring - Ryze Education"
      fetchPriority="high"
      loading="eager"
      decoding="async"
      className="absolute inset-0 h-full w-full object-cover object-center sm:object-[52%_center] lg:object-[56%_center]"
    />
    {/* Background Overlay */}
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

    {/* Hero Content */}
    <div className="relative z-10 ryze-container text-center pt-28 sm:pt-32 md:pt-36 lg:pt-40 pb-10 sm:pb-14 md:pb-16">
      <h1 className="ryze-heading-1 ryze-text-inverse">
        YOUR PATH TO SUCCESS STARTS HERE
      </h1>
      <p className="text-sm sm:text-base md:text-xl ryze-text-inverse-muted mt-5 sm:mt-6 md:mt-8 max-w-2xl mx-auto leading-relaxed">
        Selective entry. Top bands. Extension 2 excellence. It all starts with the right mentor.
      </p>
      <div className="mt-8 sm:mt-10 md:mt-12 flex flex-col items-center gap-3 sm:gap-4">
        <button
          onClick={onScrollToCta}
          className="ryze-cta-primary w-full sm:w-auto"
        >
          Start your journey now
        </button>
        <p className="ryze-text-muted mt-3 sm:mt-5 text-sm sm:text-base">Join 500+ other satisfied students</p>
      </div>
      <FeatureCarousel isMobileViewport={isMobileViewport} reduceMotion={reduceMotion} />
    </div>
  </section>
);

export default HeroSection;
