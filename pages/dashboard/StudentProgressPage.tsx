/**
 * StudentProgressPage — /dashboard/reports for students.
 * Loads live progress report data from GET /api/student/portal via studentApi.
 */

import React, { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { studentApi, StudentPortalPayload } from '../../services/studentApi';

const btnGhost: React.CSSProperties = { height: 38, padding: '0 14px', borderRadius: 9, fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--bg-surface)', color: 'var(--fg-default)', border: '1px solid var(--border-soft)', cursor: 'pointer', transition: 'transform 140ms ease' };

function formatPublishedDate(iso: string | null): string {
  if (!iso) return '';
  const d    = new Date(iso);
  const diff = Date.now() - d.getTime();
  if (diff < 86_400_000)   return 'Today';
  if (diff < 172_800_000)  return 'Yesterday';
  if (diff < 604_800_000)  return `${Math.round(diff / 86_400_000)} days ago`;
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

const StudentProgressPage: React.FC = () => {
  const [portal, setPortal]   = useState<StudentPortalPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    studentApi.getPortal()
      .then(setPortal)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load progress reports.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const reports      = portal?.reports         ?? [];
  const attendance   = portal?.attendance;
  const latestReport = reports[0]              ?? null;
  const pastReports  = reports.slice(1);

  const avgScore = reports.filter(r => r.score !== null).length > 0
    ? Math.round(reports.filter(r => r.score !== null).reduce((s, r) => s + (r.score ?? 0), 0) / reports.filter(r => r.score !== null).length)
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 10 }}>
          Reports
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'var(--font-display-style)', fontWeight: 'var(--font-display-weight)' as any, fontSize: 'clamp(38px, 3.5vw, 54px)', lineHeight: 1.08, letterSpacing: '-0.018em', color: 'var(--fg-strong)', margin: 0 }}>Progress</h1>
            <p style={{ fontSize: 14, color: 'var(--fg-muted)', margin: '10px 0 0' }}>
              Tutor-written progress reports and your attendance record.
            </p>
          </div>
          {error && (
            <button onClick={load} style={{ ...btnGhost, gap: 6 }}>
              <RefreshCw size={13} /> Retry
            </button>
          )}
        </div>
      </div>

      {/* Stat row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--gap-md)' }}>
        {[
          { label: 'Reports published', value: loading ? '…' : String(reports.length).padStart(2, '0') },
          { label: 'Average score',     value: loading ? '…' : avgScore !== null ? `${avgScore}%` : '—' },
          { label: 'Attendance',        value: loading ? '…' : attendance?.rate !== null && attendance?.rate !== undefined ? `${attendance.rate}%` : '—', footRight: attendance ? `${attendance.total_lessons} lessons` : undefined },
        ].map(({ label, value, footRight }) => (
          <div key={label} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-faint)', borderRadius: 14, minHeight: 134, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14, boxShadow: 'var(--shadow-card)' }}>
            <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--fg-muted)' }}>{label}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'var(--font-display-style)', fontWeight: 'var(--font-display-weight)' as any, fontSize: 44, color: 'var(--fg-strong)', lineHeight: 1, fontFeatureSettings: '"tnum" 1' }}>{value}</div>
            {footRight && <div style={{ fontSize: 12, color: 'var(--fg-faint)' }}>{footRight}</div>}
          </div>
        ))}
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--fg-muted)', fontSize: 14 }}>Loading reports…</div>
      )}

      {error && !loading && (
        <div style={{ color: 'var(--danger)', fontSize: 14, padding: 20 }}>{error}</div>
      )}

      {!loading && !error && reports.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--fg-muted)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No reports published yet</div>
          <div style={{ fontSize: 14 }}>Your tutor will publish your progress report here once it's ready.</div>
        </div>
      )}

      {!loading && reports.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '8fr 4fr', gap: 'var(--gap-md)' }}>
          {/* Latest report */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-faint)', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--border-faint)' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-strong)' }}>
                {latestReport?.period ?? latestReport?.class_name ?? 'Latest report'}
              </div>
              {latestReport?.published_at && (
                <div style={{ fontSize: 12.5, color: 'var(--fg-muted)', marginTop: 2 }}>
                  Published {formatPublishedDate(latestReport.published_at)}
                  {latestReport.class_name ? ` · ${latestReport.class_name}` : ''}
                </div>
              )}
            </div>
            <div style={{ padding: '22px' }}>
              {latestReport && (
                <div style={{ display: 'flex', gap: 24, marginBottom: 20 }}>
                  {latestReport.score !== null && (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 6 }}>Score</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'var(--font-display-style)', fontSize: 36, color: 'var(--accent)', fontWeight: 'var(--font-display-weight)' as any, lineHeight: 1 }}>
                        {latestReport.score}%
                      </div>
                    </div>
                  )}
                  {latestReport.grade && (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 6 }}>Grade</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'var(--font-display-style)', fontSize: 36, color: 'var(--fg-strong)', fontWeight: 'var(--font-display-weight)' as any, lineHeight: 1 }}>
                        {latestReport.grade}
                      </div>
                    </div>
                  )}
                  {latestReport.score === null && !latestReport.grade && (
                    <div style={{ fontSize: 14, color: 'var(--fg-muted)', fontStyle: 'italic' }}>
                      No score recorded — see your tutor for feedback.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Past reports + attendance */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-faint)', borderRadius: 16, padding: 'var(--card-pad)', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-strong)', marginBottom: 4 }}>Past reports</div>
            <div style={{ fontSize: 12.5, color: 'var(--fg-muted)', marginBottom: 16 }}>
              {pastReports.length > 0 ? `${pastReports.length} previous report${pastReports.length === 1 ? '' : 's'}` : 'No previous reports'}
            </div>

            {pastReports.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 20 }}>
                {pastReports.map((r) => (
                  <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-faint)' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-strong)' }}>
                      {r.period ?? r.class_name ?? `Report ${r.id}`}
                    </span>
                    <span style={{ fontSize: 12.5, color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)', fontFeatureSettings: '"tnum" 1' }}>
                      {r.grade ?? (r.score !== null ? `${r.score}%` : '—')}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {attendance && (
              <>
                <div style={{ height: 1, background: 'var(--border-faint)', margin: '4px 0 16px' }} />
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-strong)', marginBottom: 12 }}>Attendance</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {attendance.recent.slice(0, 5).map((a, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12.5 }}>
                      <span style={{ color: 'var(--fg-default)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>
                        {a.lesson_title}
                      </span>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 999,
                        color: a.status === 'present' || a.status === 'late' ? 'var(--ok)' : a.status === 'absent' ? 'var(--danger)' : 'var(--fg-muted)',
                        background: a.status === 'present' || a.status === 'late' ? 'color-mix(in oklab, var(--ok) 12%, transparent)' : a.status === 'absent' ? 'color-mix(in oklab, var(--danger) 12%, transparent)' : 'var(--bg-hover)',
                      }}>
                        {a.status}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProgressPage;
