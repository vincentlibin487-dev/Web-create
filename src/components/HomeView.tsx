import React, { useState } from 'react';
import { Sparkles, Wand2, Plus, Mic, ArrowRight, Smartphone, MapPin, Gamepad2, Box } from 'lucide-react';
import { Template } from '../types';
import { TEMPLATES } from '../data/templates';

interface HomeViewProps {
  onGenerate: (prompt: string) => void;
  isGenerating: boolean;
  onSelectTemplate: (template: Template) => void;
  onOpenTemplates: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onGenerate,
  isGenerating,
  onSelectTemplate,
  onOpenTemplates,
}) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    onGenerate(prompt.trim());
  };

  const QUICK_CHIPS = [
    { label: 'Build an Android app', icon: Smartphone, prompt: 'Build a modern mobile-first web app with Android Material 3 design and offline task tracker.' },
    { label: 'Google Maps', icon: MapPin, prompt: 'Build an interactive store locator and real-time travel route finder app using Google Maps UI.' },
    { label: 'Create a game', icon: Gamepad2, prompt: 'Build a fully playable retro arcade game with score tracking, smooth animations, and sound effects.' },
    { label: 'Three.js 3D', icon: Box, prompt: 'Build an immersive 3D interactive product showcase viewer with custom lighting and material controls.' },
  ];

  return (
    <div className="flex-1 bg-[#131314] flex flex-col items-center justify-between p-6 lg:p-12 overflow-y-auto select-none">
      <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col items-center justify-center text-center my-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1e1e20] border border-[#3c4043] text-xs font-semibold text-[#e3e3e3] mb-6 shadow-sm">
          <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px]">✨</span>
          <span>Powered by Gemini AI</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl font-normal text-[#e3e3e3] tracking-tight mb-8">
          Build your ideas with Gemini
        </h1>

        {/* Large Prompt Input Box */}
        <form onSubmit={handleSubmit} className="w-full relative group mb-6">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur-md opacity-25 group-hover:opacity-50 transition duration-500"></div>
          <div className="relative bg-[#1e1e20] border border-[#3c4043] rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4 text-left">
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your website or app in detail, and let Gemini generate the complete HTML, CSS, and JS..."
              disabled={isGenerating}
              className="w-full bg-transparent text-[#e3e3e3] placeholder-[#9aa0a6] focus:outline-none text-base sm:text-lg font-medium resize-none leading-relaxed"
            />
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pt-3 border-t border-[#2d2d30] gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => alert('Add attachment / context')}
                  className="p-2.5 rounded-xl bg-[#2d2d30] hover:bg-[#3c4043] text-[#9aa0a6] hover:text-white transition flex items-center gap-1.5 text-xs font-medium"
                  title="Add attachment"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add context</span>
                </button>
                <div className="px-3.5 py-2 rounded-xl bg-[#2d2d30] text-xs font-medium text-[#c4c7c5] flex items-center gap-1.5 cursor-pointer hover:bg-[#3c4043] transition">
                  <span>Default mode</span>
                </div>
                <button
                  type="button"
                  onClick={() => alert('Voice input')}
                  className="p-2.5 rounded-xl bg-[#2d2d30] hover:bg-[#3c4043] text-[#9aa0a6] hover:text-white transition"
                  title="Voice input"
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>

              <button
                type="submit"
                disabled={isGenerating || !prompt.trim()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-2xl flex items-center justify-center gap-2 transition shadow-lg shadow-blue-600/30 text-sm shrink-0"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Building App...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate App</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {QUICK_CHIPS.map((chip, idx) => {
            const IconComponent = chip.icon;
            return (
              <button
                key={idx}
                onClick={() => {
                  setPrompt(chip.prompt);
                  onGenerate(chip.prompt);
                }}
                disabled={isGenerating}
                className="flex items-center gap-2 text-xs font-medium bg-[#1e1e20] hover:bg-[#2d2d30] text-[#c4c7c5] hover:text-white border border-[#3c4043] px-4 py-2.5 rounded-full transition shadow-xs disabled:opacity-50"
              >
                <IconComponent className="w-3.5 h-3.5 text-blue-400" />
                <span>{chip.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Gallery Banner */}
      <div className="w-full max-w-4xl mx-auto mt-8 pt-6 border-t border-[#2d2d30] flex items-center justify-between">
        <span className="text-xs text-[#9aa0a6]">Explore apps built with Gemini AI</span>
        <button
          onClick={onOpenTemplates}
          className="flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 transition group"
        >
          <span>Browse the app gallery</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
        </button>
      </div>
    </div>
  );
};
