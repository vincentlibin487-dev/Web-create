import React, { useState, useEffect } from 'react';
import {
  X, Download, Copy, Check, FileCode, Sparkles, FolderArchive,
  Globe, RefreshCw, ExternalLink, Link2
} from 'lucide-react';
import JSZip from 'jszip';
import { Project } from '../types';
import { createCleanSlug } from '../utils/slugHelper';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onPublishSite: (project: Project, requestedSlug?: string) => Promise<{ slug: string; version: number; url: string } | null>;
  onOpenLiveSite: (slug: string) => void;
  isPublishing: boolean;
  publishedVersion?: number;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  project,
  onPublishSite,
  onOpenLiveSite,
  isPublishing,
  publishedVersion,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [publishFeedback, setPublishFeedback] = useState<string | null>(null);
  const [customSlugInput, setCustomSlugInput] = useState(() => createCleanSlug(project.title));

  useEffect(() => {
    if (!project.publishedSlug) {
      setCustomSlugInput(createCleanSlug(project.title));
    }
  }, [project.id, project.title, project.publishedSlug, isOpen]);

  if (!isOpen) return null;

  const liveUrl = project.publishedSlug
    ? `${window.location.origin}/p/${project.publishedSlug}`
    : null;

  const sanitizedPreviewSlug = createCleanSlug(customSlugInput);

  const hasPendingUpdates = Boolean(
    project.publishedSlug &&
    project.publishedAt &&
    project.updatedAt > project.publishedAt + 1500
  );

  const getCleanFilename = (extension: string) => {
    const cleanProjectName = createCleanSlug(project.title || 'website-project');
    return `${cleanProjectName}.${extension}`;
  };

  const handlePublishOrUpdate = async () => {
    setPublishFeedback(null);
    const res = await onPublishSite(
      project,
      project.publishedSlug ? undefined : sanitizedPreviewSlug
    );
    if (res) {
      setPublishFeedback(
        res.version > 1
          ? `Updated live site (v${res.version}) at the exact same URL!`
          : `Published! Permanent link: /p/${res.slug}`
      );
      setTimeout(() => setPublishFeedback(null), 5000);
    }
  };

  const handleCopyLiveLink = () => {
    if (!liveUrl) return;
    navigator.clipboard.writeText(liveUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(project.fullCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadHTML = () => {
    const blob = new Blob([project.fullCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = getCleanFilename('html');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadZIP = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      if (project.files && project.files.length > 0) {
        project.files.forEach(f => zip.file(f.path, f.content));
      } else {
        zip.file('index.html', project.fullCode);
      }
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = getCleanFilename('zip');
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#1e1e20] border border-[#3c4043] rounded-3xl max-w-xl w-full flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90dvh]">
        <div className="px-6 py-5 border-b border-[#2d2d30] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-white">Publish & Export</h2>
              <p className="text-xs text-[#9aa0a6] truncate">
                Project: <span className="font-semibold text-blue-400">{project.title}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#2d2d30] hover:bg-[#3c4043] text-[#9aa0a6] hover:text-white transition cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Permanent Live Link Card */}
          <div className="bg-gradient-to-br from-emerald-950/50 via-[#131314] to-blue-950/30 border border-emerald-500/35 rounded-2xl p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-base">Permanent Custom Live Link</h3>
                    {liveUrl && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        v{publishedVersion || 1} Live
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#9aa0a6] mt-0.5">
                    {liveUrl
                      ? 'Republish updates code under this exact same link.'
                      : 'Clean custom URL generated automatically from your Project Name.'}
                  </p>
                </div>
              </div>

              <button
                onClick={handlePublishOrUpdate}
                disabled={isPublishing}
                className={`px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition shadow-lg flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50 ${
                  liveUrl
                    ? hasPendingUpdates
                      ? 'bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-white shadow-emerald-600/30'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${isPublishing ? 'animate-spin' : ''}`} />
                <span>
                  {isPublishing
                    ? 'Publishing...'
                    : liveUrl
                    ? 'Republish / Update'
                    : 'Publish Live Link'}
                </span>
              </button>
            </div>

            {!liveUrl ? (
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-[#c4c7c5] flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Custom URL Slug (auto-suffixed only if already taken)</span>
                </label>
                <div className="bg-[#131314] border border-[#3c4043] focus-within:border-emerald-500 rounded-xl px-3 py-2 flex items-center gap-1 text-xs">
                  <span className="font-mono text-[#9aa0a6] shrink-0">
                    /p/
                  </span>
                  <input
                    type="text"
                    value={customSlugInput}
                    onChange={(e) => setCustomSlugInput(e.target.value)}
                    placeholder="project-name"
                    className="flex-1 bg-transparent font-mono text-emerald-300 font-semibold focus:outline-none min-w-0"
                  />
                </div>
                <p className="text-[10px] text-[#9aa0a6] font-mono truncate">
                  Live path: /p/{sanitizedPreviewSlug}
                </p>
              </div>
            ) : (
              <div className="bg-[#131314] border border-[#2d2d30] rounded-xl p-2.5 flex items-center justify-between gap-2">
                <span className="text-xs font-mono text-emerald-300 truncate select-all">
                  /p/{project.publishedSlug}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={handleCopyLiveLink}
                    className="px-2.5 py-1.5 rounded-lg bg-[#2d2d30] hover:bg-[#3c4043] text-white text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenLiveSite(project.publishedSlug!)}
                    className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open</span>
                  </button>
                </div>
              </div>
            )}

            {publishFeedback && (
              <div className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5 pt-1">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{publishFeedback}</span>
              </div>
            )}
          </div>

          {/* Download Full Multi-File ZIP */}
          <div className="bg-[#131314] border border-[#2d2d30] rounded-2xl p-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0">
                <FolderArchive className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-white text-base">Full Project (ZIP)</h3>
                <p className="text-xs text-[#9aa0a6] mt-0.5 truncate">
                  Saves as <span className="font-mono text-purple-300 font-semibold">{getCleanFilename('zip')}</span>
                </p>
              </div>
            </div>
            <button
              onClick={handleDownloadZIP}
              disabled={isZipping}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold text-sm transition shadow-lg shadow-blue-600/30 flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isZipping ? 'Zipping...' : 'Download ZIP'}</span>
            </button>
          </div>

          {/* Download Standalone Single HTML File */}
          <div className="bg-[#131314] border border-[#2d2d30] rounded-2xl p-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
                <FileCode className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-white text-base">Standalone HTML File</h3>
                <p className="text-xs text-[#9aa0a6] mt-0.5 truncate">
                  Saves as <span className="font-mono text-blue-300 font-semibold">{getCleanFilename('html')}</span>
                </p>
              </div>
            </div>
            <button
              onClick={handleDownloadHTML}
              className="px-5 py-2.5 rounded-xl bg-[#2d2d30] hover:bg-[#3c4043] border border-[#3c4043] text-white font-semibold text-sm transition flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4 text-blue-400" />
              <span>Download HTML</span>
            </button>
          </div>

          {/* Copy Code */}
          <div className="bg-[#131314] border border-[#2d2d30] rounded-2xl p-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Copy className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-white text-base">Copy Code</h3>
                <p className="text-xs text-[#9aa0a6] mt-0.5">Copy complete standalone code bundle to clipboard</p>
              </div>
            </div>
            <button
              onClick={handleCopyCode}
              className="px-5 py-2.5 rounded-xl bg-[#2d2d30] hover:bg-[#3c4043] text-white font-semibold text-sm transition flex items-center gap-2 shrink-0 border border-[#3c4043] cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-gradient-to-r from-blue-950/40 via-purple-950/40 to-[#131314] border border-blue-500/20 rounded-2xl p-4 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-blue-400 shrink-0" />
            <p className="text-xs text-[#c4c7c5]">
              Exported files and your custom URL <strong className="text-white">/p/{project.publishedSlug || sanitizedPreviewSlug}</strong> use your Project Name cleanly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
