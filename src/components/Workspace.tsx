import React, { useState, useEffect, useRef } from 'react';
import { 
  Monitor, Tablet, Smartphone, RefreshCw, Code2, Eye, MessageSquare, 
  Send, Sparkles, FileText, Folder, Download, Play, Check, 
  ChevronDown, ChevronUp, Maximize2, Minimize2, Plus, 
  ArrowLeft, Share2, Layers, CheckCircle, Pencil, Columns2,
  Globe, Copy, ExternalLink
} from 'lucide-react';
import JSZip from 'jszip';
import { Project, DeviceMode, ProjectFile, ChatMessage, RefineResult, ConnectedAccount, GeminiModelOption } from '../types';
import { compressGalleryImage } from '../utils/imageHelper';
import { createCleanSlug, withSafeIframeNavigation } from '../utils/slugHelper';
import { AccountModelBar } from './AccountModelBar';

interface WorkspaceProps {
  project: Project;
  onUpdateProject: (updated: Partial<Project>) => void;
  onRefine: (prompt: string, attachment?: string) => Promise<RefineResult>;
  isRefining: boolean;
  onBackToStart: () => void;
  onOpenExport: () => void;
  onPublishSite: (project: Project) => Promise<{ slug: string; version: number; url: string } | null>;
  onOpenLiveSite: (slug: string) => void;
  isPublishing: boolean;
  publishedVersion?: number;
  userName?: string;
  userEmail?: string;
  userPhotoURL?: string;
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

const QUICK_EDITS = [
  "Remove the round button and add two buttons instead",
  "Change the color to blue",
  "Add dark mode / light mode toggle",
  "Make header sticky with backdrop blur",
  "Add interactive contact form with validation",
  "Add customer testimonials review grid",
];

export const Workspace: React.FC<WorkspaceProps> = ({
  project,
  onUpdateProject,
  onRefine,
  isRefining,
  onBackToStart,
  onOpenExport,
  onPublishSite,
  onOpenLiveSite,
  isPublishing,
  publishedVersion,
  userName,
  userEmail,
  userPhotoURL,
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
  const [copiedLiveUrl, setCopiedLiveUrl] = useState(false);
  const [publishToast, setPublishToast] = useState<string | null>(null);
  // Mobile screen detection
  const [isMobileScreen, setIsMobileScreen] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth < 1024 : false;
  });

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobileScreen(mobile);
      if (mobile) setDeviceMode('mobile');
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [deviceMode, setDeviceMode] = useState<DeviceMode>(() => {
    return typeof window !== 'undefined' && window.innerWidth < 1024 ? 'mobile' : 'desktop';
  });

  // Views on mobile: 'chat' | 'preview' | 'code'
  // On desktop: left panel is chat, right panel is 'preview' | 'split' | 'code'
  const [mobileActiveTab, setMobileActiveTab] = useState<'chat' | 'preview' | 'code'>('preview');
  const [rightPanelTab, setRightPanelTab] = useState<'preview' | 'split' | 'code'>('preview');

