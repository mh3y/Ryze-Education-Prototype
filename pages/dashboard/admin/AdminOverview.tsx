/**
 * AdminOverview — landing page for /dashboard/admin
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, BookOpen, CalendarDays, ShieldAlert, CreditCard,
  ClipboardCheck, RefreshCw, ChevronRight, Clock, CheckCircle2,
  AlertTriangle, TrendingUp, Zap, GraduationCap, Bell,
  ArrowRight, Activity,
} from 'lucide-react';
import { adminApi, AdminOverviewStats } from '../../../services/adminApi';
import { StatusBadge, ErrorState, LoadingState } from '../../../components/dashboard/ui';
import { useAuth } from '../../../contexts/AuthContext';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('en-AU', {
      hour: '2-digit', minute: '2-digit', hour12: true,
      timeZone: 'Australia/Sydney',
    });
  } catch { return iso; }
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function severityColor(severity: string): string {
  switch (severity) {
    case 'critical': return 'text-red-400 bg-red-400/10 border-red-400/20';
    case 'high':     return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
    case 'medium':   return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    default:         return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface MetricCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  gradient: string;
  iconBg: string;
  iconColor: string;
  alert?: boolean;
  onClick: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({
  label, value, icon: Icon, gradient, iconBg, iconColor, alert, onClick,
}) => (
  <button
    onClick={onClick}
    className={`
      group relative overflow-hidden rounded-2xl p-5 text-left
      border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg
      ${gradient}
      ${alert && value > 0
        ? 'border-red-500/30 shadow-red-500/10 shadow-md'
        : 'border-white/8 hover:border-white/15'}
    `}
  >
    <div className="flex items-start justify-between">
      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
        <Icon size={18} className={iconColor} />
      </div>
      <ChevronRight
        size={14}
        className="ryze-text-muted group-hover:ryze-text-inverse group-hover:translate-x-0.5 transition-all"
      />
    </div>

    <div className="mt-4">
      <div className={`text-3xl font-extrabold ryze-text-inverse tabular-nums ${alert && value > 0 ? 'text-red-300' : ''}`}>
        {value}
      </div>
      <div className="text-xs ryze-text-muted mt-1 font-medium">{label}</div>
    </div>

    {/* Subtle glow for alerts */}
    {alert && value > 0 && (
      <div className="absolute inset-0 bg-red-500/5 pointer-events-none rounded-2xl" />
    )}
  </button>
);

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const AdminOverview: React.FC = () => {
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const [stats, setStats]     = useState<AdminOverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setStats(await adminApi.getOverviewStats());
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

  const metrics: MetricCardProps[] = [
    {
      label: 'Active Students',
      value: stats.total_students,
      icon: GraduationCap,
      gradient: 'bg-gradient-to-br from-[#FFB000]/10 via-[#0a0f1e] to-[#0a0f1e]',
      iconBg: 'bg-[#FFB000]/15',
      iconColor: 'text-[#FFB000]',
      onClick: () => navigate('/dashboard/admin/students'),
    },
    {
      label: 'Active Classes',
      value: stats.active_classes,
      icon: BookOpen,
      gradient: 'bg-gradient-to-br from-blue-500/10 via-[#0a0f1e] to-[#0a0f1e]',
      iconBg: 'bg-blue-500/15',
      iconColor: 'text-blue-400',
      onClick: () => navigate('/dashboard/admin/classes'),
    },
    {
      label: "Today's Lessons",
      value: stats.today_lessons,
      icon: CalendarDays,
      gradient: 'bg-gradient-to-br from-emerald-500/10 via-[#0a0f1e] to-[#0a0f1e]',
      iconBg: 'bg-emerald-500/15',
      iconColor: 'text-emerald-400',
      onClick: () => navigate('/dashboard/admin/lessons'),
    },
    {
      label: 'Open Alerts',
      value: stats.open_alerts,
      icon: ShieldAlert,
      gradient: 'bg-gradient-to-br from-red-500/10 via-[#0a0f1e] to-[#0a0f1e]',
      iconBg: 'bg-red-500/15',
      iconColor: 'text-red-400',
      alert: true,
      onClick: () => navigate('/dashboard/admin/alerts'),
    },
    {
      label: 'Pending Payments',
      value: stats.pending_payments,
      icon: CreditCard,
      gradient: 'bg-gradient-to-br from-amber-500/10 via-[#0a0f1e] to-[#0a0f1e]',
      iconBg: 'bg-amber-500/15',
      iconColor: 'text-amber-400',
      alert: stats.pending_payments > 0,
      onClick: () => navigate('/dashboard/admin/payments'),
    },
    {
      label: 'Missing Reports',
      value: stats.missing_reports,
      icon: ClipboardCheck,
      gradient: 'bg-gradient-to-br from-purple-500/10 via-[#0a0f1e] to-[#0a0f1e]',
      iconBg: 'bg-purple-500/15',
      iconColor: 'text-purple-400',
      alert: stats.missing_reports > 0,
      onClick: () => navigate('/dashboard/admin/progress-reports'),
    },
  ];

  const quickActions = [
    { label: 'Add Student',     icon: Users,          path: '/dashboard/admin/students' },
    { label: 'Add Parent',      icon: Users,          path: '/dashboard/admin/parents' },
    { label: 'View Lessons',    icon: CalendarDays,   path: '/dashboard/admin/lessons' },
    { label: 'Attendance',      icon: ClipboardCheck, path: '/dashboard/admin/attendance' },
    { label: 'Payments',        icon: CreditCard,     path: '/dashboard/admin/payments' },
    { label: 'Alerts',          icon: Bell,           path: '/dashboard/admin/alerts' },
  ];

  return (
    <div className="space-y-7">

      {/* ── Hero / greeting ─────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#FFB000]/15 via-[#0d1226] to-[#0a0f1e] border border-[#FFB000]/15 p-6 md:p-8">
        {/* background decoration */}
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-[#FFB000]/5 blur-3xl pointer-events-none" />
        <div className="absolute right-24 bottom-0 w-32 h-32 rounded-full bg-blue-500/5 blur-2xl pointer-events-none" />

        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm text-[#FFB000]/80 font-semibold tracking-wider uppercase mb-1">
              {getGreeting()}
            </p>
            <h2 className="text-2xl md:text-3xl font-extrabold ryze-text-inverse leading-tight">
              {user?.name ?? 'Admin'} 👋
            </h2>
            <p className="text-sm ryze-text-muted mt-2">
              {new Date().toLocaleDateString('en-AU', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                timeZone: 'Australia/Sydney',
              })}
              {stats.today_lessons > 0 && (
                <span className="ml-2 text-emerald-400 font-medium">
                  · {stats.today_lessons} lesson{stats.today_lessons !== 1 ? 's' : ''} today
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {stats.open_alerts > 0 && (
              <button
                onClick={() => navigate('/dashboard/admin/alerts')}
                className="flex items-center gap-2 text-xs font-semibold text-red-300 bg-red-500/15 border border-red-500/25 px-3 py-2 rounded-xl hover:bg-red-500/25 transition-all"
              >
                <Activity size={13} className="animate-pulse" />
                {stats.open_alerts} alert{stats.open_alerts !== 1 ? 's' : ''} need attention
              </button>
            )}
            <button
              onClick={load}
              className="flex items-center gap-2 text-xs ryze-text-muted hover:ryze-text-inverse font-medium px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5"
            >
              <RefreshCw size={13} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* ── Metric cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
        {metrics.map((m) => <MetricCard key={m.label} {...m} />)}
      </div>

      {/* ── Two-column panels ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* Today's lessons */}
        <div className="bg-[#0a0f1e] border border-white/8 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                <CalendarDays size={13} className="text-emerald-400" />
              </div>
              <h3 className="font-bold ryze-text-inverse text-sm">Today's Schedule</h3>
            </div>
            <button
              onClick={() => navigate('/dashboard/admin/lessons')}
              className="text-xs text-[#FFB000]/70 hover:text-[#FFB000] flex items-center gap-1 transition-colors font-medium"
            >
              View all <ArrowRight size={11} />
            </button>
          </div>

          {stats.today_lesson_list.length === 0 ? (
            <div className="py-12 text-center">
              <CalendarDays size={28} className="mx-auto ryze-text-muted mb-3 opacity-40" />
              <p className="text-sm ryze-text-muted">No lessons scheduled for today</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {stats.today_lesson_list.map((lesson) => (
                <div
                  key={lesson.id}
                  onClick={() => navigate('/dashboard/admin/lessons')}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.03] cursor-pointer transition-colors group"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    lesson.status === 'completed' ? 'bg-emerald-500/15' :
                    lesson.status === 'active'    ? 'bg-[#FFB000]/15' :
                    'bg-blue-500/15'
                  }`}>
                    {lesson.status === 'completed'
                      ? <CheckCircle2 size={15} className="text-emerald-400" />
                      : lesson.status === 'active'
                      ? <Clock size={15} className="text-[#FFB000] animate-pulse" />
                      : <CalendarDays size={15} className="text-blue-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold ryze-text-inverse truncate group-hover:text-[#FFB000] transition-colors">
                      {lesson.title}
                    </div>
                    <div className="text-xs ryze-text-muted truncate">{lesson.class_name}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-semibold ryze-text-inverse">{formatTime(lesson.start_time)}</div>
                    <StatusBadge value={lesson.status} className="mt-0.5" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent alerts */}
        <div className="bg-[#0a0f1e] border border-white/8 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-red-500/15 flex items-center justify-center">
                <ShieldAlert size={13} className="text-red-400" />
              </div>
              <h3 className="font-bold ryze-text-inverse text-sm">Open Alerts</h3>
              {stats.open_alerts > 0 && (
                <span className="text-[10px] font-bold bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full border border-red-500/20">
                  {stats.open_alerts}
                </span>
              )}
            </div>
            <button
              onClick={() => navigate('/dashboard/admin/alerts')}
              className="text-xs text-[#FFB000]/70 hover:text-[#FFB000] flex items-center gap-1 transition-colors font-medium"
            >
              Manage <ArrowRight size={11} />
            </button>
          </div>

          {stats.recent_alerts.length === 0 ? (
            <div className="py-12 text-center">
              <CheckCircle2 size={28} className="mx-auto text-emerald-400 mb-3 opacity-60" />
              <p className="text-sm ryze-text-muted">All clear — no open alerts</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {stats.recent_alerts.map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => navigate('/dashboard/admin/alerts')}
                  className="flex items-start gap-3 px-5 py-3.5 hover:bg-white/[0.03] cursor-pointer transition-colors group"
                >
                  <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${severityColor(alert.severity)}`}>
                    <AlertTriangle size={12} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold ryze-text-inverse truncate group-hover:text-[#FFB000] transition-colors">
                      {alert.title}
                    </div>
                    <div className="text-xs ryze-text-muted truncate mt-0.5">{alert.message}</div>
                  </div>
                  <StatusBadge value={alert.severity} className="shrink-0 mt-0.5" />
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ── Quick actions ────────────────────────────────────────────────── */}
      <div className="bg-[#0a0f1e] border border-white/8 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-[#FFB000]/15 flex items-center justify-center">
            <Zap size={13} className="text-[#FFB000]" />
          </div>
          <h3 className="font-bold ryze-text-inverse text-sm">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {quickActions.map(({ label, icon: Icon, path }) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              className="group flex flex-col items-center gap-2.5 py-4 px-3 rounded-xl bg-white/[0.03] hover:bg-[#FFB000]/10 border border-white/5 hover:border-[#FFB000]/25 transition-all duration-200 text-center"
            >
              <div className="w-9 h-9 rounded-xl bg-white/5 group-hover:bg-[#FFB000]/15 flex items-center justify-center transition-colors">
                <Icon size={16} className="ryze-text-muted group-hover:text-[#FFB000] transition-colors" />
              </div>
              <span className="text-xs font-semibold ryze-text-muted group-hover:ryze-text-inverse transition-colors leading-tight">
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── System status strip ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-xs ryze-text-muted bg-white/[0.03] border border-white/5 rounded-full px-3 py-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Bot online
        </div>
        <div className="flex items-center gap-2 text-xs ryze-text-muted bg-white/[0.03] border border-white/5 rounded-full px-3 py-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Calendar sync active
        </div>
        <div className="flex items-center gap-2 text-xs ryze-text-muted bg-white/[0.03] border border-white/5 rounded-full px-3 py-1.5">
          <TrendingUp size={11} className="text-emerald-400" />
          {stats.total_students} students enrolled
        </div>
      </div>

    </div>
  );
};

export default AdminOverview;
