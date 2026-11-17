import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, Users, FolderGit2, Activity, Mail, Clock, Home, LogOut,
  Calendar, Globe, Eye, EyeOff, Copy, Check, ExternalLink, TrendingUp, Lock
} from 'lucide-react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../firebase';
import { PublishedSite } from '../types';

interface AdminUserRecord {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  appsCount: number;
  loginCount?: number;
  lastVisitDate?: string;
  createdAt?: any;
  lastLoginAt?: any;
}

interface DailyStatRecord {
  date: string;
  visitsCount: number;
  uniqueUsersCount: number;
  updatedAt?: any;
}

const ADMIN_UNLOCK_KEY = 'buildstudio_admin_unlocked';

interface AdminDashboardProps {
  onOpenLiveSite?: (slug: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onOpenLiveSite }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStatRecord[]>([]);
  const [publishedSites, setPublishedSites] = useState<PublishedSite[]>([]);
  const [authError, setAuthError] = useState<string | null>(null);
  const [copiedAdminUrl, setCopiedAdminUrl] = useState(false);

  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isPasscodeVerified, setIsPasscodeVerified] = useState<boolean>(() => {
    try {
      return typeof window !== 'undefined' && sessionStorage.getItem(ADMIN_UNLOCK_KEY) === '1';
    } catch {
      return false;
    }
  });

  const todayDateKey = new Date().toISOString().slice(0, 10);
  const adminUrl = typeof window !== 'undefined' ? `${window.location.origin}/admin` : '/admin';

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  const isVerifiedAdmin = Boolean(
    user && user.email === 'amalj7767@gmail.com' && user.emailVerified
  );

  useEffect(() => {
    if (!authReady || !isVerifiedAdmin || !isPasscodeVerified) return;

    const usersPath = 'users';
    const qUsers = query(collection(db, usersPath), orderBy('lastLoginAt', 'desc'), limit(100));
    const unsubUsers = onSnapshot(
      qUsers,
      (snapshot) => {
        const list: AdminUserRecord[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as AdminUserRecord);
        });
        setUsers(list);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, usersPath);
      }
    );

    const statsPath = 'daily_stats';
    const qStats = query(collection(db, statsPath), orderBy('date', 'desc'), limit(14));
    const unsubStats = onSnapshot(
      qStats,
      (snapshot) => {
        const list: DailyStatRecord[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as DailyStatRecord);
        });
        setDailyStats(list);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, statsPath);
      }
    );

    const sitesPath = 'published_sites';
    const qSites = query(collection(db, sitesPath), orderBy('updatedAt', 'desc'), limit(50));
    const unsubSites = onSnapshot(
      qSites,
      (snapshot) => {
        const list: PublishedSite[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as PublishedSite);
        });
        setPublishedSites(list);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, sitesPath);
      }
    );

    return () => {
      unsubUsers();
      unsubStats();
      unsubSites();
    };
  }, [authReady, isVerifiedAdmin, isPasscodeVerified]);

  const handleAdminSignIn = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      setAuthError(err?.message || 'Failed to sign in with Google.');
    }
  };

  const handleVerifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim() || isVerifyingPassword) return;
    setIsVerifyingPassword(true);
    setPasswordError(null);
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setPasswordError(data.error || 'Incorrect admin password. Please try again.');
        return;
      }
      sessionStorage.setItem(ADMIN_UNLOCK_KEY, '1');
      setIsPasscodeVerified(true);
      setPasswordInput('');
    } catch {
      setPasswordError('Could not verify password. Please try again.');
    } finally {
      setIsVerifyingPassword(false);
    }
  };

  const handleLockAdmin = () => {
    sessionStorage.removeItem(ADMIN_UNLOCK_KEY);
    setIsPasscodeVerified(false);
  };

  const handleCopyAdminUrl = () => {
    navigator.clipboard.writeText(adminUrl);
    setCopiedAdminUrl(true);
    setTimeout(() => setCopiedAdminUrl(false), 2000);
  };

  if (!authReady) {
    return (
      <div className="min-h-[100dvh] bg-[#131314] text-[#e3e3e3] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isPasscodeVerified || !user || !isVerifiedAdmin) {
    return (
      <div className="min-h-[100dvh] bg-[#131314] text-[#e3e3e3] flex items-center justify-center p-4 select-none">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="relative w-full max-w-md bg-[#1e1e20] border border-[#3c4043] rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6 shadow-lg shadow-amber-500/10">
            {isPasscodeVerified ? <ShieldAlert className="w-7 h-7" /> : <Lock className="w-7 h-7" />}
          </div>

          <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Build Studio Admin</h1>
          <p className="text-xs text-[#9aa0a6] mb-6 leading-relaxed">
            {!isPasscodeVerified
              ? 'Enter the Admin Panel password to unlock platform analytics and user stats.'
              : user && !isVerifiedAdmin
              ? `Signed in as ${user.email}, which does not have administrator access.`
              : 'Sign in with your verified administrator Google account to view live analytics.'}
          </p>

          {!isPasscodeVerified ? (
            <form onSubmit={handleVerifyPassword} className="w-full space-y-4">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter admin password"
                  autoFocus
                  className="w-full bg-[#131314] border border-[#3c4043] focus:border-amber-500 rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-[#9aa0a6] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9aa0a6] hover:text-white cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {passwordError && (
                <div className="w-full p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-xs text-rose-300 text-left">
                  {passwordError}
                </div>
              )}

              <button
                type="submit"
                disabled={isVerifyingPassword || !passwordInput.trim()}
                className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold py-3.5 px-6 rounded-xl transition shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>{isVerifyingPassword ? 'Verifying...' : 'Unlock Admin Panel'}</span>
              </button>
            </form>
          ) : (
            <>
              {authError && (
                <div className="w-full mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-xs text-rose-300 text-left">
                  {authError}
                </div>
              )}

              <button
                onClick={handleAdminSignIn}
                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3.5 px-6 rounded-xl transition shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <span>{user ? 'Switch Google Account' : 'Sign in with Google'}</span>
              </button>

              {user && (
                <button
                  onClick={() => signOut(auth)}
                  className="mt-3 text-xs text-rose-400 hover:underline cursor-pointer"
                >
                  Sign out
                </button>
              )}
            </>
          )}

          <div className="mt-6">
            <a href="/" className="text-xs text-blue-400 hover:underline flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5" />
              <span>Return to Build Studio</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  const totalAppsCount = users.reduce((sum, u) => sum + (u.appsCount || 0), 0);
  const totalUserLogins = users.reduce((sum, u) => sum + (u.loginCount || 1), 0);
  const todayStat = dailyStats.find((d) => d.date === todayDateKey);
  const todayUniqueVisitors = todayStat?.uniqueUsersCount || users.filter((u) => u.lastVisitDate === todayDateKey).length;
  const todayTotalVisits = todayStat?.visitsCount || todayUniqueVisitors;
  const totalRecordedVisits = Math.max(
    dailyStats.reduce((sum, d) => sum + (d.visitsCount || 0), 0),
    totalUserLogins
  );
  const maxDailyVisits = Math.max(1, ...dailyStats.map((d) => d.visitsCount || 0));

  return (
    <div className="min-h-[100dvh] bg-[#131314] text-[#e3e3e3] flex flex-col font-sans select-none">
      {/* Top Admin Navbar */}
      <header className="h-16 border-b border-[#2d2d30] bg-[#1e1e20] px-4 sm:px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-base text-white">Build Studio Admin</h1>
            <p className="text-xs text-[#9aa0a6]">Users, Apps, Daily Visitors & Live Sites</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleLockAdmin}
            className="px-3 py-2 rounded-xl bg-[#2d2d30] hover:bg-amber-500/20 text-amber-300 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
            title="Lock Admin Panel"
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lock</span>
          </button>
          <a
            href="/"
            className="px-4 py-2 rounded-xl bg-[#2d2d30] hover:bg-[#3c4043] text-white text-xs font-semibold transition"
          >
            Exit to App
          </a>
          <button
            onClick={() => {
              handleLockAdmin();
              signOut(auth);
            }}
            className="p-2 rounded-xl bg-[#2d2d30] hover:bg-rose-500/20 text-[#9aa0a6] hover:text-rose-400 transition cursor-pointer"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6 overflow-y-auto">
        {/* Admin Panel Direct Link Banner */}
        <div className="bg-[#1e1e20] border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Activity className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white">Admin Panel Direct URL</div>
              <div className="text-xs font-mono text-amber-300 truncate">{adminUrl}</div>
            </div>
          </div>
          <button
            onClick={handleCopyAdminUrl}
            className="px-3.5 py-2 rounded-xl bg-[#2d2d30] hover:bg-[#3c4043] text-white text-xs font-semibold flex items-center gap-1.5 transition shrink-0 cursor-pointer self-start sm:self-auto"
          >
            {copiedAdminUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedAdminUrl ? 'Copied Link!' : 'Copy Admin Link'}</span>
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-[#1e1e20] border border-[#2d2d30] rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] text-[#9aa0a6] uppercase font-bold tracking-wider">Registered Users</p>
              <div className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5">{users.length}</div>
              <p className="text-[11px] text-blue-300 mt-0.5">Google accounts</p>
            </div>
          </div>

          <div className="bg-[#1e1e20] border border-[#2d2d30] rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] text-[#9aa0a6] uppercase font-bold tracking-wider">Today&apos;s Visitors</p>
              <div className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5">{todayUniqueVisitors}</div>
              <p className="text-[11px] text-emerald-300 mt-0.5">{todayTotalVisits} visits today</p>
            </div>
          </div>

          <div className="bg-[#1e1e20] border border-[#2d2d30] rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] text-[#9aa0a6] uppercase font-bold tracking-wider">Total Visits</p>
              <div className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5">{totalRecordedVisits}</div>
              <p className="text-[11px] text-amber-300 mt-0.5">All-time sessions</p>
            </div>
          </div>

          <div className="bg-[#1e1e20] border border-[#2d2d30] rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0">
              <FolderGit2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] text-[#9aa0a6] uppercase font-bold tracking-wider">Apps Built</p>
              <div className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5">{totalAppsCount}</div>
              <p className="text-[11px] text-purple-300 mt-0.5">{publishedSites.length} live sites</p>
            </div>
          </div>
        </div>

        {/* Daily Visitors Breakdown */}
        <div className="bg-[#1e1e20] border border-[#2d2d30] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#2d2d30] flex items-center justify-between">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <span>Daily Visitors Breakdown</span>
            </h3>
            <span className="text-xs text-[#9aa0a6]">Last {dailyStats.length} active days</span>
          </div>
          <div className="p-4 sm:p-6 space-y-3">
            {dailyStats.length === 0 ? (
              <div className="text-center text-xs text-[#9aa0a6] py-4">
                Daily visitor logs will appear here as users enter the app.
              </div>
            ) : (
              dailyStats.map((stat) => {
                const widthPct = Math.max(8, Math.round((stat.visitsCount / maxDailyVisits) * 100));
                const isToday = stat.date === todayDateKey;
                return (
                  <div key={stat.date} className="flex items-center gap-4 text-xs">
                    <div className="w-28 shrink-0 font-mono text-[#e3e3e3] flex items-center gap-1.5">
                      <span>{stat.date}</span>
                      {isToday && (
                        <span className="text-[9px] font-sans font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Today
                        </span>
                      )}
                    </div>
                    <div className="flex-1 bg-[#131314] rounded-full h-3 overflow-hidden border border-[#2d2d30]">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full transition-all"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                    <div className="w-40 shrink-0 text-right font-semibold">
                      <span className="text-emerald-400">{stat.uniqueUsersCount} users</span>
                      <span className="text-[#9aa0a6]"> • {stat.visitsCount} visits</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-[#1e1e20] border border-[#2d2d30] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#2d2d30] flex items-center justify-between">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              <span>Logged-In User Details & App Counts</span>
            </h3>
            <span className="text-xs text-[#9aa0a6]">{users.length} accounts</span>
          </div>
          <div className="divide-y divide-[#2d2d30]">
            {users.length === 0 ? (
              <div className="px-6 py-8 text-center text-xs text-[#9aa0a6]">
                No authenticated user profiles recorded yet.
              </div>
            ) : (
              users.map((u) => {
                const loginDate = u.lastLoginAt?.toDate ? u.lastLoginAt.toDate() : null;
                return (
                  <div key={u.uid} className="px-6 py-4 flex items-center justify-between hover:bg-[#252528] transition gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      {u.photoURL ? (
                        <img
                          src={u.photoURL}
                          alt={u.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-full object-cover border border-[#3c4043] shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center font-bold text-sm text-white shrink-0">
                          {u.name ? u.name[0].toUpperCase() : 'U'}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-white truncate">{u.name}</h4>
                        <p className="text-xs text-[#9aa0a6] flex items-center gap-1.5 mt-0.5 truncate">
                          <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span className="truncate">{u.email}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-xs shrink-0 space-y-0.5">
                      <div className="flex items-center justify-end gap-2">
                        <span className="px-2 py-0.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                          {u.appsCount || 0} Apps
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                          {u.loginCount || 1} Visits
                        </span>
                      </div>
                      <span className="text-[10px] text-[#9aa0a6] flex items-center gap-1 justify-end">
                        <Clock className="w-3 h-3" />
                        <span>
                          {loginDate ? `${loginDate.toLocaleDateString()} ${loginDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Recently'}
                        </span>
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Published Permanent Live Sites */}
        <div className="bg-[#1e1e20] border border-[#2d2d30] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#2d2d30] flex items-center justify-between">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-400" />
              <span>Published Permanent Live Sites</span>
            </h3>
            <span className="text-xs text-[#9aa0a6]">{publishedSites.length} live URLs</span>
          </div>
          <div className="divide-y divide-[#2d2d30]">
            {publishedSites.length === 0 ? (
              <div className="px-6 py-8 text-center text-xs text-[#9aa0a6]">
                No live websites published yet.
              </div>
            ) : (
              publishedSites.map((site) => (
                <div key={site.siteId} className="px-6 py-3.5 flex items-center justify-between gap-4 hover:bg-[#252528] transition">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white truncate">{site.title}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        v{site.version}
                      </span>
                    </div>
                    <div className="text-xs font-mono text-[#9aa0a6] truncate">/p/{site.siteId}</div>
                  </div>
                  {onOpenLiveSite ? (
                    <button
                      type="button"
                      onClick={() => onOpenLiveSite(site.siteId)}
                      className="px-3 py-1.5 rounded-xl bg-[#2d2d30] hover:bg-[#3c4043] text-xs font-semibold text-blue-300 flex items-center gap-1.5 shrink-0 transition cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Visit</span>
                    </button>
                  ) : (
                    <a
                      href={`/p/${site.siteId}`}
                      className="px-3 py-1.5 rounded-xl bg-[#2d2d30] hover:bg-[#3c4043] text-xs font-semibold text-blue-300 flex items-center gap-1.5 shrink-0 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Visit</span>
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
