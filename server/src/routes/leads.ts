/**
 * leads.ts — public endpoint for marketing lead capture.
 *
 * POST /api/leads
 *   - No auth required (called from the public marketing contact form)
 *   - Rate-limited to prevent spam
 *   - Upserts by email so duplicate form submissions don't create double entries
 *   - Returns { id, created: boolean }
 *
 * GET /api/leads (admin only)
 *   - Paginated list of all leads with filtering by status
 *
 * PATCH /api/leads/:id (admin only)
 *   - Update status, assigned_to, notes
 */

import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../prisma';
import { requireAuth, requireAdmin } from '../auth/middleware';
import rateLimit from 'express-rate-limit';

export const leadsRouter = Router();

// Rate limit: 5 submissions per 15 min per IP — stops casual spam
const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { detail: 'Too many enquiries from this IP. Please try again later.' },
});

// ── POST /api/leads — public: create or update a lead ──────────────────────

leadsRouter.post('/', submitLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      name,
      email,
      phone,
      message,
      source,
      page,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
    } = req.body as Record<string, string | undefined>;

    if (!name || !email) {
      res.status(400).json({ detail: 'name and email are required' });
      return;
    }

    const emailLower = email.toLowerCase().trim();

    // Upsert — if this email already has a lead in a non-terminal state,
    // update it rather than creating a duplicate.
    const existing = await db.lead.findFirst({
      where: {
        email: emailLower,
        status: { notIn: ['enrolled', 'lost'] },
      },
      orderBy: { created_at: 'desc' },
    });

    if (existing) {
      const updated = await db.lead.update({
        where: { id: existing.id },
        data: {
          name: name.trim(),
          phone: phone?.trim() ?? existing.phone,
          message: message?.trim() ?? existing.message,
          page: page ?? existing.page,
          utm_source: utm_source ?? existing.utm_source,
          utm_medium: utm_medium ?? existing.utm_medium,
          utm_campaign: utm_campaign ?? existing.utm_campaign,
          utm_content: utm_content ?? existing.utm_content,
        },
      });
      res.json({ id: updated.id, created: false });
      return;
    }

    const lead = await db.lead.create({
      data: {
        name: name.trim(),
        email: emailLower,
        phone: phone?.trim() ?? null,
        message: message?.trim() ?? null,
        source: source ?? 'website',
        page: page ?? null,
        utm_source: utm_source ?? null,
        utm_medium: utm_medium ?? null,
        utm_campaign: utm_campaign ?? null,
        utm_content: utm_content ?? null,
      },
    });

    res.status(201).json({ id: lead.id, created: true });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/leads — admin only: list all leads ────────────────────────────

leadsRouter.get('/', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, skip = '0', limit = '50' } = req.query as Record<string, string>;

    const where = status ? { status: status as any } : {};

    const [total, items] = await Promise.all([
      db.lead.count({ where }),
      db.lead.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: parseInt(skip, 10),
        take: Math.min(parseInt(limit, 10), 200),
      }),
    ]);

    res.json({ total, items });
  } catch (err) {
    next(err);
  }
});

// ── PATCH /api/leads/:id — admin only: update status/notes/assigned_to ────

leadsRouter.patch('/:id', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status, notes, assigned_to, contacted_at, converted_at, converted_user_id } = req.body as Record<string, any>;

    const data: Record<string, any> = {};
    if (status !== undefined)            data.status = status;
    if (notes !== undefined)             data.notes = notes;
    if (assigned_to !== undefined)       data.assigned_to = assigned_to;
    if (contacted_at !== undefined)      data.contacted_at = contacted_at ? new Date(contacted_at) : null;
    if (converted_at !== undefined)      data.converted_at = converted_at ? new Date(converted_at) : null;
    if (converted_user_id !== undefined) data.converted_user_id = converted_user_id;

    const lead = await db.lead.update({
      where: { id },
      data,
    });

    res.json(lead);
  } catch (err) {
    next(err);
  }
});
