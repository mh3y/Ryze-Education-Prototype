import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home, Shield } from 'lucide-react';
import { ROUTES } from '../src/constants/routes';

const Sitemap: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      title: 'General',
      icon: Home,
      links: [
        { name: 'Home', path: ROUTES.HOME },
        { name: 'HSC | Year 11 and 12', path: ROUTES.HSC_MATHS_PROGRAM },
        { name: 'Accelerated Pathways', path: ROUTES.ACCELERATED_MATHS_PROGRAM },
        { name: 'Junior Foundations | Year 7 -10', path: ROUTES.JUNIOR_FOUNDATIONS_PROGRAM },
        { name: 'OC & Selective Exam Preparation', path: ROUTES.SELECTIVE_OC_PROGRAM },
        { name: 'Primary | Year 3 - 6', path: ROUTES.PRIMARY_MATHS_PROGRAM },
        { name: 'Maths Tutoring', path: ROUTES.MATHS_TUTORING },
        { name: 'How It Works', path: ROUTES.HOW_IT_WORKS },
        { name: 'Ryze AI', path: ROUTES.RYZE_AI },
        { name: 'Contact', path: ROUTES.CONTACT },
      ],
    },
    {
      title: 'Legal',
      icon: Shield,
      links: [
        { name: 'Privacy Policy', path: ROUTES.PRIVACY },
        { name: 'Terms and Conditions', path: ROUTES.TERMS },
      ],
    },
  ];

  return (
    <div className="ryze-page">
      <div className="ryze-page-hero border-b ryze-border-subtle px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="ryze-page-title text-3xl md:text-5xl">Sitemap</h1>
          <p className="ryze-page-lead mt-3 text-base">Overview of available pages.</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {sections.map((section, idx) => (
            <div key={idx} className="ryze-page-card p-8">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[rgba(184,132,30,0.16)] bg-[rgba(243,231,201,0.5)] text-[var(--accent)]">
                  <section.icon size={20} />
                </div>
                <h2 className="text-xl font-bold ryze-text-primary">{section.title}</h2>
              </div>

              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      to={link.path}
                      className="group flex items-center gap-2 ryze-text-secondary transition-colors hover:text-[var(--accent)]"
                    >
                      <ChevronRight
                        size={14}
                        className="text-[rgba(23,29,40,0.28)] transition-colors group-hover:text-[var(--accent)]"
                      />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sitemap;
