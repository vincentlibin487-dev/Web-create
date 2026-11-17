import React, { useState } from 'react';
import { Shield, Check, Globe } from 'lucide-react';

interface GoogleOAuthModalProps {
  isOpen: boolean;
  onSuccess: (email: string, name: string) => void;
  onClose: () => void;
}

export const GoogleOAuthModal: React.FC<GoogleOAuthModalProps> = ({
  isOpen,
  onSuccess,
  onClose,
}) => {
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [customEmail, setCustomEmail] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  if (!isOpen) return null;

  const accounts = [
    { name: 'Amal J', email: 'amalj7767@gmail.com', avatar: 'A' },
    { name: 'Developer Account', email: 'dev.workspace@gmail.com', avatar: 'D' },
  ];

  const handleSelectAccount = (email: string, name: string) => {
    setIsAuthenticating(true);
    setTimeout(() => {
      setIsAuthenticating(false);
      onSuccess(email, name);
    }, 1000);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) return;
    const name = customEmail.split('@')[0];
    const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
    handleSelectAccount(customEmail.trim(), formattedName);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white text-slate-900 rounded-3xl max-w-md w-full p-8 shadow-2xl flex flex-col items-center relative overflow-hidden">
        {/* Google Header */}
        <div className="flex items-center gap-2 mb-6">
          <svg className="w-8 h-8" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span className="text-xl font-medium text-slate-700">Sign in with Google</span>
        </div>

        {isAuthenticating ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-slate-600">Connecting to Google account...</p>
          </div>
        ) : (
          <>
            <div className="w-full text-left mb-6">
              <h2 className="text-lg font-bold text-slate-900">Choose an account</h2>
              <p className="text-xs text-slate-500 mt-0.5">to continue to AI Workspace</p>
            </div>

            <div className="w-full space-y-2 mb-6">
              {accounts.map((acc, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectAccount(acc.email, acc.name)}
                  className="flex items-center gap-3.5 p-3.5 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 cursor-pointer transition group"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                    {acc.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{acc.name}</h4>
                    <p className="text-xs text-slate-500 truncate">{acc.email}</p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleCustomSubmit} className="w-full pt-4 border-t border-slate-200">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 text-left">Use another Google account</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
                <button
                  type="submit"
                  disabled={!customEmail.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm"
                >
                  Next
                </button>
              </div>
            </form>

            <div className="flex items-center justify-between w-full mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-500">
              <div className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                <span>Google Secure OAuth</span>
              </div>
              <button onClick={onClose} className="hover:text-slate-800 font-medium">Cancel</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
