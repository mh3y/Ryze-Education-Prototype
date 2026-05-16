/**
 * OverviewPage — the landing page shown at /dashboard/overview.
 *
 * Shows a welcome banner, quick actions, and the user's courses.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';
import { BackendService, Course, Assignment } from '../../services/backend';
import { CoursesList } from '../../components/dashboard/LmsViews';
import { useAuth } from '../../contexts/AuthContext';

const OverviewPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    BackendService.getCourses().then(setCourses);
  }, []);

  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <div className="space-y-10">
      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#0a0f1e] to-[#111827] rounded-[2rem] p-6 md:p-10 ryze-text-inverse relative overflow-hidden border border-white/5 shadow-2xl group"
      >
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FFB000] rounded-full blur-[150px] opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity duration-700" />
        <div className="relative z-10">
          <h2 className="text-2xl md:text-4xl font-bold mb-4">
            Welcome Back, {firstName}.
          </h2>
          <p className="ryze-text-muted mb-8 max-w-xl text-base md:text-lg leading-relaxed">
            {user?.role === 'student'
              ? 'Ryze AI has analysed your last assignment. Focus on Quadratic Equations this week.'
              : user?.role === 'admin'
              ? 'Manage your classes, students, and bot operations from the admin portal below.'
              : 'You have 4 assignments pending review.'}
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/dashboard/ryze-ai')}
              className="px-8 py-3.5 bg-[#FFB000] text-[#050510] font-bold rounded-xl hover:bg-[#ffc133] transition-all shadow-[0_0_20px_rgba(255,176,0,0.2)] hover:shadow-[0_0_30px_rgba(255,176,0,0.4)]"
            >
              Launch AI Arena
            </button>
            {user?.role === 'admin' && (
              <button
                onClick={() => navigate('/dashboard/bot-health')}
                className="px-8 py-3.5 bg-white/10 text-slate-200 font-bold rounded-xl hover:bg-white/20 transition-all border border-white/10"
              >
                Bot Status
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Courses */}
      <div>
        <h3 className="font-bold text-2xl ryze-text-inverse mb-6">Your Courses</h3>
        <CoursesList courses={courses} />
      </div>
    </div>
  );
};

export default OverviewPage;
