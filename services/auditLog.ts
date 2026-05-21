/**
 * auditLog.ts — fires server-side audit trail entries via POST /api/admin/audit-log.
 *
 * Falls back to a silent no-op if the API call fails (e.g. during local dev
 * without a running backend). The real audit history is stored in PostgreSQL
 * and viewable in the Audit Log page.
 */

import { adminApi } from './adminApi';

export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'deactivate'
  | 'enroll'
  | 'withdraw'
  | 'publish'
  | 'archive'
  | 'resolve'
  | 'cancel';

export type AuditEntityType =
  | 'student'
  | 'parent'
  | 'tutor'
  | 'class'
  | 'lesson'
  | 'payment'
  | 'announcement'
  | 'resource'
  | 'homework'
  | 'alert';

export const auditLog = {
  /**
   * Record an admin action.
   * Fire-and-forget — errors are swallowed so they never break the calling flow.
   */
  log(
    action: AuditAction,
    entityType: AuditEntityType,
    entityId: number | string,
    entityName: string,
    adminName: string,
    _details?: string,
  ): void {
    adminApi
      .postAuditLog({
        action,
        entity_type: entityType,
        entity_id: entityId,
        entity_name: entityName,
        actor_name: adminName,
        actor_type: 'admin',
      })
      .catch(() => {
        // Silently swallow — the UI should never fail because of an audit write.
      });
  },
};
