
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
                { name: "The Ryze Truth", path: "/the-ryze-truth" },
                { name: "Meet the Team", path: "/meet-the-team" },
                { name: "Methodology", path: "/how-it-works" },
                { name: "Ryze AI", path: "/ryze-ai" },
                { name: "Pricing", path: "/pricing" },
                { name: "Contact", path: "/contact" },
                { name: "FAQ", path: "/faq" },
            ]
        },
        {
            title: "Primary Courses",
            icon: BookOpen,
            links: [
                { name: "Primary Overview", path: "/primary" },
                { name: "Year 3 Mathematics", path: "/primary/year-3-maths" },
                { name: "Year 3 English", path: "/primary/year-3-english" },
                { name: "Year 4 Mathematics", path: "/primary/year-4-maths" },
                { name: "Year 4 English", path: "/primary/year-4-english" },
                { name: "Year 5 Mathematics", path: "/primary/year-5-maths" },
                { name: "Year 5 English", path: "/primary/year-5-english" },
                { name: "Year 6 Mathematics", path: "/primary/year-6-maths" },
                { name: "Year 6 English", path: "/primary/year-6-english" },
                { name: "OC Exam Preparation", path: "/primary/oc-preparation" },
                { name: "Selective Exam Preparation", path: "/primary/selective-preparation" },
            ]
        },
        {
            title: "Secondary Courses",
            icon: BookOpen,
            links: [
                { name: "Secondary Overview", path: "/secondary" },
                { name: "Year 7 Maths", path: "/secondary/year-7-maths" },
                { name: "Year 8 Maths", path: "/secondary/year-8-maths" },
                { name: "Year 9 Maths", path: "/secondary/year-9-maths" },
                { name: "Year 10 Maths", path: "/secondary/year-10-maths" },
                { name: "Year 11 Maths Advanced", path: "/secondary/year-11-maths-advanced" },
                { name: "Year 11 Maths Ext 1", path: "/secondary/year-11-maths-ext1" },
                { name: "Year 12 Maths Advanced", path: "/secondary/year-12-maths-advanced" },
                { name: "Year 12 Maths Ext 1", path: "/secondary/year-12-maths-ext1" },
                { name: "Year 12 Maths Ext 2", path: "/secondary/year-12-maths-ext2" },
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
