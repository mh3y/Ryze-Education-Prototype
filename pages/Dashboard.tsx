
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layers, Search, Bell, Settings } from 'lucide-react';

// Subsystems
import { BackendService, UserRole, Course, Assignment } from '../services/backend';
import { Sidebar, ModuleType } from '../components/dashboard/Sidebar';
import { AiArena } from '../components/dashboard/AiArena';
import { IngestionStudio } from '../components/dashboard/IngestionStudio';
import { CoursesList, AssignmentsList } from '../components/dashboard/LmsViews';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ModuleType>('overview');
  const [userRole, setUserRole] = useState<UserRole>('student'); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Data State
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  // Fetch Mock Data on load
  useEffect(() => {
    BackendService.getCourses().then(setCourses);
    BackendService.getAssignments().then(setAssignments);
  }, [userRole]);

  return (
    <div 
      className="flex h-screen bg-transparent font-sans overflow-hidden text-slate-200 relative selection:bg-[#FFB000] selection:text-black"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Application UI Layer */}
      <div className="relative z-10 flex h-full w-full">
        <Sidebar 
          isOpen={isSidebarOpen}
          activeTab={activeTab}
          userRole={userRole}
          onTabChange={setActiveTab}
          onRoleChange={setUserRole}
          onLogout={() => navigate('/')}
          onCloseMobile={() => setIsSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden relative min-w-0">
          
          {/* Header */}
          <header className="h-16 md:h-20 bg-[#050510]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 md:px-8 flex-shrink-0 z-10">
             <div className="flex items-center gap-4">
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-400 hover:text-white transition-colors">
                  <Layers size={20} />
                </button>
                <h1 className="text-lg md:text-xl font-bold text-white capitalize tracking-wide truncate">
                  {activeTab.replace('-', ' ')}
                </h1>
             </div>
             
             <div className="flex items-center gap-4 md:gap-6">
                <div className="relative hidden md:block group">
                   <input 
                     type="text" 
                     placeholder="Search..." 
                     className="pl-10 pr-4 py-2.5 rounded-full bg-white/5 border border-white/5 text-sm focus:border-[#FFB000]/50 focus:ring-1 focus:ring-[#FFB000]/50 outline-none w-64 transition-all text-white placeholder-slate-500"
                   />
                   <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-slate-300 transition-colors" />
                </div>
                <button className="relative text-slate-400 hover:text-white transition-colors">
                   <Bell size={20} />
                   <span className="absolute top-0 right-0 w-2 h-2 bg-[#FFB000] rounded-full border-2 border-[#050510]"></span>
                </button>
             </div>
          </header>

          {/* 3. Subsystem Views */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 relative bg-transparent scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent scroll-smooth">
             {/* Subtle Grid Effect */}
             <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.03] pointer-events-none"></div>

             <div className="relative z-10 h-full max-w-[1600px] mx-auto pb-20 md:pb-0">
                {/* LMS OVERVIEW */}
                {activeTab === 'overview' && (
                  <div className="space-y-10">
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-r from-[#0a0f1e] to-[#111827] rounded-[2rem] p-6 md:p-10 text-white relative overflow-hidden border border-white/5 shadow-2xl group"
                      >
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FFB000] rounded-full blur-[150px] opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity duration-700"></div>
                        <div className="relative z-10">
                            <h2 className="text-2xl md:text-4xl font-bold mb-4">Welcome Back, Alex.</h2>
                            <p className="text-slate-400 mb-8 max-w-xl text-base md:text-lg leading-relaxed">
                              {userRole === 'student' ? "Ryze AI has analysed your last assignment. Focus on Quadratic Equations this week." : "You have 4 assignments pending review."}
                            </p>
                            <button onClick={() => setActiveTab('ryze-ai')} className="px-8 py-3.5 bg-[#FFB000] text-[#050510] font-bold rounded-xl hover:bg-[#ffc133] transition-all shadow-[0_0_20px_rgba(255,176,0,0.2)] hover:shadow-[0_0_30px_rgba(255,176,0,0.4)]">
                              Launch AI Arena
                            </button>
                        </div>
                      </motion.div>
                      
                      <div>
                        <h3 className="font-bold text-2xl text-white mb-6">Your Courses</h3>
                        <CoursesList courses={courses} />
                      </div>
                  </div>
                )}

                {/* LMS COURSES */}
                {activeTab === 'courses' && (
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-8">Active Enrolments</h2>
                      <CoursesList courses={courses} />
                    </div>
                )}

                {/* LMS ASSIGNMENTS */}
                {activeTab === 'assignments' && (
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-8">Assignments</h2>
                      <AssignmentsList assignments={assignments} />
                    </div>
                )}

                {/* RYZE AI ENGINE */}
                {activeTab === 'ryze-ai' && <AiArena />}

                {/* CONTENT INGESTION */}
                {activeTab === 'upload' && <IngestionStudio />}

                {/* PLACEHOLDERS */}
                {['analytics', 'users', 'settings'].includes(activeTab) && (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-slate-500 mb-6 border border-white/5">
                          <Settings size={40} />
                      </div>
                      <h2 className="text-3xl font-bold text-white mb-3">Module Under Construction</h2>
                      <p className="text-slate-400 max-w-md mb-8 leading-relaxed">
                          The <strong>{activeTab}</strong> module is defined in the architecture but not yet implemented in this preview.
                      </p>
                      <button onClick={() => setActiveTab('overview')} className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all border border-white/5">
                          Return to Dashboard
                      </button>
                    </div>
                )}
             </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
