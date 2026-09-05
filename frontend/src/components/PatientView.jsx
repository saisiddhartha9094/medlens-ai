import React from "react";
import { 
  Heart, 
  ShieldCheck, 
  HelpCircle, 
  AlertTriangle, 
  MessageSquare, 
  Info, 
  CheckCircle,
  FileHeart,
  ChevronDown
} from "lucide-react";
import ProvenanceBadge from "./ProvenanceBadge";

export default function PatientView({ currentReport, patientContext }) {
  if (!currentReport) {
    return (
      <div className="p-12 text-center bg-slate-800/50 rounded-2xl border border-slate-700/60 max-w-2xl mx-auto my-12">
        <FileHeart className="w-12 h-12 text-slate-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white">No Report Selected</h3>
        <p className="text-sm text-slate-400 mt-1">Please select an ingested report to see your plain-language health summary.</p>
      </div>
    );
  }

  const summary = currentReport.patientSummary || {
    overview: "Your lab report has been processed and structured.",
    keyFindings: [],
    questionsForDoctor: [],
    disclaimer: "MedLens is an information intelligence tool. It does not diagnose illnesses."
  };

  const observations = currentReport.observations || [];
  const abnormalObs = observations.filter(o => o.flag === "HIGH" || o.flag === "LOW");
  const normalObs = observations.filter(o => o.flag === "NORMAL");

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Strict Ethical Guardrail / Non-Diagnostic Medical Device Disclaimer */}
      <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-4 flex items-start gap-3 text-amber-200">
        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <div className="font-semibold text-amber-300">MedLens Assistive Information Disclaimer</div>
          <p className="text-amber-200/90 leading-relaxed">
            MedLens is an AI-powered clinical information organization system designed to help you understand your laboratory records. 
            <strong> MedLens DOES NOT diagnose conditions, recommend medications, or replace the professional judgment of your physician.</strong> Always share this structured report with your doctor during your consultation.
          </p>
        </div>
      </div>

      {/* Patient Friendly Overview Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2.5 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <Heart className="w-4 h-4" />
          <span>Patient-Centric Health Summary</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">
          Understanding Your Report: {currentReport.documentTitle || currentReport.labName}
        </h2>
        <p className="text-slate-300 text-sm leading-relaxed mb-4">
          {summary.overview}
        </p>

        {/* Highlight Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              {observations.length}
            </div>
            <div>
              <div className="text-xs text-slate-400">Total Measurements</div>
              <div className="text-xs font-semibold text-slate-200">Organized into Record</div>
            </div>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              {normalObs.length}
            </div>
            <div>
              <div className="text-xs text-slate-400">Within Document Ranges</div>
              <div className="text-xs font-semibold text-emerald-300">Expected standard values</div>
            </div>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
              {abnormalObs.length}
            </div>
            <div>
              <div className="text-xs text-slate-400">Outside Printed Ranges</div>
              <div className="text-xs font-semibold text-rose-300">Discuss with your physician</div>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Self-Reported Clinical Context Integration */}
      {patientContext && (
        <div className="bg-slate-800/40 border border-slate-700/70 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Your Self-Reported Context (Grounded Record)</span>
            </div>
            <ProvenanceBadge type="PATIENT_ENTERED" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300 mt-2">
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block mb-0.5">Known Conditions:</span>
              <strong className="text-slate-200">{patientContext.chronicConditions?.join(", ") || "None"}</strong>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block mb-0.5">Current Medications:</span>
              <strong className="text-slate-200">{patientContext.currentMedications?.join("; ") || "None reported"}</strong>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block mb-0.5">Reported Allergies:</span>
              <strong className="text-rose-300">{patientContext.allergies?.join(", ") || "No known drug allergies"}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Parameters Outside Document Range - Plain Language Breakdown */}
      {summary.keyFindings && summary.keyFindings.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              Parameters to Discuss with Your Doctor
            </h3>
            <span className="text-xs text-slate-400">Plain-language explanations</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {summary.keyFindings.map((finding, idx) => (
              <div 
                key={idx} 
                className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-4.5 space-y-3 shadow-md hover:border-slate-600 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-white text-base">{finding.parameter}</h4>
                    <span className="text-xs text-slate-400">Document Range: {finding.referenceRange}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold mono px-2.5 py-1 rounded bg-slate-900 text-rose-400 border border-slate-700">
                      {finding.value}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                  {finding.plainExplanation}
                </p>

                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span className={`font-semibold ${finding.statusType === 'HIGH' ? 'text-rose-400' : 'text-blue-400'}`}>
                    {finding.status}
                  </span>
                  <span className="text-slate-500 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-slate-400" /> Non-diagnostic note
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Questions to Ask Your Doctor */}
      {summary.questionsForDoctor && summary.questionsForDoctor.length > 0 && (
        <div className="bg-blue-950/30 border border-blue-800/50 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
            <MessageSquare className="w-5 h-5" />
            <span>Recommended Questions for Your Healthcare Provider</span>
          </div>
          <p className="text-xs text-slate-300">
            Take these questions to your doctor's appointment to discuss what these laboratory values mean for your individual health:
          </p>
          <div className="space-y-2 pt-1">
            {summary.questionsForDoctor.map((q, idx) => (
              <div 
                key={idx}
                className="flex items-start gap-3 bg-slate-900/80 p-3 rounded-xl border border-blue-900/40 text-xs text-slate-200"
              >
                <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-300 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{q}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* In-Range Normal Values Collapsible List */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
            <CheckCircle className="w-4 h-4" />
            <span>Parameters Within Printed Lab Reference Intervals ({normalObs.length})</span>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {normalObs.map(obs => (
            <div key={obs.id} className="bg-slate-800/50 p-2.5 rounded-lg border border-slate-800 text-xs">
              <div className="font-medium text-slate-300 truncate" title={obs.testName}>
                {obs.testName}
              </div>
              <div className="text-emerald-400 font-mono font-bold mt-0.5">
                {obs.value} <span className="text-[10px] text-slate-400 font-normal">{obs.unit}</span>
              </div>
              <div className="text-[10px] text-slate-500 truncate mt-0.5">
                Range: {obs.referenceRange}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
