import React from 'react';
import { 
  Sparkles, History, Plus, FolderGit2, LayoutTemplate, 
  LayoutDashboard, ShieldAlert, LogOut 
} from 'lucide-react';

interface SidebarProps {
  onNewApp: () => void;
  onOpenProjects: () => void;
  onOpenTemplates: () => void;
  onOpenAdmin: () => void;
  onGoHome: () => void;
  activeView: 'home' | 'workspace';
  userEmail: string;
  userName: string;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onNewApp,
  onOpenProjects,
  onOpenTemplates,
  onOpenAdmin,
  onGoHome,
  activeView,
  userEmail,
  userName,
  onLogout,
}) => {
  return (
    <aside className="w-64 bg-[#131314] border-r border-[#2d2d30] flex flex-col h-screen select-none shrink-0 z-30">
      {/* Brand Header */}
      <div 
        onClick={onGoHome}
        className="h-16 px-4 flex items-center gap-3 border-b border-[#2d2d30] cursor-pointer hover:bg-[#1e1e20] transition"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-md">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="font-semibold text-sm text-[#e3e3e3] leading-tight">AI Workspace</h1>
          <p className="text-[10px] text-[#9aa0a6]">App Builder</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2 text-xs font-medium text-[#c4c7c5]">
        <button 
          onClick={onNewApp}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#2d2d30] text-white transition shadow-xs"
        >
          <Plus className="w-4 h-4 text-blue-400" />
          <span>New app</span>
        </button>

        <button 
          onClick={onOpenProjects}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#1e1e20] text-[#e3e3e3] transition"
        >
          <FolderGit2 className="w-4 h-4 text-purple-400" />
          <span>My apps</span>
        </button>

        <button 
          onClick={onOpenTemplates}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#1e1e20] text-[#e3e3e3] transition"
        >
          <LayoutTemplate className="w-4 h-4 text-pink-400" />
          <span>Gallery</span>
        </button>

        <button 
          onClick={onOpenProjects}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#1e1e20] text-[#e3e3e3] transition"
        >
          <History className="w-4 h-4 text-[#9aa0a6]" />
          <span>History</span>
        </button>

        <button 
          onClick={onOpenAdmin}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition"
        >
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>Admin Panel</span>
        </button>
      </div>

      {/* Bottom User Profile & Logout */}
      <div className="p-3 border-t border-[#2d2d30] bg-[#131314] space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center font-bold text-xs text-white shrink-0">
              {userName ? userName[0].toUpperCase() : 'U'}
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-white truncate">{userName || 'User'}</h4>
              <p className="text-[10px] text-[#9aa0a6] truncate">{userEmail}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Sign out"
            className="p-2 rounded-lg hover:bg-rose-500/20 text-[#9aa0a6] hover:text-rose-400 transition shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
