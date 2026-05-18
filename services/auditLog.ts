/**
 * auditLog.ts — frontend-only audit trail stored in localStorage.
 *
 * Records every admin create / update / delete action so that admins
 * can review a history of changes in the Audit Log page.
 */

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

export interface AuditEntry {
  id: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: number | string;
  entityName: string;
  details?: string;
  adminName: string;
  timestamp: string; // ISO 8601
}

const STORAGE_KEY = 'ryze_audit_log';
const MAX_ENTRIES = 500;

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function loadEntries(): AuditEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuditEntry[]) : [];
  } catch {
    return [];
  }
}

function saveEntries(entries: AuditEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // ignore quota errors
  }
}

export const auditLog = {
  log(
    action: AuditAction,
    entityType: AuditEntityType,
    entityId: number | string,
    entityName: string,
    adminName: string,
    details?: string,
  ): void {
    const entries = loadEntries();
    const entry: AuditEntry = {
      id: generateId(),
      action,
      entityType,
      entityId,
      entityName,
      details,
      adminName,
      timestamp: new Date().toISOString(),
    };
    entries.unshift(entry); // newest first
    if (entries.length > MAX_ENTRIES) entries.length = MAX_ENTRIES;
    saveEntries(entries);
  },

  getEntries(): AuditEntry[] {
    return loadEntries();
  },

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  },
};
