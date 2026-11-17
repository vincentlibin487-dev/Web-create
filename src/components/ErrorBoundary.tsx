import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error.message || 'An unexpected error occurred.',
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      let friendlyMessage = this.state.errorMessage;
      try {
        const parsed = JSON.parse(this.state.errorMessage);
        if (parsed.error) {
          friendlyMessage = parsed.error.includes('Quota exceeded')
            ? 'Daily free-tier Firestore quota exceeded. Quota resets tomorrow.'
            : `Database operation (${parsed.operationType}) failed: ${parsed.error}`;
        }
      } catch {
        // Non-JSON error message
      }

      return (
        <div className="min-h-screen bg-[#131314] text-[#e3e3e3] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#1e1e20] border border-[#3c4043] rounded-3xl p-8 text-center shadow-2xl space-y-5">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-white">Something went wrong</h2>
            <p className="text-xs text-[#9aa0a6] leading-relaxed break-words">
              {friendlyMessage}
            </p>
            <button
              onClick={this.handleReload}
              className="w-full py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
