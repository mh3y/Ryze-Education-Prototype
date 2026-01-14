
import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useMotionTemplate, useMotionValue, AnimatePresence } from 'framer-motion';
import { Brain, GitBranch, Lightbulb, BarChart3, ArrowRight, GraduationCap, ChevronDown, Terminal, Cpu, Activity, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const SpotlightCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => {
 const mouseX = useMotionValue(0);
 const mouseY = useMotionValue(0);

 function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
   const { left, top } = currentTarget.getBoundingClientRect();
   mouseX.set(clientX - left);
   mouseY.set(clientY - top);
 }

 return (
   <div
     className={`group relative border border-gray-800/80 bg-gray-900/40 backdrop-blur-sm overflow-hidden rounded-3xl ${className}`}
     onMouseMove={handleMouseMove}
   >
     <motion.div
       className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
       style={{
         background: useMotionTemplate`
           radial-gradient(
             450px circle at ${mouseX}px ${mouseY}px,
             rgba(250, 204, 21, 0.15),
             transparent 80%
           )
         `,
       }}
     />
     <div className="relative h-full">
       {children}
     </div>
   </div>
 );
};

const CodeTerminal = () => {
 const { t } = useLanguage();
 const [lines, setLines] = useState<string[]>([]);
  
  useEffect(() => {
   const codeSequence = [
     "> Pinging Student_Knowledge_Graph...",
     "> Status: Connected [Latency: 12ms]",
     "> Analyzing input: '2x + 5 = 15' ...",
     "> Error Detected: Inverse Operation Misapplication",
     "> Root Cause Identification: Pre-Algebra_Foundations -> Solving_Linear_Equations",
     "> Confidence Score: 98.4%",
     "> Generating Micro-Lesson: 'Two-Step Equation Balancing'...",
     "> Deploying Visual_Model_Module_4...",
     "> Ready for interaction."
   ];

   let currentIndex = 0;
   let timeoutId: ReturnType<typeof setTimeout>;
   let intervalId: ReturnType<typeof setInterval>;

   setLines([]);

   intervalId = setInterval(() => {
     if (currentIndex < codeSequence.length) {
       setLines(prev => [...prev, codeSequence[currentIndex]]);
       currentIndex++;
     } else {
       clearInterval(intervalId);
       timeoutId = setTimeout(() => {
         setLines([]);
         currentIndex = 0;
         // Restart animation
         intervalId = setInterval(() => {
           if (currentIndex < codeSequence.length) {
             setLines(prev => [...prev, codeSequence[currentIndex]]);
             currentIndex++;
           } else {
             clearInterval(intervalId);
           }
         }, 800);
       }, 4000);
     }
   }, 800);

   return () => {
       clearInterval(intervalId);
       clearTimeout(timeoutId);
   };
 }, [t]);

 return (
   <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-2xl mx-auto bg-gray-900/70 backdrop-blur-md rounded-2xl border border-gray-700/50 shadow-2xl shadow-yellow-400/5 overflow-hidden transform hover:scale-[1.02] transition-transform duration-500"
    >
     <div className="flex items-center px-4 py-3 bg-gray-900/80 border-b border-gray-800">
       <div className="flex space-x-2">
         <div className="w-3 h-3 rounded-full bg-red-500"></div>
         <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
         <div className="w-3 h-3 rounded-full bg-green-500"></div>
       </div>
       <div className="ml-4 text-xs text-gray-400 font-mono flex items-center gap-2">
         <Terminal size={14} />
         <span>ryze_core_engine.exe</span>
       </div>
     </div>
    
     <div className="p-6 font-mono text-sm h-[320px] overflow-hidden relative">
       <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <AnimatePresence>
          {lines.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.3 }}
              className="mb-2 flex items-start"
            >
              <span className="text-gray-600 mr-3 select-none">{String(i + 1).padStart(2, '0')}</span>
              <span className={`flex-1 ${line.includes("Error") ? "text-red-400" : line.includes("Root Cause") ? "text-yellow-400" : line.includes("Deploying") ? "text-green-400" : "text-blue-300"}`}>
                {t(line)}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
       <motion.div
         animate={{ opacity: [0, 1, 0] }}
         transition={{ repeat: Infinity, duration: 1.2 }}
         className="inline-block w-2 h-4 bg-yellow-400 ml-10 mt-2 align-middle"
       />
     </div>
   </motion.div>
 );
};

const ParticleBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        const particles: any[] = [];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        class Particle {
            x: number; y: number; size: number; speedX: number; speedY: number;
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 1.5 + 0.5;
                this.speedX = Math.random() * 1 - 0.5;
                this.speedY = Math.random() * 1 - 0.5;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.size > 0.1) this.size -= 0.02;
            }
            draw() {
                ctx.fillStyle = 'rgba(250, 204, 21, 0.6)';
                ctx.strokeStyle = 'rgba(250, 204, 21, 0.8)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
            }
        }

        const init = () => {
            for (let i = 0; i < 100; i++) {
                particles.push(new Particle());
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
                if (particles[i].size <= 0.1) {
                    particles.splice(i, 1);
                    i--;
                    particles.push(new Particle());
                }
            }
            animationFrameId = requestAnimationFrame(animate);
        };

        init();
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="fixed inset-0 z-0 opacity-50" />;
};

