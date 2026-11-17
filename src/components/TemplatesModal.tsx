import React from 'react';
import { X, LayoutTemplate, Sparkles, ArrowRight } from 'lucide-react';
import { TEMPLATES } from '../data/templates';
import { Template } from '../types';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: Template) => void;
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#1e1e20] border border-[#3c4043] rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-[#2d2d30] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <LayoutTemplate className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Starter Templates</h2>
              <p className="text-xs text-[#9aa0a6]">Choose a production-grade template to load and customize instantly</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-[#2d2d30] hover:bg-[#3c4043] text-[#9aa0a6] hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TEMPLATES.map((tmpl) => (
            <div 
              key={tmpl.id}
              className="bg-[#131314] border border-[#2d2d30] rounded-2xl p-5 flex flex-col justify-between hover:border-blue-500/50 hover:bg-[#1a1a1c] transition group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 px-2.5 py-1 rounded-full border border-blue-500/30">
                    {tmpl.category}
                  </span>
                  <span className="text-xs text-[#9aa0a6] font-medium">{tmpl.badge}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition">{tmpl.title}</h3>
                <p className="text-xs text-[#c4c7c5] mb-6 line-clamp-3">{tmpl.description}</p>
              </div>
              <button
                onClick={() => {
                  onSelectTemplate(tmpl);
                  onClose();
                }}
                className="w-full bg-[#2d2d30] group-hover:bg-blue-600 text-white font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-2 text-sm shadow-md"
              >
                <Sparkles className="w-4 h-4" />
                <span>Use Template</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
