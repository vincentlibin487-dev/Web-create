import React from 'react';
import { Sparkles, LayoutTemplate, FolderOpen, Download, Code2, Smartphone } from 'lucide-react';
import { Project } from '../types';

interface NavbarProps {
  currentProject: Project;
  onOpenTemplates: () => void;
  onOpenProjects: () => void;
  onOpenExport: () => void;
  onNewProject: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentProject,
  onOpenTemplates,
  onOpenProjects,
  onOpenExport,
  onNewProject,
}) => {
  return (
    <header className="h-16 border-b border-[#2d2d30] bg-[#1e1e20]/90 backdrop-blur px-6 flex items-center justify-between z-40 select-none">
      <div className="flex items-center gap-4">
        <div 
          onClick={onNewProject}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white">Build Studio</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full">Web Builder</span>
            </div>
            <p className="text-xs text-[#9aa0a6] truncate max-w-[200px] sm:max-w-xs">{currentProject.title}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onOpenTemplates}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#2d2d30] hover:bg-[#3c4043] text-[#e3e3e3] text-sm font-medium border border-[#3c4043] transition shadow-xs"
        >
          <LayoutTemplate className="w-4 h-4 text-blue-400" />
          <span className="hidden sm:inline">Templates</span>
        </button>

        <button
          onClick={onOpenProjects}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#2d2d30] hover:bg-[#3c4043] text-[#e3e3e3] text-sm font-medium border border-[#3c4043] transition shadow-xs"
        >
          <FolderOpen className="w-4 h-4 text-purple-400" />
          <span className="hidden sm:inline">My Projects</span>
        </button>

        <button
          onClick={onOpenExport}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/30 transition"
        >
          <Download className="w-4 h-4" />
          <span>Export & Share</span>
        </button>
      </div>
    </header>
  );
};
