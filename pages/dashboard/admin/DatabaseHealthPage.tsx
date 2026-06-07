/**
 * DatabaseHealthPage — /dashboard/admin/database-health
 *
 * Admin-only, read-only visual database inspection dashboard.
 * No destructive actions. No secret exposure. No VoiceAttendance mutation.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  adminApi,
  type DbHealthSummary,
  type DbHealthUser,
  type DbHealthClass,
  type DbHealthEnrollment,
  type DbHealthLesson,
  type DbHealthVoiceRecord,
  type DbHealthReconciliation,
  type DbHealthIssue,
  type Paginated,
} from '../../../services/adminApi';

// ── Types ─────────────────────────────────────────────────────────────────────

type Tab = 'summary' | 'users' | 'classes' | 'enrollments' | 'lessons' | 'voice' | 'reconciliation' | 'issues';

interface Async<T> { loading: boolean; error: string | null; data: T | null }
function idle<T>(): Async<T> { return { loading: false, error: null, data: null }; }
function loading<T>(): Async<T> { return { loading: true, error: null, data: null }; }
function ok<T>(data: T): Async<T> { return { loading: false, error: null, data }; }
function err<T>(e: unknown): Async<T> { return { loading: false, error: (e as any)?.message ?? String(e), data: null }; }

// ── Shared UI sub-components ─────────────────────────────────────────────────

const Spinner: React.FC = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0' }}>
    <div style={{
      width: 28, height: 28, borderRadius: '50%',
      border: '3px solid var(--border)', borderTopColor: 'var(--accent)',
      animation: 'spin 0.7s linear infinite',
    }} />
  </div>
);

const ErrBox: React.FC<{ msg: string; onRetry?: () => void }> = ({ msg, onRetry }) => (
  <div style={{ padding: '32px 24px', textAlign: 'center' }}>
    <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>⚠ {msg}</p>
    {onRetry && (
      <button onClick={onRetry} style={{ fontSize: 13, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
        Retry
      </button>
    )}
  </div>
);

const EmptyBox: React.FC<{ msg?: string }> = ({ msg = 'No records found.' }) => (
  <div style={{ padding: '32px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>{msg}</div>
);

const WarnPills: React.FC<{ warnings: string[] }> = ({ warnings }) => {
  if (!warnings.length) return <span style={{ color: 'var(--success, #4ade80)', fontSize: 12 }}>✓</span>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {warnings.map((w, i) => (
        <span key={i} style={{
          fontSize: 11, padding: '2px 6px', borderRadius: 4,
          background: 'color-mix(in oklab, var(--danger) 15%, transparent)',
          color: 'var(--danger)', whiteSpace: 'nowrap', display: 'inline-block',
        }}>⚠ {w}</span>
      ))}
    </div>
  );
};

const SeverityBadge: React.FC<{ sev: string }> = ({ sev }) => {
  const colors: Record<string, string> = {
    critical: '#dc2626', high: '#ea580c', medium: '#ca8a04', low: '#6b7280',
  };
  return (
    <span style={{
      fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
      background: `${colors[sev] ?? '#6b7280'}22`, color: colors[sev] ?? '#6b7280',
      textTransform: 'uppercase', letterSpacing: '0.05em',
    }}>{sev}</span>
  );
};

const StatCard: React.FC<{ label: string; value: number | string; sub?: string; warn?: boolean }> = ({ label, value, sub, warn }) => (
  <div style={{
    background: 'var(--bg-elevated, var(--bg-card, #1a1a2e))',
    border: `1px solid ${warn ? 'color-mix(in oklab, var(--danger) 40%, transparent)' : 'var(--border)'}`,
    borderRadius: 10, padding: '16px 20px', minWidth: 130, flex: '1 1 130px',
  }}>
    <div style={{ fontSize: 22, fontWeight: 700, color: warn ? 'var(--danger)' : 'var(--text)', lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginTop: 6 }}>{label}</div>
    {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{sub}</div>}
  </div>
);

// Generic scrollable table
const Tbl: React.FC<{
  headers: string[];
  rows: React.ReactNode[][];
  rowKey?: (i: number) => string | number;
}> = ({ headers, rows, rowKey }) => (
  <div style={{ overflowX: 'auto' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
      <thead>
        <tr>
          {headers.map((h) => (
            <th key={h} style={{
              padding: '8px 12px', textAlign: 'left', fontWeight: 600,
              fontSize: 11, letterSpacing: '0.05em', textTransform: 'uppercase',
              color: 'var(--text-muted)', borderBottom: '1px solid var(--border)',
              whiteSpace: 'nowrap',
            }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={rowKey ? rowKey(i) : i} style={{ borderBottom: '1px solid var(--border-soft, var(--border))' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-elevated, rgba(255,255,255,0.03))')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            {row.map((cell, j) => (
              <td key={j} style={{ padding: '9px 12px', color: 'var(--text)', verticalAlign: 'top' }}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ── Tab config ────────────────────────────────────────────────────────────────

const TABS: { key: Tab; label: string }[] = [
  { key: 'summary',       label: 'Summary' },
  { key: 'users',         label: 'Users' },
  { key: 'classes',       label: 'Classes' },
  { key: 'enrollments',   label: 'Enrolments' },
  { key: 'lessons',       label: 'Lessons' },
  { key: 'voice',         label: 'Voice Log' },
  { key: 'reconciliation',label: 'Reconciliation' },
  { key: 'issues',        label: 'Issues' },
];

// ── Formatters ────────────────────────────────────────────────────────────────

function fmt(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('en-AU', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
}
function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' });
}
const yn = (v: boolean) => v ? <span style={{ color: 'var(--success, #4ade80)' }}>Yes</span> : <span style={{ color: 'var(--danger)' }}>No</span>;
const active = (v: boolean) => v
  ? <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 999, background: 'rgba(74,222,128,0.15)', color: '#4ade80' }}>Active</span>
  : <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 999, background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>Inactive</span>;

// ── Main page ─────────────────────────────────────────────────────────────────

export default function DatabaseHealthPage() {
  const [activeTab, setActiveTab] = useState<Tab>('summary');
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const [summary,        setSummary]        = useState<Async<DbHealthSummary>>(idle());
  const [users,          setUsers]          = useState<Async<{ total: number; items: DbHealthUser[] }>>(idle());
  const [classes,        setClasses]        = useState<Async<{ total: number; items: DbHealthClass[] }>>(idle());
  const [enrollments,    setEnrollments]    = useState<Async<{ total: number; items: DbHealthEnrollment[] }>>(idle());
  const [lessons,        setLessons]        = useState<Async<Paginated<DbHealthLesson>>>(idle());
  const [voice,          setVoice]          = useState<Async<Paginated<DbHealthVoiceRecord>>>(idle());
  const [reconciliation, setReconciliation] = useState<Async<DbHealthReconciliation>>(idle());
  const [issues,         setIssues]         = useState<Async<{ total: number; items: DbHealthIssue[] }>>(idle());

  // Lesson filters
  const [lessonClassFilter, setLessonClassFilter] = useState('');
  const [lessonStatusFilter, setLessonStatusFilter] = useState('');
  // Voice filters
  const [voiceDateFilter, setVoiceDateFilter] = useState('');
  // Reconciliation inputs
  const [reconClassId, setReconClassId]   = useState('');
  const [reconDate, setReconDate]         = useState('');

  const loadSummary = useCallback(async () => {
    setSummary(loading());
    try { setSummary(ok(await adminApi.getDatabaseHealthSummary())); setLastRefresh(new Date()); }
    catch (e) { setSummary(err(e)); }
  }, []);

  const loadUsers = useCallback(async () => {
    setUsers(loading());
    try { setUsers(ok(await adminApi.getDatabaseHealthUsers())); }
    catch (e) { setUsers(err(e)); }
  }, []);

  const loadClasses = useCallback(async () => {
    setClasses(loading());
    try { setClasses(ok(await adminApi.getDatabaseHealthClasses())); }
    catch (e) { setClasses(err(e)); }
  }, []);

  const loadEnrollments = useCallback(async () => {
    setEnrollments(loading());
    try { setEnrollments(ok(await adminApi.getDatabaseHealthEnrollments())); }
    catch (e) { setEnrollments(err(e)); }
  }, []);

  const loadLessons = useCallback(async () => {
    setLessons(loading());
    try {
      setLessons(ok(await adminApi.getDatabaseHealthLessons({
        class_id: lessonClassFilter ? Number(lessonClassFilter) : undefined,
        status:   lessonStatusFilter || undefined,
        limit: 100,
      })));
    } catch (e) { setLessons(err(e)); }
  }, [lessonClassFilter, lessonStatusFilter]);

  const loadVoice = useCallback(async () => {
    setVoice(loading());
    try {
      setVoice(ok(await adminApi.getDatabaseHealthVoice({
        date:  voiceDateFilter || undefined,
        limit: 100,
      })));
    } catch (e) { setVoice(err(e)); }
  }, [voiceDateFilter]);

  const loadReconciliation = useCallback(async () => {
    if (!reconClassId || !reconDate) return;
    setReconciliation(loading());
    try { setReconciliation(ok(await adminApi.getDatabaseHealthReconciliation(Number(reconClassId), reconDate))); }
    catch (e) { setReconciliation(err(e)); }
  }, [reconClassId, reconDate]);

  const loadIssues = useCallback(async () => {
    setIssues(loading());
    try { setIssues(ok(await adminApi.getDatabaseHealthIssues())); }
    catch (e) { setIssues(err(e)); }
  }, []);

  // Load summary on mount
  useEffect(() => { loadSummary(); loadIssues(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load tab data on first visit
  useEffect(() => {
    if (activeTab === 'users'       && !users.data       && !users.loading)       loadUsers();
    if (activeTab === 'classes'     && !classes.data     && !classes.loading)     loadClasses();
    if (activeTab === 'enrollments' && !enrollments.data && !enrollments.loading) loadEnrollments();
    if (activeTab === 'lessons'     && !lessons.data     && !lessons.loading)     loadLessons();
    if (activeTab === 'voice'       && !voice.data       && !voice.loading)       loadVoice();
    if (activeTab === 'issues'      && !issues.data      && !issues.loading)      loadIssues();
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const issueCount = issues.data?.total ?? 0;
  const criticalCount = issues.data?.items.filter(i => i.severity === 'critical' || i.severity === 'high').length ?? 0;

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1400, margin: '0 auto' }}>
      {/* ── Header ── */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>Database Health</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            Read-only view of production database state. No records are modified here.
            {lastRefresh && <span style={{ marginLeft: 8, opacity: 0.7 }}>Last refreshed: {lastRefresh.toLocaleTimeString('en-AU')}</span>}
          </p>
        </div>
        <button
          onClick={() => {
            loadSummary(); loadIssues();
            if (activeTab === 'users')         loadUsers();
            if (activeTab === 'classes')       loadClasses();
            if (activeTab === 'enrollments')   loadEnrollments();
            if (activeTab === 'lessons')       loadLessons();
            if (activeTab === 'voice')         loadVoice();
          }}
          style={{
            padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            background: 'var(--accent)', color: 'var(--accent-ink, #fff)', border: 'none',
          }}
        >↻ Refresh</button>
      </div>

      {/* ── Summary stat strip ── */}
      {summary.loading && <Spinner />}
      {summary.error && <ErrBox msg={summary.error} onRetry={loadSummary} />}
      {summary.data && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
          <StatCard label="Users" value={summary.data.users.total} sub={`${summary.data.users.student}s · ${summary.data.users.tutor}t · ${summary.data.users.admin}a`} />
          <StatCard label="No Discord" value={summary.data.users.no_discord_students + summary.data.users.no_discord_tutors} warn={summary.data.users.no_discord_students + summary.data.users.no_discord_tutors > 0} />
          <StatCard label="Classes" value={summary.data.classes.total} sub={`${summary.data.classes.active} active`} />
          <StatCard label="Enrolments" value={summary.data.enrollments.active} sub="active" />
          <StatCard label="Lessons" value={summary.data.lessons.total} sub={`${summary.data.lessons.scheduled} scheduled`} />
          <StatCard label="Voice Records" value={summary.data.voice_attendance.total} sub={`${summary.data.voice_attendance.unmatched} unmatched`} warn={summary.data.voice_attendance.unmatched > 0} />
          <StatCard label="Issues" value={issueCount} warn={criticalCount > 0} sub={criticalCount > 0 ? `${criticalCount} critical/high` : undefined} />
        </div>
      )}

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border)', marginBottom: 24, overflowX: 'auto' }}>
        {TABS.map((t) => {
          const isActive = t.key === activeTab;
          const badge = t.key === 'issues' && issueCount > 0 ? issueCount : undefined;
          return (
            <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
              padding: '9px 16px', fontSize: 13, fontWeight: isActive ? 600 : 500,
              color: isActive ? 'var(--accent)' : 'var(--text-muted)',
              background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
              borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
              marginBottom: -1, position: 'relative',
            }}>
              {t.label}
              {badge && <span style={{
                marginLeft: 6, fontSize: 10, padding: '1px 5px', borderRadius: 999,
                background: criticalCount > 0 ? 'rgba(220,38,38,0.2)' : 'rgba(202,138,4,0.2)',
                color: criticalCount > 0 ? '#dc2626' : '#ca8a04', fontWeight: 700,
              }}>{badge}</span>}
            </button>
          );
        })}
      </div>

      {/* ── Tab content ── */}
      <div style={{
        background: 'var(--bg-elevated, var(--bg-card, rgba(255,255,255,0.03)))',
        border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden',
      }}>

        {/* SUMMARY */}
        {activeTab === 'summary' && summary.data && (
          <div style={{ padding: '24px' }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>Data Health Summary</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
              {[
                { label: 'Total Users', items: [
                    ['Admins', summary.data.users.admin],
                    ['Tutors', summary.data.users.tutor],
                    ['Students', summary.data.users.student],
                    ['Inactive', summary.data.users.inactive],
                    ['Students w/o Discord', summary.data.users.no_discord_students],
                    ['Tutors w/o Discord', summary.data.users.no_discord_tutors],
                ]},
                { label: 'Classes', items: [
                    ['Total', summary.data.classes.total],
                    ['Active', summary.data.classes.active],
                    ['Inactive/archived', summary.data.classes.inactive],
                ]},
                { label: 'Enrolments', items: [
                    ['Total', summary.data.enrollments.total],
                    ['Active', summary.data.enrollments.active],
                    ['Inactive', summary.data.enrollments.inactive],
                ]},
                { label: 'Lessons', items: [
                    ['Total', summary.data.lessons.total],
                    ['Scheduled', summary.data.lessons.scheduled],
                    ['Completed', summary.data.lessons.completed],
                    ['Cancelled', summary.data.lessons.cancelled],
                ]},
                { label: 'Voice Attendance', items: [
                    ['Total records', summary.data.voice_attendance.total],
                    ['Unmatched (no CRM user)', summary.data.voice_attendance.unmatched],
                ]},
                { label: 'Attendance', items: [
                    ['Total records', summary.data.attendance.total],
                    ['Status = unknown', summary.data.attendance.unknown],
                ]},
              ].map(({ label, items }) => (
                <div key={label} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '14px 16px' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>{label}</div>
                  {items.map(([k, v]) => (
                    <div key={String(k)} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0', borderBottom: '1px solid var(--border-soft, rgba(255,255,255,0.05))' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                      <span style={{ fontWeight: 600, color: 'var(--text)' }}>{v}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <p style={{ marginTop: 20, fontSize: 12, color: 'var(--text-muted)' }}>
              Use the tabs above to inspect individual tables, voice attendance logs, attendance reconciliation, and auto-detected issues.
            </p>
          </div>
        )}

        {/* USERS */}
        {activeTab === 'users' && (
          <>
            {users.loading && <Spinner />}
            {users.error && <ErrBox msg={users.error} onRetry={loadUsers} />}
            {users.data && users.data.items.length === 0 && <EmptyBox />}
            {users.data && users.data.items.length > 0 && (
              <>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', fontSize: 12, color: 'var(--text-muted)' }}>
                  {users.data.total} users · {users.data.items.filter(u => u.warning_count > 0).length} with warnings
                </div>
                <Tbl
                  headers={['ID', 'Display ID', 'Name', 'Role', 'Discord Linked', 'Active', 'Enrolments', 'Warnings']}
                  rows={users.data.items.map((u) => [
                    <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{u.id}</span>,
                    <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{u.display_id ?? '—'}</span>,
                    <Link to={`/dashboard/admin/${u.role === 'tutor' ? 'tutors' : 'students'}/${u.id}`} style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>{u.full_name}</Link>,
                    <span style={{ textTransform: 'capitalize' }}>{u.role}</span>,
                    yn(!!u.discord_user_id),
                    active(u.active),
                    <span>{u.active_enrollment_count}</span>,
                    <WarnPills warnings={u.warnings} />,
                  ])}
                />
              </>
            )}
          </>
        )}

        {/* CLASSES */}
        {activeTab === 'classes' && (
          <>
            {classes.loading && <Spinner />}
            {classes.error && <ErrBox msg={classes.error} onRetry={loadClasses} />}
            {classes.data && classes.data.items.length === 0 && <EmptyBox />}
            {classes.data && classes.data.items.length > 0 && (
              <>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', fontSize: 12, color: 'var(--text-muted)' }}>
                  {classes.data.total} classes · {classes.data.items.filter(c => c.warning_count > 0).length} with warnings
                </div>
                <Tbl
                  headers={['ID', 'Name', 'Type', 'Tutor', 'Students', 'Discord Ch.', 'Calendar', 'Active', 'Warnings']}
                  rows={classes.data.items.map((c) => [
                    <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{c.id}</span>,
                    <Link to={`/dashboard/admin/classes/${c.id}`} style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>{c.name}</Link>,
                    <span style={{ textTransform: 'capitalize', fontSize: 11 }}>{c.class_type}</span>,
                    c.tutor_name
                      ? <span>{c.tutor_name}{!c.tutor_has_discord && <span style={{ color: 'var(--danger)', fontSize: 10, marginLeft: 4 }}>(no Discord)</span>}</span>
                      : <span style={{ color: 'var(--danger)' }}>None</span>,
                    <span>{c.active_student_count}</span>,
                    c.discord_channel_id
                      ? <span style={{ fontFamily: 'monospace', fontSize: 10 }}>{c.discord_channel_id.slice(-6)}</span>
                      : <span style={{ color: 'var(--danger)' }}>—</span>,
                    yn(!!c.google_calendar_id),
                    active(c.active),
                    <WarnPills warnings={c.warnings} />,
                  ])}
                />
              </>
            )}
          </>
        )}

        {/* ENROLLMENTS */}
        {activeTab === 'enrollments' && (
          <>
            {enrollments.loading && <Spinner />}
            {enrollments.error && <ErrBox msg={enrollments.error} onRetry={loadEnrollments} />}
            {enrollments.data && enrollments.data.items.length === 0 && <EmptyBox />}
            {enrollments.data && enrollments.data.items.length > 0 && (
              <>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', fontSize: 12, color: 'var(--text-muted)' }}>
                  {enrollments.data.total} enrolments · {enrollments.data.items.filter(e => e.warning_count > 0).length} with warnings
                </div>
                <Tbl
                  headers={['#', 'Student', 'Role', 'Class', 'Active', 'Trial', 'Enrolled', 'Warnings']}
                  rows={enrollments.data.items.map((e) => [
                    <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{e.id}</span>,
                    <Link to={`/dashboard/admin/students/${e.student_id}`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>{e.student_name}</Link>,
                    <span style={{ textTransform: 'capitalize', fontSize: 11, color: e.student_role !== 'student' ? 'var(--danger)' : 'var(--text-muted)' }}>{e.student_role}</span>,
                    <Link to={`/dashboard/admin/classes/${e.class_id}`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>{e.class_name}</Link>,
                    active(e.active),
                    yn(e.is_trial),
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{fmtDate(e.enrolled_at)}</span>,
                    <WarnPills warnings={e.warnings} />,
                  ])}
                />
              </>
            )}
          </>
        )}

        {/* LESSONS */}
        {activeTab === 'lessons' && (
          <>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                placeholder="Class ID filter…" type="number" value={lessonClassFilter}
                onChange={(e) => setLessonClassFilter(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 12, width: 130 }}
              />
              <select value={lessonStatusFilter} onChange={(e) => setLessonStatusFilter(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 12 }}>
                <option value="">All statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="live">Live</option>
              </select>
              <button onClick={loadLessons} style={{ padding: '6px 14px', borderRadius: 6, background: 'var(--accent)', color: 'var(--accent-ink, #fff)', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Filter</button>
              {lessons.data && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{lessons.data.total} records</span>}
            </div>
            {lessons.loading && <Spinner />}
            {lessons.error && <ErrBox msg={lessons.error} onRetry={loadLessons} />}
            {lessons.data && lessons.data.items.length === 0 && <EmptyBox />}
            {lessons.data && lessons.data.items.length > 0 && (
              <Tbl
                headers={['ID', 'Class', 'Title', 'Scheduled', 'Duration', 'Status', 'Attendance', 'Warnings']}
                rows={lessons.data.items.map((l) => [
                  <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{l.id}</span>,
                  <Link to={`/dashboard/admin/classes/${l.class_id}`} style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: 11 }}>{l.class_name}</Link>,
                  <Link to={`/dashboard/admin/lessons/${l.id}`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>{l.title}</Link>,
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{fmt(l.scheduled_at)}</span>,
                  <span>{l.duration_min}m</span>,
                  <span style={{ textTransform: 'capitalize', fontSize: 11 }}>{l.status}</span>,
                  <span style={{ fontSize: 11 }}>{l.attendance_count}{l.attendance_unknown > 0 && <span style={{ color: 'var(--danger)', marginLeft: 4 }}>({l.attendance_unknown} unknown)</span>}</span>,
                  <WarnPills warnings={l.warnings} />,
                ])}
              />
            )}
          </>
        )}

        {/* VOICE LOG */}
        {activeTab === 'voice' && (
          <>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                type="date" value={voiceDateFilter} onChange={(e) => setVoiceDateFilter(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 12 }}
              />
              <button onClick={loadVoice} style={{ padding: '6px 14px', borderRadius: 6, background: 'var(--accent)', color: 'var(--accent-ink, #fff)', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Filter</button>
              {voice.data && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{voice.data.total} records (showing {voice.data.items.length})</span>}
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Read-only — VoiceAttendance records are never modified here.</span>
            </div>
            {voice.loading && <Spinner />}
            {voice.error && <ErrBox msg={voice.error} onRetry={loadVoice} />}
            {voice.data && voice.data.items.length === 0 && <EmptyBox msg="No voice attendance records for this filter." />}
            {voice.data && voice.data.items.length > 0 && (
              <Tbl
                headers={['ID', 'Discord User', 'Channel', 'Joined', 'Left', 'Duration', 'CRM User', 'Lesson', 'Matched']}
                rows={voice.data.items.map((v) => [
                  <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{v.id}</span>,
                  <div>
                    <div style={{ fontFamily: 'monospace', fontSize: 10.5 }}>{v.discord_user_id}</div>
                    {v.discord_username && <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{v.discord_username}</div>}
                  </div>,
                  <div>
                    {v.discord_channel && <div style={{ fontSize: 11 }}>{v.discord_channel}</div>}
                    {v.discord_channel_id && <div style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--text-muted)' }}>{v.discord_channel_id.slice(-6)}</div>}
                  </div>,
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{fmt(v.joined_at)}</span>,
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{v.left_at ? fmt(v.left_at) : '—'}</span>,
                  <span>{v.duration_min != null ? `${v.duration_min}m` : '—'}</span>,
                  v.crm_user_name
                    ? <Link to={`/dashboard/admin/students/${v.crm_user_id}`} style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: 12 }}>{v.crm_user_name}</Link>
                    : <span style={{ color: 'var(--danger)', fontSize: 11 }}>Unmatched</span>,
                  v.lesson_title
                    ? <Link to={`/dashboard/admin/lessons/${v.lesson_id}`} style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: 11 }}>{v.lesson_title}</Link>
                    : <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>—</span>,
                  v.unmatched
                    ? <span style={{ color: 'var(--danger)', fontSize: 11 }}>✗ No</span>
                    : <span style={{ color: 'var(--success, #4ade80)', fontSize: 11 }}>✓</span>,
                ])}
              />
            )}
          </>
        )}

        {/* RECONCILIATION */}
        {activeTab === 'reconciliation' && (
          <div style={{ padding: '24px' }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>Attendance Reconciliation</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>
              Select a class and date to compare enrolled students against Discord voice attendance records.
              Voice data is read-only — no records are modified.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
              <input
                type="number" placeholder="Class ID" value={reconClassId} onChange={(e) => setReconClassId(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, width: 120 }}
              />
              <input
                type="date" value={reconDate} onChange={(e) => setReconDate(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13 }}
              />
              <button onClick={loadReconciliation} disabled={!reconClassId || !reconDate} style={{
                padding: '8px 18px', borderRadius: 8, background: 'var(--accent)', color: 'var(--accent-ink, #fff)',
                border: 'none', cursor: !reconClassId || !reconDate ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600, opacity: !reconClassId || !reconDate ? 0.5 : 1,
              }}>Load</button>
            </div>
            {reconciliation.loading && <Spinner />}
            {reconciliation.error && <ErrBox msg={reconciliation.error} />}
            {reconciliation.data && reconciliation.data.summary && (
              <>
                <div style={{ marginBottom: 16 }}>
                  <span style={{ fontWeight: 600, color: 'var(--text)', fontSize: 14 }}>{reconciliation.data.class_name}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 10 }}>{reconciliation.data.date}</span>
                  {reconciliation.data.lesson
                    ? <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 10 }}>
                        Lesson: <Link to={`/dashboard/admin/lessons/${reconciliation.data.lesson.id}`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>{reconciliation.data.lesson.title}</Link>
                        {' '}· {reconciliation.data.lesson.duration_min}min · {reconciliation.data.lesson.status}
                      </span>
                    : <span style={{ fontSize: 12, color: 'var(--danger)', marginLeft: 10 }}>⚠ No lesson found for this date</span>
                  }
                </div>
                {/* Window info */}
                {reconciliation.data.window && (
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>
                    Match window: {fmt(reconciliation.data.window.start)} → {fmt(reconciliation.data.window.end)}
                    {' '}(includes ±15 min buffer — same as Attendance page)
                  </p>
                )}
                {/* Summary strip */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
                  {[
                    { label: 'Enrolled',       val: reconciliation.data.summary.enrolled,          warn: false },
                    { label: 'Present',         val: reconciliation.data.summary.present,           warn: false },
                    { label: 'Absent',          val: reconciliation.data.summary.absent,            warn: reconciliation.data.summary.absent > 0 },
                    { label: 'Late',            val: reconciliation.data.summary.late,              warn: reconciliation.data.summary.late > 0 },
                    { label: 'Left early',      val: reconciliation.data.summary.left_early,        warn: reconciliation.data.summary.left_early > 0 },
                    { label: 'Partial',         val: reconciliation.data.summary.partial,           warn: reconciliation.data.summary.partial > 0 },
                    { label: 'No voice data',   val: reconciliation.data.summary.no_voice_data,     warn: reconciliation.data.summary.no_voice_data > 0 },
                    { label: 'Override ≠ voice',val: reconciliation.data.summary.mismatches,        warn: reconciliation.data.summary.mismatches > 0 },
                    { label: 'Unknown Discord', val: reconciliation.data.summary.unmatched_discord, warn: reconciliation.data.summary.unmatched_discord > 0 },
                  ].map(({ label, val, warn }) => (
                    <div key={label} style={{ padding: '10px 16px', borderRadius: 8, border: `1px solid ${warn && val > 0 ? 'color-mix(in oklab, var(--danger) 40%, transparent)' : 'var(--border)'}`, background: 'var(--bg)' }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: warn && val > 0 ? 'var(--danger)' : 'var(--text)' }}>{val}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{label}</div>
                    </div>
                  ))}
                </div>
                {/* Roster table — uses real attendance engine statuses */}
                <Tbl
                  headers={['Student', 'Discord', 'Voice?', 'Joined', 'Duration', 'Engine Status', 'Override', 'Final', 'Flag']}
                  rows={reconciliation.data.roster.map((r) => {
                    const statusColor = (s: string) =>
                      s === 'present'    ? 'var(--success, #4ade80)' :
                      s === 'absent'     ? 'var(--danger)' :
                      s === 'late'       ? '#ca8a04' :
                      s === 'left_early' ? '#f97316' :
                      s === 'partial'    ? '#ca8a04' :
                      'var(--text-muted)';
                    return [
                      <Link to={`/dashboard/admin/students/${r.student_id}`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>{r.student_name}</Link>,
                      <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--text-muted)' }}>{r.discord_user_id ? `…${r.discord_user_id.slice(-4)}` : <span style={{ color: 'var(--danger)' }}>None</span>}</span>,
                      r.has_voice_data ? <span style={{ color: 'var(--success, #4ade80)', fontSize: 11 }}>✓</span> : <span style={{ color: 'var(--danger)', fontSize: 11 }}>✗</span>,
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.voice_joined_at ? fmt(r.voice_joined_at) : '—'}</div>
                        {r.is_late     && <div style={{ fontSize: 10, color: '#ca8a04' }}>Late</div>}
                        {r.left_early  && <div style={{ fontSize: 10, color: '#f97316' }}>Left early</div>}
                      </div>,
                      <span>{r.voice_total_min != null ? `${r.voice_total_min}m` : '—'}</span>,
                      <span style={{ textTransform: 'capitalize', fontSize: 11, color: statusColor(r.computed_from_voice) }}>{r.computed_from_voice.replace(/_/g, ' ')}</span>,
                      r.is_override
                        ? <span style={{ fontSize: 11, textTransform: 'capitalize', color: 'var(--text-muted)' }}>{r.recorded_attendance.replace(/_/g, ' ')}</span>
                        : <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>—</span>,
                      <span style={{ textTransform: 'capitalize', fontSize: 11, fontWeight: 600, color: statusColor(r.final_status) }}>{r.final_status.replace(/_/g, ' ')}</span>,
                      r.mismatch ? <span style={{ color: 'var(--danger)', fontWeight: 600, fontSize: 11 }}>⚠ Override ≠ voice</span> : <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>—</span>,
                    ];
                  })}
                />
                {/* Unmatched voice */}
                {reconciliation.data.unmatched_voice.length > 0 && (
                  <div style={{ marginTop: 24 }}>
                    <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--danger)', marginBottom: 10 }}>⚠ Unexpected/Unmatched Discord Voice ({reconciliation.data.unmatched_voice.length})</h4>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>
                      Sessions in the class channel during the lesson window that were not matched to enrolled students.
                    </p>
                    <Tbl
                      headers={['Discord User ID', 'Username', 'CRM User', 'In Roster?', 'Joined', 'Left', 'Duration']}
                      rows={reconciliation.data.unmatched_voice.map((v) => [
                        <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{v.discord_user_id}</span>,
                        <span style={{ fontSize: 11 }}>{v.discord_username ?? '—'}</span>,
                        v.crm_user_id
                          ? <Link to={`/dashboard/admin/students/${v.crm_user_id}`} style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: 11 }}>CRM #{v.crm_user_id}</Link>
                          : <span style={{ color: 'var(--danger)', fontSize: 11 }}>Unmatched</span>,
                        v.in_expected_roster
                          ? <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>Yes (tutor/sub)</span>
                          : <span style={{ color: 'var(--danger)', fontSize: 11 }}>No</span>,
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{fmt(v.joined_at)}</span>,
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{v.left_at ? fmt(v.left_at) : '—'}</span>,
                        <span>{v.duration_seconds != null ? `${Math.round(v.duration_seconds / 60)}m` : '—'}</span>,
                      ])}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ISSUES */}
        {activeTab === 'issues' && (
          <>
            {issues.loading && <Spinner />}
            {issues.error && <ErrBox msg={issues.error} onRetry={loadIssues} />}
            {issues.data && issues.data.items.length === 0 && <EmptyBox msg="No issues detected — database looks healthy." />}
            {issues.data && issues.data.items.length > 0 && (
              <>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', fontSize: 12, color: 'var(--text-muted)' }}>
                  {issues.data.total} issues detected
                </div>
                <div style={{ padding: '8px 0' }}>
                  {issues.data.items.map((issue) => (
                    <div key={issue.id} style={{
                      display: 'flex', alignItems: 'flex-start', gap: 14,
                      padding: '12px 20px', borderBottom: '1px solid var(--border-soft, rgba(255,255,255,0.05))',
                    }}>
                      <SeverityBadge sev={issue.severity} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{issue.entity_name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{issue.description}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
                          {issue.category} · {issue.entity_type}#{issue.entity_id || ''}
                        </div>
                      </div>
                      {issue.edit_path && (
                        <Link to={issue.edit_path} style={{
                          fontSize: 12, padding: '5px 12px', borderRadius: 6,
                          border: '1px solid var(--border)', color: 'var(--text)', textDecoration: 'none',
                          whiteSpace: 'nowrap', flexShrink: 0,
                        }}>View →</Link>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
