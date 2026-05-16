import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, ChevronLeft, ChevronRight } from 'lucide-react';
import { portalApi, AttendanceRecord } from '../../../services/portalApi';

const STATUS_BADGE: Record<string, string> = {
  present: 'bg-emerald-500/20 text-emerald-300',
  late: 'bg-amber-500/20 text-amber-300',
  left_early: 'bg-orange-500/20 text-orange-300',
  absent: 'bg-red-500/20 text-red-300',
  unknown: 'bg-slate-500/20 text-slate-400',
};

const PAGE_SIZE = 25;

function fmtTime(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', timeZone: 'Australia/Sydney' });
}

export const AttendanceView: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    portalApi
      .getAttendance({ status: statusFilter || undefined, skip: page * PAGE_SIZE, limit: PAGE_SIZE })
      .then(res => {
        setRecords(res.items);
        setTotal(res.total);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [page, statusFilter]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold ryze-text-inverse">Attendance</h2>
          <p className="ryze-text-muted mt-1 text-sm">{total} record{total !== 1 ? 's' : ''} found.</p>
        </div>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
          className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm ryze-text-inverse focus:border-[#FFB000]/40 outline-none"
        >
          <option value="">All statuses</option>
          <option value="present">Present</option>
          <option value="late">Late</option>
          <option value="left_early">Left Early</option>
          <option value="absent">Absent</option>
          <option value="unknown">Unknown</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-300">{error}</div>
      )}

      <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-6 py-4 ryze-text-muted font-medium">Student</th>
              <th className="text-left px-6 py-4 ryze-text-muted font-medium hidden md:table-cell">Lesson</th>
              <th className="text-left px-6 py-4 ryze-text-muted font-medium">Status</th>
              <th className="text-left px-6 py-4 ryze-text-muted font-medium hidden lg:table-cell">Joined</th>
              <th className="text-left px-6 py-4 ryze-text-muted font-medium hidden lg:table-cell">Left</th>
              <th className="text-left px-6 py-4 ryze-text-muted font-medium hidden xl:table-cell">Duration</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td colSpan={6} className="px-6 py-4">
                      <div className="h-4 bg-white/5 rounded animate-pulse w-3/4" />
                    </td>
                  </tr>
                ))
              : records.map(r => (
                  <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 ryze-text-inverse font-medium">{r.student_name}</td>
                    <td className="px-6 py-4 ryze-text-muted hidden md:table-cell">{r.lesson_title}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${STATUS_BADGE[r.status] ?? 'bg-white/10 text-slate-300'}`}>
                        {r.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 ryze-text-muted text-xs hidden lg:table-cell">{fmtTime(r.joined_at)}</td>
                    <td className="px-6 py-4 ryze-text-muted text-xs hidden lg:table-cell">{fmtTime(r.left_at)}</td>
                    <td className="px-6 py-4 ryze-text-muted text-xs hidden xl:table-cell">
                      {r.duration_minutes != null ? `${r.duration_minutes} min` : '—'}
                    </td>
                  </tr>
                ))}
            {!loading && records.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center ryze-text-muted">
                  <ClipboardList size={32} className="mx-auto mb-3 opacity-30" />
                  No attendance records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
