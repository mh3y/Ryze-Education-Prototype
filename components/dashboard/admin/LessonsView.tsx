import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Link2, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { portalApi, Lesson } from '../../../services/portalApi';

const STATUS_BADGE: Record<string, string> = {
  scheduled: 'bg-blue-500/20 text-blue-300',
  active: 'bg-emerald-500/20 text-emerald-300',
  completed: 'bg-slate-500/20 text-slate-400',
  cancelled: 'bg-red-500/20 text-red-300',
};

const PAGE_SIZE = 25;

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('en-AU', {
    weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit', timeZone: 'Australia/Sydney',
  });
}

export const LessonsView: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [upcomingOnly, setUpcomingOnly] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    portalApi
      .getLessons({
        status: statusFilter || undefined,
        upcoming_only: upcomingOnly || undefined,
        skip: page * PAGE_SIZE,
        limit: PAGE_SIZE,
      })
      .then(res => {
        setLessons(res.items);
        setTotal(res.total);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [page, statusFilter, upcomingOnly]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold ryze-text-inverse">Lessons</h2>
        <p className="ryze-text-muted mt-1 text-sm">{total} lesson{total !== 1 ? 's' : ''} found.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
          className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm ryze-text-inverse focus:border-[#FFB000]/40 outline-none"
        >
          <option value="">All statuses</option>
          <option value="scheduled">Scheduled</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm ryze-text-muted cursor-pointer select-none">
          <input
            type="checkbox"
            checked={upcomingOnly}
            onChange={e => { setUpcomingOnly(e.target.checked); setPage(0); }}
            className="accent-[#FFB000] w-4 h-4"
          />
          Upcoming only
        </label>
      </div>

      {error && (
        <div className="border rounded-xl p-4 text-sm" style={{ background: 'color-mix(in oklab, var(--danger) 10%, transparent)', borderColor: 'color-mix(in oklab, var(--danger) 20%, transparent)', color: 'var(--danger)' }}>{error}</div>
      )}

      {/* Table */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-6 py-4 ryze-text-muted font-medium">Lesson</th>
              <th className="text-left px-6 py-4 ryze-text-muted font-medium hidden md:table-cell">Class</th>
              <th className="text-left px-6 py-4 ryze-text-muted font-medium">Start Time</th>
              <th className="text-left px-6 py-4 ryze-text-muted font-medium">Status</th>
              <th className="text-left px-6 py-4 ryze-text-muted font-medium hidden lg:table-cell">Link / Location</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td colSpan={5} className="px-6 py-4">
                      <div className="h-4 bg-white/5 rounded animate-pulse w-3/4" />
                    </td>
                  </tr>
                ))
              : lessons.map(l => (
                  <tr key={l.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <CalendarDays size={15} className="text-[#FFB000] flex-shrink-0 hidden sm:block" />
                        <span className="ryze-text-inverse font-medium">{l.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 ryze-text-muted hidden md:table-cell">{l.class_group_name}</td>
                    <td className="px-6 py-4 ryze-text-muted tabular-nums text-xs">{formatDateTime(l.start_time)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${STATUS_BADGE[l.status] ?? 'bg-white/10 text-slate-300'}`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      {l.meet_link ? (
                        <a href={l.meet_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-xs transition-colors">
                          <Link2 size={12} /> Meet link
                        </a>
                      ) : l.location ? (
                        <span className="flex items-center gap-1.5 ryze-text-muted text-xs">
                          <MapPin size={12} /> {l.location}
                        </span>
                      ) : (
                        <span className="text-slate-600 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
            {!loading && lessons.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center ryze-text-muted">
                  <CalendarDays size={32} className="mx-auto mb-3 opacity-30" />
                  No lessons found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm ryze-text-muted">
          <span>Page {page + 1} of {totalPages}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 transition">
              <ChevronLeft size={15} />
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 transition">
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};
