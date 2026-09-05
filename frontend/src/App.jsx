import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import ClinicianView from "./components/ClinicianView";
import PatientView from "./components/PatientView";
import SourceHighlightView from "./components/SourceHighlightView";
import TrendTracker from "./components/TrendTracker";
import GuardrailPlayground from "./components/GuardrailPlayground";
import FhirExportModal from "./components/FhirExportModal";
import PatientIntakeModal from "./components/PatientIntakeModal";
import ReportUploadModal from "./components/ReportUploadModal";

export default function App() {
  const [activeTab, setActiveTab] = useState("clinician");
  const [patient, setPatient] = useState(null);
  const [reports, setReports] = useState([]);
  const [currentReportId, setCurrentReportId] = useState(null);
  const [currentReport, setCurrentReport] = useState(null);
  const [selectedObservation, setSelectedObservation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isFhirOpen, setIsFhirOpen] = useState(false);
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);

  // Fetch initial patient profile and reports list
  const loadData = async () => {
    try {
      setLoading(true);
      const [patientRes, reportsRes] = await Promise.all([
        fetch("/api/patient").then(r => r.json()),
        fetch("/api/reports").then(r => r.json())
      ]);

      if (patientRes.success) {
        setPatient(patientRes.patient);
      }

      if (reportsRes.success && reportsRes.reports) {
        setReports(reportsRes.reports);
        if (reportsRes.activeReport) {
          setCurrentReportId(reportsRes.activeReport.id);
          setCurrentReport(reportsRes.activeReport);
        } else if (reportsRes.reports.length > 0) {
          const initialId = currentReportId || reportsRes.reports[0].id;
          setCurrentReportId(initialId);
          await loadSingleReport(initialId);
        }
      }
    } catch (err) {
      console.error("Initialization error:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadSingleReport = async (reportId) => {
    try {
      const res = await fetch(`/api/reports/${reportId}`);
      const data = await res.json();
      if (data.success && data.report) {
        setCurrentReport(data.report);
      }
    } catch (err) {
      console.error("Failed to load report detail:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectReport = (reportId) => {
    setCurrentReportId(reportId);
    loadSingleReport(reportId);
  };

  const handleInspectInSource = (observation) => {
    setSelectedObservation(observation);
    setActiveTab("source");
  };

  const handleReportIngested = (newReport) => {
    setReports(prev => [newReport, ...prev.filter(r => r.id !== newReport.id)]);
    setCurrentReportId(newReport.id);
    setCurrentReport(newReport);
    setActiveTab("clinician");
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        patient={patient}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenFhir={() => setIsFhirOpen(true)}
        onOpenIntake={() => setIsIntakeOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {loading && !currentReport ? (
          <div className="py-32 text-center text-slate-400">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm font-medium">Bootstrapping MedLens Clinical Intelligence Engine...</p>
          </div>
        ) : (
          <>
            {activeTab === "clinician" && (
              <ClinicianView
                currentReport={currentReport}
                reportsList={reports}
                onSelectReport={handleSelectReport}
                onInspectInSource={handleInspectInSource}
              />
            )}

            {activeTab === "patient" && (
              <PatientView
                currentReport={currentReport}
                patientContext={patient?.patientContext}
              />
            )}

            {activeTab === "source" && (
              <SourceHighlightView
                currentReport={currentReport}
                selectedObservation={selectedObservation}
                onSelectObservation={setSelectedObservation}
              />
            )}

            {activeTab === "trends" && (
              <TrendTracker reports={reports} />
            )}

            {activeTab === "playground" && (
              <GuardrailPlayground />
            )}
          </>
        )}

      </main>

      {/* Institutional Healthcare Standards Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">MedLens</span>
            <span>— AI-Powered Clinical Information Intelligence</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>HL7 FHIR R4</span>
            <span>•</span>
            <span>ABDM / ABHA Sandbox Ready</span>
            <span>•</span>
            <span>LOINC Standardized</span>
            <span>•</span>
            <span>Zero-Hallucination Range Guard</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <FhirExportModal
        isOpen={isFhirOpen}
        onClose={() => setIsFhirOpen(false)}
        currentReport={currentReport}
      />

      <PatientIntakeModal
        isOpen={isIntakeOpen}
        onClose={() => setIsIntakeOpen(false)}
        patient={patient}
        onUpdatePatient={setPatient}
      />

      <ReportUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onReportIngested={handleReportIngested}
      />

    </div>
  );
}
