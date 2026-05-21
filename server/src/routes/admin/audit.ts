import { Router } from 'express';
import { db } from '../../prisma';
import { requireAdmin, requireAdminOnly } from '../../auth/middleware';

export const auditRouter = Router();

function auditLogToItem(a: any) {
  return {
    id: a.id,
    actor_id: a.actor_id ?? null,
    actor_type: a.actor_type,
    actor_name: a.actor_name ?? null,
    action: a.action,
    entity_type: a.entity_type,
    entity_id: a.entity_id ?? null,
    entity_name: a.entity_name ?? null,
    old_data: a.old_data ?? null,
    new_data: a.new_data ?? null,
    ip_address: a.ip_address ?? null,
    user_agent: a.user_agent ?? null,
    created_at: a.created_at instanceof Date ? a.created_at.toISOString() : a.created_at,
  };
}

// GET /api/admin/audit-log — admin only (tutors cannot view the audit log)
auditRouter.get('/audit-log', requireAdminOnly, async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit ?? 100), 500);
    const skip = Number(req.query.skip ?? 0);
    const { actor_id, entity_type, action } = req.query as {
      actor_id?: string; entity_type?: string; action?: string;
    };
    const where: any = {};
    if (actor_id) where.actor_id = Number(actor_id);
    if (entity_type) where.entity_type = entity_type;
    if (action) where.action = action;

    const [total, items] = await Promise.all([
      db.auditLog.count({ where }),
      db.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
    ]);
    res.json({ total, items: items.map(auditLogToItem) });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// POST /api/admin/audit-log — admin + tutor (both roles perform auditable actions)
auditRouter.post('/audit-log', requireAdmin, async (req, res) => {
  try {
    const {
      action, entity_type, entity_id,
      entity_name, old_data, new_data, ip_address, user_agent,
    } = req.body as {
      action?: string;
      entity_type?: string; entity_id?: string | number; entity_name?: string;
      old_data?: any; new_data?: any; ip_address?: string; user_agent?: string;
    };
    if (!action) { res.status(400).json({ detail: 'action is required' }); return; }
    if (!entity_type) { res.status(400).json({ detail: 'entity_type is required' }); return; }

    // Always derive actor from the JWT — never trust client-supplied actor_id.
    const p = req.jwtPayload!;

    const log = await db.auditLog.create({
      data: {
        actor_id: p.user_id ?? null,
        actor_type: p.role ?? 'user',
        actor_name: p.name ?? null,
        action,
        entity_type,
        entity_id: entity_id != null ? String(entity_id) : null,
        entity_name: entity_name ?? null,
        old_data: old_data ?? undefined,
        new_data: new_data ?? undefined,
        ip_address: ip_address ?? null,
        user_agent: user_agent ?? null,
      },
    });
    res.status(201).json({ id: log.id });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});
