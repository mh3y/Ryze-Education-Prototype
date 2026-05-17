/**
 * SettingsPage — /dashboard/settings
 * Redesigned to match design handoff spec.
 */

import React, { useState } from 'react';
import {
  Star, Users, Bell, Shield, Activity, UserCheck, CreditCard,
  AlertTriangle, ChevronRight, Mail, Phone, Download, LogOut,
  RefreshCw, Check, X, Link, type LucideIcon,
} from 'lucide-react';
import { usePortalSettings } from '../../contexts/PortalSettingsContext';

/* ── Types ──────────────────────────────────────────────────── */

type SectionKey = 'appearance' | 'profile' | 'notifications' | 'security' | 'integrations' | 'team' | 'billing' | 'danger';

interface SectionDef {
  key: SectionKey;
  label: string;
  icon: LucideIcon;
  desc: string;
  tone?: 'danger';
}

/* ── Section list ───────────────────────────────────────────── */

const SECTIONS: SectionDef[] = [
  { key: 'appearance',    label: 'Appearance',    icon: Star,          desc: 'Theme, type, density' },
  { key: 'profile',       label: 'Profile',       icon: Users,         desc: 'Name, email, timezone' },
  { key: 'notifications', label: 'Notifications', icon: Bell,          desc: 'Email, SMS, Discord' },
  { key: 'security',      label: 'Security',      icon: Shield,        desc: 'Password, 2FA, sessions' },
  { key: 'integrations',  label: 'Integrations',  icon: Activity,      desc: 'Discord, Xero, Calendar' },
  { key: 'team',          label: 'Team & roles',  icon: UserCheck,     desc: 'Admins, tutors, parents' },
  { key: 'billing',       label: 'Billing',       icon: CreditCard,    desc: 'Plan, seats, invoices' },
  { key: 'danger',        label: 'Danger zone',   icon: AlertTriangle, desc: 'Export, archive, delete', tone: 'danger' },
];

const ACCENT_SWATCHES = [
  { hex: '#b8841e', label: 'Ryze gold' },
  { hex: '#1f8a5b', label: 'Sage' },
  { hex: '#2a6fdb', label: 'Cobalt' },
  { hex: '#8b3a3a', label: 'Claret' },
];

/* ── Shared button styles ───────────────────────────────────── */

const btnPrimary: React.CSSProperties = { height: 36, padding: '0 14px', borderRadius: 9, fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--accent)', color: 'var(--accent-fg)', border: 'none', cursor: 'pointer' };
const btnGhost:   React.CSSProperties = { height: 36, padding: '0 12px', borderRadius: 9, fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--bg-surface)', color: 'var(--fg-default)', border: '1px solid var(--border-soft)', cursor: 'pointer' };
const btnQuiet:   React.CSSProperties = { height: 34, padding: '0 10px', borderRadius: 8, fontSize: 12, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'transparent', color: 'var(--fg-muted)', border: 'none', cursor: 'pointer' };
const btnDanger:  React.CSSProperties = { height: 36, padding: '0 14px', borderRadius: 9, fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'color-mix(in oklab, var(--danger) 12%, transparent)', color: 'var(--danger)', border: '1px solid color-mix(in oklab, var(--danger) 26%, transparent)', cursor: 'pointer' };

/* ── Card shell ─────────────────────────────────────────────── */

const cardStyle: React.CSSProperties = { background: 'var(--bg-surface)', border: '1px solid var(--border-faint)', borderRadius: 14, overflow: 'hidden', boxShadow: 'var(--shadow-card)' };
const cardHeadStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border-faint)' };
const cardTitleStyle: React.CSSProperties = { fontSize: 13.5, fontWeight: 600, color: 'var(--fg-strong)' };
const cardSubStyle: React.CSSProperties = { fontSize: 12, color: 'var(--fg-muted)', marginTop: 2 };

/* ── Form primitives ────────────────────────────────────────── */

const Row: React.FC<{ label: string; hint?: string; full?: boolean; children: React.ReactNode }> = ({ label, hint, full, children }) => (
  <div style={{ display: 'grid', gridTemplateColumns: full ? '1fr' : '200px 1fr', gap: full ? 8 : 24, alignItems: 'start', padding: '14px 20px', borderBottom: '1px solid var(--border-faint)' }}>
    <div>
      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg-default)' }}>{label}</div>
      {hint && <div style={{ fontSize: 11.5, color: 'var(--fg-muted)', marginTop: 3, lineHeight: 1.4 }}>{hint}</div>}
    </div>
    <div>{children}</div>
  </div>
);

