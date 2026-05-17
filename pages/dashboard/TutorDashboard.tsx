/**
 * TutorDashboard — shown at /dashboard/overview for tutors.
 *
 * Shows: today's classes, pending attendance marks, recent progress
 * reports, and quick-access admin links.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CalendarDays, ClipboardList, ClipboardCheck,
  Users, ExternalLink, ArrowRight, FolderOpen,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { adminApi, ClassGroupListItem, LessonListItem } from '../../services/adminApi';
import { LoadingState } from '../../components/dashboard/ui';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmtTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });
  } catch { return iso; }
}

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-500/15 text-blue-400',
  active:    'bg-emerald-500/15 text-emerald-400',
  completed: 'bg-slate-500/15 text-slate-400',
  cancelled: 'bg-red-500/15 text-red-400',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const TutorDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [classes, setClasses]   = useState<ClassGroupListItem[]>([]);
  const [lessons, setLessons]   = useState<LessonListItem[]>([]);
  const [loading, setLoading]   = useState(true);

  const firstName = user?.name?.split(' ')[0] ?? 'there';

  useEffect(() => {
    const load = async () => {
      try {
        const [classData, lessonData] = await Promise.all([
          adminApi.getClasses({ active: true, limit: 50 }).catch(() => ({ items: [] as ClassGroupListItem[] })),
          adminApi.getLessons({ upcoming_only: true, limit: 10 }).catch(() => ({ items: [] as LessonListItem[] })),
        ]);
        setClasses(classData.items);
        setLessons(lessonData.items);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#0a0f1e] to-[#111827] rounded-[2rem] p-6 md:p-10 ryze-text-inverse relative overflow-hidden border border-white/5 shadow-2xl group"
      >
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FFB000] rounded-full blur-[150px] opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity duration-700" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#FFB000]/10 border border-[#FFB000]/20 text-[#FFB000] text-xs font-bold px-3 py-1 rounded-full mb-4">
            <ClipboardList size={12} /> Tutor Portal
          </div>
          <h2 className="text-2xl md:text-4xl font-bold mb-3">
            Welcome back, {firstName}.
          </h2>
          <p className="ryze-text-muted mb-6 max-w-xl text-base leading-relaxed">
            You have <strong className="ryze-text-inverse">{classes.length}</strong> active {classes.length === 1 ? 'class' : 'classes'}.
            {lessons.length > 0
              ? ` Your next lesson is coming up soon — mark attendance after each session.`
              : ` No upcoming lessons scheduled right now.`}
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/dashboard/admin/attendance')}
              className="flex items-center gap-2 px-6 py-3 bg-[#FFB000] text-[#050510] font-bold rounded-xl hover:bg-[#ffc133] transition-all"
            >
              <ClipboardList size={16} /> Mark Attendance
            </button>
            <button
              onClick={() => navigate('/dashboard/admin/progress-reports')}
              className="flex items-center gap-2 px-6 py-3 bg-white/10 text-slate-200 font-bold rounded-xl hover:bg-white/20 transition-all border border-white/10"
            >
              <ClipboardCheck size={16} /> Progress Reports
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Classes */}
        <div className="bg-[#0a0f1e] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-[#FFB000]" />
              <h3 className="font-bold ryze-text-inverse">My Classes</h3>
            </div>
            <button
              onClick={() => navigate('/dashboard/admin/classes')}
              className="text-xs ryze-text-muted hover:ryze-text-inverse transition-colors flex items-center gap-1"
            >
              View all <ArrowRight size={12} />
            </button>
          </div>

          {classes.length === 0 ? (
            <div className="text-center py-8">
              <Users size={32} className="ryze-text-muted mx-auto mb-2 opacity-40" />
              <p className="text-sm ryze-text-muted">No classes assigned yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {classes.slice(0, 6).map((c) => (
                <button
                  key={c.id}
                  onClick={() => navigate(`/dashboard/admin/classes/${c.id}`)}
                  className="w-full flex items-center gap-3 p-3 bg-white/3 rounded-xl border border-white/5 hover:border-white/10 transition-all text-left group"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#FFB000]/10 border border-[#FFB000]/20 flex items-center justify-center shrink-0">
                    <Users size={14} className="text-[#FFB000]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium ryze-text-inverse text-sm truncate">{c.name}</div>
                    {c.subject && (
                      <div className="text-xs ryze-text-muted">{c.subject}</div>
                    )}
                  </div>
                  <ArrowRight size={12} className="ryze-text-muted group-hover:ryze-text-inverse transition-colors shrink-0" />
                </button>
              ))}
              {classes.length > 6 && (
                <p className="text-xs ryze-text-muted text-center pt-1">+{classes.length - 6} more</p>
              )}
            </div>
          )}
        </div>

        {/* Upcoming Lessons */}
        <div className="bg-[#0a0f1e] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <CalendarDays size={18} className="text-[#FFB000]" />
              <h3 className="font-bold ryze-text-inverse">Upcoming Lessons</h3>
            </div>
            <button
              onClick={() => navigate('/dashboard/admin/lessons')}
              className="text-xs ryze-text-muted hover:ryze-text-inverse transition-colors flex items-center gap-1"
            >
              View all <ArrowRight size={12} />
            </button>
          </div>

          {lessons.length === 0 ? (
            <div className="text-center py-8">
              <CalendarDays size={32} className="ryze-text-muted mx-auto mb-2 opacity-40" />
              <p className="text-sm ryze-text-muted">No upcoming lessons.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lessons.map((l) => (
                <div key={l.id} className="flex items-start gap-3 p-3 bg-white/3 rounded-xl border border-white/5">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex flex-col items-center justify-center shrink-0">
                    <span className="text-blue-400 font-bold text-xs leading-none">
                      {new Date(l.start_time).getDate()}
                    </span>
                    <span className="text-blue-400/70 text-[9px] uppercase">
                      {new Date(l.start_time).toLocaleDateString('en-AU', { month: 'short' })}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium ryze-text-inverse text-sm truncate">{l.class_group_name ?? l.title}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${STATUS_COLORS[l.status] ?? 'bg-slate-500/15 text-slate-400'}`}>
                        {l.status}
                      </span>
                    </div>
                    <div className="text-xs ryze-text-muted mt-0.5">{fmtTime(l.start_time)}</div>
                  </div>
                  {l.meet_link && (
                    <a href={l.meet_link} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs font-semibold text-[#FFB000] hover:text-[#ffc133] transition-colors shrink-0">
                      Join <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick action cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Attendance',       desc: 'Mark & review',        icon: ClipboardList,  color: 'text-[#FFB000]',  bg: 'bg-[#FFB000]/10 border-[#FFB000]/20',   path: '/dashboard/admin/attendance' },
          { label: 'Progress Reports', desc: 'Submit feedback',       icon: ClipboardCheck, color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20',     path: '/dashboard/admin/progress-reports' },
          { label: 'Resources',        desc: 'Share materials',       icon: FolderOpen,     color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', path: '/dashboard/admin/resources' },
          { label: 'Students',         desc: 'View student profiles', icon: Users,          color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', path: '/dashboard/admin/students' },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className="bg-[#0a0f1e] border border-white/10 rounded-2xl p-5 text-left hover:border-white/20 transition-all group"
          >
            <div className={`w-10 h-10 rounded-xl ${item.bg} border flex items-center justify-center mb-3`}>
              <item.icon size={18} className={item.color} />
            </div>
            <div className="font-semibold ryze-text-inverse text-sm">{item.label}</div>
            <div className="text-xs ryze-text-muted mt-0.5">{item.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TutorDashboard;
