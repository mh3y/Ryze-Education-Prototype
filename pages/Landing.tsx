import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { FaQuestionCircle, FaPlus, FaLinkedin, FaInstagram, FaFacebook, FaWhatsapp } from 'react-icons/fa';
import { Phone, ArrowRight, Send, Loader2, CheckCircle2, AlertCircle, Users, Star, Trophy, Activity, GraduationCap, PenTool, Smile, Laptop, Award, TrendingUp } from 'lucide-react';
import { FaMinus } from 'react-icons/fa6';

declare global {
    interface Window {
      gtag: (...args: any[]) => void;
      fbq?: (...args: any[]) => void;
    }
  }

const Landing: React.FC = () => {
    const featuresData = [
      {
        title: "Expert-Led Tutoring You Can Trust",
        description: "Learn from NSW‑certified teachers and PhD scholars with proven academic excellence. Our team isn’t made of random tutors — we are specialists who understand the curriculum deeply and deliver guidance with authority, expertise, and real educational leadership.",
        images: []
      },
      {
        title: "Signature Syllabus‑Aligned Resources",
        description: "Forget generic textbook material. Our tutoring is powered by exclusive, syllabus‑aligned resources created by expert NSW teachers. Every lesson is backed by purpose-built content that targets what students actually need to excel in school assessments and statewide standards.",
      },
      {
        title: "Mentorship Beyond Tutoring",
        description: "We don’t just teach — we guide. Our student‑centred mentorship offers genuine care, support, and direction for academic decisions, subject selections, uni pathways, and life choices. Students get complete help between sessions from mentors who are not only educators, but trusted allies in their success.",
        images: []
      },
    ];

    const faqData = [
      {
        question: "What makes Ryze different?",
        answer: `Most tutors are university students who did well in maths.
    
    We are founded and led by NSW accredited teachers who've marked HSC papers and taught in NSW classrooms while also being high achievers themselves. That means you learn with syllabus‑aligned resources built by educators who understand the marking criteria, the common mistakes, and what separates strong performances from exceptional ones.
    
    While other students work through generic materials, you're training with resources that mirror your actual exams: same structure, same standards.
    
    The result?
    
    Faster improvement. Deeper understanding. And a real competitive edge over other students.`
      },
      {
        question: "What subjects do you offer?",
        answer: `Mathematics. From primary through to HSC Extension 2.
    
    We offer dedicated support for NAPLAN, OC, and Selective Exam Preparation.
    
    We specialise. We don't spread ourselves thin across every subject. We focus on maths — and we do it better than anyone else.`
      },
      {
        question: "What discounts do you have?",
        answer: `You can save up to 50% through early enrolment, multiple subjects, upfront payments, and referrals.
        
    We believe every student deserves access to exceptional education. That's why we offer substantial discounts to make it happen.
    
    Reach out and let's discuss how we can support you.`
      },
      {
        question: "What qualifications do we hold?",
        answer: `NSW accredited teachers. PhD scholars. HSC markers.
    
    Not just high achievers — actual teachers or educators with extensive classroom experience.
    
    We don't just know the content. We know how it's taught, how it's tested, and how to help you master it.
    
    That's the standard. No exceptions.`
      },
      {
        question: "What does Ryze mentorship program offer?",
        answer: `More than theory. More than practice questions.
    
    Our founders and educators aren't just teachers — they're accomplished scholars and passionate mentors who have excelled at the highest levels of mathematics and education. They bring real-world expertise, academic rigor, and genuine care to every session. Students gain more than subject knowledge; they receive career guidance, study strategies, and inspiration from mentors who truly understand the path to success. 
    
    When you join Ryze Education, you become part of a community dedicated to academic excellence and personal growth. Our students support each other, learn from the best, and develop the skills and mindset needed to thrive — not just in maths, but in all their future endeavors.`
      }
    ];    

    const [bgImage, setBgImage] = useState(
      'https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto:good,dpr_auto,w_960/ryze/images/home-background-overlayv2'
    );
    const [isMobileViewport, setIsMobileViewport] = useState(true);

    const handlePhoneClick = async () => {
        // Google Ads conversion tracking
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'conversion', {
            'send_to': 'AW-17763964178/xkRDCOqQr_wbEJKqwpZC',
            'event_callback': () => {
              console.log('Google Ads conversion event successfully sent from Landing page.');
            }
          });
        }

        // Meta CAPI (Facebook) conversion tracking
        try {
          await fetch('/api/meta-conversion', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              eventName: 'Lead',
              userAgent: navigator.userAgent,
              sourceUrl: window.location.href,
            }),
          });
        } catch (capiError) {
          console.error('Meta CAPI (Lead) submission error:', capiError);
        }
      };

    const SalesBanner = () => (
        <div className="sticky top-0 z-50 bg-gradient-to-r from-[#FFB000] to-[#FF8A00] text-white text-center p-3 shadow-lg animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="container mx-auto px-4">
                <p className="font-semibold text-sm sm:text-base">
                    Save up to 50% through early enrolment, multiple subjects, upfront payments, and referrals. 
                    <a href="tel:+61413885839" onClick={handlePhoneClick} className="underline hover:text-yellow-200 font-bold ml-2 inline-flex items-center gap-1.5">
                        Call us to find out more!
                        <Phone size={16} />
                    </a>
                </p>
            </div>
        </div>
    );
    
    const team = [
      {
        id: "mike-nojiri",
        name: "Mike Nojiri",
        role: "Master's in Teaching | BSc(Math)/BCompSc",
        atar: "99.25",
        scores: ["98 Maths Ext 2", "|", "99 Maths Ext 1", "99 Maths Advanced (Accelerated)"],
        image: "https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto:good,c_fill,g_auto,w_700,h_900,dpr_auto/v1769561928/869fcdd5dfa6efd8ee8853d9e0eea053_kiv4v2.jpg",
        fallback: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
      },
      {
        id: "william-gong",
        name: "William Gong",
        role: "PhD - AI & Machine Learning candidate",
        atar: "99.50",
        scores: ["99 Maths Ext 2", "|", "97 Maths Ext 1", "|", "97 Physics", "94 Chemistry"],
        image: "https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto:good,c_fill,g_auto,w_700,h_900,dpr_auto/v1769568491/34b29c410f6278cf36653c984998c5fe_diuyma.jpg",
        fallback: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
      },
      {
        id: "gordon-ye",
        name: "Gordon Ye",
        role: "UNSW Academic Teaching Staff | BMaths/BCompSc",
        atar: "99.55",
        scores: ["98 Maths Ext 2", "|", "98 Maths Ext 1", "|", "97 Physics", "96 Chemistry"],
        image: "https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto:good,c_fill,g_auto,w_700,h_900,dpr_auto/v1764460809/588278725_1528730215077629_8325133640910985831_n_mr2y31.jpg",
        fallback: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
      }
    ];

    useEffect(() => {
        const getImageUrl = (width: number) => {
            const baseUrl = 'https://res.cloudinary.com/dsvjhemjd/image/upload';
            const imageId = 'ryze/images/home-background-overlayv2';
            let transformations = 'f_auto,q_auto:good,dpr_auto';
        
            if (width < 768) {
                transformations += ',w_640';
            } else if (width >= 768 && width < 1280) {
                transformations += ',w_960';
            } else {
                transformations += ',w_1440';
            }
            
            return `${baseUrl}/${transformations}/${imageId}`;
        };
    
        const handleResize = () => {
            const screenWidth = window.innerWidth;
            
            // Keep background image in a responsive Cloudinary bucket.
            setBgImage(getImageUrl(screenWidth));
        };
    
        // Set the initial values when the component mounts
        handleResize();
        
        // Add event listener to update values on window resize
        window.addEventListener('resize', handleResize);
    
        // Cleanup by removing the event listener when the component unmounts
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []); // The empty array ensures this runs only once on mount and on cleanup

    useEffect(() => {
      const mediaQuery = window.matchMedia('(max-width: 767px)');
      const updateViewport = () => setIsMobileViewport(mediaQuery.matches);
      updateViewport();
      mediaQuery.addEventListener('change', updateViewport);
      return () => mediaQuery.removeEventListener('change', updateViewport);
    }, []);

    useEffect(() => {
      document.title = 'Ryze Education | HSC Maths Tutor Sydney | Extension 2 Expert';

      let descriptionTag = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
      if (!descriptionTag) {
        descriptionTag = document.createElement('meta');
        descriptionTag.name = 'description';
        document.head.appendChild(descriptionTag);
      }
      descriptionTag.content = 'Premium small-group tutoring in Sydney for HSC Maths, Extension 1 and Extension 2. Expert-led programs focused on faster improvement and stronger exam performance.';

      let canonicalTag = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!canonicalTag) {
        canonicalTag = document.createElement('link');
        canonicalTag.rel = 'canonical';
        document.head.appendChild(canonicalTag);
      }
      canonicalTag.href = window.location.origin + window.location.pathname;
    }, []);

    useEffect(() => {
      if (!import.meta.env.PROD) return;
      if (new URLSearchParams(window.location.search).get('debug') !== 'perf') return;
      if (!('PerformanceObserver' in window)) return;

      let lastLcp: any = null;
      const observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        lastLcp = entries[entries.length - 1];
      });

      try {
        observer.observe({ type: 'largest-contentful-paint', buffered: true } as PerformanceObserverInit);
      } catch {
        return;
      }

      const logLcp = () => {
        if (!lastLcp) return;
        const element = (lastLcp as any).element as HTMLElement | null;
        const imageElement = element as HTMLImageElement | null;
        const lcpUrl = (lastLcp as any).url || imageElement?.currentSrc || imageElement?.src || '';

        console.info('[perf-debug] largest-contentful-paint', {
          startTimeMs: Math.round(lastLcp.startTime),
          renderTimeMs: Math.round((lastLcp as any).renderTime || 0),
          loadTimeMs: Math.round((lastLcp as any).loadTime || 0),
          size: Math.round((lastLcp as any).size || 0),
          elementTag: element?.tagName || 'unknown',
          elementClass: element?.className || '',
          url: lcpUrl,
          textSample: element?.textContent?.trim().slice(0, 120) || ''
        });
      };

      const onVisibilityChange = () => {
        if (document.visibilityState === 'hidden') {
          logLcp();
          observer.disconnect();
        }
      };

      document.addEventListener('visibilitychange', onVisibilityChange);
      window.addEventListener('pagehide', logLcp, { once: true });

      return () => {
        observer.disconnect();
        document.removeEventListener('visibilitychange', onVisibilityChange);
      };
    }, []);
  
    const [openFaq, setOpenFaq] = useState<number | null>(null);    

    const socialLinks = [
      {
        Icon: FaFacebook,
        href: 'https://www.facebook.com/people/Ryze-Education/61583067491158/?mibextid=wwXIfr&rdid=pqwYdpqBoSmmo7cn&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1Ch1Yo8qHp%2F%3Fmibextid%3DwwXIfr',
        label: 'Visit Ryze Education on Facebook'
      },
      {
        Icon: FaInstagram,
        href: 'https://www.instagram.com/ryzeeducation/?igsh=MTI3Z21xcHRzZnFxZA%3D%3D&utm_source=qr#',
        label: 'Visit Ryze Education on Instagram'
      },
      {
        Icon: FaLinkedin,
        href: 'https://www.linkedin.com/company/ryze-education',
        label: 'Visit Ryze Education on LinkedIn'
      },
      {
        Icon: FaWhatsapp,
        href: 'https://api.whatsapp.com/message/6GUJFT6GY2DHG1?autoload=1&app_absent=0',
        label: 'Chat with Ryze Education on WhatsApp'
      }
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
            // Fire Google Ads conversion on successful form submission
            if (typeof window.gtag === 'function') {
                window.gtag('event', 'conversion', {
                    'send_to': 'AW-17763964178/[FORM_CONVERSION_LABEL]',
                });
            }

            // Meta CAPI
            try {
                await fetch('/api/meta-conversion', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        eventName: 'Contact',
                        name: formData.name,
                        email: formData.email,
                        phone: formData.phone,
                        userAgent: navigator.userAgent,
                        sourceUrl: window.location.href,
                    }),
                });
            } catch (capiError) {
                console.error('Meta CAPI submission error:', capiError);
            }

            setFormData({ name: '', email: '', phone: '', message: '', honey: '' });
            setStatus('success');
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

      const scrollToResults = () => {
          const resultsSection = document.getElementById('real-results-section');
          if (resultsSection) {
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
      };

      const features = [
        { 
            icon: Users, 
            title: "Small Classes", 
            desc: "Max 6 students. You won't get lost in the crowd, ensuring personal attention.",
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
      isMobileViewport ? (
        <div className="grid grid-cols-1 gap-4 mt-12">
          {features.slice(0, 3).map((feature, idx) => (
            <div
              key={idx}
              className="bg-black/20 p-6 rounded-3xl border border-white/10 backdrop-blur-lg text-left"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-[#FFB000] border border-[#FF8A00]/30">
                <feature.icon size={24} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-300 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="feature-marquee mt-24 w-full [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]" tabIndex={0} aria-label="Ryze learning features">
            <div className="feature-marquee-track">
                {(reduce ? features : [...features, ...features]).map((feature, idx) => (
                    <div 
                      key={`${feature.title}-${idx}`} 
                      className="flex-shrink-0 w-[clamp(280px,56vw,420px)] bg-black/20 p-8 rounded-3xl border border-white/10 backdrop-blur-lg"
                      aria-hidden={!reduce && idx >= features.length}
                    >
                        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl border border-[#FF8A00]/30 bg-[#FFB000]">
                            <feature.icon size={28} className="text-white" />
                        </div>
                        <h3 className="mb-3 text-xl font-bold text-white">{feature.title}</h3>
                        <p className="text-base leading-relaxed text-gray-300">{feature.desc}</p>
                    </div>
                ))}
            </div>
        </div>
      )
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
        description: "overall experience at Ryze"
      },
      {
        icon: <TrendingUp size={40} className="text-[#FFB000]" />,
        value: "100%",
        description: "of students' grades improved significantly"
      }
    ];
    
    const heroImageBase = 'https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto,c_fill,g_auto,dpr_auto';
    const heroImageId = 'ryze/images/image-v1';
    const heroImageSrc = `${heroImageBase},w_768/${heroImageId}`;
    const heroImageSrcSet = [
      `${heroImageBase},w_360/${heroImageId} 360w`,
      `${heroImageBase},w_480/${heroImageId} 480w`,
      `${heroImageBase},w_640/${heroImageId} 640w`,
      `${heroImageBase},w_768/${heroImageId} 768w`,
      `${heroImageBase},w_960/${heroImageId} 960w`,
      `${heroImageBase},w_1200/${heroImageId} 1200w`,
      `${heroImageBase},w_1280/${heroImageId} 1280w`,
    ].join(', ');
    const consultationImageBase = 'https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto:good,c_fill,g_auto,dpr_auto';
    const consultationImageId = 'v1769561936/online_xnzlfr';
    const consultationImageSrc = `${consultationImageBase},w_540/${consultationImageId}`;
    const consultationImageSrcSet = [
      `${consultationImageBase},w_360/${consultationImageId} 360w`,
      `${consultationImageBase},w_540/${consultationImageId} 540w`,
      `${consultationImageBase},w_720/${consultationImageId} 720w`,
    ].join(', ');
    const testimonialAvatarBase = 'https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto:good,c_fill,g_face,dpr_auto';
    const testimonialAvatarId = 'v1769866078/images_qbe5xh';
    const testimonialAvatarSrc = `${testimonialAvatarBase},w_128,h_128/${testimonialAvatarId}`;

    return (
        <div className="bg-[#0D0D0D] text-white font-sans overflow-x-hidden">
          <SalesBanner />
          {/* Header */}
          <section className="relative text-white bg-slate-900">
            <img
              src={heroImageSrc}
              srcSet={heroImageSrcSet}
              sizes="(max-width: 768px) 100vw, 1200px"
              alt="HSC Maths tutoring - Ryze Education"
              fetchPriority="high"
              loading="eager"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Background Overlay */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

            {/* Simplified Header */}
            <header className="relative z-20 container mx-auto px-6 py-6 flex justify-between items-center">
                <div className="text-3xl font-bold text-white">RYZE EDUCATION</div>
                <div>
                    <button 
                      onClick={scrollToResults}
                      className="border border-[#FFB000] bg-[#FFB000]/85 text-white px-6 py-2 md:px-8 md:py-3 rounded-lg hover:bg-[#FFB000] hover:text-white transition-colors font-semibold text-sm md:text-base"
                    >
                        Book your free consultation
                    </button>
                </div>
            </header>

            {/* Hero Content */}
            <div className="relative z-10 container mx-auto px-6 text-center pt-20 pb-16">
                <motion.h1
                    initial={isMobileViewport ? false : {
                      opacity: 0,
                      scale: reduce ? 1 : 0.98,
                      clipPath: reduce ? "inset(0% 0% 0% 0%)" : "inset(0% 0% 100% 0%)"
                    }}
                    animate={isMobileViewport ? { opacity: 1 } : {
                      opacity: 1,
                      scale: 1,
                      clipPath: "inset(0% 0% 0% 0%)"
                    }}
                    transition={isMobileViewport ? { duration: 0 } : { duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                    className="text-4xl sm:text-5xl md:text-7xl font-extrabold leading-tight tracking-tight text-white"
                >
                    <span className="block">YOUR PATH TO SUCCESS</span>
                    <span className="relative block">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FFE29A] via-[#FFB000] to-[#FF8A00]">
                            STARTS HERE
                        </span>
                        {!isMobileViewport && (
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
                        )}
                    </span>
                </motion.h1>
                <motion.p
                    initial={isMobileViewport ? false : { y: 16, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={isMobileViewport ? { duration: 0 } : { delay: 0.3, duration: 0.6, ease: "easeOut" }}
                    className="text-base md:text-xl text-gray-300 mt-8 max-w-2xl mx-auto"
                >
                    Selective entry. Top bands. Extension 2 excellence. It all starts with the right mentor.
                    {/* Founded by accredited teachers and PhD scholars, we specialise in MATHEMATICS from primary through to HSC Extension 2 */}
                </motion.p>
                <motion.div
                    initial={isMobileViewport ? false : { y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={isMobileViewport ? { duration: 0 } : { duration: 0.8, delay: 0.4, ease: "easeInOut" }}
                    className="mt-12 flex flex-col items-center gap-4"
                >
                    <button 
                      onClick={scrollToResults}
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
                            <p className="text-lg text-slate-700">
                              Our experienced educators are committed to helping every student thrive. Not just tutors, but qualified teachers and high-achievers.
                            </p>
                         </div>
                      </div>
            
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                         {team.map((member, idx) => (
                           <motion.div
                           key={idx}
                           className="group cursor-pointer"
                           initial={isMobileViewport ? false : { opacity: 0, y: 20 }}
                           whileInView={isMobileViewport ? undefined : { opacity: 1, y: 0 }}
                           viewport={{ once: true }}
                           transition={isMobileViewport ? { duration: 0 } : { delay: idx * 0.1 }}
                         >
                          {member.scores && member.scores.length > 0 && (
                            <div className="mb-6">
                              <div className="bg-white backdrop-blur-md rounded-xl p-3 border border-slate-100">
                                <h4 className="text-xl font-bold text-amber-700 mb-2 text-center uppercase tracking-wider">HSC Marks</h4>
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
                               width={700}
                               height={900}
                               loading="lazy"
                               decoding="async"
                               sizes="(max-width: 767px) 90vw, (max-width: 1200px) 33vw, 350px"
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
                                <img
                                  src={testimonialAvatarSrc}
                                  srcSet={`${testimonialAvatarBase},w_96,h_96/${testimonialAvatarId} 96w, ${testimonialAvatarBase},w_128,h_128/${testimonialAvatarId} 128w, ${testimonialAvatarBase},w_160,h_160/${testimonialAvatarId} 160w`}
                                  sizes="64px"
                                  width={64}
                                  height={64}
                                  loading="lazy"
                                  decoding="async"
                                  className="w-16 h-16 rounded-full object-cover border-2 border-green-40 blur(2px)"
                                  alt="Student testimonial avatar"
                                />
                                <div>
                                    <p className="font-bold text-xl text-slate-700">Jason Y.</p>
                                    <p className="font-bold text-lg text-amber-700">99.85 ATAR | 98 Ext 2 </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-center">
                        <div className="grid grid-cols-4 gap-4 max-w-sm">
                            <img src="https://res.cloudinary.com/dsvjhemjd/image/upload/w_133,h_133,c_fill,f_auto,q_auto/v1769601239/tes5_cropped_gdj3jx.png" width={80} height={80} loading="lazy" className="w-20 h-20 rounded-full object-cover border-2 border-[#FFB000] opacity-70 hover:opacity-100" alt="student"/>
                            <img src="https://res.cloudinary.com/dsvjhemjd/image/upload/w_133,h_133,c_fill,f_auto,q_auto/v1769601232/tes4_cropped_bflbaz.png" width={80} height={80} loading="lazy" className="w-20 h-20 rounded-full object-cover border-2 border-[#FFB000] opacity-70 hover:opacity-100" alt="student"/>
                            <img src="https://res.cloudinary.com/dsvjhemjd/image/upload/w_133,h_133,c_fill,f_auto,q_auto/v1769601239/tes1_cropped_slcxdg.png" width={80} height={80} loading="lazy" className="w-20 h-20 rounded-full object-cover border-2 border-[#FFB000] opacity-70 hover:opacity-100" alt="student"/>
                            <img src="https://res.cloudinary.com/dsvjhemjd/image/upload/w_133,h_133,c_fill,f_auto,q_auto/v1769581187/tes7_ujk1je.png" width={80} height={80} loading="lazy" className="w-20 h-20 rounded-full object-cover border-2 border-[#FFB000] opacity-70 hover:opacity-100" alt="student"/>
                            <img src="https://res.cloudinary.com/dsvjhemjd/image/upload/w_133,h_133,c_fill,f_auto,q_auto/v1769581193/tes6_dcowey.png" width={80} height={80} loading="lazy" className="w-20 h-20 rounded-full object-cover border-2 border-[#FFB000] opacity-70 hover:opacity-100" alt="student"/>
                            <img src="https://res.cloudinary.com/dsvjhemjd/image/upload/w_133,h_133,c_fill,f_auto,q_auto/v1769601234/tes3_cropped_qh0olo.png" width={80} height={80} loading="lazy" className="w-20 h-20 rounded-full object-cover border-2 border-[#FFB000] opacity-70 hover:opacity-100" alt="student"/>
                            <img src="https://res.cloudinary.com/dsvjhemjd/image/upload/w_133,h_133,c_fill,f_auto,q_auto/v1769601233/tes8_cropped_a3j3tv.png" width={80} height={80} loading="lazy" className="w-20 h-20 rounded-full object-cover border-2 border-[#FFB000] opacity-70 hover:opacity-100" alt="student"/>
                            <div className="w-20 h-20 rounded-full bg-[#FFB000]/15 flex items-center justify-center text-amber-700 font-bold text-lg">+500</div>
                        </div>
                            <p className="text-center mt-6 text-gray-700">Join the Ryze community in becoming higher achievers</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Unlock Potential Section - NEW
            <section className="py-20 md:py-32 bg-[#f9f9f7]">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-5xl text-black font-bold">Unlock your learning potential</h2>
                        <p className="text-lg text-gray-700 mt-4">We\'ve crafted the platform to make sure you get the results you want</p>
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
            </section> */}

            {/* Discover Section */}
            <section className="pt-10 pb-20 md:pt-16 md:pb-28 bg-[#f9f9f7]">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-5xl text-black font-bold">Our approach is simple</h2>
                        <p className="text-lg text-gray-700 mt-4">We take three steps to ensure we understand your child's needs and create a clear path forward</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        {/* Left Column: Phone Mockup */}
                        <div className="flex justify-center">
                            <div className="bg-white/5 border border-white/10 rounded-[40px] p-4 shadow-2xl">
                                <div className="bg-gray-900 rounded-[30px] overflow-hidden">
                                    <img
                                      src={consultationImageSrc}
                                      srcSet={consultationImageSrcSet}
                                      sizes="(max-width: 767px) 90vw, 720px"
                                      width={720}
                                      height={1280}
                                      loading="lazy"
                                      decoding="async"
                                      alt="Online Consultation"
                                      className="w-full h-auto"
                                    />
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
                                <h3 className="text-base font-bold text-amber-700 mb-2">STEP 1</h3>
                                <h4 className="text-2xl font-bold text-black mb-3">Schedule a free consultation</h4>
                                <p className="text-gray-700">We start with a conversation to understand where your child currently stands, what challenges they're facing, and what you hope to achieve with us. We'll discuss your child's academic goals, learning preferences, and any specific concerns you have. This is also an opportunity for you to learn about our teaching approach and ask any questions.</p>
                            </div>

                            {/* Step 2 */}
                            <div className="pl-12 relative">
                                <div className="absolute left-0 top-1.5 flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-[#FFB000]/50 border-2 border-[#FFB000]"></div>
                                </div>
                                <h3 className="text-base font-bold text-amber-700 mb-2">STEP 2</h3>
                                <h4 className="text-2xl font-bold text-black mb-3">Diagnosis & Feedback </h4>
                                <p className="text-gray-700">The first lesson serves as a detailed assesment. We'll be working to identify specific knowledge gaps, learning patterns or areas that need attention and then provide clear feedback on what we've observed and what needs focus.</p>
                            </div>

                            {/* Step 3 */}
                            <div className="pl-12 relative">
                                <div className="absolute left-0 top-1.5 flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-[#FFB000]/50 border-2 border-[#FFB000]"></div>
                                </div>
                                <h3 className="text-base font-bold text-amber-700 mb-2">STEP 3</h3>
                                <h4 className="text-2xl font-bold text-black mb-3">Personalised Learning Plan </h4>
                                <p className="text-gray-700">Based on the assessment, we develop a tailored plan that addresses your child's specific needs. This outlines our focus areas, the approach we'll take and the goals we're working toward together.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            {/* <section className="py-20 md:py-24 bg-[#f9f9f7]">
                <div className="container mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <p className="text-lg text-[#FFB000] font-bold">NO STRINGS ATTACHED</p>
                        <h2 className="text-3xl md:text-5xl text-black font-bold mt-4">Book your consultation <br/> absolutely <span className="relative inline-block">free</span></h2>
                        <p className="text-lg text-gray-700 mt-6 max-w-md">Claim your first FREE tutoring session now! Simply click the button below and witness the magic of personalised learning.</p>
                        <button className="bg-[#FFB000] text-white font-bold px-10 py-4 rounded-lg text-lg hover:bg-[#FFB000] transition-colors mt-8 shadow-lg shadow-[#FFB000]/20">
                            I\'M READY, SIGN ME UP!
                        </button>
                    </div>
                    <div className="relative h-[400px] bg-black rounded-3xl flex items-center justify-center">
                        <img src="https://res.cloudinary.com/dsvjhemjd/image/upload/v1769561940/personalised_ctuogs.png" className="w-full h-full object-cover rounded-3xl opacity-80" alt="Online Consultation"/>
                        <div className="absolute top-4 right-4 bg-red-600 px-3 py-1 text-sm rounded-full font-semibold animate-pulse">LIVE</div>
                    </div>
                </div>
            </section> */}

            <motion.div id="real-results-section"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={{
                    initial: { opacity: 0 },
                    animate: { opacity: 1, transition: { duration: 0.5, ease: 'easeInOut' } },
                    exit: { opacity: 0, transition: { duration: 0.5, ease: 'easeInOut' } }
                }}
            >
                <div className="font-sans">
                  <div className="relative pt-20">
                    {/* Background Image and Overlay Layer */}
                    <img
                      src={bgImage}
                      width={1440}
                      height={900}
                      loading="lazy"
                      decoding="async"
                      fetchPriority="low"
                      className="absolute inset-0 w-full h-full object-cover z-0"
                      alt=""
                      aria-hidden="true"
                    />
                    <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-sm" />

                    {/* Content Layer */}
                    <div className="relative z-20">
                      <div className="pb-28 pt-24 px-4">
                        <div className="max-w-4xl mx-auto text-center">
                          <h1 className="text-5xl md:text-7xl font-sans font-bold text-white mb-6 tracking-tight">Ready to see real results?</h1>
                          <p className="text-xl font-light text-slate-200">
                            Join the 500+ students who've transformed their grades with Ryze Education.
                          </p>
                        </div>
                      </div>

                      <div className="px-4 sm:px-6 lg:px-8 py-20">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto -mt-32">
                          
                          {/* Card 1: Speak Now */}
                          <div className="bg-slate-900/60 backdrop-blur-md rounded-[2.5rem] shadow-xl p-12 flex flex-col items-center text-center border border-white/20 h-full hover:-translate-y-2 transition-transform duration-300 group">
                              <div className="w-20 h-20 bg-ryze/80 rounded-full flex items-center justify-center text-white mb-8 shadow-lg shadow-ryze/30 group-hover:bg-[#FFB000] group-hover:scale-110 transition-transform">
                                <Phone size={32} />
                              </div>
                              <h2 className="text-3xl font-bold text-white mb-4">Prefer to Speak now?</h2>
                              
                              <p className="text-slate-300 mb-12 text-lg font-normal leading-relaxed">
                                Sometimes it's just easier to talk. Call us directly and we'll help you out.
                              </p>

                              <a href="tel:+61413885839" onClick={handlePhoneClick} className="mt-auto w-full py-5 bg-white/0 text-white font-bold rounded-2xl hover:bg-ryze/75 hover:text-white transition-all flex items-center border border-white justify-center gap-3 shadow-lg">
                                Give us a call <Phone size={20} fill="currentColor" />
                              </a>
                          </div>

                          {/* Card 2: Message Us */}
                          <div className="bg-slate-900/60 backdrop-blur-md rounded-[2.5rem] shadow-xl p-12 flex flex-col items-center text-center border border-white/20 h-full hover:-translate-y-2 transition-transform duration-300 group">
                              <div className="w-20 h-20 bg-ryze/80 rounded-full flex items-center justify-center text-white mb-8 group-hover:bg-[#FFB000] transition-colors">
                                <Send size={32} />
                              </div>
                              <h2 className="text-3xl font-bold text-white mb-4">Message Us</h2>
                              
                              <p className="text-slate-300 mb-12 text-lg font-normal leading-relaxed">
                                Send us your question or request a call back at a time that suits you.
                              </p>

                              <button 
                                onClick={() => {
                                  const formElement = document.getElementById('contact-form-section');
                                  formElement?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="mt-auto w-full py-5 bg-transparent border-2 border-slate-300 text-slate-300 font-bold rounded-2xl hover:bg-slate-700 hover:text-white transition-all flex items-center justify-center gap-3"
                              >
                                Send Message <ArrowRight size={20} />
                              </button>
                          </div>

                        </div>
                      </div>

            {/* Contact Form Section */}
            <section id="contact-form-section" className="py-20 md:py-24">
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
                                <span className={`text-xs font-medium ${formData.message.length >= 2000 ? 'text-red-500' : 'text-slate-300'}`}>
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
            </div>
          </div>
        </div>
      </motion.div>

            {/* FAQ Section */}
            <section className="py-20 md:py-32 bg-[#f9f9f7]">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-3 gap-16">
                        <div className="md:col-span-1">
                            <FaQuestionCircle size={40} className="text-[#FFB000] mb-6" />
                            <h2 className="text-3xl md:text-5xl text-black font-bold mb-4">Still not convinced?</h2>
                            <p className="text-gray-700 text-lg">
                                Have more questions? Feel free to reach out to us. 
                                <a href="#real-results-section" onClick={(event) => { event.preventDefault(); scrollToResults(); }} className="text-[#FFB000] font-semibold hover:underline cursor-pointer"> Contact us</a>.
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
                            <p className="text-gray-400 leading-relaxed">
                              Education that sees you.<br />
                              Diagnosing gaps, building understanding, and creating confidence in every student.
                            </p>
                        </div>

                        {/* Column 2: Connect With Us */}
                        <div>
                            <h4 className="text-lg font-semibold mb-4 tracking-wide">Connect With Us</h4>
                            <p className="text-gray-400 mb-4">Follow us on our social media channels.</p>
                            <div className="flex space-x-4">
                                {socialLinks.map(({ Icon, href, label }, i) => (
                                  <a 
                                    key={i} 
                                    href={href} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    aria-label={label}
                                    title={label}
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
