import React from "react";
import { 
  Activity, 
  Stethoscope, 
  User, 
  FileSearch, 
  TrendingUp, 
  ShieldAlert, 
  FileCode, 
  PlusCircle,
  UserCheck
} from "lucide-react";

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  patient, 
  onOpenUpload, 
  onOpenFhir, 
  onOpenIntake 
}) {
  const navTabs = [
    { id: "clinician", label: "Clinician View", icon: Stethoscope },
    { id: "patient", label: "Patient View", icon: User },
    { id: "source", label: "Source Highlighter", icon: FileSearch },
    { id: "trends", label: "Biomarker Trends", icon: TrendingUp },
    { id: "playground", label: "Guardrail Playground", icon: ShieldAlert, badge: "SIH USP" },
  ];

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Product Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-teal-400 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-blue-400/30">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white">MedLens</span>
                <span className="text-[11px] font-semibold bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">
                  v1.0 • SIH
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">AI Clinical Information Intelligence</p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
            {navTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 relative ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                      isActive ? "bg-white/20 text-white" : "bg-teal-500/20 text-teal-400 border border-teal-500/30"
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Patient Context & Action Buttons */}
          <div className="flex items-center gap-2.5">
            {/* ABHA Badge */}
            {patient && (
              <button 
                onClick={onOpenIntake}
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-left transition group"
                title="View & Edit Patient Context"
              >
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <UserCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-slate-200 group-hover:text-white">
                    <span>{patient.fullName}</span>
                    <span className="text-[10px] text-slate-400">({patient.age}y/{patient.gender})</span>
                  </div>
                  <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    ABHA: {patient.abhaId}
                  </div>
                </div>
              </button>
            )}

            {/* FHIR Export Button */}
            <button
              onClick={onOpenFhir}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700/80 text-slate-200 border border-slate-700 transition shadow-sm"
              title="Export HL7 FHIR R4 Bundle"
            >
              <FileCode className="w-4 h-4 text-purple-400" />
              <span className="hidden sm:inline">FHIR R4</span>
            </button>

            {/* Ingest Document Button */}
            <button
              onClick={onOpenUpload}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white shadow-md shadow-blue-500/20 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Ingest Report</span>
            </button>
          </div>

        </div>

        {/* Mobile Nav Tabs */}
        <div className="md:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-800">
          {navTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-white bg-slate-800/40"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
}
