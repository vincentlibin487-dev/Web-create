import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { ConnectedAccount, GeminiModelOption } from '../types';

interface AccountModelBarProps {
  accounts: ConnectedAccount[];
  activeUid: string;
  selectedModel: GeminiModelOption;
  onChangeModel: (model: GeminiModelOption) => void;
  onAddAccount?: () => void;
  onSwitchAccount?: (account: ConnectedAccount) => void;
  onRemoveAccount?: (uid: string) => void;
  isSwitchingAccount?: boolean;
  lastFallbackNotice?: string | null;
  compact?: boolean;
}

export const AccountModelBar: React.FC<AccountModelBarProps> = ({
  accounts,
  activeUid,
  selectedModel,
  onChangeModel,
  lastFallbackNotice,
  compact = false,
}) => {
  const activeAccount = accounts.find((acc) => acc.uid === activeUid) || accounts[0];
  const emailLabel = activeAccount?.email || 'Signed in with Google';
  const initial = (activeAccount?.displayName || emailLabel || 'G')[0]?.toUpperCase() || 'G';

  return (
    <div
      className={`${
        compact
          ? 'px-3 pb-3 pt-2 bg-[#1e1e20] border-t border-[#2d2d30]/70 space-y-1.5 shrink-0'
          : 'w-full bg-[#1a1a1d] border border-[#2d2d30] rounded-2xl px-3.5 py-2.5 space-y-2 text-left mb-4'
      }`}
    >
      {/* Single Clean Row: Current Profile + Gmail ID on left, Gemini Model Selector on right */}
      <div className="flex items-center justify-between gap-2.5 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          {activeAccount?.photoURL ? (
            <img
              src={activeAccount.photoURL}
              alt={activeAccount.displayName || emailLabel}
              referrerPolicy="no-referrer"
              className="w-6 h-6 rounded-full object-cover border border-[#3c4043] shrink-0"
            />
          ) : (
            <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 text-[10px] font-bold text-white flex items-center justify-center shrink-0">
              {initial}
            </span>
          )}
          <span className="text-xs font-medium text-[#e3e3e3] truncate max-w-[180px] sm:max-w-[260px]" title={emailLabel}>
            {emailLabel}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <select
            value={selectedModel}
            onChange={(e) => onChangeModel(e.target.value as GeminiModelOption)}
            className="bg-[#131314] border border-[#3c4043] hover:border-blue-500/60 rounded-lg px-2.5 py-1 text-[11px] font-semibold text-[#e3e3e3] focus:outline-none cursor-pointer"
            title="Select Gemini Model"
          >
            <option value="auto">Auto Rotate (Free Tier)</option>
            <option value="gemini-4-hydrogen">Gemini 4 Hydrogen</option>
            <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite</option>
          </select>
        </div>
      </div>

      {lastFallbackNotice && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-[10px] text-emerald-300">
          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
          <span className="truncate">{lastFallbackNotice}</span>
        </div>
      )}
    </div>
  );
};