const Segment: React.FC<{ value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }> = ({ value, options, onChange }) => (
  <div style={{ display: 'inline-flex', background: 'var(--bg-surface-2)', border: '1px solid var(--border-soft)', borderRadius: 9, padding: 3, gap: 2 }}>
    {options.map(o => (
      <button key={o.value} onClick={() => onChange(o.value)} style={{ padding: '5px 12px', borderRadius: 7, fontSize: 12.5, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 120ms ease', background: value === o.value ? 'var(--bg-elevated)' : 'transparent', color: value === o.value ? 'var(--fg-strong)' : 'var(--fg-muted)', boxShadow: value === o.value ? '0 1px 3px rgba(0,0,0,0.3)' : 'none' }}>
        {o.label}
      </button>
    ))}
  </div>
);

const Toggle: React.FC<{ value: boolean; onChange: (v: boolean) => void }> = ({ value, onChange }) => (
  <button role="switch" aria-checked={value} onClick={() => onChange(!value)} style={{ display: 'inline-flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
    <span style={{ display: 'inline-flex', alignItems: 'center', width: 36, height: 20, borderRadius: 999, background: value ? 'var(--accent)' : 'var(--bg-elevated)', border: `1px solid ${value ? 'var(--accent)' : 'var(--border-soft)'}`, transition: 'all 160ms ease', padding: '0 2px', justifyContent: value ? 'flex-end' : 'flex-start' }}>
      <span style={{ width: 14, height: 14, borderRadius: '50%', background: value ? 'var(--accent-fg)' : 'var(--fg-muted)', transition: 'all 160ms ease' }} />
    </span>
  </button>
);

const Field: React.FC<{ value?: string; onChange?: (v: string) => void; placeholder?: string; type?: string; prefix?: React.ReactNode; suffix?: React.ReactNode; mono?: boolean }> = ({ value, onChange, placeholder, type = 'text', prefix, suffix, mono }) => (
  <label style={{ display: 'flex', alignItems: 'center', height: 38, background: 'var(--bg-surface-2)', border: '1px solid var(--border-soft)', borderRadius: 9, overflow: 'hidden', gap: 0 }}>
    {prefix && <span style={{ padding: '0 10px', color: 'var(--fg-muted)', display: 'flex', alignItems: 'center', borderRight: '1px solid var(--border-faint)' }}>{prefix}</span>}
    <input type={type} value={value || ''} placeholder={placeholder} onChange={e => onChange?.(e.target.value)} style={{ flex: 1, background: 'none', border: 'none', outline: 'none', padding: '0 12px', fontSize: 13, color: 'var(--fg-default)', fontFamily: mono ? 'var(--font-mono)' : 'inherit' }} />
    {suffix && <span style={{ padding: '0 10px', color: 'var(--fg-muted)', display: 'flex', alignItems: 'center', borderLeft: '1px solid var(--border-faint)' }}>{suffix}</span>}
  </label>
);

const SelectField: React.FC<{ value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }> = ({ value, onChange, options }) => (
  <label style={{ display: 'flex', alignItems: 'center', height: 38, background: 'var(--bg-surface-2)', border: '1px solid var(--border-soft)', borderRadius: 9, overflow: 'hidden', paddingRight: 10 }}>
    <select value={value} onChange={e => onChange(e.target.value)} style={{ flex: 1, background: 'none', border: 'none', outline: 'none', padding: '0 12px', fontSize: 13, color: 'var(--fg-default)', cursor: 'pointer', appearance: 'none' }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
    <ChevronRight size={13} style={{ color: 'var(--fg-muted)', transform: 'rotate(90deg)', flexShrink: 0 }} />
  </label>
);

const Swatches: React.FC<{ value: string; options: typeof ACCENT_SWATCHES; onChange: (v: string) => void }> = ({ value, options, onChange }) => (
  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
    {options.map(s => {
      const active = value.toLowerCase() === s.hex.toLowerCase();
      return (
        <button key={s.hex} onClick={() => onChange(s.hex)} title={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 9, border: `1px solid ${active ? s.hex : 'var(--border-soft)'}`, background: active ? `color-mix(in oklab, ${s.hex} 12%, transparent)` : 'var(--bg-surface-2)', cursor: 'pointer' }}>
          <span style={{ width: 14, height: 14, borderRadius: '50%', background: s.hex, display: 'block' }} />
          <span style={{ fontSize: 12.5, fontWeight: 600, color: active ? s.hex : 'var(--fg-muted)' }}>{s.label}</span>
          {active && <Check size={12} style={{ color: s.hex }} />}
        </button>
      );
    })}
  </div>
);

const FontPicker: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => {
  const options = [
    { value: 'editorial',  name: 'Editorial',   family: '"Cormorant Garamond", serif',    italic: true,  caption: 'Cormorant + Manrope' },
    { value: 'instrument', name: 'Literary',    family: '"Instrument Serif", serif',      italic: false, caption: 'Instrument + Manrope' },
    { value: 'modern',     name: 'Modern SaaS', family: '"Geist", "Manrope", sans-serif', italic: false, caption: 'Geist all-sans' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
      {options.map(o => {
        const active = value === o.value;
        return (
          <button key={o.value} onClick={() => onChange(o.value)} style={{ padding: '14px 12px', borderRadius: 11, border: `1px solid ${active ? 'color-mix(in oklab, var(--accent) 40%, transparent)' : 'var(--border-soft)'}`, background: active ? 'var(--accent-soft)' : 'var(--bg-surface-2)', cursor: 'pointer', textAlign: 'left' }}>
            <div style={{ fontFamily: o.family, fontStyle: o.italic ? 'italic' : 'normal', fontWeight: o.italic ? 500 : 600, fontSize: 28, color: 'var(--fg-strong)', lineHeight: 1 }}>Aa</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: active ? 'var(--accent)' : 'var(--fg-default)', marginTop: 8 }}>{o.name}</div>
            <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginTop: 2 }}>{o.caption}</div>
          </button>
        );
      })}
    </div>
  );
};

/* ── Section shell ──────────────────────────────────────────── */

const SectionShell: React.FC<{ title: string; sub: string; action?: React.ReactNode; children: React.ReactNode }> = ({ title, sub, action, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, paddingBottom: 20, borderBottom: '1px solid var(--border-faint)' }}>
      <div>
        <h2 style={{ fontFamily: '"Cormorant Garamond","Times New Roman",serif', fontStyle: 'italic', fontWeight: 500, fontSize: 34, color: 'var(--fg-strong)', margin: 0, lineHeight: 1.1 }}>{title}</h2>
        <p style={{ fontSize: 13.5, color: 'var(--fg-muted)', margin: '8px 0 0', lineHeight: 1.5 }}>{sub}</p>
      </div>
      {action}
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{children}</div>
  </div>
);

