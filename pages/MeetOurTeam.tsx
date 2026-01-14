
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { X, ArrowRight } from 'lucide-react';

const team = [
  {
    id: "mike-nojiri",
    name: "Mr Mike Nojiri",
    role: "Head of Education",
    image: "https://res.cloudinary.com/dsvjhemjd/image/upload/v1764105290/Screenshot_2025-11-20_at_11.13.56_pm_gwdxn2.png",
    atar: "99.25",
    scores: ["98 Maths Ext 2", "99 Maths Ext 1", "99 Maths 2U (Accelerated)"],
    creds: ["Master's in Teaching | UNSW", "BSc(Math)/BCompSc | UNSW", "NSW Certified Teacher", "Maths Teacher | Stella Maris College"],
    bio: "As a NSW-certified teacher at Stella Maris College, Mike brings formal qualifications and daily classroom experience. His patient, methodical approach helps students build genuine understanding, not just memorise formulas."
  },
  {
    id: "william-gong",
    name: "Mr William Gong",
    role: "Head of Technology",
    image: "https://res.cloudinary.com/dsvjhemjd/image/upload/v1764105292/Screenshot_2025-11-26_at_12.50.43_am_plfzbu.png",
    atar: "99.50",
    scores: ["99 Maths Ext 2", "97 Maths Ext 1", "97 Physics"],
    creds: ["PhD in AI Candidate | UNSW", "BDataSci (1st Class Hons) | UNSW", "North Sydney Boys Alumni"],
    bio: "William oversees Ryze AI and our learning curriculum. A graduate of North Sydney Boys with First Class Honours from UNSW, his PhD research in AI directly informs our evidence-driven approach to learning."
  },
  {
    id: "gordon-ye",
    name: "Mr Gordon Ye",
    role: "Senior Mentor",
    image: "https://res.cloudinary.com/dsvjhemjd/image/upload/v1764460809/588278725_1528730215077629_8325133640910985831_n_mr2y31.jpg",
    atar: "99.55",
    scores: ["98 Maths Ext 2", "98 Maths Ext 1", "97 Physics"],
    creds: ["BMaths/BCompSc | UNSW", "Software Engineer", "UNSW Academic Teaching Staff", "Girraween High Alumni"],
    bio: "Gordon connects high school concepts to real-world applications. As UNSW teaching staff and a Software Engineer, he provides unparalleled insight into university and career pathways."
  },
  {
    id: "michael-yang",
    name: "Mr Michael Yang",
    role: "Founder",
    image: "https://res.cloudinary.com/dsvjhemjd/image/upload/v1764105304/0739d6ceb5594812228108103c314c99_nd6cb5.jpg",
    atar: null,
    scores: [],
    creds: ["BCom/BCompSc | UNSW", "DevOps Engineer", "The King's School Alumni"],
    bio: "Michael founded Ryze to fix the problems he saw in mainstream tutoring. He built our small-group model from the ground up, focusing on meaningful interaction and genuine student outcomes over profit."
  },
];

const TeamCard = ({ member, onSelect }: any) => (
  <motion.div 
    layoutId={`card-${member.id}`}
    onClick={() => onSelect(member)}
    className="relative aspect-[3/4] rounded-3xl overflow-hidden cursor-pointer group border-2 border-gray-800/80 hover:border-yellow-400/50 transition-all duration-300"
  >
    <img src={member.image} alt={member.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
    <div className="absolute bottom-0 left-0 p-6">
      <motion.h3 layoutId={`name-${member.id}`} className="text-2xl font-bold text-white tracking-tight">{member.name}</motion.h3>
      <motion.p layoutId={`role-${member.id}`} className="text-yellow-400 font-semibold tracking-wide">{member.role}</motion.p>
    </div>
    {member.atar && (
      <motion.div layoutId={`atar-${member.id}`} className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full px-4 py-1.5 text-white text-sm font-bold border border-white/20">
        ATAR {member.atar}
      </motion.div>
    )}
  </motion.div>
);

const MeetTheTeam: React.FC = () => {
  const { t } = useLanguage();
  const [selected, setSelected] = useState<any>(null);

  return (
    <div className="font-sans bg-black text-white pt-24 min-h-screen">
      {/* Header */}
      <header className="py-24 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_40%)]"></div>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
          {t("Meet The Mentors")}
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }} className="text-xl text-gray-400 max-w-2xl mx-auto">
          {t("Our educators are more than just tutors. They are qualified teachers, industry professionals, and academic high-achievers united by a passion for teaching.")}
        </motion.p>
      </header>

      {/* Team Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member) => (
            <TeamCard key={member.id} member={member} onSelect={setSelected} />
          ))}
        </div>
      </div>
      
      {/* Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div 
            className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div 
              layoutId={`card-${selected.id}`} 
              className="relative w-full max-w-4xl max-h-[90vh] bg-gray-900 rounded-3xl overflow-hidden border border-gray-700/80"
              onClick={(e) => e.stopPropagation()}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 h-full">
                  <div className="relative aspect-[3/4] md:aspect-auto">
                    <img src={selected.image} alt={selected.name} className="absolute w-full h-full object-cover"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-8 w-full">
                      <motion.h3 layoutId={`name-${selected.id}`} className="text-4xl font-bold text-white tracking-tight">{selected.name}</motion.h3>
                      <motion.p layoutId={`role-${selected.id}`} className="text-yellow-400 font-semibold text-lg tracking-wide">{selected.role}</motion.p>
                    </div>
                    {selected.atar && (
                      <motion.div layoutId={`atar-${selected.id}`} className="absolute top-6 right-6 bg-black/50 backdrop-blur-sm rounded-full px-4 py-1.5 text-white text-sm font-bold border border-white/20">
                        ATAR {selected.atar}
                      </motion.div>
                    )}
                  </div>
                  <div className="p-8 overflow-y-auto">
                      {selected.scores.length > 0 && (
                        <div className="mb-6">
                          <h4 className="font-semibold text-yellow-400 tracking-wide uppercase mb-2">Top Scores</h4>
                          <div className="flex flex-wrap gap-2">
                            {selected.scores.map((score: string, i: number) => (
                              <span key={i} className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm font-medium border border-gray-700">{score}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="mb-6">
                          <h4 className="font-semibold text-yellow-400 tracking-wide uppercase mb-2">Credentials</h4>
                          <ul className="space-y-2">
                            {selected.creds.map((cred: string, i: number) => (
                              <li key={i} className="flex items-center gap-2 text-gray-300">
                                <ArrowRight className="w-4 h-4 text-yellow-400/50 shrink-0" />
                                <span>{cred}</span>
                              </li>
                            ))}
                          </ul>
                      </div>
                      <div>
                          <h4 className="font-semibold text-yellow-400 tracking-wide uppercase mb-2">Bio</h4>
                          <p className="text-gray-400 leading-relaxed">{selected.bio}</p>
                      </div>
                  </div>
                </div>
              <motion.button onClick={() => setSelected(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-700/80 rounded-full p-2 transition-colors">
                <X size={20} />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default MeetTheTeam;
