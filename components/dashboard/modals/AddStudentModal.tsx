/**
 * AddStudentModal.tsx
 *
 * Slide-in modal for creating a new student.
 * Calls adminApi.createStudent() and refreshes the parent's student list on success.
 */

import React, { useEffect, useRef, useState } from 'react';
import { X, UserPlus, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { adminApi } from '../../../services/adminApi';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AddStudentModalProps {
  onClose: () => void;
  onCreated?: (student: { id: number; full_name: string }) => void;
}

interface FormState {
  full_name:  string;
  email:      string;
  year_level: string;
  school:     string;
  notes:      string;
}

const YEAR_LEVELS = [
  'Year 3', 'Year 4', 'Year 5', 'Year 6',
  'Year 7', 'Year 8', 'Year 9', 'Year 10',
  'Year 11', 'Year 12 — HSC',
  'Year 12 — HSC Ext 1', 'Year 12 — HSC Ext 2',
  'Other',
];

// ---------------------------------------------------------------------------
// Shared input style factory
// ---------------------------------------------------------------------------

function inputStyle(focused: boolean): React.CSSProperties {
  return {
    width: '100%', height: 40,
    background: 'var(--bg-surface-2)',
    border: `1px solid ${focused ? 'var(--accent)' : 'var(--border-soft)'}`,
    borderRadius: 9, outline: 'none',
    padding: '0 12px',
    fontSize: 13.5, color: 'var(--fg-strong)',
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

const AddStudentModal: React.FC<AddStudentModalProps> = ({ onClose, onCreated }) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  const [form, setForm]       = useState<FormState>({
    full_name: '', email: '', year_level: '', school: '', notes: '',
  });
  const [focusField, setFocus] = useState<string | null>(null);
  const [saving, setSaving]    = useState(false);
  const [success, setSuccess]  = useState(false);
  const [error, setError]      = useState<string | null>(null);

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
    if (!form.full_name.trim()) {
      setError('Full name is required.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const result = await adminApi.createStudent({
        full_name:  form.full_name.trim(),
        email:      form.email.trim() || undefined,
        year_level: form.year_level || undefined,
        school:     form.school.trim() || undefined,
        notes:      form.notes.trim() || undefined,
      });
      setSuccess(true);
      onCreated?.({ id: result.id, full_name: form.full_name.trim() });
      // Auto-close after 1.2 s
      setTimeout(onClose, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create student.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  // Overlay click to close
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const inputField = (
    id: keyof FormState,
    placeholder: string,
    type = 'text',
  ) => (
    <input
      id={id}
      type={type}
      value={form[id]}
      placeholder={placeholder}
      onChange={(e) => set(id, e.target.value)}
      onFocus={() => setFocus(id)}
      onBlur={() => setFocus(null)}
      style={inputStyle(focusField === id)}
      disabled={saving || success}
      autoComplete="off"
    />
  );

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
      <div
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-soft)',
          borderRadius: 20,
          boxShadow: '0 24px 64px -12px rgba(0,0,0,0.4)',
          width: '100%', maxWidth: 480,
          animation: 'modal-in 200ms ease',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px 18px',
          borderBottom: '1px solid var(--border-faint)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'var(--accent-soft)',
              display: 'grid', placeItems: 'center',
              color: 'var(--accent)',
            }}>
              <UserPlus size={16} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg-strong)', lineHeight: 1.2 }}>
                Add student
              </div>
              <div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>
                Create a new portal account
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

            {/* Full name */}
            <div>
              <Label required>Full name</Label>
              {inputField('full_name', 'e.g. Amelia Tran')}
            </div>

            {/* Email */}
            <div>
              <Label>Email address</Label>
              {inputField('email', 'student@example.com', 'email')}
            </div>

            {/* Year level + School in a row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <Label>Year level</Label>
                <select
                  value={form.year_level}
                  onChange={(e) => set('year_level', e.target.value)}
                  onFocus={() => setFocus('year_level')}
                  onBlur={() => setFocus(null)}
                  disabled={saving || success}
                  style={{
                    ...inputStyle(focusField === 'year_level'),
                    appearance: 'none',
                    paddingRight: 32,
                    cursor: 'pointer',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 10px center',
                  }}
                >
                  <option value="">Select…</option>
                  {YEAR_LEVELS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>School</Label>
                {inputField('school', 'e.g. James Ruse')}
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label>Notes</Label>
              <textarea
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                onFocus={() => setFocus('notes')}
                onBlur={() => setFocus(null)}
                placeholder="Anything useful for tutors to know…"
                disabled={saving || success}
                rows={3}
                style={{
                  ...inputStyle(focusField === 'notes'),
                  height: 'auto', padding: '10px 12px',
                  resize: 'none', lineHeight: 1.55,
                }}
              />
            </div>

            {/* Error */}
            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 14px', borderRadius: 9,
                background: 'color-mix(in oklab, var(--danger) 10%, transparent)',
                border: '1px solid color-mix(in oklab, var(--danger) 25%, transparent)',
                fontSize: 13, color: 'var(--danger)',
              }}>
                <AlertCircle size={14} style={{ flexShrink: 0 }} />
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 14px', borderRadius: 9,
                background: 'color-mix(in oklab, var(--ok) 10%, transparent)',
                border: '1px solid color-mix(in oklab, var(--ok) 25%, transparent)',
                fontSize: 13, color: 'var(--ok)',
              }}>
                <CheckCircle size={14} style={{ flexShrink: 0 }} />
                Student created successfully!
              </div>
            )}

          </div>

          {/* Actions */}
          <div style={{
            display: 'flex', gap: 10, justifyContent: 'flex-end',
            marginTop: 24,
          }}>
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
              disabled={saving || success}
              style={{
                height: 40, padding: '0 22px', borderRadius: 10,
                fontSize: 13.5, fontWeight: 700,
                background: saving || success ? 'var(--bg-hover)' : 'var(--accent)',
                color: saving || success ? 'var(--fg-muted)' : 'var(--accent-fg)',
                border: 'none', cursor: saving || success ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
                transition: 'background 120ms ease, transform 120ms ease',
                boxShadow: saving || success ? 'none' : '0 4px 14px -6px color-mix(in oklab, var(--accent) 60%, transparent)',
              }}
              onMouseEnter={(e) => {
                if (!saving && !success) (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ''; }}
            >
              {saving ? <><Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Creating…</> : 'Create student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudentModal;
