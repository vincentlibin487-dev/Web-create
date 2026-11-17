import React, { useState } from 'react';
import { 
  Sparkles, History, Plus, FolderGit2, LayoutTemplate, 
  LogOut, X 
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNewApp: () => void;
  onOpenProjects: () => void;
  onOpenTemplates: () => void;
  onGoHome: () => void;
  activeView: 'home' | 'workspace';
  userEmail: string;
  userName: string;
  userPhotoURL?: string;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  onNewApp,
  onOpenProjects,
  onOpenTemplates,
  onGoHome,
  activeView,
  userEmail,
  userName,
  userPhotoURL,
  onLogout,
}) => {
  const [avatarError, setAvatarError] = useState(false);
  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Drawer */}
      <aside 
        className={`fixed ${activeView === 'home' ? 'lg:static lg:translate-x-0' : ''} top-0 bottom-0 left-0 z-50 w-72 lg:w-64 bg-[#131314] border-r border-[#2d2d30] flex flex-col h-[100dvh] lg:h-screen select-none shrink-0 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : (activeView === 'home' ? '-translate-x-full lg:translate-x-0' : '-translate-x-full')
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-[#2d2d30]">
          <div 
            onClick={() => {
              onGoHome();
              onClose();
            }}
            className="flex items-center gap-3 cursor-pointer hover:opacity-85 transition"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-md">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-sm text-[#e3e3e3] leading-tight">Build Studio</h1>
              <p className="text-[10px] text-[#9aa0a6]">App Builder</p>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#9aa0a6] hover:text-white hover:bg-[#2d2d30] lg:hidden transition"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2 text-xs font-medium text-[#c4c7c5]">
          <button 
            onClick={() => {
              onNewApp();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl bg-[#2d2d30] text-white hover:bg-[#3c4043] transition shadow-xs cursor-pointer text-left"
          >
            <Plus className="w-4 h-4 text-blue-400" />
            <span className="font-semibold text-sm">New app</span>
          </button>

          <button 
            onClick={() => {
              onOpenProjects();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl hover:bg-[#1e1e20] text-[#e3e3e3] transition cursor-pointer text-left"
          >
            <FolderGit2 className="w-4 h-4 text-purple-400" />
            <span className="text-sm">My apps</span>
          </button>

          <button 
            onClick={() => {
              onOpenTemplates();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl hover:bg-[#1e1e20] text-[#e3e3e3] transition cursor-pointer text-left"
          >
            <LayoutTemplate className="w-4 h-4 text-pink-400" />
            <span className="text-sm">Gallery</span>
          </button>

          <button 
            onClick={() => {
              onOpenProjects();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl hover:bg-[#1e1e20] text-[#e3e3e3] transition cursor-pointer text-left"
          >
            <History className="w-4 h-4 text-[#9aa0a6]" />
            <span className="text-sm">History</span>
          </button>
        </div>

        {/* Bottom User Profile & Logout */}
        <div className="p-4 border-t border-[#2d2d30] bg-[#131314] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              {userPhotoURL && !avatarError ? (
                <img
                  src={userPhotoURL}
                  alt={userName || 'Profile'}
                  referrerPolicy="no-referrer"
                  onError={() => setAvatarError(true)}
                  className="w-8 h-8 rounded-full object-cover border border-[#3c4043] shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center font-bold text-xs text-white shrink-0">
                  {userName ? userName[0].toUpperCase() : 'U'}
                </div>
              )}
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-white truncate">{userName || 'User'}</h4>
                <p className="text-[10px] text-[#9aa0a6] truncate">{userEmail}</p>
              </div>
            </div>
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              title="Sign out"
              className="p-2 rounded-lg hover:bg-rose-500/20 text-[#9aa0a6] hover:text-rose-400 transition shrink-0 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
