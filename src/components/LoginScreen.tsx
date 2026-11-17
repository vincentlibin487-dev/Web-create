import React, { useState } from 'react';
import { Sparkles, Shield, Layers, Code2, Download } from 'lucide-react';
import { signInWithPopup, signInWithRedirect } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

interface LoginScreenProps {
  authError?: string | null;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ authError }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setLocalError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      if (err?.code === 'auth/popup-blocked' || err?.code === 'auth/operation-not-supported-in-this-environment') {
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (redirectErr: any) {
          setLocalError(redirectErr?.message || 'Google Sign-In redirect failed.');
        }
      } else if (err?.code === 'auth/popup-closed-by-user') {
        setLocalError('Sign-in popup was closed. Please choose your Google account to continue.');
      } else {
        setLocalError(err?.message || 'Google Sign-In failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const displayError = localError || authError;

  return (
    <div className="min-h-[100dvh] bg-[#131314] text-[#e3e3e3] flex items-center justify-center p-4 select-none relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="relative w-full max-w-md bg-[#1e1e20] border border-[#3c4043] rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-300">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-blue-500/30 mb-6">
          <Sparkles className="w-7 h-7 text-white" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Build Studio</h1>
        <p className="text-xs text-[#9aa0a6] mb-6 leading-relaxed">
          Sign in with your personal Google account to build, preview, edit, and export multi-file web projects in your own cloud workspace.
        </p>

        {/* Key Platform Highlights */}
        <div className="w-full grid grid-cols-3 gap-2 mb-6 text-left">
          <div className="bg-[#131314] border border-[#2d2d30] rounded-xl p-2.5">
            <Code2 className="w-4 h-4 text-blue-400 mb-1" />
            <div className="text-[11px] font-semibold text-white">Multi-File</div>
            <div className="text-[10px] text-[#9aa0a6]">HTML/CSS/JS</div>
          </div>
          <div className="bg-[#131314] border border-[#2d2d30] rounded-xl p-2.5">
            <Layers className="w-4 h-4 text-purple-400 mb-1" />
            <div className="text-[11px] font-semibold text-white">Live Edit</div>
            <div className="text-[10px] text-[#9aa0a6]">Real-time AI</div>
          </div>
          <div className="bg-[#131314] border border-[#2d2d30] rounded-xl p-2.5">
            <Download className="w-4 h-4 text-emerald-400 mb-1" />
            <div className="text-[11px] font-semibold text-white">ZIP Export</div>
            <div className="text-[10px] text-[#9aa0a6]">One-click</div>
          </div>
        </div>

        {displayError && (
          <div className="w-full mb-4 px-4 py-2.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-xs text-rose-300 text-left">
            {displayError}
          </div>
        )}

        {/* Real Firebase Google OAuth Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-3.5 px-6 rounded-xl transition shadow-lg flex items-center justify-center gap-3 text-sm disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-700 border-t-transparent rounded-full animate-spin" />
              <span>Signing in with Google...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Sign in with Google</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-2 mt-6 text-[11px] text-[#9aa0a6]">
          <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Verified Google OAuth • Each user chooses their own Gmail account</span>
        </div>
      </div>
    </div>
  );
};
