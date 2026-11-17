import React, { useState } from 'react';
import { Sparkles, ArrowRight, Shield, Lock, Mail } from 'lucide-react';
import { GoogleOAuthModal } from './GoogleOAuthModal';

interface LoginScreenProps {
  onLogin: (email: string, name: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const extractedName = email.split('@')[0];
      const formattedName = extractedName.charAt(0).toUpperCase() + extractedName.slice(1);
      onLogin(email, formattedName);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#131314] text-[#e3e3e3] flex items-center justify-center p-4 select-none">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px]"></div>
      
      <div className="relative w-full max-w-md bg-[#1e1e20] border border-[#3c4043] rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-300">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-blue-500/30 mb-6">
          <Sparkles className="w-7 h-7 text-white" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Welcome Back</h1>
        <p className="text-xs text-[#9aa0a6] mb-8">Sign in with Google or your email & password to access your workspace</p>

        {/* Direct Google Login Button */}
        <button
          onClick={() => setIsGoogleModalOpen(true)}
          disabled={isLoading}
          className="w-full mb-6 bg-[#131314] hover:bg-[#2d2d30] border border-[#3c4043] text-white font-semibold py-3.5 px-6 rounded-xl transition shadow-md flex items-center justify-center gap-3 text-sm disabled:opacity-50 cursor-pointer"
        >
          <svg className="w-5 h-5 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Sign in with Google</span>
        </button>

        <div className="flex items-center w-full my-2">
          <div className="flex-1 border-t border-[#3c4043]"></div>
          <span className="px-3 text-xs text-[#9aa0a6] uppercase font-bold tracking-wider">or</span>
          <div className="flex-1 border-t border-[#3c4043]"></div>
        </div>

        <form onSubmit={handleEmailLogin} className="w-full space-y-4 text-left mt-4">
          <div>
            <label className="block text-xs font-semibold text-[#c4c7c5] mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-400" />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#131314] border border-[#3c4043] rounded-xl px-4 py-3 text-sm text-white placeholder-[#9aa0a6] focus:outline-none focus:border-blue-500 transition"
              placeholder="name@gmail.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#c4c7c5] mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-purple-400" />
              <span>Password</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[#131314] border border-[#3c4043] rounded-xl px-4 py-3 text-sm text-white placeholder-[#9aa0a6] focus:outline-none focus:border-blue-500 transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3.5 px-6 rounded-xl transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In with Email</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </form>

        <div className="flex items-center gap-2 mt-6 text-[11px] text-[#9aa0a6]">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Secure Authentication</span>
        </div>
      </div>

      <GoogleOAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSuccess={(em, nm) => {
          setIsGoogleModalOpen(false);
          onLogin(em, nm);
        }}
      />
    </div>
  );
};
