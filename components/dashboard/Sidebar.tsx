
import React from 'react';
import { LayoutDashboard, BookOpen, FileText, Brain, Upload, BarChart3, Users, Settings, LogOut, User, X, CalendarDays, ClipboardList, Bell, Activity } from 'lucide-react';
import { UserRole } from '../../services/backend';

export type ModuleType =
  | 'overview'
  | 'courses'
  | 'assignments'
  | 'ryze-ai'
  | 'upload'
  | 'analytics'
  | 'users'
  | 'settings'
  // Admin portal modules
  | 'bot-health'
  | 'members'
  | 'classes'
  | 'lessons'
  | 'attendance'
  | 'reminders';

interface SidebarProps {
  isOpen: boolean;
  activeTab: ModuleType;
  userRole: UserRole;
  onTabChange: (tab: ModuleType) => void;
  onRoleChange: (role: UserRole) => void;
  onLogout: () => void;
  onCloseMobile: () => void;
}

interface SidebarItem {
  id: ModuleType;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
  highlight?: boolean;
  group?: string;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  // LMS
  { id: 'overview',     label: 'Dashboard',        icon: LayoutDashboard, roles: ['student', 'tutor', 'admin'], group: 'lms' },
  { id: 'courses',      label: 'Courses',           icon: BookOpen,        roles: ['student', 'tutor', 'admin'], group: 'lms' },
  { id: 'assignments',  label: 'Assignments',       icon: FileText,        roles: ['student', 'tutor'],          group: 'lms' },
  { id: 'ryze-ai',      label: 'Ryze AI Arena',     icon: Brain,           roles: ['student', 'tutor'],          group: 'lms', highlight: true },
  { id: 'upload',       label: 'Ingestion Studio',  icon: Upload,          roles: ['tutor', 'admin'],            group: 'lms' },
  { id: 'analytics',    label: 'Analytics',         icon: BarChart3,       roles: ['student', 'tutor', 'admin'], group: 'lms' },
  { id: 'settings',     label: 'Settings',          icon: Settings,        roles: ['student', 'tutor', 'admin'], group: 'lms' },
  // Admin portal (bot management)
  { id: 'bot-health',  label: 'Bot Health',        icon: Activity,       roles: ['admin'], group: 'admin' },
  { id: 'members',     label: 'Members',           icon: Users,          roles: ['admin'], group: 'admin' },
  { id: 'classes',     label: 'Class Groups',      icon: BookOpen,       roles: ['admin'], group: 'admin' },
  { id: 'lessons',     label: 'Lessons',           icon: CalendarDays,   roles: ['admin'], group: 'admin' },
  { id: 'attendance',  label: 'Attendance',        icon: ClipboardList,  roles: ['admin'], group: 'admin' },
  { id: 'reminders',   label: 'Reminder Logs',     icon: Bell,           roles: ['admin'], group: 'admin' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen, activeTab, userRole, onTabChange, onRoleChange, onLogout, onCloseMobile
}) => {
  const brandLogoUrl = 'https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto:good,c_limit,w_240,dpr_auto/v1764105292/yellow_logo_png_bvs11z.png';
  const lmsItems = SIDEBAR_ITEMS.filter(i => i.group === 'lms' && i.roles.includes(userRole));
  const adminItems = SIDEBAR_ITEMS.filter(i => i.group === 'admin' && i.roles.includes(userRole));

  const renderItem = (item: SidebarItem) => (
    <button
      key={item.id}
      onClick={() => { onTabChange(item.id); onCloseMobile(); }}
      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-medium transition-all group relative ${
        activeTab === item.id
          ? 'bg-[#FFB000] text-[#0a0f1e] shadow-[0_0_15px_rgba(255,176,0,0.3)]'
          : 'ryze-text-muted hover:bg-white/5 hover:ryze-text-inverse'
      } ${!isOpen && 'justify-center'}`}
    >
      <item.icon size={22} className={`shrink-0 ${item.highlight && activeTab !== item.id ? 'text-[#FFB000]' : ''}`} />
      {isOpen && <span>{item.label}</span>}

      {/* Desktop tooltip when collapsed */}
      {!isOpen && (
        <div className="hidden md:block absolute left-full ml-4 bg-[#1e293b] ryze-text-inverse px-3 py-1.5 rounded-lg text-xs opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-white/10 font-bold tracking-wide">
          {item.label}
        </div>
      )}
    </button>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`
          fixed md:relative z-50 h-full flex flex-col flex-shrink-0 transition-all duration-300
          bg-[#0a0f1e] ryze-text-inverse-muted border-r border-white/5
          ${isOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0 md:w-24'}
        `}
      >
        {/* Brand */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={brandLogoUrl} alt="Ryze" width={125} height={32} className="h-8 w-auto" />
            {isOpen && <span className="font-bold text-xl tracking-tight ryze-text-inverse">Ryze<span className="text-[#FFB000]">OS</span></span>}
          </div>
          <button onClick={onCloseMobile} className="md:hidden ryze-text-muted hover:ryze-text-inverse">
            <X size={24} />
          </button>
        </div>

        {/* Nav */}
        <div className="p-6 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-white/10">
          {/* User context */}
          <div className={`bg-white/5 rounded-2xl p-4 flex items-center gap-4 mb-8 border border-white/5 ${!isOpen && 'justify-center md:flex'}`}>
            <div className="w-10 h-10 rounded-full bg-[#FFB000] flex items-center justify-center text-[#0a0f1e] shrink-0 font-bold">
              <User size={20} />
            </div>
            {isOpen && (
              <div className="overflow-hidden">
                <div className="font-bold text-sm ryze-text-inverse truncate">Alex Student</div>
                <div className="text-xs ryze-text-muted capitalize">{userRole} Account</div>
              </div>
            )}
          </div>

          {/* LMS section */}
          <nav className="space-y-2 mb-6">
            {lmsItems.map(renderItem)}
          </nav>

          {/* Admin section */}
          {adminItems.length > 0 && (
            <>
              {isOpen && (
                <div className="text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-3 px-1">
                  Bot Admin
                </div>
              )}
              {!isOpen && <div className="border-t border-white/5 my-4" />}
              <nav className="space-y-2">
                {adminItems.map(renderItem)}
              </nav>
            </>
          )}
        </div>

        {/* RBAC simulator */}
        {isOpen && (
          <div className="mt-auto px-6 py-6 border-t border-white/5 bg-[#0a0f1e]">
            <div className="text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-3">Viewing As</div>
            <div className="flex gap-2 bg-black/20 p-1 rounded-xl border border-white/5">
              {(['student', 'tutor', 'admin'] as UserRole[]).map(role => (
                <button
                  key={role}
                  onClick={() => onRoleChange(role)}
                  className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg capitalize transition-all ${userRole === role ? 'bg-slate-700 ryze-text-inverse shadow-sm' : 'ryze-text-muted hover:ryze-text-inverse-muted'}`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Logout */}
        <div className="p-6 bg-[#0a0f1e]">
          <button
            onClick={onLogout}
            className={`flex items-center gap-4 ryze-text-muted hover:ryze-text-inverse transition-colors text-sm font-medium w-full px-4 py-2 ${!isOpen && 'justify-center'}`}
          >
            <LogOut size={20} /> {isOpen && 'Sign Out'}
          </button>
        </div>
      </aside>
    </>
  );
};
