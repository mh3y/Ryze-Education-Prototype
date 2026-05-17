/**
 * PlaceholderPage — Ryze Portal redesign
 *
 * "In design" empty state for modules not yet built.
 */

import React from 'react';
import { useLocation } from 'react-router-dom';
import { Clock, ArrowUpRight } from 'lucide-react';

const PlaceholderPage: React.FC<{ title?: string }> = ({ title }) => {
  const location = useLocation();
  const segment  = location.pathname.split('/').filter(Boolean).pop() ?? 'page';
  const displayTitle = title ?? segment
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return (
    <div className="ryze-portal" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>

      {/* PageHead */}
      <div>
        <div style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '0.16em',
          textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 10,
        }}>
          Coming up
        </div>
        <h1 style={{
          fontFamily: '"Cormorant Garamond", "Times New Roman", serif',
          fontStyle: 'italic', fontWeight: 500,
          fontSize: 'clamp(38px, 3.5vw, 54px)',
          lineHeight: 1.08, letterSpacing: '-0.018em',
          color: 'var(--fg-strong)', margin: 0,
        }}>
          {displayTitle}
        </h1>
      </div>

      {/* Card with centered empty state */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-faint)',
        borderRadius: 16,
        padding: 'var(--card-pad)',
        boxShadow: 'var(--shadow-card)',
      }}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '64px 24px',
          textAlign: 'center', gap: 20,
        }}>
          {/* Art tile */}
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: 'var(--bg-surface-2)',
            border: '1px solid var(--border-soft)',
            display: 'grid', placeItems: 'center',
            color: 'var(--fg-muted)',
          }}>
            <Clock size={26} strokeWidth={1.6} />
          </div>

          {/* Title */}
          <div style={{
            fontFamily: '"Cormorant Garamond", "Times New Roman", serif',
            fontStyle: 'italic', fontWeight: 500, fontSize: 28,
            color: 'var(--fg-strong)', lineHeight: 1.1,
          }}>
            In design
          </div>

          {/* Body */}
          <p style={{
            fontSize: 14, color: 'var(--fg-muted)',
            lineHeight: 1.55, maxWidth: '38ch', margin: 0,
          }}>
            This module is part of the portal scope — wireframes ready, page-level
            mock coming in the next iteration. The shell, type, colour and density
            choices above apply here too.
          </p>

          {/* Ghost button */}
          <button style={{
            height: 38, padding: '0 16px', borderRadius: 9,
            fontSize: 13, fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--bg-surface)',
            color: 'var(--fg-default)',
            border: '1px solid var(--border-soft)',
            cursor: 'pointer',
            transition: 'transform 140ms ease, border-color 140ms ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = '';
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-soft)';
          }}
          >
            Open in Figma <ArrowUpRight size={13} />
          </button>
        </div>
      </div>

    </div>
  );
};

export default PlaceholderPage;
