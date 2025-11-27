
import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useMotionTemplate, useMotionValue } from 'framer-motion';
import { Brain, GitBranch, Lightbulb, BarChart3, ArrowRight, GraduationCap, ChevronDown, Terminal, Cpu, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

// --- Components ---

// 1. Holographic/Spotlight Card Component
const SpotlightCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => {
 const mouseX = useMotionValue(0);
 const mouseY = useMotionValue(0);
 const [isHovered, setIsHovered] = useState(false);

 function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
   // Disable hover effect on touch devices to save resources
   if (window.matchMedia("(hover: none)").matches) return;
   
   const { left, top } = currentTarget.getBoundingClientRect();
   mouseX.set(clientX - left);
   mouseY.set(clientY - top);
 }

 return (
   <div
     className={`group relative border border-slate-800/50 bg-slate-900/50 overflow-hidden rounded-3xl ${className}`}
     onMouseMove={handleMouseMove}
     onMouseEnter={() => setIsHovered(true)}
     onMouseLeave={() => setIsHovered(false)}
   >
     <motion.div
       className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
       style={{
         opacity: isHovered ? 1 : 0,
         background: useMotionTemplate`
           radial-gradient(
             650px circle at ${mouseX}px ${mouseY}px,
             rgba(255, 176, 0, 0.15),
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


// 2. Futuristic Code Terminal Component
const CodeTerminal = () => {
 const { t } = useLanguage();
 const [lines, setLines] = useState<string[]>([]);
  
  // Define sequence inside effect or use ref to avoid dependency cycle, 
  // but using t() inside is cleaner if we rebuild sequence on language change.
  useEffect(() => {
   const codeSequence = [
     t("> Pinging Student_Knowledge_Graph..."),
     t("> Status: Connected [Latency: 12ms]"),
     t("> Analyzing input: '2x + 5 = 15' ..."),
     t("> Error Detected: Inverse Operation Misapplication"),
     t("> Root Cause Identification: Pre-Algebra_Foundations"),
     t("> Confidence Score: 98.4%"),
     t("> Generating Micro-Lesson..."),
     t("> Adjusting Curriculum Path: +Quadratic_Intro delayed"),
     t("> Deploying Visual_Model_Module_4..."),
     t("> Ready for interaction.")
   ];


   let currentIndex = 0;
   let timeoutId: ReturnType<typeof setTimeout>;
   let intervalId: ReturnType<typeof setInterval>;

   // Clear existing lines when language changes to restart animation with new language
   setLines([]);

   intervalId = setInterval(() => {
     if (currentIndex < codeSequence.length) {
       const newLine = codeSequence[currentIndex];
       if (newLine) {
           setLines(prev => [...prev, newLine]);
       }
       currentIndex++;
     } else if (currentIndex === codeSequence.length) {
       currentIndex++;
       timeoutId = setTimeout(() => {
         setLines([]);
         currentIndex = 0;
       }, 3000);
     }
   }, 800);


   return () => {
       clearInterval(intervalId);
       clearTimeout(timeoutId);
   };
 }, [t]); // Re-run when translation function changes (language switch)


 return (
   <div className="w-full max-w-2xl mx-auto bg-[#0f1428]/90 backdrop-blur-md rounded-xl border border-slate-700/50 shadow-2xl overflow-hidden transform hover:scale-[1.02] transition-transform duration-500">
     <div className="flex items-center px-4 py-3 bg-[#0a0f1e] border-b border-slate-800">
       <div className="flex space-x-2">
         <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
         <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
         <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
       </div>
       <div className="ml-4 text-xs text-slate-400 font-mono flex items-center gap-2">
         <Terminal size={12} />
         ryze_core_engine.exe
       </div>
     </div>
    
     <div className="p-6 font-mono text-sm md:text-base h-[320px] overflow-hidden relative">
       <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
      
       {lines.map((line, i) => (
         <motion.div
           key={i}
           initial={{ opacity: 0, x: -10 }}
           animate={{ opacity: 1, x: 0 }}
           className="mb-2"
         >
           <span className="text-slate-500 mr-3">{String(i + 1).padStart(2, '0')}</span>
           <span className={`${
             line && line.includes("Error") ? "text-red-400" :
             line && line.includes("Root Cause") ? "text-[#FFB000]" :
             line && line.includes("Deploying") ? "text-green-400" :
             "text-blue-300"
           }`}>
             {line}
           </span>
         </motion.div>
       ))}
       <motion.div
         animate={{ opacity: [0, 1, 0] }}
         transition={{ repeat: Infinity, duration: 0.8 }}
         className="inline-block w-2 h-4 bg-[#FFB000] ml-1 align-middle"
       />
     </div>
   </div>
 );
};


const RyzeAI: React.FC = () => {
 const navigate = useNavigate();
 const { t } = useLanguage();
 const canvasRef = useRef<HTMLCanvasElement>(null);
 const { scrollY } = useScroll();
 const headerY = useTransform(scrollY, [0, 500], [0, 200]);
 const headerOpacity = useTransform(scrollY, [0, 300], [1, 0]);


 useEffect(() => {
   const canvas = canvasRef.current;
   if (!canvas) return;
   
   const ctx = canvas.getContext('2d');
   if (!ctx) return;


   let width = window.innerWidth;
   let height = window.innerHeight;
  
   const getStarCount = (w: number) => {
     if (w < 768) return 50;  // Reduced for cleaner look
     if (w < 1024) return 100;
     return 200; // significantly reduced from 600 for a less cluttered, higher quality feel
   };


   const resize = () => {
     const dpr = window.devicePixelRatio || 1;
     width = window.innerWidth;
     height = window.innerHeight;
     // Set actual size in memory (scaled to account for extra pixel density)
     canvas.width = width * dpr;
     canvas.height = height * dpr;
     // Normalize coordinate system to use css pixels
     canvas.style.width = `${width}px`;
     canvas.style.height = `${height}px`;
     ctx.scale(dpr, dpr);
   };
  
   window.addEventListener('resize', resize);
   resize();


   interface Star {
     x: number;
     y: number;
     size: number;
     opacity: number;
     baseOpacity: number;
     speed: number;
     twinkleSpeed: number;
     twinklePhase: number;
     color: string; 
   }

   interface ShootingStar {
     x: number;
     y: number;
     len: number;
     speed: number;
     opacity: number;
   }


   const stars: Star[] = [];
   const shootingStars: ShootingStar[] = [];
   let shootingStarTimer = 0;
   const SHOOTING_STAR_PROBABILITY = 0.03; 
  
   const initStars = () => {
     stars.length = 0;
     const count = getStarCount(width);
     
     for (let i = 0; i < count; i++) {
       // Significantly brighter base stars
       const baseOpacity = Math.random() * 0.7 + 0.3;
       // Gold stars are rarer but brighter
       const isGold = Math.random() < 0.20; 
       
       // Milky Way bias: Concentrate some stars towards the center diagonal
       const biasX = Math.random() > 0.5 ? Math.random() * width : (width/2 + (Math.random() - 0.5) * width * 0.5);
       
       stars.push({
         x: biasX,
         y: Math.random() * height,
         // Smaller, sharper stars for 4k feel (0.3px to 1.5px range)
         size: Math.random() * 1.2 + 0.3, 
         baseOpacity,
         opacity: 0,
         speed: Math.random() * 0.05, // Slower, more majestic drift
         twinkleSpeed: 0.01 + Math.random() * 0.03, // Slower twinkle
         twinklePhase: Math.random() * Math.PI * 2,
         color: isGold ? `255, 200, 50` : `220, 230, 255`
       });
     }
   };
  
   initStars();


   const animate = () => {
     // Clear with consideration for high DPI width/height
     ctx.clearRect(0, 0, width, height);

     // --- Static Stars ---
     stars.forEach(star => {
       star.twinklePhase += star.twinkleSpeed;
       // Sine wave for smooth twinkling - range 0.5 to 1.5 for brightness boost
       const twinkle = Math.sin(star.twinklePhase) * 0.5 + 1.0;
       
       // Draw Glow (Corona) for larger stars - subtle but high quality
       if (star.size > 1.0) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 4, 0, Math.PI * 2);
          // Very faint, large corona for atmospheric depth
          ctx.fillStyle = `rgba(${star.color}, ${star.baseOpacity * 0.1 * twinkle})`;
          ctx.fill();
       }

       // Draw Core - boosted opacity for sharpness
       ctx.beginPath();
       ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
       ctx.fillStyle = `rgba(${star.color}, ${Math.min(1, star.baseOpacity * twinkle)})`;
       ctx.fill();

       // Parallax/Drift
       star.y -= star.speed;
       if (star.y < -10) star.y = height + 10;
     });

     // --- Shooting Stars ---
     shootingStarTimer++;
     if (shootingStarTimer > 80 && Math.random() < SHOOTING_STAR_PROBABILITY) {
        shootingStarTimer = 0;
        shootingStars.push({
           x: Math.random() * width,
           y: Math.random() * (height * 0.5), // Start in top 50%
           len: Math.random() * 120 + 80, // Longer tails
           speed: Math.random() * 10 + 5, // Slower speed
           opacity: 1
        });
     }

     for (let i = shootingStars.length - 1; i >= 0; i--) {
        const star = shootingStars[i];
        
        star.x += star.speed;
        star.y += star.speed * 0.5; // Steep diagonal
        star.opacity -= 0.02;

        if (star.opacity <= 0) {
           shootingStars.splice(i, 1);
        } else {
           ctx.beginPath();
           // Brighter, longer gradient tail
           const grad = ctx.createLinearGradient(star.x, star.y, star.x - star.len, star.y - star.len * 0.5);
           grad.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`);
           grad.addColorStop(0.1, `rgba(200, 220, 255, ${star.opacity * 0.8})`);
           grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
           
           ctx.strokeStyle = grad;
           ctx.lineWidth = 2; // Slightly thinner for sharpness
           ctx.lineCap = 'round';
           ctx.moveTo(star.x, star.y);
           ctx.lineTo(star.x - star.len, star.y - star.len * 0.5);
           ctx.stroke();
           
           // Head of the shooting star (glowing orb)
           ctx.beginPath();
           ctx.arc(star.x, star.y, 2, 0, Math.PI * 2);
           ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
           ctx.shadowBlur = 10;
           ctx.shadowColor = "white";
           ctx.fill();
           ctx.shadowBlur = 0;
        }
     }

     requestAnimationFrame(animate);
   };


   const animationId = requestAnimationFrame(animate);


   return () => {
     window.removeEventListener('resize', resize);
     cancelAnimationFrame(animationId);
   };
 }, []);


 return (
   <div
     className="min-h-screen bg-[#050510] text-white overflow-x-hidden selection:bg-[#FFB000] selection:text-black relative font-sans"
     style={{ fontFamily: "'Inter', sans-serif" }}
   >
     {/* 1. Canvas Layer (Stars + Shooting Stars) - z-index 10 to sit above nebula but below content */}
     <canvas ref={canvasRef} className="fixed inset-0 z-10 pointer-events-none mix-blend-screen" />
    
     {/* 2. Milky Way Nebula Layer - Enhanced Visibility */}
     <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Deep Galaxy Void Vignette - Reduced opacity to let stars shine through */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_80%)] opacity-60 z-20"></div>
        
        {/* The Milky Way Band - Boosted opacity and blending */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180%] h-[70%] bg-gradient-to-r from-transparent via-indigo-600/30 to-transparent blur-[120px] rotate-[-45deg] transform-gpu mix-blend-screen"
          style={{ willChange: 'transform' }}
        ></div>
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[50%] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent blur-[90px] rotate-[-45deg] transform-gpu mix-blend-screen"
          style={{ willChange: 'transform' }}
        ></div>
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[30%] bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent blur-[60px] rotate-[-45deg] transform-gpu mix-blend-screen"
          style={{ willChange: 'transform' }}
        ></div>
     </div>
    
     <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
       {/* Animated Atmospheric Blobs - Toned down opacity to prevent washout */}
       <motion.div
         animate={{
           scale: [1, 1.2, 1],
           opacity: [0.05, 0.1, 0.05], // Reduced opacity
           x: [0, 50, 0]
         }}
         transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
         className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-[#FFB000] rounded-full blur-[150px] will-change-transform mix-blend-screen"
       />
       <motion.div
          animate={{
           scale: [1, 1.1, 1],
           opacity: [0.05, 0.1, 0.05], // Reduced opacity
           x: [0, -30, 0]
         }}
         transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
         className="absolute bottom-[-10%] right-[-10%] w-[900px] h-[900px] bg-indigo-900 rounded-full blur-[150px] will-change-transform mix-blend-screen"
       />
     </div>


     <motion.div
       initial={{ opacity: 0, y: -20 }}
       animate={{ opacity: 1, y: 0 }}
       transition={{ delay: 1 }}
       className="fixed top-24 right-6 z-50"
     >
       <div className="relative group cursor-default">
         <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FFB000] to-orange-600 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-500"></div>
         <div className="relative px-5 py-2 bg-[#0a0f1e] rounded-full border border-[#FFB000]/30 flex items-center gap-2">
           <span className="w-2 h-2 rounded-full bg-[#FFB000] animate-pulse"></span>
           <span className="text-[#FFB000] font-semibold text-xs tracking-wide uppercase">{t("Beta Access")}</span>
         </div>
       </div>
     </motion.div>


     <div className="relative z-30">
       <header className="relative min-h-[90vh] flex flex-col justify-center items-center text-center px-4 overflow-hidden">
          <motion.div style={{ y: headerY, opacity: headerOpacity }} className="relative z-20 will-change-transform">
              <div className="relative mb-6">
                <motion.h1
                  initial={{ opacity: 0, scale: 0.9, letterSpacing: "0.1em" }}
                  animate={{ opacity: 1, scale: 1, letterSpacing: "0.2em" }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                  className="text-5xl md:text-8xl lg:text-9xl font-bold text-white tracking-[0.2em] drop-shadow-[0_0_40px_rgba(255,255,255,0.1)]"
                >
                  RYZE<span className="text-[#FFB000]">AI</span>
                </motion.h1>
               
                <motion.div
                  initial={{ top: "0%", opacity: 0 }}
                  animate={{ top: "100%", opacity: [0, 1, 0] }}
                  transition={{ duration: 2, ease: "easeInOut", repeat: Infinity, repeatDelay: 3 }}
                  className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FFB000] to-transparent shadow-[0_0_20px_#FFB000]"
                />
              </div>


              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-xl md:text-3xl text-slate-300 font-light tracking-wide mb-8"
              >
                {t("Learning That")} <span className="text-white font-semibold">{t("Adapts")}</span> {t("to You")}
              </motion.p>
             
              <motion.div
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ delay: 0.8 }}
                 className="flex flex-col items-center gap-4"
              >
                 <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#FFB000] to-transparent"></div>
                 <p className="text-[#FFB000] text-xs md:text-sm font-mono tracking-[0.2em] uppercase text-center">
                   {t("Personalised understanding, not memorisation")}
                 </p>
              </motion.div>


          </motion.div>


          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <ChevronDown className="text-slate-500 w-6 h-6" />
            </motion.div>
          </motion.div>
       </header>


       <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-32">
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="mb-32 md:mb-40 relative group"
          >
             <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FFB000] via-transparent to-indigo-500 rounded-3xl opacity-20 group-hover:opacity-50 blur transition duration-1000"></div>
             {/* Slightly more opaque background to ensure text legibility over bright stars */}
             <div className="relative bg-[#0a0f1e]/90 backdrop-blur-xl p-8 md:p-16 rounded-3xl border border-white/5 shadow-2xl">
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                  <div className="lg:col-span-4">
                     <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">{t("The Real Problem")}</h2>
                     <div className="w-20 h-1.5 bg-[#FFB000] rounded-full mb-6"></div>
                  </div>
                  <div className="lg:col-span-8 space-y-8 text-lg text-slate-300 font-light leading-relaxed">
                     <p className="text-xl" dangerouslySetInnerHTML={{ __html: t("Most students don't fail because they're not smart enough.</strong> They fail because they don't know what they don't know.") }}></p>
                     <p>{t("Students spend hours reviewing material they've already mastered while their actual weak spots go unaddressed. They cram facts without understanding concepts. They walk into exams anxious and underprepared—not because they didn't study, but because they studied the wrong things in the wrong ways.")}</p>
                     <div className="pl-6 border-l-2 border-[#FFB000]/30">
                       <p className="text-slate-400 italic">{t("Traditional study tools give everyone the same content. Teachers can't track each student's specific confusion points. And students are left guessing about what to study next.")}</p>
                     </div>
                  </div>
               </div>
             </div>
          </motion.section>


          <section className="mb-32 md:mb-40">
             <div className="text-center mb-20">
               <motion.h2
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 className="text-3xl md:text-6xl font-bold text-white mb-6"
               >
                 {t("How")} <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFB000] to-yellow-200">Ryze AI</span> {t("Works")}
               </motion.h2>
               <p className="text-slate-400 text-lg max-w-2xl mx-auto">{t("A neural network for your education. It learns how you learn.")}</p>
             </div>


             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                {[
                  {
                    icon: Brain,
                    title: "We Track Understanding",
                    desc: "We analyse where your thinking breaks down—which step, which concept, which type of mistake. We build a detailed map of your understanding over time.",
                    color: "#FFB000"
                  },
                  {
                    icon: GitBranch,
                    title: "We Create Your Path",
                    desc: "No generic practice. If you struggle with quadratics but excel at linear equations, you get more quadratics. Your study plan adapts dynamically as you improve.",
                    color: "#60a5fa"
                  },
                  {
                    icon: Lightbulb,
                    title: "Focus on Comprehension",
                    desc: "We prioritise understanding over memorisation. Our feedback explains not just what's wrong, but why it's wrong and how to think about it differently.",
                    color: "#c084fc"
                  },
                  {
                    icon: BarChart3,
                    title: "We Show You Progress",
                    desc: "Clear visibility into what you've mastered and what needs work. No more guessing whether you're ready for an exam.",
                    color: "#4ade80"
                  }
                ].map((item, idx) => (
                  <SpotlightCard key={idx} className="h-full bg-[#0d1226]/90 border-slate-800 backdrop-blur-md">
                     <div className="p-10 h-full flex flex-col relative z-10">
                        <div className="absolute top-0 right-0 p-6 opacity-10">
                           <item.icon size={80} />
                        </div>


                        <div
                          className="w-14 h-14 rounded-xl flex items-center justify-center mb-8 shadow-lg border border-white/10 backdrop-blur-md"
                          style={{ backgroundColor: `${item.color}20`, color: item.color }}
                        >
                          <item.icon size={28} />
                        </div>
                       
                        <h3 className="text-2xl font-bold text-white mb-4">{t(item.title)}</h3>
                        <p className="text-slate-400 leading-relaxed flex-grow">{t(item.desc)}</p>
                       
                        <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent mt-8"></div>
                     </div>
                  </SpotlightCard>
                ))}
             </div>
          </section>


          <section className="mb-32 md:mb-40">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                   <div className="inline-flex items-center gap-2 text-[#FFB000] font-mono text-sm mb-4 border border-[#FFB000]/30 px-3 py-1 rounded-full bg-[#FFB000]/5">
                      <Cpu size={14} />
                      <span>LIVE_ANALYSIS_ENGINE</span>
                   </div>
                   <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                      {t("Thinking in")} <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">{t("Real-Time")}</span>
                   </h2>
                   <p className="text-slate-300 text-lg leading-relaxed mb-8">
                      {t("Unlike standard quiz apps that just mark \"Correct\" or \"Incorrect\", Ryze AI deconstructs your answer. It identifies the specific cognitive step where you failed—was it a calculation error, a conceptual gap, or a misinterpretation?")}
                   </p>
                  
                   <ul className="space-y-4">
                      {[
                        "Semantic Analysis of Student Input",
                        "Real-time Curriculum Adjustment",
                        "Micro-Concept Mapping"
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-slate-400">
                           <Activity size={18} className="text-[#FFB000]" />
                           {t(item)}
                        </li>
                      ))}
                   </ul>
                </motion.div>


                <motion.div
                   initial={{ opacity: 0, scale: 0.95 }}
                   whileInView={{ opacity: 1, scale: 1 }}
                   viewport={{ once: true }}
                >
                   <CodeTerminal />
                </motion.div>
             </div>
          </section>


          <section className="mb-32 md:mb-40">
             <motion.div
               initial={{ opacity: 0 }}
               whileInView={{ opacity: 1 }}
               viewport={{ once: true }}
               className="mb-16 text-center md:text-left"
             >
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">{t("The Impact")}</h2>
             </motion.div>


             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <motion.div
                   initial={{ x: -30, opacity: 0 }}
                   whileInView={{ x: 0, opacity: 1 }}
                   viewport={{ once: true }}
                   transition={{ duration: 0.6 }}
                   className="relative group"
                 >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-500"></div>
                    <div className="relative bg-[#0f1428]/90 backdrop-blur-md p-10 md:p-12 rounded-[2.5rem] border border-slate-800 h-full overflow-hidden">
                       <div className="absolute right-[-50px] top-[-50px] opacity-5 pointer-events-none">
                          <GraduationCap size={300} />
                       </div>
                       <div className="relative z-10">
                          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-400 mb-8 border border-blue-500/20">
                             <GraduationCap size={32} />
                          </div>
                          <h3 className="text-3xl font-bold text-white mb-6">{t("For Students")}</h3>
                          <ul className="space-y-5">
                             {[
                               "Less time wasted on what you already know.",
                               "More confidence going into exams.",
                               "Understanding that carries forward into future courses."
                             ].map((text, i) => (
                               <li key={i} className="flex gap-4 items-start text-slate-300 text-lg">
                                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 shadow-[0_0_10px_#60a5fa]"></div>
                                  <span>{t(text)}</span>
                               </li>
                             ))}
                          </ul>
                       </div>
                    </div>
                 </motion.div>


                 <motion.div
                   initial={{ x: 30, opacity: 0 }}
                   whileInView={{ x: 0, opacity: 1 }}
                   viewport={{ once: true }}
                   transition={{ duration: 0.6 }}
                   className="relative group"
                 >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-transparent rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-500"></div>
                    <div className="relative bg-[#0f1428]/90 backdrop-blur-md p-10 md:p-12 rounded-[2.5rem] border border-slate-800 h-full overflow-hidden">
                        <div className="absolute right-[-50px] top-[-50px] opacity-5 pointer-events-none">
                          <Brain size={300} />
                       </div>
                       <div className="relative z-10">
                          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-400 mb-8 border border-purple-500/20">
                             <Brain size={32} />
                          </div>
                          <h3 className="text-3xl font-bold text-white mb-6">{t("For Teachers")}</h3>
                          <ul className="space-y-5">
                             {[
                               "Insights into where your class struggles to inform planning.",
                               "Automated assessment means more time for teaching.",
                               "We augment your expertise, not replace it."
                             ].map((text, i) => (
                               <li key={i} className="flex gap-4 items-start text-slate-300 text-lg">
                                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0 shadow-[0_0_10px_#c084fc]"></div>
                                  <span>{t(text)}</span>
                               </li>
                             ))}
                          </ul>
                       </div>
                    </div>
                 </motion.div>
             </div>
          </section>


          <section className="mb-40 relative">
             <div className="absolute inset-0 bg-gradient-to-b from-[#FFB000]/5 to-transparent rounded-[3rem] blur-2xl"></div>
             <div className="bg-[#0a0e1f]/90 border border-[#FFB000]/20 backdrop-blur-md rounded-[3rem] p-8 md:p-20 text-center relative overflow-hidden">
                <div className="relative z-10">
                   <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">{t("Development Roadmap")}</h2>
                   <p className="text-slate-400 mb-16 max-w-2xl mx-auto text-lg">
                      {t("Ryze AI is currently in active beta testing with selected users. We're refining our algorithms based on real student interactions.")}
                   </p>
                   <div className="flex flex-col md:flex-row justify-center items-center gap-0 md:gap-0">
                       <div className="relative z-10 flex flex-col items-center w-64 group mb-12 md:mb-0">
                           <div className="w-4 h-4 bg-[#FFB000] rounded-full shadow-[0_0_20px_#FFB000] mb-6 relative">
                               <div className="absolute inset-0 bg-[#FFB000] rounded-full animate-ping opacity-50"></div>
                           </div>
                           <div className="text-[#FFB000] font-bold text-2xl mb-2 tracking-wider">{t("NOW")}</div>
                           <div className="text-slate-200 font-medium bg-[#FFB000]/10 px-4 py-1 rounded-full border border-[#FFB000]/20">{t("Beta Testing")}</div>
                       </div>
                       <div className="h-24 w-0.5 md:h-0.5 md:w-48 bg-gradient-to-b md:bg-gradient-to-r from-[#FFB000] to-slate-800 relative mb-12 md:mb-0">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent w-1/2 h-full md:w-full md:h-1/2 opacity-20 animate-pulse"></div>
                       </div>
                       <div className="relative z-10 flex flex-col items-center w-64 opacity-50">
                           <div className="w-3 h-3 bg-slate-700 rounded-full mb-6 border border-slate-500"></div>
                           <div className="text-white font-bold text-2xl mb-2 tracking-wider">2026</div>
                           <div className="text-slate-400 font-medium">{t("Public Launch")}</div>
                       </div>
                   </div>
                </div>
             </div>
          </section>


          <div className="text-center pb-12">
             <motion.div
               whileHover={{ scale: 1.01 }}
               className="relative inline-block w-full max-w-4xl"
             >
                <div className="absolute inset-0 bg-[#FFB000] blur-[60px] opacity-20"></div>
                <div className="relative bg-[#050510]/95 border border-[#FFB000]/30 p-12 md:p-20 rounded-[3rem] overflow-hidden backdrop-blur-xl">
                   <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black,transparent)] pointer-events-none"></div>
                   <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 relative z-10">
                      {t("Join the")} <span className="text-[#FFB000]">{t("Future")}</span>
                   </h2>
                   <p className="text-slate-300 text-xl mb-12 relative z-10 max-w-2xl mx-auto font-light">
                      {t("If you'd like to discuss Ryze AI, explore partnership opportunities, or express interest in beta access, we'd love to hear from you.")}
                   </p>
                   <a
                      href="mailto:ryzeeducation@outlook.com"
                      className="relative z-10 inline-flex items-center gap-4 px-12 py-6 bg-[#FFB000] text-[#050510] font-bold text-xl rounded-full hover:bg-[#ffc133] transition-all duration-300 transform hover:-translate-y-1 shadow-[0_10px_40px_-10px_rgba(255,176,0,0.5)]"
                   >
                      {t("Request Access")} <ArrowRight className="w-6 h-6" />
                   </a>
                </div>
             </motion.div>
          </div>


       </div>
     </div>
   </div>
 );
};


export default RyzeAI;
