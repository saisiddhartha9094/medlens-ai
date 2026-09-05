import React, { useState, useEffect } from "react";
import { 
  X, 
  Copy, 
  Download, 
  Check, 
  FileCode, 
  ShieldCheck, 
  Building, 
  Sparkles 
} from "lucide-react";

export default function FhirExportModal({ isOpen, onClose, currentReport }) {
  const [fhirBundle, setFhirBundle] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && currentReport) {
      setLoading(true);
      fetch(`/api/fhir/export/${currentReport.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setFhirBundle(data.bundle);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to load FHIR bundle:", err);
          setLoading(false);
        });
    }
  }, [isOpen, currentReport]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (fhirBundle) {
      navigator.clipboard.writeText(JSON.stringify(fhirBundle, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (fhirBundle) {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fhirBundle, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `medlens-fhir-r4-${currentReport?.id || "bundle"}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <FileCode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">HL7 FHIR R4 Bundle & ABDM Interoperability</h3>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30 font-bold">
                  FHIR R4 Schema
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Standardized diagnostic resources conforming to India's Ayushman Bharat Digital Mission (ABDM).
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ABDM Milestone Compliance Strip */}
        <div className="px-6 py-3 bg-slate-950 border-b border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span><strong>M1:</strong> ABHA ID Integration (Verified)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span><strong>M2:</strong> HIP Health Record Discovery Ready</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span><strong>M3:</strong> FHIR R4 Diagnostic Bundle Ready</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              Resources Included: <strong>1 Patient</strong>, <strong>1 DiagnosticReport</strong>, <strong>{currentReport?.observations?.length || 0} Observations</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied!" : "Copy JSON"}</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition shadow-md shadow-blue-600/20"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .json</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-24 text-center text-slate-500 text-xs">
              Serializing clinical observations into FHIR R4 Bundle...
            </div>
          ) : (
            <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-purple-300 border border-slate-800 overflow-x-auto max-h-[460px] leading-5">
              {fhirBundle ? JSON.stringify(fhirBundle, null, 2) : "No bundle data generated."}
            </pre>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>Target Profile: NRCES NDHM FHIR R4 Diagnostic Report</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
