import React, { useState } from 'react';
import { X, ShieldAlert, Users, FolderGit2, Activity, Mail, Clock, Sparkles } from 'lucide-react';
import { Project } from '../types';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  currentUserEmail: string;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  projects,
  currentUserEmail,
}) => {
  if (!isOpen) return null;

  // Retrieve all logged-in users from localStorage or derive from projects/sessions
  const getStoredUsers = () => {
    const saved = localStorage.getItem('nexusai_registered_users_v1');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return [
      { name: 'Amal J', email: 'amalj7767@gmail.com', loginTime: Date.now() - 3600000, appsCount: projects.length },
      { name: 'Demo User', email: 'user.demo@gmail.com', loginTime: Date.now() - 7200000, appsCount: 2 }
    ];
  };

  const users = getStoredUsers();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#1e1e20] border border-[#3c4043] rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-left">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#2d2d30] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>Admin Control Panel</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold uppercase">Restricted</span>
              </h2>
              <p className="text-xs text-[#9aa0a6]">Monitor user logins, Gmail activity, and built application metrics</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-[#2d2d30] hover:bg-[#3c4043] text-[#9aa0a6] hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overview Stats */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#131314] border border-[#2d2d30] rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-[#9aa0a6] uppercase font-bold tracking-wider">Total Users</p>
                <div className="text-2xl font-extrabold text-white mt-1">{users.length}</div>
              </div>
            </div>

            <div className="bg-[#131314] border border-[#2d2d30] rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
                <FolderGit2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-[#9aa0a6] uppercase font-bold tracking-wider">Total Apps Built</p>
                <div className="text-2xl font-extrabold text-white mt-1">{projects.length}</div>
              </div>
            </div>

            <div className="bg-[#131314] border border-[#2d2d30] rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-[#9aa0a6] uppercase font-bold tracking-wider">Active Admin</p>
                <div className="text-sm font-bold text-white mt-1 truncate max-w-[180px]">{currentUserEmail}</div>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-[#131314] border border-[#2d2d30] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#2d2d30] flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span>Logged-in Users & Gmail Activity</span>
              </h3>
              <span className="text-xs text-[#9aa0a6]">{users.length} active sessions</span>
            </div>
            <div className="divide-y divide-[#2d2d30]">
              {users.map((u: any, idx: number) => (
                <div key={idx} className="px-6 py-4 flex items-center justify-between hover:bg-[#1a1a1c] transition">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center font-bold text-xs text-white">
                      {u.name ? u.name[0].toUpperCase() : 'U'}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{u.name}</h4>
                      <p className="text-xs text-[#9aa0a6] flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 text-blue-400" />
                        <span>{u.email}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-xs">
                    <div className="text-right">
                      <span className="text-purple-400 font-bold block">{u.appsCount || 1} Apps Built</span>
                      <span className="text-[10px] text-[#9aa0a6] flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(u.loginTime).toLocaleTimeString()}</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Apps Table */}
          <div className="bg-[#131314] border border-[#2d2d30] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#2d2d30] flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Generated Applications Log</span>
              </h3>
              <span className="text-xs text-[#9aa0a6]">{projects.length} total apps</span>
            </div>
            <div className="divide-y divide-[#2d2d30]">
              {projects.map((proj) => (
                <div key={proj.id} className="px-6 py-4 flex items-center justify-between hover:bg-[#1a1a1c] transition">
                  <div>
                    <h4 className="text-sm font-bold text-white">{proj.title}</h4>
                    <p className="text-xs text-[#9aa0a6] truncate max-w-md mt-0.5">{proj.description}</p>
                  </div>
                  <div className="text-right text-xs">
                    <span className="text-blue-400 font-medium block">Owner: {currentUserEmail}</span>
                    <span className="text-[10px] text-[#9aa0a6]">{new Date(proj.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