/* ── Save bar ───────────────────────────────────────────────── */

const SaveBar: React.FC = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', background: 'var(--bg-surface)', border: '1px solid var(--border-soft)', borderRadius: 12, gap: 16 }}>
    <span style={{ fontSize: 12, color: 'var(--fg-muted)' }}>You have unsaved changes</span>
    <div style={{ display: 'flex', gap: 8 }}>
      <button style={btnQuiet}>Discard</button>
      <button style={btnPrimary}>Save changes</button>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════
   SECTIONS
   ══════════════════════════════════════════════════════════════ */

/* ── Appearance ─────────────────────────────────────────────── */

const AppearanceSection: React.FC = () => {
  const { settings, updateSettings } = usePortalSettings();

  // Local-only UI prefs (not persisted to portal settings)
  const [reduceMotion, setReduceMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [tnum, setTnum]                 = useState(false);

  // Map sidebarBehavior to segment value and back
  const sidebarSegValue =
    settings.sidebarBehavior === 'always-rail' ? 'rail' : 'expanded';

  const handleSidebarChange = (v: string) => {
    updateSettings({
      sidebarBehavior: v === 'rail' ? 'always-rail' : 'always-open',
    });
  };

  return (
    <SectionShell title="Appearance" sub="Set how the Ryze console looks for you. Changes apply instantly across the portal.">
      <div style={cardStyle}>
        <div style={cardHeadStyle}>
          <div>
            <div style={cardTitleStyle}>Display</div>
            <div style={cardSubStyle}>Theme, accent, sidebar and density preferences.</div>
          </div>
        </div>
        <Row label="Theme" hint="The marketing site is warm-white; the console defaults to dark for long sessions.">
          <Segment
            value={settings.theme}
            options={[{ value: 'dark', label: 'Dark' }, { value: 'light', label: 'Light' }]}
            onChange={(v) => updateSettings({ theme: v as 'dark' | 'light' })}
          />
        </Row>
        <Row label="Accent colour" hint="Used for active states, primary actions, and brand moments.">
          <Swatches
            value={settings.accent}
            options={ACCENT_SWATCHES}
            onChange={(v) => updateSettings({ accent: v })}
          />
        </Row>
        <Row label="Sidebar" hint="Wide labels for discovery; rail for power-users on smaller screens.">
          <Segment
            value={sidebarSegValue}
            options={[{ value: 'expanded', label: 'Expanded' }, { value: 'rail', label: 'Icon rail' }]}
            onChange={handleSidebarChange}
          />
        </Row>
        <Row label="Density" hint="Affects row heights, card padding, and the page gutter.">
          <Segment
            value={settings.density}
            options={[{ value: 'airy', label: 'Airy' }, { value: 'balanced', label: 'Balanced' }, { value: 'dense', label: 'Dense' }]}
            onChange={(v) => updateSettings({ density: v as 'airy' | 'balanced' | 'dense' })}
          />
        </Row>
        <Row label="Type pairing" hint="Display headings use the chosen serif; body text stays Manrope unless you pick Modern SaaS." full>
          <FontPicker
            value={settings.font}
            onChange={(v) => updateSettings({ font: v as 'editorial' | 'modern' | 'instrument' })}
          />
        </Row>
      </div>

      <div style={cardStyle}>
        <div style={cardHeadStyle}>
          <div>
            <div style={cardTitleStyle}>Motion & accessibility</div>
            <div style={cardSubStyle}>Tone down animations or sharpen contrast for long work days.</div>
          </div>
        </div>
        <Row label="Reduce motion" hint="Disables decorative animation like the live-lesson pulse.">
          <Toggle value={reduceMotion} onChange={setReduceMotion} />
        </Row>
        <Row label="High contrast" hint="Bumps body text and borders for clearer separation.">
          <Toggle value={highContrast} onChange={setHighContrast} />
        </Row>
        <Row label="Tabular numerals everywhere" hint="Align numbers across columns automatically.">
          <Toggle value={tnum} onChange={setTnum} />
        </Row>
      </div>
    </SectionShell>
  );
};

/* ── Profile ────────────────────────────────────────────────── */

const ProfileSection: React.FC = () => {
  const [name, setName]   = useState('Michael Hayes');
  const [email, setEmail] = useState('michael@ryze.edu.au');
  const [phone, setPhone] = useState('+61 412 345 678');
  const [tz, setTz]       = useState('Australia/Sydney');
  const [dirty, setDirty] = useState(false);

  const upd = (setter: (v: string) => void) => (v: string) => { setter(v); setDirty(true); };

  return (
    <SectionShell title="Profile" sub="The name and contact details parents and tutors see in the portal.">
      <div style={cardStyle}>
        <Row label="Profile photo" hint="Square PNG or JPG · 256 × 256 minimum.">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--accent-soft)', border: '2px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Cormorant Garamond","Times New Roman",serif', fontStyle: 'italic', fontSize: 22, fontWeight: 500, color: 'var(--accent)' }}>M</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={btnGhost}>Upload</button>
              <button style={btnQuiet}>Remove</button>
            </div>
          </div>
        </Row>
        <Row label="Display name">
          <Field value={name} onChange={upd(setName)} placeholder="Full name" />
        </Row>
        <Row label="Email">
          <Field type="email" value={email} onChange={upd(setEmail)} prefix={<Mail size={14} />} />
        </Row>
        <Row label="Phone" hint="Used as the SMS sender ID for parent reminders.">
          <Field value={phone} onChange={upd(setPhone)} prefix={<Phone size={14} />} mono />
        </Row>
        <Row label="Timezone">
          <SelectField value={tz} onChange={upd(setTz)} options={[
            { value: 'Australia/Sydney',    label: 'Australia / Sydney (AEDT)' },
            { value: 'Australia/Melbourne', label: 'Australia / Melbourne (AEDT)' },
            { value: 'Australia/Brisbane',  label: 'Australia / Brisbane (AEST)' },
            { value: 'Australia/Perth',     label: 'Australia / Perth (AWST)' },
            { value: 'Pacific/Auckland',    label: 'New Zealand / Auckland (NZST)' },
          ]} />
        </Row>
      </div>
      {dirty && <SaveBar />}
    </SectionShell>
  );
};

