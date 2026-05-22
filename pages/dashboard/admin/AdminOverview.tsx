/**
 * AdminOverview — /dashboard/admin
 *
 * The operational command centre for Ryze Education.
 * All data comes from GET /api/admin/overview — no hardcoded values.
 *
 * Sections:
 *   1. Immediate Action Centre   (overdue payments, tutor pay, alerts)
 *   2. Schedule                  (today + next 7 days)
 *   3. Financial Snapshot        (revenue in / tutor cost out)
 *   4. Student & Tutor Snapshot  (counts, year distribution)
 *   5. Academic / Operations Risk
 *   6. Automation Health         (bot sync status)
 *   7. Recent Activity Feed
 */
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RefreshCw, AlertTriangle, ArrowRight, CheckCircle,
  Clock, Users, BookOpen, DollarSign, Activity,
  Wifi, WifiOff, Calendar, TrendingUp, TrendingDown,
  Zap, ShieldAlert, MessageSquare, BarChart3,
} from 'lucide-react';
import {
  adminApi,
  type AdminOverviewData,
  type OverviewLessonItem,
  type OverviewRiskItem,
  type OverviewAlertItem,
} from '../../../services/adminApi';
import { useAuth } from '../../../contexts/AuthContext';

// ── Helpers ────────────────────────────────────────────────────────────────

function fmtCents(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-AU', {
    day: 'numeric', month: 'short', year: 'numeric',
    timeZone: 'Australia/Sydney',
  });
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-AU', {
    hour: '2-digit', minute: '2-digit', hour12: false,
    timeZone: 'Australia/Sydney',
  });
}

function fmtDayLabel(iso: string): string {
  return new Date(iso).toLocaleDateString('en-AU', {
    weekday: 'short', day: 'numeric', month: 'short',
    timeZone: 'Australia/Sydney',
  });
}

function relTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diffMs / 60_000);
  if (m < 2)   return 'just now';
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function syncAge(iso: string | undefined | null): { label: string; stale: boolean } {
  if (!iso) return { label: 'Never', stale: true };
  const diffMs = Date.now() - new Date(iso).getTime();
  const h = diffMs / 3_600_000;
  const label = relTime(iso);
  return { label, stale: h > 4 };
}

function getTodayLabel(): string {
  return new Date().toLocaleDateString('en-AU', {
    weekday: 'long', day: 'numeric', month: 'long',
    timeZone: 'Australia/Sydney',
  }).toUpperCase();
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function getFirstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

// ── Shared sub-components ──────────────────────────────────────────────────

const SectionHeader: React.FC<{
  title: string;
  sub?: string;
  action?: { label: string; path: string };
  onNav: (path: string) => void;
}> = ({ title, sub, action, onNav }) => (
  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12 }}>
    <div>
      <div className="eyebrow" style={{ marginBottom: 2 }}>{title}</div>
      {sub && <div className="muted" style={{ fontSize: 13 }}>{sub}</div>}
    </div>
    {action && (
      <button className="btn btn--quiet" style={{ fontSize: 12 }} onClick={() => onNav(action.path)}>
        {action.label} <ArrowRight size={12} />
      </button>
    )}
  </div>
);

const EmptyCard: React.FC<{ icon?: React.ReactNode; message: string; sub?: string }> = ({ icon, message, sub }) => (
  <div style={{
    padding: '24px 20px', textAlign: 'center', color: 'var(--fg-muted)', fontSize: 13.5,
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
  }}>
    {icon && <div style={{ color: 'var(--fg-faint)', marginBottom: 2 }}>{icon}</div>}
    <div style={{ fontWeight: 600, color: 'var(--fg-muted)' }}>{message}</div>
    {sub && <div style={{ fontSize: 12, color: 'var(--fg-faint)' }}>{sub}</div>}
  </div>
);

const Skeleton: React.FC<{ h?: number; w?: string; mb?: number }> = ({ h = 14, w = '100%', mb = 0 }) => (
  <div style={{
    height: h, width: w, borderRadius: 6, marginBottom: mb,
    background: 'var(--border-soft)',
    animation: 'pulse 1.5s ease-in-out infinite',
  }} />
);

const SkeletonCard: React.FC = () => (
  <div className="card" style={{ padding: 20 }}>
    <Skeleton h={12} w="40%" mb={12} />
    <Skeleton h={32} w="60%" mb={8} />
    <Skeleton h={10} w="80%" />
  </div>
);

