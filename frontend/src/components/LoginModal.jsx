import React, { useState, useEffect } from "react";
import { X, Lock, Stethoscope, User, ShieldCheck, LogIn, AlertCircle } from "lucide-react";
import apiFetch from "../utils/api";

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [email, setEmail] = useState("doctor@medlens.health");
  const [password, setPassword] = useState("MedLensDoctor2026!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Keyboard Escape Handler for WCAG AA
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await apiFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (data.success && data.token) {
        localStorage.setItem("medlens_jwt", data.token);
        onLoginSuccess(data.user, data.token);
        onClose();
      } else {
        setError(data.error || "Authentication failed.");
      }
    } catch (err) {
      setError("Network or server connection error.");
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (role) => {
    if (role === "CLINICIAN") {
      setEmail("doctor@medlens.health");
      setPassword("MedLensDoctor2026!");
    } else {
      setEmail("patient@medlens.health");
      setPassword("MedLensPatient2026!");
    }
    setError("");
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
    >
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 id="login-modal-title" className="text-base font-bold text-white">Clinical Authentication</h3>
              <p className="text-xs text-slate-400">Role-Based Access Control (RBAC)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close login dialog"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1-Click Role Switcher for Hackathon Judges */}
        <div className="px-6 pt-4 pb-2 bg-slate-950/40 border-b border-slate-800 space-y-2">
          <span className="text-[11px] text-slate-400 font-semibold block uppercase tracking-wider">
            Demo Credentials (1-Click Fill):
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillCredentials("CLINICIAN")}
              className={`flex items-center justify-center gap-1.5 p-2 rounded-lg text-xs font-semibold border transition ${
                email.includes("doctor")
                  ? "bg-blue-950/70 border-blue-500 text-blue-300"
                  : "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200"
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5 text-blue-400" />
              <span>Clinician (Doctor)</span>
            </button>

            <button
              type="button"
              onClick={() => fillCredentials("PATIENT")}
              className={`flex items-center justify-center gap-1.5 p-2 rounded-lg text-xs font-semibold border transition ${
                email.includes("patient")
                  ? "bg-emerald-950/70 border-emerald-500 text-emerald-300"
                  : "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200"
              }`}
            >
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span>Patient (Self)</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleLogin} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="auth-email-input" className="text-xs font-semibold text-slate-300 block mb-1">
              Registered Medical Email
            </label>
            <input
              id="auth-email-input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="auth-password-input" className="text-xs font-semibold text-slate-300 block mb-1">
              Access Password
            </label>
            <input
              id="auth-password-input"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? "Authenticating..." : "Sign In to MedLens"}</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-500 text-center pt-2">
            Clinician role unlocks human-in-the-loop field editing with 🟣 HUMAN_CORRECTED provenance.
          </div>
        </form>

      </div>
    </div>
  );
}
