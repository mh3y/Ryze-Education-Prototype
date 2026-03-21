import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { AlertCircle, ArrowRight, Award, CheckCircle2, Facebook, GraduationCap, HelpCircle, Instagram, Laptop, Linkedin, Loader2, MessageCircle, Minus, PenTool, Phone, Plus, Send, Smile, Star, Trophy, TrendingUp, Users, Activity } from 'lucide-react';

const Footer = React.lazy(() => import('../components/Footer'));
const Testimonials = React.lazy(() => import('../components/Testimonials'));

declare global {
    interface Window {
      gtag?: (...args: any[]) => void;
      fbq?: (...args: any[]) => void;
    }
  }

const MathsTutoring: React.FC = () => {
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
              console.log('Google Ads conversion event successfully sent from Maths Tutoring page.');
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
        <div className="sticky top-0 z-50 border-b border-[rgba(184,132,30,0.24)] bg-[rgba(23,29,40,0.92)] text-white text-center p-3 shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="container mx-auto px-4">
                <p className="font-semibold text-sm sm:text-base">
                    Save up to 50% through early enrolment, multiple subjects, upfront payments, and referrals. 
                    <a href="tel:+61413885839" onClick={handlePhoneClick} className="underline hover:text-[var(--ryze-200)] font-bold ml-2 inline-flex items-center gap-1.5">
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
      document.title = 'Ryze Education | Maths Tutoring Sydney';

      let descriptionTag = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
      if (!descriptionTag) {
        descriptionTag = document.createElement('meta');
        descriptionTag.name = 'description';
        document.head.appendChild(descriptionTag);
      }
      descriptionTag.content = 'Specialist maths tuition in Sydney, delivered through private tutoring and small-group classes from primary foundations through to senior mathematics.';

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
    const [shouldLoadDeferred, setShouldLoadDeferred] = useState(false);
    const deferredTriggerRef = React.useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      if (shouldLoadDeferred || typeof window === 'undefined') return;

      let idleId: number | null = null;
      let timeoutId: ReturnType<typeof setTimeout> | null = null;
      const triggerLoad = () => setShouldLoadDeferred(true);

      const observer =
        'IntersectionObserver' in window
          ? new IntersectionObserver(
              (entries) => {
                if (entries.some((entry) => entry.isIntersecting)) {
                  triggerLoad();
                }
              },
              { rootMargin: '700px 0px' },
            )
          : null;

      if (deferredTriggerRef.current && observer) {
        observer.observe(deferredTriggerRef.current);
      }

      if ('requestIdleCallback' in window) {
        idleId = (window as any).requestIdleCallback(triggerLoad, { timeout: 2200 });
      } else {
        timeoutId = setTimeout(triggerLoad, 1600);
      }

      return () => {
        observer?.disconnect();
        if (idleId !== null && 'cancelIdleCallback' in window) {
          (window as any).cancelIdleCallback(idleId);
        }
        if (timeoutId !== null) clearTimeout(timeoutId);
      };
    }, [shouldLoadDeferred]);

    const socialLinks = [
      {
        Icon: Facebook,
        href: 'https://www.facebook.com/people/Ryze-Education/61583067491158/?mibextid=wwXIfr&rdid=pqwYdpqBoSmmo7cn&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1Ch1Yo8qHp%2F%3Fmibextid%3DwwXIfr',
        label: 'Visit Ryze Education on Facebook'
      },
      {
        Icon: Instagram,
        href: 'https://www.instagram.com/ryzeeducation/?igsh=MTI3Z21xcHRzZnFxZA%3D%3D&utm_source=qr#',
        label: 'Visit Ryze Education on Instagram'
      },
      {
        Icon: Linkedin,
        href: 'https://www.linkedin.com/company/ryze-education',
        label: 'Visit Ryze Education on LinkedIn'
      },
      {
        Icon: MessageCircle,
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
            desc: "Benefit from the genuine care and academic judgement of mentors who know how to teach with clarity.",
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
              className="rounded-3xl border border-white/10 bg-black/20 p-6 text-left backdrop-blur-lg"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-[rgba(184,132,30,0.3)] bg-[var(--color-ryze-500)]">
                <feature.icon size={24} className="text-white" />
              </div>
              <h3 className="mb-2 text-lg font-display font-bold text-white">{feature.title}</h3>
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
                        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl border border-[rgba(184,132,30,0.3)] bg-[var(--color-ryze-500)]">
                            <feature.icon size={28} className="text-white" />
                        </div>
                        <h3 className="mb-3 text-xl font-display font-bold text-white">{feature.title}</h3>
                        <p className="text-base leading-relaxed text-gray-300">{feature.desc}</p>
                    </div>
                ))}
            </div>
        </div>
      )
    );

    const statsData = [
      {
        icon: <GraduationCap size={40} className="text-[var(--color-ryze-500)]" />,
        value: "500+",
        description: "students served & counting"
      },
      {
        icon: <Award size={40} className="text-[var(--color-ryze-500)]" />,
        value: "13 years",
        description: "of teaching experience and mentoring students"
      },
      {
        icon: <Star size={40} className="text-[var(--color-ryze-500)]" />,
        value: "4.9/5",
        description: "overall experience at Ryze"
      },
      {
        icon: <TrendingUp size={40} className="text-[var(--color-ryze-500)]" />,
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

    return (
        <div className="bg-[#0D0D0D] text-white font-sans overflow-x-hidden">
          <SalesBanner />
          {/* Header */}
          <section className="relative text-white bg-slate-900">
            <img
              src={heroImageSrc}
              srcSet={heroImageSrcSet}
              sizes="(max-width: 768px) 100vw, 1200px"
              alt="Maths tutoring - Ryze Education"
              fetchPriority="high"
              loading="eager"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Background Overlay */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

            {/* Simplified Header */}
            <header className="relative z-20 container mx-auto px-6 py-6 flex justify-between items-center">
                <div className="text-3xl font-display font-bold text-white">RYZE EDUCATION</div>
                <div>
                    <button 
                      onClick={scrollToResults}
                      className="border border-[var(--color-ryze-500)] bg-[var(--color-ryze-500)] text-white px-6 py-2 md:px-8 md:py-3 rounded-lg hover:bg-[var(--color-ryze-400)] hover:text-white transition-colors font-semibold text-sm md:text-base"
                    >
                        Book your free consultation
                    </button>
                </div>
            </header>

            {/* Hero Content */}
            <div className="relative z-10 container mx-auto px-6 text-center pt-20 pb-16">
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold leading-tight tracking-tight text-white">
                    <span className="block">YOUR PATH TO SUCCESS</span>
                    <span className="relative block">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#f3e7c9] via-[#c89e2b] to-[#b8841e]">
                            STARTS HERE
                        </span>
                    </span>
                </h1>
                <p className="text-base md:text-xl text-gray-300 mt-8 max-w-2xl mx-auto">
                    Selective entry. Top bands. Extension 2 excellence. It all starts with the right mentor.
                    {/* Founded by accredited teachers and PhD scholars, we specialise in MATHEMATICS from primary through to HSC Extension 2 */}
                </p>
                <div className="mt-12 flex flex-col items-center gap-4">
                    <button 
                      onClick={scrollToResults}
                      className="bg-[var(--color-ryze-500)] text-white font-bold px-10 py-4 w-full sm:w-auto rounded-lg text-lg hover:bg-[var(--color-ryze-400)] transition-colors shadow-lg shadow-[rgba(184,132,30,0.2)]"
                    >
                        Start your journey now
                    </button>
                    <p className="text-gray-400 mt-5">Join 500+ other satisfied students</p>
                </div>
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
            <section className="relative overflow-hidden bg-[rgba(243,231,201,0.16)] py-16 md:py-24">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(243,231,201,0.55),transparent_62%)]"></div>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                      <div className="flex flex-col md:flex-row justify-center items-center mb-16 gap-6">
                         <div className="max-w-2xl text-center">
                            <div className="eyebrow justify-center">Faculty</div>
                            <h2 className="mt-5 text-4xl lg:text-5xl font-display font-bold text-[var(--primary)] mb-4">Meet the educators behind the standard</h2>
                            <p className="text-[1.02rem] leading-relaxed text-[var(--muted)]">
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
                              <div className="rounded-[1.35rem] border border-[var(--border)] bg-[rgba(248,243,234,0.92)] p-4 backdrop-blur-md shadow-[0_18px_40px_-30px_rgba(17,21,29,0.28)]">
                                <h4 className="mb-2 text-center text-[0.9rem] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">HSC Marks</h4>
                                <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
                                  {member.scores.map((score, i) => (
                                    <span key={i} className="text-[0.95rem] font-semibold text-[var(--primary)]/80">{score}</span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                           <div className="relative mb-6 aspect-[3/4] overflow-hidden rounded-[2.2rem] border border-white/60 bg-[rgba(255,255,255,0.4)] shadow-[0_28px_64px_-44px_rgba(17,21,29,0.44)]">
                             {member.atar && (
                               <div className="absolute top-2 left-2 md:top-4 md:left-4 z-20">
                                 <div
                                   style={{ willChange: 'transform' }}
                                   className="transform rounded-[1.15rem] border border-[rgba(184,132,30,0.18)] bg-[rgba(248,243,234,0.92)] shadow-[0_18px_40px_-26px_rgba(17,21,29,0.34)] backdrop-blur-xl transition-transform duration-300 ease-in-out md:rounded-[1.35rem] md:hover:scale-[1.04]"
                                 >
                                   <div className="px-3.5 py-2.5 text-left text-[var(--primary)] md:px-4.5 md:py-3.5">
                                     <div className="mb-1.5 flex items-center gap-1.5 md:gap-2">
                                       <Star className="h-3.5 w-3.5 text-[var(--accent)] md:h-4 md:w-4" fill="currentColor" />
                                       <p className="text-[0.76rem] font-bold uppercase tracking-[0.18em] text-[var(--accent)] md:text-[0.8rem]">ATAR</p>
                                     </div>
                                     <p className="font-sans text-[1.45rem] font-extrabold tracking-[-0.04em] text-[var(--primary)] md:text-[1.7rem]">{member.atar}</p>
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
                             <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-75 transition-opacity duration-500 group-hover:opacity-100"></div>
                             <div className="absolute bottom-6 left-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-y-2 group-hover:translate-y-0">
                             </div>
                           </div>
                           <div className="pl-2">
                             <h3 className="mb-1 text-2xl font-display font-bold text-[var(--primary)] transition-colors group-hover:text-[var(--accent)]">{member.name}</h3>
                             <p className="mb-1.5 text-[0.98rem] font-medium text-[var(--muted)]">{member.role}</p>
                           </div>
                         </motion.div>          
                        ))}
                      </div>
                    </div>
            </section>

            <div ref={deferredTriggerRef} className="h-px w-full" aria-hidden="true" />

            {/* Testimonials Section */}
            {shouldLoadDeferred && (
              <React.Suspense fallback={<div className="h-[60vh] w-full bg-[var(--bg)]" />}>
                <Testimonials />
              </React.Suspense>
            )}

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
            <section className="bg-[var(--bg)] pb-24 pt-10 md:pb-32 md:pt-16">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="text-center mb-20">
                        <div className="eyebrow justify-center">How It Works</div>
                        <h2 className="mt-5 text-3xl font-display font-bold text-[var(--primary)] md:text-5xl">A clear start for families</h2>
                        <p className="mx-auto mt-4 max-w-3xl text-[1.02rem] leading-relaxed text-[var(--muted)]">We take three steps to understand your child&apos;s needs, identify where support is required, and recommend the most suitable next step.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        {/* Left Column: Phone Mockup */}
                        <div className="flex justify-center">
                            <div className="rounded-[2.4rem] border border-[var(--border)] bg-[rgba(248,243,234,0.92)] p-4 shadow-[0_28px_64px_-44px_rgba(17,21,29,0.44)]">
                                <div className="overflow-hidden rounded-[2rem] bg-[var(--primary)]">
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
                            <div className="absolute bottom-0 left-4 top-0 w-px bg-[rgba(184,132,30,0.28)]"></div>
                            
                            {/* Step 1 */}
                            <div className="pl-12 relative">
                                <div className="absolute left-0 top-1.5 flex items-center">
                                    <div className="h-8 w-8 rounded-full border-2 border-[var(--color-ryze-500)] bg-[rgba(243,231,201,0.92)]"></div>
                                </div>
                                <h3 className="mb-2 text-[0.88rem] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">Step 1</h3>
                                <h4 className="mb-3 text-2xl font-display font-bold text-[var(--primary)]">Schedule a free consultation</h4>
                                <p className="text-[1rem] leading-relaxed text-[var(--muted)]">We begin with a conversation to understand current performance, challenges, goals, and which format is likely to suit your child best.</p>
                            </div>

                            {/* Step 2 */}
                            <div className="pl-12 relative">
                                <div className="absolute left-0 top-1.5 flex items-center">
                                    <div className="h-8 w-8 rounded-full border-2 border-[var(--color-ryze-500)] bg-[rgba(243,231,201,0.92)]"></div>
                                </div>
                                <h3 className="mb-2 text-[0.88rem] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">Step 2</h3>
                                <h4 className="mb-3 text-2xl font-display font-bold text-[var(--primary)]">Diagnosis and feedback</h4>
                                <p className="text-[1rem] leading-relaxed text-[var(--muted)]">The first lesson acts as a real diagnostic. We identify gaps, misconceptions, and patterns in how your child approaches mathematics, then explain what needs attention.</p>
                            </div>

                            {/* Step 3 */}
                            <div className="pl-12 relative">
                                <div className="absolute left-0 top-1.5 flex items-center">
                                    <div className="h-8 w-8 rounded-full border-2 border-[var(--color-ryze-500)] bg-[rgba(243,231,201,0.92)]"></div>
                                </div>
                                <h3 className="mb-2 text-[0.88rem] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">Step 3</h3>
                                <h4 className="mb-3 text-2xl font-display font-bold text-[var(--primary)]">Personalised learning plan</h4>
                                <p className="text-[1rem] leading-relaxed text-[var(--muted)]">We recommend a clear starting pathway, outline what we will focus on, and set expectations for the first stage of progress.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

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
                  <div className="relative isolate overflow-hidden pt-20">
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
                    <div className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(17,21,29,0.72),rgba(17,21,29,0.82))]" />

                    {/* Content Layer */}
                    <div className="relative z-20">
                      <div className="pb-28 pt-24 px-4">
                        <div className="max-w-4xl mx-auto text-center">
                          <h1 className="mb-6 text-5xl font-display font-bold tracking-tight text-white md:text-7xl">Ready to see meaningful progress?</h1>
                          <p className="text-xl font-light text-[rgba(248,243,234,0.8)]">
                            Talk with us about year level, goals, and whether private tutoring or a small-group class is the right fit.
                          </p>
                        </div>
                      </div>

                      <div className="px-4 sm:px-6 lg:px-8 py-20">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto -mt-32">
                          
                          {/* Card 1: Speak Now */}
                          <div className="flex h-full flex-col items-center rounded-[2.5rem] border border-white/14 bg-[rgba(17,21,29,0.72)] p-12 text-center shadow-xl backdrop-blur-md transition-transform duration-300 group hover:-translate-y-2">
                              <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-ryze)] text-[var(--accent-foreground)] shadow-lg shadow-[rgba(255,176,0,0.16)] transition-transform group-hover:scale-110">
                                <Phone size={32} />
                              </div>
                              <h2 className="mb-4 text-3xl font-display font-bold text-white">Prefer to speak now?</h2>
                              
                              <p className="mb-12 text-lg font-normal leading-relaxed text-slate-300">
                                Sometimes it's just easier to talk. Call us directly and we'll help you out.
                              </p>

                              <a href="tel:+61413885839" onClick={handlePhoneClick} className="mt-auto flex w-full items-center justify-center gap-3 rounded-2xl border border-[rgba(255,176,0,0.38)] bg-[rgba(255,176,0,0.12)] py-5 font-bold text-[#fff5db] shadow-lg transition-all hover:bg-[var(--color-ryze)] hover:text-[var(--accent-foreground)]">
                                Give us a call <Phone size={20} fill="currentColor" />
                              </a>
                          </div>

                          {/* Card 2: Message Us */}
                          <div className="flex h-full flex-col items-center rounded-[2.5rem] border border-white/14 bg-[rgba(17,21,29,0.72)] p-12 text-center shadow-xl backdrop-blur-md transition-transform duration-300 group hover:-translate-y-2">
                              <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-[rgba(243,231,201,0.92)] text-[var(--accent)] transition-colors group-hover:bg-white">
                                <Send size={32} />
                              </div>
                              <h2 className="mb-4 text-3xl font-display font-bold text-white">Message us</h2>
                              
                              <p className="mb-12 text-lg font-normal leading-relaxed text-slate-300">
                                Send us your question or request a call back at a time that suits you.
                              </p>

                              <button 
                                onClick={() => {
                                  const formElement = document.getElementById('contact-form-section');
                                  formElement?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="mt-auto flex w-full items-center justify-center gap-3 rounded-2xl border border-white/20 bg-white/6 py-5 font-bold text-[rgba(248,243,234,0.84)] transition-all hover:border-[rgba(255,176,0,0.34)] hover:bg-white/10 hover:text-white"
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
                        <h3 className="mb-4 text-4xl font-display font-bold text-white">Send us a Message</h3>
                        <p className="text-[rgba(248,243,234,0.74)]">We typically respond within 24 hours.</p>
                    </div>
                    
                    {status === 'success' ? (
                      <div className="animate-in fade-in zoom-in duration-300 rounded-[2rem] border border-green-400 bg-green-900/50 p-10 text-center backdrop-blur-md">
                         <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 size={40} />
                         </div>
                         <h4 className="mb-4 text-2xl font-display font-bold text-white">Message Sent!</h4>
                         <p className="mb-8 max-w-md mx-auto text-green-200">
                            Thanks for reaching out to Ryze. We've received your enquiry and will be in touch with you shortly.
                         </p>
                         <button 
                            onClick={() => setStatus('idle')}
                            className="rounded-xl border border-slate-600 bg-slate-800 px-8 py-3 font-sans text-base font-semibold text-white transition-colors hover:bg-slate-700"
                         >
                            Send Another Message
                         </button>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="relative space-y-6 font-sans">
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
                              <label htmlFor="name" className="block font-sans text-sm font-semibold uppercase tracking-[0.12em] text-slate-200">Name</label>
                              <input
                                type="text"
                                id="name"
                                name="name"
                                required
                                maxLength={100}
                                value={formData.name}
                                onChange={handleChange}
                                disabled={status === 'sending'}
                                className="w-full rounded-2xl border border-white/22 bg-black/18 px-6 py-4 font-sans text-[1.02rem] font-medium text-white outline-none transition-all placeholder:font-sans placeholder:text-[rgba(248,243,234,0.56)] focus:border-[var(--color-ryze)] focus:bg-black/30 focus:ring-2 focus:ring-[rgba(255,176,0,0.16)] disabled:cursor-not-allowed disabled:opacity-70"
                                placeholder="Your Full Name"
                              />
                            </div>
                            <div className="space-y-2">
                              <label htmlFor="email" className="block font-sans text-sm font-semibold uppercase tracking-[0.12em] text-slate-200">Email</label>
                              <input
                                type="email"
                                id="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                disabled={status === 'sending'}
                                className="w-full rounded-2xl border border-white/22 bg-black/18 px-6 py-4 font-sans text-[1.02rem] font-medium text-white outline-none transition-all placeholder:font-sans placeholder:text-[rgba(248,243,234,0.56)] focus:border-[var(--color-ryze)] focus:bg-black/30 focus:ring-2 focus:ring-[rgba(255,176,0,0.16)] disabled:cursor-not-allowed disabled:opacity-70"
                                placeholder="email@address.com"
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <label htmlFor="phone" className="block font-sans text-sm font-semibold uppercase tracking-[0.12em] text-slate-200">Phone</label>
                            <input
                              type="tel"
                              id="phone"
                              name="phone"
                              maxLength={20}
                              value={formData.phone}
                              onChange={handleChange}
                              disabled={status === 'sending'}
                              className="w-full rounded-2xl border border-white/22 bg-black/18 px-6 py-4 font-sans text-[1.02rem] font-medium text-white outline-none transition-all placeholder:font-sans placeholder:text-[rgba(248,243,234,0.56)] focus:border-[var(--color-ryze)] focus:bg-black/30 focus:ring-2 focus:ring-[rgba(255,176,0,0.16)] disabled:cursor-not-allowed disabled:opacity-70"
                              placeholder="Mobile Number"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label htmlFor="message" className="block font-sans text-sm font-semibold uppercase tracking-[0.12em] text-slate-200">Message</label>
                                <span className={`font-sans text-xs font-medium ${formData.message.length >= 2000 ? 'text-red-500' : 'text-slate-300'}`}>
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
                              className="w-full resize-none rounded-2xl border border-white/22 bg-black/18 px-6 py-4 font-sans text-[1.02rem] font-medium text-white outline-none transition-all placeholder:font-sans placeholder:text-[rgba(248,243,234,0.56)] focus:border-[var(--color-ryze)] focus:bg-black/30 focus:ring-2 focus:ring-[rgba(255,176,0,0.16)] disabled:cursor-not-allowed disabled:opacity-70"
                              placeholder="How can we help you?"
                            ></textarea>
                          </div>

                          <button
                            type="submit"
                            disabled={status === 'sending'}
                            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-[var(--color-ryze-500)] bg-[var(--color-ryze-500)] py-5 font-sans text-lg font-semibold text-white shadow-xl transition-all hover:-translate-y-1 hover:border-[var(--color-ryze-400)] hover:bg-[var(--color-ryze-400)] focus:outline-none focus:ring-4 focus:ring-[rgba(184,132,30,0.2)] disabled:cursor-not-allowed disabled:opacity-70 disabled:transform-none"
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
            <section className="bg-[rgba(243,231,201,0.18)] py-20 md:py-28">
                <div className="mx-auto max-w-6xl px-6">
                    <div className="mb-12 max-w-3xl">
                        <div className="eyebrow">FAQs</div>
                        <h2 className="mt-5 text-4xl font-display font-bold text-[var(--primary)] md:text-5xl">Questions families often ask</h2>
                        <p className="mt-5 text-[1.02rem] leading-relaxed text-[var(--muted)]">
                            If you need more detail, we are happy to talk through year level, goals, format, and fit.
                            <button
                              type="button"
                              onClick={scrollToResults}
                              className="ml-2 font-semibold text-[var(--accent)] transition-colors hover:text-[var(--color-ryze-400)]"
                            >
                              Contact us
                            </button>.
                        </p>
                    </div>
                    <div className="space-y-4">
                        {faqData.map((faq, index) => (
                            <div key={index} className="overflow-hidden rounded-[1.8rem] border border-[var(--border)] bg-[rgba(248,243,234,0.92)] shadow-[0_18px_42px_-34px_rgba(17,21,29,0.18)]">
                                <button
                                  type="button"
                                  className="flex w-full items-start justify-between gap-6 px-7 py-6 text-left"
                                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                >
                                  <div className="flex items-start gap-4">
                                    <HelpCircle size={22} className="mt-1 shrink-0 text-[var(--accent)]" />
                                    <p className="text-[1.08rem] font-semibold leading-snug text-[var(--primary)]">{faq.question}</p>
                                  </div>
                                  {openFaq === index ? <Minus className="mt-1 shrink-0 text-[var(--accent)]" /> : <Plus className="mt-1 shrink-0 text-[var(--accent)]" />}
                                </button>
                                <AnimatePresence initial={false}>
                                    {openFaq === index && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.28, ease: 'easeInOut' }}
                                            className="overflow-hidden"
                                        >
                                            <div className="border-t border-[var(--border)] px-7 pb-7 pt-5">
                                                <div className="space-y-4 pl-9 text-[1rem] leading-relaxed text-[var(--muted)]">
                                                    {faq.answer.split('\n\n').map((paragraph, pIndex) => (
                                                        <p key={pIndex}>{paragraph.trim()}</p>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {shouldLoadDeferred && (
              <React.Suspense fallback={null}>
                <Footer />
              </React.Suspense>
            )}
        </div>
    );
};

export default MathsTutoring;

