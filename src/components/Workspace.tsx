import React, { useState, useEffect, useRef } from 'react';
import { 
  Monitor, Tablet, Smartphone, RefreshCw, Code2, Eye, MessageSquare, 
  Send, Sparkles, Terminal, Check, Copy, ExternalLink, Play 
} from 'lucide-react';
import { Project, DeviceMode, ActiveTab, ChatMessage } from '../types';

interface WorkspaceProps {
  project: Project;
  onUpdateProject: (updated: Partial<Project>) => void;
  onRefine: (prompt: string) => void;
  isRefining: boolean;
}

export const Workspace: React.FC<WorkspaceProps> = ({
  project,
  onUpdateProject,
  onRefine,
  isRefining,
}) => {
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  const [activeTab, setActiveTab] = useState<ActiveTab>('preview');
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: `I've created "${project.title}" for you! You can test it live in the preview, inspect or edit the code, or chat with me to make any changes.`,
      timestamp: Date.now()
    }
  ]);
  const [iframeKey, setIframeKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Editable code states
  const [htmlCode, setHtmlCode] = useState(project.html);
  const [cssCode, setCssCode] = useState(project.css);
  const [jsCode, setJsCode] = useState(project.js);

  useEffect(() => {
    setHtmlCode(project.html);
    setCssCode(project.css);
    setJsCode(project.js);
    setIframeKey(prev => prev + 1);
  }, [project]);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isRefining) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    const promptText = chatInput.trim();
    setChatInput('');

    onRefine(promptText);
  };

  const handleApplyCodeEdits = () => {
    const fullCode = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project.title}</title>
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <style>${cssCode}</style>
</head>
<body>
  ${htmlCode}
  <script>${jsCode}</script>
