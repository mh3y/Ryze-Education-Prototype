/**
 * StudentCoursesPage — /dashboard/courses for students.
 * Redesigned to match design handoff spec.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, TrendingUp, TrendingDown } from 'lucide-react';

const btnGhost: React.CSSProperties = { height: 38, padding: '0 14px', borderRadius: 9, fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--bg-surface)', color: 'var(--fg-default)', border: '1px solid var(--border-soft)', cursor: 'pointer', transition: 'transform 140ms ease' };
const btnQuiet: React.CSSProperties = { height: 34, padding: '0 10px', borderRadius: 8, fontSize: 12, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'transparent', color: 'var(--fg-muted)', border: 'none', cursor: 'pointer', transition: 'color 140ms ease' };

const STUDENT_COURSES = [
  { id: 'ext1', name: 'Maths Extension 1', tutor: 'Daniel Kwok', next: 'Tue 5:00pm', progress: 78, topic: 'Inverse trig differentiation', level: 'Year 12 · HSC track' },
  { id: 'ext2', name: 'Maths Extension 2', tutor: 'Priya Aiyar', next: 'Thu 7:00pm', progress: 65, topic: 'Mechanics: projectile motion',   level: 'Year 12 · HSC track' },
];

const StudentCoursesPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 10 }}>Enrolled</div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'var(--font-display-style)', fontWeight: 'var(--font-display-weight)' as any, fontSize: 'clamp(38px, 3.5vw, 54px)', lineHeight: 1.08, letterSpacing: '-0.018em', color: 'var(--fg-strong)', margin: 0 }}>Courses</h1>
            <p style={{ fontSize: 14, color: 'var(--fg-muted)', margin: '10px 0 0' }}>Your active courses, term progress and the lessons your tutor has planned next.</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--gap-md)' }}>
        {STUDENT_COURSES.map((c) => (
          <div key={c.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-faint)', borderRadius: 16, padding: 'var(--card-pad)', boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fg-muted)' }}>{c.tutor}</div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', padding: '4px 9px', borderRadius: 999, color: 'var(--accent)', background: 'var(--accent-soft)', border: '1px solid color-mix(in oklab, var(--accent) 26%, transparent)' }}>
                Next · {c.next}
              </span>
            </div>

            <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'var(--font-display-style)', fontWeight: 'var(--font-display-weight)' as any, fontSize: 32, color: 'var(--fg-strong)', marginTop: 10, lineHeight: 1.1 }}>{c.name}</div>
            <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginTop: 6 }}>{c.level}</div>

            <div style={{ height: 1, background: 'var(--border-faint)', margin: '20px 0 16px' }} />

            <div style={{ fontSize: 12.5, color: 'var(--fg-muted)', marginBottom: 8 }}>Current topic</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg-strong)' }}>{c.topic}</div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16 }}>
              <div style={{ flex: 1, height: 6, borderRadius: 999, background: 'var(--bg-surface-2)', border: '1px solid var(--border-faint)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${c.progress}%`, background: 'linear-gradient(90deg, var(--accent), color-mix(in oklab, var(--accent) 65%, #fff))', borderRadius: 999 }} />
              </div>
              <span style={{ fontSize: 12.5, fontFamily: 'var(--font-mono)', color: 'var(--fg-muted)', fontFeatureSettings: '"tnum" 1' }}>{c.progress}%</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--fg-faint)', marginTop: 6 }}>Through the term syllabus</div>

            <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
              <button style={btnGhost} onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }} onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ''; }}>
                Lesson plan <ArrowUpRight size={13} />
              </button>
              <button style={btnQuiet}>Past lessons</button>
              <button style={btnQuiet}>Resources</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentCoursesPage;
