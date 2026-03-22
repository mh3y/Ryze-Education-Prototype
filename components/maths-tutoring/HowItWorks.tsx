import React from 'react';

const consultationImageBase =
  'https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto:good,c_fill,g_auto';
const consultationImageId = 'v1769561936/online_xnzlfr';
const consultationImageSrc = `${consultationImageBase},w_540/${consultationImageId}`;
const consultationImageSrcSet = [
  `${consultationImageBase},w_360/${consultationImageId} 360w`,
  `${consultationImageBase},w_540/${consultationImageId} 540w`,
  `${consultationImageBase},w_720/${consultationImageId} 720w`,
].join(', ');

const HowItWorks: React.FC = () => (
  <section className="ryze-bg-primary ryze-section-padding">
    <div className="ryze-container">
      <div className="text-center mb-20">
        <div className="eyebrow justify-center">How It Works</div>
        <h2 className="mt-5 ryze-heading-2 ryze-text-primary">
          A clear start for families
        </h2>
        <p className="mx-auto mt-4 max-w-3xl text-[1.02rem] leading-relaxed ryze-text-secondary">
          We take three steps to understand your child&apos;s needs, identify where support is required, and
          recommend the most suitable next step.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        {/* Left Column: Phone Mockup */}
        <div className="flex justify-center">
          <div className="rounded-[2.4rem] border ryze-border-subtle bg-[rgba(248,243,234,0.92)] p-4 shadow-[0_28px_64px_-44px_rgba(17,21,29,0.44)]">
            <div className="overflow-hidden rounded-[2rem] ryze-bg-surface-dark">
              <img
                src={consultationImageSrc}
                srcSet={consultationImageSrcSet}
                sizes="(max-width: 767px) 90vw, 720px"
                width={720}
                height={1280}
                loading="lazy"
                decoding="async"
                alt="Online Consultation"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Steps */}
        <div className="relative flex flex-col gap-16">
          <div className="absolute bottom-0 left-4 top-0 w-px bg-[rgba(184,132,30,0.28)]"></div>

          {/* Step 1 */}
          <div className="pl-12 relative">
            <div className="absolute left-0 top-1.5 flex items-center">
              <div className="h-8 w-8 rounded-full border-2 border-[var(--color-ryze-500)] bg-[rgba(243,231,201,0.92)]"></div>
            </div>
            <h3 className="mb-2 text-[0.88rem] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">
              Step 1
            </h3>
            <h4 className="mb-3 ryze-heading-3 ryze-text-primary">
              Schedule a free consultation
            </h4>
            <p className="text-[1rem] leading-relaxed ryze-text-secondary">
              We begin with a conversation to understand current performance, challenges, goals, and which
              format is likely to suit your child best.
            </p>
          </div>

          {/* Step 2 */}
          <div className="pl-12 relative">
            <div className="absolute left-0 top-1.5 flex items-center">
              <div className="h-8 w-8 rounded-full border-2 border-[var(--color-ryze-500)] bg-[rgba(243,231,201,0.92)]"></div>
            </div>
            <h3 className="mb-2 text-[0.88rem] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">
              Step 2
            </h3>
            <h4 className="mb-3 ryze-heading-3 ryze-text-primary">
              Diagnosis and feedback
            </h4>
            <p className="text-[1rem] leading-relaxed ryze-text-secondary">
              The first lesson acts as a real diagnostic. We identify gaps, misconceptions, and patterns in
              how your child approaches mathematics, then explain what needs attention.
            </p>
          </div>

          {/* Step 3 */}
          <div className="pl-12 relative">
            <div className="absolute left-0 top-1.5 flex items-center">
              <div className="h-8 w-8 rounded-full border-2 border-[var(--color-ryze-500)] bg-[rgba(243,231,201,0.92)]"></div>
            </div>
            <h3 className="mb-2 text-[0.88rem] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">
              Step 3
            </h3>
            <h4 className="mb-3 ryze-heading-3 ryze-text-primary">
              Personalised learning plan
            </h4>
            <p className="text-[1rem] leading-relaxed ryze-text-secondary">
              We recommend a clear starting pathway, outline what we will focus on, and set expectations for
              the first stage of progress.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default HowItWorks;
