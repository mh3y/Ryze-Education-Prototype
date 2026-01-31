import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { FaQuestionCircle, FaPlus, FaTwitter, FaLinkedin, FaInstagram, FaFacebook, FaWhatsapp } from 'react-icons/fa';
import { Phone, ArrowRight, Send, Loader2, CheckCircle2, AlertCircle, Users, Star, Trophy, Activity, GraduationCap, PenTool, Smile, Laptop, Award, TrendingUp, CalendarDays, Wallet, RefreshCw, Gift } from 'lucide-react';
import { FaMinus } from 'react-icons/fa6';

const Landing: React.FC = () => {
    const featuresData = [
      {
        title: "1-to-1 Live Tutoring",
        description: "Get undivided attention from top tutors in a live, interactive setting designed to target your specific needs and learning style.",
        images: []
      },
      {
        title: "Handpicked teacher",
        description: "Undivided attention to you so no more struggling alone with complex concepts or last-minute questions.",
        images: [
          { src: 'https://res.cloudinary.com/dsvjhemjd/image/upload/v1764460809/588278725_1528730215077629_8325133640910985831_n_mr2y31.jpg', position: 'top-10 left-10 z-10', size: 'w-48 h-48', color: 'pink', subject: 'Economics' },
          { src: 'https://res.cloudinary.com/dsvjhemjd/image/upload/v1769561928/869fcdd5dfa6efd8ee8853d9e0eea053_kiv4v2.jpg', position: 'top-0 right-10 z-20', size: 'w-40 h-40', color: 'yellow', subject: 'Maths' },
          { src: 'https://res.cloudinary.com/dsvjhemjd/image/upload/v1770116812/female-teacher_pvvca7.png', position: 'left-1/2 -translate-x-1/2 top-1/4 z-30', size: 'w-64 h-64', color: 'green', subject: 'Science' },
          { src: 'https://res.cloudinary.com/dsvjhemjd/image/upload/v1769581194/gordon_rytlim.png', position: 'bottom-10 left-0 z-20', size: 'w-40 h-40', color: 'purple', subject: 'Accounts' },
          { src: 'https://res.cloudinary.com/dsvjhemjd/image/upload/v1770116812/male-teacher_q1j1vj.png', position: 'bottom-0 right-0 z-10', size: 'w-52 h-52', color: 'blue', subject: 'Physics' }
        ]
      },
      {
        title: "Personalised Learning",
        description: "Your learning plan is tailored to your unique needs and goals, ensuring efficient progress and mastery of subjects.",
        images: []
      },
    ];

    const faqData = [
      {
        question: "How does Ryze work?",
        answer: "Ryze is an online platform that connects students with expert tutors for personalised one-on-one sessions. You simply sign up, find a tutor that matches your needs, and book a session at your convenience."
      },
      {
        question: "What makes Ryze different?",
        answer: `Most tutors are university students who did well in maths.

      We are founded and led by NSW accredited teachers who've marked HSC papers and taught in NSW classrooms while also being high achievers themselves. That means you learn with syllabus‑aligned resources built by educators who understand the marking criteria, the common mistakes, and what separates strong performances from exceptional ones.

      While other students work through generic materials, you're training with resources that mirror your actual exams: same structure, same standards.

      The result? 
      
      Faster improvement. Deeper understanding. And a real competitive edge over other students.`
      },
      {
        question: "What qualifications do the tutors hold?",
        answer: "All our tutors are handpicked and go through a rigorous vetting process. They are experts in their subjects with proven teaching experience to ensure you receive the highest quality education."
      },
      {
        question: "What does Ryze mentorship program offer?",
        answer: "We have a mentorship group with distinguished scholars with a history of accredited academic execellence at your disposal to access for you to connect with and learn from. "
      },
      {
        question: "What subjects do you offer?",
        answer: "We specialise in mathematics, from primary through HSC Extension 2, with dedicated support for NAPLAN, OC and Selective Exam Preparation."
      }
    ];
    
    const team = [
      {
        id: "mike-nojiri",
        name: "Mike Nojiri",
        role: "Master\'s in Teaching | BSc(Math)/BCompSc",
        atar: "99.25",
        scores: ["98 Maths Ext 2", "|", "99 Maths Ext 1", "99 Maths Advanced (Accelerated)"],
        image: "https://res.cloudinary.com/dsvjhemjd/image/upload/v1769561928/869fcdd5dfa6efd8ee8853d9e0eea053_kiv4v2.jpg",
        fallback: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
      },
      {
        id: "william-gong",
        name: "William Gong",
        role: "PhD - AI & Machine Learning candidate",
        atar: "99.50",
        scores: ["99 Maths Ext 2", "|", "97 Maths Ext 1", "|", "97 Physics", "94 Chemistry"],
        image: "https://res.cloudinary.com/dsvjhemjd/image/upload/v1769568491/34b29c410f6278cf36653c984998c5fe_diuyma.jpg",
        fallback: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
      },
      {
        id: "gordon-ye",
        name: "Gordon Ye",
        role: "UNSW Academic Teaching Staff | BMaths/BCompSc",
        atar: "99.55",
        scores: ["98 Maths Ext 2", "|", "98 Maths Ext 1", "|", "97 Physics", "96 Chemistry"],
        image: "https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto,w_600/v1764460809/588278725_1528730215077629_8325133640910985831_n_mr2y31.jpg",
        fallback: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
      }
    ];

    const [duration, setDuration] = useState(30);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setDuration(15);
            } else {
                setDuration(30);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const [openFaq, setOpenFaq] = useState<number | null>(0);    

    const socialLinks = [
      { Icon: FaFacebook, href: "https://www.facebook.com/people/Ryze-Education/61583067491158/?mibextid=wwXIfr&rdid=pqwYdpqBoSmmo7cn&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1Ch1Yo8qHp%2F%3Fmibextid%3DwwXIfr" },
      { Icon: FaInstagram, href: "https://www.instagram.com/ryzeeducation/?igsh=MTI3Z21xcHRzZnFxZA%3D%3D&utm_source=qr#" },
      { Icon: FaLinkedin, href: "https://www.linkedin.com/company/ryze-education" },
      { Icon: FaWhatsapp, href: "https://api.whatsapp.com/message/6GUJFT6GY2DHG1?autoload=1&app_absent=0" }
    ];
    
    const reduce = useReducedMotion();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: '',
        honey: '' // Honeypot field
      });
    
      const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
      const [errorMessage, setErrorMessage] = useState('');
    
      const validateEmail = (email: string) => {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(String(email).toLowerCase());
      };
    
      const validatePhone = (phone: string) => {
        const stripped = phone.replace(/[\s\-]/g, '');
        return /^\+?[\d]{8,15}$/.test(stripped);
      };
    
      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(''); 
        
        if (formData.honey) {
          setStatus('success');
          setFormData({ name: '', email: '', phone: '', message: '', honey: '' });
          return;
        }
    
        if (!validateEmail(formData.email)) {
          setStatus('error');
          setErrorMessage('Please enter a valid email address (e.g. name@example.com)');
          return;
        }
    
        if (!validatePhone(formData.phone)) {
            setStatus('error');
            setErrorMessage('Please enter a valid phone number (e.g. 0412 345 678)');
            return;
        }
    
        setStatus('sending');
    
        try {
          const response = await fetch("https://formsubmit.co/ryzeeducationhq@gmail.com", {
            method: "POST",
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              message: formData.message,
              _subject: `New Enquiry from ${formData.name}`,
              _template: 'table',
              _captcha: 'false',
              _honey: ''
            })
          });
    
          if (response.ok) {
            setStatus('success');
            setFormData({ name: '', email: '', phone: '', message: '', honey: '' });
          } else {
            setStatus('error');
            setErrorMessage('');
          }
        } catch (error) {
          console.error("Submission error:", error);
          setStatus('error');
          setErrorMessage('');
        }
      };
    
      const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (status === 'error') setStatus('idle');
      };

      const scrollToContact = () => {
        const contactSection = document.getElementById('contact-form-section');
        if (contactSection) {
          contactSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      };

      const features = [
        { 
            icon: Users, 
            title: "Small Classes", 
            desc: "Max 6 students. You won\'t get lost in the crowd, ensuring personal attention.",
        },
        { 
            icon: Star, 
            title: "Signature Curriculum", 
            desc: "Syllabus-aligned resources developed by expert NSW teachers for targeted learning.",
        },
        { 
            icon: Trophy, 
            title: "Complete Support", 
            desc: "Holistic help between sessions, including subject selection and university pathways.",
        },
        { 
            icon: Activity, 
            title: "Progress Tracking", 
            desc: "Regular monitoring and analysis to optimise your academic performance.",
        },
        { 
            icon: GraduationCap, 
            title: "Expert Mentors", 
            desc: "Benefit from the genuine care and expertise of our high-achieving mentors.",
        },
        { 
            icon: PenTool, 
            title: "Accredited Teachers", 
            desc: "Our founding team consists of leading NSW teachers and academics.",
        },
        { 
            icon: Smile, 
            title: "Risk-Free Trial", 
            desc: "Your first lesson is free. You only pay if you decide to continue with us.",
        },
        { 
            icon: Laptop, 
            title: "Flexible Options", 
            desc: "Choose from private, group, online, or in-person learning to suit your needs.",
        }
    ];
    
    // 2. Define the Carousel Component
    const FeatureCarousel = () => (
        <div className="w-full overflow-hidden mt-24 relative [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
            <motion.div
                className="flex gap-6"
                animate={{
                    x: ['0%', '-50%']
                }}
                transition={{
                  ease: 'linear',
                  duration: duration,
                  repeat: Infinity,
                  repeatType: 'loop'
                }}
            >

                {/* Duplicate the items for a seamless infinite scroll effect */}
                {[...features, ...features].map((feature, idx) => (
                    <div 
                      key={idx} 
                      className="flex-shrink-0 w-[300px] sm:w-80 bg-black/20 p-8 rounded-3xl border border-white/10 backdrop-blur-lg"
                    >
                        <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 bg-[#FFB000] border border-[#FF8A00]/30 mx-auto">
                            <feature.icon size={28} className="text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                        <p className="text-gray-300 text-base leading-relaxed">{feature.desc}</p>
                    </div>
                ))}
            </motion.div>
        </div>
    );

    const statsData = [
      {
        icon: <GraduationCap size={40} className="text-[#FFB000]" />,
        value: "500+",
        description: "students served & counting"
      },
      {
        icon: <Award size={40} className="text-[#FFB000]" />,
        value: "13 years",
        description: "of teaching experience and mentoring students"
      },
      {
        icon: <Star size={40} className="text-[#FFB000]" />,
        value: "4.9/5",
        description: "Avg rating for tutor session"
      },
      {
        icon: <TrendingUp size={40} className="text-[#FFB000]" />,
        value: "100%",
        description: "of students' grades improved significantly"
      }
    ];
    
    return (
        <div className="bg-[#0D0D0D] text-white font-sans overflow-x-hidden">
          {/* Header */}
          <section 
            className="relative text-white bg-slate-900 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/image-v1.png')" }}
          >
            {/* Background Overlay */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

            {/* Simplified Header */}
            <header className="relative z-20 container mx-auto px-6 py-6 flex justify-between items-center">
                <div className="text-3xl font-bold text-white">RYZE EDUCATION</div>
                <div>
                    <button 
                      onClick={scrollToContact} 
                      className="border border-[#FFB000] bg-[#FFB000]/85 text-white px-6 py-2 md:px-8 md:py-3 rounded-lg hover:bg-[#FFB000] hover:text-white transition-colors font-semibold text-sm md:text-base"
                    >
                        Book your free consultation
                    </button>
                </div>
            </header>

            {/* Hero Content */}
            <div className="relative z-10 container mx-auto px-6 text-center pt-20 pb-16">
                <motion.h1
                    initial={{
                      opacity: 0,
                      scale: reduce ? 1 : 0.98,
                      clipPath: reduce ? "inset(0% 0% 0% 0%)" : "inset(0% 0% 100% 0%)"
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      clipPath: "inset(0% 0% 0% 0%)"
                    }}
                    transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                    className="text-4xl sm:text-5xl md:text-7xl font-extrabold leading-tight tracking-tight text-white"
                >
                    <span className="block">YOUR PATH TO SUCCESS</span>
                    <span className="relative block">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FFE29A] via-[#FFB000] to-[#FF8A00]">
                            STARTS HERE
                        </span>
                        {/* shimmer */}
                        <span
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 overflow-hidden rounded"
                        >
                            <motion.span
                                initial={{ x: "-100%" }}
                                animate={{ x: "100%" }}
                                transition={{
                                    duration: 2.5,
                                    ease: "linear",
                                    repeat: Infinity,
                                    delay: 1,
                                    repeatDelay: 5
                                }}
                                className="block h-full w-full -skew-x-12 bg-gradient-to-r from-transparent via-white/60 to-transparent"
                            />
                        </span>
                    </span>
                </motion.h1>
                <motion.p
                    initial={{ y: 16, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
                    className="text-base md:text-xl text-gray-300 mt-8 max-w-2xl mx-auto"
                >
                    Book 1 on 1 sessions with subjects matter experts that will unleash your true academic potential.
                </motion.p>
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.4, ease: "easeInOut" }}
                    className="mt-12 flex flex-col items-center gap-4"
                >
                    <button 
                      onClick={scrollToContact}
                      className="bg-[#FFB000]/85 text-white font-bold px-10 py-4 w-full sm:w-auto rounded-lg text-lg hover:bg-[#FFB000] transition-colors shadow-lg shadow-[#FFB000]/20"
                    >
                        Start your journey now
                    </button>
                    <p className="text-gray-400 mt-5">Join 500+ other satisfied students</p>
                </motion.div>
                <FeatureCarousel />
              </div>
            </section>

            {/* Expertise Section */}
            <section className="py-32 bg-[#f9f9f7]">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-5xl text-black font-bold">Unmatched expertise at your fingertips</h2>
                    <p className="text-lg text-gray-700 mt-4">Be a part of the Ryze success story, where numbers speak volumes about us</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mt-16">
                        {statsData.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="flex justify-center mb-4">
                                    {stat.icon}
                                </div>
                                <p className="text-5xl font-bold text-black">{stat.value}</p>
                                <p className="text-gray-700 mt-2">{stat.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Preview */}
            <section className="py-12 bg-slate-50 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[#f9f9f7]"></div>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                      <div className="flex flex-col md:flex-row justify-center items-center mb-16 gap-6">
                         <div className="max-w-2xl text-center">
                            <h2 className="text-4xl lg:text-5xl font-sans font-bold text-slate-900 mb-4">Meet Your Mentors</h2>
                            <p className="text-lg text-slate-500">
                              Our experienced educators are committed to helping every student thrive. Not just tutors, but qualified teachers and high-achievers.
                            </p>
                         </div>
                      </div>
            
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                         {team.map((member, idx) => (
                           <motion.div
                           key={idx}
                           className="group cursor-pointer"
                           initial={{ opacity: 0, y: 20 }}
                           whileInView={{ opacity: 1, y: 0 }}
                           viewport={{ once: true }}
                           transition={{ delay: idx * 0.1 }}
                         >
                          {member.scores && member.scores.length > 0 && (
                            <div className="mb-6">
                              <div className="bg-white backdrop-blur-md rounded-xl p-3 border border-slate-100">
                                <h4 className="text-xl font-bold text-[#FFB000] mb-2 text-center uppercase tracking-wider">HSC Marks</h4>
                                <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
                                  {member.scores.map((score, i) => (
                                    <span key={i} className="text-sm font-semibold text-black/75">{score}</span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                           <div className="relative rounded-[2rem] overflow-hidden mb-6 shadow-md aspect-[3/4] bg-slate-200">
                             {member.atar && (
                               <div className="absolute top-2 left-2 md:top-4 md:left-4 z-20">
                                 <div
                                   style={{ willChange: 'transform' }}
                                   className="bg-black/50 backdrop-blur-xl border border-[#ffb000]/75 shadow-2xl rounded-xl md:rounded-2xl transform transition-transform duration-300 ease-in-out md:hover:scale-110 md:hover:shadow-amber-400/50"
                                 >
                                   <div className="p-3 md:p-4 text-center text-white">
                                     <div className="flex items-center justify-center gap-1 md:gap-2 mb-1">
                                       <Star className="text-amber-300 w-5 h-5" fill="currentColor" />
                                       <p className="text-xl md:text-2xl font-bold uppercase tracking-wider">ATAR</p>
                                     </div>
                                     <p className="text-xl md:text-2xl font-bold font-mono tracking-tight">{member.atar}</p>
                                   </div>
                                 </div>
                               </div>
                             )}
            
                             <img
                               src={member.image}
                               onError={(e) => { e.currentTarget.src = member.fallback }}
                               alt={member.name}
                               loading="lazy"
                               decoding="async"
                               className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                             />
                             <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                             <div className="absolute bottom-6 left-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-y-2 group-hover:translate-y-0">
                             </div>
                           </div>
                           <div className="pl-2">
                             <h3 className="text-2xl font-sans font-bold text-slate-900 mb-1 group-hover:text-ryze transition-colors">{member.name}</h3>
                             <p className="text-slate-700 text-sm font-medium mb-1.5">{member.role}</p>
                           </div>
                         </motion.div>          
                        ))}
                      </div>
                    </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-20 bg-[#f9f9f7] md:py-32">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl text-black md:text-5xl font-bold">Our students love us </h2>
                        <p className="text-lg text-gray-700 mt-4">Join over 500+ other students excelling in their academics with Ryze</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div className="bg-white p-10 rounded-3xl border-2 border-[#FFB000]">
                             <p className="text-xl italic text-gray-700">"I honestly couldn't have done it without the sessions at Ryze. Mike has a way of explaining the most abstract concepts in Extension 2 so they actually feel simple. Highly recommend Ryze to anyone looking for not just tutoring but also a mentor and friend."</p>
                            <div className="mt-8 flex items-center gap-4">
                                <img src="https://res.cloudinary.com/dsvjhemjd/image/upload/v1769866078/images_qbe5xh.jpg" className="w-16 h-16 rounded-full object-cover border-2 border-green-40 blur(2px)"/>
                                <div>
                                    <p className="font-bold text-xl text-[#FFB000]">Jason Y.</p>
                                    <p className="font-bold text-lg text-[#FFB000]">99.85 ATAR | 98 Ext 2 </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="grid grid-cols-4 gap-4 max-w-sm">
                                <img src="https://res.cloudinary.com/dsvjhemjd/image/upload/v1769601239/tes5_cropped_gdj3jx.png" className="w-20 h-20 rounded-full object-cover border-2 border-[#FFB000] opacity-70 hover:opacity-100" alt="student"/>
                                <img src="https://res.cloudinary.com/dsvjhemjd/image/upload/v1769601232/tes4_cropped_bflbaz.png" className="w-20 h-20 rounded-full object-cover border-2 border-[#FFB000] opacity-70 hover:opacity-100" alt="student"/>
                                <img src="https://res.cloudinary.com/dsvjhemjd/image/upload/v1769601239/tes1_cropped_slcxdg.png" className="w-20 h-20 rounded-full object-cover border-2 border-[#FFB000] opacity-70 hover:opacity-100" alt="student"/>
                                <img src="https://res.cloudinary.com/dsvjhemjd/image/upload/v1769581187/tes7_ujk1je.png" className="w-20 h-20 rounded-full object-cover border-2 border-[#FFB000] opacity-70 hover:opacity-100" alt="student"/>
                                <img src="https://res.cloudinary.com/dsvjhemjd/image/upload/v1769581193/tes6_dcowey.png" className="w-20 h-20 rounded-full object-cover border-2 border-[#FFB000] opacity-70 hover:opacity-100" alt="student"/>
                                <img src="https://res.cloudinary.com/dsvjhemjd/image/upload/v1769601234/tes3_cropped_qh0olo.png" className="w-20 h-20 rounded-full object-cover border-2 border-[#FFB000] opacity-70 hover:opacity-100" alt="student"/>
                                <img src="https://res.cloudinary.com/dsvjhemjd/image/upload/v1769601233/tes8_cropped_a3j3tv.png" className="w-20 h-20 rounded-full object-cover border-2 border-[#FFB000] opacity-70 hover:opacity-100" alt="student"/>
                                <div className="w-20 h-20 rounded-full bg-[#FFB000]/15 flex items-center justify-center text-[#FFB000] font-bold text-lg">+500</div>
                            </div>
                            <p className="text-center mt-6 text-gray-700">Join the Ryze community in becoming higher achievers</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Unlock Potential Section - NEW */}
            <section className="py-20 md:py-32 bg-[#f9f9f7]">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-5xl text-black font-bold">Unlock your learning potential</h2>
                        <p className="text-lg text-gray-700 mt-4">We've crafted the platform to make sure you get the results you want</p>
                    </div>
                    <div className="max-w-3xl mx-auto">
                        <div className="flex flex-col gap-12">
                            {featuresData.map((feature, index) => (
                                <div key={index}>
                                    <h3 className="text-3xl text-black font-bold mb-2">{feature.title}</h3>
                                    <p className="text-gray-700 text-lg">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Discover Section */}
            <section className="py-20 md:py-32 bg-[#f9f9f7]">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-5xl text-black font-bold">Our approach is simple</h2>
                        <p className="text-lg text-gray-700 mt-4">3 simple steps to connect with your best tutor ever.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        {/* Left Column: Phone Mockup */}
                        <div className="flex justify-center">
                            <div className="bg-white/5 border border-white/10 rounded-[40px] p-4 shadow-2xl">
                                <div className="bg-gray-900 rounded-[30px] overflow-hidden">
                                    <img src="https://res.cloudinary.com/dsvjhemjd/image/upload/v1769561936/online_xnzlfr.jpg" alt="Online Consultation" className="w-full h-auto" />
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Steps */}
                        <div className="relative flex flex-col gap-16">
                            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-700/50"></div>
                            
                            {/* Step 1 */}
                            <div className="pl-12 relative">
                                <div className="absolute left-0 top-1.5 flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-[#FFB000]/50 border-2 border-[#FFB000]"></div>
                                </div>
                                <h3 className="text-base font-bold text-[#FFB000] mb-2">STEP 1</h3>
                                <h4 className="text-2xl font-bold text-black mb-3">Schedule in a free consultation</h4>
                                <p className="text-gray-700">Get immediate help when you need it the most. No more struggling alone with complex concepts or last-minute questions. Our tutors are just a click away!</p>
                            </div>

                            {/* Step 2 */}
                            <div className="pl-12 relative">
                                <div className="absolute left-0 top-1.5 flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-[#FFB000]/50 border-2 border-[#FFB000]"></div>
                                </div>
                                <h3 className="text-base font-bold text-[#FFB000] mb-2">STEP 2</h3>
                                <h4 className="text-2xl font-bold text-black mb-3">Diagnosis & Feedback </h4>
                                <p className="text-gray-700">Every student is unique, and so are our tutoring sessions. Receive one-on-one attention tailored to your specific needs and learning pace.</p>
                            </div>

                            {/* Step 3 */}
                            <div className="pl-12 relative">
                                <div className="absolute left-0 top-1.5 flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-[#FFB000]/50 border-2 border-[#FFB000]"></div>
                                </div>
                                <h3 className="text-base font-bold text-[#FFB000] mb-2">STEP 3</h3>
                                <h4 className="text-2xl font-bold text-black mb-3">Personalised Learning Plan </h4>
                                <p className="text-gray-700">Choose a convenient time slot and book your first free tutoring session with your selected tutor.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

             {/* CTA Section */}
            <section className="py-20 md:py-24 bg-[#f9f9f7]">
                <div className="container mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <p className="text-lg text-[#FFB000] font-bold">NO STRINGS ATTACHED</p>
                        <h2 className="text-3xl md:text-5xl text-black font-bold mt-4">Book your consultation <br/> absolutely <span className="relative inline-block">free</span></h2>
                        <p className="text-lg text-gray-700 mt-6 max-w-md">Claim your first FREE tutoring session now! Simply click the button below and witness the magic of personalised learning.</p>
                        <button className="bg-[#FFB000] text-white font-bold px-10 py-4 rounded-lg text-lg hover:bg-[#FFB000] transition-colors mt-8 shadow-lg shadow-[#FFB000]/20">
                            I'M READY, SIGN ME UP!
                        </button>
                    </div>
                    <div className="relative h-[400px] bg-black rounded-3xl flex items-center justify-center">
                        <img src="https://res.cloudinary.com/dsvjhemjd/image/upload/v1769561940/personalised_ctuogs.png" className="w-full h-full object-cover rounded-3xl opacity-80" alt="Online Consultation"/>
                        <div className="absolute top-4 right-4 bg-red-600 px-3 py-1 text-sm rounded-full font-semibold animate-pulse">LIVE</div>
                    </div>
                </div>
            </section>

            {/* Contact Form Section */}
            <section id="contact-form-section" className="py-20 md:py-24 bg-[#0069b0]/40">
                 <div className="max-w-2xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h3 className="text-4xl font-bold text-white mb-4">Send us a Message</h3>
                        <p className="text-slate-300">We typically respond within 24 hours.</p>
                    </div>
                    
                    {status === 'success' ? (
                      <div className="bg-[#FFB000]/50 backdrop-blur-md border border-[#FFB000] rounded-[2rem] p-10 text-center animate-in fade-in zoom-in duration-300">
                         <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 size={40} />
                         </div>
                         <h4 className="text-2xl font-bold text-white mb-4">Message Sent!</h4>
                         <p className="text-[#FFB000] mb-8 max-w-md mx-auto">
                            Thanks for reaching out to Ryze. We've received your enquiry and will be in touch with you shortly.
                         </p>
                         <button 
                            onClick={() => setStatus('idle')}
                            className="px-8 py-3 bg-slate-800 border border-slate-600 text-white font-bold rounded-xl hover:bg-slate-700 transition-colors"
                         >
                            Send Another Message
                         </button>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-6 relative">
                          {status === 'error' && (
                            <div className="bg-red-900/50 text-red-300 p-4 rounded-xl flex items-center gap-3 border border-red-500 mb-6 animate-in fade-in slide-in-from-top-2">
                               <AlertCircle size={20} className="shrink-0" />
                               <span className="font-medium">
                                 {errorMessage || "Something went wrong. Please try again or call us directly."}
                               </span>
                            </div>
                          )}

                          {/* Honeypot Field - Hidden from humans */}
                          <input 
                            type="text" 
                            name="honey" 
                            value={formData.honey}
                            onChange={handleChange}
                            style={{ display: 'none' }}
                            tabIndex={-1}
                            autoComplete="off"
                          />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label htmlFor="name" className="block text-sm font-bold text-slate-200 uppercase tracking-wider">Name</label>
                              <input
                                type="text"
                                id="name"
                                name="name"
                                required
                                maxLength={100}
                                value={formData.name}
                                onChange={handleChange}
                                disabled={status === 'sending'}
                                className="w-full px-6 py-4 rounded-2xl bg-black/20 border-2 border-white/50 text-white focus:border-[#FFB000] focus:bg-black/30 outline-none transition-all font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                                placeholder="Your Full Name"
                              />
                            </div>
                            <div className="space-y-2">
                              <label htmlFor="email" className="block text-sm font-bold text-slate-200 uppercase tracking-wider">Email</label>
                              <input
                                type="email"
                                id="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                disabled={status === 'sending'}
                                className="w-full px-6 py-4 rounded-2xl bg-black/20 border-2 border-white/50 text-white focus:border-[#FFB000] focus:bg-black/30 outline-none transition-all font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                                placeholder="email@address.com"
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <label htmlFor="phone" className="block text-sm font-bold text-slate-200 uppercase tracking-wider">Phone</label>
                            <input
                              type="tel"
                              id="phone"
                              name="phone"
                              maxLength={20}
                              value={formData.phone}
                              onChange={handleChange}
                              disabled={status === 'sending'}
                              className="w-full px-6 py-4 rounded-2xl bg-black/20 border-2 border-white/50 text-white focus:border-[#FFB000] focus:bg-black/30 outline-none transition-all font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                              placeholder="Mobile Number"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label htmlFor="message" className="block text-sm font-bold text-slate-200 uppercase tracking-wider">Message</label>
                                <span className={`text-xs font-medium ${formData.message.length >= 2000 ? 'text-red-500' : 'text-slate-400'}`}>
                                    {formData.message.length}/2000
                                </span>
                            </div>
                            <textarea
                              id="message"
                              name="message"
                              rows={6}
                              required
                              maxLength={2000}
                              value={formData.message}
                              onChange={handleChange}
                              disabled={status === 'sending'}
                              className="w-full px-6 py-4 rounded-2xl bg-black/20 border-2 border-white/50 text-white focus:border-[#FFB000] focus:bg-black/30 outline-none transition-all font-medium resize-none disabled:opacity-70 disabled:cursor-not-allowed"
                              placeholder="How can we help you?"
                            ></textarea>
                          </div>

                          <button
                            type="submit"
                            disabled={status === 'sending'}
                            className="w-full bg-[#FFB000] text-white font-bold py-5 rounded-2xl shadow-xl hover:bg-[#FF8A00]/90 hover:-translate-y-1 active:scale-95 active:bg-[#FFB000] focus:outline-none focus:ring-4 focus:ring-[#FFB000]/20 transition-all text-lg flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:active:scale-100"
                          >
                            {status === 'sending' ? (
                              <>
                                <Loader2 size={24} className="animate-spin" /> Sending...
                              </>
                            ) : (
                              <>Submit Enquiry</>
                            )}
                          </button>
                      </form>
                    )}
                 </div>
              </section>

            {/* FAQ Section */}
            <section className="py-20 md:py-32 bg-[#f9f9f7]">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-3 gap-16">
                        <div className="md:col-span-1">
                            <FaQuestionCircle size={40} className="text-[#FFB000] mb-6" />
                            <h2 className="text-3xl md:text-5xl text-black font-bold mb-4">Still not convinced?</h2>
                            <p className="text-gray-700 text-lg">
                                Have more questions? Feel free to reach out to us. 
                                <a onClick={scrollToContact} className="text-[#FFB000] font-semibold hover:underline cursor-pointer"> Contact us</a>.
                            </p>
                        </div>
                        <div className="md:col-span-2">
                            {faqData.map((faq, index) => (
                                <div key={index} className="border-b border-gray-800/50">
                                    <div 
                                        className="flex justify-between items-center p-6 cursor-pointer"
                                        onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                    >
                                        <p className="text-lg text-black font-semibold">{faq.question}</p>
                                        {openFaq === index ? <FaMinus className="text-[#FFB000]" /> : <FaPlus className="text-[#FFB000]" />}
                                    </div>
                                    <AnimatePresence>
                                        {openFaq === index && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <p className="text-gray-700 pb-6 px-6 whitespace-pre-line">
                                                    {faq.answer}
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-black/30 text-[#FFB000] pt-6 pb-6">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Column 1: Brand */}
                        <div className="md:col-span-1">
                            <h3 className="text-2xl font-bold mb-4">RYZE EDUCATION</h3>
                            <p className="text-gray-400 leading-relaxed">Education that sees you. Diagnosing gaps, building understanding, and creating confidence in every student.</p>
                        </div>

                        {/* Column 2: Connect With Us */}
                        <div>
                            <h4 className="text-lg font-semibold mb-4 tracking-wide">Connect With Us</h4>
                            <p className="text-gray-400 mb-4">Follow us on our social media channels.</p>
                            <div className="flex space-x-4">
                                {socialLinks.map(({ Icon, href }, i) => (
                                  <a 
                                    key={i} 
                                    href={href} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-[#FFB000] hover:text-white transition-all duration-300"
                                  >
                                    <Icon size={20} />
                                  </a>
                                ))}
                              </div>
                        </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-gray-800 text-center text-gray-500">
                        <p>&copy; {new Date().getFullYear()} Ryze Education. All Rights Reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;

