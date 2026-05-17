/**
 * SettingsPage — /dashboard/settings
 *
 * Profile settings for all roles. Students/tutors/admins see their Discord
 * profile (read-only). Parents can update their name and email.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Shield, LogOut, Lock, CheckCircle2,
  AlertCircle, Bell, Moon,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// ---------------------------------------------------------------------------
// Sub-sections
// ---------------------------------------------------------------------------

const ProfileSection: React.FC = () => {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [name, setName]   = useState(user?.name ?? '');

  const isDiscordUser = user?.role !== 'parent';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // In production this would call an API endpoint to update the display name
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const inputCls = 'w-full px-4 py-2.5 bg-[#050510] border border-white/10 rounded-xl text-sm ryze-text-inverse focus:outline-none focus:border-[#FFB000]/40 focus:ring-1 focus:ring-[#FFB000]/20 transition-all placeholder-slate-600 disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <div className="bg-[#0a0f1e] border border-white/10 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <User size={18} className="text-[#FFB000]" />
        <h3 className="font-bold ryze-text-inverse">Profile</h3>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/5">
        <div className="w-16 h-16 rounded-2xl bg-[#FFB000] flex items-center justify-center text-[#050510] font-bold text-2xl shrink-0">
          {user?.name?.charAt(0).toUpperCase() ?? 'U'}
        </div>
        <div>
          <div className="font-bold ryze-text-inverse">{user?.name}</div>
          <div className="text-sm ryze-text-muted capitalize">{user?.role} Account</div>
          {isDiscordUser && (
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-3 h-3 rounded-full bg-[#5865F2]" />
              <span className="text-xs ryze-text-muted">Linked via Discord</span>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-1.5">
            Display Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isDiscordUser}
            className={inputCls}
            placeholder="Your name"
          />
          {isDiscordUser && (
            <p className="text-xs ryze-text-muted mt-1">
              Display name is managed by Discord and cannot be changed here.
            </p>
          )}
        </div>

        <div>
          <label className="block text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-1.5">
            Role
          </label>
          <input
            type="text"
            value={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''}
            disabled
            className={inputCls}
          />
        </div>

        {!isDiscordUser && (
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#FFB000] text-[#050510] font-bold text-sm rounded-xl hover:bg-[#ffc133] transition-all"
          >
            {saved ? <CheckCircle2 size={14} /> : null}
            {saved ? 'Saved!' : 'Save Changes'}
          </button>
        )}
      </form>
    </div>
  );
};

const SecuritySection: React.FC = () => {
  const { user } = useAuth();
  const isDiscordUser = user?.role !== 'parent';

  return (
    <div className="bg-[#0a0f1e] border border-white/10 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield size={18} className="text-[#FFB000]" />
        <h3 className="font-bold ryze-text-inverse">Security</h3>
      </div>

      {isDiscordUser ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-4 bg-[#5865F2]/10 border border-[#5865F2]/20 rounded-xl">
            <div className="w-8 h-8 rounded-lg bg-[#5865F2] flex items-center justify-center shrink-0">
              <Lock size={14} className="text-white" />
            </div>
            <div>
              <div className="font-semibold ryze-text-inverse text-sm">Discord OAuth2</div>
              <div className="text-xs ryze-text-muted">Your account is secured via Discord.</div>
            </div>
            <CheckCircle2 size={16} className="text-emerald-400 ml-auto shrink-0" />
          </div>
          <p className="text-xs ryze-text-muted">
            To change your password or enable 2FA, manage your account at{' '}
            <a href="https://discord.com/settings/account" target="_blank" rel="noopener noreferrer"
              className="text-[#FFB000] hover:underline">
              Discord Settings
            </a>.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/3 rounded-xl border border-white/5">
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-blue-400" />
              <div>
                <div className="font-semibold ryze-text-inverse text-sm">Email & Password</div>
                <div className="text-xs ryze-text-muted">Password-based login</div>
              </div>
            </div>
            <CheckCircle2 size={16} className="text-emerald-400" />
          </div>
          <div className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <AlertCircle size={14} className="text-amber-400 shrink-0" />
            <p className="text-xs text-amber-300">
              To reset your password, contact your admin or use the invite link sent to your email.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const NotificationsSection: React.FC = () => {
  const [emailNotifs, setEmailNotifs] = useState(true);

  return (
    <div className="bg-[#0a0f1e] border border-white/10 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <Bell size={18} className="text-[#FFB000]" />
        <h3 className="font-bold ryze-text-inverse">Notifications</h3>
      </div>

      <div className="space-y-4">
        {[
          { label: 'Email Notifications', desc: 'Receive lesson reminders and announcements by email', value: emailNotifs, onChange: setEmailNotifs },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between p-4 bg-white/3 rounded-xl border border-white/5">
            <div>
              <div className="font-medium ryze-text-inverse text-sm">{item.label}</div>
              <div className="text-xs ryze-text-muted mt-0.5">{item.desc}</div>
            </div>
            <button
              type="button"
              onClick={() => item.onChange(!item.value)}
              className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${item.value ? 'bg-[#FFB000]' : 'bg-white/10'}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${item.value ? 'translate-x-5' : 'translate-x-1'}`} />
            </button>
          </div>
        ))}
      </div>

      <p className="text-xs ryze-text-muted mt-4">
        Notification preferences are saved locally. Full email preference management coming soon.
      </p>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold ryze-text-inverse">Settings</h2>
        <p className="ryze-text-muted text-sm mt-1">Manage your account preferences.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <ProfileSection />
        <SecuritySection />
        <NotificationsSection />

        {/* Danger zone */}
        <div className="bg-[#0a0f1e] border border-red-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <LogOut size={18} className="text-red-400" />
            <h3 className="font-bold text-red-400">Sign Out</h3>
          </div>
          <p className="text-sm ryze-text-muted mb-4">
            Sign out of your {user?.role} account. You'll need to log in again to access the portal.
          </p>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 font-semibold text-sm rounded-xl hover:bg-red-500/20 transition-all"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsPage;
