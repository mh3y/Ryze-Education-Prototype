/**
 * ConfirmDialog — modal confirmation dialog.
 *
 * Accepts both the original variant-based API and the convenience boolean API
 * used by many admin pages so either form compiles cleanly:
 *
 *   // variant form
 *   <ConfirmDialog variant="danger" description="..." ... />
 *
 *   // boolean shorthand (used in most admin pages)
 *   <ConfirmDialog danger message="..." loading={deleting} ... />
 */

import React, { useState } from 'react';
import { AlertTriangle, Info } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  /** Body text — alias: message */
  description?: string;
  /** Alias for description (used by admin pages) */
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** 'danger' shows a red confirm button; 'default' uses amber. */
  variant?: 'danger' | 'default';
  /** Boolean shorthand for variant="danger" */
  danger?: boolean;
  /** External loading state — disables the confirm button while true. */
  loading?: boolean;
  /** If provided, the confirm button is disabled until the user types this. */
  confirmText?: string;
  /** Called when the user confirms. Can be async — button shows spinner while pending. */
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  description,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant,
  danger = false,
  loading = false,
  confirmText,
  onConfirm,
  onCancel,
}) => {
  const [typed, setTyped] = useState('');
  const [busy, setBusy]   = useState(false);

  if (!open) return null;

  // Resolve variant from both props
  const isDanger = variant === 'danger' || danger;
  // Resolve body text from both props
  const bodyText = description ?? message;

  const canConfirm = !confirmText || typed === confirmText;
  const isDisabled = busy || loading || !canConfirm;

  const handleConfirm = async () => {
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
      setTyped('');
    }
  };

  const btnClass = isDanger
    ? 'bg-red-500 hover:bg-red-600 text-white'
    : 'bg-[#FFB000] hover:bg-[#ffc133] text-[#050510]';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal
      aria-labelledby="confirm-dialog-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Panel */}
      <div className="relative z-10 bg-[#0a0f1e] border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-start gap-4 mb-4">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isDanger ? 'bg-red-500/10 text-red-400' : 'bg-[#FFB000]/10 text-[#FFB000]'
            }`}
          >
            {isDanger ? <AlertTriangle size={20} /> : <Info size={20} />}
          </div>
          <div>
            <h3 id="confirm-dialog-title" className="font-bold ryze-text-inverse mb-1">
              {title}
            </h3>
            {bodyText && (
              <p className="text-sm ryze-text-muted leading-relaxed">{bodyText}</p>
            )}
          </div>
        </div>

        {/* Confirmation text input */}
        {confirmText && (
          <div className="mb-5">
            <p className="text-xs ryze-text-muted mb-2">
              Type <strong className="ryze-text-inverse">{confirmText}</strong> to confirm:
            </p>
            <input
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#050510] border border-white/10 rounded-xl text-sm ryze-text-inverse focus:outline-none focus:border-red-500/50"
              placeholder={confirmText}
              autoFocus
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={onCancel}
            disabled={busy || loading}
            className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 ryze-text-inverse font-semibold text-sm border border-white/5 transition-colors disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isDisabled}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${btnClass}`}
          >
            {(busy || loading) && (
              <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
