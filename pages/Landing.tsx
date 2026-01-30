import React, { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { FaQuestionCircle, FaPlus, FaTwitter, FaLinkedin, FaInstagram, FaFacebook, FaWhatsapp } from 'react-icons/fa';
import { Phone, ArrowRight, Send, Loader2, CheckCircle2, AlertCircle, Users, Star, Trophy, Activity, GraduationCap, PenTool, Smile, Laptop } from 'lucide-react';
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
        title: "Personalized Learning",
        description: "Your learning plan is tailored to your unique needs and goals, ensuring efficient progress and mastery of subjects.",
        images: []
      },
    ];

    const faqData = [
      {
        question: "How does Ryze work?",
        answer: "Ryze is an online platform that connects students with expert tutors for personalized one-on-one sessions. You simply sign up, find a tutor that matches your needs, and book a session at your convenience."
      },
      {
        question: "Are the tutors qualified?",
        answer: "Absolutely. All our tutors are handpicked and go through a rigorous vetting process. They are experts in their subjects with proven teaching experience to ensure you receive the highest quality education."
      },
      {
        question: "Can I choose my own tutor?",
        answer: "Yes! We believe in the power of a good student-tutor match. You can browse our tutor profiles, check their expertise and reviews, and select the one that best fits your learning style."
      },
      {
        question: "What subjects do you offer?",
        answer: "We offer a wide range of subjects across various curricula, from primary school foundations to advanced high school topics like HSC Extension Mathematics. Our platform will help you find a specialist in the exact area you need help with."
      }
    ];
    
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
                    duration: 30,
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
                      className="border border-[#FFB000] bg-[#FFB000]/75 text-white px-6 py-2 md:px-8 md:py-3 rounded-lg hover:bg-[#FFB000] hover:text-white transition-colors font-semibold text-sm md:text-base"
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
                      className="bg-[#FFB000]/85 text-white font-bold px-10 py-4 w-full sm:w-auto rounded-lg text-lg hover:bg-[#FF8A00] transition-colors shadow-lg shadow-[#FFB000]/20"
                    >
                        Get Started for Free
                    </button>
                    <p className="text-gray-400 mt-5">Join 1000+ other satisfied students</p>
                </motion.div>
                <FeatureCarousel />
              </div>
            </section>

            {/* Unlock Potential Section - NEW */}
            <section className="py-20 md:py-32 bg-[#faf5ed]">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-5xl text-[#FFB000] font-bold">Unlock your learning potential</h2>
                        <p className="text-lg text-gray-700 mt-4">We've crafted the platform to make sure you get the results you want</p>
                    </div>
                    <div className="max-w-3xl mx-auto">
                        <div className="flex flex-col gap-12">
                            {featuresData.map((feature, index) => (
                                <div key={index}>
                                    <h3 className="text-3xl text-[#FFB000] font-bold mb-2">{feature.title}</h3>
                                    <p className="text-gray-700 text-lg">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

             {/* Expertise Section */}
            <section className="py-24 bg-[#faf5ed]">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-5xl text-black font-bold">Unmatched expertise at your fingertips</h2>
                    <p className="text-lg text-gray-700 mt-4">Be a part of the Ryze success story, where numbers speak volumes about us</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mt-16">
                        <div className="text-center p-8 border border-gray-800 rounded-2xl bg-gray-900/30">
                            <p className="text-5xl font-bold text-green-400">500+</p>
                            <p className="text-gray-400 mt-2">students served & counting</p>
                        </div>
                        <div className="text-center p-8 border border-gray-800 rounded-2xl bg-gray-900/30">
                            <p className="text-5xl font-bold text-green-400">1500+</p>
                            <p className="text-gray-400 mt-2">certified tutors with subject expertise</p>
                        </div>
                        <div className="text-center p-8 border border-gray-800 rounded-2xl bg-gray-900/30">
                            <p className="text-5xl font-bold text-green-400">4.9/5</p>
                            <p className="text-gray-400 mt-2">Avg rating for tutor session</p>
                        </div>
                        <div className="text-center p-8 border border-gray-800 rounded-2xl bg-gray-900/30">
                            <p className="text-5xl font-bold text-green-400">100%</p>
                            <p className="text-gray-400 mt-2">students say their grades improved significantly</p>
                        </div>
                    </div>
                </div>
            </section>

             {/* Testimonials Section */}
            <section className="py-20 md:py-32">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-5xl font-bold">Our students love us </h2>
                        <p className="text-lg text-gray-400 mt-4">Join over 250+ other students excelling in their academics with Ryze</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div className="bg-gray-900/50 p-10 rounded-3xl border border-gray-800">
                             <p className="text-2xl italic text-gray-300">"I honestly couldn't have done it without the sessions at Ryze. Mike has a way of explaining the most abstract concepts in Extension 2 so they actually feel simple. Highly recommend Ryze to anyone looking for not just tutoring but also a mentor and friend."</p>
                            <div className="mt-8 flex items-center gap-4">
                                <img src="https://res.cloudinary.com/dsvjhemjd/image/upload/v1769581194/tutor2_rytlim.png" className="w-16 h-16 rounded-full object-cover border-2 border-green-400" alt="Jason"/>
                                <div>
                                    <p className="font-bold text-lg">Jason Y.</p>
                                    <p className="text-gray-400">99.85 ATAR | Ext 2 - 98</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="grid grid-cols-4 gap-4 max-w-sm">
                                <img src="https://res.cloudinary.com/dsvjhemjd/image/upload/v1769601239/tes5_cropped_gdj3jx.png" className="w-20 h-20 rounded-full object-cover border-2 border-green-400 opacity-70 hover:opacity-100" alt="student"/>
                                <img src="https://res.cloudinary.com/dsvjhemjd/image/upload/v1769601232/tes4_cropped_bflbaz.png" className="w-20 h-20 rounded-full object-cover border-2 border-green-400 opacity-70 hover:opacity-100" alt="student"/>
                                <img src="https://res.cloudinary.com/dsvjhemjd/image/upload/v1769601239/tes1_cropped_slcxdg.png" className="w-20 h-20 rounded-full object-cover border-2 border-green-400 opacity-70 hover:opacity-100" alt="student"/>
                                <img src="https://res.cloudinary.com/dsvjhemjd/image/upload/v1769581187/tes7_ujk1je.png" className="w-20 h-20 rounded-full object-cover border-2 border-green-400 opacity-70 hover:opacity-100" alt="student"/>
                                <img src="https://res.cloudinary.com/dsvjhemjd/image/upload/v1769581193/tes6_dcowey.png" className="w-20 h-20 rounded-full object-cover border-2 border-green-400 opacity-70 hover:opacity-100" alt="student"/>
                                <img src="https://res.cloudinary.com/dsvjhemjd/image/upload/v1769601234/tes3_cropped_qh0olo.png" className="w-20 h-20 rounded-full object-cover border-2 border-green-400 opacity-70 hover:opacity-100" alt="student"/>
                                <img src="https://res.cloudinary.com/dsvjhemjd/image/upload/v1769601233/tes8_cropped_a3j3tv.png" className="w-20 h-20 rounded-full object-cover border-2 border-green-400 opacity-70 hover:opacity-100" alt="student"/>
                                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold text-lg">+250</div>
                            </div>
                            <p className="text-center mt-6 text-gray-400">Join the Ryze community in becoming higher achievers</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Discover Section - NEW */}
            <section className="py-20 md:py-32">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-5xl font-bold">Discover the perfect tutor-match</h2>
                        <p className="text-lg text-gray-400 mt-4">3 simple steps to connect with your best tutor ever.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        {/* Left Column: Phone Mockup */}
                        <div className="flex justify-center">
                            <div className="bg-white/5 border border-white/10 rounded-[40px] p-4 shadow-2xl">
                                <div className="bg-gray-900 rounded-[30px] overflow-hidden">
                                    <img src="https://res.cloudinary.com/dsvjhemjd/image/upload/v1770132381/Screenshot_2024-07-28_at_15.42.06_n12j2o.png" alt="Phone Screen Mockup" className="w-full h-auto" />
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
                                <h3 className="text-sm font-bold text-[#FFB000] mb-2">STEP 1</h3>
                                <h4 className="text-2xl font-bold mb-3">Schedule in a free consultation</h4>
                                <p className="text-gray-400">Get immediate help when you need it the most. No more struggling alone with complex concepts or last-minute questions. Our tutors are just a click away!</p>
                            </div>

                            {/* Step 2 */}
                            <div className="pl-12 relative">
                                <div className="absolute left-0 top-1.5 flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-[#FFB000]/50 border-2 border-[#FFB000]"></div>
                                </div>
                                <h3 className="text-sm font-bold text-[#FFB000] mb-2">STEP 2</h3>
                                <h4 className="text-2xl font-bold mb-3">Diagnosis & Feedback </h4>
                                <p className="text-gray-400">Every student is unique, and so are our tutoring sessions. Receive one-on-one attention tailored to your specific needs and learning pace.</p>
                            </div>

                            {/* Step 3 */}
                            <div className="pl-12 relative">
                                <div className="absolute left-0 top-1.5 flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-[#FFB000]/50 border-2 border-[#FFB000]"></div>
                                </div>
                                <h3 className="text-sm font-bold text-[#FFB000] mb-2">STEP 3</h3>
                                <h4 className="text-2xl font-bold mb-3">Personalised Learning Plan </h4>
                                <p className="text-gray-400">Choose a convenient time slot and book your first free tutoring session with your selected tutor.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

             {/* CTA Section */}
            <section className="py-20 md:py-24">
                <div className="container mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <p className="text-lg text-[#FFB000] font-bold">NO STRINGS ATTACHED</p>
                        <h2 className="text-3xl md:text-5xl font-bold mt-4">Book your consultation <br/> absolutely <span className="relative inline-block">free</span></h2>
                        <p className="text-lg text-gray-400 mt-6 max-w-md">Claim your first FREE tutoring session now! Simply click the button below and witness the magic of personalized learning.</p>
                        <button className="bg-[#FFB000] text-white font-bold px-10 py-4 rounded-lg text-lg hover:bg-[#FFB000] transition-colors mt-8 shadow-lg shadow-[#FFB000]/20">
                            Get Started for Free
                        </button>
                    </div>
                    <div className="relative h-[400px] bg-black rounded-3xl border border-gray-800 flex items-center justify-center">
                        <img src="https://res.cloudinary.com/dsvjhemjd/image/upload/v1769581194/onlinev4_rytlim.png" className="w-full h-full object-cover rounded-3xl opacity-80" alt="online class"/>
                        <div className="absolute top-4 right-4 bg-red-600 px-3 py-1 text-sm rounded-full font-semibold animate-pulse">LIVE</div>
                    </div>
                </div>
            </section>

            {/* Contact Form Section */}
            <section id="contact-form-section" className="py-20 md:py-24">
                 <div className="max-w-2xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h3 className="text-3xl font-bold text-white mb-4">Send us a Message</h3>
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
                                className="w-full px-6 py-4 rounded-2xl bg-black/20 border-2 border-white/50 text-white focus:border-green-500 focus:bg-black/30 outline-none transition-all font-medium disabled:opacity-70 disabled:cursor-not-allowed"
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
                              className="w-full px-6 py-4 rounded-2xl bg-black/20 border-2 border-white/50 text-white focus:border-green-500 focus:bg-black/30 outline-none transition-all font-medium resize-none disabled:opacity-70 disabled:cursor-not-allowed"
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
            <section className="py-20 md:py-32">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-3 gap-16">
                        <div className="md:col-span-1">
                            <FaQuestionCircle size={40} className="text-[#FFB000] mb-6" />
                            <h2 className="text-3xl md:text-5xl font-bold mb-4">Still not convinced?</h2>
                            <p className="text-gray-400 text-lg">
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
                                        <p className="text-lg font-semibold">{faq.question}</p>
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
                                                <p className="text-gray-400 pb-6 px-6">
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
            <footer className="bg-black/30 text-white pt-24 pb-12">
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
                                    className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#FFB000] hover:text-white transition-all duration-300"
                                  >
                                    <Icon size={20} />
                                  </a>
                                ))}
                              </div>
                        </div>
                    </div>
                    <div className="mt-16 pt-8 border-t border-gray-800 text-center text-gray-500">
                        <p>&copy; {new Date().getFullYear()} Ryze Education. All Rights Reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;

