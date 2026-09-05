import React, { useState, useEffect } from "react";
import { X, Edit3, Save, ShieldCheck, AlertCircle } from "lucide-react";
import ProvenanceBadge from "./ProvenanceBadge";

export default function EditObservationModal({ 
  isOpen, 
  onClose, 
  observation, 
  reportId, 
  onObservationUpdated,
  onClinicianAuthenticated
}) {
  const [value, setValue] = useState(observation?.value || "");
  const [referenceRange, setReferenceRange] = useState(observation?.referenceRange || "");
  const [flag, setFlag] = useState(observation?.flag || "NORMAL");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (observation) {
      setValue(observation.value || "");
      setReferenceRange(observation.referenceRange || "");
      setFlag(observation.flag || "NORMAL");
    }
  }, [observation]);

  // Keyboard Escape Handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !observation) return null;

  const quickDoctorLogin = async () => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "doctor@medlens.health",
          password: "MedLensDoctor2026!"
        })
      });
      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem("medlens_jwt", data.token);
        if (onClinicianAuthenticated) onClinicianAuthenticated(data.user);
        setError("");
      } else {
        setError("Clinician quick login failed.");
      }
    } catch (err) {
      setError("Clinician login connection error.");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const token = localStorage.getItem("medlens_jwt");
      const res = await fetch(`/api/reports/${reportId}/observations/${observation.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ value, referenceRange, flag })
      });
      const data = await res.json();

      if (data.success && data.observation) {
        onObservationUpdated(data.observation);
        onClose();
      } else {
        setError(data.error || "Failed to save observation update.");
      }
    } catch (err) {
      setError("Network or server connection error.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-obs-modal-title"
    >
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="edit-obs-modal-title" className="text-base font-bold text-white">
                  Human-in-the-Loop Clinical Verification
                </h3>
                <ProvenanceBadge type="HUMAN_CORRECTED" showTooltip={false} />
              </div>
              <p className="text-xs text-slate-400">
                Correct AI extraction and stamp record with Human-Corrected provenance.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close edit dialog"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={quickDoctorLogin}
                className="w-full py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[11px] font-bold shadow transition"
              >
                1-Click Sign In as Clinician (Dr. Arvind Mehta, MD)
              </button>
            </div>
          )}

          <div>
            <span className="text-xs text-slate-400 block mb-0.5">Investigation:</span>
            <strong className="text-sm text-white font-semibold block">{observation.testName}</strong>
            <span className="text-[11px] text-blue-400 mono">LOINC: {observation.loincCode}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="edit-obs-value" className="text-xs font-semibold text-slate-300 block mb-1">
                Observed Value ({observation.unit})
              </label>
              <input
                id="edit-obs-value"
                type="text"
                required
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="edit-obs-range" className="text-xs font-semibold text-slate-300 block mb-1">
                Biological Reference Range
              </label>
              <input
                id="edit-obs-range"
                type="text"
                required
                value={referenceRange}
                onChange={(e) => setReferenceRange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="edit-obs-flag" className="text-xs font-semibold text-slate-300 block mb-1">
              Clinical Abnormality Status
            </label>
            <select
              id="edit-obs-flag"
              value={flag}
              onChange={(e) => setFlag(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
            >
              <option value="NORMAL">Normal (Within Reference Interval)</option>
              <option value="HIGH">High (Above Reference Interval)</option>
              <option value="LOW">Low (Below Reference Interval)</option>
              <option value="UNVERIFIED">Review Required / Inconclusive</option>
            </select>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Audit action will be stamped to active user profile.</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/20 active:scale-95 transition disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? "Saving..." : "Apply Human Correction"}</span>
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}
