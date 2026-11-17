import React, { useState, useEffect } from 'react';
import { Project, Template } from './types';
import { TEMPLATES } from './data/templates';
import { LoginScreen } from './components/LoginScreen';
import { Sidebar } from './components/Sidebar';
import { HomeView } from './components/HomeView';
import { Workspace } from './components/Workspace';
import { TemplatesModal } from './components/TemplatesModal';
import { ProjectManagerModal } from './components/ProjectManagerModal';
import { ExportModal } from './components/ExportModal';
import { AdminPanelModal } from './components/AdminPanelModal';

const STORAGE_KEY = 'nexusai_projects_v2';
const AUTH_KEY = 'nexusai_auth_v1';
const USERS_KEY = 'nexusai_registered_users_v1';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem(AUTH_KEY + '_status') === 'true';
  });
  const [userEmail, setUserEmail] = useState<string>(() => {
    return localStorage.getItem(AUTH_KEY + '_email') || 'amalj7767@gmail.com';
  });
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem(AUTH_KEY + '_name') || 'Amal J';
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved projects', e);
      }
    }
    const defaultTmpl = TEMPLATES[0];
    const initialProj: Project = {
      id: 'default-1',
      title: defaultTmpl.title,
      description: defaultTmpl.description,
      prompt: defaultTmpl.prompt,
      html: defaultTmpl.html,
      css: defaultTmpl.css,
      js: defaultTmpl.js,
      fullCode: defaultTmpl.fullCode,
      updatedAt: Date.now(),
      starred: true,
    };
    return [initialProj];
  });

  const [currentProjectId, setCurrentProjectId] = useState<string>(() => {
    return projects[0]?.id || 'default-1';
  });

  const [activeView, setActiveView] = useState<'home' | 'workspace'>('home');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // Modals
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  const currentProject = projects.find(p => p.id === currentProjectId) || projects[0];

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  const handleLogin = (email: string, name: string) => {
    setIsLoggedIn(true);
    setUserEmail(email);
    setUserName(name);
    localStorage.setItem(AUTH_KEY + '_status', 'true');
    localStorage.setItem(AUTH_KEY + '_email', email);
    localStorage.setItem(AUTH_KEY + '_name', name);

    // Track user in registered users list
    const savedUsers = localStorage.getItem(USERS_KEY);
    let usersList = savedUsers ? JSON.parse(savedUsers) : [];
    if (!usersList.some((u: any) => u.email === email)) {
      usersList.push({ name, email, loginTime: Date.now(), appsCount: 1 });
    } else {
      usersList = usersList.map((u: any) => u.email === email ? { ...u, loginTime: Date.now() } : u);
    }
    localStorage.setItem(USERS_KEY, JSON.stringify(usersList));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem(AUTH_KEY + '_status');
  };

  const showError = (msg: string) => {
    setErrorToast(msg);
    setTimeout(() => setErrorToast(null), 5000);
  };

  const handleGenerate = async (promptText: string) => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate website');
      }

      const newProj: Project = {
        id: 'proj_' + Date.now(),
        title: data.title || 'AI Website',
        description: data.description || promptText,
        prompt: promptText,
        html: data.html || '',
        css: data.css || '',
        js: data.js || '',
        fullCode: data.fullCode || '',
        updatedAt: Date.now(),
      };

      setProjects(prev => [newProj, ...prev]);
      setCurrentProjectId(newProj.id);
      setActiveView('workspace');
    } catch (err: any) {
      console.error(err);
      showError(err.message || 'Failed to generate website.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefine = async (promptText: string) => {
    setIsRefining(true);
    try {
      const res = await fetch('/api/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          currentCode: {
            html: currentProject.html,
            css: currentProject.css,
            js: currentProject.js
          }
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to refine website');
      }

      const updatedProj: Project = {
        ...currentProject,
        title: data.title || currentProject.title,
        description: data.description || currentProject.description,
        html: data.html || currentProject.html,
        css: data.css || currentProject.css,
        js: data.js || currentProject.js,
        fullCode: data.fullCode || currentProject.fullCode,
        updatedAt: Date.now(),
      };

      setProjects(prev => prev.map(p => p.id === currentProject.id ? updatedProj : p));
    } catch (err: any) {
      console.error(err);
      showError(err.message || 'Failed to refine website.');
    } finally {
      setIsRefining(false);
    }
  };

  const handleSelectTemplate = (tmpl: Template) => {
    const newProj: Project = {
      id: 'tmpl_' + Date.now(),
      title: tmpl.title,
      description: tmpl.description,
      prompt: tmpl.prompt,
      html: tmpl.html,
      css: tmpl.css,
      js: tmpl.js,
      fullCode: tmpl.fullCode,
      updatedAt: Date.now(),
      starred: true,
    };
    setProjects(prev => [newProj, ...prev]);
    setCurrentProjectId(newProj.id);
    setActiveView('workspace');
  };

  const handleUpdateProject = (updatedFields: Partial<Project>) => {
    setProjects(prev => prev.map(p => {
      if (p.id === currentProject.id) {
        return { ...p, ...updatedFields };
      }
      return p;
    }));
  };

  const handleDeleteProject = (id: string) => {
    if (projects.length <= 1) {
      showError('You must keep at least one project.');
      return;
    }
    const filtered = projects.filter(p => p.id !== id);
    setProjects(filtered);
    if (currentProjectId === id) {
      setCurrentProjectId(filtered[0].id);
    }
  };

  const handleToggleStar = (id: string) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, starred: !p.starred } : p));
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#131314] text-[#e3e3e3] flex flex-row font-sans select-none overflow-hidden">
      {/* Left Sidebar */}
      <Sidebar
        onNewApp={() => setActiveView('home')}
        onOpenProjects={() => setIsProjectsOpen(true)}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onGoHome={() => setActiveView('home')}
        activeView={activeView}
        userEmail={userEmail}
        userName={userName}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Workspace Top Toolbar if in workspace view */}
        {activeView === 'workspace' && (
          <div className="h-14 border-b border-[#2d2d30] bg-[#1e1e20] px-6 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveView('home')}
                className="text-xs text-[#9aa0a6] hover:text-white transition font-medium flex items-center gap-1"
              >
                ← Back to Home
              </button>
              <span className="text-[#3c4043]">/</span>
              <span className="text-sm font-bold text-white truncate max-w-md">{currentProject.title}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsExportOpen(true)}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md transition"
              >
                Export & Share
              </button>
            </div>
          </div>
        )}

        {/* View Switcher: HomeView or Workspace */}
        {activeView === 'home' ? (
          <HomeView
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            onSelectTemplate={handleSelectTemplate}
            onOpenTemplates={() => setIsTemplatesOpen(true)}
          />
        ) : (
          <Workspace
            project={currentProject}
            onUpdateProject={handleUpdateProject}
            onRefine={handleRefine}
            isRefining={isRefining}
          />
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

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        project={currentProject}
      />

      <AdminPanelModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        projects={projects}
        currentUserEmail={userEmail}
      />

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
