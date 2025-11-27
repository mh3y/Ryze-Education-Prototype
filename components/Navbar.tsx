
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate, Link } from 'react-router-dom';
import { Menu, X, ChevronRight, Zap, ChevronDown, ArrowRight, LogIn } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const [coursesDropdownOpen, setCoursesDropdownOpen] = useState(false);
  
  // Mobile state
  const [mobileYear3Open, setMobileYear3Open] = useState(false);
  const [mobileYear4Open, setMobileYear4Open] = useState(false);
  const [mobileYear5Open, setMobileYear5Open] = useState(false);
  const [mobileYear6Open, setMobileYear6Open] = useState(false);
  const [mobileYear11Open, setMobileYear11Open] = useState(false);
  const [mobileYear12Open, setMobileYear12Open] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const isAiPage = location.pathname === '/ryze-ai';
  const isLoginPage = location.pathname === '/login';

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    
    // Initial check
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  const aboutSubLinks = [
    { name: 'The Ryze Truth', path: '/the-ryze-truth', desc: "Our philosophy and story." },
    { name: 'Meet the Team', path: '/meet-the-team', desc: "Expert educators." },
  ];

  const primaryCourses = [
    { 
      name: 'Year 3', 
      subLinks: [
        { name: 'Mathematics', path: '/primary/year-3-maths' },
        { name: 'English', path: '/primary/year-3-english' },
      ]
    },
    { 
      name: 'Year 4', 
      subLinks: [
        { name: 'Mathematics', path: '/primary/year-4-maths' },
        { name: 'English', path: '/primary/year-4-english' },
      ]
    },
    { 
      name: 'Year 5', 
      subLinks: [
        { name: 'Mathematics', path: '/primary/year-5-maths' },
        { name: 'English', path: '/primary/year-5-english' },
      ]
    },
    { 
      name: 'Year 6', 
      subLinks: [
        { name: 'Mathematics', path: '/primary/year-6-maths' },
        { name: 'English', path: '/primary/year-6-english' },
      ]
    },
    { name: 'OC Preparation', path: '/primary/oc-preparation', highlight: true },
    { name: 'Selective Prep', path: '/primary/selective-preparation', highlight: true },
  ];

  const secondaryCourses = [
    { name: 'Year 7 Maths', path: '/secondary/year-7-maths' },
    { name: 'Year 8 Maths', path: '/secondary/year-8-maths' },
    { name: 'Year 9 Maths', path: '/secondary/year-9-maths' },
    { name: 'Year 10 Maths', path: '/secondary/year-10-maths' },
    { 
      name: 'Year 11 Maths', 
      subLinks: [
        { name: 'Advanced', path: '/secondary/year-11-maths-advanced' },
        { name: 'Extension 1', path: '/secondary/year-11-maths-ext1' },
      ]
    },
    { 
      name: 'Year 12 Maths', 
      subLinks: [
        { name: 'Advanced', path: '/secondary/year-12-maths-advanced' },
        { name: 'Extension 1', path: '/secondary/year-12-maths-ext1' },
        { name: 'Extension 2', path: '/secondary/year-12-maths-ext2' },
      ]
    },
  ];

  const navClasses = `fixed w-full z-50 transition-all duration-500 border-b ${
    scrolled || isLoginPage
      ? isAiPage || isLoginPage
        ? 'bg-[#050510]/80 backdrop-blur-xl border-white/10 py-2' 
        : 'bg-white/80 backdrop-blur-xl border-slate-200/50 py-2 shadow-sm'
      : 'bg-transparent border-transparent py-6'
  }`;

  const linkClasses = (isActive: boolean) => `
    relative text-sm font-semibold tracking-wide transition-colors duration-300
    ${isActive 
      ? 'text-ryze' 
      : isAiPage || isLoginPage ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
    }
  `;

  return (
    <nav className={navClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          {/* Logo */}
          <div className="flex-shrink-0 cursor-pointer group" onClick={() => navigate('/')}>
            <img 
              src="https://res.cloudinary.com/dsvjhemjd/image/upload/v1764105292/yellow_logo_png_bvs11z.png" 
              alt="Ryze Education" 
              className={`h-14 md:h-16 w-auto transition-all duration-500 ${isAiPage || isLoginPage ? 'brightness-0 invert' : 'group-hover:scale-105'}`}
            />
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            
            {/* About Dropdown */}
            <div 
              className="relative group"
              onMouseEnter={() => setAboutDropdownOpen(true)}
              onMouseLeave={() => setAboutDropdownOpen(false)}
            >
              <button 
                className={`flex items-center gap-1 text-sm font-semibold transition-colors duration-300 ${
                  isAiPage || isLoginPage ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                } ${['/the-ryze-truth', '/meet-the-team'].includes(location.pathname) ? 'text-ryze' : ''}`}
              >
                About <ChevronDown size={14} className={`transition-transform duration-300 ${aboutDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Dropdown Menu */}
              <div className={`absolute top-full left-1/2 -translate-x-1/2 w-64 pt-4 transition-all duration-300 origin-top ${aboutDropdownOpen ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95'}`}>
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-2 overflow-hidden">
                  {aboutSubLinks.map((link) => (
                    <NavLink
                      key={link.name}
                      to={link.path}
                      className={({ isActive }) =>
                        `block px-4 py-3 rounded-xl transition-all duration-200 group/item ${
                          isActive ? 'bg-ryze-50' : 'hover:bg-slate-50'
                        }`
                      }
                    >
                      <span className={`block text-sm font-bold ${['/the-ryze-truth', '/meet-the-team'].includes(location.pathname) && link.path === location.pathname ? 'text-ryze' : 'text-slate-800 group-hover/item:text-ryze'}`}>
                        {link.name}
                      </span>
                      <span className="block text-xs text-slate-500 font-normal mt-0.5">
                        {link.desc}
                      </span>
                    </NavLink>
                  ))}
                </div>
              </div>
            </div>

            <NavLink to="/how-it-works" className={({ isActive }) => linkClasses(isActive)}>How It Works</NavLink>
            
            <NavLink to="/ryze-ai" className={({ isActive }) => linkClasses(isActive)}>
               <span className="flex items-center gap-1.5">
                 Ryze AI 
                 <span className={`flex items-center justify-center w-5 h-5 rounded-full ${isAiPage || isLoginPage ? 'bg-white/10 text-ryze' : 'bg-ryze/10 text-ryze'}`}>
                    <Zap size={10} fill="currentColor" />
                 </span>
               </span>
            </NavLink>

            {/* Courses Dropdown */}
            <div 
              className="relative group"
              onMouseEnter={() => setCoursesDropdownOpen(true)}
              onMouseLeave={() => setCoursesDropdownOpen(false)}
            >
              <button 
                className={`flex items-center gap-1 text-sm font-semibold transition-colors duration-300 ${
                  isAiPage || isLoginPage ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                } ${location.pathname.includes('/primary') || location.pathname.includes('/secondary') ? 'text-ryze' : ''}`}
              >
                Courses <ChevronDown size={14} className={`transition-transform duration-300 ${coursesDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Mega Menu */}
              <div className={`absolute top-full left-1/2 -translate-x-1/2 w-[600px] pt-4 transition-all duration-300 origin-top z-50 ${coursesDropdownOpen ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95'}`}>
                <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 p-6 grid grid-cols-12 gap-4 relative">
                  
                  {/* Primary Column */}
                  <div className="col-span-6 border-r border-slate-100 pr-4">
                     {/* Clickable Heading */}
                     <Link to="/primary" className="flex items-center justify-between group/head mb-3 px-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest group-hover/head:text-ryze transition-colors">Primary</h4>
                        <ArrowRight size={12} className="text-slate-300 opacity-0 group-hover/head:opacity-100 group-hover/head:text-ryze transition-all -translate-x-2 group-hover/head:translate-x-0"/>
                     </Link>
                     
                     <div className="space-y-1">
                        {primaryCourses.map((link) => (
                           <div key={link.name}>
                             {link.subLinks ? (
                               <div className="group/item relative flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer">
                                  <span>{link.name}</span>
                                  <ChevronRight size={14} className="text-slate-400" />
                                  
                                  {/* Submenu Flyout */}
                                  <div className="absolute left-[95%] top-[-10px] w-48 pl-2 opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all duration-200 z-[60]">
                                     <div className="bg-white rounded-xl shadow-xl border border-slate-100 p-2 overflow-hidden">
                                       {link.subLinks.map((sub) => (
                                          <NavLink
                                             key={sub.name}
                                             to={sub.path}
                                             className={({ isActive }) =>
                                               `block px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                                                 isActive ? 'bg-ryze-50 text-ryze' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                               }`
                                             }
                                           >
                                             {sub.name}
                                          </NavLink>
                                       ))}
                                     </div>
                                  </div>
                                </div>
                             ) : (
                               <NavLink
                                  to={link.path!}
                                  className={({ isActive }) =>
                                    `block px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                                      isActive ? 'bg-ryze-50 text-ryze' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    } ${link.highlight ? 'text-ryze font-bold' : ''}`
                                  }
                                >
                                  {link.name}
                                </NavLink>
                             )}
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Secondary Column */}
                  <div className="col-span-6 pl-2 relative">
                     {/* Clickable Heading */}
                     <Link to="/secondary" className="flex items-center justify-between group/head mb-3 px-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest group-hover/head:text-ryze transition-colors">Secondary</h4>
                        <ArrowRight size={12} className="text-slate-300 opacity-0 group-hover/head:opacity-100 group-hover/head:text-ryze transition-all -translate-x-2 group-hover/head:translate-x-0"/>
                     </Link>

                     <div className="grid grid-cols-1 gap-1">
                        {secondaryCourses.map((link) => (
                           <div key={link.name}>
                             {link.subLinks ? (
                               <div className="group/item relative flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer">
                                  <span>{link.name}</span>
                                  <ChevronRight size={14} className="text-slate-400" />
                                  
                                  {/* Submenu Flyout */}
                                  <div className="absolute left-[95%] top-[-10px] w-48 pl-2 opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all duration-200 z-[60]">
                                     <div className="bg-white rounded-xl shadow-xl border border-slate-100 p-2 overflow-hidden">
                                       {link.subLinks.map((sub) => (
                                          <NavLink
                                             key={sub.name}
                                             to={sub.path}
                                             className={({ isActive }) =>
                                               `block px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                                                 isActive ? 'bg-ryze-50 text-ryze' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                               }`
                                             }
                                           >
                                             {sub.name}
                                          </NavLink>
                                       ))}
                                     </div>
                                  </div>
                                </div>
                             ) : (
                               <NavLink
                                  to={link.path!}
                                  className={({ isActive }) =>
                                    `block px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                                      isActive ? 'bg-ryze-50 text-ryze' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`
                                  }
                                >
                                  {link.name}
                                </NavLink>
                             )}
                           </div>
                        ))}
                     </div>
                  </div>
                </div>
              </div>
            </div>

            <NavLink to="/pricing" className={({ isActive }) => linkClasses(isActive)}>Pricing</NavLink>

            {/* Separator */}
            <div className={`h-6 w-px mx-2 ${isAiPage || isLoginPage ? 'bg-white/20' : 'bg-slate-200'}`}></div>

            {/* Login Button */}
            <button
              onClick={() => navigate('/login')}
              className={`text-sm font-bold transition-all duration-300 px-5 py-2.5 rounded-full border flex items-center gap-2 ${
                isAiPage || isLoginPage
                ? 'text-white border-white/30 hover:bg-white hover:text-[#050510]'
                : 'text-slate-700 border-slate-200 hover:border-slate-900 hover:text-slate-900'
              }`}
            >
              <LogIn size={16} /> Login
            </button>

            {/* CTA Button */}
            <button
              onClick={() => navigate('/contact')}
              className={`ml-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 active:translate-y-0 ${
                isAiPage || isLoginPage
                ? 'bg-[#FFB000] text-[#050510] hover:bg-white shadow-[0_0_20px_rgba(255,176,0,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.4)]' 
                : 'bg-slate-900 text-white hover:bg-ryze hover:text-white shadow-lg hover:shadow-ryze/40'
              }`}
            >
              Book a Trial
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 rounded-full transition-colors ${isAiPage || isLoginPage ? 'text-white hover:bg-white/10' : 'text-slate-900 hover:bg-slate-100'}`}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-100 shadow-2xl transition-all duration-300 origin-top ${isOpen ? 'opacity-100 visible scale-y-100' : 'opacity-0 invisible scale-y-90'}`}>
        <div className="px-6 py-8 space-y-6 h-[calc(100vh-80px)] overflow-y-auto">
          
          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">Company</div>
            {aboutSubLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                    isActive ? 'bg-ryze-50 text-ryze' : 'text-slate-600 hover:bg-slate-50'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
             <NavLink to="/how-it-works" onClick={() => setIsOpen(false)} className={({ isActive }) => `block px-4 py-3 rounded-xl text-base font-medium transition-colors ${isActive ? 'bg-ryze-50 text-ryze' : 'text-slate-600 hover:bg-slate-50'}`}>How It Works</NavLink>
             
             {/* Mobile Primary Section */}
             <div className="flex items-center justify-between mt-4 mb-2 px-2" onClick={() => { navigate('/primary'); setIsOpen(false); }}>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Primary Courses</div>
                <ArrowRight size={14} className="text-ryze"/>
             </div>
             {primaryCourses.map((link) => (
                <div key={link.name}>
                  {link.subLinks ? (
                    <div>
                       <button 
                          onClick={() => {
                             if(link.name === "Year 3") setMobileYear3Open(!mobileYear3Open);
                             if(link.name === "Year 4") setMobileYear4Open(!mobileYear4Open);
                             if(link.name === "Year 5") setMobileYear5Open(!mobileYear5Open);
                             if(link.name === "Year 6") setMobileYear6Open(!mobileYear6Open);
                          }}
                          className="w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
                       >
                          {link.name}
                          <ChevronDown size={14} className={`transition-transform ${
                              (link.name === "Year 3" && mobileYear3Open) || 
                              (link.name === "Year 4" && mobileYear4Open) ||
                              (link.name === "Year 5" && mobileYear5Open) ||
                              (link.name === "Year 6" && mobileYear6Open)
                              ? 'rotate-180' : ''}`} 
                          />
                       </button>
                       <div className={`pl-4 space-y-1 overflow-hidden transition-all duration-300 ${
                          (link.name === "Year 3" && mobileYear3Open) || 
                          (link.name === "Year 4" && mobileYear4Open) ||
                          (link.name === "Year 5" && mobileYear5Open) ||
                          (link.name === "Year 6" && mobileYear6Open)
                          ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                          {link.subLinks.map(sub => (
                             <NavLink
                                key={sub.name}
                                to={sub.path}
                                onClick={() => setIsOpen(false)}
                                className={({ isActive }) => `block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'text-ryze' : 'text-slate-500'}`}
                             >
                                {sub.name}
                             </NavLink>
                          ))}
                       </div>
                    </div>
                  ) : (
                    <NavLink
                      to={link.path!}
                      onClick={() => setIsOpen(false)}
                      className={({ isActive }) => `block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-ryze-50 text-ryze' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      {link.name}
                    </NavLink>
                  )}
                </div>
             ))}

             {/* Mobile Secondary Section */}
             <div className="flex items-center justify-between mt-4 mb-2 px-2" onClick={() => { navigate('/secondary'); setIsOpen(false); }}>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Secondary Courses</div>
                <ArrowRight size={14} className="text-ryze"/>
             </div>
             {secondaryCourses.map((link) => (
                <div key={link.name}>
                  {link.subLinks ? (
                    <div>
                       <button 
                          onClick={() => {
                             if(link.name.includes("11")) setMobileYear11Open(!mobileYear11Open);
                             if(link.name.includes("12")) setMobileYear12Open(!mobileYear12Open);
                          }}
                          className="w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
                       >
                          {link.name}
                          <ChevronDown size={14} className={`transition-transform ${(link.name.includes("11") ? mobileYear11Open : mobileYear12Open) ? 'rotate-180' : ''}`} />
                       </button>
                       <div className={`pl-4 space-y-1 overflow-hidden transition-all duration-300 ${(link.name.includes("11") ? mobileYear11Open : mobileYear12Open) ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                          {link.subLinks.map(sub => (
                             <NavLink
                                key={sub.name}
                                to={sub.path}
                                onClick={() => setIsOpen(false)}
                                className={({ isActive }) => `block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'text-ryze' : 'text-slate-500'}`}
                             >
                                {sub.name}
                             </NavLink>
                          ))}
                       </div>
                    </div>
                  ) : (
                    <NavLink
                      to={link.path!}
                      onClick={() => setIsOpen(false)}
                      className={({ isActive }) => `block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-ryze-50 text-ryze' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      {link.name}
                    </NavLink>
                  )}
                </div>
             ))}

             <NavLink to="/pricing" onClick={() => setIsOpen(false)} className={({ isActive }) => `block px-4 py-3 rounded-xl text-base font-medium transition-colors mt-4 ${isActive ? 'bg-ryze-50 text-ryze' : 'text-slate-600 hover:bg-slate-50'}`}>Pricing</NavLink>
          </div>

          <div className="pt-6 border-t border-slate-100">
             <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">Portals</div>
             <NavLink to="/login" onClick={() => setIsOpen(false)} className={({ isActive }) => `block px-4 py-3 rounded-xl text-base font-bold transition-colors ${isActive ? 'bg-ryze-50 text-ryze' : 'text-slate-900 hover:bg-slate-50'}`}>
               Login to Portal
             </NavLink>
          </div>

          <div className="pt-6 border-t border-slate-100">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">Technology</div>
            <NavLink 
              to="/ryze-ai" 
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => `flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium transition-colors ${isActive ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}
            >
               <span className="flex items-center gap-2">Ryze AI <Zap size={16} className="text-ryze" fill="currentColor"/></span>
               <ChevronRight size={16} />
            </NavLink>
          </div>

          <div className="pt-4">
            <button
              onClick={() => {
                navigate('/contact');
                setIsOpen(false);
              }}
              className="w-full bg-ryze text-white font-bold text-lg py-4 rounded-2xl shadow-lg hover:bg-ryze-600 active:scale-95 transition-all"
            >
              Book a Trial Lesson
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
