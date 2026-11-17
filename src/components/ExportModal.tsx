import React, { useState } from 'react';
import { X, Download, Copy, Check, FileCode, Sparkles } from 'lucide-react';
import { Project } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(project.fullCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadHTML = () => {
    const blob = new Blob([project.fullCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#1e1e20] border border-[#3c4043] rounded-3xl max-w-xl w-full flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-[#2d2d30] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Export & Share Project</h2>
              <p className="text-xs text-[#9aa0a6]">Download your standalone website code or copy to clipboard</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-[#2d2d30] hover:bg-[#3c4043] text-[#9aa0a6] hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-[#131314] border border-[#2d2d30] rounded-2xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                <FileCode className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Standalone HTML File</h3>
                <p className="text-xs text-[#9aa0a6] mt-0.5">Complete single-file bundle with Tailwind CSS & embedded JS</p>
              </div>
            </div>
            <button
              onClick={handleDownloadHTML}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition shadow-lg shadow-blue-600/30 flex items-center gap-2 shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
          </div>

          <div className="bg-[#131314] border border-[#2d2d30] rounded-2xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
                <Copy className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Copy Code to Clipboard</h3>
                <p className="text-xs text-[#9aa0a6] mt-0.5">Paste directly into your editor or code repository</p>
              </div>
            </div>
            <button
              onClick={handleCopyCode}
              className="px-5 py-2.5 rounded-xl bg-[#2d2d30] hover:bg-[#3c4043] text-white font-semibold text-sm transition flex items-center gap-2 shrink-0 border border-[#3c4043]"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-gradient-to-r from-blue-950/40 via-purple-950/40 to-[#131314] border border-blue-500/20 rounded-2xl p-4 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-blue-400 shrink-0" />
            <p className="text-xs text-[#c4c7c5]">
              Your generated app is fully self-contained and ready to deploy on Vercel, Netlify, GitHub Pages, or any static web host.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
