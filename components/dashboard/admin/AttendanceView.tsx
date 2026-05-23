import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, ChevronLeft, ChevronRight, Mic, RefreshCw } from 'lucide-react';
import { portalApi, AttendanceRecord } from '../../../services/portalApi';

// ── Types ────────────────────────────────────────────────────────────────────

interface VoiceSession {
  id:                 number;
  discord_user_id:    string;
  discord_username:   string | null;
  discord_channel_id: string | null;
  discord_channel:    string | null;
  joined_at:          string;
  left_at:            string | null;
  duration_minutes:   number | null;
  status:             string;
  lesson_id:          number | null;
  lesson_title:       string | null;
  crm_user_id:        number | null;
  crm_user_name:      string | null;
  crm_user_role:      string | null;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, string> = {
  present:    'bg-emerald-500/20 text-emerald-300',
  late:       'bg-amber-500/20 text-amber-300',
  left_early: 'bg-orange-500/20 text-orange-300',
  absent:     'bg-red-500/20 text-red-300',
  unknown:    'bg-slate-500/20 text-slate-400',
};

const VOICE_STATUS_BADGE: Record<string, string> = {
  active:    'bg-emerald-500/20 text-emerald-300',
  completed: 'bg-blue-500/20 text-blue-300',
  unknown:   'bg-slate-500/20 text-slate-400',
};

const ROLE_BADGE: Record<string, string> = {
  tutor:   'bg-purple-500/20 text-purple-300',
  student: 'bg-blue-500/20 text-blue-300',
  admin:   'bg-amber-500/20 text-amber-300',
};

function fmtTime(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-AU', {
    hour: '2-digit', minute: '2-digit', timeZone: 'Australia/Sydney',
  });
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-AU', {
    day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Australia/Sydney',
  });
}

function todayAEST(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Australia/Sydney' }); // YYYY-MM-DD
}

const PAGE_SIZE = 25;

// ── Sub-components ───────────────────────────────────────────────────────────

