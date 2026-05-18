/**
 * ConfirmDeleteModal — generic destructive-action confirmation dialog.
 *
 * Props:
 *   open        – controls visibility
 *   title       – modal heading (e.g. "Delete student")
 *   description – what will be deleted and consequences
 *   confirmLabel – label for the destructive button (default "Delete")
 *   loading     – shows spinner on confirm button while in flight
 *   onConfirm   – called when admin clicks the destructive button
 *   onCancel    – called when admin dismisses
 */

import React, { useEffect, useRef } from 'react';
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

  // Focus the cancel button (safer default) when modal opens
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => confirmRef.current?.focus(), 60);
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
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(6px)',
        animation: 'overlay-in 160ms ease',
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
          maxWidth: 440,
          overflow: 'hidden',
          animation: 'modal-in 200ms cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          padding: '22px 24px 0',
          gap: 16,
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
          padding: '10px 14px',
          borderRadius: 8,
          background: 'color-mix(in oklab, var(--danger) 6%, transparent)',
          border: '1px solid color-mix(in oklab, var(--danger) 18%, transparent)',
          fontSize: 12.5,
          color: 'var(--danger)',
          lineHeight: 1.5,
        }}>
          ⚠ This action will be recorded in the audit log and cannot be undone.
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
            disabled={loading}
            style={{
              height: 36, padding: '0 16px', borderRadius: 'var(--radius-btn, 9px)',
              fontSize: 13, fontWeight: 600, border: 'none',
              background: 'var(--danger)', color: '#fff',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              display: 'flex', alignItems: 'center', gap: 8,
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
