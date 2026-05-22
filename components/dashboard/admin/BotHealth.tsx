import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, Users, CalendarDays, BookOpen, RefreshCw,
  AlertTriangle, CheckCircle2, Clock, Play, Wifi, WifiOff,
  ClipboardList, ChevronDown, ChevronUp,
} from 'lucide-react';
import { adminApi, BotHealthResponse, BotSyncEntry } from '../../../services/adminApi';

// ── helpers ──────────────────────────────────────────────────────────────────

function fmtRelative(iso: string | null): string {
  if (!iso) return 'Never';
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(mins  / 60);
  const days  = Math.floor(hours / 24);
  if (diff < 60_000)   return 'Just now';
  if (mins  < 60)      return `${mins}m ago`;
  if (hours < 24)      return `${hours}h ago`;
  return `${days}d ago`;
}

function fmtAbsolute(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-AU', {
    dateStyle: 'short', timeStyle: 'short',
  });
}

function durationMs(entry: BotSyncEntry): string {
  if (!entry.completed_at || !entry.started_at) return '—';
  const ms = new Date(entry.completed_at).getTime() - new Date(entry.started_at).getTime();
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

const statusColour: Record<string, string> = {
  success: 'text-emerald-400',
  partial: 'text-amber-400',
  failed:  'text-red-400',
  running: 'text-blue-400',
};
const statusBg: Record<string, string> = {
  success: 'bg-emerald-500/10 border-emerald-500/20',
  partial: 'bg-amber-500/10  border-amber-500/20',
  failed:  'bg-red-500/10    border-red-500/20',
  running: 'bg-blue-500/10   border-blue-500/20',
};
const statusLabel: Record<string, string> = {
  success: 'Success',
  partial: 'Partial',
  failed:  'Failed',
  running: 'Running…',
};

// ── sub-components ────────────────────────────────────────────────────────────

interface SyncCardProps {
  label:        string;
  icon:         React.ElementType;
  syncType:     'sync_members' | 'sync_classes' | 'sync_lessons' | 'sync_attendance';
  entry:        BotSyncEntry | null;
  triggering:   boolean;
  onTrigger:    () => void;
}

const SyncCard: React.FC<SyncCardProps> = ({ label, icon: Icon, syncType: _syncType, entry, triggering, onTrigger }) => {
  const status = entry?.status ?? null;
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FFB000]/10 flex items-center justify-center flex-shrink-0">
            <Icon size={18} className="text-[#FFB000]" />
          </div>
          <span className="font-semibold ryze-text-inverse text-sm">{label}</span>
        </div>
        {status && (
          <span className={`text-xs font-medium ${statusColour[status] ?? 'text-slate-400'}`}>
            {statusLabel[status] ?? status}
          </span>
        )}
        {!status && (
          <span className="text-xs text-slate-500">No data yet</span>
        )}
      </div>

      {/* Stats */}
      {entry ? (
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-white/5 rounded-xl p-2">
            <div className="text-lg font-bold ryze-text-inverse">{entry.records_created}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Created</div>
          </div>
          <div className="bg-white/5 rounded-xl p-2">
            <div className="text-lg font-bold ryze-text-inverse">{entry.records_updated}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Updated</div>
          </div>
          <div className={`rounded-xl p-2 ${entry.records_failed > 0 ? 'bg-red-500/10' : 'bg-white/5'}`}>
            <div className={`text-lg font-bold ${entry.records_failed > 0 ? 'text-red-400' : 'ryze-text-inverse'}`}>
              {entry.records_failed}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Failed</div>
          </div>
        </div>
      ) : (
        <div className="text-xs text-slate-500 text-center py-2">
          Bot hasn't synced yet — click Sync Now below.
        </div>
      )}

      {/* Timestamps */}
      {entry && (
        <div className="text-xs text-slate-500 space-y-0.5">
          <div className="flex justify-between">
            <span>Last sync</span>
            <span className="text-slate-400">{fmtRelative(entry.completed_at ?? entry.started_at)}</span>
          </div>
          <div className="flex justify-between">
            <span>Duration</span>
            <span className="text-slate-400">{durationMs(entry)}</span>
          </div>
          {entry.portal_api_url && (
            <div className="flex justify-between">
              <span>Target</span>
              <span className="text-slate-400 truncate max-w-[160px]">{entry.portal_api_url.replace('https://', '')}</span>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {entry?.error_message && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-400">
          {entry.error_message}
        </div>
      )}

      {/* Trigger button */}
      <button
        onClick={onTrigger}
        disabled={triggering}
        className="flex items-center justify-center gap-2 w-full py-2 px-3 bg-[#FFB000]/10 hover:bg-[#FFB000]/20 border border-[#FFB000]/20 rounded-xl text-sm text-[#FFB000] font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {triggering
          ? <RefreshCw size={14} className="animate-spin" />
          : <Play size={14} />
        }
        {triggering ? 'Queuing…' : 'Sync Now'}
      </button>
    </div>
  );
};

// ── main component ────────────────────────────────────────────────────────────

export const BotHealth: React.FC = () => {
  const [health,      setHealth]      = useState<BotHealthResponse | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [triggering,  setTriggering]  = useState<Record<string, boolean>>({});
  const [triggerMsg,  setTriggerMsg]  = useState<string | null>(null);
  const [showJobs,    setShowJobs]    = useState(false);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getBotHealth();
      setHealth(data);
      setLastFetched(new Date());
    } catch (e: any) {
      setError(e.message ?? 'Failed to fetch bot health.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 60_000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  const handleTrigger = async (syncType: 'sync_members' | 'sync_classes' | 'sync_lessons' | 'sync_attendance') => {
    if (triggering[syncType]) return;
    setTriggering(t => ({ ...t, [syncType]: true }));
    setTriggerMsg(null);
    try {
      await adminApi.triggerBotSync(syncType);
      setTriggerMsg(`✓ ${syncType.replace('sync_', '').replace('_', ' ')} sync job queued — bot will pick it up within 30s`);
      setTimeout(fetchHealth, 3000);
    } catch (e: any) {
      setTriggerMsg(`✗ Failed to queue job: ${e.message ?? 'unknown error'}`);
    } finally {
      setTriggering(t => ({ ...t, [syncType]: false }));
    }
  };

  // Overall status
  const allEntries = health
    ? Object.values(health.sync_summary).filter(Boolean) as BotSyncEntry[]
    : [];
  const hasAnyFailure = allEntries.some(e => e.status === 'failed');
  const hasAnySynced  = allEntries.length > 0;

  const overallStatus = !hasAnySynced
    ? 'unknown'
    : hasAnyFailure
    ? 'degraded'
    : 'ok';

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold ryze-text-inverse">Bot Sync Health</h2>
          <p className="ryze-text-muted mt-1 text-sm">
            Real-time status of Discord bot data syncs into Supabase.
            {lastFetched && (
              <span className="ml-2 text-slate-500">
                Refreshed {lastFetched.toLocaleTimeString()}
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

      {/* API error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex items-start gap-4">
          <AlertTriangle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-red-300">Cannot reach portal API</div>
            <div className="text-sm text-red-400/80 mt-1">{error}</div>
          </div>
        </div>
      )}

      {/* Trigger feedback */}
      {triggerMsg && (
        <div className={`rounded-2xl p-4 text-sm font-medium ${
          triggerMsg.startsWith('✓')
            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
            : 'bg-red-500/10 border border-red-500/20 text-red-300'
        }`}>
          {triggerMsg}
        </div>
      )}

      {/* Overall status banner */}
      {!loading && !error && (
        <div className={`rounded-2xl p-5 border flex items-center gap-4 ${
          overallStatus === 'ok'      ? 'bg-emerald-500/10 border-emerald-500/20' :
          overallStatus === 'degraded' ? 'bg-red-500/10 border-red-500/20'       :
                                         'bg-amber-500/10  border-amber-500/20'
        }`}>
          {overallStatus === 'ok'       && <CheckCircle2 size={22} className="text-emerald-400 flex-shrink-0" />}
          {overallStatus === 'degraded' && <AlertTriangle size={22} className="text-red-400    flex-shrink-0" />}
          {overallStatus === 'unknown'  && <Clock size={22}        className="text-amber-400   flex-shrink-0" />}
          <div className="flex-1">
            <div className={`font-bold ${
              overallStatus === 'ok'       ? 'text-emerald-300' :
              overallStatus === 'degraded' ? 'text-red-300'     :
                                             'text-amber-300'
            }`}>
              {overallStatus === 'ok'       ? 'All syncs healthy'          :
               overallStatus === 'degraded' ? 'One or more syncs failed'   :
                                              'No syncs recorded yet'}
            </div>
            <div className="text-sm text-slate-400 mt-0.5">
              {health?.last_any_sync
                ? `Last activity: ${fmtAbsolute(health.last_any_sync)}`
                : 'Run a sync from this page or trigger via Discord slash commands.'}
              {health?.portal_api_url && (
                <span className="ml-3 inline-flex items-center gap-1">
                  <Wifi size={12} className="text-emerald-400" />
                  <span className="text-emerald-400/80 text-xs">{health.portal_api_url.replace('https://', '')}</span>
                </span>
              )}
              {!health?.portal_api_url && hasAnySynced === false && (
                <span className="ml-3 inline-flex items-center gap-1">
                  <WifiOff size={12} className="text-amber-400" />
                  <span className="text-amber-400/80 text-xs">Bot target URL unknown — check OCI .env</span>
                </span>
              )}
            </div>
          </div>
          {(health?.jobs.pending ?? 0) > 0 && (
            <div className="text-xs bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full font-medium">
              {health!.jobs.pending} job{health!.jobs.pending === 1 ? '' : 's'} pending
            </div>
          )}
        </div>
      )}

      {/* 4 sync cards */}
      {!loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <SyncCard
            label="Discord Members"
            icon={Users}
            syncType="sync_members"
            entry={health?.sync_summary.members ?? null}
            triggering={!!triggering['sync_members']}
            onTrigger={() => handleTrigger('sync_members')}
          />
          <SyncCard
            label="Class Discovery"
            icon={BookOpen}
            syncType="sync_classes"
            entry={health?.sync_summary.classes ?? null}
            triggering={!!triggering['sync_classes']}
            onTrigger={() => handleTrigger('sync_classes')}
          />
          <SyncCard
            label="Calendar Lessons"
            icon={CalendarDays}
            syncType="sync_lessons"
            entry={health?.sync_summary.lessons ?? null}
            triggering={!!triggering['sync_lessons']}
            onTrigger={() => handleTrigger('sync_lessons')}
          />
          <SyncCard
            label="Attendance"
            icon={Activity}
            syncType="sync_attendance"
            entry={health?.sync_summary.attendance ?? null}
            triggering={!!triggering['sync_attendance']}
            onTrigger={() => handleTrigger('sync_attendance')}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-56 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Recent failures */}
      {(health?.recent_failures.length ?? 0) > 0 && (
        <div className="bg-red-500/5 border border-red-500/15 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-red-300 font-semibold">
            <AlertTriangle size={16} />
            Recent Sync Failures
          </div>
          <div className="space-y-2">
            {health!.recent_failures.map(f => (
              <div key={f.id} className="flex items-start justify-between gap-4 text-sm">
                <div>
                  <span className="font-medium text-red-300 capitalize">{f.sync_type}</span>
                  {f.error_message && (
                    <span className="text-slate-400 ml-2">— {f.error_message}</span>
                  )}
                </div>
                <span className="text-slate-500 flex-shrink-0">{fmtRelative(f.created_at)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bot jobs section (collapsible) */}
      {health && (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <button
            onClick={() => setShowJobs(j => !j)}
            className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <ClipboardList size={18} className="text-[#FFB000]" />
              <span className="font-semibold ryze-text-inverse text-sm">Bot Jobs Queue</span>
              {health.jobs.pending > 0 && (
                <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">
                  {health.jobs.pending} pending
                </span>
              )}
              {health.jobs.failed > 0 && (
                <span className="text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full">
                  {health.jobs.failed} failed
                </span>
              )}
            </div>
            {showJobs
              ? <ChevronUp size={16} className="text-slate-400" />
              : <ChevronDown size={16} className="text-slate-400" />
            }
          </button>

          {showJobs && (
            <div className="border-t border-white/10 p-5">
              {health.jobs.recent.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">No active jobs</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-slate-500 border-b border-white/10">
                      <th className="pb-2 font-medium">Job Type</th>
                      <th className="pb-2 font-medium">Status</th>
                      <th className="pb-2 font-medium">Attempts</th>
                      <th className="pb-2 font-medium">Created</th>
                      <th className="pb-2 font-medium">Error</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {health.jobs.recent.map(j => (
                      <tr key={j.id} className="hover:bg-white/5">
                        <td className="py-2 font-mono text-xs text-[#FFB000]">{j.job_type}</td>
                        <td className="py-2">
                          <span className={`text-xs font-medium ${
                            j.status === 'pending'    ? 'text-amber-400' :
                            j.status === 'processing' ? 'text-blue-400'  :
                            j.status === 'failed'     ? 'text-red-400'   :
                            'text-emerald-400'
                          }`}>
                            {j.status}
                          </span>
                        </td>
                        <td className="py-2 ryze-text-muted text-xs">{j.attempts}</td>
                        <td className="py-2 text-slate-500 text-xs">{fmtRelative(j.created_at)}</td>
                        <td className="py-2 text-red-400/80 text-xs max-w-[200px] truncate">{j.error ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      )}

      {/* Config checklist */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="font-semibold ryze-text-inverse text-sm">OCI Bot Configuration Checklist</div>
        <div className="space-y-2 text-sm">
          {[
            { label: 'DISCORD_TOKEN',       hint: 'Bot token from Discord Developer Portal' },
            { label: 'DISCORD_GUILD_ID',    hint: 'Your Discord server ID' },
            { label: 'DASHBOARD_API_KEY',   hint: 'Must match BOT_API_SECRET on Render' },
            { label: 'PORTAL_API_URL',      hint: 'https://ryze-portal-api.onrender.com', expected: health?.portal_api_url ?? undefined },
            { label: 'GOOGLE_CLIENT_ID',    hint: 'Google OAuth credentials for Calendar sync' },
            { label: 'GOOGLE_REFRESH_TOKEN', hint: 'OAuth refresh token for Google Calendar' },
          ].map(item => (
            <div key={item.label} className="flex items-start justify-between gap-4">
              <div>
                <code className="text-xs bg-white/10 px-1.5 py-0.5 rounded text-[#FFB000]">{item.label}</code>
                <span className="text-slate-500 ml-2 text-xs">{item.hint}</span>
              </div>
              {item.expected !== undefined && (
                <span className="text-xs text-emerald-400 flex-shrink-0">✓ seen in logs</span>
              )}
            </div>
          ))}
        </div>
        <div className="text-xs text-slate-500 border-t border-white/10 pt-3 mt-2">
          Set these in <code className="bg-white/10 px-1 rounded">/opt/ryze/ryze-discord-bot/.env</code> on the OCI server,
          then run <code className="bg-white/10 px-1 rounded">docker compose restart bot</code>.
          The bot confirms configuration at startup in its logs.
        </div>
      </div>

    </motion.div>
  );
};
