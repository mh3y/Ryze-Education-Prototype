
import React, { useEffect } from 'react';
// @ts-ignore
import { Link } from 'react-router-dom';
import { ChevronRight, Home, BookOpen, Shield, LayoutDashboard } from 'lucide-react';

const Sitemap: React.FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const sections = [
        {
            title: "General",
            icon: Home,
            links: [
                { name: "Home", path: "/" },
                { name: "Landing Page", path: "/LandingPage" },
                { name: "The Ryze Truth", path: "/the-ryze-truth" },
                { name: "Meet Our Team", path: "/meet-the-team" },
                { name: "Methodology", path: "/how-ryze-works" },
                { name: "Ryze AI", path: "/ryze-ai" },
                { name: "Pricing", path: "/pricing" },
                { name: "Contact", path: "/contact" },
                { name: "FAQ", path: "/faq" },
            ]
        },
        {
            title: "Portals",
            icon: LayoutDashboard,
            links: [
                { name: "Dashboard Login", path: "/login" },
                { name: "Student Portal", path: "/portal" },
                { name: "Parent Portal", path: "/parent-portal" },
            ]
        },
        {
            title: "Legal",
            icon: Shield,
            links: [
                { name: "Privacy Policy", path: "/privacy" },
                { name: "Terms and Conditions", path: "/terms" },
            ]
        }
    ];

    return (
        <div className="pt-20 font-sans bg-slate-50 min-h-screen">
             {/* Header */}
            <div className="bg-white pt-12 pb-12 px-4 border-b border-slate-100">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-3xl md:text-4xl font-sans font-bold mb-3 text-slate-900 tracking-tight">Sitemap</h1>
                    <p className="text-slate-500 font-medium text-sm">Overview of available pages.</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {sections.map((section, idx) => (
                        <div key={idx} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-[#FFB000]">
                                    <section.icon size={20} />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900">{section.title}</h2>
                            </div>
                            <ul className="space-y-3">
                                {section.links.map((link, lIdx) => (
                                    <li key={lIdx}>
                                        <Link 
                                            to={link.path} 
                                            className="flex items-center gap-2 text-slate-600 hover:text-[#FFB000] transition-colors group"
                                        >
                                            <ChevronRight size={14} className="text-slate-300 group-hover:text-[#FFB000] transition-colors" />
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