</body>
</html>`;

    onUpdateProject({
      html: htmlCode,
      css: cssCode,
      js: jsCode,
      fullCode,
      updatedAt: Date.now()
    });
    setIframeKey(prev => prev + 1);
  };

  const reloadIframe = () => {
    setIframeKey(prev => prev + 1);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-[#131314]">
      {/* Left Sidebar: AI Chat Assistant & Code Editor */}
      <div className="w-full lg:w-[420px] border-r border-[#2d2d30] bg-[#1e1e20] flex flex-col h-[45vh] lg:h-auto">
        {/* Sidebar Nav */}
        <div className="flex items-center justify-between px-4 border-b border-[#2d2d30] bg-[#1e1e20] shrink-0 h-12">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'chat' ? 'bg-blue-600 text-white shadow-md' : 'text-[#9aa0a6] hover:text-[#e3e3e3]'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>AI Assistant</span>
            </button>
            <button
              onClick={() => setActiveTab('html')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                ['html', 'css', 'js'].includes(activeTab) ? 'bg-blue-600 text-white shadow-md' : 'text-[#9aa0a6] hover:text-[#e3e3e3]'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Code Editor</span>
            </button>
          </div>
          <span className="text-[10px] text-[#9aa0a6] font-mono">Gemini 4</span>
        </div>

        {/* Tab Content: Chat Assistant */}
        {activeTab === 'chat' ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-xs shadow-md'
                        : 'bg-[#2d2d30] text-[#e3e3e3] border border-[#3c4043] rounded-tl-xs'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isRefining && (
                <div className="flex gap-3 items-center text-xs text-blue-400 animate-pulse p-2">
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  <span>Updating code with Gemini AI...</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSendChat} className="p-3 border-t border-[#2d2d30] bg-[#1e1e20] flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask AI to change styling, add features..."
                disabled={isRefining}
                className="flex-1 bg-[#131314] border border-[#3c4043] rounded-xl px-3.5 py-2 text-xs text-[#e3e3e3] placeholder-[#9aa0a6] focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={isRefining || !chatInput.trim()}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white p-2.5 rounded-xl transition shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          /* Tab Content: Code Editor */
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center gap-1 px-3 py-2 bg-[#1e1e20] border-b border-[#2d2d30] shrink-0">
              <button
                onClick={() => setActiveTab('html')}
                className={`px-3 py-1 rounded-md text-xs font-mono font-medium transition ${activeTab === 'html' ? 'bg-[#2d2d30] text-blue-400 border border-[#3c4043]' : 'text-[#9aa0a6] hover:text-[#e3e3e3]'}`}
              >
                index.html
              </button>
              <button
                onClick={() => setActiveTab('css')}
                className={`px-3 py-1 rounded-md text-xs font-mono font-medium transition ${activeTab === 'css' ? 'bg-[#2d2d30] text-blue-400 border border-[#3c4043]' : 'text-[#9aa0a6] hover:text-[#e3e3e3]'}`}
              >
                styles.css
              </button>
              <button
                onClick={() => setActiveTab('js')}
                className={`px-3 py-1 rounded-md text-xs font-mono font-medium transition ${activeTab === 'js' ? 'bg-[#2d2d30] text-blue-400 border border-[#3c4043]' : 'text-[#9aa0a6] hover:text-[#e3e3e3]'}`}
              >
                script.js
              </button>
            </div>

            <div className="flex-1 relative overflow-hidden flex flex-col">
              {activeTab === 'html' && (
                <textarea
                  value={htmlCode}
                  onChange={(e) => setHtmlCode(e.target.value)}
                  className="flex-1 w-full bg-[#131314] text-[#e3e3e3] font-mono text-xs p-4 focus:outline-none resize-none leading-relaxed"
                  placeholder="HTML markup..."
                />
              )}
              {activeTab === 'css' && (
                <textarea
                  value={cssCode}
                  onChange={(e) => setCssCode(e.target.value)}
                  className="flex-1 w-full bg-[#131314] text-[#e3e3e3] font-mono text-xs p-4 focus:outline-none resize-none leading-relaxed"
                  placeholder="Custom CSS..."
                />
              )}
              {activeTab === 'js' && (
                <textarea
                  value={jsCode}
                  onChange={(e) => setJsCode(e.target.value)}
                  className="flex-1 w-full bg-[#131314] text-[#e3e3e3] font-mono text-xs p-4 focus:outline-none resize-none leading-relaxed"
                  placeholder="JavaScript logic..."
                />
              )}
            </div>

            <div className="p-3 border-t border-[#2d2d30] bg-[#1e1e20] flex items-center justify-between shrink-0">
              <span className="text-[10px] text-[#9aa0a6]">Edits update preview instantly</span>
              <button
                onClick={handleApplyCodeEdits}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shadow-md flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Apply Changes</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Area: Live Interactive Preview */}
      <div className="flex-1 flex flex-col bg-[#131314] overflow-hidden">
        {/* Preview Toolbar */}
        <div className="h-12 border-b border-[#2d2d30] bg-[#1e1e20] px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'preview' ? 'bg-blue-600 text-white shadow-md' : 'text-[#9aa0a6] hover:text-[#e3e3e3]'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Live Preview</span>
            </button>
          </div>

          {/* Device Toggles */}
          <div className="flex items-center gap-1 bg-[#131314] p-1 rounded-xl border border-[#3c4043]">
            <button
              onClick={() => setDeviceMode('desktop')}
              className={`p-1.5 rounded-lg transition ${deviceMode === 'desktop' ? 'bg-blue-600 text-white shadow-xs' : 'text-[#9aa0a6] hover:text-[#e3e3e3]'}`}
              title="Desktop View"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDeviceMode('tablet')}
              className={`p-1.5 rounded-lg transition ${deviceMode === 'tablet' ? 'bg-blue-600 text-white shadow-xs' : 'text-[#9aa0a6] hover:text-[#e3e3e3]'}`}
              title="Tablet View"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDeviceMode('mobile')}
              className={`p-1.5 rounded-lg transition ${deviceMode === 'mobile' ? 'bg-blue-600 text-white shadow-xs' : 'text-[#9aa0a6] hover:text-[#e3e3e3]'}`}
              title="Mobile View"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={reloadIframe}
              className="p-2 rounded-xl bg-[#2d2d30] hover:bg-[#3c4043] text-[#e3e3e3] transition"
              title="Reload Preview"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Iframe Container */}
        <div className="flex-1 flex items-center justify-center p-2 sm:p-6 bg-[#131314] overflow-auto">
          <div 
            className={`transition-all duration-300 bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#2d2d30] flex flex-col ${
              deviceMode === 'desktop' ? 'w-full h-full' :
              deviceMode === 'tablet' ? 'w-[768px] h-[85vh]' : 'w-[375px] h-[80vh]'
            }`}
          >
            <div className="h-9 bg-[#1e1e20] border-b border-[#2d2d30] px-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
              </div>
              <div className="bg-[#131314] px-4 py-1 rounded-md text-[11px] font-mono text-[#9aa0a6] truncate max-w-xs">
                https://aistudio.google.com/preview/{project.id}
              </div>
              <div className="w-12"></div>
            </div>
            <iframe
              key={iframeKey}
              ref={iframeRef}
              srcDoc={project.fullCode}
              title={project.title}
              sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
              className="w-full flex-1 border-0 bg-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
