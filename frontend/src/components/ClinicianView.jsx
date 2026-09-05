import React, { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  AlertCircle, 
  AlertTriangle,
  CheckCircle2, 
  HelpCircle, 
  ExternalLink, 
  FileText,
  Calendar,
  Building2,
  ChevronRight,
  Edit3,
  Pill,
  Zap,
  TrendingUp,
  TrendingDown,
  CalendarClock,
  ShieldAlert
} from "lucide-react";
import ProvenanceBadge from "./ProvenanceBadge";

export default function ClinicianView({ 
  currentReport, 
  reportsList, 
  onSelectReport, 
  onInspectInSource,
  onEditObservation,
  currentUser
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL"); // ALL, ABNORMAL, IN_RANGE, UNVERIFIED
  const [dliInteractions, setDliInteractions] = useState([]);
  const [velocities, setVelocities] = useState([]);
  const [careGaps, setCareGaps] = useState(null);

  useEffect(() => {
    fetch("/api/intake/dli")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.interactions) {
          setDliInteractions(data.interactions);
        }
      })
      .catch(err => console.warn("Failed to load DLI:", err));

    fetch("/api/trends")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const list = Array.isArray(data.velocitiesList) 
            ? data.velocitiesList 
            : Array.isArray(data.velocities) 
            ? data.velocities 
            : Object.values(data.velocities || {});
          setVelocities(list);
        }
      })
      .catch(err => console.warn("Failed to load velocities:", err));

    fetch("/api/intake/care-gaps")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.evaluation) {
          setCareGaps(data.evaluation);
        }
      })
      .catch(err => console.warn("Failed to load care gaps:", err));
  }, [currentReport]);

  if (!currentReport) {
    return (
      <div className="p-8 sm:p-12 text-center bg-slate-800/50 rounded-2xl border border-slate-700/60 max-w-2xl mx-auto my-12 space-y-4">
        <FileText className="w-12 h-12 text-blue-400 mx-auto" />
        <div>
          <h3 className="text-lg font-bold text-white">Select a Diagnostic Report</h3>
          <p className="text-xs text-slate-400 mt-1">
            Choose one of the ingested reports below to inspect its structured LOINC observations:
          </p>
        </div>

        {reportsList && reportsList.length > 0 ? (
          <div className="space-y-2 pt-2 text-left">
            {reportsList.map(r => (
              <button
                key={r.id}
                onClick={() => onSelectReport(r.id)}
                className="w-full p-3 bg-slate-900/80 hover:bg-slate-900 border border-slate-700/80 hover:border-blue-500 rounded-xl flex items-center justify-between transition group"
              >
                <div>
                  <div className="font-semibold text-xs text-slate-200 group-hover:text-blue-400">
                    {r.documentTitle || r.labName}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Date: {r.testDate} • {r.observationsCount} Observations
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition" />
              </button>
            ))}
          </div>
        ) : (
          <div className="text-xs text-slate-500 pt-2">
            No reports ingested yet. Click "Ingest Report" above to start.
          </div>
        )}
      </div>
    );
  }

  const observations = currentReport.observations || [];
  const deltas = currentReport.longitudinalDeltas || [];

  // Filter observations
  const filteredObservations = observations.filter(obs => {
    const matchesSearch = 
      obs.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (obs.loincCode && obs.loincCode.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterType === "ABNORMAL") {
      return obs.flag === "HIGH" || obs.flag === "LOW" || obs.flag === "ABNORMAL";
    }
    if (filterType === "IN_RANGE") {
      return obs.flag === "NORMAL";
    }
    if (filterType === "UNVERIFIED") {
      return obs.flag === "UNVERIFIED" || obs.validationResult?.isValid === false;
    }
    return true;
  });

  const abnormalCount = observations.filter(o => o.flag === "HIGH" || o.flag === "LOW" || o.flag === "ABNORMAL").length;
  const normalCount = observations.filter(o => o.flag === "NORMAL").length;
  const unverifiedCount = observations.filter(o => o.validationResult?.isValid === false).length;
  const verifiedRate = observations.length > 0 
    ? Math.round(((observations.length - unverifiedCount) / observations.length) * 100) 
    : 100;

  return (
    <div className="space-y-6">
      
      {/* Top Controls & Report Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-800/40 p-4 rounded-xl border border-slate-700/70">
        
        {/* Active Report Header */}
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-white">{currentReport.documentTitle || currentReport.labName}</h2>
              <span className="text-[11px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded font-medium">
                {currentReport.category || "Clinical Diagnostic"}
              </span>
              <span className="text-[10px] mono bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-800">
                ⚡ {currentReport.extractionEngine || "Grounded NLP"} • {currentReport.processingTimeMs || 120}ms
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Sample Date: <strong className="text-slate-200">{currentReport.testDate}</strong>
              </span>
              <span>•</span>
              <span>Patient: <strong className="text-slate-200">{currentReport.patientName}</strong></span>
              <span>•</span>
              <span>Facility: <strong className="text-slate-200">{currentReport.labName}</strong></span>
            </div>
          </div>
        </div>

        {/* Report Selector Dropdown (if multiple reports exist) */}
        {reportsList && reportsList.length > 1 && (
          <div className="flex items-center gap-2">
            <label htmlFor="report-switcher-select" className="text-xs text-slate-400 font-medium whitespace-nowrap">
              Switch Report:
            </label>
            <select
              id="report-switcher-select"
              value={currentReport.id}
              onChange={(e) => onSelectReport(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-[260px] truncate"
            >
              {reportsList.map(r => (
                <option key={r.id} value={r.id}>
                  {r.testDate} — {r.documentTitle || r.labName}
                </option>
              ))}
            </select>
          </div>
        )}

      </div>

      {/* Drug-Lab Interaction (DLI) Warning Banner */}
      {dliInteractions.length > 0 && (
        <div className="bg-rose-950/40 border border-rose-600/60 rounded-xl p-4 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-rose-400 font-bold text-sm">
              <Pill className="w-5 h-5 text-rose-400 animate-pulse" />
              <span>Critical Drug-Lab Interactions Flagged ({dliInteractions.length})</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-900/60 text-rose-200 px-2.5 py-1 rounded border border-rose-700">
              Clinical Decision Support
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {dliInteractions.map((item, idx) => (
              <div key={idx} className="bg-slate-900/90 border border-rose-900/60 p-3 rounded-lg space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-rose-300 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    {(item.matchedMedication || item.drugKeyword || "").toUpperCase()} ↔ {item.testName}
                  </span>
                  <span className="text-[10px] mono bg-rose-950 px-2 py-0.5 rounded text-rose-300 font-bold">
                    {item.observedValue ?? item.observationValue} {item.unit}
                  </span>
                </div>
                <p className="text-xs text-slate-200 font-medium leading-snug">
                  {item.alert}
                </p>
                <div className="text-[11px] text-slate-400">
                  <strong>Mechanism:</strong> {item.mechanism || item.clinicalMechanism}
                </div>
                <div className="text-[11px] text-amber-300/90 bg-amber-950/40 p-1.5 rounded border border-amber-900/40">
                  <strong>Action:</strong> {item.recommendation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Care Gaps Summary Notification */}
      {careGaps && careGaps.careGaps && careGaps.careGaps.some(g => g.status === "OVERDUE" || g.status === "DUE_NOW") && (
        <div className="bg-purple-950/30 border border-purple-800/50 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs shadow-md">
          <div className="flex items-center gap-2 text-purple-300">
            <CalendarClock className="w-4 h-4 text-purple-400 shrink-0" />
            <span>
              <strong>Care Gaps / Screening:</strong> {careGaps.careGaps.filter(g => g.status === "OVERDUE").length} overdue, {careGaps.careGaps.filter(g => g.status === "DUE_NOW").length} due now (Adherence: {careGaps.adherenceScore}%)
            </span>
          </div>
          <span className="text-[10px] text-purple-400 bg-purple-900/40 px-2 py-0.5 rounded border border-purple-700">
            ADA / USPSTF / KDIGO Guidelines
          </span>
        </div>
      )}

      {/* Cross-Visit Inconsistency / Delta Notification Strip (PS Alignment) */}
      {deltas.length > 0 && (
        <div className="bg-purple-950/40 border border-purple-700/60 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
              <AlertCircle className="w-4 h-4 text-purple-400" />
              <span>Cross-Visit Clinical Delta Analysis (vs Previous Visit)</span>
            </div>
            <span className="text-[10px] text-purple-300/80 bg-purple-900/60 px-2 py-0.5 rounded border border-purple-700">
              {deltas.length} compared parameters
            </span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {deltas.map((d, i) => (
              <span
                key={i}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
                  d.isSignificant
                    ? "bg-rose-950/80 text-rose-200 border-rose-700"
                    : "bg-slate-900 text-slate-300 border-slate-700"
                }`}
              >
                <span>{d.testName}:</span>
                <strong className="mono">{d.currentValue}</strong>
                <span className="text-[10px] opacity-80">(prev: {d.priorValue} on {d.priorDate})</span>
                <span className={`mono text-[10px] font-bold ${d.direction === 'INCREASED' ? 'text-amber-400' : 'text-blue-400'}`}>
                  {d.diff} ({d.pctChange})
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
          <div className="text-xs text-slate-400 font-medium">Structured Parameters</div>
          <div className="text-2xl font-bold text-white mt-1">{observations.length}</div>
          <div className="text-[11px] text-blue-400 mt-0.5">LOINC-Standardized</div>
        </div>

        <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
          <div className="text-xs text-slate-400 font-medium">Within Source Interval</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{normalCount}</div>
          <div className="text-[11px] text-emerald-500/80 mt-0.5">Printed normal range</div>
        </div>

        <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
          <div className="text-xs text-slate-400 font-medium">Outside Source Interval</div>
          <div className="text-2xl font-bold text-rose-400 mt-1">{abnormalCount}</div>
          <div className="text-[11px] text-rose-400/80 mt-0.5">High or Low values</div>
        </div>

        <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
          <div className="text-xs text-slate-400 font-medium">Anti-Hallucination Rate</div>
          <div className="text-2xl font-bold text-teal-400 mt-1">{verifiedRate}%</div>
          <div className="text-[11px] text-teal-400/80 mt-0.5">
            {unverifiedCount > 0 ? `${unverifiedCount} flagged for review` : "100% OCR Grounded"}
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <label htmlFor="clinician-search-input" className="sr-only">
            Search investigations or LOINC code
          </label>
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            id="clinician-search-input"
            type="text"
            placeholder="Search test name, LOINC code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 w-full sm:w-auto overflow-x-auto">
          {[
            { id: "ALL", label: `All (${observations.length})` },
            { id: "ABNORMAL", label: `Out-of-Range (${abnormalCount})` },
            { id: "IN_RANGE", label: `In-Range (${normalCount})` },
            { id: "UNVERIFIED", label: `Needs Review (${unverifiedCount})` }
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => setFilterType(btn.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition whitespace-nowrap ${
                filterType === btn.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Structured Clinical Observations Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Investigation & LOINC</th>
                <th className="py-3.5 px-4">Observed Value</th>
                <th className="py-3.5 px-4">Document Reference Interval</th>
                <th className="py-3.5 px-4">Evaluation Status</th>
                <th className="py-3.5 px-4">Source Provenance</th>
                <th className="py-3.5 px-4 text-right">Audit & Trace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {filteredObservations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-500">
                    No clinical observations match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredObservations.map(obs => {
                  const isHigh = obs.flag === "HIGH";
                  const isLow = obs.flag === "LOW";
                  const isNormal = obs.flag === "NORMAL";
                  const isUnverified = obs.flag === "UNVERIFIED" || obs.validationResult?.isValid === false;

                  // Find Velocity for this observation if available
                  const vel = velocities.find(v => 
                    (v.loincCode && obs.loincCode && v.loincCode === obs.loincCode) ||
                    (v.testName && obs.testName && (
                      v.testName.toLowerCase() === obs.testName.toLowerCase() ||
                      obs.testName.toLowerCase().includes(v.testName.toLowerCase()) ||
                      v.testName.toLowerCase().includes(obs.testName.toLowerCase())
                    ))
                  );

                  return (
                    <tr 
                      key={obs.id} 
                      className={`hover:bg-slate-800/40 transition group ${
                        isUnverified ? "bg-amber-950/10" : ""
                      }`}
                    >
                      {/* Test Name & LOINC */}
                      <td className="py-3 px-4 font-medium text-slate-200">
                        <div className="font-semibold text-white group-hover:text-blue-400 transition">
                          {obs.testName}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="mono text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-blue-400 border border-slate-700" title={obs.loincDisplay}>
                            LOINC: {obs.loincCode}
                          </span>
                        </div>
                      </td>

                      {/* Observed Value, Unit & Biomarker Velocity (ΔV/Δt) */}
                      <td className="py-3 px-4">
                        <div>
                          <span className={`text-sm font-bold mono ${
                            isHigh ? "text-rose-400" : isLow ? "text-blue-400" : "text-emerald-400"
                          }`}>
                            {obs.value}
                          </span>{" "}
                          <span className="text-slate-400 text-xs">{obs.unit}</span>
                        </div>

                        {/* Biomarker Velocity Badge */}
                        {vel && (
                          <div 
                            className={`text-[10px] font-semibold flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded border max-w-fit ${
                              vel.isRapidChange 
                                ? "bg-rose-950 text-rose-300 border-rose-700 animate-pulse" 
                                : "bg-slate-800 text-slate-300 border-slate-700"
                            }`}
                            title={`Rate of Change: ${vel.velocityPerMonth > 0 ? '+' : ''}${vel.velocityPerMonth} ${vel.unit}/month over ${vel.deltaDays} days. ${vel.clinicalNote || ''}`}
                          >
                            {vel.velocityPerMonth > 0 ? (
                              <TrendingUp className={`w-3 h-3 ${vel.isRapidChange ? 'text-rose-400' : 'text-amber-400'}`} />
                            ) : (
                              <TrendingDown className="w-3 h-3 text-blue-400" />
                            )}
                            <span className="mono">
                              Δ {vel.velocityPerMonth > 0 ? `+${vel.velocityPerMonth}` : vel.velocityPerMonth} {vel.unit}/mo
                            </span>
                            {vel.isRapidChange && (
                              <span className="font-bold text-rose-400">⚡ RAPID</span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Reference Interval with Verification Badge */}
                      <td className="py-3 px-4">
                        <div className="text-slate-300 mono text-xs">
                          {obs.referenceRange}
                        </div>
                        {obs.validationResult?.isValid ? (
                          <div className="text-[10px] text-teal-400/90 flex items-center gap-1 mt-0.5">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Grounded in document OCR</span>
                          </div>
                        ) : (
                          <div className="text-[10px] text-amber-400 flex items-center gap-1 mt-0.5">
                            <AlertCircle className="w-3 h-3" />
                            <span>{obs.validationResult?.reason || "Range absent in source"}</span>
                          </div>
                        )}
                      </td>

                      {/* Status Flag */}
                      <td className="py-3 px-4">
                        {isNormal && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/70 text-emerald-300 border border-emerald-700/60">
                            Normal
                          </span>
                        )}
                        {isHigh && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-950/80 text-rose-300 border border-rose-700/70">
                            High (Above Range)
                          </span>
                        )}
                        {isLow && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-950/80 text-blue-300 border border-blue-700/70">
                            Low (Below Range)
                          </span>
                        )}
                        {isUnverified && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-950/80 text-amber-300 border border-amber-700/70">
                            Review Required
                          </span>
                        )}
                        <div className="text-[10px] text-slate-400 mt-1 max-w-[180px] truncate" title={obs.interpretationNote}>
                          {obs.interpretationNote}
                        </div>
                      </td>

                      {/* Provenance Badge */}
                      <td className="py-3 px-4">
                        <ProvenanceBadge 
                          type={obs.provenance} 
                          confidence={obs.confidence} 
                        />
                      </td>

                      {/* Action: Verify/Edit & Inspect in Source */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onEditObservation(obs)}
                            aria-label={`Human verify and correct ${obs.testName}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-purple-300 hover:text-white bg-purple-950/60 hover:bg-purple-600 rounded-lg border border-purple-800 transition shadow-sm"
                            title="Human-in-the-Loop Clinical Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Verify</span>
                          </button>
                          <button
                            onClick={() => onInspectInSource(obs)}
                            aria-label={`Highlight ${obs.testName} in source document`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-blue-600 rounded-lg border border-slate-700 transition"
                            title="Highlight exact line in source document"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Inspect</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