function severityPip(sev: string): string {
  if (sev === 'high' || sev === 'critical') return 'alert-row__pip alert-row__pip--high';
  if (sev === 'medium' || sev === 'med')   return 'alert-row__pip alert-row__pip--med';
  return 'alert-row__pip alert-row__pip--low';
}

function lessonStatusTag(status: string) {
  if (status === 'live')      return <span className="tag tag--accent">Live</span>;
  if (status === 'completed') return <span className="tag">Done</span>;
  if (status === 'cancelled') return <span className="tag" style={{ color: 'var(--fg-muted)', background: 'var(--bg-surface-2)' }}>Cancelled</span>;
  return <span className="tag tag--info">Upcoming</span>;
}

function activityIcon(entityType: string, action: string): React.ReactNode {
  if (action === 'login')         return <Activity size={13} />;
  if (entityType === 'payment')   return <DollarSign size={13} />;
  if (entityType === 'lesson')    return <Calendar size={13} />;
  if (entityType === 'student')   return <Users size={13} />;
  if (entityType === 'homework')  return <BookOpen size={13} />;
  if (entityType === 'message')   return <MessageSquare size={13} />;
  return <Zap size={13} />;
}

// ── Section 1: Action Centre ───────────────────────────────────────────────

const OverduePaymentsCard: React.FC<{
  data: AdminOverviewData['financials'];
  onNav: (p: string) => void;
}> = ({ data, onNav }) => (
  <div className="card card--flush" style={{ display: 'flex', flexDirection: 'column' }}>
    <div className="card__head">
      <div>
        <div className="card__title">Overdue Payments</div>
        <div className="card__sub">Parent / student balances outstanding</div>
      </div>
      <button className="btn btn--quiet" onClick={() => onNav('/dashboard/admin/payments')}>
        View <ArrowRight size={12} />
      </button>
    </div>

    {data.countOverdue === 0 ? (
      <EmptyCard icon={<CheckCircle size={20} />} message="All parent payments are up to date." />
    ) : (
      <div>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-soft)', display: 'flex', gap: 24 }}>
          <div>
            <div className="eyebrow">Total overdue</div>
            <div className="tnum" style={{ fontSize: 20, fontWeight: 700, color: 'var(--danger)' }}>
              {fmtCents(data.parentOverdue)}
            </div>
          </div>
          <div>
            <div className="eyebrow">Invoices</div>
            <div className="tnum" style={{ fontSize: 20, fontWeight: 700 }}>{data.countOverdue}</div>
          </div>
          {data.oldestOverdueDate && (
            <div>
              <div className="eyebrow">Oldest</div>
              <div className="tnum" style={{ fontSize: 13, fontWeight: 600, color: 'var(--warn)' }}>
                {fmtDate(data.oldestOverdueDate)}
              </div>
            </div>
          )}
        </div>
        {data.topOverduePayments.map(p => (
          <div key={p.id} className="alert-row" style={{ cursor: 'pointer' }} onClick={() => onNav('/dashboard/admin/payments')}>
            <div className="alert-row__pip alert-row__pip--high"><AlertTriangle size={13} /></div>
            <div>
              <div className="alert-row__title">{p.studentName}</div>
              <div className="alert-row__sub">{p.description}{p.dueDate ? ` · Due ${fmtDate(p.dueDate)}` : ''}</div>
            </div>
            <div className="tnum" style={{ fontSize: 13, fontWeight: 700, color: 'var(--danger)', whiteSpace: 'nowrap' }}>
              {fmtCents(p.amountOwed)}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const TutorPayCard: React.FC<{
  data: AdminOverviewData['financials'];
  onNav: (p: string) => void;
}> = ({ data, onNav }) => (
  <div className="card card--flush" style={{ display: 'flex', flexDirection: 'column' }}>
    <div className="card__head">
      <div>
        <div className="card__title">Tutor Payments Owed</div>
        <div className="card__sub">Unpaid tutor pay periods</div>
      </div>
      <button className="btn btn--quiet" onClick={() => onNav('/dashboard/admin/tutor-payments')}>
        View <ArrowRight size={12} />
      </button>
    </div>

    {data.countTutorPaymentsPending === 0 ? (
      <EmptyCard icon={<CheckCircle size={20} />} message="No tutor payments currently outstanding." />
    ) : (
      <div>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-soft)', display: 'flex', gap: 24 }}>
          <div>
            <div className="eyebrow">Total owed</div>
            <div className="tnum" style={{ fontSize: 20, fontWeight: 700, color: 'var(--warn)' }}>
              {fmtCents(data.tutorPaymentsOwed)}
            </div>
          </div>
          <div>
            <div className="eyebrow">Pay periods</div>
            <div className="tnum" style={{ fontSize: 20, fontWeight: 700 }}>{data.countTutorPaymentsPending}</div>
          </div>
        </div>
        {data.topTutorPayments.map(p => (
          <div key={p.id} className="alert-row" style={{ cursor: 'pointer' }} onClick={() => onNav('/dashboard/admin/tutor-payments')}>
            <div className="alert-row__pip alert-row__pip--med"><DollarSign size={13} /></div>
            <div>
              <div className="alert-row__title">{p.tutorName}</div>
              <div className="alert-row__sub">{p.period ?? p.description}</div>
            </div>
            <div className="tnum" style={{ fontSize: 13, fontWeight: 700, color: 'var(--warn)', whiteSpace: 'nowrap' }}>
              {fmtCents(p.amountOwed)}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const PriorityAlertsCard: React.FC<{
  alerts: OverviewAlertItem[];
  onNav: (p: string) => void;
}> = ({ alerts, onNav }) => (
  <div className="card card--flush" style={{ display: 'flex', flexDirection: 'column' }}>
    <div className="card__head">
      <div>
        <div className="card__title">Priority Alerts</div>
        <div className="card__sub">{alerts.length} open alert{alerts.length !== 1 ? 's' : ''}</div>
      </div>
      <button className="btn btn--quiet" onClick={() => onNav('/dashboard/admin/alerts')}>
        All <ArrowRight size={12} />
      </button>
    </div>

    {alerts.length === 0 ? (
      <EmptyCard icon={<CheckCircle size={20} />} message="No open alerts." sub="The system looks healthy." />
    ) : (
      <div>
        {alerts.slice(0, 6).map(a => (
          <div key={a.id} className="alert-row" style={{ cursor: 'pointer' }} onClick={() => onNav('/dashboard/admin/alerts')}>
            <div className={severityPip(a.severity)}><AlertTriangle size={13} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="alert-row__title">{a.title}</div>
              <div className="alert-row__sub" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {a.message}
              </div>
            </div>
            <div className="alert-row__when">{relTime(a.createdAt)}</div>
          </div>
        ))}
      </div>
    )}
  </div>
);

// ── Section 2: Schedule ────────────────────────────────────────────────────

const LessonRow: React.FC<{
  lesson: OverviewLessonItem;
  onNav: (p: string) => void;
  showDate?: boolean;
}> = ({ lesson, onNav, showDate }) => (
  <div
    className="lesson-row"
    style={{ cursor: 'pointer', opacity: lesson.status === 'cancelled' ? 0.55 : 1 }}
    onClick={() => onNav(`/dashboard/admin/lessons/${lesson.id}`)}
  >
    <div className="lesson-row__time">
      <div className="lesson-row__start">{fmtTime(lesson.scheduledAt)}</div>
      <div className="lesson-row__end">→ {fmtTime(lesson.endAt)}</div>
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div className="lesson-row__title">{lesson.title}</div>
      <div className="lesson-row__meta">
        {[
          showDate ? fmtDayLabel(lesson.scheduledAt) : null,
          lesson.className,
          lesson.tutorName,
          lesson.enrolledCount !== null ? `${lesson.enrolledCount} student${lesson.enrolledCount !== 1 ? 's' : ''}` : null,
        ].filter(Boolean).join(' · ')}
      </div>
    </div>
    {lessonStatusTag(lesson.status)}
  </div>
);

// ── Section 3: Financial ───────────────────────────────────────────────────

const FinancialSection: React.FC<{
  data: AdminOverviewData['financials'];
  onNav: (p: string) => void;
}> = ({ data, onNav }) => {
  const netPosition = data.revenueThisMonth - data.tutorPaymentsOwed;
  const hasNetData   = data.revenueThisMonth > 0 || data.tutorPaymentsOwed > 0;

  return (
    <div className="row row--4">
      {/* Outstanding */}
      <div className="stat" style={{ cursor: 'pointer' }} onClick={() => onNav('/dashboard/admin/payments')}>
        <div className="stat__label">Outstanding Payments</div>
        <div className="stat__value tnum" style={{ color: data.parentOutstanding > 0 ? 'var(--warn)' : undefined }}>
          {fmtCents(data.parentOutstanding)}
        </div>
        <div className="stat__foot">
          {data.parentOverdue > 0
            ? <span className="stat__delta stat__delta--down"><TrendingDown size={12} />{fmtCents(data.parentOverdue)} overdue</span>
            : <span className="stat__delta stat__delta--up"><CheckCircle size={12} />No overdue</span>}
          <span className="muted">{data.countOverdue} invoice{data.countOverdue !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Revenue this month */}
      <div className="stat">
        <div className="stat__label">Revenue This Month</div>
        <div className="stat__value tnum">
          {data.revenueThisMonth > 0 ? fmtCents(data.revenueThisMonth) : '—'}
        </div>
        <div className="stat__foot">
          <span className="muted">All-time</span>
          <span className="tnum" style={{ fontSize: 12 }}>{fmtCents(data.revenueAllTime)}</span>
        </div>
      </div>

      {/* Tutor cost */}
      <div className="stat" style={{ cursor: 'pointer' }} onClick={() => onNav('/dashboard/admin/tutor-payments')}>
        <div className="stat__label">Tutor Payments Owed</div>
        <div className="stat__value tnum" style={{ color: data.tutorPaymentsOwed > 0 ? 'var(--warn)' : undefined }}>
          {data.tutorPaymentsOwed > 0 ? fmtCents(data.tutorPaymentsOwed) : '—'}
        </div>
        <div className="stat__foot">
          <span className="muted">{data.countTutorPaymentsPending} pay period{data.countTutorPaymentsPending !== 1 ? 's' : ''} pending</span>
        </div>
      </div>

      {/* Net position */}
      <div className="stat">
        <div className="stat__label">Net This Month</div>
        <div className="stat__value tnum" style={{ color: !hasNetData ? 'var(--fg-muted)' : netPosition >= 0 ? 'var(--ok)' : 'var(--danger)' }}>
          {hasNetData ? fmtCents(Math.abs(netPosition)) : '—'}
        </div>
        <div className="stat__foot">
          {hasNetData
            ? netPosition >= 0
              ? <span className="stat__delta stat__delta--up"><TrendingUp size={12} />Positive</span>
              : <span className="stat__delta stat__delta--down"><TrendingDown size={12} />Deficit</span>
            : <span className="muted">Insufficient data</span>}
        </div>
      </div>
    </div>
  );
};

// ── Section 4: Snapshot ────────────────────────────────────────────────────

const SnapshotSection: React.FC<{
  summary: AdminOverviewData['summary'];
  onNav: (p: string) => void;
}> = ({ summary, onNav }) => {
  const yearEntries = Object.entries(summary.studentsByYear).sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }));

  return (
    <>
      <div className="row row--4">
        <div className="stat" style={{ cursor: 'pointer' }} onClick={() => onNav('/dashboard/admin/students')}>
          <div className="stat__label">Active Students</div>
          <div className="stat__value tnum">{summary.activeStudents}</div>
          <div className="stat__foot">
            {summary.newStudentsLast30Days > 0
              ? <span className="stat__delta stat__delta--up"><TrendingUp size={12} />+{summary.newStudentsLast30Days} this month</span>
              : <span className="muted">0 new this month</span>}
          </div>
        </div>

        <div className="stat" style={{ cursor: 'pointer' }} onClick={() => onNav('/dashboard/admin/tutors')}>
          <div className="stat__label">Active Tutors</div>
          <div className="stat__value tnum">{summary.activeTutors}</div>
          <div className="stat__foot">
            <span className="muted">{summary.activeClasses} class{summary.activeClasses !== 1 ? 'es' : ''} running</span>
          </div>
        </div>

        <div className="stat" style={{ cursor: 'pointer' }} onClick={() => onNav('/dashboard/admin/classes')}>
          <div className="stat__label">Active Classes</div>
          <div className="stat__value tnum">{summary.activeClasses}</div>
          <div className="stat__foot">
            <span className="muted">{summary.activeTutors} tutor{summary.activeTutors !== 1 ? 's' : ''} teaching</span>
          </div>
        </div>

        <div className="stat" style={{ cursor: 'pointer' }} onClick={() => onNav('/dashboard/admin/parents')}>
          <div className="stat__label">Parent Accounts</div>
          <div className="stat__value tnum">{summary.parentAccounts.total}</div>
          <div className="stat__foot">
            {summary.parentAccounts.pendingInvite > 0
              ? <span className="stat__delta stat__delta--down"><Clock size={12} />{summary.parentAccounts.pendingInvite} invite pending</span>
              : <span className="stat__delta stat__delta--up"><CheckCircle size={12} />{summary.parentAccounts.active} active</span>}
          </div>
        </div>
      </div>

      {/* Year Distribution */}
      {yearEntries.length > 0 ? (
        <div className="card">
          <div className="card__head">
            <div className="card__title">Student Distribution by Year Level</div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 24px', padding: '0 20px 16px' }}>
            {yearEntries.map(([year, count]) => (
              <div key={year} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="eyebrow" style={{ minWidth: 70 }}>{year}</div>
                <div style={{
                  height: 6, borderRadius: 3,
                  width: Math.max(20, Math.round(count * 16)),
                  background: 'var(--accent)',
                  opacity: 0.7,
                }} />
                <span className="tnum" style={{ fontSize: 13, fontWeight: 700 }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card">
          <EmptyCard
            icon={<BarChart3 size={20} />}
            message="Year level data incomplete."
            sub="Add year levels to student profiles to see the distribution."
          />
        </div>
      )}
    </>
  );
};

// ── Section 5: Risk ────────────────────────────────────────────────────────

const RiskRow: React.FC<{ item: OverviewRiskItem; onNav: (p: string) => void }> = ({ item, onNav }) => (
  <div className="alert-row" style={{ cursor: 'pointer' }} onClick={() => onNav(item.action)}>
    <div className={severityPip(item.severity)}><ShieldAlert size={13} /></div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div className="alert-row__title">{item.title}</div>
      <div className="alert-row__sub">{item.type.replace(/_/g, ' ')}</div>
    </div>
    <ArrowRight size={13} style={{ color: 'var(--fg-faint)', flexShrink: 0 }} />
  </div>
);

const RiskSection: React.FC<{
  risk: AdminOverviewData['risk'];
  onNav: (p: string) => void;
}> = ({ risk, onNav }) => {
  const all = [...risk.students, ...risk.classes, ...risk.tutors];
  const sorted = all.sort((a, b) => {
    const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
    return (order[a.severity] ?? 2) - (order[b.severity] ?? 2);
  }).slice(0, 5);

  return (
    <div className="card card--flush">
      <div className="card__head">
        <div>
          <div className="card__title">Academic & Operations Risk</div>
          <div className="card__sub">Students and classes that need attention</div>
        </div>
      </div>
      {sorted.length === 0 ? (
        <EmptyCard icon={<CheckCircle size={20} />} message="Nothing urgent detected." sub="All students, classes, and tutors look healthy." />
      ) : (
        <div>{sorted.map((item, i) => <RiskRow key={i} item={item} onNav={onNav} />)}</div>
      )}
    </div>
  );
};

// ── Section 6: Automation Health ───────────────────────────────────────────

const SyncBadge: React.FC<{ info: AdminOverviewData['automation'][keyof AdminOverviewData['automation']]; label: string }> = ({ info, label }) => {
  if (!info || typeof info !== 'object') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border-soft)' }}>
        <span className="dot dot--warn" />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
          <div className="muted" style={{ fontSize: 12 }}>Never synced</div>
        </div>
      </div>
    );
  }
  const s = info as { status: string; at: string; error: string | null; created: number; updated: number };
  const { label: ageLabel, stale } = syncAge(s.at);
  const ok = s.status === 'success' && !stale;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border-soft)' }}>
      <span className={`dot${ok ? '' : ' dot--warn'}`} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
        <div className="muted" style={{ fontSize: 12 }}>
          {s.status} · {ageLabel}
          {(s.created > 0 || s.updated > 0) && ` · +${s.created} created, ${s.updated} updated`}
        </div>
        {s.error && <div style={{ fontSize: 11.5, color: 'var(--danger)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.error}</div>}
      </div>
      <span className="tnum" style={{ fontSize: 11.5, color: stale ? 'var(--warn)' : 'var(--fg-faint)', flexShrink: 0 }}>{ageLabel}</span>
    </div>
  );
};

const AutomationSection: React.FC<{
  auto: AdminOverviewData['automation'];
  onNav: (p: string) => void;
  onTriggerSync: (type: 'sync_members' | 'sync_classes' | 'sync_lessons' | 'sync_attendance') => void;
  syncing: string | null;
}> = ({ auto, onNav, onTriggerSync, syncing }) => (
  <div className="row row--2">
    <div className="card card--flush">
      <div className="card__head">
        <div>
          <div className="card__title">Sync Status</div>
          <div className="card__sub">Discord bot ↔ Supabase data pipeline</div>
        </div>
        <button className="btn btn--quiet" onClick={() => onNav('/dashboard/admin/bot-health')}>
          Bot Health <ArrowRight size={12} />
        </button>
      </div>
      <div style={{ padding: '0 20px' }}>
        <SyncBadge info={auto.lastLessonSync}     label="Lesson Sync (Google Calendar)" />
        <SyncBadge info={auto.lastMemberSync}     label="Member Sync (Discord → Portal)" />
        <SyncBadge info={auto.lastCalendarSync}   label="Calendar Sync (Class Discovery)" />
        <SyncBadge info={auto.lastAttendanceSync} label="Attendance Sync (Voice)" />
      </div>
      {/* Manual trigger buttons */}
      <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-soft)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          className="btn btn--ghost"
          style={{ fontSize: 12 }}
          disabled={!!syncing}
          onClick={() => onTriggerSync('sync_members')}
        >
          <RefreshCw size={12} style={{ animation: syncing === 'sync_members' ? 'spin 1s linear infinite' : 'none' }} />
          Sync Members
        </button>
        <button
          className="btn btn--ghost"
          style={{ fontSize: 12 }}
          disabled={!!syncing}
          onClick={() => onTriggerSync('sync_lessons')}
        >
          <RefreshCw size={12} style={{ animation: syncing === 'sync_lessons' ? 'spin 1s linear infinite' : 'none' }} />
          Sync Calendar
        </button>
        <button
          className="btn btn--ghost"
          style={{ fontSize: 12 }}
          disabled={!!syncing}
          onClick={() => onTriggerSync('sync_attendance')}
        >
          <RefreshCw size={12} style={{ animation: syncing === 'sync_attendance' ? 'spin 1s linear infinite' : 'none' }} />
          Sync Attendance
        </button>
      </div>
    </div>

    <div className="card card--flush">
      <div className="card__head">
        <div className="card__title">Bot Job Queue</div>
      </div>
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Pending jobs</span>
          <span className="tnum" style={{ fontSize: 18, fontWeight: 700, color: auto.pendingBotJobs > 0 ? 'var(--info)' : 'var(--fg-muted)' }}>
            {auto.pendingBotJobs}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Failed jobs</span>
          <span className="tnum" style={{ fontSize: 18, fontWeight: 700, color: auto.failedBotJobs > 0 ? 'var(--danger)' : 'var(--fg-muted)' }}>
            {auto.failedBotJobs}
          </span>
        </div>
        {auto.lastError && (
          <div style={{
            padding: '10px 12px', borderRadius: 8, fontSize: 12, color: 'var(--danger)',
            background: 'color-mix(in oklab, var(--danger) 10%, transparent)',
            border: '1px solid color-mix(in oklab, var(--danger) 20%, transparent)',
          }}>
            <div style={{ fontWeight: 700, marginBottom: 3 }}>Last error</div>
            {auto.lastError}
          </div>
        )}
        {auto.failedBotJobs === 0 && auto.pendingBotJobs === 0 && !auto.lastError && (
          <div style={{ color: 'var(--fg-muted)', fontSize: 13 }}>
            <CheckCircle size={14} style={{ verticalAlign: 'middle', marginRight: 6, color: 'var(--ok)' }} />
            Queue is clear
          </div>
        )}
        {syncing && (
          <div style={{ fontSize: 12, color: 'var(--info)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }} />
            Queuing {syncing.replace('_', ' ')} job…
          </div>
        )}
        <button className="btn btn--ghost" style={{ marginTop: 4 }} onClick={() => onNav('/dashboard/admin/bot-health')}>
          <Wifi size={13} /> View Bot Health
        </button>
      </div>
    </div>
  </div>
);

// ── Section 7: Activity Feed ───────────────────────────────────────────────

const ActivityFeed: React.FC<{ activity: AdminOverviewData['recentActivity'] }> = ({ activity }) => (
  <div className="card card--flush">
    <div className="card__head">
      <div>
        <div className="card__title">Recent Activity</div>
        <div className="card__sub">Last {activity.length} events recorded server-side</div>
      </div>
    </div>
    {activity.length === 0 ? (
      <EmptyCard
        icon={<Activity size={20} />}
        message="No server-side activity recorded yet."
        sub="Activity will appear here as actions are taken in the CRM. Check AuditLog table in Supabase."
      />
    ) : (
      <div>
        {activity.map(a => (
          <div key={a.id} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 20px', borderBottom: '1px solid var(--border-soft)',
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8, flexShrink: 0,
              background: 'var(--bg-surface-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--fg-muted)',
            }}>
              {activityIcon(a.entityType, a.action)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-strong)' }}>
                <span style={{ textTransform: 'capitalize' }}>{a.action}</span>
                {a.entityName && <> · <span style={{ color: 'var(--fg-muted)', fontWeight: 400 }}>{a.entityName}</span></>}
              </div>
              <div className="muted" style={{ fontSize: 12 }}>
                {a.actorName ? `by ${a.actorName}` : `by ${a.actorType}`}
                {' · '}{a.entityType}
              </div>
            </div>
            <div className="tnum muted" style={{ fontSize: 11.5, flexShrink: 0 }}>
              {relTime(a.createdAt)}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

// ── Loading skeleton page ──────────────────────────────────────────────────

const LoadingSkeleton: React.FC = () => (
  <div className="section-stack">
    <div className="row row--3">
      <SkeletonCard /><SkeletonCard /><SkeletonCard />
    </div>
    <div className="row row--2">
      <SkeletonCard /><SkeletonCard />
    </div>
    <div className="row row--4">
      <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
    </div>
  </div>
);

// ── Main component ─────────────────────────────────────────────────────────

const AdminOverview: React.FC = () => {
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const [data, setData]       = useState<AdminOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);

  const nav = useCallback((path: string) => navigate(path), [navigate]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const d = await adminApi.getOverview();
      setData(d);
      setLastRefreshed(new Date());
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load overview data. Check network connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const triggerSync = useCallback(async (type: 'sync_members' | 'sync_classes' | 'sync_lessons' | 'sync_attendance') => {
    if (syncing) return;
    setSyncing(type);
    try {
      await adminApi.triggerBotSync(type);
      // Give the bot ~3 s to claim the job, then refresh sync status
      setTimeout(() => { load(); setSyncing(null); }, 3000);
    } catch {
      setSyncing(null);
    }
  }, [syncing, load]);

  const firstName = getFirstName(user?.name ?? 'there');

  return (
    <div className="section-stack">

      {/* ── Page head ────────────────────────────────────────────────── */}
      <div className="page-head">
        <div>
          <div className="page-head__eyebrow">{getTodayLabel()}</div>
          <h1 className="page-head__title">
            Good {getGreeting()}, <span className="accent-text">{firstName}</span>.
          </h1>
          <p className="page-head__sub">
            {loading
              ? 'Loading overview…'
              : data
                ? (() => {
                    const parts: string[] = [];
                    if (data.schedule.today.length > 0)
                      parts.push(`${data.schedule.today.length} lesson${data.schedule.today.length !== 1 ? 's' : ''} today`);
                    if (data.financials.countOverdue > 0)
                      parts.push(`${data.financials.countOverdue} overdue payment${data.financials.countOverdue !== 1 ? 's' : ''}`);
                    if (data.actions.priorityAlerts.length > 0)
                      parts.push(`${data.actions.priorityAlerts.length} open alert${data.actions.priorityAlerts.length !== 1 ? 's' : ''}`);
                    if (data.summary.unreadMessages > 0)
                      parts.push(`${data.summary.unreadMessages} unread message${data.summary.unreadMessages !== 1 ? 's' : ''}`);
                    return parts.length > 0 ? parts.join(' · ') : 'Everything looks quiet today.';
                  })()
                : 'Could not load data.'}
          </p>
        </div>
        <div className="page-head__actions">
          <button className="btn btn--ghost" onClick={load} disabled={loading}>
            <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            {loading ? 'Loading…' : lastRefreshed ? `Refreshed ${relTime(lastRefreshed.toISOString())}` : 'Refresh'}
          </button>
        </div>
      </div>

      {/* ── Error banner ────────────────────────────────────────────── */}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 12,
          background: 'color-mix(in oklab, var(--danger) 10%, transparent)',
          border: '1px solid color-mix(in oklab, var(--danger) 24%, transparent)',
          color: 'var(--danger)', fontSize: 13.5, fontWeight: 500,
        }}>
          <WifiOff size={16} />
          <span style={{ flex: 1 }}>{error}</span>
          <button className="btn btn--ghost" style={{ fontSize: 12 }} onClick={load}>Retry</button>
        </div>
      )}

      {/* ── Loading ─────────────────────────────────────────────────── */}
      {loading && !data && <LoadingSkeleton />}

      {/* ── Content ─────────────────────────────────────────────────── */}
      {data && !loading && (
        <>
          {/* ── S1: Action Centre ─────────────────────────────────── */}
          <div>
            <SectionHeader title="Immediate Action Centre" sub="Items that require your attention now" onNav={nav} />
            <div className="row row--3">
              <OverduePaymentsCard data={data.financials} onNav={nav} />
              <TutorPayCard        data={data.financials} onNav={nav} />
              <PriorityAlertsCard  alerts={data.actions.priorityAlerts} onNav={nav} />
            </div>
          </div>

          {/* ── S2: Schedule ──────────────────────────────────────── */}
          <div>
            <SectionHeader
              title="Schedule"
              sub="Today and the next 7 days"
              action={{ label: 'Full Calendar', path: '/dashboard/calendar' }}
              onNav={nav}
            />
            <div className="row row--2">
              {/* Today */}
              <div className="card card--flush">
                <div className="card__head">
                  <div>
                    <div className="card__title">Today</div>
                    <div className="card__sub">
                      {data.schedule.today.length} lesson{data.schedule.today.length !== 1 ? 's' : ''} scheduled
                      {data.schedule.today.filter(l => l.status === 'live').length > 0
                        ? ` · ${data.schedule.today.filter(l => l.status === 'live').length} live now` : ''}
                    </div>
                  </div>
                  <button className="btn btn--quiet" onClick={() => nav('/dashboard/admin/lessons')}>
                    Lessons <ArrowRight size={12} />
                  </button>
                </div>
                {data.schedule.today.length === 0
                  ? <EmptyCard icon={<Calendar size={20} />} message="No lessons scheduled today." sub="Check calendar sync or add lessons manually." />
                  : <div>{data.schedule.today.map(l => <LessonRow key={l.id} lesson={l} onNav={nav} />)}</div>}
              </div>

              {/* Next 7 days */}
              <div className="card card--flush">
                <div className="card__head">
                  <div>
                    <div className="card__title">Next 7 Days</div>
                    <div className="card__sub">{data.schedule.upcoming.length} upcoming lesson{data.schedule.upcoming.length !== 1 ? 's' : ''}</div>
                  </div>
                </div>
                {data.schedule.upcoming.length === 0
                  ? <EmptyCard icon={<Calendar size={20} />} message="No upcoming lessons in the next 7 days." sub="Check Google Calendar sync is running." />
                  : <div>{data.schedule.upcoming.map(l => <LessonRow key={l.id} lesson={l} onNav={nav} showDate />)}</div>}
              </div>
            </div>
          </div>

          {/* ── S3: Financial Snapshot ────────────────────────────── */}
          <div>
            <SectionHeader
              title="Financial Snapshot"
              sub="Revenue in · Tutor cost out · Net position"
              action={{ label: 'Payments', path: '/dashboard/admin/payments' }}
              onNav={nav}
            />
            <FinancialSection data={data.financials} onNav={nav} />
          </div>

          {/* ── S4: Student & Tutor Snapshot ──────────────────────── */}
          <div>
            <SectionHeader
              title="Business Snapshot"
              sub="Current scale — students, tutors, classes, parents"
              action={{ label: 'Students', path: '/dashboard/admin/students' }}
              onNav={nav}
            />
            <SnapshotSection summary={data.summary} onNav={nav} />
          </div>

          {/* ── S5: Risk ──────────────────────────────────────────── */}
          <div>
            <SectionHeader
              title="Academic & Operations Risk"
              sub="Top 5 issues requiring intervention"
              onNav={nav}
            />
            <RiskSection risk={data.risk} onNav={nav} />
          </div>

          {/* ── S6: Automation Health ─────────────────────────────── */}
          <div>
            <SectionHeader
              title="Automation Health"
              sub="Discord bot · Google Calendar · Sync pipeline"
              action={{ label: 'Bot Health', path: '/dashboard/admin/bot-health' }}
              onNav={nav}
            />
            <AutomationSection auto={data.automation} onNav={nav} onTriggerSync={triggerSync} syncing={syncing} />
          </div>

          {/* ── S7: Activity Feed ─────────────────────────────────── */}
          <div>
            <SectionHeader
              title="Recent Activity"
              sub="Server-side audit log — last 15 events"
              action={{ label: 'Audit Log', path: '/dashboard/admin/audit-log' }}
              onNav={nav}
            />
            <ActivityFeed activity={data.recentActivity} />
          </div>
        </>
      )}

    </div>
  );
};

export default AdminOverview;