  const [selectedFilePath, setSelectedFilePath] = useState<string>('index.html');
  const [chatInput, setChatInput] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initial message with Action history
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'init-1',
      role: 'user',
      content: project.prompt || 'Build a modern web application with full interactivity.',
      timestamp: Date.now() - 30000,
    },
    {
      id: 'init-2',
      role: 'assistant',
      content: `I have generated the complete multi-file project for "${project.title}"!
• Fully interactive UI with Tailwind styling
• Separated into clean index.html, style.css, script.js, and package.json
• Ready to test in the live preview or download as a standalone ZIP archive.`,
      timestamp: Date.now(),
      actionHistory: {
        installedPackages: ['tailwindcss', 'lucide-icons'],
        files: project.files && project.files.length > 0 ? project.files.map(f => f.path) : ['index.html', 'style.css', 'script.js', 'package.json'],
        built: true,
        duration: '1.4s',
        model: 'Gemini Flash'
      }
    }
  ]);

  const [iframeKey, setIframeKey] = useState(0);
  const [isZipping, setIsZipping] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [showUpdatedToast, setShowUpdatedToast] = useState(false);
  const [lastModifiedFiles, setLastModifiedFiles] = useState<string[]>([]);
  const [actionHistoryOpen, setActionHistoryOpen] = useState<{ [id: string]: boolean }>({
    'init-2': true
  });
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Files state
  const [files, setFiles] = useState<ProjectFile[]>(project.files || [
    { path: 'index.html', content: project.fullCode }
  ]);
  const [activeFileContent, setActiveFileContent] = useState<string>('');

  useEffect(() => {
    const projFiles = project.files && project.files.length > 0 ? project.files : [
      { path: 'index.html', content: project.fullCode }
    ];
    setFiles(projFiles);
    const current = projFiles.find(f => f.path === selectedFilePath) || projFiles[0];
    setActiveFileContent(current ? current.content : '');
    setIframeKey(prev => prev + 1);
  }, [project]);

  const handleSelectFile = (path: string) => {
    setSelectedFilePath(path);
    const found = files.find(f => f.path === path);
    setActiveFileContent(found ? found.content : '');
  };

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const buildBundleFromFiles = (updatedFiles: ProjectFile[]) => {
    const htmlFile = updatedFiles.find(f => f.path === 'index.html')?.content || project.fullCode;
    const cssFile = updatedFiles.find(f => f.path === 'style.css')?.content || '';
    const jsFile = updatedFiles.find(f => f.path === 'script.js')?.content || '';

    return htmlFile.includes('<style>') ? htmlFile : `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>${project.title}</title>
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <style>${cssFile}</style>
</head>
<body class="m-0 p-0 antialiased overflow-x-hidden">
  ${htmlFile}
  <script>${jsFile}</script>
</body>
</html>`;
  };

  const handleFileContentChange = (newContent: string) => {
    setActiveFileContent(newContent);
    const updatedFiles = files.map(f => f.path === selectedFilePath ? { ...f, content: newContent } : f);
    setFiles(updatedFiles);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      onUpdateProject({
        files: updatedFiles,
        fullCode: buildBundleFromFiles(updatedFiles),
        updatedAt: Date.now()
      });
    }, 1000);
  };

  const handleApplyEdits = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    onUpdateProject({
      files,
      fullCode: buildBundleFromFiles(files),
      updatedAt: Date.now()
    });
    setIframeKey(prev => prev + 1);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  const handleSendChat = async (e?: React.FormEvent, directPrompt?: string) => {
    if (e) e.preventDefault();
    const textToSend = directPrompt || chatInput;
    if (!textToSend.trim() && !attachedImage) return;
    if (isRefining) return;

    const userText = textToSend.trim() || 'Please modify the code as requested.';
    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: userText,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    const attachment = attachedImage || undefined;
    setAttachedImage(null);

    const startTime = Date.now();
    try {
      const result = await onRefine(userText, attachment);
      const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1) + 's';

      if (result && result.success) {
        const newAsstMsgId = 'asst-' + Date.now();
        const modified = result.modifiedFiles && result.modifiedFiles.length > 0 
          ? result.modifiedFiles 
          : ['index.html', 'style.css'];
        
        setLastModifiedFiles(modified);

        const assistantMsg: ChatMessage = {
          id: newAsstMsgId,
          role: 'assistant',
          content: result.explanation || `I've updated the project based on your request!\n• Applied modifications directly to ${modified.join(', ')}\n• Live preview reloaded instantaneously\n• All existing code and functionality preserved.`,
          timestamp: Date.now(),
          actionHistory: {
            installedPackages: ['tailwindcss'],
            files: modified,
            built: true,
            duration: elapsedSec,
            model: `${result.usedModel || (selectedModel === 'auto' ? 'gemini-4-hydrogen' : selectedModel)}${result.fallbackUsed ? ' (Auto-Fallback)' : ''}`
          }
        };
        setMessages(prev => [...prev, assistantMsg]);
        setActionHistoryOpen(prev => ({ ...prev, [newAsstMsgId]: true }));
        setIframeKey(prev => prev + 1);
        setShowUpdatedToast(true);
        setTimeout(() => setShowUpdatedToast(false), 4500);
      } else if (result && !result.success) {
        const errorMsg: ChatMessage = {
          id: 'err-' + Date.now(),
          role: 'assistant',
          content: `Failed to update code: ${result.error || 'Please try again.'}`,
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, errorMsg]);
      }
    } catch (err: any) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: 'err-' + Date.now(),
        role: 'assistant',
        content: `Failed to update code: ${err.message || 'Network error'}`,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
    }
  };

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(project.title);

  useEffect(() => {
    setTitleInput(project.title);
  }, [project.title]);

  const handleSaveTitle = () => {
    setIsEditingTitle(false);
    const trimmed = titleInput.trim();
    if (trimmed && trimmed !== project.title) {
      onUpdateProject({ title: trimmed });
    } else {
      setTitleInput(project.title);
    }
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      files.forEach(file => {
        zip.file(file.path, file.content);
      });
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      const cleanProjectName = (project.title || 'project')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') || 'project';
      a.download = `${cleanProjectName}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Failed to generate ZIP file.');
    } finally {
      setIsZipping(false);
    }
  };

  const reloadIframe = () => {
    setIframeKey(prev => prev + 1);
  };

  const handleFileAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressGalleryImage(file);
        setAttachedImage(compressed);
      } catch (err) {
        console.error('Failed to process attachment:', err);
      }
      e.target.value = '';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[100dvh] w-full bg-[#131314] text-[#e3e3e3] select-none overflow-hidden font-sans">
      {/* Top Header Bar */}
      <header className="h-13 bg-[#1e1e20] border-b border-[#2d2d30] px-3 sm:px-5 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBackToStart}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#2d2d30] hover:bg-[#3c4043] text-xs font-semibold text-[#e3e3e3] transition cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back to start</span>
          </button>
          <span className="text-[#3c4043] shrink-0">/</span>
          {isEditingTitle ? (
            <div className="flex items-center gap-1.5 min-w-0">
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTitle();
                  if (e.key === 'Escape') {
                    setTitleInput(project.title);
                    setIsEditingTitle(false);
                  }
                }}
                autoFocus
                className="bg-[#131314] text-white text-xs sm:text-sm font-bold px-2 py-0.5 rounded-lg border border-blue-500 focus:outline-none max-w-[140px] sm:max-w-xs"
              />
              <button
                onClick={handleSaveTitle}
                className="p-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shrink-0"
                title="Save title"
              >
                <Check className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => setIsEditingTitle(true)}
              className="flex items-center gap-1.5 cursor-pointer group max-w-[140px] sm:max-w-xs md:max-w-md"
              title="Click to rename project"
            >
              <span className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-blue-400 transition">
                {project.title}
              </span>
              <Pencil className="w-3 h-3 text-[#9aa0a6] group-hover:text-blue-400 transition shrink-0 opacity-60 group-hover:opacity-100" />
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={async () => {
              const res = await onPublishSite(project);
              if (res) {
                setPublishToast(
                  res.version > 1
                    ? `Updated live link (v${res.version}) at the exact same URL!`
                    : `Published! Permanent live link created.`
                );
                setTimeout(() => setPublishToast(null), 4500);
              }
            }}
            disabled={isPublishing}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-xs font-semibold shadow-md transition cursor-pointer disabled:opacity-50 ${
              project.publishedSlug
                ? project.publishedAt && project.updatedAt > project.publishedAt + 1500
                  ? 'bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-500'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500'
            }`}
            title={
              project.publishedSlug
                ? 'Update live website under the exact same permanent URL'
                : 'Publish a permanent shareable live link'
            }
          >
            {isPublishing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Globe className="w-3.5 h-3.5" />
            )}
            <span className="hidden md:inline">
              {isPublishing
                ? 'Publishing...'
                : project.publishedSlug
                ? 'Republish / Update'
                : 'Publish Live'}
            </span>
            <span className="md:hidden">
              {isPublishing ? '...' : project.publishedSlug ? 'Update' : 'Publish'}
            </span>
          </button>

          <button
            onClick={handleDownloadZip}
            disabled={isZipping}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#2d2d30] hover:bg-[#3c4043] text-white text-xs font-semibold transition border border-[#3c4043] cursor-pointer disabled:opacity-50"
            title="Download Project (ZIP)"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden lg:inline">{isZipping ? 'Zipping...' : 'Download Project (ZIP)'}</span>
            <span className="lg:hidden">{isZipping ? '...' : 'ZIP'}</span>
          </button>

          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md transition cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export & Share</span>
          </button>

          {/* User Google Profile Photo */}
          <div
            className="flex items-center shrink-0 pl-0.5"
            title={userName ? `${userName}${userEmail ? ` (${userEmail})` : ''}` : 'User Profile'}
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
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center font-bold text-xs text-white border border-[#3c4043]">
                {userName ? userName[0].toUpperCase() : 'U'}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Permanent Live Link Strip (Visible once published) */}
      {project.publishedSlug && (
        <div className="bg-emerald-950/35 border-b border-emerald-500/25 px-3 sm:px-5 py-1.5 flex items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE v{publishedVersion || 1}
            </span>
            <span className="font-mono text-[11px] text-emerald-200/90 truncate select-all">
              {`/p/${project.publishedSlug}`}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {publishToast && (
              <span className="hidden md:inline text-[11px] font-semibold text-emerald-300 mr-2">
                {publishToast}
              </span>
            )}
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/p/${project.publishedSlug}`);
                setCopiedLiveUrl(true);
                setTimeout(() => setCopiedLiveUrl(false), 2000);
              }}
              className="px-2.5 py-1 rounded-lg bg-[#2d2d30] hover:bg-[#3c4043] text-white text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
            >
              {copiedLiveUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedLiveUrl ? 'Copied' : 'Copy Link'}</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenLiveSite(project.publishedSlug!)}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Open</span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Switcher Bar (< 1024px) */}
      {isMobileScreen && (
        <div className="h-11 bg-[#18181b] border-b border-[#2d2d30] px-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1 bg-[#131314] p-1 rounded-xl border border-[#3c4043]">
            <button
              onClick={() => setMobileActiveTab('preview')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                mobileActiveTab === 'preview' ? 'bg-blue-600 text-white shadow-xs' : 'text-[#9aa0a6]'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
            <button
              onClick={() => setMobileActiveTab('chat')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                mobileActiveTab === 'chat' ? 'bg-blue-600 text-white shadow-xs' : 'text-[#9aa0a6]'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>AI Chat</span>
            </button>
            <button
              onClick={() => setMobileActiveTab('code')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                mobileActiveTab === 'code' ? 'bg-blue-600 text-white shadow-xs' : 'text-[#9aa0a6]'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Files</span>
            </button>
          </div>

          <button
            onClick={reloadIframe}
            className="p-1.5 rounded-lg bg-[#2d2d30] text-[#e3e3e3]"
            title="Reload Preview"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Studio Work Area */}
      <div className="flex-1 flex flex-row overflow-hidden w-full h-[calc(100dvh-3.25rem)]">
        {/* Left Panel: Chat & Action History (Visible on desktop OR when mobileActiveTab === 'chat') */}
        <div 
          className={`w-full lg:w-[480px] border-r border-[#2d2d30] bg-[#1e1e20] flex-col h-full shrink-0 ${
            isMobileScreen 
              ? (mobileActiveTab === 'chat' ? 'flex flex-1' : 'hidden')
              : 'flex'
          }`}
        >
          {/* Left Panel Header */}
          <div className="h-11 px-4 border-b border-[#2d2d30] bg-[#1e1e20] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="font-bold text-xs text-white tracking-wide">Live Edit Assistant</span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Real-time
              </span>
            </div>
            <span className="text-[10px] text-[#9aa0a6] bg-[#2d2d30] px-2 py-0.5 rounded-full font-mono">
              {selectedModel === 'auto' ? 'Auto Rotate (Free)' : selectedModel}
            </span>
          </div>

          {/* Chat Stream & Action History Feed */}
          <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className="space-y-3 animate-in fade-in duration-200">
                {msg.role === 'user' ? (
                  /* User message bubble */
                  <div className="bg-[#2d2d30] border border-[#3c4043] rounded-2xl p-3.5 text-xs text-white leading-relaxed">
                    <p className="font-medium">{msg.content}</p>
                  </div>
                ) : (
                  /* Assistant message with Action History box */
                  <div className="space-y-2.5">
                    {/* Model run timing banner */}
                    <div className="text-[11px] text-[#9aa0a6] flex items-center gap-1.5 px-1">
                      <span>{msg.actionHistory?.model || 'Gemini'}</span>
                      <span>•</span>
                      <span>Ran in {msg.actionHistory?.duration || '1.4s'}</span>
                    </div>

                    {/* Collapsible Action History Box matching AI Studio screenshot */}
                    {msg.actionHistory && (
                      <div className="bg-[#18181b] border border-[#3c4043] rounded-2xl overflow-hidden">
                        <button
                          onClick={() => setActionHistoryOpen(prev => ({ ...prev, [msg.id]: !prev[msg.id] }))}
                          className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-[#e3e3e3] hover:bg-[#202024] transition cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <Layers className="w-3.5 h-3.5 text-blue-400" />
                            <span>Action history</span>
                          </div>
                          {actionHistoryOpen[msg.id] ? (
                            <ChevronUp className="w-3.5 h-3.5 text-[#9aa0a6]" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-[#9aa0a6]" />
                          )}
                        </button>

                        {actionHistoryOpen[msg.id] && (
                          <div className="px-4 pb-3.5 pt-1 space-y-2 border-t border-[#2d2d30] text-xs">
                            {msg.actionHistory.installedPackages && (
                              <div className="flex items-center gap-2 text-[#9aa0a6] text-[11px] pt-1">
                                <Download className="w-3 h-3 text-purple-400" />
                                <span>Configured {msg.actionHistory.installedPackages.length} packages (Tailwind, Lucide)</span>
                              </div>
                            )}

                            <div className="space-y-1.5 pt-1">
                              <span className="text-[11px] text-[#9aa0a6] block font-medium">
                                Created {msg.actionHistory.files.length} project files:
                              </span>
                              {msg.actionHistory.files.map((filename, fIdx) => (
                                <div key={fIdx} className="flex items-center justify-between py-0.5 px-2 rounded-lg bg-[#131314] text-[11px] font-mono">
                                  <span className="text-[#c4c7c5]">{filename}</span>
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                                </div>
                              ))}
                            </div>

                            <div className="flex items-center gap-1.5 pt-1 text-emerald-400 text-[11px] font-semibold">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Compiled & built sandbox preview successfully</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Assistant explanation message */}
                    <div className="bg-[#18181b] border border-[#2d2d30] rounded-2xl p-4 text-xs text-[#e3e3e3] leading-relaxed whitespace-pre-line">
                      {msg.content}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Refining / Generating in progress state */}
            {isRefining && (
              <div className="space-y-2 bg-[#18181b] border border-blue-500/50 rounded-2xl p-4 shadow-xl shadow-blue-500/10 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-blue-400 font-bold">
                    <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                    <span>Live Edit Assistant Working...</span>
                  </div>
                  <span className="text-[10px] text-blue-300 font-mono bg-blue-500/20 px-2 py-0.5 rounded-full">Gemini 4</span>
                </div>
                <div className="space-y-1 text-xs text-[#c4c7c5]">
                  <p className="flex items-center gap-2 text-[11px] text-[#c4c7c5]">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping"></span>
                    Surgically editing existing files with your instructions...
                  </p>
                  <p className="text-[11px] text-[#9aa0a6] pl-3.5">
                    Live preview will refresh automatically without starting over.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Edit Suggestions Bar */}
          <div className="px-3 py-2 bg-[#18181b] border-t border-[#2d2d30] overflow-x-auto flex items-center gap-1.5 shrink-0 scrollbar-none">
            <span className="text-[10px] text-[#9aa0a6] uppercase tracking-wider font-bold shrink-0 mr-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-400" />
              Quick:
            </span>
            {QUICK_EDITS.map((suggestion, sIdx) => (
              <button
                key={sIdx}
                type="button"
                onClick={() => handleSendChat(undefined, suggestion)}
                disabled={isRefining}
                className="px-2.5 py-1 rounded-lg bg-[#222225] hover:bg-[#2e2e33] text-[11px] text-[#c4c7c5] hover:text-white border border-[#3c4043] whitespace-nowrap transition cursor-pointer disabled:opacity-40 shrink-0"
              >
                {suggestion}
              </button>
            ))}
          </div>

          {/* Attached image preview if any */}
          {attachedImage && (
            <div className="px-3 py-2 bg-[#18181b] border-t border-[#2d2d30] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={attachedImage} alt="Attachment" className="w-8 h-8 rounded-lg object-cover border border-[#3c4043]" />
                <span className="text-xs text-[#c4c7c5]">Image attached</span>
              </div>
              <button 
                onClick={() => setAttachedImage(null)}
                className="text-xs text-rose-400 hover:underline cursor-pointer"
              >
                Remove
              </button>
            </div>
          )}

          {/* Bottom Chat Prompt Box */}
          <form onSubmit={handleSendChat} className="p-3 border-t border-[#2d2d30] bg-[#1e1e20] shrink-0">
            <div className="bg-[#131314] border border-[#3c4043] rounded-2xl p-2.5 flex flex-col gap-2">
              <textarea
                rows={2}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask to modify buttons, colors, layout, add new sections..."
                disabled={isRefining}
                className="w-full bg-transparent text-[#e3e3e3] placeholder-[#9aa0a6] focus:outline-none text-xs sm:text-sm font-medium resize-none leading-relaxed"
              />

              <div className="flex items-center justify-between pt-1 border-t border-[#2d2d30]/60">
                <div className="flex items-center gap-1.5">
                  <label
                    htmlFor="workspace-gallery-input"
                    className="p-1.5 rounded-lg bg-[#2d2d30] hover:bg-[#3c4043] text-[#9aa0a6] hover:text-white transition cursor-pointer flex items-center"
                    title="Pick image from Phone Gallery"
                  >
                    <Plus className="w-4 h-4 text-blue-400" />
                  </label>

                  <div className="px-2.5 py-1 rounded-lg bg-[#2d2d30] text-[11px] font-medium text-[#c4c7c5] flex items-center gap-1 cursor-pointer">
                    <span>Default mode</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isRefining || (!chatInput.trim() && !attachedImage)}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white p-2 rounded-xl transition shadow-md cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </form>

          {/* Multi-Gmail Switcher & Free Model Auto-Rotation Bar below chat box */}
          <AccountModelBar
            compact
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

          {/* Direct phone gallery input */}
          <input
            id="workspace-gallery-input"
            type="file"
            ref={fileInputRef}
            onChange={handleFileAttachment}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* Right Panel: Live Interactive Preview & Multi-File Code Editor */}
        <div 
          className={`flex-1 flex-col bg-[#131314] overflow-hidden h-full ${
            isMobileScreen 
              ? (mobileActiveTab !== 'chat' ? 'flex flex-1' : 'hidden')
              : 'flex'
          }`}
        >
          {/* Right Panel Header Toolbar */}
          <div className="h-11 bg-[#1e1e20] border-b border-[#2d2d30] px-4 flex items-center justify-between shrink-0">
            {/* View Switchers: Preview vs Split vs Code */}
            <div className="flex items-center gap-1 bg-[#131314] p-1 rounded-xl border border-[#3c4043]">
              <button
                onClick={() => {
                  setRightPanelTab('preview');
                  setMobileActiveTab('preview');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  (isMobileScreen ? mobileActiveTab === 'preview' : rightPanelTab === 'preview')
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'text-[#9aa0a6] hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>
              {!isMobileScreen && (
                <button
                  onClick={() => setRightPanelTab('split')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                    rightPanelTab === 'split'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-[#9aa0a6] hover:text-white'
                  }`}
                  title="Split View: File Explorer & Live Preview side-by-side"
                >
                  <Columns2 className="w-3.5 h-3.5" />
                  <span>Split</span>
                </button>
              )}
              <button
                onClick={() => {
                  setRightPanelTab('code');
                  setMobileActiveTab('code');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  (isMobileScreen ? mobileActiveTab === 'code' : rightPanelTab === 'code')
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'text-[#9aa0a6] hover:text-white'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Code (&lt;&gt;)</span>
              </button>
            </div>

            {/* Device Switcher & Controls */}
            <div className="flex items-center gap-2">
              {!isMobileScreen && (
                <div className="flex items-center gap-1 bg-[#131314] p-1 rounded-xl border border-[#3c4043]">
                  <button
                    onClick={() => setDeviceMode('desktop')}
                    className={`p-1.5 rounded-lg transition cursor-pointer ${deviceMode === 'desktop' ? 'bg-blue-600 text-white shadow-xs' : 'text-[#9aa0a6] hover:text-white'}`}
                    title="Desktop Preview"
                  >
                    <Monitor className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeviceMode('tablet')}
                    className={`p-1.5 rounded-lg transition cursor-pointer ${deviceMode === 'tablet' ? 'bg-blue-600 text-white shadow-xs' : 'text-[#9aa0a6] hover:text-white'}`}
                    title="Tablet Preview"
                  >
                    <Tablet className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeviceMode('mobile')}
                    className={`p-1.5 rounded-lg transition cursor-pointer ${deviceMode === 'mobile' ? 'bg-blue-600 text-white shadow-xs' : 'text-[#9aa0a6] hover:text-white'}`}
                    title="Mobile Phone Preview"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <button
                onClick={reloadIframe}
                className="p-1.5 rounded-xl bg-[#2d2d30] hover:bg-[#3c4043] text-[#e3e3e3] transition cursor-pointer"
                title="Reload Preview"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsFullscreen(prev => !prev)}
                className="p-1.5 rounded-xl bg-[#2d2d30] hover:bg-[#3c4043] text-[#e3e3e3] transition cursor-pointer hidden sm:block"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Right Panel Main View: Live Preview, Split View, OR Multi-File Code Editor */}
          <div className="flex-1 flex flex-row overflow-hidden h-full">
            {((isMobileScreen && mobileActiveTab === 'code') || (!isMobileScreen && (rightPanelTab === 'code' || rightPanelTab === 'split'))) && (
              /* Multi-File Code Editor View */
              <div className={`${!isMobileScreen && rightPanelTab === 'split' ? 'w-1/2 border-r border-[#2d2d30]' : 'flex-1'} flex flex-col md:flex-row overflow-hidden h-full`}>
                {/* File Tree Explorer Column */}
                <div className={`w-full ${!isMobileScreen && rightPanelTab === 'split' ? 'md:w-44' : 'md:w-56'} bg-[#18181b] border-b md:border-b-0 md:border-r border-[#2d2d30] p-3 shrink-0 flex flex-col`}>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#9aa0a6] mb-2 flex items-center gap-1.5">
                    <Folder className="w-3.5 h-3.5 text-blue-400" />
                    <span>Project Files</span>
                  </div>
                  <div className="space-y-1 overflow-y-auto flex-1">
                    {files.map((file) => {
                      const isSelected = file.path === selectedFilePath;
                      const isRecentlyEdited = lastModifiedFiles.includes(file.path);
                      return (
                        <button
                          key={file.path}
                          onClick={() => handleSelectFile(file.path)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition cursor-pointer text-left ${
                            isSelected 
                              ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 font-bold' 
                              : 'text-[#c4c7c5] hover:bg-[#2d2d30] hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className={`w-3.5 h-3.5 shrink-0 ${file.path.endsWith('.html') ? 'text-rose-400' : file.path.endsWith('.css') ? 'text-cyan-400' : file.path.endsWith('.js') ? 'text-amber-400' : 'text-purple-400'}`} />
                            <span className="truncate">{file.path}</span>
                          </div>
                          {isRecentlyEdited && (
                            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-sans font-bold shrink-0">
                              Edited
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Code Editor Column */}
                <div className="flex-1 flex flex-col overflow-hidden relative bg-[#131314]">
                  <div className="px-4 py-2 bg-[#18181b] border-b border-[#2d2d30] flex items-center justify-between shrink-0">
                    <span className="text-xs font-mono font-bold text-blue-400 truncate">{selectedFilePath}</span>
                    <button
                      onClick={handleApplyEdits}
                      className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold transition flex items-center gap-1 shadow-sm cursor-pointer shrink-0"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      <span>{copiedNotification ? 'Updated!' : 'Update Preview'}</span>
                    </button>
                  </div>
                  <textarea
                    value={activeFileContent}
                    onChange={(e) => handleFileContentChange(e.target.value)}
                    className="flex-1 w-full bg-[#131314] text-[#e3e3e3] font-mono text-xs p-4 focus:outline-none resize-none leading-relaxed"
                    placeholder="Edit file contents..."
                    spellCheck={false}
                  />
                </div>
              </div>
            )}

            {((isMobileScreen && mobileActiveTab === 'preview') || (!isMobileScreen && (rightPanelTab === 'preview' || rightPanelTab === 'split'))) && (
              /* Live Interactive Preview View */
              <div className={`${!isMobileScreen && rightPanelTab === 'split' ? 'w-1/2' : 'flex-1'} flex items-center justify-center overflow-hidden relative ${isFullscreen ? 'p-0 bg-white' : (isMobileScreen ? 'p-0 bg-white' : 'p-3 sm:p-5 bg-[#131314]')}`}>
                {/* Real-time live preview updated toast */}
                {showUpdatedToast && (
                  <div className="absolute top-4 sm:top-8 z-40 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-semibold border border-emerald-400/40 animate-in fade-in slide-in-from-top-3 duration-200">
                    <CheckCircle className="w-4 h-4 text-white" />
                    <span>Live Preview Refreshed in Real-Time! ✨</span>
                  </div>
                )}

                <div 
                  className={`transition-all duration-300 bg-white shadow-2xl overflow-hidden flex flex-col ${
                    isFullscreen || isMobileScreen
                      ? 'w-full h-full border-0 rounded-none' // Naturally fills 100% of the phone screen
                      : (
                          deviceMode === 'desktop' ? 'w-full h-full rounded-2xl border border-[#2d2d30]' :
                          deviceMode === 'tablet' ? 'w-[768px] h-[85vh] max-w-full rounded-2xl border border-[#2d2d30]' : 
                          'w-[375px] h-[82vh] max-w-full rounded-3xl border-4 border-[#2d2d30] shadow-2xl'
                        )
                  }`}
                >
                  {/* Desktop top address bar */}
                  {!isMobileScreen && !isFullscreen && (
                    <div className="h-8 bg-[#1e1e20] border-b border-[#2d2d30] px-4 flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                      </div>
                      <div className="bg-[#131314] px-4 py-0.5 rounded-md text-[10px] font-mono text-[#9aa0a6] truncate max-w-xs">
                        /p/{project.publishedSlug || createCleanSlug(project.title)}
                      </div>
                      <div className="w-8"></div>
                    </div>
                  )}

                  {/* Sandboxed Interactive Iframe */}
                  <iframe
                    key={iframeKey}
                    ref={iframeRef}
                    srcDoc={withSafeIframeNavigation(project.fullCode)}
                    title={project.title}
                    sandbox="allow-scripts allow-modals allow-forms allow-same-origin allow-popups"
                    className="w-full flex-1 border-0 bg-white h-full"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
