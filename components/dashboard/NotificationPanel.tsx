/**
 * NotificationPanel.tsx
 *
 * Dropdown notification panel that appears when the bell is clicked.
 * Anchored below-right of the bell button.
 */

import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, AlertTriangle, BookOpen, CreditCard,
  User, Settings, CheckCheck, RefreshCw, X,
} from 'lucide-react';
import {
  useNotifications, Notification, NotifType, relativeTime,
} from '../../contexts/NotificationsContext';

// ---------------------------------------------------------------------------
// Icon + colour per type
// ---------------------------------------------------------------------------

const TYPE_META: Record<NotifType, {
  Icon: React.ElementType;
  bg: string;
  fg: string;
}> = {
  alert:   { Icon: AlertTriangle, bg: 'color-mix(in oklab, var(--danger) 14%, transparent)', fg: 'var(--danger)' },
  lesson:  { Icon: BookOpen,      bg: 'var(--accent-soft)',                                   fg: 'var(--accent)' },
  payment: { Icon: CreditCard,    bg: 'color-mix(in oklab, var(--ok) 14%, transparent)',      fg: 'var(--ok)' },
  student: { Icon: User,          bg: 'color-mix(in oklab, var(--info) 14%, transparent)',    fg: 'var(--info)' },
  system:  { Icon: Settings,      bg: 'var(--bg-hover)',                                      fg: 'var(--fg-muted)' },
};

// ---------------------------------------------------------------------------
// Single row
// ---------------------------------------------------------------------------

