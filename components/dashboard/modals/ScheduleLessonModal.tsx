/**
 * ScheduleLessonModal.tsx
 *
 * Modal for creating (scheduling) a new lesson.
 * Fetches class groups so the user can pick one, then POSTs to adminApi.createLesson().
 */

import React, { useEffect, useRef, useState } from 'react';
import { X, CalendarPlus, Loader2, CheckCircle, AlertCircle, Link2 } from 'lucide-react';
import { adminApi, ClassGroupListItem } from '../../../services/adminApi';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ScheduleLessonModalProps {
  onClose: () => void;
  onCreated?: (lesson: { id: number; title: string }) => void;
}

interface FormState {
  title:          string;
  class_group_id: string;
  date:           string;
  start_time:     string;
  end_time:       string;
  location:       string;
  meet_link:      string;
  description:    string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getDefaultDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

function toISODateTime(date: string, time: string): string | undefined {
  if (!date || !time) return undefined;
  return `${date}T${time}:00`;
}

function inputStyle(focused: boolean): React.CSSProperties {
  return {
    width: '100%', height: 44,
    background: 'var(--bg-surface-2)',
    border: `1px solid ${focused ? 'var(--accent)' : 'var(--border-soft)'}`,
    borderRadius: 9, outline: 'none',
    padding: '0 12px',
    fontSize: 14, color: 'var(--fg-strong)',
    transition: 'border-color 140ms ease',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  };
}

const Label: React.FC<{ children: React.ReactNode; required?: boolean }> = ({ children, required }) => (
  <label style={{
    display: 'block',
    fontSize: 11.5, fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.08em',
    color: 'var(--fg-muted)', marginBottom: 6,
  }}>
    {children}
    {required && <span style={{ color: 'var(--danger)', marginLeft: 3 }}>*</span>}
  </label>
);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const ScheduleLessonModal: React.FC<ScheduleLessonModalProps> = ({ onClose, onCreated }) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<FormState>({
    title:          '',
    class_group_id: '',
    date:           getDefaultDate(),
    start_time:     '16:00',
    end_time:       '17:30',
    location:       '',
    meet_link:      '',
    description:    '',
  });
  const [focusField, setFocus] = useState<string | null>(null);
  const [saving, setSaving]    = useState(false);
  const [success, setSuccess]  = useState(false);
  const [error, setError]      = useState<string | null>(null);

  const [classes, setClasses]       = useState<ClassGroupListItem[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);

  // Fetch class groups
  useEffect(() => {
    adminApi.getClasses({ limit: 200, active: true })
      .then((res) => setClasses(res.items))
      .catch(() => setClasses([]))
      .finally(() => setLoadingClasses(false));
  }, []);

