/**
 * MessagesPage — /dashboard/admin/messages
 *
 * Admin view of parent ↔ admin message threads.
 * Left panel: thread list. Right panel: active thread + reply box.
 *
 * Uses /api/messages endpoints (same as parentApi — access-controlled by role on backend).
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  MessageSquare, Search, RefreshCw, Send, X, CheckCheck,
  AlertCircle, Clock, ChevronRight, Loader2, ArrowLeft,
} from 'lucide-react';
import { parentApi, type MessageThread, type ThreadMessage } from '../../../services/parentApi';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function relTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString('en-AU', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
  });
}

function excerpt(body: string, max = 80): string {
  return body.length > max ? body.slice(0, max).trimEnd() + '…' : body;
}

// ---------------------------------------------------------------------------
// Shared styles
// ---------------------------------------------------------------------------

const cardStyle: React.CSSProperties = {
  background: 'var(--bg-surface)',
  border: '1px solid var(--border-faint)',
  borderRadius: 16,
  boxShadow: 'var(--shadow-card)',
  overflow: 'hidden',
};

const btnPrimary: React.CSSProperties = {
  height: 38, padding: '0 18px', borderRadius: 9,
  fontSize: 13, fontWeight: 600,
  display: 'inline-flex', alignItems: 'center', gap: 8,
  background: 'var(--accent)', color: 'var(--accent-fg)',
  border: 'none', cursor: 'pointer',
  boxShadow: '0 6px 18px -10px color-mix(in oklab, var(--accent) 70%, transparent)',
  transition: 'transform 140ms ease',
};

const btnGhost: React.CSSProperties = {
  height: 34, padding: '0 12px', borderRadius: 8,
  fontSize: 12.5, fontWeight: 600,
  display: 'inline-flex', alignItems: 'center', gap: 6,
  background: 'var(--bg-surface)', color: 'var(--fg-muted)',
  border: '1px solid var(--border-soft)', cursor: 'pointer',
  transition: 'all 140ms ease',
};

// ---------------------------------------------------------------------------
// Thread list item
// ---------------------------------------------------------------------------

const ThreadItem: React.FC<{
  thread: MessageThread;
  active: boolean;
  onClick: () => void;
}> = ({ thread, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      width: '100%', textAlign: 'left',
      display: 'flex', alignItems: 'flex-start', gap: 12,
      padding: '14px 18px',
      background: active ? 'color-mix(in oklab, var(--accent) 8%, transparent)' : 'transparent',
      borderBottom: '1px solid var(--border-faint)',
      border: 'none', cursor: 'pointer',
      transition: 'background 120ms ease',
      borderLeft: active ? '3px solid var(--accent)' : '3px solid transparent',
    }}
    onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; }}
    onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
  >
    {/* Avatar */}
    <div style={{
      width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
      background: 'color-mix(in oklab, var(--accent) 18%, var(--bg-surface))',
      color: 'var(--accent)',
      display: 'grid', placeItems: 'center',
      fontSize: 13, fontWeight: 700,
    }}>
      {thread.subject.charAt(0).toUpperCase()}
    </div>

    {/* Content */}
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 3 }}>
        <div style={{
          fontSize: 13, fontWeight: thread.unread_count > 0 ? 700 : 600,
          color: 'var(--fg-strong)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {thread.subject}
        </div>
        <div style={{ fontSize: 11, color: 'var(--fg-faint)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap', flexShrink: 0 }}>
          {relTime(thread.updated_at)}
        </div>
      </div>
      <div style={{
        fontSize: 12, color: 'var(--fg-muted)', lineHeight: 1.4,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {thread.last_message ? excerpt(thread.last_message.body) : 'No messages yet'}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
        {/* Status badge */}
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
          padding: '2px 7px', borderRadius: 999,
          background: thread.status === 'open'
            ? 'color-mix(in oklab, var(--ok) 14%, transparent)'
            : 'var(--bg-hover)',
          color: thread.status === 'open' ? 'var(--ok)' : 'var(--fg-muted)',
          border: `1px solid ${thread.status === 'open' ? 'color-mix(in oklab, var(--ok) 26%, transparent)' : 'var(--border-soft)'}`,
        }}>
          {thread.status}
        </span>
        {thread.unread_count > 0 && (
          <span style={{
            fontSize: 10, fontWeight: 700,
            padding: '2px 7px', borderRadius: 999,
            background: 'var(--accent-soft)',
            color: 'var(--accent)',
            border: '1px solid color-mix(in oklab, var(--accent) 28%, transparent)',
          }}>
            {thread.unread_count} new
          </span>
        )}
      </div>
    </div>
  </button>
);

// ---------------------------------------------------------------------------
// Message bubble
// ---------------------------------------------------------------------------

const MessageBubble: React.FC<{ msg: ThreadMessage }> = ({ msg }) => {
  const isAdmin = msg.sender_type === 'admin';
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: isAdmin ? 'flex-end' : 'flex-start',
      marginBottom: 16,
    }}>
      <div style={{
        maxWidth: '72%',
        background: isAdmin
          ? 'color-mix(in oklab, var(--accent) 14%, var(--bg-surface))'
          : 'var(--bg-surface-2)',
        border: `1px solid ${isAdmin ? 'color-mix(in oklab, var(--accent) 28%, transparent)' : 'var(--border-soft)'}`,
        borderRadius: isAdmin ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
        padding: '10px 14px',
      }}>
        <div style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--fg-default)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {msg.body}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
        <span style={{ fontSize: 11, color: 'var(--fg-faint)' }}>
          {msg.sender_name ?? (isAdmin ? 'Admin' : 'Parent')}
        </span>
        <span style={{ fontSize: 10, color: 'var(--fg-faint)', fontFamily: 'var(--font-mono)' }}>
          {fmtDate(msg.created_at)}
        </span>
        {isAdmin && msg.read && (
          <CheckCheck size={11} style={{ color: 'var(--ok)' }} />
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Thread detail panel
// ---------------------------------------------------------------------------

const ThreadDetail: React.FC<{
  thread: MessageThread;
  onBack: () => void;
  onUpdated: () => void;
}> = ({ thread, onBack, onUpdated }) => {
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [reply,    setReply]    = useState('');
  const [sending,  setSending]  = useState(false);
  const [sendErr,  setSendErr]  = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { messages: msgs } = await parentApi.getThread(thread.id);
      setMessages(msgs);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [thread.id]);

  useEffect(() => { load(); }, [load]);

  // Scroll to bottom when messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const body = reply.trim();
    if (!body || sending) return;
    setSending(true);
    setSendErr(null);
    try {
      await parentApi.replyToThread(thread.id, body);
      setReply('');
      await load();
      onUpdated();
    } catch (e: any) {
      setSendErr(e?.message ?? 'Send failed');
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Thread header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '16px 22px', borderBottom: '1px solid var(--border-faint)', flexShrink: 0,
      }}>
        <button style={{ ...btnGhost, border: 'none', background: 'transparent', padding: '0 4px' }} onClick={onBack}>
          <ArrowLeft size={16} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg-strong)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {thread.subject}
          </div>
          <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={11} />
            Opened {relTime(thread.created_at)} · {messages.length} message{messages.length !== 1 ? 's' : ''}
          </div>
        </div>
        <span style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
          padding: '3px 10px', borderRadius: 999,
          background: thread.status === 'open' ? 'color-mix(in oklab, var(--ok) 14%, transparent)' : 'var(--bg-hover)',
          color: thread.status === 'open' ? 'var(--ok)' : 'var(--fg-muted)',
          border: `1px solid ${thread.status === 'open' ? 'color-mix(in oklab, var(--ok) 26%, transparent)' : 'var(--border-soft)'}`,
        }}>
          {thread.status}
        </span>
      </div>

      {/* Message list */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '20px 22px',
        scrollbarWidth: 'thin', scrollbarColor: 'var(--border-strong) transparent',
      }}>
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
            <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--fg-muted)' }} />
          </div>
        )}
        {error && !loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--danger)', fontSize: 13, padding: '20px 0' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}
        {!loading && messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--fg-muted)', fontSize: 13, padding: '40px 0' }}>
            No messages yet. Start the conversation below.
          </div>
        )}
        {!loading && messages.map((m) => <MessageBubble key={m.id} msg={m} />)}
        <div ref={bottomRef} />
      </div>

      {/* Reply box */}
      <div style={{
        borderTop: '1px solid var(--border-faint)',
        padding: '14px 22px', flexShrink: 0,
        background: 'var(--bg-surface)',
      }}>
        {sendErr && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--danger)', marginBottom: 10 }}>
            <AlertCircle size={13} /> {sendErr}
          </div>
        )}
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <textarea
            ref={textareaRef}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Reply to parent… (Cmd+Enter to send)"
            rows={3}
            style={{
              flex: 1, padding: '10px 14px',
              background: 'var(--bg-surface-2)',
              border: '1px solid var(--border-soft)',
              borderRadius: 10, fontSize: 13,
              color: 'var(--fg-default)', outline: 'none',
              resize: 'none', fontFamily: 'var(--font-sans)',
              transition: 'border-color 140ms ease',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
            onBlur={(e)  => { e.currentTarget.style.borderColor = 'var(--border-soft)'; }}
          />
          <button
            onClick={handleSend}
            disabled={!reply.trim() || sending}
            style={{
              ...btnPrimary,
              height: 42, opacity: (!reply.trim() || sending) ? 0.5 : 1,
              cursor: (!reply.trim() || sending) ? 'not-allowed' : 'pointer',
            }}
          >
            {sending
              ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
              : <Send size={14} />}
            {sending ? 'Sending…' : 'Send'}
          </button>
        </div>
        <div style={{ fontSize: 11, color: 'var(--fg-faint)', marginTop: 6 }}>
          Cmd+Enter to send · replies are visible to the parent immediately
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const MessagesPage: React.FC = () => {
  const [threads,       setThreads]       = useState<MessageThread[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState<string | null>(null);
  const [activeThread,  setActiveThread]  = useState<MessageThread | null>(null);
  const [query,         setQuery]         = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await parentApi.getThreads();
      setThreads(data);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load threads');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = threads.filter((t) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return t.subject.toLowerCase().includes(q)
      || (t.last_message?.body ?? '').toLowerCase().includes(q);
  });

  const totalUnread = threads.reduce((s, t) => s + t.unread_count, 0);
  const openCount   = threads.filter((t) => t.status === 'open').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>

      {/* Page head */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 10 }}>
          Parent communications
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontStyle: 'var(--font-display-style)',
              fontWeight: 'var(--font-display-weight)' as any,
              fontSize: 'clamp(38px, 3.5vw, 54px)', lineHeight: 1.08,
              letterSpacing: '-0.018em', color: 'var(--fg-strong)', margin: 0,
            }}>
              Messages
            </h1>
            <p style={{ fontSize: 14, color: 'var(--fg-muted)', margin: '10px 0 0' }}>
              {openCount} open thread{openCount !== 1 ? 's' : ''}{totalUnread > 0 ? ` · ${totalUnread} unread` : ' · all caught up'}.
            </p>
          </div>
          <button
            style={btnGhost}
            onClick={load}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--fg-strong)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--fg-muted)'; }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Two-panel layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: activeThread ? '320px 1fr' : '1fr',
        gap: 'var(--gap-md)',
        alignItems: 'start',
      }}>

        {/* ── Thread list ─────────────────────────────────────────── */}
        <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', maxHeight: '80vh' }}>
          {/* Search */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-faint)', flexShrink: 0 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--bg-surface-2)', border: '1px solid var(--border-soft)',
              borderRadius: 9, padding: '8px 12px',
            }}>
              <Search size={13} style={{ color: 'var(--fg-muted)', flexShrink: 0 }} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search threads…"
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13, color: 'var(--fg-default)', flex: 1 }}
              />
              {query && (
                <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-muted)', display: 'flex', alignItems: 'center' }}>
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: 'var(--border-strong) transparent' }}>
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
                <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--fg-muted)' }} />
              </div>
            )}
            {error && !loading && (
              <div style={{ padding: '24px 18px', color: 'var(--danger)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={15} /> {error}
              </div>
            )}
            {!loading && filtered.length === 0 && (
              <div style={{ padding: '48px 18px', textAlign: 'center' }}>
                <MessageSquare size={32} style={{ color: 'var(--fg-faint)', marginBottom: 12 }} />
                <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--fg-muted)' }}>
                  {query ? 'No threads match your search' : 'No message threads yet'}
                </div>
                {!query && (
                  <div style={{ fontSize: 12, color: 'var(--fg-faint)', marginTop: 6 }}>
                    Parents can start threads from their portal.
                  </div>
                )}
              </div>
            )}
            {!loading && filtered.map((t) => (
              <ThreadItem
                key={t.id}
                thread={t}
                active={activeThread?.id === t.id}
                onClick={() => setActiveThread(t)}
              />
            ))}
          </div>
        </div>

        {/* ── Thread detail ────────────────────────────────────────── */}
        {activeThread && (
          <div style={{ ...cardStyle, height: '80vh', display: 'flex', flexDirection: 'column' }}>
            <ThreadDetail
              thread={activeThread}
              onBack={() => setActiveThread(null)}
              onUpdated={() => {
                // Refresh thread list to update unread counts + last message preview
                load().then(() => {
                  // Keep active thread selected — find updated version
                  setThreads((prev) => {
                    const updated = prev.find((t) => t.id === activeThread.id);
                    if (updated) setActiveThread(updated);
                    return prev;
                  });
                });
              }}
            />
          </div>
        )}

        {/* ── Empty state when no thread selected ─────────────────── */}
        {!activeThread && !loading && filtered.length > 0 && (
          <div style={{
            ...cardStyle,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            minHeight: 360, padding: 48, textAlign: 'center',
          }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--bg-surface-2)', display: 'grid', placeItems: 'center', marginBottom: 16 }}>
              <MessageSquare size={26} style={{ color: 'var(--fg-faint)' }} strokeWidth={1.5} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg-default)', marginBottom: 6 }}>Select a thread</div>
            <div style={{ fontSize: 13, color: 'var(--fg-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <ChevronRight size={13} /> Choose a conversation from the list
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
