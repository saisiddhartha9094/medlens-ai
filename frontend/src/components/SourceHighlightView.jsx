import React, { useState, useEffect, useRef } from "react";
import { 
  FileSearch, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight,
  Eye,
  Tag
} from "lucide-react";
import ProvenanceBadge from "./ProvenanceBadge";

export default function SourceHighlightView({ currentReport, selectedObservation, onSelectObservation }) {
  const [activeObsId, setActiveObsId] = useState(selectedObservation?.id || null);
  const lineRefs = useRef({});
  const containerRef = useRef(null);

  const observations = currentReport?.observations || [];
  const rawLines = currentReport?.rawText ? currentReport.rawText.split("\n") : [];

  const activeObs = observations.find(o => o.id === activeObsId) || observations[0] || null;

  useEffect(() => {
    if (selectedObservation) {
      setActiveObsId(selectedObservation.id);
    }
  }, [selectedObservation]);

  // Auto-scroll source text viewer to matching line
  useEffect(() => {
    if (activeObs && activeObs.sourceLineNumber && lineRefs.current[activeObs.sourceLineNumber]) {
      lineRefs.current[activeObs.sourceLineNumber].scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  }, [activeObsId, activeObs]);

  if (!currentReport) {
    return (
      <div className="p-12 text-center bg-slate-800/50 rounded-2xl border border-slate-700/60 max-w-2xl mx-auto my-12">
        <FileSearch className="w-12 h-12 text-slate-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white">No Report Available</h3>
        <p className="text-sm text-slate-400 mt-1">Please select an ingested report to inspect source document grounding.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      
      {/* Top Banner explaining the feature */}
      <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Interactive Source Grounding & Traceability Inspector
              <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded border border-teal-500/30">
                100% Audit Trail
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any structured observation on the left to immediately locate and highlight its exact origin line in the source OCR text.
            </p>
          </div>
        </div>

        {activeObs && (
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700/80 text-xs">
            <span className="text-slate-400">Target Line:</span>
            <strong className="text-teal-400 mono">Line #{activeObs.sourceLineNumber || "N/A"}</strong>
          </div>
        )}
      </div>

      {/* Side-by-Side Dual Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[640px]">
        
        {/* Left Pane: Structured Clinical Observations (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col h-[680px] shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <span>Structured Observations ({observations.length})</span>
            </h4>
            <span className="text-[11px] text-slate-500">Click to trace</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1.5">
            {observations.map(obs => {
              const isSelected = activeObsId === obs.id;
              const isHigh = obs.flag === "HIGH";
              const isLow = obs.flag === "LOW";
              const isNormal = obs.flag === "NORMAL";
              const isUnverified = obs.flag === "UNVERIFIED" || obs.validationResult?.isValid === false;

              return (
                <div
                  key={obs.id}
                  onClick={() => {
                    setActiveObsId(obs.id);
                    if (onSelectObservation) onSelectObservation(obs);
                  }}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all duration-150 relative ${
                    isSelected
                      ? "bg-blue-950/50 border-blue-500 shadow-md ring-1 ring-blue-500/30"
                      : "bg-slate-800/40 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-semibold text-slate-200">
                      {obs.testName}
                    </div>
                    <span className={`font-mono font-bold text-xs ${
                      isHigh ? "text-rose-400" : isLow ? "text-blue-400" : "text-emerald-400"
                    }`}>
                      {obs.value} {obs.unit}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
                    <span className="mono truncate max-w-[180px]">
                      Ref: {obs.referenceRange}
                    </span>
                    <ProvenanceBadge 
                      type={obs.provenance} 
                      confidence={obs.confidence} 
                      showTooltip={false} 
                    />
                  </div>

                  {isSelected && (
                    <div className="mt-2 pt-2 border-t border-blue-900/60 flex items-center justify-between text-[11px] text-teal-400">
                      <span className="flex items-center gap-1 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Grounded at Line #{obs.sourceLineNumber}
                      </span>
                      <span className="flex items-center gap-1 text-slate-400">
                        View in Source <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Pane: Raw Document OCR Text with Highlighted Lines (7 cols) */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col h-[680px] shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Source Document OCR Stream
              </h4>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span>Encoding: UTF-8</span>
              <span>•</span>
              <span>Lines: {rawLines.length}</span>
            </div>
          </div>

          {/* Active Highlight Detail Pill */}
          {activeObs && (
            <div className="mb-3 bg-teal-950/40 border border-teal-600/50 rounded-lg p-2.5 flex items-center justify-between text-xs text-teal-200">
              <div className="flex items-center gap-2 truncate">
                <Tag className="w-4 h-4 text-teal-400 flex-shrink-0" />
                <span className="font-semibold text-white">{activeObs.testName}:</span>
                <span className="text-teal-300 truncate">
                  Matched Reference Range: <strong>"{activeObs.referenceRange}"</strong>
                </span>
              </div>
              <span className="mono text-[11px] bg-teal-900/60 px-2 py-0.5 rounded text-teal-200 border border-teal-700/60 whitespace-nowrap ml-2">
                Confidence: {Math.round((activeObs.confidence || 1) * 100)}%
              </span>
            </div>
          )}

          {/* Code/OCR viewer with line numbers */}
          <div 
            ref={containerRef}
            className="flex-1 overflow-y-auto bg-slate-900/90 rounded-lg border border-slate-800 p-3 font-mono text-xs leading-6"
          >
            {rawLines.map((line, idx) => {
              const lineNum = idx + 1;
              const isTargetLine = activeObs && activeObs.sourceLineNumber === lineNum;

              return (
                <div
                  key={idx}
                  ref={el => (lineRefs.current[lineNum] = el)}
                  className={`flex items-start gap-3 px-2 py-0.5 rounded transition-all duration-200 ${
                    isTargetLine
                      ? "bg-teal-950/80 text-teal-200 border-l-4 border-teal-400 shadow-lg ring-1 ring-teal-500/40 font-semibold"
                      : "hover:bg-slate-800/40 text-slate-400"
                  }`}
                >
                  <span className={`w-8 text-right select-none text-[11px] ${
                    isTargetLine ? "text-teal-400 font-bold" : "text-slate-600"
                  }`}>
                    {lineNum}
                  </span>
                  <span className={`flex-1 whitespace-pre-wrap ${
                    isTargetLine ? "text-white" : "text-slate-300"
                  }`}>
                    {line || " "}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
