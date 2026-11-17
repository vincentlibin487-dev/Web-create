import React, { useState } from 'react';
import { Sparkles, ArrowRight, Wand2, Lightbulb } from 'lucide-react';

interface PromptBarProps {
  onGenerate: (prompt: string) => void;
  isGenerating: boolean;
  placeholder?: string;
}

const SUGGESTIONS = [
  "E-commerce sneaker store with cart",
  "SaaS analytics dashboard with charts",
  "Pomodoro focus timer with tasks",
  "Crypto live tracker & portfolio",
  "AI recipe generator & chef notes",
  "Sleek creative agency portfolio"
];

export const PromptBar: React.FC<PromptBarProps> = ({
  onGenerate,
  isGenerating,
  placeholder = "Describe any website or app you want to build..."
}) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    onGenerate(prompt.trim());
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur-md opacity-25 group-hover:opacity-50 transition duration-500"></div>
        <div className="relative bg-[#1e1e20] border border-[#3c4043] rounded-2xl p-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shadow-2xl">
          <div className="flex items-center gap-3 px-3 py-2 flex-1">
            <Wand2 className="w-5 h-5 text-blue-400 shrink-0" />
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={placeholder}
              disabled={isGenerating}
              className="w-full bg-transparent text-[#e3e3e3] placeholder-[#9aa0a6] focus:outline-none text-sm sm:text-base font-medium"
            />
          </div>
          <button
            type="submit"
            disabled={isGenerating || !prompt.trim()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-blue-600/30 shrink-0"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Building AI App...</span>
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
      </form>

      {/* Suggestion pills */}
      <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-2 scrollbar-none">
        <div className="flex items-center gap-1.5 text-xs text-[#9aa0a6] font-semibold shrink-0">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          <span>Try ideas:</span>
        </div>
        {SUGGESTIONS.map((suggestion, idx) => (
          <button
            key={idx}
            onClick={() => {
              setPrompt(suggestion);
              onGenerate(suggestion);
            }}
            disabled={isGenerating}
            className="text-xs bg-[#1e1e20] hover:bg-[#2d2d30] text-[#c4c7c5] border border-[#3c4043] px-3 py-1.5 rounded-full whitespace-nowrap transition shadow-xs disabled:opacity-50"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};
