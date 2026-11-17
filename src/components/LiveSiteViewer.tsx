import React, { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { PublishedSite } from '../types';
import { AlertTriangle, ArrowLeft, Home, Sparkles } from 'lucide-react';
import { withSafeIframeNavigation } from '../utils/slugHelper';

interface LiveSiteViewerProps {
  siteId: string;
  onBackToStudio?: () => void;
}

export const LiveSiteViewer: React.FC<LiveSiteViewerProps> = ({ siteId, onBackToStudio }) => {
  const [site, setSite] = useState<PublishedSite | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const isValidSlug = /^[a-zA-Z0-9_\-]+$/.test(siteId) && siteId.length <= 128;

  useEffect(() => {
    if (!isValidSlug) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    const docPath = `published_sites/${siteId}`;
    const unsub = onSnapshot(
      doc(db, 'published_sites', siteId),
      (snapshot) => {
        if (!snapshot.exists()) {
          setSite(null);
          setNotFound(true);
        } else {
          const data = snapshot.data() as PublishedSite;
          setSite(data);
          setNotFound(false);
          if (data.title) {
            document.title = data.title;
          }
        }
        setLoading(false);
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, docPath);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [siteId, isValidSlug]);

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#131314] text-[#e3e3e3] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-[#9aa0a6]">Loading live site...</span>
      </div>
    );
  }

  if (notFound || !site) {
    return (
      <div className="min-h-[100dvh] bg-[#131314] text-[#e3e3e3] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#1e1e20] border border-[#3c4043] rounded-3xl p-8 text-center shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Live Site Not Found</h1>
          <p className="text-xs text-[#9aa0a6] mb-6 leading-relaxed">
            The published website at <span className="font-mono text-white">/p/{siteId}</span> does not exist or has not been published yet.
          </p>
          {onBackToStudio ? (
            <button
              type="button"
              onClick={onBackToStudio}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-semibold transition cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Back to Build Studio</span>
            </button>
          ) : (
            <a
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-semibold transition"
            >
              <Home className="w-4 h-4" />
              <span>Open Build Studio</span>
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-[100dvh] bg-white overflow-hidden relative">
      <iframe
        key={`live-${site.siteId}-${site.version}`}
        srcDoc={withSafeIframeNavigation(site.fullCode)}
        title={site.title}
        sandbox="allow-scripts allow-modals allow-forms allow-same-origin allow-popups"
        className="w-full h-full border-0 block bg-white"
      />
      {onBackToStudio ? (
        <button
          type="button"
          onClick={onBackToStudio}
          className="fixed bottom-3 right-3 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#131314]/90 hover:bg-[#131314] text-white border border-white/15 backdrop-blur-md text-[11px] font-semibold shadow-lg transition cursor-pointer"
          title="Back to Build Studio Editor"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-blue-400" />
          <span>Back to Studio • /p/{site.siteId} (v{site.version || 1})</span>
        </button>
      ) : (
        <a
          href="/"
          className="fixed bottom-3 right-3 z-50 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#131314]/85 hover:bg-[#131314] text-white/90 hover:text-white border border-white/15 backdrop-blur-md text-[10px] font-semibold shadow-lg transition"
          title="Built with Build Studio"
        >
          <Sparkles className="w-3 h-3 text-blue-400" />
          <span>Build Studio • v{site.version || 1}</span>
        </a>
      )}
    </div>
  );
};
