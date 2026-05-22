/**
 * TutorDetail — /dashboard/admin/tutors/:id
 *
 * Tabs: Profile | Classes | Payments
 * All data from real API — no hardcoded values.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Save, GraduationCap, BookOpen,
  CreditCard, Edit2, Check, AlertCircle,
  DollarSign, CheckCircle, Clock, RefreshCw,
} from 'lucide-react';
import {
  adminApi,
  type TutorDetail as TTutorDetail,
  type TutorPayment,
} from '../../../services/adminApi';
import { auditLog } from '../../../services/auditLog';
import { useAuth } from '../../../contexts/AuthContext';
import {
  StatusBadge, LoadingState, ErrorState, EmptyState,
} from '../../../components/dashboard/ui';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-AU', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  } catch { return iso as string; }
}

function fmtCents(cents: number | string | null | undefined): string {
  const n = Number(cents ?? 0);
  return `$${(n / 100).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

type Tab = 'profile' | 'classes' | 'payments';

const TAB_LABELS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'profile',  label: 'Profile',  icon: <GraduationCap size={14} /> },
  { id: 'classes',  label: 'Classes',  icon: <BookOpen size={14} /> },
  { id: 'payments', label: 'Payments', icon: <CreditCard size={14} /> },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div style={{
    display: 'flex', gap: 16, padding: '11px 0',
    borderBottom: '1px solid var(--border-faint)',
    alignItems: 'flex-start',
  }}>
    <div style={{ width: 160, flexShrink: 0, fontSize: 12, fontWeight: 600, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', paddingTop: 2 }}>
      {label}
    </div>
    <div style={{ flex: 1, fontSize: 14, color: 'var(--fg-strong)', wordBreak: 'break-word' }}>
      {value ?? <span style={{ color: 'var(--fg-faint)' }}>—</span>}
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const TutorDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  const [tutor, setTutor]     = useState<TTutorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [activeTab, setTab]   = useState<Tab>('profile');

  // Profile edit
  const [editing, setEditing]   = useState(false);
  const [draft, setDraft]       = useState({ bio: '', subjects: '', hourly_rate: '' });
  const [saving, setSaving]     = useState(false);
  const [saveMsg, setSaveMsg]   = useState<string | null>(null);

  // Deactivate
  const [deactivating, setDeactivating] = useState(false);

  // Payments tab
  const [payments, setPayments]         = useState<TutorPayment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsError, setPaymentsError]     = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const t = await adminApi.getTutor(Number(id));
      setTutor(t);
      setDraft({
        bio: t.bio ?? '',
        subjects: t.subjects ?? '',
        hourly_rate: t.hourly_rate !== null ? String(t.hourly_rate) : '',
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load tutor.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // Load payments when tab is clicked
  const loadPayments = useCallback(async () => {
    if (!tutor) return;
    setPaymentsLoading(true);
    setPaymentsError(null);
    try {
      const { items } = await adminApi.getTutorPayments({ tutor_user_id: tutor.id, limit: 100 });
      setPayments(items);
    } catch (e: unknown) {
      setPaymentsError(e instanceof Error ? e.message : 'Failed to load payments.');
    } finally {
      setPaymentsLoading(false);
    }
  }, [tutor]);

  useEffect(() => {
    if (activeTab === 'payments' && tutor) loadPayments();
  }, [activeTab, tutor, loadPayments]);

  // ── Save profile ──────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!tutor) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      await adminApi.updateTutorProfile(tutor.id, {
        bio: draft.bio || undefined,
        subjects: draft.subjects || undefined,
        hourly_rate: draft.hourly_rate ? Number(draft.hourly_rate) : undefined,
      });
      auditLog.log('update', 'tutor', tutor.id, tutor.full_name, authUser?.name ?? 'Admin');
      setSaveMsg('Saved');
      setEditing(false);
      load();
    } catch (e: unknown) {
      setSaveMsg(e instanceof Error ? e.message : 'Save failed.');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(null), 3000);
    }
  };

  // ── Deactivate ────────────────────────────────────────────────────────────

  const handleDeactivate = async () => {
    if (!tutor || !window.confirm(`Deactivate ${tutor.full_name}? They will lose portal access.`)) return;
    setDeactivating(true);
    try {
      await adminApi.deactivateTutor(tutor.id);
      auditLog.log('deactivate', 'tutor', tutor.id, tutor.full_name, authUser?.name ?? 'Admin');
      load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Failed to deactivate.');
    } finally {
      setDeactivating(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) return <LoadingState message="Loading tutor…" />;
  if (error || !tutor) return (
    <ErrorState
      message={error ?? 'Tutor not found.'}
      onRetry={load}
    />
  );

  const hourlyRate = tutor.hourly_rate !== null ? `$${tutor.hourly_rate}/hr` : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Back + header ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
        <button
          onClick={() => navigate('/dashboard/admin/tutors')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 12px', borderRadius: 9,
            background: 'var(--bg-surface-2)', border: '1px solid var(--border-soft)',
            fontSize: 13, fontWeight: 600, color: 'var(--fg-muted)',
            cursor: 'pointer', flexShrink: 0, marginTop: 4,
          }}
        >
          <ArrowLeft size={14} /> Tutors
        </button>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 8 }}>
            Tutor Profile
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{
              width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
              background: 'color-mix(in oklab, var(--accent) 22%, var(--bg-surface))',
              color: '#b8841e',
              display: 'grid', placeItems: 'center',
              fontSize: 16, fontWeight: 700,
            }}>
              {tutor.full_name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()}
            </div>
            <div>
              <h1 style={{
                fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 500,
                fontSize: 'clamp(28px, 3vw, 40px)', lineHeight: 1.1, letterSpacing: '-0.016em',
                color: 'var(--fg-strong)', margin: 0,
              }}>
                {tutor.full_name}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                <StatusBadge value={tutor.active} />
                {hourlyRate && (
                  <span style={{
                    fontSize: 12, fontWeight: 600, padding: '3px 8px', borderRadius: 999,
                    background: 'color-mix(in oklab, var(--accent) 12%, transparent)',
                    color: 'var(--accent)',
                    border: '1px solid color-mix(in oklab, var(--accent) 25%, transparent)',
                  }}>
                    {hourlyRate}
                  </span>
                )}
                {tutor.subjects && (
                  <span style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{tutor.subjects}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {tutor.active && (
            <button
              onClick={handleDeactivate}
              disabled={deactivating}
              style={{
                height: 36, padding: '0 14px', borderRadius: 9,
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                background: 'color-mix(in oklab, var(--danger) 10%, transparent)',
                color: 'var(--danger)',
                border: '1px solid color-mix(in oklab, var(--danger) 25%, transparent)',
              }}
            >
              {deactivating ? 'Deactivating…' : 'Deactivate'}
            </button>
          )}
          <button
            onClick={load}
            style={{
              height: 36, width: 36, borderRadius: 9,
              background: 'var(--bg-surface-2)', border: '1px solid var(--border-soft)',
              cursor: 'pointer', display: 'grid', placeItems: 'center', color: 'var(--fg-muted)',
            }}
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border-faint)', paddingBottom: 1 }}>
        {TAB_LABELS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: '9px 9px 0 0',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              border: 'none',
              background: activeTab === t.id ? 'var(--bg-surface)' : 'transparent',
              color: activeTab === t.id ? 'var(--fg-strong)' : 'var(--fg-muted)',
              borderBottom: activeTab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
              transition: 'color 140ms ease',
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Profile ──────────────────────────────────────────────────── */}
      {activeTab === 'profile' && (
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border-faint)',
          borderRadius: 'var(--radius-card, 16px)', padding: '20px 28px',
          boxShadow: 'var(--shadow-card)',
        }}>
          {/* Profile header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--fg-muted)' }}>
              Tutor Information
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {saveMsg && (
                <span style={{
                  fontSize: 12, fontWeight: 600,
                  color: saveMsg === 'Saved' ? 'var(--ok)' : 'var(--danger)',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  {saveMsg === 'Saved' ? <Check size={13} /> : <AlertCircle size={13} />}
                  {saveMsg}
                </span>
              )}
              {editing ? (
                <>
                  <button
                    onClick={() => { setEditing(false); setDraft({ bio: tutor.bio ?? '', subjects: tutor.subjects ?? '', hourly_rate: tutor.hourly_rate !== null ? String(tutor.hourly_rate) : '' }); }}
                    style={{ height: 32, padding: '0 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: 'var(--bg-surface-2)', border: '1px solid var(--border-soft)', color: 'var(--fg-muted)' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{ height: 32, padding: '0 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: 'var(--accent)', color: 'var(--accent-fg)', border: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <Save size={12} /> {saving ? 'Saving…' : 'Save'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  style={{ height: 32, padding: '0 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: 'var(--bg-surface-2)', border: '1px solid var(--border-soft)', color: 'var(--fg-muted)', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Edit2 size={12} /> Edit
                </button>
              )}
            </div>
          </div>

          {/* Read-only info */}
          <InfoRow label="Full Name"   value={tutor.full_name} />
          <InfoRow label="Email"       value={tutor.email ? <a href={`mailto:${tutor.email}`} style={{ color: 'var(--accent)' }}>{tutor.email}</a> : null} />
          <InfoRow label="Discord ID"  value={tutor.discord_user_id ? <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{tutor.discord_user_id}</span> : null} />
          <InfoRow label="Status"      value={<StatusBadge value={tutor.active} />} />
          <InfoRow label="Member Since" value={fmtDate(tutor.created_at)} />
          <InfoRow label="Classes"     value={`${tutor.class_count} active class${tutor.class_count !== 1 ? 'es' : ''}`} />

          {/* Editable fields */}
          <div style={{ padding: '11px 0', borderBottom: '1px solid var(--border-faint)', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{ width: 160, flexShrink: 0, fontSize: 12, fontWeight: 600, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', paddingTop: 2 }}>Hourly Rate</div>
            {editing ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: 'var(--fg-muted)', fontSize: 14 }}>$</span>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={draft.hourly_rate}
                  onChange={e => setDraft(d => ({ ...d, hourly_rate: e.target.value }))}
                  placeholder="e.g. 45"
                  style={{ width: 100, height: 32, padding: '0 10px', borderRadius: 8, fontSize: 13, border: '1px solid var(--border-soft)', background: 'var(--bg-surface-2)', color: 'var(--fg-default)', outline: 'none' }}
                />
                <span style={{ color: 'var(--fg-muted)', fontSize: 13 }}>/hr</span>
              </div>
            ) : (
              <div style={{ fontSize: 14, color: 'var(--fg-strong)' }}>{hourlyRate ?? <span style={{ color: 'var(--fg-faint)' }}>—</span>}</div>
            )}
          </div>

          <div style={{ padding: '11px 0', borderBottom: '1px solid var(--border-faint)', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{ width: 160, flexShrink: 0, fontSize: 12, fontWeight: 600, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', paddingTop: 2 }}>Subjects</div>
            {editing ? (
              <input
                value={draft.subjects}
                onChange={e => setDraft(d => ({ ...d, subjects: e.target.value }))}
                placeholder="e.g. Maths, Chemistry"
                style={{ flex: 1, height: 32, padding: '0 10px', borderRadius: 8, fontSize: 13, border: '1px solid var(--border-soft)', background: 'var(--bg-surface-2)', color: 'var(--fg-default)', outline: 'none' }}
              />
            ) : (
              <div style={{ fontSize: 14, color: 'var(--fg-strong)' }}>{tutor.subjects ?? <span style={{ color: 'var(--fg-faint)' }}>—</span>}</div>
            )}
          </div>

          <div style={{ padding: '11px 0', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{ width: 160, flexShrink: 0, fontSize: 12, fontWeight: 600, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', paddingTop: 2 }}>Bio</div>
            {editing ? (
              <textarea
                value={draft.bio}
                onChange={e => setDraft(d => ({ ...d, bio: e.target.value }))}
                placeholder="Short tutor biography…"
                rows={4}
                style={{ flex: 1, padding: '8px 12px', borderRadius: 8, fontSize: 13, border: '1px solid var(--border-soft)', background: 'var(--bg-surface-2)', color: 'var(--fg-default)', outline: 'none', resize: 'vertical', lineHeight: 1.5 }}
              />
            ) : (
              <div style={{ fontSize: 14, color: 'var(--fg-strong)', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
                {tutor.bio ?? <span style={{ color: 'var(--fg-faint)' }}>No bio added.</span>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Tab: Classes ──────────────────────────────────────────────────── */}
      {activeTab === 'classes' && (
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border-faint)',
          borderRadius: 'var(--radius-card, 16px)', overflow: 'hidden',
          boxShadow: 'var(--shadow-card)',
        }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-faint)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg-strong)' }}>Active Classes</div>
              <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 2 }}>{tutor.classes.length} class{tutor.classes.length !== 1 ? 'es' : ''} assigned</div>
            </div>
          </div>

          {tutor.classes.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No classes assigned"
              description="This tutor has no active classes. Assign a class from the Classes page."
            />
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-2)', borderBottom: '1px solid var(--border-faint)' }}>
                  {['Class', 'Subject'].map(h => (
                    <th key={h} style={{ padding: '10px 22px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--fg-muted)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tutor.classes.map((cls, i) => (
                  <tr
                    key={cls.class_id}
                    style={{ borderBottom: i < tutor.classes.length - 1 ? '1px solid var(--border-faint)' : undefined, cursor: 'pointer', transition: 'background 140ms' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; }}
                    onClick={() => navigate(`/dashboard/admin/classes/${cls.class_id}`)}
                  >
                    <td style={{ padding: '13px 22px' }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--fg-strong)' }}>{cls.class_name}</div>
                      <div style={{ fontSize: 11, color: 'var(--fg-faint)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>ID #{cls.class_id}</div>
                    </td>
                    <td style={{ padding: '13px 22px', fontSize: 13, color: 'var(--fg-muted)' }}>
                      {cls.subject ?? <span style={{ color: 'var(--fg-faint)' }}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── Tab: Payments ─────────────────────────────────────────────────── */}
      {activeTab === 'payments' && (
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border-faint)',
          borderRadius: 'var(--radius-card, 16px)', overflow: 'hidden',
          boxShadow: 'var(--shadow-card)',
        }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-faint)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg-strong)' }}>Tutor Payment History</div>
              <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 2 }}>All pay periods for this tutor</div>
            </div>
            <button
              onClick={loadPayments}
              disabled={paymentsLoading}
              style={{ height: 32, width: 32, borderRadius: 8, background: 'var(--bg-surface-2)', border: '1px solid var(--border-soft)', cursor: 'pointer', display: 'grid', placeItems: 'center', color: 'var(--fg-muted)' }}
            >
              <RefreshCw size={13} style={{ animation: paymentsLoading ? 'spin 1s linear infinite' : 'none' }} />
            </button>
          </div>

          {paymentsLoading ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--fg-muted)', fontSize: 14 }}>Loading payments…</div>
          ) : paymentsError ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--danger)', fontSize: 13 }}>
              <AlertCircle size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              {paymentsError}
            </div>
          ) : payments.length === 0 ? (
            <EmptyState
              icon={DollarSign}
              title="No payment records"
              description="No tutor pay periods have been created yet."
            />
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-2)', borderBottom: '1px solid var(--border-faint)' }}>
                  {['Pay Period', 'Amount Due', 'Amount Paid', 'Status', 'Paid At'].map(h => (
                    <th key={h} style={{ padding: '10px 22px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--fg-muted)', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map((p, i) => {
                  const isPaid    = p.status === 'paid';
                  const isPending = p.status === 'pending';
                  return (
                    <tr key={p.id} style={{ borderBottom: i < payments.length - 1 ? '1px solid var(--border-faint)' : undefined }}>
                      <td style={{ padding: '13px 22px' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-strong)' }}>
                          {fmtDate(p.pay_period_start)} – {fmtDate(p.pay_period_end)}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--fg-faint)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                          #{p.id} · {p.items?.length ?? 0} item{(p.items?.length ?? 0) !== 1 ? 's' : ''}
                        </div>
                      </td>
                      <td style={{ padding: '13px 22px', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--fg-strong)' }}>
                        {fmtCents(Number(p.amount_due) * 100)}
                      </td>
                      <td style={{ padding: '13px 22px', fontSize: 13, fontFamily: 'var(--font-mono)', color: isPaid ? 'var(--ok)' : 'var(--fg-muted)' }}>
                        {fmtCents(Number(p.amount_paid) * 100)}
                      </td>
                      <td style={{ padding: '13px 22px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 999,
                          textTransform: 'uppercase', letterSpacing: '0.06em',
                          color: isPaid ? 'var(--ok)' : isPending ? 'var(--warn)' : 'var(--fg-muted)',
                          background: isPaid
                            ? 'color-mix(in oklab, var(--ok) 12%, transparent)'
                            : isPending
                              ? 'color-mix(in oklab, var(--warn) 12%, transparent)'
                              : 'var(--bg-hover)',
                          border: isPaid
                            ? '1px solid color-mix(in oklab, var(--ok) 25%, transparent)'
                            : isPending
                              ? '1px solid color-mix(in oklab, var(--warn) 25%, transparent)'
                              : '1px solid var(--border-soft)',
                        }}>
                          {isPaid ? <CheckCircle size={11} /> : <Clock size={11} />}
                          {p.status}
                        </span>
                      </td>
                      <td style={{ padding: '13px 22px', fontSize: 13, color: 'var(--fg-muted)' }}>
                        {fmtDate(p.paid_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* Summary footer */}
          {payments.length > 0 && (() => {
            const totalDue  = payments.reduce((s, p) => s + Number(p.amount_due),  0);
            const totalPaid = payments.reduce((s, p) => s + Number(p.amount_paid), 0);
            const totalOwed = totalDue - totalPaid;
            return (
              <div style={{
                padding: '12px 22px', borderTop: '1px solid var(--border-faint)',
                display: 'flex', gap: 32, fontSize: 13, color: 'var(--fg-muted)',
              }}>
                <span>Total due: <strong style={{ color: 'var(--fg-strong)', fontFamily: 'var(--font-mono)' }}>{fmtCents(totalDue * 100)}</strong></span>
                <span>Total paid: <strong style={{ color: 'var(--ok)', fontFamily: 'var(--font-mono)' }}>{fmtCents(totalPaid * 100)}</strong></span>
                {totalOwed > 0 && (
                  <span>Still owed: <strong style={{ color: 'var(--warn)', fontFamily: 'var(--font-mono)' }}>{fmtCents(totalOwed * 100)}</strong></span>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default TutorDetail;
