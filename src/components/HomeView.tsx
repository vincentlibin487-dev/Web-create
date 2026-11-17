import React, { useState } from 'react';
import { 
  Sparkles, Plus, ArrowRight, Globe, 
  Image, X, Menu, Tag, LogOut, ShieldAlert 
} from 'lucide-react';
import { Template, ConnectedAccount, GeminiModelOption } from '../types';
import { compressGalleryImage } from '../utils/imageHelper';
import { AccountModelBar } from './AccountModelBar';

interface HomeViewProps {
  onGenerate: (prompt: string, attachment?: string, projectName?: string) => void;
  isGenerating: boolean;
  onSelectTemplate: (template: Template) => void;
  onOpenTemplates: () => void;
  onOpenMenu?: () => void;
  userName?: string;
  userEmail?: string;
  userPhotoURL?: string;
  isAdmin?: boolean;
  onLogout?: () => void;
  accounts: ConnectedAccount[];
  activeUid: string;
  selectedModel: GeminiModelOption;
  onChangeModel: (model: GeminiModelOption) => void;
  onAddAccount: () => void;
  onSwitchAccount: (account: ConnectedAccount) => void;
  onRemoveAccount: (uid: string) => void;
  isSwitchingAccount?: boolean;
  lastFallbackNotice?: string | null;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onGenerate,
  isGenerating,
  onSelectTemplate: _onSelectTemplate,
  onOpenTemplates,
  onOpenMenu,
  userName,
  userEmail,
  userPhotoURL,
  isAdmin,
  onLogout,
  accounts,
  activeUid,
  selectedModel,
  onChangeModel,
  onAddAccount,
  onSwitchAccount,
  onRemoveAccount,
  isSwitchingAccount,
  lastFallbackNotice,
}) => {
  const [prompt, setPrompt] = useState('');
  const [projectName, setProjectName] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() && !attachedImage) return;
    if (isGenerating) return;
    onGenerate(
      prompt.trim() || 'Create a web app based on the attached image context.', 
      attachedImage || undefined,
      projectName.trim() || undefined
    );
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressGalleryImage(file);
        setAttachedImage(compressed);
      } catch (err) {
        console.error('Failed to process image:', err);
      }
      e.target.value = '';
    }
  };

  const QUICK_CHIPS = [
    { label: 'Build App / Website', icon: Globe, prompt: 'Build a modern, responsive website and interactive web application with clean UI, smooth navigation, and complete multi-file structure.' },
  ];

  return (
    <div className="flex-1 bg-[#131314] flex flex-col justify-between p-4 sm:p-6 lg:px-10 lg:py-6 overflow-y-auto select-none min-h-[100dvh] lg:min-h-0 w-full">
      {/* Top Header (Mobile + Desktop) */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#2d2d30] shrink-0">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenMenu}
            className="p-2 rounded-xl bg-[#1e1e20] border border-[#3c4043] text-white hover:bg-[#2d2d30] transition cursor-pointer flex lg:hidden items-center gap-2"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5 text-blue-400" />
            <span className="text-xs font-semibold text-[#c4c7c5]">Menu</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm sm:text-base font-bold text-white tracking-tight">Build Studio</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 relative">
          <button
            onClick={onOpenTemplates}
            className="px-3 py-1.5 rounded-xl bg-[#1e1e20] border border-[#3c4043] text-xs font-medium text-pink-400 hover:bg-[#2d2d30] transition cursor-pointer"
          >
            Gallery
          </button>

          {/* User Google Profile Photo at top of website */}
          <button
            type="button"
            onClick={() => setProfileMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 p-0.5 sm:pr-2.5 rounded-full bg-[#1e1e20] border border-[#3c4043] hover:border-blue-500/60 transition cursor-pointer"
            title={userName ? `${userName}${userEmail ? ` (${userEmail})` : ''}` : 'Account'}
          >
            {userPhotoURL && !avatarError ? (
              <img
                src={userPhotoURL}
                alt={userName || 'Profile'}
                referrerPolicy="no-referrer"
                onError={() => setAvatarError(true)}
                className="w-8 h-8 rounded-full object-cover border border-[#3c4043]"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center font-bold text-xs text-white">
                {userName ? userName[0].toUpperCase() : 'U'}
              </div>
            )}
            {userName && (
              <span className="hidden sm:inline text-xs font-medium text-[#e3e3e3] max-w-[120px] truncate">
                {userName}
              </span>
            )}
          </button>

          {profileMenuOpen && (
            <div className="absolute right-0 top-11 w-56 bg-[#1e1e20] border border-[#3c4043] rounded-2xl shadow-2xl p-3 z-50 text-left">
              <div className="flex items-center gap-2.5 pb-2.5 mb-2 border-b border-[#2d2d30]">
                {userPhotoURL && !avatarError ? (
                  <img
                    src={userPhotoURL}
                    alt={userName || 'Profile'}
                    referrerPolicy="no-referrer"
                    onError={() => setAvatarError(true)}
                    className="w-9 h-9 rounded-full object-cover border border-[#3c4043] shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center font-bold text-xs text-white shrink-0">
                    {userName ? userName[0].toUpperCase() : 'U'}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">{userName || 'User'}</div>
                  <div className="text-[11px] text-[#9aa0a6] truncate">{userEmail}</div>
                </div>
              </div>
              {isAdmin && (
                <a
                  href="/admin"
                  onClick={() => setProfileMenuOpen(false)}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold text-amber-400 hover:bg-amber-500/15 transition mb-1"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Admin Panel</span>
                </a>
              )}
              {onLogout && (
                <button
                  type="button"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/15 transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Center Hero & Prompt Box */}
      <div className="w-full max-w-3xl mx-auto flex-1 flex flex-col items-center justify-center text-center my-auto py-4">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1e1e20] border border-[#3c4043] text-xs font-semibold text-[#e3e3e3] mb-4 sm:mb-6 shadow-sm">
          <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px]">✨</span>
          <span>Powered by Gemini AI</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-normal text-[#e3e3e3] tracking-tight mb-4 sm:mb-8 leading-tight">
          Build your ideas with Gemini
        </h1>

        {/* Attached image preview banner if any */}
        {attachedImage && (
          <div className="w-full mb-3 bg-[#1e1e20] border border-blue-500/50 rounded-2xl p-2.5 sm:p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={attachedImage} alt="Attachment" className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-xl border border-[#3c4043]" />
              <div className="text-left">
                <span className="text-xs font-bold text-white block">Gallery Image Attached</span>
                <span className="text-[10px] text-[#9aa0a6]">Gemini will adapt your layout directly from this</span>
              </div>
            </div>
            <button 
              type="button"
              onClick={() => setAttachedImage(null)}
              className="p-1.5 rounded-lg bg-[#2d2d30] hover:bg-rose-500/20 text-[#9aa0a6] hover:text-rose-400 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Large Prompt Input Box */}
        <form onSubmit={handleSubmit} className="w-full relative group mb-4 sm:mb-6">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur-md opacity-25 group-hover:opacity-50 transition duration-500"></div>
          <div className="relative bg-[#1e1e20] border border-[#3c4043] rounded-3xl p-3.5 sm:p-5 shadow-2xl flex flex-col gap-3 text-left">
            {/* Custom Project Name Input */}
            <div className="flex items-center gap-2 pb-2.5 border-b border-[#2d2d30]">
              <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <Tag className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Project / Website Name (e.g. Acme Studio, CyberKick Store...)"
                disabled={isGenerating}
                className="w-full bg-transparent text-white placeholder-[#9aa0a6] focus:outline-none text-xs sm:text-sm font-semibold"
              />
              {projectName.trim() && (
                <span className="text-[10px] text-blue-300 font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/30 shrink-0">
                  Header & Title
                </span>
              )}
            </div>

            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe an app or website and let Gemini do the rest..."
              disabled={isGenerating}
              className="w-full bg-transparent text-[#e3e3e3] placeholder-[#9aa0a6] focus:outline-none text-sm sm:text-base lg:text-lg font-medium resize-none leading-relaxed"
            />
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pt-2.5 border-t border-[#2d2d30] gap-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                <label
                  htmlFor="home-gallery-input"
                  className="p-2 sm:p-2.5 rounded-xl bg-[#2d2d30] hover:bg-[#3c4043] text-[#9aa0a6] hover:text-white transition flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                  title="Pick image directly from Phone Gallery"
                >
                  <Plus className="w-4 h-4 text-blue-400" />
                  <Image className="w-3.5 h-3.5 text-blue-300" />
                  <span>Gallery</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isGenerating || (!prompt.trim() && !attachedImage)}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 text-white font-semibold px-5 py-2.5 sm:py-3 rounded-2xl flex items-center justify-center gap-2 transition shadow-lg shadow-blue-600/30 text-sm shrink-0 cursor-pointer"
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

        {/* Multi-Gmail Switcher & Free Model Auto-Rotation Bar below prompt box */}
        <AccountModelBar
          accounts={accounts}
          activeUid={activeUid}
          selectedModel={selectedModel}
          onChangeModel={onChangeModel}
          onAddAccount={onAddAccount}
          onSwitchAccount={onSwitchAccount}
          onRemoveAccount={onRemoveAccount}
          isSwitchingAccount={isSwitchingAccount}
          lastFallbackNotice={lastFallbackNotice}
        />

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-full">
          {QUICK_CHIPS.map((chip, idx) => {
            const IconComponent = chip.icon;
            return (
              <button
                key={idx}
                onClick={() => {
                  setPrompt(chip.prompt);
                  onGenerate(chip.prompt, attachedImage || undefined, projectName.trim() || undefined);
                }}
                disabled={isGenerating}
                className="flex items-center gap-1.5 text-xs font-medium bg-[#1e1e20] hover:bg-[#2d2d30] text-[#c4c7c5] hover:text-white border border-[#3c4043] px-3.5 py-2 rounded-full transition shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <IconComponent className="w-3.5 h-3.5 text-blue-400" />
                <span>{chip.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Direct Phone Gallery / File input */}
      <input
        id="home-gallery-input"
        type="file"
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
};
