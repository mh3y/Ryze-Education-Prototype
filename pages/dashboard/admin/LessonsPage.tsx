/**
 * LessonsPage — /dashboard/admin/lessons
 * Ryze Portal redesign — studio-lane timeline view.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, ArrowRight } from 'lucide-react';
import { adminApi, LessonListItem } from '../../../services/adminApi';
import ScheduleLessonModal from '../../../components/dashboard/modals/ScheduleLessonModal';
import { PageHeader } from '../../../components/dashboard/ui/PageHeader';
import { StatCard } from '../../../components/dashboard/ui/StatCard';
import { StatusBadge } from '../../../components/dashboard/ui/StatusBadge';

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

function lessonState(state: LessonState): string {
  if (state === 'live')     return 'live';
  if (state === 'upcoming') return 'upcoming';
  return 'completed';
}

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
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState('Day');
  const [lessons, setLessons]     = useState<LessonListItem[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showSchedule, setShowSchedule] = useState(false);

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

  // Open modal when navigated here with ?new=1
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setShowSchedule(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Convert API lessons to schedule blocks
  const blocks: ScheduleBlock[] = lessons.map((l, i) => {
    const rooms = ['Studio A', 'Studio B', 'Studio C'];
    const startDate = l.start_time ? new Date(l.start_time) : new Date();
    const endDate   = l.end_time   ? new Date(l.end_time)   : new Date(startDate.getTime() + 90 * 60_000);
    const start = startDate.getHours() + startDate.getMinutes() / 60;
    const end   = endDate.getHours()   + endDate.getMinutes()   / 60;
    const state: LessonState = l.status === 'live' ? 'live' : l.status === 'completed' ? 'done' : 'upcoming';
    return {
      id: l.id,
      room: rooms[i % rooms.length],
      start: Math.max(START_HOUR, Math.min(start, 20)),
      end:   Math.min(end, 20.5),
      title: l.title,
      tutor: l.class_group_name ?? '',
      state,
    };
  });

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

      <PageHeader
        compact
        eyebrow={getTodayLabel()}
        title="Lessons"
        actions={<>
          <Seg active={view} options={['Day', 'Week', 'Month']} onChange={setView} />
          <button
            onClick={() => setShowSchedule(true)}
            style={{ ...btnStyle, background: 'var(--accent)', color: 'var(--accent-fg)', boxShadow: '0 6px 18px -10px color-mix(in oklab, var(--accent) 70%, transparent)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ''; }}>
            <Plus size={14} /> Schedule
          </button>
        </>}
      />

      {/* Stat row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--gap-md)' }}
           className="grid-cols-2 sm:grid-cols-4">
        <StatCard label="Lessons today" value={String(blocks.length).padStart(2, '0')} footRight={`${liveCount} live now`} />
        <StatCard label="Attendance"    value={loading ? '…' : '—'} />
        <StatCard label="Make-ups owed" value="—" />
        <StatCard label="Empty seats"   value="—" />
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
            onClick={() => window.print()}
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

        {/* Empty state */}
        {!loading && blocks.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--fg-muted)', fontSize: 14 }}>
            No lessons found for the current filter.
          </div>
        )}

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
                      const lessonBadgeValue = lessonState(b.state);
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
                          onClick={() => navigate(`/dashboard/admin/lessons/${b.id}`)}
                        >
                          <div style={{ fontSize: 12.5, fontWeight: 600, color: blockTitleColor(b.state), lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {b.title}
                          </div>
                          <div style={{ fontSize: 11.5, color: blockTitleColor(b.state), opacity: 0.85, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {b.tutor}
                          </div>
                          <div style={{ alignSelf: 'flex-start' }}>
                            <StatusBadge value={lessonBadgeValue} />
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
      {/* Schedule Lesson modal */}
      {showSchedule && (
        <ScheduleLessonModal
          onClose={() => setShowSchedule(false)}
          onCreated={() => { load(); }}
        />
      )}
    </div>
  );
};

export default LessonsPage;
