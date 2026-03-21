import React from 'react';
import { motion as motionOriginal } from 'framer-motion';
import { Star } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const motion = motionOriginal as any;

const MeetTheTeam: React.FC = () => {
  const { t } = useLanguage();

  const team = [
    {
      id: 'mike-nojiri',
      name: 'Mike Nojiri',
      role: 'Head of Education',
      image:
        'https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto:good,c_fill,g_auto,w_900,h_1125,dpr_auto/v1769561928/869fcdd5dfa6efd8ee8853d9e0eea053_kiv4v2.jpg',
      fallbackImage:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      atar: '99.25',
      scores: ['98 Maths Ext 2', '|', '99 Maths Ext 1', '99 Maths Advanced (Accelerated)'],
      creds: [
        "Master's in Teaching (UNSW)",
        'BSc(Math)/BCompSc (UNSW)',
        'NSW Certified Teacher',
        'Maths Teacher at Stella Maris College',
        "The King's School Alumni",
      ],
      quote:
        "Small groups aren't just better - they're how teaching should work. Every student deserves individual attention.",
      bio: [
        'Mike leads all teaching operations at Ryze. As a NSW-certified teacher currently teaching at Stella Maris College in Manly, he brings formal qualifications and daily classroom experience to every session.',
        'His patient, methodical approach helps students build genuine understanding, not just memorise formulas.',
      ],
    },
    {
      id: 'william-gong',
      name: 'William Gong',
      role: 'Head of Technology',
      image:
        'https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto:good,c_fill,g_auto,w_900,h_1125,dpr_auto/v1769568491/34b29c410f6278cf36653c984998c5fe_diuyma.jpg',
      fallbackImage:
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      atar: '99.50',
      scores: ['99 Maths Ext 2', '|', '97 Maths Ext 1', '|', '97 Physics', '|', '94 Chemistry'],
      creds: [
        '<strong>PhD</strong> - AI & Machine Learning Candidate (UNSW)',
        '<strong>BDataSci</strong> - First Class Honours (UNSW)',
        'North Sydney Boys High School Alumni',
      ],
      bio: [
        'William co-founded Ryze to demonstrate the value of structured, attentive teaching for developing deep, durable understanding. As Head of Technology, he oversees the development of Ryze AI, the learning curriculum, and the educational platform, ensuring that each component is built on rigorous mathematical standards and clear insight into where students typically encounter difficulty.',
        "A graduate of North Sydney Boys High School, William completed a Bachelor of Data Science and Decisions with First Class Honours at UNSW, ranking among the university's highest-performing students. He is currently undertaking a PhD in AI and Machine Learning, where his research focuses on how intelligent systems learn and adapt. This work directly informs Ryze's evidence-driven design and its commitment to developing technology that supports meaningful, measurable learning gains.",
      ],
    },
    {
      id: 'gordon-ye',
      name: 'Gordon Ye',
      role: 'Senior Mentor',
      image:
        'https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto:good,c_fill,g_auto,w_900,h_1125,dpr_auto/v1764460809/588278725_1528730215077629_8325133640910985831_n_mr2y31.jpg',
      fallbackImage:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      atar: '99.55',
      scores: ['98 Maths Ext 2', '|', '98 Maths Ext 1', '|', '97 Physics', '|', '96 Chemistry'],
      creds: [
        'BMaths/BCompSc (UNSW)',
        'Software Engineer',
        'UNSW Academic Teaching Staff',
        'Girraween High School Alumni',
        "<strong>2023 Faculty of Science Prize</strong> for 3rd Year Science (First in Cohort)",
        "<strong>2023 Faculty of Dean's List</strong>",
        "<strong>90 WAM</strong> Dean's List Computer Science",
      ],
      bio: [
        "Gordon brings a unique blend of academic excellence and practical experience to his tutoring. As a member of UNSW's Academic Teaching Staff and a practising software engineer, he connects high school concepts to university-level applications and real-world problem-solving.",
        "His academic achievements speak for themselves: he ranked first in his science cohort at UNSW, maintains a high distinction average in computer science, and achieved near-perfect scores in Extension 2 Mathematics during his own HSC. He was awarded a full scholarship to pursue doctoral study in engineering at UNSW.",
      ],
    },
    {
      id: 'michael-yang',
      name: 'Michael Yang',
      role: 'Founder',
      image:
        'https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto:good,c_fill,g_auto,w_900,h_1125,dpr_auto/v1764105304/0739d6ceb5594812228108103c314c99_nd6cb5.jpg',
      fallbackImage:
        'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      wordsFromFounder:
        "At Ryze, we believe education is more than grades - it's about unlocking potential and building confidence for life.\n\nEvery student learns differently, and our mission is to create personalised pathways that make learning engaging, effective, and empowering.\n\nWe're here to turn challenges into opportunities, inspire curiosity, and help every learner achieve success - not just in school, but in life.\n\nYour goals are our goals, and together, we'll make them happen.",
    },
  ];

  return (
    <div className="ryze-page min-h-screen pt-20 text-[var(--text)]">
      <div className="ryze-page-hero relative overflow-hidden border-b border-[var(--border)] px-4 pb-24 pt-24">
        <div className="absolute left-1/2 top-0 -z-10 h-[400px] w-[1000px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(243,231,201,0.55),transparent_70%)] opacity-80 blur-3xl"></div>
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="ryze-page-title mb-6 text-5xl font-display font-bold tracking-tight md:text-7xl">
            {t('Meet Our Team')}
          </h1>
          <p className="ryze-page-lead mx-auto max-w-2xl text-xl font-light leading-relaxed">
            {t('Our experienced educators are committed to helping every student thrive. Not just tutors, but qualified teachers and high-achievers.')}
          </p>
        </div>
      </div>

      <div className="bg-[var(--bg)]">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="space-y-40">
            {team.map((member, idx) => (
              <motion.div
                key={member.id}
                id={member.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6 }}
                className={`scroll-mt-32 items-start gap-16 lg:gap-24 ${idx % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} flex flex-col`}
              >
                <div className="w-full shrink-0 lg:w-5/12">
                  {member.scores && member.scores.length > 0 && (
                    <div className="mb-6">
                      <div className="rounded-[1.35rem] border border-[var(--border)] bg-[rgba(248,243,234,0.92)] p-4 backdrop-blur-md shadow-[0_18px_40px_-30px_rgba(17,21,29,0.28)]">
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

                  <div className="group relative">
                    <div
                      className={`absolute top-10 -z-10 h-full w-full rounded-[3rem] bg-[rgba(243,231,201,0.52)] transition-transform duration-500 group-hover:rotate-[4deg] ${idx % 2 === 0 ? '-left-10 rotate-3' : '-right-10 -rotate-3'}`}
                    ></div>

                    <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] border-8 border-white shadow-2xl">
                      {member.atar && (
                        <div className="absolute left-2 top-2 z-20 md:left-4 md:top-4">
                          <div className="transform rounded-[1.15rem] border border-[rgba(184,132,30,0.18)] bg-[rgba(248,243,234,0.92)] shadow-[0_18px_40px_-26px_rgba(17,21,29,0.34)] backdrop-blur-xl transition-transform duration-300 ease-in-out md:rounded-[1.35rem] md:hover:scale-[1.04]">
                            <div className="px-3.5 py-2.5 text-left text-[var(--primary)] md:px-4.5 md:py-3.5">
                              <div className="mb-1.5 flex items-center gap-1.5 md:gap-2">
                                <Star className="h-3.5 w-3.5 text-[var(--accent)] md:h-4 md:w-4" fill="currentColor" />
                                <p className="text-[0.76rem] font-bold uppercase tracking-[0.18em] text-[var(--accent)] md:text-[0.8rem]">
                                  ATAR
                                </p>
                              </div>
                              <p className="font-sans text-[1.45rem] font-extrabold tracking-[-0.04em] text-[var(--primary)] md:text-[1.7rem]">
                                {member.atar}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <img
                        src={member.image}
                        onError={(e) => {
                          e.currentTarget.src = member.fallbackImage;
                        }}
                        alt={member.name}
                        width={720}
                        height={900}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80"></div>
                      <div className="absolute bottom-0 left-0 w-full p-8 text-white">
                        <h3 className="mb-2 text-4xl font-display font-bold tracking-tight">{t(member.name)}</h3>
                        <p className="text-sm font-bold uppercase tracking-widest text-[var(--color-ryze)]">
                          {t(member.role)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full space-y-10 lg:w-7/12">
                  {member.id === 'michael-yang' ? (
                    <div className="ryze-page-card rounded-3xl p-8">
                      <h4 className="mb-6 text-2xl font-bold uppercase tracking-widest text-[var(--accent)]">
                        Words from the Founder
                      </h4>
                      <p className="whitespace-pre-line text-lg font-light leading-relaxed text-[var(--muted)]">
                        {member.wordsFromFounder}
                      </p>
                    </div>
                  ) : (
                    <div className="ryze-page-card rounded-3xl p-8">
                      <h4 className="mb-6 text-lg font-bold uppercase tracking-widest text-[var(--accent)]">
                        {t('Credentials')}
                      </h4>
                      <ul className="flex flex-wrap gap-3">
                        {member.creds?.map((cred, i) => (
                          <li
                            key={i}
                            className="inline-flex items-center rounded-xl border border-[var(--border)] bg-white/70 px-4 py-2 text-sm font-medium text-[var(--muted)]"
                          >
                            <span dangerouslySetInnerHTML={{ __html: cred }}></span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {member.quote && (
                    <div className="relative border-l-4 border-[var(--accent)] pl-8">
                      <blockquote className="font-display text-2xl font-medium leading-relaxed text-[var(--primary)]">
                        "{member.quote}"
                      </blockquote>
                    </div>
                  )}

                  {member.bio && member.bio.length > 0 && (
                    <div className="space-y-6 text-lg font-light leading-relaxed text-[var(--muted)]">
                      {member.bio.map((paragraph, i) => (
                        <p key={i}>{paragraph}</p>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetTheTeam;
