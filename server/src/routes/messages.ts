/**
 * /api/messages — parent ↔ admin messaging threads
 *
 * Parents can create new threads and reply.
 * Admins can view all threads and reply.
 * Both use the requireAuth middleware; access is scoped by role.
 */

import { Router } from 'express';
import { db } from '../prisma';
import { requireAuth, requireAdmin } from '../auth/middleware';
import { createNotification } from './notifications';

export const messagesRouter = Router();
messagesRouter.use(requireAuth);

// ── GET /api/messages ─────────────────────────────────────────────────────────
// Parent: returns their own threads.
// Admin/tutor: returns all open threads with unread admin messages.

messagesRouter.get('/', async (req, res) => {
  try {
    const p = req.jwtPayload!;
    const where: any = {};

    if (p.role === 'parent' && p.parent_profile_id) {
      where.parent_id = p.parent_profile_id;
    } else if (p.role !== 'admin') {
      // Only admins may list all threads. Tutors, students, and other roles are excluded.
      res.status(403).json({ detail: 'Forbidden' });
      return;
    }

    const threads = await db.messageThread.findMany({
      where,
      include: {
        parent:   { select: { first_name: true, last_name: true, email: true } },
        messages: {
          orderBy: { created_at: 'desc' },
          take: 1,
        },
        _count:   { select: { messages: { where: { read: false } } } },
      },
      orderBy: { updated_at: 'desc' },
    });

    res.json(threads.map((t: any) => ({
      id:           t.id,
      subject:      t.subject,
      status:       t.status,
      parent_name:  t.parent ? `${t.parent.first_name} ${t.parent.last_name}` : null,
      parent_email: t.parent?.email ?? null,
      created_at:   t.created_at instanceof Date ? t.created_at.toISOString() : t.created_at,
      updated_at:   t.updated_at instanceof Date ? t.updated_at.toISOString() : t.updated_at,
      unread_count: t._count.messages,
      last_message: t.messages[0]
        ? {
            body:        t.messages[0].body,
            sender_type: t.messages[0].sender_type,
            created_at:  t.messages[0].created_at instanceof Date
              ? t.messages[0].created_at.toISOString()
              : t.messages[0].created_at,
          }
        : null,
    })));
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── POST /api/messages ────────────────────────────────────────────────────────
// Create a new thread (parent) OR admin creates a thread on behalf of parent.

messagesRouter.post('/', async (req, res) => {
  try {
    const p = req.jwtPayload!;
    const { subject, message, parent_id: bodyParentId } = req.body as {
      subject?: string; message?: string; parent_id?: number;
    };

    if (!subject) { res.status(400).json({ detail: 'subject is required' }); return; }
    if (!message) { res.status(400).json({ detail: 'message is required' }); return; }

    let parentId: number;
    if (p.role === 'parent' && p.parent_profile_id) {
      parentId = p.parent_profile_id;
    } else if ((p.role === 'admin' || p.role === 'tutor') && bodyParentId) {
      parentId = bodyParentId;
    } else {
      res.status(400).json({ detail: 'parent_id is required for admin-initiated threads' });
      return;
    }

    const thread = await db.messageThread.create({
      data: {
        subject,
        parent_id: parentId,
        messages: {
          create: {
            sender_type: p.role === 'parent' ? 'parent' : 'admin',
            sender_id:   p.role === 'parent' ? parentId : (p.user_id ?? null),
            body:        message,
          },
        },
      },
    });

    // Notify the other party
    if (p.role === 'parent') {
      // Notify all admins — in a real setup you'd target specific admins
      const admins = await db.user.findMany({ where: { role: 'admin', active: true } });
      for (const admin of admins) {
        await createNotification({
          user_id: admin.id,
          type:    'system',
          title:   'New parent message',
          body:    subject,
          href:    `/dashboard/admin/messages/${thread.id}`,
        });
      }
    }

    res.status(201).json({ thread_id: thread.id });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── GET /api/messages/:id ─────────────────────────────────────────────────────

messagesRouter.get('/:id', async (req, res) => {
  try {
    const p        = req.jwtPayload!;
    const threadId = Number(req.params.id);

    const thread = await db.messageThread.findUnique({
      where: { id: threadId },
      include: {
        parent:   { select: { id: true, first_name: true, last_name: true, email: true } },
        messages: { orderBy: { created_at: 'asc' } },
      },
    });

    if (!thread) { res.status(404).json({ detail: 'Thread not found' }); return; }

    // Access control
    if (p.role === 'parent' && thread.parent_id !== p.parent_profile_id) {
      res.status(403).json({ detail: 'Forbidden' }); return;
    }

    // Mark unread messages as read (for the viewing party)
    const unreadIds = thread.messages
      .filter((m: any) => !m.read && (
        (p.role === 'parent' && m.sender_type === 'admin') ||
        (p.role !== 'parent' && m.sender_type === 'parent')
      ))
      .map((m: any) => m.id);

    if (unreadIds.length) {
      await db.message.updateMany({
        where: { id: { in: unreadIds } },
        data:  { read: true, read_at: new Date() },
      });
    }

    res.json({
      thread: {
        id:           thread.id,
        subject:      thread.subject,
        status:       thread.status,
        parent_id:    thread.parent_id,
        parent_name:  thread.parent ? `${thread.parent.first_name} ${thread.parent.last_name}` : null,
        parent_email: thread.parent?.email ?? null,
        created_at:   thread.created_at instanceof Date ? thread.created_at.toISOString() : thread.created_at,
        updated_at:   thread.updated_at instanceof Date ? thread.updated_at.toISOString() : thread.updated_at,
      },
      messages: thread.messages.map((m: any) => ({
        id:          m.id,
        sender_type: m.sender_type,
        sender_id:   m.sender_id ?? null,
        body:        m.body,
        read:        m.read,
        created_at:  m.created_at instanceof Date ? m.created_at.toISOString() : m.created_at,
      })),
    });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── POST /api/messages/:id/reply ──────────────────────────────────────────────

messagesRouter.post('/:id/reply', async (req, res) => {
  try {
    const p        = req.jwtPayload!;
    const threadId = Number(req.params.id);
    const { message } = req.body as { message?: string };
    if (!message) { res.status(400).json({ detail: 'message is required' }); return; }

    const thread = await db.messageThread.findUnique({ where: { id: threadId } });
    if (!thread) { res.status(404).json({ detail: 'Thread not found' }); return; }

    // Access control
    if (p.role === 'parent' && thread.parent_id !== p.parent_profile_id) {
      res.status(403).json({ detail: 'Forbidden' }); return;
    }

    const msg = await db.message.create({
      data: {
        thread_id:   threadId,
        sender_type: p.role === 'parent' ? 'parent' : 'admin',
        sender_id:   p.role === 'parent' ? (p.parent_profile_id ?? null) : (p.user_id ?? null),
        body:        message,
      },
    });

    // Keep thread updated_at current
    await db.messageThread.update({
      where: { id: threadId },
      data:  { updated_at: new Date() },
    });

    // Notify the other party
    if (p.role === 'parent') {
      const admins = await db.user.findMany({ where: { role: 'admin', active: true } });
      for (const admin of admins) {
        await createNotification({
          user_id: admin.id,
          type:    'system',
          title:   'New reply from parent',
          body:    thread.subject,
          href:    `/dashboard/admin/messages/${threadId}`,
        });
      }
    } else {
      await createNotification({
        parent_id: thread.parent_id,
        type:      'system',
        title:     'New message from admin',
        body:      thread.subject,
        href:      `/dashboard/parent/messages/${threadId}`,
      });
    }

    res.status(201).json({ message_id: msg.id });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── PATCH /api/messages/:id/resolve ──────────────────────────────────────────
// Admin-only: close a thread.

messagesRouter.patch('/:id/resolve', requireAdmin, async (req, res) => {
  try {
    const threadId = Number(req.params.id);
    await db.messageThread.update({
      where: { id: threadId },
      data:  { status: 'resolved', updated_at: new Date() },
    });
    res.json({ resolved: true });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});
