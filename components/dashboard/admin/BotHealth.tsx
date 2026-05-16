import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Activity, Database, Users, CalendarDays, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { portalApi, HealthStatus } from '../../../services/portalApi';

const StatTile: React.FC<{ icon: React.ElementType; label: string; value: string | number; sub?: string }> = ({
  icon: Icon, label, value, sub,
}) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-start gap-4">
    <div className="w-10 h-10 rounded-xl bg-[#FFB000]/10 flex items-center justify-center flex-shrink-0">
      <Icon size={20} className="text-[#FFB000]" />
    </div>
    <div>
      <div className="text-2xl font-bold ryze-text-inverse">{value}</div>
      <div className="text-sm ryze-text-muted mt-0.5">{label}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  </div>
);

export const BotHealth: React.FC = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await portalApi.getHealth();
      setHealth(data);
      setLastFetched(new Date());
    } catch (e: any) {
      setError(e.message ?? 'Failed to reach the bot API.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 60_000); // auto-refresh every 60s
    return () => clearInterval(interval);
  }, [fetchHealth]);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold ryze-text-inverse">Bot Health</h2>
          <p className="ryze-text-muted mt-1 text-sm">
            Live status of the Discord bot and database.
            {lastFetched && (
              <span className="ml-2 text-slate-500">
                Last updated {lastFetched.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={fetchHealth}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm ryze-text-muted hover:ryze-text-inverse transition-all disabled:opacity-50"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex items-start gap-4">
          <AlertTriangle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-red-300">Cannot reach bot API</div>
            <div className="text-sm text-red-400/80 mt-1">{error}</div>
            <div className="text-xs text-slate-500 mt-2">
              Make sure the FastAPI server is running: <code className="bg-white/5 px-1 rounded">uvicorn bot.api.app:app --port 8000</code>
            </div>
          </div>
        </div>
      )}

      {health && (
        <>
          {/* Status banner */}
          <div className={`rounded-2xl p-5 border flex items-center gap-4 ${
            health.status === 'ok'
              ? 'bg-emerald-500/10 border-emerald-500/20'
              : 'bg-amber-500/10 border-amber-500/20'
          }`}>
            {health.status === 'ok'
              ? <CheckCircle2 size={22} className="text-emerald-400 flex-shrink-0" />
              : <AlertTriangle size={22} className="text-amber-400 flex-shrink-0" />}
            <div>
              <div className={`font-bold ${health.status === 'ok' ? 'text-emerald-300' : 'text-amber-300'}`}>
                {health.status === 'ok' ? 'All systems operational' : 'Degraded — check bot logs'}
              </div>
              <div className="text-sm text-slate-400 mt-0.5">
                Database: {health.db_ok ? 'Connected' : 'Unreachable'}
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatTile icon={Users} label="Active Students" value={health.student_count} />
            <StatTile icon={Database} label="Class Groups" value={health.class_count} />
            <StatTile icon={CalendarDays} label="Upcoming Lessons" value={health.upcoming_lessons} sub="next 30 days" />
          </div>
        </>
      )}

      {loading && !health && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}
    </motion.div>
  );
};