const NotifRow: React.FC<{
  notif: Notification;
  isRead: boolean;
  onRead: () => void;
  onNav: () => void;
}> = ({ notif, isRead, onRead, onNav }) => {
  const { Icon, bg, fg } = TYPE_META[notif.type];

  const handleClick = () => {
    onRead();
    onNav();
  };

  return (
    <button
      onClick={handleClick}
      style={{
        width: '100%', textAlign: 'left',
        display: 'flex', alignItems: 'flex-start', gap: 12,
        padding: '12px 16px',
        background: isRead ? 'transparent' : 'color-mix(in oklab, var(--accent) 4%, transparent)',
        borderBottom: '1px solid var(--border-faint)',
        border: 'none',
        cursor: 'pointer',
        transition: 'background 120ms ease',
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = isRead
          ? 'transparent'
          : 'color-mix(in oklab, var(--accent) 4%, transparent)';
      }}
    >
      {/* Icon bubble */}
      <div style={{
        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
        background: bg, color: fg,
        display: 'grid', placeItems: 'center',
        marginTop: 1,
      }}>
        <Icon size={14} />
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: isRead ? 500 : 600,
          color: isRead ? 'var(--fg-default)' : 'var(--fg-strong)',
          lineHeight: 1.3, marginBottom: 3,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {notif.title}
        </div>
        <div style={{
          fontSize: 12, color: 'var(--fg-muted)', lineHeight: 1.4,
          overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>
          {notif.body}
        </div>
        <div style={{
          fontSize: 11, color: 'var(--fg-faint)',
          fontFamily: 'var(--font-mono)', marginTop: 4,
        }}>
          {relativeTime(notif.created_at)}
        </div>
      </div>

      {/* Unread pip */}
      {!isRead && (
        <div style={{
          width: 6, height: 6, borderRadius: 999,
          background: 'var(--accent)', flexShrink: 0,
          marginTop: 6,
        }} />
      )}
    </button>
  );
};

// ---------------------------------------------------------------------------
// Panel
// ---------------------------------------------------------------------------

interface NotificationPanelProps {
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ onClose }) => {
  const { notifications, unreadCount, loading, markRead, markAllRead, refresh } = useNotifications();
  const navigate = useNavigate();
  const panelRef  = useRef<HTMLDivElement>(null);

  // Read IDs from localStorage (mirrors context)
  const readSet = React.useMemo(() => {
    try {
      const raw = localStorage.getItem('ryze_notifications_read');
      return new Set<string>(raw ? JSON.parse(raw) : []);
    } catch { return new Set<string>(); }
  }, [notifications]); // recompute when notifications change

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Delay adding listener so the bell-click that opened the panel doesn't
    // immediately close it
    const t = setTimeout(() => document.addEventListener('mousedown', handler), 50);
    return () => {
      clearTimeout(t);
      document.removeEventListener('mousedown', handler);
    };
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      ref={panelRef}
      style={{
        position: 'absolute',
        top: 'calc(100% + 8px)',
        right: 0,
        width: 380,
        maxHeight: 520,
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-soft)',
        borderRadius: 16,
        boxShadow: '0 16px 48px -8px rgba(0,0,0,0.36), 0 4px 16px -4px rgba(0,0,0,0.18)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: 100,
        animation: 'notif-in 160ms ease',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px 12px',
        borderBottom: '1px solid var(--border-faint)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bell size={15} style={{ color: 'var(--fg-muted)' }} />
          <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--fg-strong)' }}>
            Notifications
          </span>
          {unreadCount > 0 && (
            <span style={{
              fontSize: 11, fontWeight: 700,
              padding: '1px 7px', borderRadius: 999,
              background: 'var(--accent-soft)',
              color: 'var(--accent)',
              border: '1px solid color-mix(in oklab, var(--accent) 26%, transparent)',
            }}>
              {unreadCount} new
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              title="Mark all read"
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                height: 28, padding: '0 10px', borderRadius: 7,
                fontSize: 12, fontWeight: 600,
                color: 'var(--fg-muted)', background: 'transparent',
                border: '1px solid var(--border-soft)', cursor: 'pointer',
                transition: 'all 120ms ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = 'var(--fg-strong)';
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = 'var(--fg-muted)';
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-soft)';
              }}
            >
              <CheckCheck size={12} /> Mark all read
            </button>
          )}
          <button
            onClick={refresh}
            title="Refresh"
            style={{
              width: 28, height: 28, borderRadius: 7,
              display: 'grid', placeItems: 'center',
              color: 'var(--fg-muted)', background: 'transparent',
              border: 'none', cursor: 'pointer',
              transition: 'background 120ms ease, color 120ms ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)';
              (e.currentTarget as HTMLElement).style.color = 'var(--fg-strong)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
              (e.currentTarget as HTMLElement).style.color = 'var(--fg-muted)';
            }}
          >
            <RefreshCw size={13} />
          </button>
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28, borderRadius: 7,
              display: 'grid', placeItems: 'center',
              color: 'var(--fg-muted)', background: 'transparent',
              border: 'none', cursor: 'pointer',
              transition: 'background 120ms ease, color 120ms ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)';
              (e.currentTarget as HTMLElement).style.color = 'var(--fg-strong)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
              (e.currentTarget as HTMLElement).style.color = 'var(--fg-muted)';
            }}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* List */}
      <div style={{
        flex: 1, overflowY: 'auto',
        scrollbarWidth: 'thin',
        scrollbarColor: 'var(--border-strong) transparent',
      }}>
        {loading && (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--fg-muted)', fontSize: 13 }}>
            Loading notifications…
          </div>
        )}
        {!loading && notifications.length === 0 && (
          <div style={{
            padding: '40px 24px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
            textAlign: 'center',
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: 'var(--bg-surface-2)',
              display: 'grid', placeItems: 'center',
              color: 'var(--fg-faint)',
            }}>
              <Bell size={22} strokeWidth={1.5} />
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--fg-default)' }}>
              All caught up
            </div>
            <div style={{ fontSize: 12, color: 'var(--fg-muted)', lineHeight: 1.5 }}>
              No notifications at the moment.
            </div>
          </div>
        )}
        {!loading && notifications.map((n) => (
          <NotifRow
            key={n.id}
            notif={n}
            isRead={readSet.has(n.id)}
            onRead={() => markRead(n.id)}
            onNav={() => {
              onClose();
              if (n.href) navigate(n.href);
            }}
          />
        ))}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div style={{
          flexShrink: 0,
          padding: '10px 16px',
          borderTop: '1px solid var(--border-faint)',
          textAlign: 'center',
        }}>
          <button
            onClick={() => { onClose(); navigate('/dashboard/admin/alerts'); }}
            style={{
              fontSize: 12.5, fontWeight: 600,
              color: 'var(--accent)', background: 'transparent',
              border: 'none', cursor: 'pointer',
              transition: 'opacity 120ms ease',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.75'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
          >
            View all alerts →
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
