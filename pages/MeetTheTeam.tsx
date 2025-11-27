
import React from 'react';
import { motion as motionOriginal } from 'framer-motion';
const motion = motionOriginal as any;

const MeetTheTeam: React.FC = () => {
  const team = [
    {
      id: "mike-nojiri",
      name: "Mr Mike Nojiri",
      role: "Co-Founder & Head of Education",
      image: "https://res.cloudinary.com/dsvjhemjd/image/upload/v1764105290/Screenshot_2025-11-20_at_11.13.56_pm_gwdxn2.png",
      fallbackImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      creds: [
        "Master of Teaching | UNSW",
        "BSc(Maths)/BCompSc",
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
      role: "Co-Founder & Head of Technology",
      image: "https://res.cloudinary.com/dsvjhemjd/image/upload/v1764105292/Screenshot_2025-11-26_at_12.50.43_am_plfzbu.png",
      fallbackImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
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
      id: "michael-yang",
      name: "Mr Michael Yang",
      role: "Founder & CEO",
      image: "https://res.cloudinary.com/dsvjhemjd/image/upload/v1764105304/0739d6ceb5594812228108103c314c99_nd6cb5.jpg",
      fallbackImage: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      creds: [
        "BCom/BCompSc UNSW",
        "DevOps Engineer",
        "The King's School Alumni"
      ],
      bio: [
        "Michael founded Ryze after recognising the limitations of large, standardised tutoring environments. Having experienced classrooms where individual students were easily overlooked, he set out to design a model that prioritises meaningful interaction and genuine instructional attention.",
        "Drawing on his tutoring background, he observed that students rarely needed more worksheets or higher difficulty tasks; they needed a setting where they could ask questions freely, receive clear explanations, and engage with material at a pace that matched their understanding.",
        "This insight shaped Ryze’s core principles. Instead of maximising class size, Michael built the organisation around small-group learning, capping classes at six students, employing teachers who value personalised instruction, and adopting operational practices centred on long-term student outcomes rather than volume."
      ]
    }
  ];

  return (
    <div className="pt-20 font-sans bg-white min-h-screen">
      <div className="bg-white pt-24 pb-24 px-4 border-b border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-b from-slate-50 to-transparent opacity-50 rounded-full blur-3xl -z-10"></div>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-sans font-bold mb-6 text-slate-900 tracking-tight">Meet Our Team</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto font-light leading-relaxed">
              Meet the tutors who make learning click. Our experienced educators are committed to helping every student thrive.
          </p>
        </div>
      </div>

      <div className="bg-slate-50">
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
                    {/* Decorative Blob */}
                    <div className={`absolute top-10 ${idx % 2 === 0 ? '-left-10' : '-right-10'} w-full h-full bg-[#FFB000]/10 rounded-[3rem] -z-10 transform rotate-3 group-hover:rotate-6 transition-transform duration-500`}></div>
                    
                    <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl relative border-8 border-white">
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
                         <h3 className="text-4xl font-bold font-sans mb-2 tracking-tight">{member.name}</h3>
                         <p className="text-[#FFB000] font-bold uppercase tracking-widest text-sm">{member.role}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full lg:w-7/12 space-y-10">
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/50">
                       <h4 className="text-slate-400 font-bold mb-6 uppercase tracking-widest text-xs">Credentials</h4>
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
