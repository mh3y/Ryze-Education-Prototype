/**
 * ConfirmDeleteModal — destructive-action confirmation dialog.
 *
 * Requires the admin to type "CONFIRM" before the delete button is enabled.
 * This prevents accidental deletions and ensures intent is explicit.
 */

import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface Props {
  open: boolean;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const CONFIRM_PHRASE = 'CONFIRM';

const ConfirmDeleteModal: React.FC<Props> = ({
  open,
  title,
  description,
  confirmLabel = 'Delete',
  loading = false,
  onConfirm,
  onCancel,
}) => {
  const confirmRef = useRef<HTMLButtonElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);
  const [typed, setTyped] = useState('');

  // Reset text and focus input whenever modal opens
  useEffect(() => {
    setTyped('');
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onCancel]);

  const canConfirm = typed === CONFIRM_PHRASE;
  const isDisabled = loading || !canConfirm;

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(6px)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-soft)',
          borderRadius: 'var(--radius-card, 16px)',
          boxShadow: '0 24px 64px -12px rgba(0,0,0,0.6)',
          width: '100%',
          maxWidth: 460,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          padding: '22px 24px 0', gap: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, flexShrink: 0,
              background: 'color-mix(in oklab, var(--danger) 12%, transparent)',
              border: '1px solid color-mix(in oklab, var(--danger) 26%, transparent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--danger)',
            }}>
              <AlertTriangle size={18} />
            </div>
            <div>
              <h2 id="confirm-delete-title" style={{
                margin: 0, fontSize: 16, fontWeight: 700,
                color: 'var(--fg-strong)', lineHeight: 1.2,
              }}>
                {title}
              </h2>
            </div>
          </div>
          <button
            onClick={onCancel}
            aria-label="Close"
            style={{
              width: 28, height: 28, display: 'flex', alignItems: 'center',
              justifyContent: 'center', borderRadius: 7, border: 'none',
              background: 'transparent', color: 'var(--fg-muted)', cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '14px 24px 0', fontSize: 13.5, color: 'var(--fg-muted)', lineHeight: 1.6 }}>
          {description}
        </div>

        {/* Warning note */}
        <div style={{
          margin: '16px 24px 0',
          padding: '10px 14px', borderRadius: 8,
          background: 'color-mix(in oklab, var(--danger) 6%, transparent)',
          border: '1px solid color-mix(in oklab, var(--danger) 18%, transparent)',
          fontSize: 12.5, color: 'var(--danger)', lineHeight: 1.5,
        }}>
          ⚠ This action is permanent and will be recorded in the audit log.
        </div>

        {/* CONFIRM text gate */}
        <div style={{ padding: '16px 24px 0' }}>
          <label
            htmlFor="confirm-delete-input"
            style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--fg-muted)', marginBottom: 7 }}
          >
            Type{' '}
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 11.5,
              background: 'var(--bg-surface-2)',
              border: '1px solid var(--border-soft)',
              padding: '1px 6px', borderRadius: 4,
              color: 'var(--fg-strong)', letterSpacing: '0.06em',
            }}>
              CONFIRM
            </span>
            {' '}to proceed
          </label>
          <input
            id="confirm-delete-input"
            ref={inputRef}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && canConfirm && !isDisabled) onConfirm(); }}
            placeholder="CONFIRM"
            autoComplete="off"
            spellCheck={false}
            style={{
              width: '100%', padding: '9px 12px',
              background: 'var(--bg-surface-2)',
              border: `1px solid ${canConfirm
                ? 'color-mix(in oklab, var(--danger) 50%, transparent)'
                : 'var(--border-soft)'}`,
              borderRadius: 8, fontSize: 13,
              color: 'var(--fg-default)', outline: 'none',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.06em',
              boxSizing: 'border-box',
              transition: 'border-color 140ms ease',
            }}
          />
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: 10,
          padding: '20px 24px',
        }}>
          <button
            onClick={onCancel}
            disabled={loading}
            style={{
              height: 36, padding: '0 16px', borderRadius: 'var(--radius-btn, 9px)',
              fontSize: 13, fontWeight: 600, border: '1px solid var(--border-soft)',
              background: 'var(--bg-surface-2)', color: 'var(--fg-default)',
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
            }}
          >
            Cancel
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            disabled={isDisabled}
            title={canConfirm ? undefined : 'Type CONFIRM to enable this button'}
            style={{
              height: 36, padding: '0 16px', borderRadius: 'var(--radius-btn, 9px)',
              fontSize: 13, fontWeight: 600, border: 'none',
              background: 'var(--danger)', color: '#fff',
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              opacity: isDisabled ? 0.45 : 1,
              display: 'flex', alignItems: 'center', gap: 8,
              transition: 'opacity 140ms ease',
            }}
          >
            {loading && (
              <span style={{
                width: 13, height: 13, border: '2px solid rgba(255,255,255,0.4)',
                borderTopColor: '#fff', borderRadius: '50%',
                animation: 'spin 0.7s linear infinite',
                display: 'inline-block',
              }} />
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
