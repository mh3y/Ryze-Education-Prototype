/**
 * AdminOverview — /dashboard/admin
 * Uses CSS classes from portal-theme.css for pixel-accurate handoff match.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RefreshCw, Plus, TrendingUp, TrendingDown,
  ArrowRight, AlertTriangle, Clock,
  CalendarDays, CreditCard, ClipboardList, Download, Megaphone,
} from 'lucide-react';
import { adminApi, AdminOverviewStats } from '../../../services/adminApi';
import { useAuth } from '../../../contexts/AuthContext';

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
// Mock data
// ---------------------------------------------------------------------------

const MOCK_LESSONS = [
  { id: 1, time: '16:00', end: '17:30', title: 'Foundations — Algebraic fractions',           tutor: 'Marcus Webb',  room: 'Studio A', seats: '7 / 10', state: 'upcoming' },
  { id: 2, time: '17:00', end: '18:30', title: 'Maths Ext 1 — Inverse trig differentiation',  tutor: 'Daniel Kwok',  room: 'Studio B', seats: '8 / 8',  state: 'active' },
  { id: 3, time: '18:00', end: '19:30', title: 'Maths Advanced — Combinatorics review',        tutor: 'Daniel Kwok',  room: 'Studio A', seats: '9 / 10', state: 'upcoming' },
  { id: 4, time: '19:00', end: '20:30', title: 'Maths Ext 2 — Mechanics: projectiles',         tutor: 'Priya Aiyar',  room: 'Studio C', seats: '6 / 8',  state: 'upcoming' },
];

const MOCK_ALERTS = [
  { id: 1, severity: 'high', title: '3 students missed lesson check-ins',      body: 'Foundations · Wed 4pm — automated reminders sent.',  when: '8m ago' },
  { id: 2, severity: 'med',  title: 'Sofia Reyes progress dropping',           body: '3 weeks below class median in Algebra topic.',       when: '1h ago' },
  { id: 3, severity: 'low',  title: 'Discord bot reconnected',                 body: 'Brief outage 14:02–14:04, all reminders delivered.', when: '2h ago' },
];

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

const AdminOverview: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats]     = useState<AdminOverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [time, setTime]       = useState(getSydneyTime());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setStats(await adminApi.getOverviewStats());
    } catch { /* fall through to mock data */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const id = setInterval(() => setTime(getSydneyTime()), 30_000);
    return () => clearInterval(id);
  }, []);

  const firstName = getFirstName(user?.name ?? 'there');

  const activeStudents = stats?.total_students ?? 142;
  const classesRunning = stats?.active_classes ?? 18;
  const lessonsToday   = stats?.today_lessons   ?? 4;
  const alertCount     = stats?.open_alerts      ?? 3;

  const lessonList = stats?.today_lesson_list?.length
    ? stats.today_lesson_list.map((l) => ({
        id: l.id, time: formatMono(l.start_time),
        end: l.end_time ? formatMono(l.end_time) : '',
        title: l.title, tutor: l.class_name ?? '',
        room: '', seats: '', state: l.status,
      }))
    : MOCK_LESSONS;

  const alertList = stats?.recent_alerts?.length
    ? stats.recent_alerts.map((a) => ({
        id: a.id, severity: a.severity,
        title: a.title, body: a.message, when: '',
      }))
    : MOCK_ALERTS;

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

      {/* ── Stats ─────────────────────────────────────────────────── */}
      <div className="row row--4">
        <Stat label="Active students"  value={activeStudents} deltaText="+6 this week"     deltaDir="up"   footRight="92% retention" />
        <Stat label="Classes running"  value={classesRunning} deltaText="2 with low seats" deltaDir="down" footRight="5 tutors" />
        <Stat label="Lessons today"    value={String(lessonsToday).padStart(2, '0')} deltaText="1 live now" deltaDir="up" footRight="08 tomorrow" />
        <Stat label="Outstanding"      value="$2.4k"          deltaText="3 overdue"         deltaDir="down" footRight="of $24k due" />
      </div>

      {/* ── Two-up: lessons + alerts ───────────────────────────────── */}
      <div className="row row--8-4">

        {/* Today's lessons */}
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
            {lessonList.map((l) => (
              <div key={l.id} className="lesson-row" onClick={() => navigate('/dashboard/admin/lessons')} style={{ cursor: 'pointer' }}>
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

        {/* Needs attention */}
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
      </div>

      {/* ── Quick actions ──────────────────────────────────────────── */}
      <div className="card">
        <div className="quick">
          <div className="quick__label">
            <div className="eyebrow">Shortcuts</div>
            <div className="quick__hint">Frequent tasks, one click away.</div>
          </div>
          <div className="quick__grid">
            {QUICK_ACTIONS.map(({ key, label, Icon, accent, path }) => (
              <button
                key={key}
                className={`quick-btn${accent ? ' is-accent' : ''}`}
                onClick={() => navigate(path)}
              >
                <span className="quick-btn__icon"><Icon size={16} /></span>
                <span className="quick-btn__label">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Health strip ──────────────────────────────────────────── */}
      <div className="health">
        <div className="health__item">
          <span className="dot" />
          <strong className="strong">Discord bot</strong>
          <span className="muted">· online · 13ms latency</span>
        </div>
        <div className="health__item">
          <span className="dot" />
          <strong className="strong">Calendar sync</strong>
          <span className="muted">· last 14s ago</span>
        </div>
        <div className="health__item">
          <span className="dot" />
          <strong className="strong">Payments</strong>
          <span className="muted">· 6 webhooks queued</span>
        </div>
        <div className="health__sep" />
        <div className="health__time">
          Sydney · <span className="tnum">{time}</span>
        </div>
      </div>

    </div>
  );
};

export default AdminOverview;
