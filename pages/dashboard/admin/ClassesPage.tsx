/**
 * ClassesPage — /dashboard/admin/classes
 * Ryze Portal redesign — class card grid.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Plus, ArrowUpRight } from 'lucide-react';
import { adminApi, ClassGroupListItem } from '../../../services/adminApi';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type TagVariant = 'ok' | 'warn' | 'default';
function classStateVariant(active: boolean, seats?: string): TagVariant {
  if (!active) return 'default';
  if (seats === 'low') return 'warn';
  return 'ok';
}

const tagStyles: Record<TagVariant, React.CSSProperties> = {
  ok:      { color: 'var(--ok)',     background: 'color-mix(in oklab, var(--ok) 12%, transparent)',   border: '1px solid color-mix(in oklab, var(--ok) 26%, transparent)' },
  warn:    { color: 'var(--warn)',   background: 'color-mix(in oklab, var(--warn) 12%, transparent)', border: '1px solid color-mix(in oklab, var(--warn) 26%, transparent)' },
  default: { color: 'var(--fg-default)', background: 'var(--bg-hover)', border: '1px solid var(--border-soft)' },
};

const StatusTag: React.FC<{ variant: TagVariant; label: string }> = ({ variant, label }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center',
    fontSize: 11, fontWeight: 600, letterSpacing: '0.04em',
    padding: '4px 9px', borderRadius: 999,
    ...tagStyles[variant],
  }}>
    {label}
  </span>
);

// ---------------------------------------------------------------------------
// Mock data for display when API data lacks the extra fields
// ---------------------------------------------------------------------------

const MOCK_CLASSES = [
  { id: 'ext1-tue', name: 'Maths Extension 1',  level: 'Year 12 — HSC',  tutor: 'Daniel Kwok',   day: 'TUE', time: '5:00 pm', seats: '8 / 8',   rev: '$3,200/wk', state: 'running' as const },
  { id: 'ext2-thu', name: 'Maths Extension 2',  level: 'Year 12 — HSC',  tutor: 'Priya Aiyar',   day: 'THU', time: '7:00 pm', seats: '6 / 8',   rev: '$2,400/wk', state: 'running' as const },
  { id: 'adv-mon',  name: 'Maths Advanced',     level: 'Year 11',        tutor: 'Daniel Kwok',   day: 'MON', time: '6:00 pm', seats: '9 / 10',  rev: '$2,700/wk', state: 'running' as const },
  { id: 'fnd-wed',  name: 'Foundations',        level: 'Year 10',        tutor: 'Marcus Webb',   day: 'WED', time: '4:00 pm', seats: '7 / 10',  rev: '$1,890/wk', state: 'running' as const },
  { id: 'sel-sat',  name: 'Selective Prep',     level: 'Year 9',         tutor: 'Priya Aiyar',   day: 'SAT', time: '9:00 am', seats: '10 / 12', rev: '$2,500/wk', state: 'running' as const },
  { id: 'oc-sun',   name: 'OC Prep',            level: 'Year 5',         tutor: 'Aria Singh',    day: 'SUN', time: '10:00 am',seats: '5 / 12',  rev: '$1,200/wk', state: 'low-seat' as const },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const ClassesPage: React.FC = () => {
  const navigate = useNavigate();

  const [items, setItems]     = useState<ClassGroupListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getClasses({ limit: 200, active: true });
      setItems(data.items);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load classes.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Map API items into display shape, or fall back to mock
  const displayClasses = items.length > 0
    ? items.map((c) => ({
        id: String(c.id),
        name: c.name,
        level: [c.year_level, c.subject].filter(Boolean).join(' · ') || '—',
        tutor: c.tutor?.full_name ?? '—',
        day: '—',
        time: '—',
        seats: `${c.member_count} enrolled`,
        rev: '—',
        state: (c.active ? 'running' : 'inactive') as 'running' | 'low-seat' | 'inactive',
      }))
    : MOCK_CLASSES;

  const btnStyle: React.CSSProperties = {
    height: 38, padding: '0 14px', borderRadius: 9,
    fontSize: 13, fontWeight: 600,
    display: 'flex', alignItems: 'center', gap: 8,
    cursor: 'pointer', border: 'none',
    transition: 'transform 140ms ease',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>

      {/* PageHead */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 10 }}>
            Operations
          </div>
          <h1 style={{
            fontFamily: '"Cormorant Garamond", "Times New Roman", serif',
            fontStyle: 'italic', fontWeight: 500,
            fontSize: 'clamp(38px, 3.5vw, 54px)',
            lineHeight: 1.08, letterSpacing: '-0.018em',
            color: 'var(--fg-strong)', margin: 0,
          }}>
            Classes
          </h1>
          <p style={{ fontSize: 14, color: 'var(--fg-muted)', marginTop: 10, marginBottom: 0 }}>
            Recurring group sessions and their tutors. Click any class to manage roster, attendance and homework.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button style={{ ...btnStyle, background: 'var(--bg-surface)', color: 'var(--fg-default)', border: '1px solid var(--border-soft)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ''; }}>
            <CalendarDays size={14} /> Week view
          </button>
          <button style={{ ...btnStyle, background: 'var(--accent)', color: 'var(--accent-fg)', boxShadow: '0 6px 18px -10px color-mix(in oklab, var(--accent) 70%, transparent)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ''; }}>
            <Plus size={14} /> New class
          </button>
        </div>
      </div>

      {/* Loading / error state */}
      {loading && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 'var(--gap-md)',
        }}>
          {[1,2,3,4,5,6].map((i) => (
            <div key={i} style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-faint)',
              borderRadius: 16, padding: 20, minHeight: 220,
              opacity: 0.5,
            }} />
          ))}
        </div>
      )}

      {error && !loading && (
        <div style={{ color: 'var(--danger)', fontSize: 14, padding: 20 }}>{error}</div>
      )}

      {/* Class grid */}
      {!loading && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 'var(--gap-md)',
        }}>
          {displayClasses.map((c) => {
            const stateVariant: TagVariant = c.state === 'low-seat' ? 'warn' : c.state === 'running' ? 'ok' : 'default';
            const stateLabel = c.state === 'low-seat' ? 'Low seats' : c.state === 'running' ? 'Running' : 'Inactive';

            return (
              <div
                key={c.id}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-faint)',
                  borderRadius: 16,
                  padding: 20,
                  boxShadow: 'var(--shadow-card)',
                  display: 'flex', flexDirection: 'column', gap: 0,
                  cursor: 'pointer',
                  transition: 'transform 140ms ease, border-color 140ms ease, box-shadow 140ms ease',
                }}
                onClick={() => navigate(`/dashboard/admin/classes/${c.id}`)}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform = 'translateY(-2px)';
                  el.style.borderColor = 'var(--border-strong)';
                  el.style.boxShadow = '0 20px 40px -20px rgba(0,0,0,0.5)';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform = '';
                  el.style.borderColor = 'var(--border-faint)';
                  el.style.boxShadow = 'var(--shadow-card)';
                }}
              >
                {/* Header: day + status */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase',
                      background: 'var(--accent-soft)', color: 'var(--accent)',
                      padding: '3px 9px', borderRadius: 999,
                    }}>
                      {c.day}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-muted)', fontFeatureSettings: '"tnum" 1' }}>
                      {c.time}
                    </span>
                  </div>
                  <StatusTag variant={stateVariant} label={stateLabel} />
                </div>

                {/* Class name */}
                <div style={{
                  fontFamily: '"Cormorant Garamond", "Times New Roman", serif',
                  fontStyle: 'italic', fontWeight: 500, fontSize: 26,
                  color: 'var(--fg-strong)', lineHeight: 1.1, marginBottom: 6,
                }}>
                  {c.name}
                </div>

                {/* Level */}
                <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginBottom: 18 }}>
                  {c.level}
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: 'var(--border-faint)', marginBottom: 18 }} />

                {/* Meta grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 18 }}>
                  {[
                    { label: 'Tutor',   value: c.tutor },
                    { label: 'Seats',   value: c.seats },
                    { label: 'Revenue', value: c.rev },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 4 }}>
                        {label}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-default)', fontFeatureSettings: '"tnum" 1' }}>
                        {value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/admin/classes/${c.id}`); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      fontSize: 13, color: 'var(--fg-muted)',
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      transition: 'color 140ms ease',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--fg-strong)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--fg-muted)'; }}
                  >
                    Open <ArrowUpRight size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClassesPage;
