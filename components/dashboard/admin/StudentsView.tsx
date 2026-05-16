import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Users, UserCheck, UserX, ChevronLeft, ChevronRight } from 'lucide-react';
import { portalApi, UserRecord } from '../../../services/portalApi';

const ROLE_COLOURS: Record<string, string> = {
  student: 'bg-blue-500/20 text-blue-300',
  tutor: 'bg-purple-500/20 text-purple-300',
  admin: 'bg-[#FFB000]/20 text-[#FFB000]',
  parent: 'bg-emerald-500/20 text-emerald-300',
};

const PAGE_SIZE = 20;

export const StudentsView: React.FC = () => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    portalApi
      .getStudents({ role: roleFilter || undefined, skip: page * PAGE_SIZE, limit: PAGE_SIZE })
      .then(res => {
        setUsers(res.items);
        setTotal(res.total);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [page, roleFilter]);

  const filtered = search
    ? users.filter(u => u.full_name.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()))
    : users;

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold ryze-text-inverse">Members</h2>
        <p className="ryze-text-muted mt-1 text-sm">All users registered with the bot — {total} total.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 ryze-text-muted" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm ryze-text-inverse placeholder-slate-500 focus:border-[#FFB000]/40 outline-none transition"
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => { setRoleFilter(e.target.value); setPage(0); }}
          className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm ryze-text-inverse focus:border-[#FFB000]/40 outline-none"
        >
          <option value="">All roles</option>
          <option value="student">Student</option>
          <option value="tutor">Tutor</option>
          <option value="admin">Admin</option>
          <option value="parent">Parent</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-300">{error}</div>
      )}

      {/* Table */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-6 py-4 ryze-text-muted font-medium">Name</th>
              <th className="text-left px-6 py-4 ryze-text-muted font-medium hidden md:table-cell">Email</th>
              <th className="text-left px-6 py-4 ryze-text-muted font-medium">Role</th>
              <th className="text-left px-6 py-4 ryze-text-muted font-medium hidden lg:table-cell">Discord ID</th>
              <th className="text-left px-6 py-4 ryze-text-muted font-medium">Status</th>
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
              : filtered.map(u => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#FFB000]/20 flex items-center justify-center text-[#FFB000] font-bold text-xs flex-shrink-0">
                          {u.full_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="ryze-text-inverse font-medium truncate">{u.full_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 ryze-text-muted hidden md:table-cell">{u.email ?? '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${ROLE_COLOURS[u.role] ?? 'bg-white/10 text-slate-300'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 ryze-text-muted font-mono text-xs hidden lg:table-cell">{u.discord_user_id}</td>
                    <td className="px-6 py-4">
                      {u.active
                        ? <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium"><UserCheck size={13} /> Active</span>
                        : <span className="flex items-center gap-1.5 text-slate-500 text-xs font-medium"><UserX size={13} /> Inactive</span>}
                    </td>
                  </tr>
                ))}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center ryze-text-muted">
                  <Users size={32} className="mx-auto mb-3 opacity-30" />
                  No members found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm ryze-text-muted">
          <span>Page {page + 1} of {totalPages} ({total} members)</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 transition"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 transition"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};
