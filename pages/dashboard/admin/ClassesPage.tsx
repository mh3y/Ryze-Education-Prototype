/**
 * ClassesPage — /dashboard/admin/classes
 * Ryze Portal redesign — class card grid.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Plus, ArrowUpRight, X, AlertCircle, BookOpen } from 'lucide-react';
import { adminApi, ClassGroupListItem } from '../../../services/adminApi';
import { auditLog } from '../../../services/auditLog';
import { useAuth } from '../../../contexts/AuthContext';
import { PageHeader } from '../../../components/dashboard/ui/PageHeader';
import { StatusBadge } from '../../../components/dashboard/ui/StatusBadge';
import { EmptyState, ErrorState } from '../../../components/dashboard/ui';

// ---------------------------------------------------------------------------
// Create class modal
// ---------------------------------------------------------------------------

const SUBJECTS = [
  'Maths Extension 2', 'Maths Extension 1', 'Maths Advanced',
  'Standard Maths', 'Foundations', 'Selective Prep', 'OC Prep', 'General Maths',
];

const YEAR_LEVELS = [
  'Year 5', 'Year 6', 'Year 7', 'Year 8', 'Year 9',
  'Year 10', 'Year 11', 'Year 12 — HSC',
];

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface TutorOption { id: number; full_name: string; }

interface CreateClassModalProps {
  onClose: () => void;
  onSaved: (name: string) => void;
}

const CreateClassModal: React.FC<CreateClassModalProps> = ({ onClose, onSaved }) => {
  const [saving, setSaving]       = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [tutors, setTutors]       = useState<TutorOption[]>([]);

  const [form, setForm] = useState({
    name: '',
    class_type: 'group',
    subject: SUBJECTS[2],
    year_level: YEAR_LEVELS[5],
    tutor_user_id: '',
    schedule_day: '',
    schedule_hour: '',
    schedule_minute: '0',
    duration_min: '120',
    discord_channel_id: '',
    google_calendar_id: '',
  });

  useEffect(() => {
    adminApi.getTutors({ limit: 200 }).then((r) => {
      setTutors(r.items.map((t: any) => ({ id: t.id, full_name: t.full_name })));
    }).catch(() => {});
  }, []);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setFormError('Class name is required.'); return; }
    setSaving(true);
    setFormError(null);
    try {
      const body: any = {
        name: form.name.trim(),
        class_type: form.class_type,
        subject: form.subject || undefined,
        year_level: form.year_level || undefined,
        active: true,
      };
      if (form.tutor_user_id) body.tutor_user_id = Number(form.tutor_user_id);
      if (form.schedule_day !== '')    body.schedule_day    = Number(form.schedule_day);
      if (form.schedule_hour !== '')   body.schedule_hour   = Number(form.schedule_hour);
      if (form.schedule_minute !== '') body.schedule_minute = Number(form.schedule_minute);
      if (form.duration_min)           body.duration_min    = Number(form.duration_min);
      if (form.discord_channel_id)     body.discord_channel_id = form.discord_channel_id.trim();
      if (form.google_calendar_id)     body.google_calendar_id = form.google_calendar_id.trim();

      await adminApi.createClass(body);
      onSaved(form.name.trim());
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to create class.';
      setFormError(msg);
      setSaving(false);
    }
  };

  const inp: React.CSSProperties = {
    width: '100%', padding: '9px 14px',
    background: 'var(--bg-surface-2)',
    border: '1px solid var(--border-soft)',
    borderRadius: 9, fontSize: 13,
    color: 'var(--fg-default)', outline: 'none',
    fontFamily: 'var(--font-sans)',
    boxSizing: 'border-box',
  };
  const lbl: React.CSSProperties = {
    display: 'block', fontSize: 10, fontWeight: 700,
    letterSpacing: '0.12em', textTransform: 'uppercase',
    color: 'var(--fg-muted)', marginBottom: 5,
  };
  const g2: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div style={{
        position: 'relative', zIndex: 10,
        background: 'var(--bg-surface)', border: '1px solid var(--border-soft)',
        borderRadius: 16, boxShadow: '0 32px 64px -24px rgba(0,0,0,0.6)',
        maxWidth: 520, width: '100%', padding: 24,
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--fg-strong)' }}>New Class</div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--fg-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {formError && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--danger)', background: 'color-mix(in oklab, var(--danger) 12%, transparent)', border: '1px solid color-mix(in oklab, var(--danger) 26%, transparent)', borderRadius: 9, padding: 12, marginBottom: 16 }}>
            <AlertCircle size={14} /> {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Identity */}
          <div>
            <label style={lbl}>Class name *</label>
            <input type="text" value={form.name} onChange={set('name')} placeholder="e.g. Berwyn | Thursday Group" style={inp} autoFocus />
          </div>

          <div style={g2}>
            <div>
              <label style={lbl}>Type</label>
              <select value={form.class_type} onChange={set('class_type')} style={inp}>
                <option value="group">Group</option>
                <option value="private">Private (1-on-1)</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Tutor</label>
              <select value={form.tutor_user_id} onChange={set('tutor_user_id')} style={inp}>
                <option value="">— assign later —</option>
                {tutors.map((t) => <option key={t.id} value={t.id}>{t.full_name}</option>)}
              </select>
            </div>
          </div>

          <div style={g2}>
            <div>
              <label style={lbl}>Subject</label>
              <select value={form.subject} onChange={set('subject')} style={inp}>
                {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Year level</label>
              <select value={form.year_level} onChange={set('year_level')} style={inp}>
                {YEAR_LEVELS.map((y) => <option key={y}>{y}</option>)}
              </select>
            </div>
          </div>

          {/* Schedule */}
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fg-muted)', paddingTop: 4 }}>Schedule (optional)</div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label style={lbl}>Day</label>
              <select value={form.schedule_day} onChange={set('schedule_day')} style={inp}>
                <option value="">—</option>
                {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Hour</label>
              <input type="number" min="0" max="23" value={form.schedule_hour} onChange={set('schedule_hour')} placeholder="19" style={inp} />
            </div>
            <div>
              <label style={lbl}>Min</label>
              <input type="number" min="0" max="59" step="5" value={form.schedule_minute} onChange={set('schedule_minute')} placeholder="0" style={inp} />
            </div>
            <div>
              <label style={lbl}>Dur (min)</label>
              <input type="number" min="30" max="360" step="30" value={form.duration_min} onChange={set('duration_min')} placeholder="120" style={inp} />
            </div>
          </div>

          {/* Integrations */}
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fg-muted)', paddingTop: 4 }}>Integrations (optional)</div>
          <div style={g2}>
            <div>
              <label style={lbl}>Discord Channel ID</label>
              <input type="text" value={form.discord_channel_id} onChange={set('discord_channel_id')} placeholder="Snowflake ID" style={inp} />
            </div>
            <div>
              <label style={lbl}>Google Calendar ID</label>
              <input type="text" value={form.google_calendar_id} onChange={set('google_calendar_id')} placeholder="e.g. @gmail.com" style={inp} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{ height: 38, padding: '0 20px', borderRadius: 9, fontSize: 13, fontWeight: 600, background: 'var(--bg-surface-2)', color: 'var(--fg-default)', border: '1px solid var(--border-soft)', cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" disabled={saving} style={{ height: 38, padding: '0 20px', borderRadius: 9, fontSize: 13, fontWeight: 600, background: 'var(--accent)', color: 'var(--accent-fg)', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Creating…' : 'Create class'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const ClassesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [items, setItems]       = useState<ClassGroupListItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getClasses({ limit: 200, active: true });
      setItems(data.items);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load classes.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Map API items into display shape
  const displayClasses = items.map((c) => ({
    id: String(c.id),
    name: c.name,
    level: [c.year_level, c.subject].filter(Boolean).join(' · ') || '—',
    tutor: c.tutor?.full_name ?? '—',
    day: '—',
    time: '—',
    seats: `${c.member_count} enrolled`,
    rev: '—',
    state: (c.active ? 'running' : 'inactive') as 'running' | 'low-seat' | 'inactive',
  }));

  const btnStyle: React.CSSProperties = {
    height: 38, padding: '0 14px', borderRadius: 9,
    fontSize: 13, fontWeight: 600,
    display: 'flex', alignItems: 'center', gap: 8,
    cursor: 'pointer', border: 'none',
    transition: 'transform 140ms ease',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>

      <PageHeader
        compact
        eyebrow="Operations"
        title="Classes"
        actions={<>
          <button style={{ ...btnStyle, background: 'var(--bg-surface)', color: 'var(--fg-default)', border: '1px solid var(--border-soft)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ''; }}>
            <CalendarDays size={14} /> Week view
          </button>
          <button
            onClick={() => setShowCreate(true)}
            style={{ ...btnStyle, background: 'var(--accent)', color: 'var(--accent-fg)', boxShadow: '0 6px 18px -10px color-mix(in oklab, var(--accent) 70%, transparent)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ''; }}>
            <Plus size={14} /> New class
          </button>
        </>}
      />

      {/* Loading / error state */}
      {loading && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
          gap: 'var(--gap-md)',
        }}>
          {[1,2,3,4,5,6].map((i) => (
            <div key={i} style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-faint)',
              borderRadius: 16, padding: 20, minHeight: 220,
              opacity: 0.5,
            }} />
          ))}
        </div>
      )}

      {error && !loading && (
        <ErrorState message={error} onRetry={load} />
      )}

      {/* Class grid */}
      {!loading && !error && displayClasses.length === 0 && (
        <EmptyState
          icon={BookOpen}
          title="No classes yet"
          description="Create your first class to get started."
        />
      )}
      {!loading && !error && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
          gap: 'var(--gap-md)',
        }}>
          {displayClasses.map((c) => {
            const stateLabel = c.state === 'low-seat' ? 'Low seats' : c.state === 'running' ? 'Running' : 'Inactive';

            return (
              <div
                key={c.id}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-faint)',
                  borderRadius: 16,
                  padding: 20,
                  boxShadow: 'var(--shadow-card)',
                  display: 'flex', flexDirection: 'column', gap: 0,
                  cursor: 'pointer',
                  transition: 'transform 140ms ease, border-color 140ms ease, box-shadow 140ms ease',
                }}
                onClick={() => navigate(`/dashboard/admin/classes/${c.id}`)}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform = 'translateY(-2px)';
                  el.style.borderColor = 'var(--border-strong)';
                  el.style.boxShadow = '0 20px 40px -20px rgba(0,0,0,0.5)';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform = '';
                  el.style.borderColor = 'var(--border-faint)';
                  el.style.boxShadow = 'var(--shadow-card)';
                }}
              >
                {/* Header: day + status */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase',
                      background: 'var(--accent-soft)', color: 'var(--accent)',
                      padding: '3px 9px', borderRadius: 999,
                    }}>
                      {c.day}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-muted)', fontFeatureSettings: '"tnum" 1' }}>
                      {c.time}
                    </span>
                  </div>
                  <StatusBadge value={c.state} label={stateLabel} />
                </div>

                {/* Class name */}
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic', fontWeight: 500, fontSize: 26,
                  color: 'var(--fg-strong)', lineHeight: 1.1, marginBottom: 6,
                }}>
                  {c.name}
                </div>

                {/* Level */}
                <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginBottom: 18 }}>
                  {c.level}
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: 'var(--border-faint)', marginBottom: 18 }} />

                {/* Meta grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 120px), 1fr))', gap: 12, marginBottom: 18 }}>
                  {[
                    { label: 'Tutor',   value: c.tutor },
                    { label: 'Seats',   value: c.seats },
                    { label: 'Revenue', value: c.rev },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 4 }}>
                        {label}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-default)', fontFeatureSettings: '"tnum" 1' }}>
                        {value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/admin/classes/${c.id}`); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      fontSize: 13, color: 'var(--fg-muted)',
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      transition: 'color 140ms ease',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--fg-strong)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--fg-muted)'; }}
                  >
                    Open <ArrowUpRight size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create class modal */}
      {showCreate && (
        <CreateClassModal
          onClose={() => setShowCreate(false)}
          onSaved={(name) => {
            auditLog.log('create', 'class', 'new', name, user?.name ?? 'Admin', 'Class created');
            setShowCreate(false);
            load();
          }}
        />
      )}
    </div>
  );
};

export default ClassesPage;
