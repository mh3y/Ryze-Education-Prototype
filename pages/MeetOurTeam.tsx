
import React from 'react';
import { motion as motionOriginal } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
const motion = motionOriginal as any;

const MeetTheTeam: React.FC = () => {
  const { t } = useLanguage();
  
  const team = [
    {
      id: "mike-nojiri",
      name: "Mr Mike Nojiri",
      role: "Head of Education",
      image: "https://res.cloudinary.com/dsvjhemjd/image/upload/v1764105290/Screenshot_2025-11-20_at_11.13.56_pm_gwdxn2.png",
      fallbackImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      atar: "99.25",
      scores: ["98 Maths Ext 2", "99 Maths Ext 1", "99 Maths 2U (Accelerated)"],
      creds: [
        "Master's in Teaching | UNSW",
        "BSc(Math)/BCompSc | UNSW",
        "NSW Certified Teacher",
        "Maths Teacher | Stella Maris College",
        "The King's School Alumni"
      ],
      quote: "Small groups aren't just better—they're how teaching should work. Every student deserves individual attention.",
      bio: [
        "Mike leads all teaching operations at Ryze. As a NSW-certified teacher currently teaching at Stella Maris College in Manly, he brings formal qualifications and daily classroom experience to every session.",
        "His patient, methodical approach helps students build genuine understanding, not just memorise formulas."
      ]
    },
    {
      id: "william-gong",
      name: "Mr William Gong",
      role: "Head of Technology",
      image: "https://res.cloudinary.com/dsvjhemjd/image/upload/v1764105292/Screenshot_2025-11-26_at_12.50.43_am_plfzbu.png",
      fallbackImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      atar: "99.50",
      scores: ["99 Maths Ext 2", "97 Maths Ext 1", "97 Physics", "94 Chemistry"],
      creds: [
        "<strong>PhD</strong> – AI & Machine Learning Candidate | UNSW",
        "<strong>BDataSci</strong> – First Class Honours | UNSW",
        "North Sydney Boys High School Alumni"
      ],
      bio: [
        "William co-founded Ryze to demonstrate the effectiveness of small-group learning for developing deep, durable understanding. As Head of Technology, he oversees the development of Ryze AI, the learning curriculum, and the educational platform, ensuring that each component is built on rigorous mathematical standards and clear insight into where students typically encounter difficulty.",
        "A graduate of North Sydney Boys High School, William completed a Bachelor of Data Science and Decisions with First Class Honours at UNSW, ranking among the university’s highest-performing students. He is currently undertaking a PhD in AI and Machine Learning, where his research focuses on how intelligent systems learn and adapt. This work directly informs Ryze’s evidence-driven design and its commitment to developing technology that supports meaningful, measurable learning gains."
      ]
    },
    {
      id: "gordon-ye",
      name: "Mr Gordon Ye",
      role: "Senior Mentor",
      image: "https://res.cloudinary.com/dsvjhemjd/image/upload/v1764460809/588278725_1528730215077629_8325133640910985831_n_mr2y31.jpg",
      fallbackImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      atar: "99.55",
      scores: ["98 Maths Ext 2", "98 Maths Ext 1", "97 Physics", "96 Chemistry"],
      creds: [
        "BMaths/BCompSc | UNSW",
        "Software Engineer",
        "UNSW Academic Teaching Staff",
        "Girraween High School Alumni",
        "<strong>2023 Faculty of Science Prize</strong> for 3rd Year Science (First in Cohort)",
        "<strong>2023 Faculty of Dean's List</strong>",
        "<strong>90 WAM</strong> Dean's List Computer Science"
      ],
      bio: [
        "Gordon brings a unique blend of academic excellence and practical experience to his tutoring. As a member of UNSW's Academic Teaching Staff and a practicing Software Engineer, he connects high school concepts to university-level applications and real-world problem-solving.",
        "His academic achievements speak for themselves: he ranked first in his Science cohort at UNSW (Faculty Prize), maintains a High Distinction average in Computer Science, and achieved near-perfect scores in Extension 2 Mathematics during his own HSC. He was awarded a full scholarship to pursue a full-time Doctorate (PhD) in Engineering, granted to the brightest students in UNSW's Faculty of Engineering."
      ]
    },
    {
      id: "michael-yang",
      name: "Mr Michael Yang",
      role: "Founder",
      image: "https://res.cloudinary.com/dsvjhemjd/image/upload/v1764105304/0739d6ceb5594812228108103c314c99_nd6cb5.jpg",
      fallbackImage: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      scores: [],
      creds: [
        "BCom/BCompSc | UNSW",
        "DevOps Engineer",
        "The King's School Alumni"
      ],
      bio: [
        "Michael founded Ryze after recognising the limitations of large, standardised tutoring environments. Having experienced classrooms where individual students were easily overlooked, he set out to design a model that prioritises meaningful interaction and genuine instructional attention.",
        "Drawing on his extensive tutoring background, he observed that students rarely needed more worksheets or higher difficulty tasks; they needed a setting where they could ask questions freely, receive clear explanations, and engage with material at a pace that matched their understanding.",
        "This insight shaped Ryze’s core principles. Instead of maximising class size, Michael built the organisation around small-group learning, capping classes at six students, employing teachers who value personalised instruction, and adopting operational practices centred on long-term student outcomes rather than volume."
      ]
    }
  ];

  return (
    <div className="pt-20 font-sans bg-white min-h-screen">
      <div className="bg-white pt-24 pb-24 px-4 border-b border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-b from-slate-50 to-transparent opacity-50 rounded-full blur-3xl -z-10"></div>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-sans font-bold mb-6 text-slate-900 tracking-tight">{t("Meet Our Team")}</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto font-light leading-relaxed">
              {t("Our experienced educators are committed to helping every student thrive. Not just tutors, but qualified teachers and high-achievers.")}
          </p>
        </div>
      </div>

      <div className="bg-slate-25">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="space-y-40">
            {team.map((member, idx) => (
              <motion.div 
                key={idx} 
                id={member.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className={`flex flex-col ${idx % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-16 lg:gap-24 items-center scroll-mt-32`}
              >
                  <div className="w-full lg:w-5/12 shrink-0 relative group">
                    <div className={`absolute top-10 ${idx % 2 === 0 ? '-left-10' : '-right-10'} w-full h-full bg-[#FFB000]/10 rounded-[3rem] -z-10 transform rotate-3 group-hover:rotate-6 transition-transform duration-500`}></div>
                    
                    <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl relative border-8 border-white">
                      {member.atar && (
                        <div className="absolute bottom-4 right-4 z-20">
                          <div className="bg-[#FFB000]/80 backdrop-blur-sm rounded-full px-4 py-2">
                            <p className="text-white text-sm font-bold">
                              ATAR <span className="font-mono">{member.atar}</span>
                            </p>
                          </div>
                        </div>
                      )}

                      {member.scores && member.scores.length > 0 && (
                        <div className="absolute top-0 left-0 w-full p-4 z-10">
                          <div className="bg-[#ffb000]/75 backdrop-blur-md rounded-xl p-3">
                            <h4 className="text-sm font-bold text-white mb-2 text-center uppercase tracking-wider">HSC Marks</h4>
                            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
                              {member.scores.map((score, i) => (
                                <span key={i} className="text-sm font-semibold text-white">{score}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      <img 
                        src={member.image} 
                        onError={(e) => {e.currentTarget.src = member.fallbackImage}}
                        alt={member.name} 
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80"></div>
                      <div className="absolute bottom-0 left-0 p-8 text-white w-full">
                         <h3 className="text-4xl font-bold font-sans mb-2 tracking-tight">{t(member.name)}</h3>
                         <p className="text-[#FFB000] font-bold uppercase tracking-widest text-sm">{t(member.role)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full lg:w-7/12 space-y-10">
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/50">
                       <h4 className="text-[#ffb000] font-bold mb-6 uppercase tracking-widest text-lg">{t("Credentials")}</h4>
                       <ul className="flex flex-wrap gap-3">
                         {member.creds.map((cred, i) => (
                           <li key={i} className="inline-flex items-center px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 text-sm font-medium">
                             <span dangerouslySetInnerHTML={{ __html: cred }}></span>
                           </li>
                         ))}
                       </ul>
                    </div>
                    
                    {member.quote && (
                       <div className="relative pl-8 border-l-4 border-[#FFB000]">
                         <blockquote className="italic text-slate-900 font-medium text-2xl leading-relaxed font-sans">
                           "{member.quote}"
                         </blockquote>
                       </div>
                    )}
                    
                    <div className="space-y-6 text-lg text-slate-600 leading-relaxed font-light">
                       {member.bio.map((paragraph, i) => (
                          <p key={i}>
                            {paragraph}
                          </p>
                       ))}
                    </div>
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
