/**
 * Team router — /api/admin/team
 *
 * Returns all active admin and tutor users so the Settings > Team & Roles
 * section can display real workspace members instead of hardcoded fixtures.
 *
 * Endpoints
 *   GET  /team     list all active admin + tutor users
 */

import { Router } from 'express';
import { db } from '../../prisma';
import { requireAdminOnly } from '../../auth/middleware';

export const teamRouter = Router();
teamRouter.use(requireAdminOnly);

// ---------------------------------------------------------------------------
// GET /team
// ---------------------------------------------------------------------------

teamRouter.get('/', async (req, res) => {
  try {
    const users = await db.user.findMany({
      where: {
        role: { in: ['admin', 'tutor'] },
        active: true,
      },
      orderBy: [
        { role: 'asc' },      // admin before tutor (alphabetically: admin < tutor)
        { full_name: 'asc' },
      ],
      select: {
        id: true,
        display_id: true,
        full_name: true,
        email: true,
        role: true,
        created_at: true,
      },
    });

    res.json({
      total: users.length,
      items: users.map(u => ({
        id: u.id,
        display_id: u.display_id ?? null,
        full_name: u.full_name,
        email: u.email ?? null,
        role: u.role,
        created_at: u.created_at instanceof Date ? u.created_at.toISOString() : u.created_at,
      })),
    });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});