const RyzeAI: React.FC = () => {
 const navigate = useNavigate();
 const { t } = useLanguage();

 return (
   <div className="min-h-screen bg-black text-white overflow-x-hidden selection:bg-yellow-400 selection:text-black font-sans">
     <ParticleBackground />
     <div className="fixed inset-0 z-10 bg-gradient-to-b from-black via-black/80 to-black"></div>

     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="fixed top-6 right-6 z-50">
       <div className="relative group">
         <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-500"></div>
         <div className="relative px-5 py-2 bg-black/80 rounded-full border border-yellow-400/30 flex items-center gap-2 backdrop-blur-md">
           <Zap size={14} className="text-yellow-400" />
           <span className="text-yellow-400 font-semibold text-xs tracking-wide uppercase">Beta Access</span>
         </div>
       </div>
     </motion.div>

     <div className="relative z-20">
       <header className="min-h-screen flex flex-col justify-center items-center text-center px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }} className="relative">
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-extrabold tracking-tighter text-white">
                RYZE<span className="text-yellow-400">AI</span>
              </h1>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }} className="text-xl md:text-2xl text-gray-300 font-medium mt-4">
                Learning that adapts to <span className="text-white">you</span>.
              </motion.p>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 1 }} className="absolute bottom-10 left-1/2 -translate-x-1/2">
            <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }} >
              <ChevronDown className="text-gray-500 w-8 h-8" />
            </motion.div>
          </motion.div>
       </header>

       <div className="max-w-7xl mx-auto px-4 pb-32">
          <section className="mb-32">
             <div className="max-w-3xl mx-auto text-center">
                <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px"}} className="text-4xl md:text-5xl font-bold mb-6">The Real Problem Isn't Effort</motion.h2>
                <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px"}} transition={{delay: 0.1}} className="text-lg md:text-xl text-gray-400 leading-relaxed">
                  Students spend hours reviewing material they've already mastered while their actual weak spots go unaddressed. They cram facts, not concepts. They study hard, but not smart. RyzeAI fixes this.
                </motion.p>
             </div>
          </section>

          <section className="mb-32">
             <div className="text-center mb-16">
               <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">How <span className="text-yellow-400">It Works</span></h2>
               <p className="text-lg text-gray-400 max-w-2xl mx-auto">A neural network for your education. It learns how you learn.</p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { icon: Brain, title: "Deep Knowledge Tracing", desc: "We analyse every step of your thinking to build a detailed map of your unique understanding, identifying specific gaps and misconceptions.", color: "#FBBF24" },
                  { icon: GitBranch, title: "Dynamic Learning Paths", desc: "No generic practice. Your study plan adapts in real-time. Struggle with quadratics? You get more quadratics, not content you've already mastered.", color: "#60A5FA" },
                  { icon: Lightbulb, title: "Comprehension-First Feedback", desc: "We explain not just what is wrong, but why it's wrong. Our feedback is designed to build deep, conceptual understanding.", color: "#C084FC" },
                  { icon: BarChart3, title: "Predictive Analytics", desc: "We show you exactly what you've mastered, what needs work, and predict your performance, so you walk into exams with confidence.", color: "#4ADE80" }
                ].map((item, idx) => (
                  <SpotlightCard key={idx}>
                     <div className="p-8 h-full flex flex-col">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-gray-700/80" style={{ backgroundColor: `${item.color}20`, color: item.color }} >
                          <item.icon size={28} />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">{t(item.title)}</h3>
                        <p className="text-gray-400 leading-relaxed flex-grow">{t(item.desc)}</p>
                     </div>
                  </SpotlightCard>
                ))}
             </div>
          </section>

          <section className="mb-32">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="lg:pr-12">
                   <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px"}} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} >
                      <div className="inline-flex items-center gap-2 text-yellow-400 font-mono text-sm mb-4 border border-yellow-400/20 px-3 py-1 rounded-full bg-yellow-400/10">
                         <Cpu size={14} /> <span>LIVE ANALYSIS ENGINE</span>
                      </div>
                      <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Thinking in Real-Time</h2>
                      <p className="text-lg text-gray-300 leading-relaxed">
                         Unlike apps that just mark you right or wrong, RyzeAI deconstructs your every answer. It identifies the precise cognitive step where you went wrong—a calculation error, a conceptual gap, a misinterpretation—and instantly adapts.
                      </p>
                   </motion.div>
                </div>
                <CodeTerminal />
             </div>
          </section>

          <section className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Join the Future of Learning</h2>
            <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto">RyzeAI is currently in a closed beta. Request access to be among the first to experience truly personalised education.</p>
            <motion.a href="mailto:ryzeeducationgroup@gmail.com" whileHover={{ y: -3, boxShadow: "0 10px 20px -5px rgba(250, 204, 21, 0.2)" }} className="inline-flex items-center gap-3 px-8 py-4 bg-yellow-400 text-black font-bold text-lg rounded-full shadow-lg transition-all">
               Request Beta Access <ArrowRight size={20} />
            </motion.a>
          </section>
       </div>
     </div>
   </div>
 );
};

export default RyzeAI;
