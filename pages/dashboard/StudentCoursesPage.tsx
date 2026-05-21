/**
 * StudentCoursesPage — /dashboard/courses for students.
 * Loads live class data from GET /api/student/portal via studentApi.
 */

import React, { useEffect, useState } from 'react';
import { ArrowUpRight, RefreshCw } from 'lucide-react';
import { studentApi, StudentPortalPayload } from '../../services/studentApi';

const btnGhost: React.CSSProperties = { height: 38, padding: '0 14px', borderRadius: 9, fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--bg-surface)', color: 'var(--fg-default)', border: '1px solid var(--border-soft)', cursor: 'pointer', transition: 'transform 140ms ease' };
const btnQuiet: React.CSSProperties = { height: 34, padding: '0 10px', borderRadius: 8, fontSize: 12, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'transparent', color: 'var(--fg-muted)', border: 'none', cursor: 'pointer', transition: 'color 140ms ease' };

function formatNextLesson(iso: string): string {
  const d   = new Date(iso);
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  if (diff < 0) return 'In progress';
  if (diff < 3_600_000)   return `in ${Math.round(diff / 60_000)}m`;
  if (diff < 86_400_000)  return `${d.toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit', hour12: true })} today`;
  return d.toLocaleDateString('en-AU', { weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: true });
}

const StudentCoursesPage: React.FC = () => {
  const [portal, setPortal]   = useState<StudentPortalPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    studentApi.getPortal()
      .then(setPortal)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load courses.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const classes = portal?.classes ?? [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 10 }}>Enrolled</div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'var(--font-display-style)', fontWeight: 'var(--font-display-weight)' as any, fontSize: 'clamp(38px, 3.5vw, 54px)', lineHeight: 1.08, letterSpacing: '-0.018em', color: 'var(--fg-strong)', margin: 0 }}>Courses</h1>
            <p style={{ fontSize: 14, color: 'var(--fg-muted)', margin: '10px 0 0' }}>
              Your active courses and next scheduled lesson for each.
            </p>
          </div>
          {error && (
            <button onClick={load} style={{ ...btnGhost, gap: 6 }}>
              <RefreshCw size={13} /> Retry
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--gap-md)' }}>
          {[1, 2].map((i) => (
            <div key={i} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-faint)', borderRadius: 16, minHeight: 200, opacity: 0.4 }} />
          ))}
        </div>
      )}

      {error && !loading && (
        <div style={{ color: 'var(--danger)', fontSize: 14, padding: 20 }}>{error}</div>
      )}

      {!loading && !error && classes.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--fg-muted)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📚</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Not enrolled in any classes</div>
          <div style={{ fontSize: 14 }}>Contact your admin to get enrolled.</div>
        </div>
      )}

      {!loading && classes.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--gap-md)' }}>
          {classes.map((c) => (
            <div key={c.class_id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-faint)', borderRadius: 16, padding: 'var(--card-pad)', boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column', gap: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fg-muted)' }}>
                  {c.tutor_name ?? 'Tutor TBA'}
                </div>
                {c.next_lesson && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', padding: '4px 9px', borderRadius: 999, color: 'var(--accent)', background: 'var(--accent-soft)', border: '1px solid color-mix(in oklab, var(--accent) 26%, transparent)' }}>
                    Next · {formatNextLesson(c.next_lesson.scheduled_at)}
                  </span>
                )}
              </div>

              <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'var(--font-display-style)', fontWeight: 'var(--font-display-weight)' as any, fontSize: 32, color: 'var(--fg-strong)', marginTop: 10, lineHeight: 1.1 }}>
                {c.class_name}
              </div>
              {c.subject && (
                <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginTop: 6 }}>{c.subject}</div>
              )}

              {c.next_lesson && (
                <>
                  <div style={{ height: 1, background: 'var(--border-faint)', margin: '20px 0 16px' }} />
                  <div style={{ fontSize: 12.5, color: 'var(--fg-muted)', marginBottom: 6 }}>Next lesson</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-strong)' }}>{c.next_lesson.title}</div>
                </>
              )}

              <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
                <button
                  style={btnGhost}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ''; }}
                >
                  Lesson plan <ArrowUpRight size={13} />
                </button>
                <button style={btnQuiet}>Resources</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentCoursesPage;