/* ── Notifications ──────────────────────────────────────────── */

const NOTIF_EVENTS = [
  { key: 'new_booking',      label: 'New booking',      hint: 'When a parent books or re-schedules' },
  { key: 'lesson_reminder',  label: 'Lesson reminder',  hint: '1 hour before each lesson' },
  { key: 'homework_graded',  label: 'Homework graded',  hint: 'When a tutor marks a submission' },
  { key: 'payment_received', label: 'Payment received', hint: 'When an invoice is settled' },
  { key: 'report_ready',     label: 'Report ready',     hint: 'When a term report is finalised' },
  { key: 'team_invite',      label: 'Team invite',      hint: 'When someone joins the workspace' },
];
const NOTIF_CHANNELS = ['Email', 'SMS', 'Discord'];

const NotificationsSection: React.FC = () => {
  const [state, setState] = useState<Record<string, Record<string, boolean>>>(() => {
    const init: Record<string, Record<string, boolean>> = {};
    NOTIF_EVENTS.forEach(ev => {
      init[ev.key] = { Email: true, SMS: ev.key === 'new_booking' || ev.key === 'lesson_reminder', Discord: false };
    });
    return init;
  });

  const toggle = (evKey: string, channel: string) =>
    setState(prev => ({ ...prev, [evKey]: { ...prev[evKey], [channel]: !prev[evKey][channel] } }));

  return (
    <SectionShell title="Notifications" sub="Choose which events trigger a notification and how you receive them.">
      <div style={cardStyle}>
        <div style={cardHeadStyle}>
          <div>
            <div style={cardTitleStyle}>Event channels</div>
            <div style={cardSubStyle}>Toggle on/off per event and delivery method.</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr repeat(3, 80px)', padding: '10px 20px', borderBottom: '1px solid var(--border-faint)', background: 'var(--bg-surface-2)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--fg-muted)' }}>Event</div>
          {NOTIF_CHANNELS.map(ch => (
            <div key={ch} style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--fg-muted)', textAlign: 'center' }}>{ch}</div>
          ))}
        </div>
        {NOTIF_EVENTS.map((ev, i) => (
          <div key={ev.key} style={{ display: 'grid', gridTemplateColumns: '1fr repeat(3, 80px)', padding: '14px 20px', alignItems: 'center', borderBottom: i < NOTIF_EVENTS.length - 1 ? '1px solid var(--border-faint)' : undefined }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg-default)' }}>{ev.label}</div>
              <div style={{ fontSize: 11.5, color: 'var(--fg-muted)', marginTop: 2 }}>{ev.hint}</div>
            </div>
            {NOTIF_CHANNELS.map(ch => (
              <div key={ch} style={{ display: 'flex', justifyContent: 'center' }}>
                <Toggle value={state[ev.key][ch]} onChange={() => toggle(ev.key, ch)} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </SectionShell>
  );
};

/* ── Security ───────────────────────────────────────────────── */

const SESSIONS = [
  { device: 'MacBook Pro — Chrome',  location: 'Sydney, AU',     when: 'Now',    current: true },
  { device: 'iPhone 15 — Safari',    location: 'Sydney, AU',     when: '2h ago', current: false },
  { device: 'Windows — Edge',        location: 'Melbourne, AU',  when: '3d ago', current: false },
];

const SecuritySection: React.FC = () => {
  const [twoFA, setTwoFA] = useState(false);

  return (
    <SectionShell title="Security" sub="Manage your password, two-factor authentication, and active sessions.">
      <div style={cardStyle}>
        <div style={cardHeadStyle}>
          <div>
            <div style={cardTitleStyle}>Password</div>
            <div style={cardSubStyle}>Last changed 90 days ago.</div>
          </div>
          <button style={btnGhost}>Change password</button>
        </div>
        <Row label="Current password">
          <Field type="password" placeholder="Enter current password" />
        </Row>
        <Row label="New password" hint="Minimum 12 characters.">
          <Field type="password" placeholder="New password" />
        </Row>
        <div style={{ padding: '14px 20px', display: 'flex', justifyContent: 'flex-end' }}>
          <button style={btnPrimary}>Update password</button>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={cardHeadStyle}>
          <div>
            <div style={cardTitleStyle}>Two-factor authentication</div>
            <div style={cardSubStyle}>Add a second layer of security to your account.</div>
          </div>
          <Toggle value={twoFA} onChange={setTwoFA} />
        </div>
        {!twoFA ? (
          <div style={{ padding: 20, fontSize: 13, color: 'var(--fg-muted)' }}>
            2FA is currently disabled. Enable it to use an authenticator app or SMS code on each login.
          </div>
        ) : (
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 13, color: 'var(--fg-default)' }}>Scan the QR code with your authenticator app, then enter the 6-digit code to confirm.</div>
            <div style={{ width: 120, height: 120, background: 'var(--bg-surface-2)', border: '1px solid var(--border-soft)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-faint)', fontSize: 11 }}>QR code</div>
            <Field placeholder="000 000" />
            <button style={{ ...btnPrimary, alignSelf: 'flex-start' }}>Confirm & enable</button>
          </div>
        )}
      </div>

      <div style={cardStyle}>
        <div style={cardHeadStyle}>
          <div>
            <div style={cardTitleStyle}>Active sessions</div>
            <div style={cardSubStyle}>Devices currently signed in to your account.</div>
          </div>
          <button style={{ ...btnQuiet, color: 'var(--danger)' }}>Revoke all others</button>
        </div>
        {SESSIONS.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: i < SESSIONS.length - 1 ? '1px solid var(--border-faint)' : undefined }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg-default)', display: 'flex', alignItems: 'center', gap: 8 }}>
                {s.device}
                {s.current && <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '2px 7px', borderRadius: 999, background: 'color-mix(in oklab, var(--ok) 12%, transparent)', color: 'var(--ok)', border: '1px solid color-mix(in oklab, var(--ok) 26%, transparent)' }}>Current</span>}
              </div>
              <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 2 }}>{s.location} · {s.when}</div>
            </div>
            {!s.current && <button style={{ ...btnQuiet, color: 'var(--danger)' }}><X size={13} /> Revoke</button>}
          </div>
        ))}
      </div>
    </SectionShell>
  );
};

