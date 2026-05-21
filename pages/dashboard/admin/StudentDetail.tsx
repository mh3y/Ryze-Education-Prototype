/**
 * StudentDetail — /dashboard/admin/students/:id
 *
 * Tabs: Overview | Classes | Parents | Payments (placeholder)
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Save, UserCheck, BookOpen, Users,
  CreditCard, PlusCircle, Trash2, AlertCircle,
} from 'lucide-react';
import { adminApi, StudentDetail as TStudentDetail } from '../../../services/adminApi';
import { portalApi } from '../../../services/portalApi';
import {
  PageHeader, StatusBadge, LoadingState, ErrorState,
  EmptyState, ConfirmDialog,
} from '../../../components/dashboard/ui';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return iso; }
}

type Tab = 'overview' | 'classes' | 'parents' | 'payments';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const StudentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [student, setStudent]   = useState<TStudentDetail | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [activeTab, setTab]     = useState<Tab>('overview');

  // Profile edit state
  const [profile, setProfile]   = useState({ preferred_name: '', school: '', year_level: '', notes: '' });
  const [saving, setSaving]     = useState(false);
  const [saveMsg, setSaveMsg]   = useState<string | null>(null);

  // Classes tab state
  const [classes, setClasses]   = useState<{ id: number; name: string; year_level: string | null }[]>([]);
  const [classId, setClassId]   = useState<number | ''>('');
  const [enrollStatus, setEnrollStatus] = useState('active');
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);

  // Withdraw confirm dialog
  const [withdrawTarget, setWithdrawTarget] = useState<{ classGroupId: number; className: string } | null>(null);
  const [withdrawing, setWithdrawing]       = useState(false);
  const [withdrawError, setWithdrawError]   = useState<string | null>(null);

  // ── Load student ─────────────────────────────────────────────────────── //
  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getStudent(Number(id));
      setStudent(data);
      setProfile({
        preferred_name: data.profile?.preferred_name ?? '',
        school:         data.profile?.school         ?? '',
        year_level:     data.profile?.year_level     ?? '',
        notes:          data.profile?.notes          ?? '',
      });
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load student.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // ── Load classes for enrolment selector ─────────────────────────────── //
  useEffect(() => {
    portalApi.getClasses({ active: true, limit: 200 }).then(({ items }) =>
      setClasses(items.map((c) => ({ id: c.id, name: c.name, year_level: c.year_level })))
    ).catch(() => {});
  }, []);

  // ── Save profile ─────────────────────────────────────────────────────── //
  const handleSaveProfile = async () => {
    if (!student) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      await adminApi.updateStudentProfile(student.id, {
        preferred_name: profile.preferred_name || undefined,
        school:         profile.school         || undefined,
        year_level:     profile.year_level     || undefined,
        notes:          profile.notes          || undefined,
      });
      setSaveMsg('Profile saved.');
      load();
    } catch (e: any) {
      setSaveMsg(`Error: ${e?.message ?? 'Save failed.'}`);
    } finally {
      setSaving(false);
    }
  };

  // ── Enrol in class ───────────────────────────────────────────────────── //
  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student || classId === '') return;
    setEnrolling(true);
    setEnrollError(null);
    try {
      await adminApi.enrollStudent(student.id, { class_group_id: Number(classId), enrollment_status: enrollStatus });
      setClassId('');
      setEnrollStatus('active');
      load();
    } catch (e: any) {
      setEnrollError(e?.message ?? 'Enrolment failed.');
    } finally {
      setEnrolling(false);
    }
  };

  // ── Withdraw from class ──────────────────────────────────────────────── //
  const handleWithdraw = async () => {
    if (!student || !withdrawTarget) return;
    setWithdrawing(true);
    setWithdrawError(null);
    try {
      const today = new Date().toISOString().split('T')[0];
      await adminApi.updateEnrollment(student.id, withdrawTarget.classGroupId, {
        enrollment_status: 'withdrawn',
        end_date: today,
      });
      setWithdrawTarget(null);
      load();
    } catch (e: any) {
      setWithdrawError(e?.message ?? 'Failed to withdraw student.');
    } finally {
      setWithdrawing(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────── //

  if (loading) return <LoadingState />;
  if (error)   return <ErrorState message={error} onRetry={load} />;
  if (!student) return null;

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'overview', label: 'Overview', icon: UserCheck },
    { key: 'classes',  label: 'Classes',  icon: BookOpen },
    { key: 'parents',  label: 'Parents',  icon: Users },
    { key: 'payments', label: 'Payments', icon: CreditCard },
  ];

  const inputCls = 'w-full px-4 py-2.5 bg-[#050510] border border-white/10 rounded-xl text-sm ryze-text-inverse focus:outline-none focus:border-[#FFB000]/40 focus:ring-1 focus:ring-[#FFB000]/20 transition-all placeholder-slate-600';

  return (
    <div className="space-y-6">

      {/* Header */}
      <PageHeader
        title={student.full_name}
        breadcrumb={{ label: 'Students', href: '/dashboard/admin/students' }}
        actions={
          <button
            onClick={() => navigate('/dashboard/admin/students')}
            className="flex items-center gap-2 bg-white/5 border border-white/10 ryze-text-inverse font-semibold px-4 py-2.5 rounded-xl hover:bg-white/10 transition-all text-sm"
          >
            <ArrowLeft size={14} /> Back
          </button>
        }
      />

      {/* Identity strip */}
      <div className="bg-[#0a0f1e] border border-white/5 rounded-2xl p-5 flex flex-wrap items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#FFB000]/10 flex items-center justify-center text-[#FFB000] text-lg font-bold shrink-0">
          {student.full_name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-lg font-bold ryze-text-inverse">{student.full_name}</div>
          <div className="text-sm ryze-text-muted font-mono">{student.email ?? '—'}</div>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <StatusBadge value={student.role} />
          <StatusBadge value={student.active ? 'active' : 'withdrawn'} />
          <span className="text-xs ryze-text-muted">Discord: <span className="font-mono">{student.discord_user_id}</span></span>
          <span className="text-xs ryze-text-muted">Joined: {formatDate(student.created_at)}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 border border-white/5 rounded-xl p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab.key
                ? 'bg-white/10 ryze-text-inverse'
                : 'ryze-text-muted hover:ryze-text-inverse'
            }`}
          >
            <tab.icon size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ─────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="bg-[#0a0f1e] border border-white/5 rounded-2xl p-6 space-y-5">
          <h3 className="font-bold ryze-text-inverse text-sm uppercase tracking-widest">Student Profile</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-2">Preferred Name</label>
              <input
                type="text"
                className={inputCls}
                value={profile.preferred_name}
                onChange={(e) => setProfile((p) => ({ ...p, preferred_name: e.target.value }))}
                placeholder="e.g. Alex"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-2">School</label>
              <input
                type="text"
                className={inputCls}
                value={profile.school}
                onChange={(e) => setProfile((p) => ({ ...p, school: e.target.value }))}
                placeholder="e.g. Sydney Grammar School"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-2">Year Level</label>
              <input
                type="text"
                className={inputCls}
                value={profile.year_level}
                onChange={(e) => setProfile((p) => ({ ...p, year_level: e.target.value }))}
                placeholder="e.g. Year 11"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-2">Internal Notes</label>
              <textarea
                rows={3}
                className={`${inputCls} resize-none`}
                value={profile.notes}
                onChange={(e) => setProfile((p) => ({ ...p, notes: e.target.value }))}
                placeholder="Admin-only notes about this student…"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="flex items-center gap-2 bg-[#FFB000] text-[#050510] font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-[#ffc133] transition-all disabled:opacity-60"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-[#050510]/30 border-t-[#050510] rounded-full animate-spin" />
              ) : (
                <Save size={14} />
              )}
              Save Profile
            </button>
            {saveMsg && (
              <span className={`text-xs font-semibold ${saveMsg.startsWith('Error') ? 'text-red-400' : 'text-emerald-400'}`}>
                {saveMsg}
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── CLASSES TAB ──────────────────────────────────────────────── */}
      {activeTab === 'classes' && (
        <div className="space-y-4">
          {/* Enrolled classes list */}
          <div className="bg-[#0a0f1e] border border-white/5 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5">
              <h3 className="font-bold ryze-text-inverse text-sm">Enrolled Classes</h3>
            </div>
            {student.classes.length === 0 ? (
              <EmptyState icon={BookOpen} title="No classes" description="This student is not enrolled in any classes." />
            ) : (
              <div className="divide-y divide-white/5">
                {student.classes.map((cls) => (
                  <div key={cls.class_id} className="flex items-center justify-between px-5 py-4">
                    <div>
                      <div className="font-semibold ryze-text-inverse text-sm">{cls.class_name}</div>
                      <div className="text-xs ryze-text-muted mt-0.5">
                        {cls.enrolled_at ? `Started ${formatDate(cls.enrolled_at)}` : 'No start date'}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge value={cls.active ? 'active' : 'inactive'} />
                      {cls.active && (
                        <button
                          onClick={() => setWithdrawTarget({ classGroupId: cls.class_id, className: cls.class_name })}
                          className="flex items-center gap-1.5 text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition-all"
                        >
                          <Trash2 size={12} /> Withdraw
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Enrol form */}
          <div className="bg-[#0a0f1e] border border-white/5 rounded-2xl p-5">
            <h3 className="font-bold ryze-text-inverse text-sm mb-4 flex items-center gap-2">
              <PlusCircle size={15} className="text-[#FFB000]" /> Enrol in Class
            </h3>
            {enrollError && (
              <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4">
                <AlertCircle size={14} /> {enrollError}
              </div>
            )}
            <form onSubmit={handleEnroll} className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-2">Class</label>
                <select
                  required
                  value={classId}
                  onChange={(e) => setClassId(e.target.value ? Number(e.target.value) : '')}
                  className={inputCls}
                >
                  <option value="">Select class…</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}{c.year_level ? ` (${c.year_level})` : ''}</option>
                  ))}
                </select>
              </div>
              <div className="w-40">
                <label className="block text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-2">Status</label>
                <select
                  value={enrollStatus}
                  onChange={(e) => setEnrollStatus(e.target.value)}
                  className={inputCls}
                >
                  <option value="active">Active</option>
                  <option value="trial">Trial</option>
                  <option value="paused">Paused</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={enrolling || classId === ''}
                className="flex items-center gap-2 bg-[#FFB000] text-[#050510] font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-[#ffc133] transition-all disabled:opacity-60 h-[42px]"
              >
                {enrolling
                  ? <div className="w-4 h-4 border-2 border-[#050510]/30 border-t-[#050510] rounded-full animate-spin" />
                  : <PlusCircle size={14} />}
                Enrol
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── PARENTS TAB ──────────────────────────────────────────────── */}
      {activeTab === 'parents' && (
        <div className="bg-[#0a0f1e] border border-white/5 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <h3 className="font-bold ryze-text-inverse text-sm">Linked Parents</h3>
          </div>
          {student.parents.length === 0 ? (
            <div className="py-10 text-center">
              <EmptyState
                icon={Users}
                title="No parents linked"
                description="Go to the Parents section to create a parent profile and link them to this student."
                action={
                  <button
                    onClick={() => navigate('/dashboard/admin/parents')}
                    className="text-sm font-semibold text-[#FFB000] bg-[#FFB000]/10 px-4 py-2 rounded-xl hover:bg-[#FFB000]/20 transition-all"
                  >
                    Go to Parents
                  </button>
                }
              />
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {student.parents.map((p) => (
                <div key={p.link_id} className="flex items-center justify-between px-5 py-4">
                  <div>
                    <div className="font-semibold ryze-text-inverse text-sm">{p.parent_name}</div>
                    <div className="text-xs ryze-text-muted">{p.parent_email}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {p.relationship && <StatusBadge value={p.relationship} />}
                    {p.is_primary_contact && (
                      <span className="text-[10px] font-bold text-[#FFB000] bg-[#FFB000]/10 px-2 py-0.5 rounded-full">Primary</span>
                    )}
                    <button
                      onClick={() => navigate(`/dashboard/admin/parents/${p.parent_id}`)}
                      className="text-xs font-semibold ryze-text-muted hover:ryze-text-inverse bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-all"
                    >
                      View Parent
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── PAYMENTS TAB ─────────────────────────────────────────────── */}
      {activeTab === 'payments' && (
        <div className="bg-[#0a0f1e] border border-white/5 rounded-2xl p-8 text-center">
          <CreditCard size={40} className="ryze-text-muted mx-auto mb-4" />
          <h3 className="font-bold ryze-text-inverse mb-2">Payment History</h3>
          <p className="text-sm ryze-text-muted max-w-sm mx-auto">
            Payment tracking for individual students is managed in the Payments section.
          </p>
          <button
            onClick={() => navigate('/dashboard/admin/payments')}
            className="mt-5 text-sm font-semibold text-[#FFB000] bg-[#FFB000]/10 px-5 py-2.5 rounded-xl hover:bg-[#FFB000]/20 transition-all"
          >
            Go to Payments
          </button>
        </div>
      )}

      {/* Withdraw error banner */}
      {withdrawError && (
        <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
          <AlertCircle size={14} /> {withdrawError}
        </div>
      )}

      {/* Withdraw confirm dialog */}
      <ConfirmDialog
        open={!!withdrawTarget}
        title={`Withdraw from ${withdrawTarget?.className ?? 'class'}?`}
        description="This will mark the student's enrolment as withdrawn. You can re-enrol them at any time."
        confirmLabel="Withdraw"
        variant="danger"
        loading={withdrawing}
        onConfirm={handleWithdraw}
        onCancel={() => { setWithdrawTarget(null); setWithdrawError(null); }}
      />
    </div>
  );
};

export default StudentDetail;
