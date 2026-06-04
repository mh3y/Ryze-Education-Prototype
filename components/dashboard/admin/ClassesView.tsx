import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, User } from 'lucide-react';
import { portalApi, ClassGroup } from '../../../services/portalApi';

export const ClassesView: React.FC = () => {
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [total, setTotal] = useState(0);
  const [activeOnly, setActiveOnly] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    portalApi
      .getClasses({ active: activeOnly || undefined, limit: 200 })
      .then(res => {
        setClasses(res.items);
        setTotal(res.total);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [activeOnly]);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold ryze-text-inverse">Class Groups</h2>
          <p className="ryze-text-muted mt-1 text-sm">{total} class group{total !== 1 ? 's' : ''} found.</p>
        </div>
        <label className="flex items-center gap-2 text-sm ryze-text-muted cursor-pointer select-none">
          <input
            type="checkbox"
            checked={activeOnly}
            onChange={e => setActiveOnly(e.target.checked)}
            className="accent-[#FFB000] w-4 h-4"
          />
          Active only
        </label>
      </div>

      {error && (
        <div className="border rounded-xl p-4 text-sm" style={{ background: 'color-mix(in oklab, var(--danger) 10%, transparent)', borderColor: 'color-mix(in oklab, var(--danger) 20%, transparent)', color: 'var(--danger)' }}>{error}</div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {classes.map(cls => (
            <div
              key={cls.id}
              className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 hover:border-[#FFB000]/20 hover:bg-white/[0.05] transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#FFB000]/10 flex items-center justify-center group-hover:bg-[#FFB000]/20 transition-colors">
                  <BookOpen size={18} className="text-[#FFB000]" />
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${cls.active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-slate-400'}`}>
                  {cls.active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <h3 className="font-bold ryze-text-inverse text-base leading-tight mb-1">{cls.name}</h3>
              {(cls.year_level || cls.subject) && (
                <p className="text-xs ryze-text-muted mb-4">
                  {[cls.year_level, cls.subject].filter(Boolean).join(' · ')}
                </p>
              )}

              <div className="flex items-center justify-between text-sm border-t border-white/5 pt-4">
                <div className="flex items-center gap-1.5 ryze-text-muted">
                  <Users size={14} />
                  <span>{cls.member_count} member{cls.member_count !== 1 ? 's' : ''}</span>
                </div>
                {cls.tutor && (
                  <div className="flex items-center gap-1.5 text-purple-300 text-xs">
                    <User size={13} />
                    <span>{cls.tutor.full_name}</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {classes.length === 0 && (
            <div className="col-span-full py-16 text-center ryze-text-muted">
              <BookOpen size={40} className="mx-auto mb-4 opacity-30" />
              No class groups found.
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};
