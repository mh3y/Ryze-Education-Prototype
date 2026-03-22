import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { teamMembers } from '../../data/team';

type TeamPreviewProps = {
  isMobileViewport: boolean;
};

const team = teamMembers.map((m) => ({
  id: m.id,
  name: m.name,
  role: m.role,
  atar: m.atar,
  scores: m.scores,
  image: m.imageUrl.replace(',w_900,h_1125', ',w_700,h_900'),
  fallback: m.fallbackUrl,
}));

const TeamPreview: React.FC<TeamPreviewProps> = ({ isMobileViewport }) => (
  <section className="relative overflow-hidden bg-[rgba(243,231,201,0.16)] ryze-section-padding">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(243,231,201,0.55),transparent_62%)]"></div>
    <div className="ryze-container relative z-10">
      <div className="flex flex-col md:flex-row justify-center items-center mb-16 gap-6">
        <div className="max-w-2xl text-center">
          <div className="eyebrow justify-center mb-3 sm:mb-0">Faculty</div>
          <h2 className="mt-3 sm:mt-5 ryze-heading-2 text-white mb-4">
            Meet the educators behind the standard
          </h2>
          <p className="text-base sm:text-[1.02rem] leading-relaxed ryze-text-inverse-muted">
            Our experienced educators are committed to helping every student thrive. Not just tutors, but
            qualified teachers and high-achievers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 max-w-6xl mx-auto">
        {team.map((member, idx) => (
          <motion.div
            key={idx}
            className={`group cursor-pointer ${idx === 2 ? 'sm:col-span-2 sm:max-w-md sm:mx-auto lg:col-span-1 lg:max-w-none lg:mx-0 w-full' : ''}`}
            initial={isMobileViewport ? false : { opacity: 0, y: 20 }}
            whileInView={isMobileViewport ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={isMobileViewport ? { duration: 0 } : { delay: idx * 0.1 }}
          >
            {member.scores && member.scores.length > 0 && (
              <div className="mb-6">
                <div className="rounded-[1.35rem] border ryze-border-subtle bg-[rgba(248,243,234,0.92)] p-4 backdrop-blur-md shadow-[0_18px_40px_-30px_rgba(17,21,29,0.28)]">
                  <h4 className="mb-2 text-center text-[0.9rem] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">
                    HSC Marks
                  </h4>
                  <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
                    {member.scores.map((score, i) => (
                      <span key={i} className="text-[0.95rem] font-semibold text-[var(--primary)]/80">
                        {score}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div className="relative mb-6 aspect-[3/4] overflow-hidden rounded-[2.2rem] border border-white/60 bg-[rgba(255,255,255,0.4)] shadow-[0_28px_64px_-44px_rgba(17,21,29,0.44)]">
              {member.atar && (
                <div className="absolute top-2 left-2 md:top-4 md:left-4 z-20">
                  <div
                    style={{ willChange: 'transform' }}
                    className="transform rounded-[1.15rem] border border-[rgba(184,132,30,0.18)] bg-[rgba(248,243,234,0.92)] shadow-[0_18px_40px_-26px_rgba(17,21,29,0.34)] backdrop-blur-xl transition-transform duration-300 ease-in-out md:rounded-[1.35rem] md:hover:scale-[1.04]"
                  >
                    <div className="px-3.5 py-2.5 text-left ryze-text-primary md:px-4.5 md:py-3.5">
                      <div className="mb-1 sm:mb-1.5 flex items-center gap-1.5 md:gap-2">
                        <Star className="h-3 sm:h-3.5 w-3 sm:w-3.5 text-[var(--accent)] md:h-4 md:w-4" fill="currentColor" />
                        <p className="text-[0.65rem] sm:text-[0.76rem] font-bold uppercase tracking-[0.18em] text-[var(--accent)] md:text-[0.8rem]">
                          ATAR
                        </p>
                      </div>
                      <p className="font-sans text-[1.25rem] sm:text-[1.45rem] font-extrabold tracking-[-0.04em] ryze-text-primary md:text-[1.7rem]">
                        {member.atar}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <img
                src={member.image}
                onError={(e) => {
                  e.currentTarget.src = member.fallback;
                }}
                alt={member.name}
                width={700}
                height={900}
                loading="lazy"
                decoding="async"
                sizes="(max-width: 767px) 90vw, (max-width: 1200px) 33vw, 350px"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-75 transition-opacity duration-500 group-hover:opacity-100"></div>
              <div className="absolute bottom-6 left-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-y-2 group-hover:translate-y-0"></div>
            </div>
            <div className="pl-2">
              <h3 className="mb-1 text-2xl font-display font-bold ryze-text-primary transition-colors group-hover:text-[var(--accent)]">
                {member.name}
              </h3>
              <p className="mb-1.5 text-[0.98rem] font-medium ryze-text-secondary">{member.role}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default TeamPreview;
