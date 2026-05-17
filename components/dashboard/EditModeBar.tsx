/**
 * EditModeBar.tsx — fixed bottom bar shown when admin edit mode is active.
 */

import React from 'react';
import { PanelRight, X } from 'lucide-react';
import { useDashboardCustomization } from '../../contexts/DashboardCustomizationContext';

interface EditModeBarProps {
  isPanelOpen: boolean;
  setIsPanelOpen: (open: boolean) => void;
}

export const EditModeBar: React.FC<EditModeBarProps> = ({ isPanelOpen, setIsPanelOpen }) => {
  const { exitEditMode } = useDashboardCustomization();

  return (
    <div
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        zIndex: 50,
        height: 56,
        display: 'flex', alignItems: 'center',
        padding: '0 24px',
        background: 'color-mix(in oklab, #1a1200 90%, transparent)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(245,158,11,0.3)',
        boxShadow: '0 -4px 32px rgba(0,0,0,0.5)',
        gap: 16,
      }}
    >
      {/* Left: badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 12, fontWeight: 700, letterSpacing: '0.04em',
          padding: '4px 10px', borderRadius: 999,
          background: 'rgba(245,158,11,0.2)',
          color: '#f59e0b',
          border: '1px solid rgba(245,158,11,0.4)',
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: '#f59e0b',
            boxShadow: '0 0 6px rgba(245,158,11,0.8)',
            animation: 'pulse 2s ease-in-out infinite',
          }} />
          Edit Mode Active
        </span>
      </div>

      {/* Center: hint */}
      <div style={{
        flex: 1, textAlign: 'center',
        fontSize: 12.5, color: 'rgba(255,255,255,0.5)',
      }}>
        Click any item to show/hide it. Changes save automatically.
      </div>

      {/* Right: actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <button
          onClick={() => setIsPanelOpen(!isPanelOpen)}
          style={{
            height: 34, padding: '0 14px',
            display: 'flex', alignItems: 'center', gap: 7,
            fontSize: 12.5, fontWeight: 600,
            background: isPanelOpen
              ? 'rgba(245,158,11,0.2)'
              : 'rgba(255,255,255,0.07)',
            color: isPanelOpen ? '#f59e0b' : 'rgba(255,255,255,0.75)',
            border: isPanelOpen
              ? '1px solid rgba(245,158,11,0.4)'
              : '1px solid rgba(255,255,255,0.12)',
            borderRadius: 8, cursor: 'pointer',
            transition: 'all 140ms ease',
          }}
          onMouseEnter={(e) => {
            if (!isPanelOpen) {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.12)';
              (e.currentTarget as HTMLElement).style.color = '#fff';
            }
          }}
          onMouseLeave={(e) => {
            if (!isPanelOpen) {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)';
              (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.75)';
            }
          }}
        >
          <PanelRight size={14} /> Open Panel
        </button>

        <button
          onClick={() => { exitEditMode(); setIsPanelOpen(false); }}
          style={{
            height: 34, padding: '0 14px',
            display: 'flex', alignItems: 'center', gap: 7,
            fontSize: 12.5, fontWeight: 600,
            background: 'rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.85)',
            border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: 8, cursor: 'pointer',
            transition: 'all 140ms ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.16)';
            (e.currentTarget as HTMLElement).style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)';
            (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.85)';
          }}
        >
          <X size={14} /> Done
        </button>
      </div>
    </div>
  );
};

export default EditModeBar;