  // Auto-fill title when class is chosen
  useEffect(() => {
    if (form.class_group_id && !form.title) {
      const cls = classes.find((c) => String(c.id) === form.class_group_id);
      if (cls) {
        setForm((f) => ({ ...f, title: cls.name }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.class_group_id]);

  // Close on Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  function set(field: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required.'); return; }
    if (!form.class_group_id) { setError('Please select a class.'); return; }
    if (!form.date) { setError('Please pick a date.'); return; }
    if (!form.start_time) { setError('Start time is required.'); return; }

    const start_time = toISODateTime(form.date, form.start_time);
    const end_time   = toISODateTime(form.date, form.end_time);

    setSaving(true);
    setError(null);

    try {
      const result = await adminApi.createLesson({
        title:          form.title.trim(),
        class_group_id: parseInt(form.class_group_id, 10),
        start_time:     start_time!,
        end_time,
        location:       form.location.trim() || undefined,
        meet_link:      form.meet_link.trim() || undefined,
        description:    form.description.trim() || undefined,
      });
      setSuccess(true);
      onCreated?.({ id: result.id, title: form.title.trim() });
      setTimeout(onClose, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to schedule lesson.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const disabled = saving || success;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 200, padding: 20,
        animation: 'overlay-in 180ms ease',
      }}
    >
      <div style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-soft)',
        borderRadius: 20,
        boxShadow: '0 24px 64px -12px rgba(0,0,0,0.4)',
        width: '100%', maxWidth: 520,
        maxHeight: '90vh',
        overflowY: 'auto',
        scrollbarWidth: 'thin',
        scrollbarColor: 'var(--border-strong) transparent',
        animation: 'modal-in 200ms ease',
      }}>
        {/* Header */}
        <div style={{
          position: 'sticky', top: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px 18px',
          borderBottom: '1px solid var(--border-faint)',
          background: 'var(--bg-elevated)',
          zIndex: 1,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'color-mix(in oklab, var(--info) 14%, transparent)',
              display: 'grid', placeItems: 'center',
              color: 'var(--info)',
            }}>
              <CalendarPlus size={16} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg-strong)', lineHeight: 1.2 }}>
                Schedule lesson
              </div>
              <div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>
                Add a lesson to the schedule
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8,
              display: 'grid', placeItems: 'center',
              color: 'var(--fg-muted)', background: 'transparent',
              border: 'none', cursor: 'pointer',
              transition: 'background 120ms ease',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px 24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Class group */}
            <div>
              <Label required>Class</Label>
              <select
                value={form.class_group_id}
                onChange={(e) => set('class_group_id', e.target.value)}
                onFocus={() => setFocus('class_group_id')}
                onBlur={() => setFocus(null)}
                disabled={disabled || loadingClasses}
                style={{
                  ...inputStyle(focusField === 'class_group_id'),
                  appearance: 'none',
                  paddingRight: 32,
                  cursor: 'pointer',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 10px center',
                }}
              >
                <option value="">
                  {loadingClasses ? 'Loading classes…' : 'Select a class…'}
                </option>
                {classes.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.name}{c.year_level ? ` — ${c.year_level}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <Label required>Lesson title</Label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                onFocus={() => setFocus('title')}
                onBlur={() => setFocus(null)}
                placeholder="e.g. Maths Ext 1 — Inverse trig"
                disabled={disabled}
                style={inputStyle(focusField === 'title')}
                autoComplete="off"
              />
            </div>

            {/* Date + Times */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div>
                <Label required>Date</Label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => set('date', e.target.value)}
                  onFocus={() => setFocus('date')}
                  onBlur={() => setFocus(null)}
                  disabled={disabled}
                  style={inputStyle(focusField === 'date')}
                />
              </div>
              <div>
                <Label required>Start time</Label>
                <input
                  type="time"
                  value={form.start_time}
                  onChange={(e) => set('start_time', e.target.value)}
                  onFocus={() => setFocus('start_time')}
                  onBlur={() => setFocus(null)}
                  disabled={disabled}
                  style={inputStyle(focusField === 'start_time')}
                />
              </div>
              <div>
                <Label>End time</Label>
                <input
                  type="time"
                  value={form.end_time}
                  onChange={(e) => set('end_time', e.target.value)}
                  onFocus={() => setFocus('end_time')}
                  onBlur={() => setFocus(null)}
                  disabled={disabled}
                  style={inputStyle(focusField === 'end_time')}
                />
              </div>
            </div>

            {/* Location + Meet link */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <Label>Location</Label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => set('location', e.target.value)}
                  onFocus={() => setFocus('location')}
                  onBlur={() => setFocus(null)}
                  placeholder="e.g. Studio A"
                  disabled={disabled}
                  style={inputStyle(focusField === 'location')}
                  autoComplete="off"
                />
              </div>
              <div>
                <Label>
                  <Link2 size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                  Meet link
                </Label>
                <input
                  type="url"
                  value={form.meet_link}
                  onChange={(e) => set('meet_link', e.target.value)}
                  onFocus={() => setFocus('meet_link')}
                  onBlur={() => setFocus(null)}
                  placeholder="https://meet.google.com/…"
                  disabled={disabled}
                  style={inputStyle(focusField === 'meet_link')}
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <Label>Description / notes</Label>
              <textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                onFocus={() => setFocus('description')}
                onBlur={() => setFocus(null)}
                placeholder="Agenda, topics to cover, special instructions…"
                disabled={disabled}
                rows={3}
                style={{
                  ...inputStyle(focusField === 'description'),
                  height: 'auto', padding: '10px 12px',
                  resize: 'none', lineHeight: 1.55,
                }}
              />
            </div>

            {/* Error / Success */}
            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 14px', borderRadius: 9,
                background: 'color-mix(in oklab, var(--danger) 10%, transparent)',
                border: '1px solid color-mix(in oklab, var(--danger) 25%, transparent)',
                fontSize: 13, color: 'var(--danger)',
              }}>
                <AlertCircle size={14} style={{ flexShrink: 0 }} /> {error}
              </div>
            )}
            {success && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 14px', borderRadius: 9,
                background: 'color-mix(in oklab, var(--ok) 10%, transparent)',
                border: '1px solid color-mix(in oklab, var(--ok) 25%, transparent)',
                fontSize: 13, color: 'var(--ok)',
              }}>
                <CheckCircle size={14} style={{ flexShrink: 0 }} /> Lesson scheduled successfully!
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              style={{
                height: 40, padding: '0 18px', borderRadius: 10,
                fontSize: 13.5, fontWeight: 600,
                background: 'var(--bg-surface-2)',
                color: 'var(--fg-default)',
                border: '1px solid var(--border-soft)',
                cursor: 'pointer',
                transition: 'background 120ms ease',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={disabled}
              style={{
                height: 40, padding: '0 22px', borderRadius: 10,
                fontSize: 13.5, fontWeight: 700,
                background: disabled ? 'var(--bg-hover)' : 'var(--accent)',
                color: disabled ? 'var(--fg-muted)' : 'var(--accent-fg)',
                border: 'none', cursor: disabled ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
                transition: 'background 120ms ease, transform 120ms ease',
                boxShadow: disabled ? 'none' : '0 4px 14px -6px color-mix(in oklab, var(--accent) 60%, transparent)',
              }}
              onMouseEnter={(e) => { if (!disabled) (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ''; }}
            >
              {saving
                ? <><Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Scheduling…</>
                : 'Schedule lesson'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleLessonModal;
