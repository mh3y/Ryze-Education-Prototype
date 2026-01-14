
import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Users, Star, Trophy, Activity, GraduationCap, PenTool, Smile, Laptop, ArrowRight, CheckCircle2, Phone, MessageCircle, Sparkles, Clock, MoveRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const WordRotate = ({ words, className }: { words: string[], className?: string }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <div className="relative h-16 md:h-20 lg:h-24 overflow-hidden">
      <AnimatePresence>
        <motion.span
          key={index}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className={`absolute inset-0 text-yellow-400 ${className}`}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

const AnimatedNumber = ({ value }: { value: number }) => {
  const [current, setCurrent] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (inView) {
      const controls = animate(0, value, {
        duration: 2,
        ease: "easeOut",
        onUpdate(latest) {
          setCurrent(Math.floor(latest));
        },
      });
      return () => controls.stop();
    }
  }, [inView, value]);

  return <span ref={ref}>{current}</span>;
};


const FeatureCard = ({ icon: Icon, title, desc, index }: { icon: React.ElementType, title: string, desc: string, index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
    className="border border-gray-800/80 rounded-3xl p-8 bg-gray-900/40 backdrop-blur-sm relative overflow-hidden h-full flex flex-col"
  >
    <div className="absolute -top-1 -right-1 w-24 h-24 bg-yellow-400/10 blur-2xl"></div>
    <div className="mb-6 w-14 h-14 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-yellow-400">
      <Icon size={28} />
    </div>
    <h3 className="text-xl font-bold text-white mb-3 tracking-wide">{t(title)}</h3>
    <p className="text-gray-400 leading-relaxed flex-grow">{t(desc)}</p>
  </motion.div>
);

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const heroWords = ["Purpose", "Clarity", "Excellence"];

  const stats = [
    { value: 99.95, label: "Highest ATAR" },
    { value: 100, label: "Success Rate" },
    { value: 8, label: "Years Experience" },
  ];

  const features = [
    { icon: Users, title: "Small Group Focus", desc: "Never get lost in the crowd. Our small classes ensure personalised attention and maximum engagement." },
    { icon: Star, title: "Signature Curriculum", desc: "Developed in-house by expert NSW teachers, our resources are syllabus-aligned and results-oriented." },
    { icon: Trophy, title: "Complete Support", desc: "From homework help between sessions to university pathway guidance, we are your dedicated academic mentors." },
    { icon: Activity, title: "Dynamic Progress Tracking", desc: "We continuously monitor, analyse, and optimise your performance to ensure you're always on the path to success." },
  ];

  const logos = [
    "https://res.cloudinary.com/dsvjhemjd/image/upload/v1716353347/unsw_sok9vi.png",
    "https://res.cloudinary.com/dsvjhemjd/image/upload/v1716353347/usyd_t24aqe.png",
    "https://res.cloudinary.com/dsvjhemjd/image/upload/v1716353347/uts_sogeli.png",
    "https://res.cloudinary.com/dsvjhemjd/image/upload/v1716353347/macquarie_dpdaxv.png",
    "https://res.cloudinary.com/dsvjhemjd/image/upload/v1716353347/google_xxp2cv.png",
    "https://res.cloudinary.com/dsvjhemjd/image/upload/v1716353347/atlassian_rswfe8.png",
    "https://res.cloudinary.com/dsvjhemjd/image/upload/v1716353347/canva_hb9nqr.png",
  ];

  const testimonials = [
    { text: "Ryze's methods are game-changing. I went from a B- to a State Rank.", author: "Jessica L, HSC 2023" },
    { text: "The personalised attention is unmatched. I finally understand concepts I've struggled with for years.", author: "Ben C, Year 11" },
    { text: "More than just tutors, they are genuine mentors who care about your success.", author: "Samantha K, Parent" },
  ];
  
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start end', 'end start'] });
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);

  return (
    <div className="w-full font-sans bg-black text-white overflow-hidden">
      
      {/* Hero Section */}
      <section className="relative h-[100vh] min-h-[700px] flex items-center justify-center text-center pt-20 pb-10 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black z-10"></div>
        <motion.div style={{ scale: videoScale }} className="absolute inset-0 w-full h-full object-cover">
            <video src="https://res.cloudinary.com/dsvjhemjd/video/upload/v1716355835/hero-video_lffp2i.mp4" autoPlay loop muted playsInline className="w-full h-full object-cover"></video>
            <div className="absolute inset-0 bg-black/60"></div>
        </motion.div>
        <div ref={containerRef} className="relative z-20 flex flex-col items-center justify-center h-full">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }} className="space-y-6">
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white leading-[1.1] tracking-tight">
                    Teaching with <br />
                    <WordRotate words={heroWords} />
                </h1>
                <p className="text-lg md:text-xl lg:text-2xl font-medium text-gray-300 max-w-2xl mx-auto">
                    {t("Sydney's leading tutors for Maths, English & Science. We turn potential into proven performance.")}
                </p>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
                    <motion.button onClick={() => navigate('/contact')} whileHover={{ y: -3, boxShadow: "0 20px 25px -5px rgba(250, 204, 21, 0.3), 0 8px 10px -6px rgba(250, 204, 21, 0.3)" }} transition={{ duration: 0.3 }} className="px-8 py-4 bg-yellow-400 text-black font-bold text-lg rounded-full shadow-lg w-full sm:w-auto">
                        {t("Book a Free Trial")}
                    </motion.button>
                    <motion.button onClick={() => navigate('/how-ryze-works')} whileHover={{ y: -3 }} className="px-8 py-4 bg-gray-800/60 backdrop-blur-sm border border-gray-700 font-bold text-lg rounded-full w-full sm:w-auto flex items-center gap-2 justify-center">
                        {t("How It Works")} <MoveRight size={20} />
                    </motion.button>
                </div>
            </motion.div>
            <div className="absolute bottom-10 flex flex-col items-center gap-2 text-gray-400">
                <p className="text-sm">Our tutors are from</p>
                <div className="flex gap-6 items-center">
                    {logos.slice(0, 4).map((logo, i) => (
                        <img key={i} src={logo} alt="University Logo" className="h-5 opacity-60 invert" />
                    ))}
                </div>
            </div>
        </div>
      </section>

      {/* Infinite Scroll Logos */}
      <div className="py-12 bg-black">
        <div className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
          <ul className="flex items-center justify-center md:justify-start [&_li]:mx-8 [&_img]:max-w-none animate-infinite-scroll">
            {logos.map((logo, i) => <li key={i}><img src={logo} alt="Company Logo" className="h-6 invert opacity-50"/></li>)}
          </ul>
          <ul className="flex items-center justify-center md:justify-start [&_li]:mx-8 [&_img]:max-w-none animate-infinite-scroll" aria-hidden="true">
            {logos.map((logo, i) => <li key={i}><img src={logo} alt="Company Logo" className="h-6 invert opacity-50"/></li>)}
          </ul>
        </div>
      </div>

      {/* Stats Section */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {stats.map((stat, i) => (
              <div key={i} className="p-8 bg-gray-900/40 rounded-3xl border border-gray-800/80">
                <h3 className="text-6xl lg:text-7xl font-bold text-yellow-400 mb-2">
                  <AnimatedNumber value={stat.value} />{stat.label.includes("Rate") ? "%" : ""}
                </h3>
                <p className="text-gray-400 font-medium">{t(stat.label)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Features Grid */}
      <section className="py-24 px-4 bg-black relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03),transparent_40%)]"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
              The Ryze Difference
            </h2>
            <p className="text-lg text-gray-400 font-normal">
              We've engineered a learning system that goes beyond traditional tutoring, focusing on deep understanding, confidence, and peak performance.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, idx) => (
              <FeatureCard {...feature} index={idx} key={idx} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-24 bg-black">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Sparkles className="mx-auto text-yellow-400 mb-4" size={32} />
          <motion.blockquote
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true, margin: "-100px" }}
             transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-2xl md:text-3xl font-medium text-white/90 leading-relaxed">
              "{t(testimonials[0].text)}"
            </p>
            <footer className="mt-6 text-gray-400 font-medium">
              - {t(testimonials[0].author)}
            </footer>
          </motion.blockquote>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
            <div className="relative rounded-3xl bg-gray-900 border border-gray-800/80 overflow-hidden shadow-2xl shadow-yellow-400/10">
                <div className="absolute inset-0 w-full h-full bg-[url('https://res.cloudinary.com/dsvjhemjd/image/upload/v1716352933/noise_qs9f1z.png')] opacity-20"></div>
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-yellow-400/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center p-10 md:p-16 lg:p-20">
                    <div className="space-y-6">
                        <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight tracking-tight">
                            Ready to realise your potential?
                        </h2>
                        <p className="text-lg text-gray-400 max-w-lg">
                            Join hundreds of students achieving their best with Ryze. Expert tutors, personalised attention, and proven results await.
                        </p>
                        <div className="pt-4">
                           <motion.button onClick={() => navigate('/contact')} whileHover={{ y: -3, boxShadow: "0 10px 20px -5px rgba(250, 204, 21, 0.2)" }} className="px-8 py-4 bg-yellow-400 text-black font-bold text-lg rounded-full shadow-lg transition-all">
                                {t("Book Your Free Trial Lesson")}
                            </motion.button>
                        </div>
                    </div>
                    <div className="hidden lg:block relative h-80">
                      <img src="https://res.cloudinary.com/dsvjhemjd/image/upload/v1716356784/cta-graphic_xddg6l.png" alt="Ryze Graph" className="absolute w-full h-full object-contain" />
                    </div>
                </div>
            </div>
        </div>
      </section>
    </div>
  );
};

// Dummy AnimatePresence for the case when framer-motion is not fully imported
const AnimatePresence = ({ children }: { children: React.ReactNode }) => <>{children}</>;
import { animate } from 'framer-motion';

export default Home;
