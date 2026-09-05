import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[MedLens Crash Guard] Caught component error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0b0f19] text-white flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-rose-800/80 rounded-2xl p-8 max-w-lg w-full text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 bg-rose-950/80 border border-rose-600/60 rounded-2xl flex items-center justify-center mx-auto text-rose-400">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold">MedLens Safety Boundary Triggered</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              An unexpected UI component error was safely intercepted to prevent application crash.
            </p>
            <div className="bg-slate-950 p-3 rounded-lg text-left text-xs font-mono text-rose-300 border border-slate-800 overflow-x-auto">
              {this.state.error?.message || "Unknown rendering exception"}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload MedLens Application</span>
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
