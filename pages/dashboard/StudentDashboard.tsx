/**
 * StudentDashboard — shown at /dashboard/overview for students.
 *
 * Shows: upcoming lessons, recent attendance, available resources, and a
 * shortcut to the Ryze AI Arena.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Brain, CalendarDays, FolderOpen, ExternalLink,
  BookOpen, ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { adminApi, Resource, LessonListItem } from '../../services/adminApi';
import { LoadingState } from '../../components/dashboard/ui';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' });
  } catch { return iso; }
}

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

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [lessons, setLessons]     = useState<LessonListItem[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading]       = useState(true);

  const firstName = user?.name?.split(' ')[0] ?? 'there';

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch upcoming lessons (next 7 days), recent attendance, and resources
        const [lessonsData, resourcesData] = await Promise.all([
          adminApi.getLessons({ upcoming_only: true, limit: 5 }).catch(() => ({ items: [] as LessonListItem[] })),
          adminApi.getResources({ limit: 6 }).catch(() => ({ items: [] as Resource[] })),
        ]);
        setLessons(lessonsData.items);
        setResources(resourcesData.items);
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
            <BookOpen size={12} /> Student Portal
          </div>
          <h2 className="text-2xl md:text-4xl font-bold mb-3">
            Welcome back, {firstName}.
          </h2>
          <p className="ryze-text-muted mb-6 max-w-xl text-base leading-relaxed">
            Your AI tutor is ready whenever you are. Check your upcoming lessons below, then jump into the AI Arena to practise.
          </p>
          <button
            onClick={() => navigate('/dashboard/ryze-ai')}
            className="flex items-center gap-2 px-6 py-3 bg-[#FFB000] text-[#050510] font-bold rounded-xl hover:bg-[#ffc133] transition-all shadow-[0_0_20px_rgba(255,176,0,0.2)]"
          >
            <Brain size={16} /> Launch AI Arena <ArrowRight size={14} />
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Lessons */}
        <div className="bg-[#0a0f1e] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <CalendarDays size={18} className="text-[#FFB000]" />
            <h3 className="font-bold ryze-text-inverse">Upcoming Lessons</h3>
          </div>

          {lessons.length === 0 ? (
            <div className="text-center py-8">
              <CalendarDays size={32} className="ryze-text-muted mx-auto mb-2 opacity-40" />
              <p className="text-sm ryze-text-muted">No upcoming lessons scheduled.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lessons.map((l) => (
                <div key={l.id} className="flex items-start gap-3 p-3 bg-white/3 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-[#FFB000]/10 border border-[#FFB000]/20 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[#FFB000] font-bold text-xs leading-none">
                      {new Date(l.start_time).getDate()}
                    </span>
                    <span className="text-[#FFB000]/70 text-[9px] uppercase">
                      {new Date(l.start_time).toLocaleDateString('en-AU', { month: 'short' })}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold ryze-text-inverse text-sm truncate">{l.title ?? l.class_group_name}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${STATUS_COLORS[l.status] ?? 'bg-slate-500/15 text-slate-400'}`}>
                        {l.status}
                      </span>
                    </div>
                    <div className="text-xs ryze-text-muted mt-0.5">
                      {fmtDate(l.start_time)} · {fmtTime(l.start_time)}
                    </div>
                  </div>
                  {l.meet_link && (
                    <a
                      href={l.meet_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs font-semibold text-[#FFB000] hover:text-[#ffc133] transition-colors shrink-0"
                    >
                      Join <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resources */}
        <div className="bg-[#0a0f1e] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <FolderOpen size={18} className="text-[#FFB000]" />
              <h3 className="font-bold ryze-text-inverse">Learning Resources</h3>
            </div>
            <button
              onClick={() => navigate('/dashboard/admin/resources')}
              className="text-xs ryze-text-muted hover:ryze-text-inverse transition-colors flex items-center gap-1"
            >
              View all <ArrowRight size={12} />
            </button>
          </div>

          {resources.length === 0 ? (
            <div className="text-center py-8">
              <FolderOpen size={32} className="ryze-text-muted mx-auto mb-2 opacity-40" />
              <p className="text-sm ryze-text-muted">No resources available yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {resources.map((r) => (
                <a
                  key={r.id}
                  href={r.resource_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-white/3 rounded-xl border border-white/5 hover:border-[#FFB000]/30 hover:bg-[#FFB000]/5 transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <FolderOpen size={14} className="text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium ryze-text-inverse text-sm truncate">{r.title}</div>
                    {r.description && (
                      <div className="text-xs ryze-text-muted truncate">{r.description}</div>
                    )}
                  </div>
                  <ExternalLink size={12} className="ryze-text-muted group-hover:text-[#FFB000] transition-colors shrink-0" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'AI Arena', desc: 'Practise with Ryze AI', icon: Brain, color: 'text-[#FFB000]', bg: 'bg-[#FFB000]/10 border-[#FFB000]/20', path: '/dashboard/ryze-ai' },
          { label: 'Courses', desc: 'View your courses', icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', path: '/dashboard/courses' },
          { label: 'Resources', desc: 'Study materials', icon: FolderOpen, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', path: '/dashboard/admin/resources' },
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

export default StudentDashboard;
