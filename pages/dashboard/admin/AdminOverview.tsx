/**
 * AdminOverview — /dashboard/admin
 * Uses CSS classes from portal-theme.css for pixel-accurate handoff match.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RefreshCw, Plus, TrendingUp, TrendingDown,
  ArrowRight, AlertTriangle,
  CalendarDays, CreditCard, ClipboardList, Download, Megaphone,
  Eye, EyeOff,
} from 'lucide-react';
import { adminApi, AdminOverviewStats } from '../../../services/adminApi';
import { portalApi, HealthStatus } from '../../../services/portalApi';
import { useAuth } from '../../../contexts/AuthContext';
import {
  useDashboardCustomization,
  QuickActionKey,
} from '../../../contexts/DashboardCustomizationContext';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function getTodayLabel(): string {
  return new Date().toLocaleDateString('en-AU', {
    weekday: 'long', day: 'numeric', month: 'long',
    timeZone: 'Australia/Sydney',
  }).toUpperCase();
}

function formatMono(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('en-AU', {
      hour: '2-digit', minute: '2-digit', hour12: false,
      timeZone: 'Australia/Sydney',
    });
  } catch { return iso; }
}

function getSydneyTime(): string {
  return new Date().toLocaleTimeString('en-AU', {
    hour: '2-digit', minute: '2-digit', hour12: true,
    timeZone: 'Australia/Sydney',
  });
}

function getFirstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

// ---------------------------------------------------------------------------
// Quick actions
// ---------------------------------------------------------------------------

const QUICK_ACTIONS = [
  { key: 'add-student',  label: 'Add student',      Icon: Plus,          accent: true,  path: '/dashboard/admin/students?new=1' },
  { key: 'schedule',     label: 'Schedule lesson',  Icon: CalendarDays,  accent: false, path: '/dashboard/admin/lessons?new=1' },
  { key: 'invoice',      label: 'Send invoice',     Icon: CreditCard,    accent: false, path: '/dashboard/admin/payments' },
  { key: 'broadcast',    label: 'Announcement',     Icon: Megaphone,     accent: false, path: '/dashboard/admin/announcements' },
  { key: 'report',       label: 'Build report',     Icon: ClipboardList, accent: false, path: '/dashboard/admin/progress-reports' },
  { key: 'export',       label: 'Export data',      Icon: Download,      accent: false, path: '/dashboard/admin/students' },
];

// ---------------------------------------------------------------------------
// Sub-components using CSS classes from portal-theme.css
// ---------------------------------------------------------------------------

interface StatProps {
  label: string;
  value: string | number;
  deltaText?: string;
  deltaDir?: 'up' | 'down';
  footRight?: string;
}

const Stat: React.FC<StatProps> = ({ label, value, deltaText, deltaDir, footRight }) => (
  <div className="stat">
    <div className="stat__label">{label}</div>
    <div className="stat__value tnum">{value}</div>
    <div className="stat__foot">
      {deltaText ? (
        <span className={`stat__delta stat__delta--${deltaDir ?? 'up'}`}>
          {deltaDir === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {deltaText}
        </span>
      ) : <span />}
      {footRight && <span>{footRight}</span>}
    </div>
  </div>
);

function lessonTag(state: string) {
  if (state === 'active')    return <span className="tag tag--accent">Live now</span>;
  if (state === 'completed') return <span className="tag">Done</span>;
  return <span className="tag tag--info">Upcoming</span>;
}

function alertPipClass(severity: string): string {
  if (severity === 'high' || severity === 'critical') return 'alert-row__pip alert-row__pip--high';
  if (severity === 'med'  || severity === 'medium')   return 'alert-row__pip alert-row__pip--med';
  return 'alert-row__pip alert-row__pip--low';
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Edit mode overlay wrapper for a widget section
// ---------------------------------------------------------------------------

const EditableWidget: React.FC<{
  widgetId: import('../../../contexts/DashboardCustomizationContext').WidgetId;
  isEditMode: boolean;
  isHidden: boolean;
  onToggle: () => void;
  label: string;
  children: React.ReactNode;
}> = ({ isEditMode, isHidden, onToggle, label, children }) => {
  if (!isEditMode) return <>{children}</>;

  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        position: 'absolute', inset: 0, zIndex: 5,
        border: `2px dashed ${isHidden ? 'rgba(245,158,11,0.6)' : 'rgba(245,158,11,0.3)'}`,
        borderRadius: 14,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: -12, left: 12, zIndex: 6,
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
          padding: '2px 8px', borderRadius: 999,
          background: '#1a1200', border: '1px solid rgba(245,158,11,0.4)',
          color: '#f59e0b',
        }}>
          {label}
        </span>
      </div>
      <button
        onClick={onToggle}
        style={{
          position: 'absolute', top: -12, right: 12, zIndex: 6,
          display: 'flex', alignItems: 'center', gap: 5,
          height: 24, padding: '0 9px', borderRadius: 999,
          fontSize: 10.5, fontWeight: 600,
          background: isHidden ? 'rgba(245,158,11,0.2)' : '#1a1200',
          border: `1px solid ${isHidden ? 'rgba(245,158,11,0.5)' : 'rgba(245,158,11,0.3)'}`,
          color: '#f59e0b', cursor: 'pointer',
        }}
      >
        {isHidden ? <Eye size={11} /> : <EyeOff size={11} />}
        {isHidden ? 'Show' : 'Hide'}
      </button>
      <div style={{ opacity: isHidden ? 0.35 : 1, transition: 'opacity 200ms ease' }}>
        {children}
      </div>
    </div>
  );
};

const AdminOverview: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats]     = useState<AdminOverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [time, setTime]       = useState(getSydneyTime());

  // Customization context — safe to call unconditionally
  const {
    isEditMode,
    isWidgetHidden,
    toggleWidget,
    isQuickActionHidden,
    toggleQuickAction,
  } = useDashboardCustomization();

  // Health strip state
  const [health, setHealth]           = useState<HealthStatus | null>(null);
  const [healthLoading, setHealthLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setStats(await adminApi.getOverviewStats());
    } catch (e: any) {
      setError('Failed to load live data — showing last known values.');
    }
    finally { setLoading(false); }
  }, []);

  // Load health strip data
  useEffect(() => {
    setHealthLoading(true);
    portalApi.getHealth()
      .then((h) => { setHealth(h); setHealthLoading(false); })
      .catch(() => { setHealth(null); setHealthLoading(false); });
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const id = setInterval(() => setTime(getSydneyTime()), 30_000);
    return () => clearInterval(id);
  }, []);

  const firstName = getFirstName(user?.name ?? 'there');

  const activeStudents = stats?.total_students ?? 0;
  const classesRunning = stats?.active_classes ?? 0;
  const lessonsToday   = stats?.today_lessons   ?? 0;
  const alertCount     = stats?.open_alerts      ?? 0;

  const lessonList = stats?.today_lesson_list?.map((l) => ({
    id: l.id, time: formatMono(l.start_time),
    end: l.end_time ? formatMono(l.end_time) : '',
    title: l.title, tutor: l.class_name ?? '',
    room: '', seats: '', state: l.status as 'upcoming' | 'live' | 'done' | string,
  })) ?? [];

  const alertList = stats?.recent_alerts?.map((a) => ({
    id: a.id, severity: a.severity,
    title: a.title, body: a.message, when: '',
  })) ?? [];

  return (
    <div className="section-stack">

      {/* ── Page head ─────────────────────────────────────────────── */}
      <div className="page-head">
        <div>
          <div className="page-head__eyebrow">{getTodayLabel()}</div>
          <h1 className="page-head__title">
            Good {getGreeting()},{' '}
            <span className="accent-text">{firstName}</span>.
          </h1>
          <p className="page-head__sub">
            {loading
              ? "Loading today's overview…"
              : `${lessonList.length} lessons scheduled today, ${alertCount} open alert${alertCount !== 1 ? 's' : ''}, and everything else is quiet.`}
          </p>
        </div>
        <div className="page-head__actions">
          <button className="btn btn--ghost" onClick={load}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button className="btn btn--primary" onClick={() => navigate('/dashboard/admin/students?new=1')}>
            <Plus size={14} /> Add student
          </button>
        </div>
      </div>

      {/* ── Data error banner ─────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium"
          style={{ background: 'color-mix(in oklab, var(--warn) 12%, transparent)', border: '1px solid color-mix(in oklab, var(--warn) 28%, transparent)', color: 'var(--warn)' }}>
          <AlertTriangle size={14} /> {error}
        </div>
      )}

      {/* ── Stats ─────────────────────────────────────────────────── */}
      {(isEditMode || !isWidgetHidden('stats')) && (
        <EditableWidget
          widgetId="stats"
          isEditMode={isEditMode}
          isHidden={isWidgetHidden('stats')}
          onToggle={() => toggleWidget('stats')}
          label="Stat tiles"
        >
          <div className="row row--4">
            <Stat label="Active students"  value={activeStudents} deltaText="+6 this week"     deltaDir="up"   footRight="92% retention" />
            <Stat label="Classes running"  value={classesRunning} deltaText="2 with low seats" deltaDir="down" footRight="5 tutors" />
            <Stat label="Lessons today"    value={String(lessonsToday).padStart(2, '0')} deltaText="1 live now" deltaDir="up" footRight="08 tomorrow" />
            <Stat label="Pending payments" value={stats ? `${stats.pending_payments}` : '—'} deltaText="3 overdue" deltaDir="down" footRight={stats?.missing_reports ? `${stats.missing_reports} missing reports` : undefined} />
          </div>
        </EditableWidget>
      )}

      {/* ── Two-up: lessons + alerts ───────────────────────────────── */}
      {(isEditMode || (!isWidgetHidden('lessons') || !isWidgetHidden('alerts'))) && (
        <div className="row row--8-4">

          {/* Today's lessons */}
          {(isEditMode || !isWidgetHidden('lessons')) && (
            <EditableWidget
              widgetId="lessons"
              isEditMode={isEditMode}
              isHidden={isWidgetHidden('lessons')}
              onToggle={() => toggleWidget('lessons')}
              label="Today's lessons"
            >
              <div className="card card--flush">
                <div className="card__head">
                  <div>
                    <div className="card__title">Today's lessons</div>
                    <div className="card__sub">
                      {lessonList.length} scheduled · {lessonList.filter(l => l.state === 'active').length} live now
                    </div>
                  </div>
                  <button className="btn btn--quiet" onClick={() => navigate('/dashboard/admin/lessons')}>
                    View calendar <ArrowRight size={13} />
                  </button>
                </div>
                <div>
                  {!loading && lessonList.length === 0 && (
                    <div style={{ padding: '28px 20px', textAlign: 'center', color: 'var(--fg-muted)', fontSize: 14 }}>
                      No lessons scheduled for today.
                    </div>
                  )}
                  {lessonList.map((l) => (
                    <div key={l.id} className="lesson-row" onClick={() => navigate(typeof l.id === 'number' ? `/dashboard/admin/lessons/${l.id}` : '/dashboard/admin/lessons')} style={{ cursor: 'pointer' }}>
                      <div className="lesson-row__time">
                        <div className="lesson-row__start">{l.time}</div>
                        <div className="lesson-row__end">→ {l.end}</div>
                      </div>
                      <div>
                        <div className="lesson-row__title">{l.title}</div>
                        <div className="lesson-row__meta">
                          {[l.tutor, l.room, l.seats].filter(Boolean).join(' · ')}
                        </div>
                      </div>
                      <div>{lessonTag(l.state)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </EditableWidget>
          )}

          {/* Needs attention */}
          {(isEditMode || !isWidgetHidden('alerts')) && (
            <EditableWidget
              widgetId="alerts"
              isEditMode={isEditMode}
              isHidden={isWidgetHidden('alerts')}
              onToggle={() => toggleWidget('alerts')}
              label="Needs attention"
            >
              <div className="card card--flush">
                <div className="card__head">
                  <div>
                    <div className="card__title">Needs attention</div>
                    <div className="card__sub">{alertList.length} open alerts</div>
                  </div>
                  <button className="btn btn--quiet" onClick={() => navigate('/dashboard/admin/alerts')}>
                    All alerts <ArrowRight size={13} />
                  </button>
                </div>
                <div>
                  {!loading && alertList.length === 0 && (
                    <div style={{ padding: '28px 20px', textAlign: 'center', color: 'var(--fg-muted)', fontSize: 14 }}>
                      ✓ No open alerts
                    </div>
                  )}
                  {alertList.map((a) => (
                    <div key={a.id} className="alert-row">
                      <div className={alertPipClass(a.severity)}>
                        <AlertTriangle size={13} />
                      </div>
                      <div>
                        <div className="alert-row__title">{a.title}</div>
                        <div className="alert-row__sub">{a.body}</div>
                      </div>
                      <div className="alert-row__when">{a.when}</div>
                    </div>
                  ))}
                </div>
              </div>
            </EditableWidget>
          )}
        </div>
      )}

      {/* ── Quick actions ──────────────────────────────────────────── */}
      {(isEditMode || !isWidgetHidden('quick-actions')) && (
        <EditableWidget
          widgetId="quick-actions"
          isEditMode={isEditMode}
          isHidden={isWidgetHidden('quick-actions')}
          onToggle={() => toggleWidget('quick-actions')}
          label="Quick actions"
        >
          <div className="card">
            <div className="quick">
              <div className="quick__label">
                <div className="eyebrow">Shortcuts</div>
                <div className="quick__hint">Frequent tasks, one click away.</div>
              </div>
              <div className="quick__grid">
                {QUICK_ACTIONS
                  .filter(({ key }) => isEditMode || !isQuickActionHidden(key as QuickActionKey))
                  .map(({ key, label, Icon, accent, path }) => {
                    const qaHidden = isQuickActionHidden(key as QuickActionKey);
                    return (
                      <button
                        key={key}
                        className={`quick-btn${accent ? ' is-accent' : ''}`}
                        onClick={() => {
                          if (isEditMode) {
                            toggleQuickAction(key as QuickActionKey);
                          } else {
                            navigate(path);
                          }
                        }}
                        style={{ opacity: isEditMode && qaHidden ? 0.35 : 1, position: 'relative' }}
                        title={isEditMode ? (qaHidden ? 'Show this action' : 'Hide this action') : label}
                      >
                        <span className="quick-btn__icon"><Icon size={16} /></span>
                        <span className="quick-btn__label">{label}</span>
                        {isEditMode && (
                          <span style={{
                            position: 'absolute', top: 4, right: 4,
                            color: qaHidden ? '#f59e0b' : 'rgba(255,255,255,0.4)',
                          }}>
                            {qaHidden ? <Eye size={10} /> : <EyeOff size={10} />}
                          </span>
                        )}
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>
        </EditableWidget>
      )}

      {/* ── Health strip ──────────────────────────────────────────── */}
      {(isEditMode || !isWidgetHidden('health')) && (
        <EditableWidget
          widgetId="health"
          isEditMode={isEditMode}
          isHidden={isWidgetHidden('health')}
          onToggle={() => toggleWidget('health')}
          label="System health"
        >
          <div className="health">
            {healthLoading ? (
              <div className="health__item">
                <div style={{ width: 8, height: 8, border: '2px solid var(--fg-muted)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
                <span className="muted">Loading system status…</span>
              </div>
            ) : health ? (
              <>
                <div className="health__item">
                  <span className={`dot${health.db_ok ? '' : ' dot--warn'}`} />
                  <strong className="strong">Database</strong>
                  <span className="muted">· {health.db_ok ? 'online' : 'degraded'}</span>
                </div>
                <div className="health__item">
                  <span className={`dot${health.status === 'ok' ? '' : ' dot--warn'}`} />
                  <strong className="strong">API</strong>
                  <span className="muted">· {health.status === 'ok' ? `${health.student_count} students · ${health.class_count} classes` : 'degraded'}</span>
                </div>
                <div className="health__item">
                  <span className="dot" />
                  <strong className="strong">Upcoming lessons</strong>
                  <span className="muted">· {health.upcoming_lessons} scheduled</span>
                </div>
              </>
            ) : (
              <div className="health__item">
                <span className="dot dot--warn" />
                <strong className="strong">System status</strong>
                <span className="muted">· unknown — could not reach API</span>
              </div>
            )}
            <div className="health__sep" />
            <div className="health__time">
              Sydney · <span className="tnum">{time}</span>
            </div>
          </div>
        </EditableWidget>
      )}

    </div>
  );
};

export default AdminOverview;
