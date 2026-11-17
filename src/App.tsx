import React, { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, getRedirectResult, signInWithPopup, signOut, GoogleAuthProvider, User } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  increment,
  writeBatch,
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from './firebase';
import { Project, ProjectFile, Template, RefineResult, ConnectedAccount, GeminiModelOption } from './types';
import { TEMPLATES } from './data/templates';
import { LoginScreen } from './components/LoginScreen';
import { Sidebar } from './components/Sidebar';
import { HomeView } from './components/HomeView';
import { Workspace } from './components/Workspace';
import { TemplatesModal } from './components/TemplatesModal';
import { ProjectManagerModal } from './components/ProjectManagerModal';
import { ExportModal } from './components/ExportModal';
import { AdminDashboard } from './components/AdminDashboard';
import { LiveSiteViewer } from './components/LiveSiteViewer';
import { createCleanSlug } from './utils/slugHelper';

function sanitizeId(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 128) || 'proj_' + Date.now();
}

function sanitizeFiles(rawFiles: ProjectFile[]): ProjectFile[] {
  const list = (rawFiles || []).slice(0, 15).map((f) => ({
    path: String(f.path || 'index.html').slice(0, 120) || 'index.html',
    content: String(f.content || '').slice(0, 150000),
  }));
  if (list.length === 0) {
    return [{ path: 'index.html', content: '<!doctype html><html><body></body></html>' }];
  }
  return list;
}

