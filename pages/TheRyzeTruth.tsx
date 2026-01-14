
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Microscope, Users, BellOff, Zap, ArrowRight, XCircle, CheckCircle2, Quote, Lightbulb } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'framer-motion';

const TheRyzeTruth: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const problems = [
    { icon: Microscope, title: "Problem 1: Misdiagnosis", text: "Most tutoring treats symptoms, not causes. A student struggles with quadratics, so they get drilled on quadratics. The real issue is often years back—a gap in fractions or algebra. We diagnose the root cause." },
    { icon: Users, title: "Problem 2: The Crowd Effect", text: "In large classes, students become invisible. Questions go unasked, confusion goes unnoticed, and teaching is aimed at a non-existent 'average' student. It's inefficient by design." },
    { icon: BellOff, title: "Problem 3: The Silence Problem", text: "Students don't ask questions in large groups. Not because they're shy, but because the social cost is high. It's easier to stay silent than to risk looking foolish. We create a safe space for curiosity." },
    { icon: Zap, title: "Problem 4: One-Pace-Fits-None", text: "Every student learns differently. In large classes, tutors teach to the middle. Advanced students get bored; struggling students get left behind. Almost no one gets what they actually need." },
  ];

  return (
    <div className="font-sans bg-black text-white pt-24">
      {/* Header */}
      <header className="py-24 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black z-10 opacity-50"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_50%)]"></div>
        <div className="relative z-20 max-w-4xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight"
          >
            {t("The Ryze Truth")}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-xl text-gray-400 max-w-2xl mx-auto"
          >
            {t("The story behind why most tutoring fails, and how we engineered a better way.")}
          </motion.p>
        </div>
      </header>

      {/* The Core Tragedy */}
      <section className="py-20 px-4 max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-2xl md:text-3xl leading-relaxed text-gray-300 mb-8">
            {t("Before they find Ryze, most families have already cycled through multiple tutoring centres. They've paid the fees, done the sessions, followed the rules. Months, sometimes years, go by.")}
          </p>
          <p className="text-3xl md:text-4xl font-bold text-white mb-10">
            {t("But the understanding never really changes.")}
          </p>
          <div className="border-l-4 border-yellow-400 pl-8 py-4 bg-gray-900/50 rounded-r-xl">
            <p className="text-xl md:text-2xl italic text-white/90 leading-relaxed">
              {t("And that’s the tragedy: not that the tutoring didn’t work, but that the child starts to believe <span class='text-yellow-400 font-semibold'>they</span> didn’t work.")}
            </p>
          </div>
        </motion.div>
      </section>

      {/* Founder's Story */}
      <section className="py-24 bg-gray-900/70 border-y border-gray-800">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="md:col-span-1 flex justify-center"
          >
            <div className="relative">
                <img 
                    src="https://res.cloudinary.com/dsvjhemjd/image/upload/v1764105304/0739d6ceb5594812228108103c314c99_nd6cb5.jpg" 
                    alt="Michael Yang, Founder"
                    className="w-48 h-48 md:w-56 md:h-56 rounded-full object-cover shadow-2xl shadow-yellow-400/10"
                />
                <Quote className="absolute bottom-0 right-0 w-16 h-16 text-yellow-400/20 translate-x-4 translate-y-4"/>
            </div>
          </motion.div>
          <div className="md:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2 className="text-3xl font-bold text-white mb-6">I Know This Because I've Lived It.</h2>
              <div className="space-y-5 text-gray-300 leading-relaxed">
                  <p>{t("I still remember the feeling. That weight in my chest on the bus ride to tutoring. I wasn't learning; I was enduring. Just another face in a crowded room, staring at a whiteboard, invisible.")}</p>
                  <p>{t("The tutor didn’t know my name. Didn’t see my confusion. The question I asked myself wasn't about math.")}</p>
                  <p className="font-bold text-xl text-yellow-400 italic">{t("'What’s wrong with me?'")}</p>
                  <p className="font-semibold text-white">{t("The truth was simpler: Nothing was wrong with me. Something was wrong with the environment.")}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Why Tutoring Fails */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6">Why Most Tutoring Fails</h2>
            <p className="text-lg text-gray-400">{t("The systemic issues we identified and solved.")}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {problems.map((p, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="border border-gray-800/80 rounded-3xl p-8 bg-gray-900/40 backdrop-blur-sm h-full flex flex-col"
              >
                <div className="mb-6 w-14 h-14 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-yellow-400">
                  <p.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{t(p.title)}</h3>
                <p className="text-gray-400 leading-relaxed flex-grow">{t(p.text)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The Solution */}
      <section className="py-24 bg-gray-900/70 border-y border-gray-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <Lightbulb className="mx-auto text-yellow-400 mb-6" size={40}/>
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">The Solution: An Environment Built to See You</h2>
            <p className="text-xl text-gray-300 leading-relaxed mb-8">
              {t("Ryze was built on a simple premise: effective learning requires individual attention. Our small classes (max 6 students) aren't just a feature; they are the foundation of our entire system. It's what allows for...")}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
              {["Real Diagnosis", "Active Learning", "Safe Questions", "Flexible Pacing"].map((item, i) => (
                <div key={i} className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                  <CheckCircle2 className="text-green-400 mb-2" size={20} />
                  <h4 className="font-semibold text-white">{t(item)}</h4>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* The Real Question CTA */}
      <section className="py-24 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-4xl font-bold text-yellow-400 mb-6">The Real Question</h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              {t("The question isn’t whether small groups are abstractly better. The question is: <span class='font-semibold text-white'>has what you’re currently doing worked?</span> If not, something in that environment is failing your child.")}
            </p>
            <p className="text-gray-400 mb-10">
              {t("Maybe they need real diagnosis. Maybe they need a safe space to ask questions. Maybe they just need to be seen.")}
            </p>
            <motion.button 
              onClick={() => navigate('/contact')}
              whileHover={{ y: -3, boxShadow: "0 10px 20px -5px rgba(250, 204, 21, 0.2)" }}
              className="px-8 py-4 bg-yellow-400 text-black font-bold text-lg rounded-full shadow-lg transition-all"
            >
              {t("Book a Free, No-Obligation Trial")}
            </motion.button>
            <p className="font-semibold text-gray-500 text-sm mt-6">
              {t("If it works, continue. If not, you’ve lost nothing and learned everything.")}
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default TheRyzeTruth;
