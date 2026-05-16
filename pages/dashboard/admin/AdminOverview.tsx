/**
 * AdminOverview — the landing page for /dashboard/admin.
 *
 * Shows:
 *   • 6 stat cards (students, classes, today's lessons, open alerts,
 *     pending payments, missing reports)
 *   • Today's lessons timeline
 *   • Recent open alerts with severity
 *   • Quick action buttons
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, BookOpen, CalendarDays, ShieldAlert,
  CreditCard, ClipboardCheck, RefreshCw, ChevronRight,
  Clock, CheckCircle2, AlertTriangle,
} from 'lucide-react';
import { adminApi, AdminOverviewStats } from '../../../services/adminApi';
import { StatCard, StatusBadge, ErrorState, LoadingState } from '../../../components/dashboard/ui';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('en-AU', {
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
  } catch { return iso; }
}

function severityIcon(severity: string) {
  switch (severity) {
    case 'critical': return <AlertTriangle size={14} className="text-red-400" />;
    case 'high':     return <AlertTriangle size={14} className="text-orange-400" />;
    case 'medium':   return <AlertTriangle size={14} className="text-amber-400" />;
    default:         return <AlertTriangle size={14} className="text-blue-400" />;
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const AdminOverview: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats]     = useState<AdminOverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getOverviewStats();
      setStats(data);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load overview data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingState />;
  if (error)   return <ErrorState message={error} onRetry={load} />;
  if (!stats)  return null;

  const statCards = [
    { label: 'Active Students',    value: stats.total_students,   icon: Users,          accentClass: 'text-[#FFB000]', path: '/dashboard/admin/students' },
    { label: 'Active Classes',     value: stats.active_classes,   icon: BookOpen,        accentClass: 'text-blue-400',  path: '/dashboard/admin/classes' },
    { label: "Today's Lessons",    value: stats.today_lessons,    icon: CalendarDays,    accentClass: 'text-emerald-400', path: '/dashboard/admin/lessons' },
    { label: 'Open Alerts',        value: stats.open_alerts,      icon: ShieldAlert,     accentClass: stats.open_alerts > 0 ? 'text-red-400' : 'text-slate-400', path: '/dashboard/admin/alerts' },
    { label: 'Pending Payments',   value: stats.pending_payments, icon: CreditCard,      accentClass: stats.pending_payments > 0 ? 'text-amber-400' : 'text-slate-400', path: '/dashboard/admin/payments' },
    { label: 'Missing Reports',    value: stats.missing_reports,  icon: ClipboardCheck,  accentClass: stats.missing_reports > 0 ? 'text-orange-400' : 'text-slate-400', path: '/dashboard/admin/progress-reports' },
  ];

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold ryze-text-inverse">Admin Overview</h2>
          <p className="text-sm ryze-text-muted mt-1">
            {new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 text-xs ryze-text-muted hover:ryze-text-inverse font-medium px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
        >
          <RefreshCw size={13} />
          Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((s) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={s.value}
            icon={s.icon}
            accentClass={s.accentClass}
            onClick={() => navigate(s.path)}
          />
        ))}
      </div>

      {/* Two-column panel row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Today's lessons */}
        <div className="bg-[#0a0f1e] border border-white/5 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <h3 className="font-bold ryze-text-inverse text-sm">Today's Lessons</h3>
            <button
              onClick={() => navigate('/dashboard/admin/lessons')}
              className="text-xs ryze-text-muted hover:ryze-text-inverse flex items-center gap-1 transition-colors"
            >
              View all <ChevronRight size={12} />
            </button>
          </div>

          {stats.today_lesson_list.length === 0 ? (
            <div className="py-10 text-center text-sm ryze-text-muted">
              No lessons scheduled for today.
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {stats.today_lesson_list.map((lesson) => (
                <div
                  key={lesson.id}
                  onClick={() => navigate('/dashboard/admin/lessons')}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] cursor-pointer transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                    {lesson.status === 'completed'
                      ? <CheckCircle2 size={16} className="text-emerald-400" />
                      : lesson.status === 'active'
                      ? <Clock size={16} className="text-[#FFB000] animate-pulse" />
                      : <CalendarDays size={16} className="text-blue-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold ryze-text-inverse truncate">{lesson.title}</div>
                    <div className="text-xs ryze-text-muted">{lesson.class_name}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-medium ryze-text-inverse">{formatTime(lesson.start_time)}</div>
                    <StatusBadge value={lesson.status} className="mt-0.5" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent alerts */}
        <div className="bg-[#0a0f1e] border border-white/5 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <h3 className="font-bold ryze-text-inverse text-sm flex items-center gap-2">
              Open Alerts
              {stats.open_alerts > 0 && (
                <span className="text-[10px] font-bold bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
                  {stats.open_alerts}
                </span>
              )}
            </h3>
            <button
              onClick={() => navigate('/dashboard/admin/alerts')}
              className="text-xs ryze-text-muted hover:ryze-text-inverse flex items-center gap-1 transition-colors"
            >
              Manage <ChevronRight size={12} />
            </button>
          </div>

          {stats.recent_alerts.length === 0 ? (
            <div className="py-10 text-center text-sm ryze-text-muted">
              No open alerts. All clear!
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {stats.recent_alerts.map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => navigate('/dashboard/admin/alerts')}
                  className="flex items-start gap-3 px-5 py-3.5 hover:bg-white/[0.02] cursor-pointer transition-colors"
                >
                  <div className="mt-0.5 shrink-0">{severityIcon(alert.severity)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold ryze-text-inverse truncate">{alert.title}</div>
                    <div className="text-xs ryze-text-muted truncate mt-0.5">{alert.message}</div>
                  </div>
                  <StatusBadge value={alert.severity} className="shrink-0 mt-0.5" />
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Quick actions */}
      <div className="bg-[#0a0f1e] border border-white/5 rounded-2xl p-5">
        <h3 className="font-bold ryze-text-inverse text-sm mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Add Student',     path: '/dashboard/admin/students' },
            { label: 'Add Parent',      path: '/dashboard/admin/parents' },
            { label: 'Create Class',    path: '/dashboard/admin/classes' },
            { label: 'Mark Attendance', path: '/dashboard/admin/attendance' },
            { label: 'Record Payment',  path: '/dashboard/admin/payments' },
            { label: 'View Alerts',     path: '/dashboard/admin/alerts' },
          ].map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className="px-4 py-2 text-sm font-semibold ryze-text-inverse bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl transition-all"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};

export default AdminOverview;
