import React, { useState, useEffect } from "react";
import { 
  Heart, 
  ShieldCheck, 
  HelpCircle, 
  AlertTriangle, 
  MessageSquare, 
  Info, 
  CheckCircle, 
  FileHeart, 
  ChevronDown,
  Languages,
  Volume2,
  VolumeX,
  CalendarClock,
  Clock,
  CheckCircle2
} from "lucide-react";
import ProvenanceBadge from "./ProvenanceBadge";
import TrafficLightGauge from "./TrafficLightGauge";
import { 
  SUPPORTED_LANGUAGES, 
  VERNACULAR_TRANSLATIONS, 
  translateText, 
  SpeechController 
} from "../services/translationService";

export default function PatientView({ currentReport, patientContext }) {
  const [selectedLang, setSelectedLang] = useState("en");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [careGapsData, setCareGapsData] = useState(null);
  const [translatedOverview, setTranslatedOverview] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);

  // Load Care Gaps
  useEffect(() => {
    fetch("/api/intake/care-gaps")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.evaluation) {
          setCareGapsData(data.evaluation);
        }
      })
      .catch(err => console.warn("Failed to load care gaps:", err));
  }, []);

  // Handle translation when language changes
  useEffect(() => {
    if (!currentReport?.patientSummary?.overview) return;
    
    if (selectedLang === "en") {
      setTranslatedOverview(currentReport.patientSummary.overview);
      return;
    }

    setIsTranslating(true);
    translateText(currentReport.patientSummary.overview, selectedLang)
      .then(translated => {
        setTranslatedOverview(translated);
        setIsTranslating(false);
      })
      .catch(() => {
        setTranslatedOverview(currentReport.patientSummary.overview);
        setIsTranslating(false);
      });
  }, [selectedLang, currentReport]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => SpeechController.stop();
  }, []);

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

  const vText = VERNACULAR_TRANSLATIONS[selectedLang] || {};

  const handleToggleSpeech = () => {
    if (isSpeaking) {
      SpeechController.stop();
      setIsSpeaking(false);
    } else {
      const speechContent = `${translatedOverview || summary.overview}. Key parameters to discuss with doctor: ${
        summary.keyFindings?.map(f => `${f.parameter}: observed ${f.value}, standard range is ${f.referenceRange}`).join(". ") || ""
      }`;
      SpeechController.speak(
        speechContent,
        selectedLang,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false)
      );
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Strict Ethical Guardrail / Non-Diagnostic Medical Device Disclaimer */}
      <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-4 flex items-start gap-3 text-amber-200 shadow-lg">
        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <div className="font-semibold text-amber-300">
            {vText.disclaimerTitle || "MedLens Assistive Information Disclaimer"}
          </div>
          <p className="text-amber-200/90 leading-relaxed">
            {vText.disclaimer || "MedLens is an AI-powered clinical information organization system designed to help you understand your laboratory records. MedLens DOES NOT diagnose conditions, recommend medications, or replace the professional judgment of your physician. Always share this structured report with your doctor during your consultation."}
          </p>
        </div>
      </div>

      {/* Patient Friendly Overview Card with Multilingual & TTS */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        
        {/* Language Switcher & TTS Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5 text-blue-400 text-xs font-semibold uppercase tracking-wider">
            <Heart className="w-4 h-4 text-rose-500" />
            <span>{vText.summaryTitle || "Patient-Centric Health Summary"}</span>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* Language Selector */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <Languages className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1" />
              {SUPPORTED_LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLang(lang.code)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                    selectedLang === lang.code
                      ? "bg-blue-600 text-white shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {lang.nativeName}
                </button>
              ))}
            </div>

            {/* Read Aloud (TTS) Button */}
            <button
              onClick={handleToggleSpeech}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition shadow-md ${
                isSpeaking
                  ? "bg-rose-600 text-white animate-pulse"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
              }`}
              title="Listen to plain-language audio readout"
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-blue-400" />}
              <span>{isSpeaking ? (vText.stopButton || "Stop Audio") : (vText.listenButton || "Read Aloud")}</span>
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-white mb-2">
            Understanding Your Report: {currentReport.documentTitle || currentReport.labName}
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            {isTranslating ? (
              <span className="text-slate-500 italic">Translating summary...</span>
            ) : (
              translatedOverview || summary.overview
            )}
          </p>
        </div>

        {/* Highlight Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              {observations.length}
            </div>
            <div>
              <div className="text-xs text-slate-400">{vText.totalTests || "Total Measurements"}</div>
              <div className="text-xs font-semibold text-slate-200">Organized into Record</div>
            </div>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              {normalObs.length}
            </div>
            <div>
              <div className="text-xs text-slate-400">{vText.normalTests || "Within Document Ranges"}</div>
              <div className="text-xs font-semibold text-emerald-300">Expected standard values</div>
            </div>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
              {abnormalObs.length}
            </div>
            <div>
              <div className="text-xs text-slate-400">{vText.abnormalTests || "Outside Printed Ranges"}</div>
              <div className="text-xs font-semibold text-rose-300">Discuss with your physician</div>
            </div>
          </div>
        </div>
      </div>

      {/* Preventive Care Gaps & Screening Reminders */}
      {careGapsData && careGapsData.careGaps && careGapsData.careGaps.length > 0 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
              <CalendarClock className="w-5 h-5 text-purple-400" />
              <span>{vText.careGapsTitle || "Preventive Health Screening Reminders (Care Gaps)"}</span>
            </div>
            <span className="text-xs text-slate-400">
              Adherence: <strong className="text-purple-300">{careGapsData.adherenceScore}%</strong>
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Based on clinical guidelines (ADA, USPSTF) and your health profile, these preventive checkups are monitored:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {careGapsData.careGaps.map((gap, idx) => (
              <div 
                key={idx}
                className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-2 ${
                  gap.status === "OVERDUE"
                    ? "bg-rose-950/20 border-rose-800/60"
                    : gap.status === "DUE_NOW"
                    ? "bg-amber-950/20 border-amber-800/60"
                    : "bg-slate-800/40 border-slate-700/60"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-semibold text-xs text-slate-200">
                    {gap.recommendedTest}
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                    gap.status === "OVERDUE"
                      ? "bg-rose-950 text-rose-400 border border-rose-800"
                      : gap.status === "DUE_NOW"
                      ? "bg-amber-950 text-amber-300 border border-amber-800"
                      : "bg-emerald-950 text-emerald-400 border border-emerald-800"
                  }`}>
                    {gap.status === "OVERDUE" ? (vText.overdue || "Overdue") : gap.status === "DUE_NOW" ? (vText.dueNow || "Due Now") : "Up to date"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {gap.clinicalRationale}
                </p>
                <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-800">
                  <span>Standard: {gap.guidelineBody}</span>
                  <span>Interval: every {gap.recommendedIntervalMonths} mo</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Parameters Outside Document Range with Visual Traffic-Light Gauges */}
      {summary.keyFindings && summary.keyFindings.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span>{vText.keyFindings || "Parameters to Discuss with Your Doctor"}</span>
            </h3>
            <span className="text-xs text-slate-400">Visual Range Calibration</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {summary.keyFindings.map((finding, idx) => {
              // Match finding to real observation to extract calibration
              const matchingObs = observations.find(o => 
                o.testName.toUpperCase().includes(finding.parameter.toUpperCase()) ||
                finding.parameter.toUpperCase().includes(o.testName.toUpperCase())
              );

              return (
                <div 
                  key={idx} 
                  className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-4 space-y-3 shadow-md hover:border-slate-600 transition"
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

                  {/* Embedded Traffic-Light Visual Gauge */}
                  <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                    <TrafficLightGauge
                      value={finding.value}
                      unit={matchingObs?.unit || ""}
                      referenceRange={finding.referenceRange}
                      calibration={matchingObs?.calibration}
                      flag={finding.statusType}
                    />
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
              );
            })}
          </div>
        </div>
      )}

      {/* Questions to Ask Your Doctor */}
      {summary.questionsForDoctor && summary.questionsForDoctor.length > 0 && (
        <div className="bg-blue-950/30 border border-blue-800/50 rounded-2xl p-5 space-y-3 shadow-lg">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
            <MessageSquare className="w-5 h-5" />
            <span>{vText.doctorQuestions || "Recommended Questions for Your Healthcare Provider"}</span>
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

      {/* In-Range Normal Values List with Mini-Gauges */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
            <CheckCircle className="w-4 h-4" />
            <span>Parameters Within Printed Lab Reference Intervals ({normalObs.length})</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {normalObs.map(obs => (
            <div key={obs.id} className="bg-slate-800/50 p-3 rounded-xl border border-slate-800 text-xs space-y-1.5">
              <div className="font-medium text-slate-300 truncate" title={obs.testName}>
                {obs.testName}
              </div>
              <TrafficLightGauge
                value={obs.value}
                unit={obs.unit}
                referenceRange={obs.referenceRange}
                calibration={obs.calibration}
                flag={obs.flag}
              />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
