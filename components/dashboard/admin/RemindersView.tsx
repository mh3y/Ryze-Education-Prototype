import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCircle2, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { portalApi, ReminderLog } from '../../../services/portalApi';

const PAGE_SIZE = 30;

const TYPE_BADGE: Record<string, string> = {
  '24h': 'bg-blue-500/20 text-blue-300',
  '1h': 'bg-purple-500/20 text-purple-300',
  '15min': 'bg-[#FFB000]/20 text-[#FFB000]',
  cancelled: 'bg-red-500/20 text-red-300',
};

function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-AU', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Australia/Sydney',
  });
}

export const RemindersView: React.FC = () => {
  const [logs, setLogs] = useState<ReminderLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [typeFilter, setTypeFilter] = useState('');
  const [successFilter, setSuccessFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    portalApi
      .getReminders({
        reminder_type: typeFilter || undefined,
        success: successFilter === '' ? undefined : successFilter === 'true',
        skip: page * PAGE_SIZE,
        limit: PAGE_SIZE,
      })
      .then(res => {
        setLogs(res.items);
        setTotal(res.total);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [page, typeFilter, successFilter]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold ryze-text-inverse">Reminder Logs</h2>
        <p className="ryze-text-muted mt-1 text-sm">{total} reminder log{total !== 1 ? 's' : ''} found.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={typeFilter}
          onChange={e => { setTypeFilter(e.target.value); setPage(0); }}
          className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm ryze-text-inverse focus:border-[#FFB000]/40 outline-none"
        >
          <option value="">All types</option>
          <option value="24h">24 hours</option>
          <option value="1h">1 hour</option>
          <option value="15min">15 minutes</option>
          <option value="cancelled">Cancellation</option>
        </select>
        <select
          value={successFilter}
          onChange={e => { setSuccessFilter(e.target.value); setPage(0); }}
          className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm ryze-text-inverse focus:border-[#FFB000]/40 outline-none"
        >
          <option value="">Sent & failed</option>
          <option value="true">Sent only</option>
          <option value="false">Failed only</option>
        </select>
      </div>

      {error && (
        <div className="border rounded-xl p-4 text-sm" style={{ background: 'color-mix(in oklab, var(--danger) 10%, transparent)', borderColor: 'color-mix(in oklab, var(--danger) 20%, transparent)', color: 'var(--danger)' }}>{error}</div>
      )}

      <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-6 py-4 ryze-text-muted font-medium">Sent At</th>
              <th className="text-left px-6 py-4 ryze-text-muted font-medium">Type</th>
              <th className="text-left px-6 py-4 ryze-text-muted font-medium hidden md:table-cell">Channel</th>
              <th className="text-left px-6 py-4 ryze-text-muted font-medium hidden md:table-cell">Lesson</th>
              <th className="text-left px-6 py-4 ryze-text-muted font-medium">Result</th>
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
              : logs.map(r => (
                  <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 text-xs ryze-text-muted tabular-nums">{fmtDateTime(r.sent_at)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${TYPE_BADGE[r.reminder_type] ?? 'bg-white/10 text-slate-300'}`}>
                        {r.reminder_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 ryze-text-muted text-xs capitalize hidden md:table-cell">
                      {r.channel.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4 ryze-text-muted text-xs hidden md:table-cell">
                      {r.lesson_title ?? `Lesson #${r.lesson_id}`}
                    </td>
                    <td className="px-6 py-4">
                      {r.success ? (
                        <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--ok)' }}>
                          <CheckCircle2 size={13} /> Sent
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs" title={r.error_message ?? ''} style={{ color: 'var(--danger)' }}>
                          <XCircle size={13} /> Failed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
            {!loading && logs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center ryze-text-muted">
                  <Bell size={32} className="mx-auto mb-3 opacity-30" />
                  No reminder logs found.
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