/* ── Integrations ───────────────────────────────────────────── */

const INTEGRATIONS = [
  { id: 'discord',  name: 'Discord',         desc: 'Send lesson reminders and homework alerts to a Discord server.',     connected: true,  color: '#5865F2' },
  { id: 'xero',     name: 'Xero',            desc: 'Sync invoices and payment status with your Xero accounting ledger.', connected: true,  color: '#13B5EA' },
  { id: 'calendar', name: 'Google Calendar', desc: 'Sync lessons to tutor and student Google Calendars automatically.',  connected: false, color: '#4285F4' },
  { id: 'zoom',     name: 'Zoom',            desc: 'Auto-generate meeting links for online lessons.',                    connected: false, color: '#2D8CFF' },
  { id: 'stripe',   name: 'Stripe',          desc: 'Accept card payments directly without leaving the portal.',          connected: true,  color: '#635BFF' },
  { id: 'zapier',   name: 'Zapier',          desc: 'Automate workflows between Ryze and 5,000+ apps.',                  connected: false, color: '#FF4A00' },
];

const IntegrationsSection: React.FC = () => (
  <SectionShell title="Integrations" sub="Connect third-party services to automate your workflow.">
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
      {INTEGRATIONS.map(it => (
        <div key={it.id} style={{ ...cardStyle, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: `${it.color}20`, border: `1px solid ${it.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Link size={16} style={{ color: it.color }} />
            </div>
            {it.connected
              ? <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 999, background: 'color-mix(in oklab, var(--ok) 12%, transparent)', color: 'var(--ok)', border: '1px solid color-mix(in oklab, var(--ok) 26%, transparent)' }}>Connected</span>
              : <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--fg-faint)', letterSpacing: '0.04em' }}>Not connected</span>
            }
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-strong)', marginBottom: 6 }}>{it.name}</div>
          <div style={{ fontSize: 12.5, color: 'var(--fg-muted)', lineHeight: 1.5, marginBottom: 16 }}>{it.desc}</div>
          <button style={it.connected ? btnQuiet : btnGhost}>{it.connected ? 'Disconnect' : 'Connect'}</button>
        </div>
      ))}
    </div>
  </SectionShell>
);

/* ── Team & roles ───────────────────────────────────────────── */

const TEAM_MEMBERS = [
  { name: 'Michael Hayes', email: 'michael@ryze.edu.au', role: 'Admin',  joined: 'Owner',    avatar: 'M' },
  { name: 'Daniel Kwok',   email: 'daniel@ryze.edu.au',  role: 'Tutor',  joined: '3 mo ago', avatar: 'D' },
  { name: 'Priya Aiyar',   email: 'priya@ryze.edu.au',   role: 'Tutor',  joined: '5 mo ago', avatar: 'P' },
  { name: 'Sarah Tran',    email: 'sarah@ryze.edu.au',   role: 'Parent', joined: '2 mo ago', avatar: 'S' },
];
const AVATAR_COLOURS: Record<string, string> = { M: '#b8841e', D: '#4f9b6a', P: '#5e7fb3', S: '#c89e2b' };

const TeamSection: React.FC = () => (
  <SectionShell
    title="Team & roles"
    sub="Manage who has access to this workspace and what they can do."
    action={<button style={btnPrimary}>Invite member</button>}
  >
    <div style={{ ...cardStyle, overflow: 'hidden' }}>
      <div style={cardHeadStyle}>
        <div>
          <div style={cardTitleStyle}>Members</div>
          <div style={cardSubStyle}>{TEAM_MEMBERS.length} people have access to this workspace.</div>
        </div>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'var(--bg-surface-2)', borderBottom: '1px solid var(--border-soft)' }}>
            {['Member', 'Role', 'Joined', ''].map((h, i) => (
              <th key={i} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--fg-muted)', width: i === 3 ? 60 : undefined }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TEAM_MEMBERS.map((m, i) => (
            <tr key={m.email} style={{ borderBottom: i < TEAM_MEMBERS.length - 1 ? '1px solid var(--border-faint)' : undefined }}>
              <td style={{ padding: '14px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: `${AVATAR_COLOURS[m.avatar] || '#8a8b8e'}20`, border: `1px solid ${AVATAR_COLOURS[m.avatar] || '#8a8b8e'}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Cormorant Garamond","Times New Roman",serif', fontStyle: 'italic', fontSize: 16, fontWeight: 500, color: AVATAR_COLOURS[m.avatar] || 'var(--fg-muted)' }}>{m.avatar}</div>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--fg-strong)' }}>{m.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{m.email}</div>
                  </div>
                </div>
              </td>
              <td style={{ padding: '14px 20px' }}>
                <SelectField value={m.role} onChange={() => {}} options={[{ value: 'Admin', label: 'Admin' }, { value: 'Tutor', label: 'Tutor' }, { value: 'Parent', label: 'Parent' }]} />
              </td>
              <td style={{ padding: '14px 20px', fontSize: 13, color: 'var(--fg-muted)' }}>{m.joined}</td>
              <td style={{ padding: '14px 20px' }}>
                {m.joined !== 'Owner' && <button style={{ ...btnQuiet, color: 'var(--danger)' }}><X size={13} /></button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </SectionShell>
);

/* ── Billing ────────────────────────────────────────────────── */

const INVOICES_BILLING = [
  { id: 'INV-0099', date: '1 May 2026',  amount: 240 },
  { id: 'INV-0085', date: '1 Apr 2026',  amount: 240 },
  { id: 'INV-0071', date: '1 Mar 2026',  amount: 240 },
  { id: 'INV-0058', date: '1 Feb 2026',  amount: 240 },
  { id: 'INV-0044', date: '1 Jan 2026',  amount: 240 },
];

const BillingSection: React.FC = () => (
  <SectionShell title="Billing" sub="Subscription plan, seat allocation, payment method, and invoice history.">
    <div style={{ ...cardStyle, padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--fg-muted)', marginBottom: 6 }}>Current plan</div>
          <div style={{ fontFamily: '"Cormorant Garamond","Times New Roman",serif', fontStyle: 'italic', fontWeight: 500, fontSize: 42, color: 'var(--fg-strong)', lineHeight: 1 }}>Studio Pro</div>
          <div style={{ fontSize: 13.5, color: 'var(--fg-muted)', marginTop: 8 }}>$240 / month · billed monthly · renews 1 June 2026</div>
        </div>
        <button style={btnGhost}>Manage plan</button>
      </div>
      <div style={{ height: 1, background: 'var(--border-faint)', margin: '20px 0' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {[
          { label: 'Active tutors',   value: '2',      limit: '10 included' },
          { label: 'Active students', value: '7',      limit: '50 included' },
          { label: 'Storage',         value: '4.2 GB', limit: '100 GB included' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg-surface-2)', borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--fg-muted)', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontFamily: '"Cormorant Garamond","Times New Roman",serif', fontStyle: 'italic', fontWeight: 500, fontSize: 28, color: 'var(--fg-strong)', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11.5, color: 'var(--fg-faint)', marginTop: 4 }}>{s.limit}</div>
          </div>
        ))}
      </div>
    </div>

    <div style={cardStyle}>
      <div style={cardHeadStyle}>
        <div>
          <div style={cardTitleStyle}>Payment method</div>
          <div style={cardSubStyle}>Used for monthly subscription billing.</div>
        </div>
        <button style={btnGhost}>Change card</button>
      </div>
      <div style={{ padding: 20 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16, padding: '14px 18px', borderRadius: 12, background: 'linear-gradient(135deg, #0d1119, #1a2030)', color: '#fff' }}>
          <div style={{ fontFamily: '"Cormorant Garamond","Times New Roman",serif', fontStyle: 'italic', fontSize: 18, fontWeight: 500 }}>Visa</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, letterSpacing: '0.1em', fontFeatureSettings: '"tnum" 1' }}>•••• 4242</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Exp 08/28</div>
        </div>
      </div>
      <Row label="ABN / GST">
        <Field value="ABN 12 345 678 901" mono />
      </Row>
    </div>

    <div style={{ ...cardStyle, overflow: 'hidden' }}>
      <div style={cardHeadStyle}>
        <div>
          <div style={cardTitleStyle}>Invoice history</div>
          <div style={cardSubStyle}>Last 12 months of Ryze subscription invoices.</div>
        </div>
        <button style={btnQuiet}><Download size={13} /> Download all</button>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'var(--bg-surface-2)', borderBottom: '1px solid var(--border-soft)' }}>
            {['Invoice', 'Date', 'Amount', 'Status', ''].map((h, i) => (
              <th key={i} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--fg-muted)', width: i === 4 ? 48 : undefined }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {INVOICES_BILLING.map((iv, i) => (
            <tr key={iv.id} style={{ borderBottom: i < INVOICES_BILLING.length - 1 ? '1px solid var(--border-faint)' : undefined }}>
              <td style={{ padding: '13px 20px', fontFamily: 'var(--font-mono)', fontSize: 12.5, fontWeight: 600, color: 'var(--fg-strong)', fontFeatureSettings: '"tnum" 1' }}>{iv.id}</td>
              <td style={{ padding: '13px 20px', fontSize: 13.5, color: 'var(--fg-muted)' }}>{iv.date}</td>
              <td style={{ padding: '13px 20px', fontSize: 13.5, fontWeight: 600, color: 'var(--fg-strong)', fontFamily: 'var(--font-mono)', fontFeatureSettings: '"tnum" 1' }}>${iv.amount}.00</td>
              <td style={{ padding: '13px 20px' }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 999, background: 'color-mix(in oklab, var(--ok) 12%, transparent)', color: 'var(--ok)', border: '1px solid color-mix(in oklab, var(--ok) 26%, transparent)' }}>Paid</span>
              </td>
              <td style={{ padding: '13px 20px' }}><button style={btnQuiet}><Download size={14} /></button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </SectionShell>
);

/* ── Danger zone ────────────────────────────────────────────── */

const DANGER_ITEMS = [
  { title: 'Export workspace data', body: 'A zipped archive of all students, classes, lessons, attendance, homework and invoices. Sent as a download link within 1 hour.', cta: 'Request export', destructive: false },
  { title: 'Archive workspace',     body: 'Freeze the workspace — students and parents lose access, scheduled lessons are cancelled, billing pauses. Reversible within 30 days.', cta: 'Archive workspace', destructive: false },
  { title: 'Delete workspace',      body: 'Permanently remove this workspace and all associated data. This cannot be undone — please export your data first.', cta: 'Delete workspace', destructive: true },
];

const DangerSection: React.FC = () => (
  <SectionShell title="Danger zone" sub="Workspace-wide actions. Each requires a typed confirmation — there's no accidental click here.">
    <div style={cardStyle}>
      {DANGER_ITEMS.map((it, i) => (
        <div key={it.title} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, padding: 20, borderBottom: i < DANGER_ITEMS.length - 1 ? `1px solid ${it.destructive ? 'color-mix(in oklab, var(--danger) 18%, transparent)' : 'var(--border-faint)'}` : undefined, background: it.destructive ? 'color-mix(in oklab, var(--danger) 4%, transparent)' : 'transparent' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: it.destructive ? 'var(--danger)' : 'var(--fg-strong)', marginBottom: 4 }}>{it.title}</div>
            <div style={{ fontSize: 12.5, color: 'var(--fg-muted)', lineHeight: 1.5, maxWidth: 460 }}>{it.body}</div>
          </div>
          <button style={it.destructive ? btnDanger : btnGhost}>{it.cta}</button>
        </div>
      ))}
    </div>
  </SectionShell>
);

/* ══════════════════════════════════════════════════════════════
   ROOT PAGE
   ══════════════════════════════════════════════════════════════ */

const SECTION_COMPONENTS: Record<SectionKey, React.FC> = {
  appearance:    AppearanceSection,
  profile:       ProfileSection,
  notifications: NotificationsSection,
  security:      SecuritySection,
  integrations:  IntegrationsSection,
  team:          TeamSection,
  billing:       BillingSection,
  danger:        DangerSection,
};

const SettingsPage: React.FC = () => {
  const [active, setActive] = useState<SectionKey>('appearance');
  const ActiveSection = SECTION_COMPONENTS[active];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 10 }}>System</div>
          <h1 style={{ fontFamily: '"Cormorant Garamond","Times New Roman",serif', fontStyle: 'italic', fontWeight: 500, fontSize: 'clamp(38px, 3.5vw, 54px)', lineHeight: 1.08, letterSpacing: '-0.018em', color: 'var(--fg-strong)', margin: 0 }}>Settings</h1>
          <p style={{ fontSize: 14, color: 'var(--fg-muted)', margin: '10px 0 0' }}>Workspace, account and appearance preferences for the Ryze admin console.</p>
        </div>
        <button style={btnGhost}><RefreshCw size={14} /> Restore defaults</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 'var(--gap-md)', alignItems: 'start' }}>
        {/* Nav rail */}
        <div style={{ position: 'sticky', top: 80, background: 'var(--bg-surface)', border: '1px solid var(--border-faint)', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ padding: '14px 16px 10px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--fg-muted)' }}>Sections</div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '0 8px 8px' }}>
            {SECTIONS.map(s => {
              const Ic = s.icon;
              const isActive = s.key === active;
              const isDanger = s.tone === 'danger';
              return (
                <button
                  key={s.key}
                  onClick={() => setActive(s.key)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px', borderRadius: 10, border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'all 120ms ease', background: isActive ? 'var(--accent-soft)' : 'transparent' }}
                >
                  <span style={{ color: isActive ? 'var(--accent)' : isDanger ? 'var(--danger)' : 'var(--fg-muted)', flexShrink: 0, display: 'flex' }}>
                    <Ic size={16} strokeWidth={isActive ? 1.9 : 1.6} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: isActive ? 'var(--accent)' : isDanger ? 'var(--danger)' : 'var(--fg-default)' }}>{s.label}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--fg-muted)', marginTop: 1 }}>{s.desc}</div>
                  </div>
                  <ChevronRight size={13} style={{ color: isActive ? 'var(--accent)' : 'var(--fg-faint)', opacity: isActive ? 1 : 0.5, flexShrink: 0 }} />
                </button>
              );
            })}
          </nav>
          <div style={{ padding: '8px 10px 14px', borderTop: '1px solid var(--border-faint)' }}>
            <button style={{ ...btnQuiet, width: '100%', justifyContent: 'flex-start', color: 'var(--fg-muted)' }}>
              <LogOut size={14} /> Sign out of this device
            </button>
          </div>
        </div>

        {/* Section content */}
        <div>
          <ActiveSection />
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
