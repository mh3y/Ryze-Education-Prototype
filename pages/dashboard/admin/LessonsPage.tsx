/**
 * LessonsPage — /dashboard/admin/lessons
 * Ryze Portal redesign — studio-lane timeline view.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowRight, TrendingUp } from 'lucide-react';
import { adminApi, LessonListItem } from '../../../services/adminApi';

// ---------------------------------------------------------------------------
// Types & helpers
// ---------------------------------------------------------------------------

type LessonState = 'upcoming' | 'live' | 'done';

interface ScheduleBlock {
  id: string | number;
  room: string;
  start: number;  // fractional hour, e.g. 16 = 4pm, 17.5 = 5:30pm
  end: number;
  title: string;
  tutor: string;
  state: LessonState;
}

const HOURS = ['09','10','11','12','13','14','15','16','17','18','19','20'];
const ROOMS  = ['Studio A', 'Studio B', 'Studio C'];
const COL_W  = 88; // px per hour
const START_HOUR = 9;

function getTodayLabel(): string {
  return ('Today · ' + new Date().toLocaleDateString('en-AU', {
    weekday: 'short', day: 'numeric', month: 'short',
    timeZone: 'Australia/Sydney',
  })).toUpperCase();
}

type TagVariant = 'info' | 'accent' | 'default';
const tagStyles: Record<TagVariant, React.CSSProperties> = {
  info:    { color: 'var(--info)',   background: 'color-mix(in oklab, var(--info) 14%, transparent)',   border: '1px solid color-mix(in oklab, var(--info) 28%, transparent)' },
  accent:  { color: 'var(--accent)', background: 'var(--accent-soft)', border: '1px solid color-mix(in oklab, var(--accent) 26%, transparent)' },
  default: { color: 'var(--fg-muted)', background: 'var(--bg-surface-2)', border: '1px solid var(--border-soft)' },
};
function stateTagStyle(state: LessonState): [TagVariant, string] {
  if (state === 'live')     return ['accent', 'Live now'];
  if (state === 'upcoming') return ['info',   'Upcoming'];
  return ['default', 'Done'];
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_BLOCKS: ScheduleBlock[] = [
  { id: 1, room: 'Studio A', start: 16,   end: 17.5, title: 'Foundations',      tutor: 'Marcus Webb',  state: 'upcoming' },
  { id: 2, room: 'Studio A', start: 18,   end: 19.5, title: 'Maths Advanced',   tutor: 'Daniel Kwok',  state: 'upcoming' },
  { id: 3, room: 'Studio B', start: 17,   end: 18.5, title: 'Maths Ext 1',      tutor: 'Daniel Kwok',  state: 'live' },
  { id: 4, room: 'Studio B', start: 10,   end: 11.5, title: 'OC Prep · Make-up',tutor: 'Aria Singh',   state: 'done' },
  { id: 5, room: 'Studio C', start: 19,   end: 20.5, title: 'Maths Ext 2',      tutor: 'Priya Aiyar',  state: 'upcoming' },
  { id: 6, room: 'Studio C', start: 11,   end: 12,   title: '1:1 Intro',        tutor: 'Priya Aiyar',  state: 'done' },
];

// ---------------------------------------------------------------------------
// StatTile
// ---------------------------------------------------------------------------

const StatTile: React.FC<{ label: string; value: string; deltaText?: string; footRight?: string }> = ({ label, value, deltaText, footRight }) => (
  <div style={{
    background: 'var(--bg-surface)', border: '1px solid var(--border-faint)',
    borderRadius: 14, minHeight: 134, padding: '18px 20px',
    display: 'flex', flexDirection: 'column', gap: 14,
    boxShadow: 'var(--shadow-card)', transition: 'border-color 140ms ease',
  }}
  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)'; }}
  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-faint)'; }}
  >
    <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--fg-muted)' }}>{label}</div>
    <div style={{ fontFamily: '"Cormorant Garamond","Times New Roman",serif', fontStyle: 'italic', fontWeight: 500, fontSize: 44, color: 'var(--fg-strong)', lineHeight: 1, fontFeatureSettings: '"tnum" 1' }}>
      {value}
    </div>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
      {deltaText ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--ok)' }}>
          <TrendingUp size={12} /> {deltaText}
        </span>
      ) : <span />}
      {footRight && <span style={{ color: 'var(--fg-faint)' }}>{footRight}</span>}
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Segmented control
// ---------------------------------------------------------------------------

const Seg: React.FC<{ active: string; options: string[]; onChange: (v: string) => void }> = ({ active, options, onChange }) => (
  <div style={{
    display: 'flex',
    background: 'var(--bg-surface-2)',
    border: '1px solid var(--border-soft)',
    borderRadius: 9, padding: 3, gap: 2,
  }}>
    {options.map((o) => (
      <button
        key={o}
        onClick={() => onChange(o)}
        style={{
          height: 28, padding: '0 12px', borderRadius: 7,
          fontSize: 13, fontWeight: 600,
          background: active === o ? 'var(--bg-elevated)' : 'transparent',
          color: active === o ? 'var(--fg-strong)' : 'var(--fg-muted)',
          border: active === o ? '1px solid var(--border-soft)' : '1px solid transparent',
          cursor: 'pointer', transition: 'all 140ms ease',
        }}
      >
        {o}
      </button>
    ))}
  </div>
);

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const LessonsPage: React.FC = () => {
  const navigate = useNavigate();
  const [view, setView] = useState('Day');
  const [lessons, setLessons]   = useState<LessonListItem[]>([]);
  const [loading, setLoading]   = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getLessons({ limit: 100 });
      setLessons(data.items);
    } catch {
      // silently fall back to mock data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Convert API lessons to schedule blocks if available
  const blocks: ScheduleBlock[] = lessons.length > 0
    ? lessons.slice(0, 6).map((l, i) => {
        const rooms = ['Studio A', 'Studio B', 'Studio C'];
        const startDate = l.start_time ? new Date(l.start_time) : new Date();
        const endDate   = l.end_time   ? new Date(l.end_time)   : new Date(startDate.getTime() + 90 * 60_000);
        const start = startDate.getHours() + startDate.getMinutes() / 60;
        const end   = endDate.getHours()   + endDate.getMinutes()   / 60;
        const state: LessonState = l.status === 'active' ? 'live' : l.status === 'completed' ? 'done' : 'upcoming';
        return {
          id: l.id,
          room: rooms[i % rooms.length],
          start: Math.max(START_HOUR, Math.min(start, 20)),
          end:   Math.min(end, 20.5),
          title: l.title,
          tutor: l.class_group_name ?? '',
          state,
        };
      })
    : MOCK_BLOCKS;

  const liveCount     = blocks.filter(b => b.state === 'live').length;
  const upcomingCount = blocks.filter(b => b.state === 'upcoming').length;
  const doneCount     = blocks.filter(b => b.state === 'done').length;

  const btnStyle: React.CSSProperties = {
    height: 38, padding: '0 14px', borderRadius: 9,
    fontSize: 13, fontWeight: 600,
    display: 'flex', alignItems: 'center', gap: 8,
    cursor: 'pointer', border: 'none',
    transition: 'transform 140ms ease',
  };

  // Block fill colours by state
  function blockBg(state: LessonState): React.CSSProperties {
    if (state === 'live')     return { background: 'var(--accent-soft)',   border: '1px solid color-mix(in oklab, var(--accent) 30%, transparent)' };
    if (state === 'upcoming') return { background: 'color-mix(in oklab, var(--info) 14%, transparent)', border: '1px solid color-mix(in oklab, var(--info) 28%, transparent)' };
    return { background: 'var(--bg-surface-2)', border: '1px solid var(--border-soft)' };
  }
  function blockTitleColor(state: LessonState): string {
    if (state === 'live')     return 'var(--accent)';
    if (state === 'upcoming') return 'var(--info)';
    return 'var(--fg-muted)';
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>

      {/* PageHead */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 10 }}>
            {getTodayLabel()}
          </div>
          <h1 style={{
            fontFamily: '"Cormorant Garamond","Times New Roman",serif',
            fontStyle: 'italic', fontWeight: 500,
            fontSize: 'clamp(38px, 3.5vw, 54px)',
            lineHeight: 1.08, letterSpacing: '-0.018em',
            color: 'var(--fg-strong)', margin: 0,
          }}>
            Lessons
          </h1>
          <p style={{ fontSize: 14, color: 'var(--fg-muted)', marginTop: 10, marginBottom: 0 }}>
            The day, by studio. Click any block to manage attendance and homework.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <Seg active={view} options={['Day', 'Week', 'Month']} onChange={setView} />
          <button style={{ ...btnStyle, background: 'var(--accent)', color: 'var(--accent-fg)', boxShadow: '0 6px 18px -10px color-mix(in oklab, var(--accent) 70%, transparent)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ''; }}>
            <Plus size={14} /> Schedule
          </button>
        </div>
      </div>

      {/* Stat row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--gap-md)' }}
           className="grid-cols-2 sm:grid-cols-4">
        <StatTile label="Lessons today" value={String(blocks.length).padStart(2, '0')} footRight={`${liveCount} live now`} />
        <StatTile label="Attendance"    value="92%"  deltaText="+3 vs last wk" />
        <StatTile label="Make-ups owed" value="03"   footRight="2 booked" />
        <StatTile label="Empty seats"   value="07"   footRight="across 4 lessons" />
      </div>

      {/* Schedule card */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-faint)',
        borderRadius: 16, boxShadow: 'var(--shadow-card)',
        overflow: 'hidden',
      }}>
        {/* Card head */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 22px',
          borderBottom: '1px solid var(--border-faint)',
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-strong)' }}>Schedule · by studio</div>
            <div style={{ fontSize: 12.5, color: 'var(--fg-muted)', marginTop: 2 }}>
              {ROOMS.length} studios · {blocks.length} lessons · {liveCount} live
            </div>
          </div>
          <button
            onClick={() => navigate('/dashboard/admin/lessons')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 13, color: 'var(--fg-muted)',
              background: 'transparent', border: 'none', cursor: 'pointer',
              transition: 'color 140ms ease',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--fg-strong)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--fg-muted)'; }}
          >
            Print roster <ArrowRight size={13} />
          </button>
        </div>

        {/* Schedule grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', overflow: 'hidden' }}>
          {/* Rooms column */}
          <div style={{ borderRight: '1px solid var(--border-faint)' }}>
            {/* Corner spacer */}
            <div style={{ height: 40, borderBottom: '1px solid var(--border-faint)' }} />
            {ROOMS.map((r) => (
              <div key={r} style={{
                height: 72, padding: '0 20px',
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                borderBottom: '1px solid var(--border-faint)',
              }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--fg-strong)' }}>{r}</div>
                <div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>Capacity 10</div>
              </div>
            ))}
          </div>

          {/* Timeline column */}
          <div style={{ overflowX: 'auto', scrollbarWidth: 'thin', scrollbarColor: 'var(--border-strong) transparent' }}>
            <div style={{ width: COL_W * HOURS.length + 1, minWidth: COL_W * HOURS.length + 1 }}>
              {/* Hour ruler */}
              <div style={{
                display: 'flex', height: 40,
                borderBottom: '1px solid var(--border-faint)',
              }}>
                {HOURS.map((h) => (
                  <div key={h} style={{
                    width: COL_W, flexShrink: 0,
                    display: 'flex', alignItems: 'center',
                    paddingLeft: 8,
                    borderLeft: '1px dashed var(--border-faint)',
                    fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--fg-faint)',
                    fontFeatureSettings: '"tnum" 1',
                  }}>
                    {h}:00
                  </div>
                ))}
              </div>

              {/* Lane rows */}
              {ROOMS.map((room) => {
                const roomBlocks = blocks.filter(b => b.room === room);
                return (
                  <div key={room} style={{
                    position: 'relative',
                    height: 72,
                    borderBottom: '1px solid var(--border-faint)',
                    display: 'flex',
                  }}>
                    {/* Dashed vertical lines */}
                    {HOURS.map((_, i) => (
                      <div key={i} style={{
                        width: COL_W, flexShrink: 0,
                        borderLeft: '1px dashed var(--border-faint)',
                      }} />
                    ))}

                    {/* Lesson blocks */}
                    {roomBlocks.map((b) => {
                      const [tagVariant, tagLabel] = stateTagStyle(b.state);
                      const blockStyle = blockBg(b.state);
                      const isLive = b.state === 'live';
                      return (
                        <div
                          key={b.id}
                          className={isLive ? 'portal-pulse' : ''}
                          style={{
                            position: 'absolute',
                            top: 6,
                            bottom: 6,
                            left: (b.start - START_HOUR) * COL_W,
                            width: (b.end - b.start) * COL_W - 4,
                            borderRadius: 8,
                            padding: '6px 8px',
                            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                            cursor: 'pointer',
                            overflow: 'hidden',
                            transition: 'opacity 140ms ease',
                            ...blockStyle,
                          }}
                          onClick={() => navigate('/dashboard/admin/lessons')}
                        >
                          <div style={{ fontSize: 12.5, fontWeight: 600, color: blockTitleColor(b.state), lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {b.title}
                          </div>
                          <div style={{ fontSize: 11.5, color: blockTitleColor(b.state), opacity: 0.85, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {b.tutor}
                          </div>
                          <div style={{ alignSelf: 'flex-start' }}>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center',
                              fontSize: 10, fontWeight: 600, letterSpacing: '0.04em',
                              padding: '2px 6px', borderRadius: 999,
                              ...tagStyles[tagVariant],
                            }}>
                              {tagLabel}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonsPage;
