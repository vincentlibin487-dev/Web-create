import React from 'react';
import { X, FolderOpen, Trash2, Star, Sparkles, ArrowRight, Clock } from 'lucide-react';
import { Project } from '../types';

interface ProjectManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  currentProjectId: string;
  onSelectProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
  onToggleStar: (id: string) => void;
}

export const ProjectManagerModal: React.FC<ProjectManagerModalProps> = ({
  isOpen,
  onClose,
  projects,
  currentProjectId,
  onSelectProject,
  onDeleteProject,
  onToggleStar,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#1e1e20] border border-[#3c4043] rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-[#2d2d30] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Your Saved Projects</h2>
              <p className="text-xs text-[#9aa0a6]">Access, load, or manage all your generated websites and apps</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-[#2d2d30] hover:bg-[#3c4043] text-[#9aa0a6] hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {projects.length === 0 ? (
            <div className="text-center py-16">
              <FolderOpen className="w-12 h-12 text-[#9aa0a6] mx-auto mb-3" />
              <h3 className="text-lg font-bold text-[#e3e3e3]">No saved projects yet</h3>
              <p className="text-xs text-[#9aa0a6] mt-1">Generate a new website or load a template to get started.</p>
            </div>
          ) : (
            projects.map((proj) => {
              const isCurrent = proj.id === currentProjectId;
              return (
                <div
                  key={proj.id}
                  className={`p-4 rounded-2xl border flex items-center justify-between transition ${
                    isCurrent 
                      ? 'bg-blue-950/30 border-blue-500/60 shadow-lg shadow-blue-500/10' 
                      : 'bg-[#131314] border-[#2d2d30] hover:border-[#3c4043]'
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1 mr-4">
                    <button
                      onClick={() => onToggleStar(proj.id)}
                      className={`p-2 rounded-xl transition ${
                        proj.starred ? 'text-amber-400 bg-amber-500/10' : 'text-[#9aa0a6] hover:text-white bg-[#2d2d30]'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${proj.starred ? 'fill-amber-400' : ''}`} />
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-base truncate">{proj.title}</h3>
                        {isCurrent && (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full shrink-0">Current</span>
                        )}
                      </div>
                      <p className="text-xs text-[#9aa0a6] truncate mt-0.5">{proj.description}</p>
                      <div className="flex items-center gap-2 text-[10px] text-[#9aa0a6] mt-2">
                        <Clock className="w-3 h-3" />
                        <span>Updated {new Date(proj.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        onSelectProject(proj);
                        onClose();
                      }}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-md"
                    >
                      <span>Open</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteProject(proj.id)}
                      className="p-2 rounded-xl bg-[#2d2d30] hover:bg-rose-500/20 text-[#9aa0a6] hover:text-rose-400 border border-[#3c4043] transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
