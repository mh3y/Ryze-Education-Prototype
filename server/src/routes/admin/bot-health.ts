/**
 * GET /api/admin/bot-health
 *
 * Returns a consolidated view of the Discord bot's sync health:
 *   - Latest sync log per sync_type (members | classes | lessons | attendance)
 *   - Summary counts (pending jobs, recent failures)
 *   - DB-level bot configuration status
 */

import { Router } from 'express';
import { db } from '../../prisma';
import { requireAdmin } from '../../auth/middleware';

export const botHealthRouter = Router();
botHealthRouter.use(requireAdmin);

botHealthRouter.get('/', async (_req, res) => {
  try {
    // Latest sync log per type
    const syncTypes = ['members', 'classes', 'lessons', 'attendance'] as const;

    const latestPerType = await Promise.all(
      syncTypes.map((t) =>
        db.botSyncLog.findFirst({
          where:   { sync_type: t },
          orderBy: { created_at: 'desc' },
        })
      )
    );

    const syncSummary = syncTypes.reduce<Record<string, any>>((acc, type, i) => {
      const log = latestPerType[i];
      acc[type] = log
        ? {
            id:              log.id,
            status:          log.status,
            source:          log.source,
            started_at:      log.started_at instanceof Date ? log.started_at.toISOString() : log.started_at,
            completed_at:    log.completed_at instanceof Date ? log.completed_at.toISOString() : (log.completed_at ?? null),
            records_created: log.records_created,
            records_updated: log.records_updated,
            records_failed:  log.records_failed,
            error_message:   log.error_message ?? null,
            triggered_by:    log.triggered_by  ?? null,
            portal_api_url:  log.portal_api_url ?? null,
          }
        : null;
      return acc;
    }, {});

    // Recent failures (last 5)
    const recentFailures = await db.botSyncLog.findMany({
      where:   { status: 'failed' },
      orderBy: { created_at: 'desc' },
      take:    5,
      select: {
        id: true, sync_type: true, status: true, error_message: true,
        created_at: true, triggered_by: true,
      },
    });

    // Pending and recently-failed bot jobs
    const pendingJobs = await db.botJob.count({ where: { status: 'pending' } });
    const failedJobs  = await db.botJob.count({ where: { status: 'failed' } });
    const recentJobs  = await db.botJob.findMany({
      where:   { status: { in: ['pending', 'processing', 'failed'] } },
      orderBy: { created_at: 'desc' },
      take:    10,
      select: { id: true, job_type: true, status: true, attempts: true, error: true, created_at: true },
    });

    // Portal API URL inferred from the most recent sync log that has one
    const lastLogWithUrl = await db.botSyncLog.findFirst({
      where:   { portal_api_url: { not: null } },
      orderBy: { created_at: 'desc' },
      select:  { portal_api_url: true },
    });

    // Last sync of any type
    const lastAnySyncLog = await db.botSyncLog.findFirst({
      orderBy: { created_at: 'desc' },
      select:  { created_at: true },
    });

    // ── Calendar (Google Lessons) health ──────────────────────────────────────
    // Analyse the last 20 'lessons' sync runs to detect consecutive failures,
    // expired/revoked OAuth tokens, and staleness.
    const calendarLogs = await db.botSyncLog.findMany({
      where:   { sync_type: 'lessons' },
      orderBy: { created_at: 'desc' },
      take:    20,
      select:  {
        id: true, status: true, error_message: true,
        started_at: true, completed_at: true, created_at: true,
      },
    });

    // Count consecutive failures from the front of the (desc-sorted) list
    let consecutiveCalendarFailures = 0;
    for (const log of calendarLogs) {
      if (log.status === 'failed') consecutiveCalendarFailures++;
      else break;
    }

    const calLastSuccess = calendarLogs.find(l => l.status !== 'failed') ?? null;
    const calLastFailure = calendarLogs.find(l => l.status === 'failed') ?? null;
    const calLastError   = calLastFailure?.error_message ?? null;

    // Detect expired/revoked OAuth tokens (Google's invalid_grant, Python RefreshError, etc.)
    const isCalTokenError = calLastError
      ? /invalid_grant|token.*(expired|revoked)|RefreshError|reauth/i.test(calLastError)
      : false;

    const toIso = (log: typeof calLastSuccess | typeof calLastFailure): string | null => {
      if (!log) return null;
      const d = log.completed_at ?? log.started_at;
      return d instanceof Date ? d.toISOString() : (d as any) ?? null;
    };

    const calLastSuccessAt = toIso(calLastSuccess);
    const calLastFailureAt = toIso(calLastFailure);

    const CALENDAR_STALE_HOURS = 24;
    const calStale = calLastSuccessAt
      ? (Date.now() - new Date(calLastSuccessAt).getTime()) > CALENDAR_STALE_HOURS * 3_600_000
      : true;

    const calendarHealthStatus: 'ok' | 'warning' | 'error' =
      calendarLogs.length === 0                           ? 'warning' : // never synced
      isCalTokenError                                     ? 'error'   :
      consecutiveCalendarFailures >= 3 && calStale        ? 'error'   :
      consecutiveCalendarFailures > 0                     ? 'warning' :
      'ok';

    const calendarHealth = {
      status:               calendarHealthStatus,
      consecutive_failures: consecutiveCalendarFailures,
      last_success_at:      calLastSuccessAt,
      last_failure_at:      calLastFailureAt,
      last_error:           calLastError,
      is_token_error:       isCalTokenError,
      stale:                calStale,
    };

    res.json({
      sync_summary:   syncSummary,
      recent_failures: recentFailures.map((f: any) => ({
        ...f,
        created_at: f.created_at instanceof Date ? f.created_at.toISOString() : f.created_at,
      })),
      jobs: {
        pending:  pendingJobs,
        failed:   failedJobs,
        recent:   recentJobs.map((j: any) => ({
          ...j,
          created_at: j.created_at instanceof Date ? j.created_at.toISOString() : j.created_at,
        })),
      },
      portal_api_url:  lastLogWithUrl?.portal_api_url ?? null,
      last_any_sync:   lastAnySyncLog?.created_at instanceof Date
        ? lastAnySyncLog.created_at.toISOString()
        : (lastAnySyncLog?.created_at ?? null),
      calendar_health: calendarHealth,
    });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});
