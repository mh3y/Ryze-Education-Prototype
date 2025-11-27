
import React from 'react';
import { LayoutDashboard, BookOpen, FileText, Brain, Upload, BarChart3, Users, Settings, LogOut, User, X } from 'lucide-react';
import { UserRole } from '../../services/backend';

export type ModuleType = 'overview' | 'courses' | 'assignments' | 'ryze-ai' | 'upload' | 'analytics' | 'users' | 'settings';

interface SidebarProps {
  isOpen: boolean;
  activeTab: ModuleType;
  userRole: UserRole;
  onTabChange: (tab: ModuleType) => void;
  onRoleChange: (role: UserRole) => void;
  onLogout: () => void;
  onCloseMobile: () => void; // New prop for mobile close
}

interface SidebarItem {
  id: ModuleType;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
  highlight?: boolean;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: 'overview', label: 'Dashboard', icon: LayoutDashboard, roles: ['student', 'tutor', 'admin'] },
  { id: 'courses', label: 'Courses', icon: BookOpen, roles: ['student', 'tutor', 'admin'] },
  { id: 'assignments', label: 'Assignments', icon: FileText, roles: ['student', 'tutor'] },
  { id: 'ryze-ai', label: 'Ryze AI Arena', icon: Brain, roles: ['student', 'tutor'], highlight: true },
  { id: 'upload', label: 'Ingestion Studio', icon: Upload, roles: ['tutor', 'admin'] },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, roles: ['student', 'tutor', 'admin'] },
  { id: 'users', label: 'User Management', icon: Users, roles: ['admin'] },
  { id: 'settings', label: 'Settings', icon: Settings, roles: ['student', 'tutor', 'admin'] },
];

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, activeTab, userRole, onTabChange, onRoleChange, onLogout, onCloseMobile
}) => {
  const visibleItems = SIDEBAR_ITEMS.filter(item => item.roles.includes(userRole));

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`
          fixed md:relative z-50 h-full flex flex-col flex-shrink-0 transition-all duration-300
          bg-[#0a0f1e] text-slate-300 border-r border-white/5
          ${isOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0 md:w-24'}
        `}
      >
        {/* Brand */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img 
               src="https://res.cloudinary.com/dsvjhemjd/image/upload/v1764105292/yellow_logo_png_bvs11z.png" 
               alt="Ryze" 
               className="h-8 w-auto" 
            />
            {isOpen && <span className="font-bold text-xl tracking-tight text-white">Ryze<span className="text-[#FFB000]">OS</span></span>}
          </div>
          {/* Mobile Close Button */}
          <button onClick={onCloseMobile} className="md:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* User Context */}
        <div className="p-6 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-white/10">
          <div className={`bg-white/5 rounded-2xl p-4 flex items-center gap-4 mb-8 border border-white/5 ${!isOpen && 'justify-center md:flex'}`}>
            <div className="w-10 h-10 rounded-full bg-[#FFB000] flex items-center justify-center text-[#0a0f1e] shrink-0 font-bold">
               <User size={20} />
            </div>
            {isOpen && (
              <div className="overflow-hidden">
                 <div className="font-bold text-sm text-white truncate">Alex Student</div>
                 <div className="text-xs text-slate-400 capitalize">{userRole} Account</div>
              </div>
            )}
          </div>

          <nav className="space-y-2">
            {visibleItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { onTabChange(item.id); onCloseMobile(); }}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-medium transition-all group relative ${
                  activeTab === item.id 
                  ? 'bg-[#FFB000] text-[#0a0f1e] shadow-[0_0_15px_rgba(255,176,0,0.3)]' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
                } ${!isOpen && 'justify-center'}`}
              >
                <item.icon size={22} className={`shrink-0 ${item.highlight && activeTab !== item.id ? 'text-[#FFB000]' : ''}`} />
                {isOpen && <span>{item.label}</span>}
                
                {/* Desktop Tooltip */}
                {!isOpen && (
                  <div className="hidden md:block absolute left-full ml-4 bg-[#1e293b] text-white px-3 py-1.5 rounded-lg text-xs opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-white/10 font-bold tracking-wide">
                    {item.label}
                  </div>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* RBAC Simulator */}
        {isOpen && (
          <div className="mt-auto px-6 py-6 border-t border-white/5 bg-[#0a0f1e]">
             <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Viewing As</div>
             <div className="flex gap-2 bg-black/20 p-1 rounded-xl border border-white/5">
                {(['student', 'tutor', 'admin'] as UserRole[]).map(role => (
                   <button
                     key={role}
                     onClick={() => onRoleChange(role)}
                     className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg capitalize transition-all ${userRole === role ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
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
             className={`flex items-center gap-4 text-slate-500 hover:text-white transition-colors text-sm font-medium w-full px-4 py-2 ${!isOpen && 'justify-center'}`}
           >
             <LogOut size={20} /> {isOpen && "Sign Out"}
           </button>
        </div>
      </aside>
    </>
  );
};