const CrmAttendanceTab: React.FC = () => {
  const [records, setRecords]       = useState<AttendanceRecord[]>([]);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(0);
  const [statusFilter, setStatus]   = useState('');
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    portalApi
      .getAttendance({ status: statusFilter || undefined, skip: page * PAGE_SIZE, limit: PAGE_SIZE })
      .then(res => { setRecords(res.items); setTotal(res.total); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [page, statusFilter]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="ryze-text-muted text-sm">{total} record{total !== 1 ? 's' : ''}</p>
        <select
          value={statusFilter}
          onChange={e => { setStatus(e.target.value); setPage(0); }}
          className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm ryze-text-inverse focus:border-[#FFB000]/40 outline-none"
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
              ? Array.from({ length: 6 }).map((_, i) => (
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
    </div>
  );
};

const DiscordVoiceTab: React.FC = () => {
  const [sessions, setSessions]   = useState<VoiceSession[]>([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(0);
  const [date, setDate]           = useState(todayAEST());
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  const load = (d: string, p: number) => {
    setLoading(true);
    setError(null);
    fetch(`/api/admin/attendance/voice-sessions?date=${d}&skip=${p * PAGE_SIZE}&limit=${PAGE_SIZE}`, {
      credentials: 'include',
    })
      .then(r => r.ok ? r.json() : r.json().then((e: any) => Promise.reject(e.detail ?? 'Error')))
      .then((data: { total: number; items: VoiceSession[] }) => {
        setSessions(data.items);
        setTotal(data.total);
      })
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(date, page); }, [date, page]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <p className="ryze-text-muted text-sm flex-1">{total} session{total !== 1 ? 's' : ''}</p>
        <input
          type="date"
          value={date}
          onChange={e => { setDate(e.target.value); setPage(0); }}
          className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm ryze-text-inverse focus:border-[#FFB000]/40 outline-none"
        />
        <button
          onClick={() => load(date, page)}
          className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition ryze-text-muted"
          title="Refresh"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-300">{error}</div>
      )}

      <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-6 py-4 ryze-text-muted font-medium">User</th>
              <th className="text-left px-6 py-4 ryze-text-muted font-medium hidden sm:table-cell">Channel</th>
              <th className="text-left px-6 py-4 ryze-text-muted font-medium">Status</th>
              <th className="text-left px-6 py-4 ryze-text-muted font-medium hidden md:table-cell">Joined</th>
              <th className="text-left px-6 py-4 ryze-text-muted font-medium hidden md:table-cell">Left</th>
              <th className="text-left px-6 py-4 ryze-text-muted font-medium hidden lg:table-cell">Duration</th>
              <th className="text-left px-6 py-4 ryze-text-muted font-medium hidden xl:table-cell">Lesson</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td colSpan={7} className="px-6 py-4">
                      <div className="h-4 bg-white/5 rounded animate-pulse w-3/4" />
                    </td>
                  </tr>
                ))
              : sessions.map(s => {
                  const displayName = s.crm_user_name ?? s.discord_username ?? s.discord_user_id;
                  const isUnmatched = !s.crm_user_id;
                  return (
                    <tr key={s.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div>
                            <p className={`font-medium ${isUnmatched ? 'text-amber-400/80' : 'ryze-text-inverse'}`}>
                              {displayName}
                            </p>
                            {isUnmatched && (
                              <p className="text-xs text-amber-400/50 mt-0.5">Unmatched Discord user</p>
                            )}
                          </div>
                          {s.crm_user_role && (
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${ROLE_BADGE[s.crm_user_role] ?? 'bg-white/10 text-slate-300'}`}>
                              {s.crm_user_role}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 ryze-text-muted text-xs hidden sm:table-cell">
                        {s.discord_channel ?? '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${VOICE_STATUS_BADGE[s.status] ?? 'bg-white/10 text-slate-300'}`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 ryze-text-muted text-xs hidden md:table-cell">
                        <span title={fmtDate(s.joined_at)}>{fmtTime(s.joined_at)}</span>
                      </td>
                      <td className="px-6 py-4 ryze-text-muted text-xs hidden md:table-cell">
                        {fmtTime(s.left_at)}
                      </td>
                      <td className="px-6 py-4 ryze-text-muted text-xs hidden lg:table-cell">
                        {s.duration_minutes != null ? `${s.duration_minutes} min` : s.status === 'active' ? '⏱ Active' : '—'}
                      </td>
                      <td className="px-6 py-4 ryze-text-muted text-xs hidden xl:table-cell">
                        {s.lesson_title ?? <span className="text-slate-600 italic">No lesson</span>}
                      </td>
                    </tr>
                  );
                })}
            {!loading && sessions.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center ryze-text-muted">
                  <Mic size={32} className="mx-auto mb-3 opacity-30" />
                  <p>No Discord voice sessions for {date}.</p>
                  <p className="text-xs mt-1 opacity-60">Sessions appear here as soon as the bot records a voice join/leave.</p>
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
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

type TabId = 'crm' | 'voice';

export const AttendanceView: React.FC = () => {
  const [tab, setTab] = useState<TabId>('voice'); // default to voice — most useful without class setup

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'voice', label: 'Discord Voice',   icon: <Mic size={15} /> },
    { id: 'crm',   label: 'CRM Attendance',  icon: <ClipboardList size={15} /> },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold ryze-text-inverse">Attendance</h2>
        <p className="ryze-text-muted mt-1 text-sm">
          Discord voice activity is the source of truth until class allocation is fully configured.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white/5 border border-white/10 rounded-xl w-fit">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id
                ? 'bg-[#FFB000]/20 text-[#FFB000] border border-[#FFB000]/30'
                : 'ryze-text-muted hover:ryze-text-inverse hover:bg-white/5'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'voice' && <DiscordVoiceTab />}
      {tab === 'crm'   && <CrmAttendanceTab />}
    </motion.div>
  );
};
