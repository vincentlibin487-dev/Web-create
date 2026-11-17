import React, { useState, useRef } from 'react';
import { Sparkles, Wand2, Plus, Mic, ArrowRight, Smartphone, MapPin, Gamepad2, Box, Image, FileText, Check, X } from 'lucide-react';
import { Template } from '../types';
import { TEMPLATES } from '../data/templates';

interface HomeViewProps {
  onGenerate: (prompt: string, attachment?: string) => void;
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
  const [isListening, setIsListening] = useState(false);
  const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() && !attachedImage) return;
    if (isGenerating) return;
    onGenerate(prompt.trim() || 'Create a web app based on the attached image context.', attachedImage || undefined);
  };

  // Voice Recognition (Speech-to-Text)
  const handleToggleVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please try Chrome or Safari.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setPrompt(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
      alert('Could not start microphone recording.');
    }
  };

  // Handle File / Image Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachedImage(reader.result as string);
        setIsAttachmentModalOpen(false);
      };
      reader.readAsDataURL(file);
    }
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

        {/* Attached image preview banner if any */}
        {attachedImage && (
          <div className="w-full mb-4 bg-[#1e1e20] border border-blue-500/50 rounded-2xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={attachedImage} alt="Attachment" className="w-12 h-12 object-cover rounded-xl border border-[#3c4043]" />
              <div className="text-left">
                <span className="text-xs font-bold text-white block">Image Context Attached</span>
                <span className="text-[10px] text-[#9aa0a6]">Gemini will use this image to style & build your app</span>
              </div>
            </div>
            <button 
              onClick={() => setAttachedImage(null)}
              className="p-1.5 rounded-lg bg-[#2d2d30] hover:bg-rose-500/20 text-[#9aa0a6] hover:text-rose-400 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Large Prompt Input Box */}
        <form onSubmit={handleSubmit} className="w-full relative group mb-6">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur-md opacity-25 group-hover:opacity-50 transition duration-500"></div>
          <div className="relative bg-[#1e1e20] border border-[#3c4043] rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4 text-left">
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={isListening ? "Listening... Speak your prompt now..." : "Describe your website or app in detail, and let Gemini generate the complete HTML, CSS, and JS..."}
              disabled={isGenerating}
              className={`w-full bg-transparent text-[#e3e3e3] placeholder-[#9aa0a6] focus:outline-none text-base sm:text-lg font-medium resize-none leading-relaxed ${isListening ? 'text-blue-400 animate-pulse' : ''}`}
            />
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pt-3 border-t border-[#2d2d30] gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsAttachmentModalOpen(true)}
                  className="p-2.5 rounded-xl bg-[#2d2d30] hover:bg-[#3c4043] text-[#9aa0a6] hover:text-white transition flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                  title="Upload Image or File"
                >
                  <Plus className="w-4 h-4 text-blue-400" />
                  <span className="hidden sm:inline">Add context</span>
                </button>

                <div className="px-3.5 py-2 rounded-xl bg-[#2d2d30] text-xs font-medium text-[#c4c7c5] flex items-center gap-1.5 cursor-pointer hover:bg-[#3c4043] transition">
                  <span>Default mode</span>
                </div>

                <button
                  type="button"
                  onClick={handleToggleVoice}
                  className={`p-2.5 rounded-xl transition flex items-center gap-1.5 text-xs font-medium cursor-pointer ${
                    isListening 
                      ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-600/30' 
                      : 'bg-[#2d2d30] hover:bg-[#3c4043] text-[#9aa0a6] hover:text-white'
                  }`}
                  title="Voice Input (Speech-to-Text)"
                >
                  <Mic className={`w-4 h-4 ${isListening ? 'text-white' : 'text-purple-400'}`} />
                  <span className="hidden sm:inline">{isListening ? 'Listening...' : 'Voice'}</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={isGenerating || (!prompt.trim() && !attachedImage)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-2xl flex items-center justify-center gap-2 transition shadow-lg shadow-blue-600/30 text-sm shrink-0 cursor-pointer"
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
                className="flex items-center gap-2 text-xs font-medium bg-[#1e1e20] hover:bg-[#2d2d30] text-[#c4c7c5] hover:text-white border border-[#3c4043] px-4 py-2.5 rounded-full transition shadow-xs disabled:opacity-50 cursor-pointer"
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
          className="flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 transition group cursor-pointer"
        >
          <span>Browse the app gallery</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
        </button>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Attachment Modal */}
      {isAttachmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1e1e20] border border-[#3c4043] rounded-3xl max-w-md w-full p-6 shadow-2xl text-left">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-400" />
                <span>Add Context & Attachments</span>
              </h3>
              <button 
                onClick={() => setIsAttachmentModalOpen(false)}
                className="p-1.5 rounded-lg bg-[#2d2d30] hover:bg-[#3c4043] text-[#9aa0a6] hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-xs text-[#9aa0a6] mb-6">Upload a wireframe screenshot, design reference, or UI mockup to guide Gemini in building your app.</p>

            <div 
              onClick={() => {
                fileInputRef.current?.click();
              }}
              className="border-2 border-dashed border-[#3c4043] hover:border-blue-500 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer bg-[#131314] transition group"
            >
              <Image className="w-10 h-10 text-blue-400 mb-3 group-hover:scale-110 transition" />
              <span className="text-sm font-bold text-white mb-1">Click to upload image reference</span>
              <span className="text-[11px] text-[#9aa0a6]">PNG, JPG, WebP up to 10MB</span>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsAttachmentModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#2d2d30] hover:bg-[#3c4043] text-white text-xs font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
