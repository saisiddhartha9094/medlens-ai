import React, { useState } from "react";
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Code, 
  RefreshCw, 
  Info 
} from "lucide-react";
import ProvenanceBadge from "./ProvenanceBadge";
import apiFetch from "../utils/api";

export default function GuardrailPlayground() {
  const PRESETS = [
    {
      id: "verified",
      title: "1. Verified Grounding (Truthful Range)",
      badge: "Grounded",
      badgeColor: "bg-emerald-950 text-emerald-400 border-emerald-800",
      description: "Range exists verbatim in the source OCR text. Engine verifies grounding and marks as AI_EXTRACTED_VERIFIED.",
      testName: "HAEMOGLOBIN",
      observedValue: "11.8",
      referenceRange: "13.0 - 17.0",
      sourceOcrText: `DR. LAL PATHLABS LTD.
TEST NAME                    VALUE     UNIT        REFERENCE RANGE
HAEMOGLOBIN                   11.8     g/dL        13.0 - 17.0
RBC COUNT                     4.10     mill/cumm   4.50 - 5.50`
    },
    {
      id: "hallucination",
      title: "2. The LLM Hallucination Trap (Invented Numbers)",
      badge: "Hallucination Injected",
      badgeColor: "bg-rose-950 text-rose-400 border-rose-800",
      description: "Simulates an LLM inventing a fake reference range (10.0 - 12.0) not present in the report. MedLens intercepts and blocks the hallucination.",
      testName: "HAEMOGLOBIN",
      observedValue: "11.8",
      referenceRange: "10.0 - 12.0",
      sourceOcrText: `DR. LAL PATHLABS LTD.
TEST NAME                    VALUE     UNIT        REFERENCE RANGE
HAEMOGLOBIN                   11.8     g/dL        13.0 - 17.0
RBC COUNT                     4.10     mill/cumm   4.50 - 5.50`
    },
    {
      id: "absent",
      title: "3. Missing Range in Source (Refusal to Invent)",
      badge: "Source Omission",
      badgeColor: "bg-amber-950 text-amber-400 border-amber-800",
      description: "Report does not have an established biological range. MedLens refuses to invent one and marks for manual review.",
      testName: "EXPERIMENTAL CYTOKINE IL-6",
      observedValue: "18.5",
      referenceRange: "Pending clinical trial standardization",
      sourceOcrText: `APEX SPECIALTY PATHLAB
TEST INVESTIGATION           VALUE     UNIT        REFERENCE INTERVAL
EXPERIMENTAL CYTOKINE IL-6   18.5      pg/mL       (Reference interval pending clinical trial standardization)
NOTICE: Range has not been established for this demographic batch.`
    }
  ];

  const [selectedPreset, setSelectedPreset] = useState(PRESETS[1]);
  const [testName, setTestName] = useState(PRESETS[1].testName);
  const [observedValue, setObservedValue] = useState(PRESETS[1].observedValue);
  const [referenceRange, setReferenceRange] = useState(PRESETS[1].referenceRange);
  const [sourceOcrText, setSourceOcrText] = useState(PRESETS[1].sourceOcrText);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showRawJson, setShowRawJson] = useState(false);

  const applyPreset = (preset) => {
    setSelectedPreset(preset);
    setTestName(preset.testName);
    setObservedValue(preset.observedValue);
    setReferenceRange(preset.referenceRange);
    setSourceOcrText(preset.sourceOcrText);
    setResult(null);
  };

  const handleRunAudit = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await apiFetch("/api/validator/verify-range", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testName,
          observedValue,
          referenceRange,
          sourceOcrText
        })
      });
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error("Validator request failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* SIH Innovation Banner */}
      <div className="bg-gradient-to-r from-rose-950/40 via-purple-950/30 to-blue-950/40 border border-purple-800/40 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">Live Anti-Hallucination Guardrail Playground</h2>
              <span className="text-xs bg-rose-500/20 text-rose-400 px-2.5 py-0.5 rounded-full border border-rose-500/30 font-bold uppercase tracking-wide">
                SIH Core Differentiator
              </span>
            </div>
            <p className="text-slate-300 text-xs mt-1 max-w-3xl leading-relaxed">
              Standard AI chatbots routinely "invent" medical reference ranges from pre-training memory when reading lab documents. 
              <strong> MedLens implements a zero-hallucination verification layer:</strong> every reference range must be physically grounded in the source OCR text. If an LLM fabricates a range, MedLens intercepts it and prevents premature clinical flags.
            </p>
          </div>
        </div>

        {/* Preset Selection Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5">
          {PRESETS.map(preset => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset)}
              className={`p-3.5 rounded-xl border text-left transition-all relative ${
                selectedPreset.id === preset.id
                  ? "bg-slate-900 border-blue-500 shadow-md ring-1 ring-blue-500/40"
                  : "bg-slate-900/60 hover:bg-slate-900 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="font-semibold text-xs text-white">{preset.title}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded border font-mono ${preset.badgeColor}`}>
                  {preset.badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                {preset.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Audit Input & Verification Testbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Input Parameters (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Testbench Parameters
            </h3>
            <span className="text-[11px] text-slate-500">Edit or use preset</span>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Biomarker Investigation Name
            </label>
            <input
              type="text"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Observed Value
              </label>
              <input
                type="text"
                value={observedValue}
                onChange={(e) => setObservedValue(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Claimed Range (LLM Extracted)
              </label>
              <input
                type="text"
                value={referenceRange}
                onChange={(e) => setReferenceRange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Source Document OCR Text Stream
            </label>
            <textarea
              rows={7}
              value={sourceOcrText}
              onChange={(e) => setSourceOcrText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-300 font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none leading-5"
            />
          </div>

          <button
            onClick={handleRunAudit}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-98 transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Running Algorithmic Audit...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Execute Anti-Hallucination Audit</span>
              </>
            )}
          </button>
        </div>

        {/* Verification Result Inspector (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-lg">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <span>Guardrail Verdict & Audit Telemetry</span>
              </h3>
              {result && (
                <button
                  onClick={() => setShowRawJson(!showRawJson)}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-2 py-1 rounded"
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>{showRawJson ? "Visual View" : "Raw JSON"}</span>
                </button>
              )}
            </div>

            {!result && !loading && (
              <div className="py-24 text-center space-y-3">
                <ShieldAlert className="w-12 h-12 text-slate-600 mx-auto" />
                <h4 className="text-sm font-semibold text-slate-300">Awaiting Verification Run</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click "Execute Anti-Hallucination Audit" to test if the claimed reference range is physically grounded in the source text.
                </p>
              </div>
            )}

            {result && !showRawJson && (
              <div className="space-y-4 animate-in fade-in duration-200">
                
                {/* Result Hero Banner */}
                <div 
                  role="status"
                  aria-live="polite"
                  className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                  result.validation.isValid
                    ? "bg-emerald-950/60 border-emerald-500/70 text-emerald-200"
                    : result.validation.isHallucinated
                      ? "bg-rose-950/70 border-rose-500/80 text-rose-200 animate-pulse"
                      : "bg-amber-950/60 border-amber-500/70 text-amber-200"
                }`}>
                  {result.validation.isValid ? (
                    <ShieldCheck className="w-7 h-7 text-emerald-400 flex-shrink-0 mt-0.5" />
                  ) : result.validation.isHallucinated ? (
                    <XCircle className="w-7 h-7 text-rose-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-7 h-7 text-amber-400 flex-shrink-0 mt-0.5" />
                  )}

                  <div className="space-y-1">
                    <div className="text-sm font-bold tracking-tight">
                      {result.verdict}
                    </div>
                    <div className="text-xs opacity-90 leading-relaxed">
                      {result.validation.reason}
                    </div>
                  </div>
                </div>

                {/* Audit Telemetry Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Audit Status:</span>
                    <strong className="mono text-white text-xs mt-0.5 block">{result.validation.status}</strong>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Grounding Confidence:</span>
                    <strong className="mono text-teal-400 text-xs mt-0.5 block">
                      {Math.round(result.validation.confidence * 100)}%
                    </strong>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Assigned Provenance:</span>
                    <div className="mt-1">
                      <ProvenanceBadge type={result.validation.provenance} showTooltip={false} />
                    </div>
                  </div>
                </div>

                {/* Match Type & Snippet */}
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Algorithm Grounding Method:</span>
                    <strong className="mono text-slate-200">{result.validation.matchType || "GROUNDING_FAILED"}</strong>
                  </div>

                  {result.validation.matchSnippet ? (
                    <div>
                      <span className="text-slate-400 block mb-1 text-[11px]">Source Grounding Snippet:</span>
                      <div className="bg-slate-900 p-2 rounded text-teal-300 font-mono text-xs border border-teal-900">
                        {result.validation.matchSnippet}
                      </div>
                    </div>
                  ) : (
                    <div className="text-rose-400 text-xs flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>No valid substring or numeric token window exists in the source OCR text.</span>
                    </div>
                  )}
                </div>

                {/* Clinical Evaluation Behavior (Safe Refusal Demonstration) */}
                <div className="bg-slate-800/60 p-3.5 rounded-lg border border-slate-700/80 space-y-1.5 text-xs">
                  <span className="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">
                    Downstream Clinical Flagging Engine Behavior:
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-300">Flag Assigned:</span>
                    <span className={`px-2 py-0.5 rounded font-bold mono ${
                      result.evaluation.flag === "NORMAL" ? "bg-emerald-950 text-emerald-400" :
                      result.evaluation.flag === "HIGH" ? "bg-rose-950 text-rose-400" :
                      result.evaluation.flag === "LOW" ? "bg-blue-950 text-blue-400" :
                      "bg-amber-950 text-amber-400 border border-amber-800"
                    }`}>
                      {result.evaluation.flag} ({result.evaluation.label})
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Note: {result.evaluation.note}
                  </p>
                </div>

              </div>
            )}

            {result && showRawJson && (
              <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-teal-300 border border-slate-800 overflow-x-auto max-h-[460px]">
                {JSON.stringify(result, null, 2)}
              </pre>
            )}
          </div>

          <div className="text-[11px] text-slate-500 pt-4 border-t border-slate-800 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span>MedLens anti-hallucination verification operates deterministically using verbatim substring matching, numeric boundary containment, and contextual Levenshtein distance.</span>
          </div>
        </div>

      </div>

    </div>
  );
}
