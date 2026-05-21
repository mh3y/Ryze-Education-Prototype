import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { db } from '../../prisma';
import { requireAdminOnly } from '../../auth/middleware';
import { sendInviteEmail } from '../../mailer';

export const parentsRouter = Router();
// Parent management is admin-only — tutors cannot access parent accounts.
parentsRouter.use(requireAdminOnly);

function parentToItem(p: any) {
  return {
    id: p.id,
    full_name: `${p.first_name} ${p.last_name}`,
    email: p.email,
    phone: p.phone ?? null,
    active: p.active,
    created_at: p.created_at instanceof Date ? p.created_at.toISOString() : p.created_at,
    invite_pending: p.invite_pending,
    has_set_password: p.has_set_password,
  };
}

function makeInviteLink(token: string): string {
  return `${process.env.PORTAL_BASE_URL ?? 'http://localhost:3000'}/auth/invite?token=${token}`;
}

// GET /api/admin/parents
parentsRouter.get('/', async (req, res) => {
  const limit = Math.min(Number(req.query.limit ?? 100), 500);
  const skip = Number(req.query.skip ?? 0);
  const [total, items] = await Promise.all([
    db.parent.count(),
    db.parent.findMany({ skip, take: limit, orderBy: { created_at: 'desc' } }),
  ]);
  res.json({ total, items: items.map(parentToItem) });
});

// POST /api/admin/parents
parentsRouter.post('/', async (req, res) => {
  const { first_name, last_name, email, phone, notes } = req.body as {
    first_name?: string; last_name?: string; email?: string; phone?: string; notes?: string;
  };
  if (!first_name || !last_name || !email) {
    res.status(400).json({ detail: 'first_name, last_name, and email are required' }); return;
  }
  const existing = await db.parent.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (existing) { res.status(409).json({ detail: 'A parent with that email already exists' }); return; }

  const invite_token = randomUUID();
  const invite_expires_at = new Date(Date.now() + 48 * 60 * 60 * 1000);

  const parent = await db.parent.create({
    data: {
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim() || null,
      notes: notes?.trim() || null,
      invite_token,
      invite_expires_at,
      invite_pending: true,
    },
  });

  const invite_link = makeInviteLink(invite_token);
  let email_sent = true;
  await sendInviteEmail(parent.email, `${parent.first_name} ${parent.last_name}`, invite_link)
    .catch(() => { email_sent = false; });

  res.status(201).json({
    id: parent.id,
    full_name: `${parent.first_name} ${parent.last_name}`,
    invite_link,
    invite_expires_at: invite_expires_at.toISOString(),
    email_sent,
    // When SMTP is not configured, surface a warning so the admin knows to share the link manually.
    ...(email_sent ? {} : { email_warning: 'SMTP is not configured — the invite link is included in this response. Copy it and share it with the parent manually.' }),
  });
});

// GET /api/admin/parents/:id
parentsRouter.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const parent = await db.parent.findUnique({
    where: { id },
    include: { children: { include: { student: true } } },
  });
  if (!parent) { res.status(404).json({ detail: 'Parent not found' }); return; }
  res.json({
    ...parentToItem(parent),
    first_name: parent.first_name,
    last_name: parent.last_name,
    notes: parent.notes ?? null,
    updated_at: parent.updated_at instanceof Date ? parent.updated_at.toISOString() : parent.updated_at,
    last_login_at: parent.last_login_at instanceof Date ? parent.last_login_at.toISOString() : null,
    students: parent.children.map((c: any) => ({
      link_id: c.id,
      student_user_id: c.student_id,
      student_name: c.student.full_name,
      relationship: c.relationship,
      is_primary_contact: c.is_primary_contact,
    })),
  });
});

// PATCH /api/admin/parents/:id
parentsRouter.patch('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const body = req.body as Partial<{ first_name: string; last_name: string; email: string; phone: string; notes: string; active: boolean }>;
  const data: any = {};
  if (body.first_name !== undefined) data.first_name = body.first_name.trim();
  if (body.last_name  !== undefined) data.last_name  = body.last_name.trim();
  if (body.email      !== undefined) data.email      = body.email.toLowerCase().trim();
  if (body.phone      !== undefined) data.phone      = body.phone.trim() || null;
  if (body.notes      !== undefined) data.notes      = body.notes.trim() || null;
  if (body.active     !== undefined) data.active     = body.active;
  try {
    await db.parent.update({ where: { id }, data });
    res.json({ id, updated: true });
  } catch { res.status(404).json({ detail: 'Parent not found' }); }
});

// DELETE /api/admin/parents/:id
parentsRouter.delete('/:id', async (req, res) => {
  try {
    await db.parent.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch { res.status(404).json({ detail: 'Parent not found' }); }
});

// POST /api/admin/parents/:id/resend-invite
parentsRouter.post('/:id/resend-invite', async (req, res) => {
  const id = Number(req.params.id);
  const parent = await db.parent.findUnique({ where: { id } });
  if (!parent) { res.status(404).json({ detail: 'Parent not found' }); return; }

  const invite_token = randomUUID();
  const invite_expires_at = new Date(Date.now() + 48 * 60 * 60 * 1000);
  await db.parent.update({ where: { id }, data: { invite_token, invite_expires_at, invite_pending: true } });

  const invite_link = makeInviteLink(invite_token);
  await sendInviteEmail(parent.email, `${parent.first_name} ${parent.last_name}`, invite_link).catch(() => {});
  res.json({ invite_link, invite_expires_at: invite_expires_at.toISOString() });
});

// POST /api/admin/parents/:id/students
parentsRouter.post('/:id/students', async (req, res) => {
  const parent_id = Number(req.params.id);
  const { student_user_id, relationship, is_primary_contact } = req.body as {
    student_user_id?: number; relationship?: string; is_primary_contact?: boolean;
  };
  if (!student_user_id) { res.status(400).json({ detail: 'student_user_id is required' }); return; }
  try {
    const link = await db.parentStudent.create({
      data: { parent_id, student_id: student_user_id, relationship: relationship ?? 'parent', is_primary_contact: is_primary_contact ?? true },
    });
    res.status(201).json({ link_id: link.id });
  } catch { res.status(409).json({ detail: 'This student is already linked to this parent' }); }
});

// DELETE /api/admin/parents/:id/students/:linkId
parentsRouter.delete('/:id/students/:linkId', async (req, res) => {
  try {
    await db.parentStudent.delete({ where: { id: Number(req.params.linkId) } });
    res.json({ removed: true });
  } catch { res.status(404).json({ detail: 'Link not found' }); }
});