export default function App() {
  const [isAdminRoute, setIsAdminRoute] = useState(false);
  const [liveSiteSlug, setLiveSiteSlug] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const syncRouteFromLocation = useCallback(() => {
    const pathname = window.location.pathname;
    if (pathname === '/admin') {
      setIsAdminRoute(true);
      setLiveSiteSlug(null);
    } else if (pathname.startsWith('/p/')) {
      const slug = pathname.replace(/^\/p\//, '').split('/')[0];
      setIsAdminRoute(false);
      setLiveSiteSlug(slug || null);
    } else if (pathname.startsWith('/site/')) {
      const slug = pathname.replace(/^\/site\//, '').split('/')[0];
      setIsAdminRoute(false);
      setLiveSiteSlug(slug || null);
    } else {
      setIsAdminRoute(false);
      setLiveSiteSlug(null);
    }
  }, []);

  useEffect(() => {
    syncRouteFromLocation();
    window.addEventListener('popstate', syncRouteFromLocation);
    return () => window.removeEventListener('popstate', syncRouteFromLocation);
  }, [syncRouteFromLocation]);

  const handleOpenLiveSite = useCallback((slug: string) => {
    const clean = slug.trim();
    window.history.pushState({ liveSiteSlug: clean }, '', `/p/${clean}`);
    setIsExportOpen(false);
    setIsAdminRoute(false);
    setLiveSiteSlug(clean);
  }, []);

  const handleBackFromLiveSite = useCallback(() => {
    window.history.pushState({}, '', '/');
    setLiveSiteSlug(null);
    setIsAdminRoute(false);
    document.title = 'Build Studio - AI Website & App Builder';
  }, []);

  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string>('');
  const [activeView, setActiveView] = useState<'home' | 'workspace'>('home');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedVersion, setPublishedVersion] = useState<number>(1);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  const [selectedModel, setSelectedModel] = useState<GeminiModelOption>('auto');
  const [isSwitchingAccount, setIsSwitchingAccount] = useState(false);
  const [lastFallbackNotice, setLastFallbackNotice] = useState<string | null>(null);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>(() => {
    try {
      const saved = localStorage.getItem('buildstudio_gmail_accounts');
      return saved ? (JSON.parse(saved) as ConnectedAccount[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('buildstudio_gmail_accounts', JSON.stringify(connectedAccounts.slice(0, 6)));
    } catch {
      // Ignore storage quota errors
    }
  }, [connectedAccounts]);

  // Modals
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const showError = useCallback((msg: string) => {
    setErrorToast(msg);
    setTimeout(() => setErrorToast(null), 5000);
  }, []);

  // Sync Firebase Auth state & upsert user profile in Firestore
  useEffect(() => {
    getRedirectResult(auth).catch((err) => {
      console.error('Redirect auth error:', err);
      setAuthError(err?.message || 'Google sign-in redirect failed.');
    });

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (!user.emailVerified) {
          setAuthError('Please use a verified Google account.');
          setFirebaseUser(null);
          setAuthReady(true);
          return;
        }
        setAuthError(null);
        setFirebaseUser(user);
        setAuthReady(true);

        setConnectedAccounts((prev) => {
          const entry: ConnectedAccount = {
            uid: user.uid,
            email: user.email || 'user@gmail.com',
            displayName: user.displayName || user.email?.split('@')[0] || 'User',
            photoURL: user.photoURL || undefined,
          };
          const filtered = prev.filter((a) => a.uid !== user.uid && a.email !== entry.email);
          return [entry, ...filtered].slice(0, 6);
        });

        const dateKey = new Date().toISOString().slice(0, 10);
        const sessionKey = `buildstudio_visit_${user.uid}_${dateKey}`;
        const shouldRecordVisit = !sessionStorage.getItem(sessionKey);

        const userDocPath = `users/${user.uid}`;
        try {
          const userRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userRef);
          const displayName = (user.displayName || user.email?.split('@')[0] || 'User').slice(0, 120);
          const userEmail = (user.email || 'user@gmail.com').slice(0, 254);
          const photo = (user.photoURL || '').slice(0, 500);

          if (!snap.exists()) {
            await setDoc(userRef, {
              uid: user.uid,
              name: displayName,
              email: userEmail,
              ...(photo ? { photoURL: photo } : {}),
              appsCount: 0,
              loginCount: 1,
              lastVisitDate: dateKey,
              createdAt: serverTimestamp(),
              lastLoginAt: serverTimestamp(),
            });
          } else {
            await updateDoc(userRef, {
              name: displayName,
              ...(photo ? { photoURL: photo } : {}),
              ...(shouldRecordVisit ? { loginCount: increment(1), lastVisitDate: dateKey } : {}),
              lastLoginAt: serverTimestamp(),
            });
          }

          if (shouldRecordVisit) {
            const dailyStatRef = doc(db, 'daily_stats', dateKey);
            const visitorRef = doc(db, 'daily_stats', dateKey, 'visitors', user.uid);
            const [dailyStatSnap, visitorSnap] = await Promise.all([
              getDoc(dailyStatRef),
              getDoc(visitorRef),
            ]);

            const batch = writeBatch(db);
            if (!dailyStatSnap.exists()) {
              batch.set(dailyStatRef, {
                date: dateKey,
                visitsCount: 1,
                uniqueUsersCount: 1,
                updatedAt: serverTimestamp(),
              });
              batch.set(visitorRef, {
                uid: user.uid,
                date: dateKey,
                visitCount: 1,
                visitedAt: serverTimestamp(),
              });
            } else if (!visitorSnap.exists()) {
              batch.update(dailyStatRef, {
                visitsCount: increment(1),
                uniqueUsersCount: increment(1),
                updatedAt: serverTimestamp(),
              });
              batch.set(visitorRef, {
                uid: user.uid,
                date: dateKey,
                visitCount: 1,
                visitedAt: serverTimestamp(),
              });
            } else {
              batch.update(dailyStatRef, {
                visitsCount: increment(1),
                updatedAt: serverTimestamp(),
              });
              batch.update(visitorRef, {
                visitCount: increment(1),
                visitedAt: serverTimestamp(),
              });
            }
            await batch.commit();
            sessionStorage.setItem(sessionKey, '1');
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, userDocPath);
        }
      } else {
        setFirebaseUser(null);
        setProjects([]);
        setCurrentProjectId('');
        setActiveView('home');
        setAuthReady(true);
      }
    });

    return () => unsub();
  }, []);

  // Subscribe to the authenticated user's projects collection in Firestore
  useEffect(() => {
    if (!authReady || !firebaseUser) return;

    const uid = firebaseUser.uid;
    const projectsPath = `users/${uid}/projects`;
    const q = query(collection(db, projectsPath), where('ownerId', '==', uid));

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const loaded: Project[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const updatedMillis = data.updatedAt?.toMillis ? data.updatedAt.toMillis() : Date.now();
          const publishedMillis = data.publishedAt?.toMillis ? data.publishedAt.toMillis() : undefined;
          loaded.push({
            id: data.id || docSnap.id,
            title: data.title || 'Untitled Project',
            description: data.description || '',
            prompt: data.prompt || '',
            files: Array.isArray(data.files) ? data.files : [],
            fullCode: data.fullCode || '',
            updatedAt: updatedMillis,
            starred: Boolean(data.starred),
            publishedSlug: data.publishedSlug || undefined,
            publishedAt: publishedMillis,
          });
        });

        loaded.sort((a, b) => b.updatedAt - a.updatedAt);

        if (loaded.length > 0) {
          setProjects(loaded);
          setCurrentProjectId((prev) =>
            prev && loaded.some((p) => p.id === prev) ? prev : loaded[0].id
          );
        } else {
          // Provide starter template in memory until the user creates/saves a project
          const defaultTmpl = TEMPLATES[0];
          const starter: Project = {
            id: 'starter-1',
            title: defaultTmpl.title,
            description: defaultTmpl.description,
            prompt: defaultTmpl.prompt,
            files: defaultTmpl.files,
            fullCode: defaultTmpl.fullCode,
            updatedAt: Date.now(),
            starred: true,
          };
          setProjects([starter]);
          setCurrentProjectId(starter.id);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, projectsPath);
      }
    );

    return () => unsub();
  }, [authReady, firebaseUser]);

  const currentProject = projects.find((p) => p.id === currentProjectId) || projects[0];

  // Subscribe to published site version for the currently selected project
  useEffect(() => {
    const slug = currentProject?.publishedSlug;
    if (!slug || !firebaseUser) {
      setPublishedVersion(1);
      return;
    }
    const sitePath = `published_sites/${slug}`;
    const unsub = onSnapshot(
      doc(db, 'published_sites', slug),
      (snap) => {
        if (snap.exists()) {
          setPublishedVersion(Number(snap.data()?.version || 1));
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, sitePath);
      }
    );
    return () => unsub();
  }, [currentProject?.publishedSlug, firebaseUser]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err: any) {
      showError(err?.message || 'Sign out failed.');
    }
  };

  const persistNewProjectToFirestore = async (proj: Project) => {
    if (!firebaseUser) return;
    const uid = firebaseUser.uid;
    const cleanId = sanitizeId(proj.id);
    const path = `users/${uid}/projects/${cleanId}`;
    try {
      await setDoc(doc(db, 'users', uid, 'projects', cleanId), {
        id: cleanId,
        ownerId: uid,
        title: (proj.title || 'AI Project').slice(0, 150),
        description: (proj.description || '').slice(0, 2000),
        prompt: (proj.prompt || '').slice(0, 5000),
        files: sanitizeFiles(proj.files),
        fullCode: (proj.fullCode || '').slice(0, 350000),
        starred: Boolean(proj.starred),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'users', uid), {
        appsCount: increment(1),
        lastLoginAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const handleAddGmailAccount = async () => {
    if (isSwitchingAccount) return;
    setIsSwitchingAccount(true);
    try {
      await signInWithPopup(auth, googleProvider);
      setLastFallbackNotice('Added & switched to new Gmail account.');
      setTimeout(() => setLastFallbackNotice(null), 4000);
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        showError(err?.message || 'Could not add Gmail account.');
      }
    } finally {
      setIsSwitchingAccount(false);
    }
  };

  const handleSwitchGmailAccount = async (account: ConnectedAccount) => {
    if (isSwitchingAccount) return;
    setIsSwitchingAccount(true);
    try {
      const hintProvider = new GoogleAuthProvider();
      hintProvider.setCustomParameters({
        prompt: 'select_account',
        login_hint: account.email,
      });
      await signInWithPopup(auth, hintProvider);
      setLastFallbackNotice(`Switched active account to ${account.email}`);
      setTimeout(() => setLastFallbackNotice(null), 4000);
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        showError(err?.message || 'Failed to switch Gmail account.');
      }
    } finally {
      setIsSwitchingAccount(false);
    }
  };

  const handleRemoveGmailAccount = (uidToRemove: string) => {
    setConnectedAccounts((prev) => prev.filter((a) => a.uid !== uidToRemove));
  };

  const markCurrentAccountCooldown = () => {
    if (!firebaseUser) return;
    setConnectedAccounts((prev) =>
      prev.map((a) => (a.uid === firebaseUser.uid ? { ...a, cooldownUntil: Date.now() + 120_000 } : a))
    );
  };

  const handleGenerate = async (promptText: string, attachment?: string, projectName?: string) => {
    if (!firebaseUser) return;
    setIsGenerating(true);
    try {
      const idToken = await firebaseUser.getIdToken();
      const attemptRequest = async (modelOverride?: GeminiModelOption) => {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            prompt: promptText,
            attachment,
            projectName,
            preferredModel: modelOverride || selectedModel,
          }),
        });
        const payload = await res.json();
        return { res, payload };
      };

      let { res, payload: data } = await attemptRequest();
      if (!res.ok && (res.status === 429 || res.status === 503 || data?.code === 'RATE_LIMITED')) {
        // Automatic client fallback retry with Lite model
        const fallbackRes = await attemptRequest('gemini-3.1-flash-lite');
        res = fallbackRes.res;
        data = fallbackRes.payload;
        if (res.ok) {
          setLastFallbackNotice(`Auto-switched to ${data.usedModel || 'gemini-3.1-flash-lite'} on rate limit.`);
        }
      }

      if (!res.ok) {
        if (res.status === 429 || res.status === 503 || data?.code === 'RATE_LIMITED') {
          markCurrentAccountCooldown();
        }
        throw new Error(data.error || 'Failed to generate project');
      }

      if (data.fallbackUsed && data.usedModel) {
        setLastFallbackNotice(`Auto-fallback succeeded using ${data.usedModel}.`);
      }

      const assignedTitle = (projectName?.trim() || data.title || 'AI Project').slice(0, 150);
      const newId = sanitizeId('proj_' + Date.now());
      const newProj: Project = {
        id: newId,
        title: assignedTitle,
        description: (data.description || promptText).slice(0, 2000),
        prompt: promptText.slice(0, 5000),
        files: sanitizeFiles(data.files || [{ path: 'index.html', content: data.fullCode }]),
        fullCode: (data.fullCode || '').slice(0, 350000),
        updatedAt: Date.now(),
        starred: false,
      };

      await persistNewProjectToFirestore(newProj);
      setCurrentProjectId(newProj.id);
      setActiveView('workspace');
    } catch (err: any) {
      console.error(err);
      showError(err.message || 'Failed to generate project.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefine = async (promptText: string, attachment?: string): Promise<RefineResult> => {
    if (!firebaseUser || !currentProject) {
      return { success: false, error: 'No active project or session.' };
    }
    setIsRefining(true);
    try {
      const idToken = await firebaseUser.getIdToken();
      const attemptRefine = async (modelOverride?: GeminiModelOption) => {
        const res = await fetch('/api/refine', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            prompt: promptText,
            attachment,
            projectTitle: currentProject.title,
            currentFiles: currentProject.files,
            preferredModel: modelOverride || selectedModel,
          }),
        });
        const payload = await res.json();
        return { res, payload };
      };

      let { res, payload: data } = await attemptRefine();
      if (!res.ok && (res.status === 429 || res.status === 503 || data?.code === 'RATE_LIMITED')) {
        const fallbackRes = await attemptRefine('gemini-3.1-flash-lite');
        res = fallbackRes.res;
        data = fallbackRes.payload;
        if (res.ok) {
          setLastFallbackNotice(`Auto-switched to ${data.usedModel || 'gemini-3.1-flash-lite'} on rate limit.`);
        }
      }

      if (!res.ok) {
        if (res.status === 429 || res.status === 503 || data?.code === 'RATE_LIMITED') {
          markCurrentAccountCooldown();
        }
        throw new Error(data.error || 'Failed to refine project');
      }

      if (data.fallbackUsed && data.usedModel) {
        setLastFallbackNotice(`Auto-fallback succeeded using ${data.usedModel}.`);
      }

      const updatedFields = {
        title: (data.title || currentProject.title).slice(0, 150),
        description: (data.description || currentProject.description).slice(0, 2000),
        files: sanitizeFiles(data.files || currentProject.files),
        fullCode: (data.fullCode || currentProject.fullCode).slice(0, 350000),
      };

      if (currentProject.id === 'starter-1') {
        const persisted: Project = {
          ...currentProject,
          ...updatedFields,
          id: sanitizeId('proj_' + Date.now()),
          updatedAt: Date.now(),
        };
        await persistNewProjectToFirestore(persisted);
        setCurrentProjectId(persisted.id);
      } else {
        const path = `users/${firebaseUser.uid}/projects/${currentProject.id}`;
        try {
          await updateDoc(doc(db, 'users', firebaseUser.uid, 'projects', currentProject.id), {
            ...updatedFields,
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, path);
        }
      }

      return {
        success: true,
        explanation: data.explanation || 'Updated project with requested changes.',
        modifiedFiles: data.modifiedFiles || ['index.html', 'style.css'],
        usedModel: data.usedModel,
        fallbackUsed: Boolean(data.fallbackUsed),
      };
    } catch (err: any) {
      console.error(err);
      showError(err.message || 'Failed to refine project.');
      return {
        success: false,
        error: err.message || 'Failed to refine project.',
      };
    } finally {
      setIsRefining(false);
    }
  };

  const handleSelectTemplate = async (tmpl: Template) => {
    const newProj: Project = {
      id: sanitizeId('tmpl_' + Date.now()),
      title: tmpl.title,
      description: tmpl.description,
      prompt: tmpl.prompt,
      files: sanitizeFiles(tmpl.files),
      fullCode: tmpl.fullCode,
      updatedAt: Date.now(),
      starred: true,
    };
    await persistNewProjectToFirestore(newProj);
    setCurrentProjectId(newProj.id);
    setActiveView('workspace');
  };

  const handleUpdateProject = async (updatedFields: Partial<Project>) => {
    if (!firebaseUser || !currentProject) return;

    const payload: Record<string, any> = { updatedAt: serverTimestamp() };
    if (updatedFields.title !== undefined) payload.title = updatedFields.title.slice(0, 150);
    if (updatedFields.description !== undefined) payload.description = updatedFields.description.slice(0, 2000);
    if (updatedFields.prompt !== undefined) payload.prompt = updatedFields.prompt.slice(0, 5000);
    if (updatedFields.files !== undefined) payload.files = sanitizeFiles(updatedFields.files);
    if (updatedFields.fullCode !== undefined) payload.fullCode = updatedFields.fullCode.slice(0, 350000);
    if (updatedFields.starred !== undefined) payload.starred = Boolean(updatedFields.starred);

    if (currentProject.id === 'starter-1') {
      const persisted: Project = {
        ...currentProject,
        ...updatedFields,
        id: sanitizeId('proj_' + Date.now()),
        updatedAt: Date.now(),
      };
      await persistNewProjectToFirestore(persisted);
      setCurrentProjectId(persisted.id);
      return;
    }

    const path = `users/${firebaseUser.uid}/projects/${currentProject.id}`;
    try {
      await updateDoc(doc(db, 'users', firebaseUser.uid, 'projects', currentProject.id), payload);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!firebaseUser) return;
    if (id === 'starter-1') {
      showError('Starter preview cannot be deleted.');
      return;
    }
    const path = `users/${firebaseUser.uid}/projects/${id}`;
    try {
      await deleteDoc(doc(db, 'users', firebaseUser.uid, 'projects', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const handleToggleStar = async (id: string) => {
    if (!firebaseUser) return;
    const target = projects.find((p) => p.id === id);
    if (!target) return;
    if (id === 'starter-1') return;

    const path = `users/${firebaseUser.uid}/projects/${id}`;
    try {
      await updateDoc(doc(db, 'users', firebaseUser.uid, 'projects', id), {
        starred: !target.starred,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const handlePublishSite = async (
    proj: Project,
    requestedSlug?: string
  ): Promise<{ slug: string; version: number; url: string } | null> => {
    if (!firebaseUser) return null;
    setIsPublishing(true);
    try {
      const uid = firebaseUser.uid;
      let targetProject = proj;

      if (targetProject.id === 'starter-1') {
        const persisted: Project = {
          ...targetProject,
          id: sanitizeId('proj_' + Date.now()),
          updatedAt: Date.now(),
        };
        await persistNewProjectToFirestore(persisted);
        setCurrentProjectId(persisted.id);
        targetProject = persisted;
      }

      let slug = targetProject.publishedSlug;
      let isExistingOwnDoc = false;
      let prevVersion = 1;

      if (!slug) {
        const baseSlug = createCleanSlug(requestedSlug?.trim() || targetProject.title);
        const candidates = [
          baseSlug,
          ...Array.from({ length: 19 }, (_, idx) => `${baseSlug}-${idx + 2}`),
        ];

        let chosenSlug = '';
        for (const candidate of candidates) {
          const checkPath = `published_sites/${candidate}`;
          try {
            const snap = await getDoc(doc(db, 'published_sites', candidate));
            if (!snap.exists()) {
              chosenSlug = candidate;
              break;
            }
            const data = snap.data();
            if (data?.ownerId === uid && data?.projectId === targetProject.id) {
              chosenSlug = candidate;
              isExistingOwnDoc = true;
              prevVersion = Number(data?.version || 1);
              break;
            }
          } catch (err) {
            handleFirestoreError(err, OperationType.GET, checkPath);
          }
        }

        if (!chosenSlug) {
          const shortRand = Math.random().toString(36).substring(2, 6);
          chosenSlug = sanitizeId(`${baseSlug}-${shortRand}`);
        }
        slug = chosenSlug;
      }

      const sitePath = `published_sites/${slug}`;
      const siteRef = doc(db, 'published_sites', slug);
      let nextVersion = 1;

      try {
        const existingSnap = isExistingOwnDoc ? null : await getDoc(siteRef);
        const alreadyExists = isExistingOwnDoc || Boolean(existingSnap?.exists());
        const currentVer = isExistingOwnDoc
          ? prevVersion
          : Number(existingSnap?.data()?.version || 1);

        const safeTitle = (targetProject.title || 'Live Site').slice(0, 150);
        const safeCode = (targetProject.fullCode || '<!doctype html><html><body></body></html>').slice(0, 350000);

        if (!alreadyExists) {
          await setDoc(siteRef, {
            siteId: slug,
            projectId: targetProject.id,
            ownerId: uid,
            title: safeTitle,
            fullCode: safeCode,
            version: 1,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          nextVersion = 1;
        } else {
          await updateDoc(siteRef, {
            title: safeTitle,
            fullCode: safeCode,
            version: increment(1),
            updatedAt: serverTimestamp(),
          });
          nextVersion = currentVer + 1;
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, sitePath);
      }

      const projectPath = `users/${uid}/projects/${targetProject.id}`;
      try {
        await updateDoc(doc(db, 'users', uid, 'projects', targetProject.id), {
          publishedSlug: slug,
          publishedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, projectPath);
      }

      setPublishedVersion(nextVersion);
      return {
        slug,
        version: nextVersion,
        url: `${window.location.origin}/p/${slug}`,
      };
    } catch (err: any) {
      console.error(err);
      showError(err?.message || 'Failed to publish live site.');
      return null;
    } finally {
      setIsPublishing(false);
    }
  };

  if (liveSiteSlug) {
    return <LiveSiteViewer siteId={liveSiteSlug} onBackToStudio={handleBackFromLiveSite} />;
  }

  if (isAdminRoute) {
    return <AdminDashboard onOpenLiveSite={handleOpenLiveSite} />;
  }

  if (!authReady) {
    return (
      <div className="min-h-[100dvh] bg-[#131314] text-[#e3e3e3] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!firebaseUser) {
    return <LoginScreen authError={authError} />;
  }

  const userEmail = firebaseUser.email || 'user@gmail.com';
  const userName = firebaseUser.displayName || userEmail.split('@')[0];
  const userPhotoURL = firebaseUser.photoURL || '';

  return (
    <div className="min-h-[100dvh] bg-[#131314] text-[#e3e3e3] flex flex-row font-sans select-none overflow-hidden w-full">
      {/* Left Sidebar (Responsive Drawer on Mobile, Fixed Sidebar on Desktop) */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNewApp={() => {
          setActiveView('home');
          setIsSidebarOpen(false);
        }}
        onOpenProjects={() => {
          setIsProjectsOpen(true);
          setIsSidebarOpen(false);
        }}
        onOpenTemplates={() => {
          setIsTemplatesOpen(true);
          setIsSidebarOpen(false);
        }}
        onGoHome={() => {
          setActiveView('home');
          setIsSidebarOpen(false);
        }}
        activeView={activeView}
        userEmail={userEmail}
        userName={userName}
        userPhotoURL={userPhotoURL}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-[100dvh] overflow-hidden w-full min-w-0">
        {activeView === 'home' ? (
          <HomeView
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            onSelectTemplate={handleSelectTemplate}
            onOpenTemplates={() => setIsTemplatesOpen(true)}
            onOpenMenu={() => setIsSidebarOpen(true)}
            userName={userName}
            userEmail={userEmail}
            userPhotoURL={userPhotoURL}
            isAdmin={firebaseUser.email === 'amalj7767@gmail.com' && firebaseUser.emailVerified}
            onLogout={handleLogout}
            accounts={connectedAccounts}
            activeUid={firebaseUser.uid}
            selectedModel={selectedModel}
            onChangeModel={setSelectedModel}
            onAddAccount={handleAddGmailAccount}
            onSwitchAccount={handleSwitchGmailAccount}
            onRemoveAccount={handleRemoveGmailAccount}
            isSwitchingAccount={isSwitchingAccount}
            lastFallbackNotice={lastFallbackNotice}
          />
        ) : (
          currentProject && (
            <Workspace
              project={currentProject}
              onUpdateProject={handleUpdateProject}
              onRefine={handleRefine}
              isRefining={isRefining}
              onBackToStart={() => setActiveView('home')}
              onOpenExport={() => setIsExportOpen(true)}
              onPublishSite={handlePublishSite}
              onOpenLiveSite={handleOpenLiveSite}
              isPublishing={isPublishing}
              publishedVersion={publishedVersion}
              userName={userName}
              userEmail={userEmail}
              userPhotoURL={userPhotoURL}
              accounts={connectedAccounts}
              activeUid={firebaseUser.uid}
              selectedModel={selectedModel}
              onChangeModel={setSelectedModel}
              onAddAccount={handleAddGmailAccount}
              onSwitchAccount={handleSwitchGmailAccount}
              onRemoveAccount={handleRemoveGmailAccount}
              isSwitchingAccount={isSwitchingAccount}
              lastFallbackNotice={lastFallbackNotice}
            />
          )
        )}
      </div>

      {/* Modals */}
      <TemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      <ProjectManagerModal
        isOpen={isProjectsOpen}
        onClose={() => setIsProjectsOpen(false)}
        projects={projects}
        currentProjectId={currentProjectId}
        onSelectProject={(proj) => {
          setCurrentProjectId(proj.id);
          setActiveView('workspace');
        }}
        onDeleteProject={handleDeleteProject}
        onToggleStar={handleToggleStar}
      />

      {currentProject && (
        <ExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          project={currentProject}
          onPublishSite={handlePublishSite}
          onOpenLiveSite={handleOpenLiveSite}
          isPublishing={isPublishing}
          publishedVersion={publishedVersion}
        />
      )}

      {/* Error Toast */}
      {errorToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-rose-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <span className="text-sm font-semibold">{errorToast}</span>
          <button onClick={() => setErrorToast(null)} className="text-white/80 hover:text-white">✕</button>
        </div>
      )}
    </div>
  );
}
