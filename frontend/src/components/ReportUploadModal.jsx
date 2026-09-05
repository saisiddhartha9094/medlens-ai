import React, { useState, useEffect } from "react";
import { 
  X, 
  UploadCloud, 
  FileText, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2,
  RefreshCw,
  PlusCircle,
  FileSearch,
  Camera,
  Image as ImageIcon
} from "lucide-react";

export default function ReportUploadModal({ 
  isOpen, 
  onClose, 
  onReportIngested 
}) {
  const [samples, setSamples] = useState([]);
  const [activeTab, setActiveTab] = useState("samples"); // "samples", "custom", "file"
  const [loadingSampleId, setLoadingSampleId] = useState(null);

  // Custom text form state
  const [customText, setCustomText] = useState("");
  const [documentTitle, setDocumentTitle] = useState("");
  const [labName, setLabName] = useState("");
  const [testDate, setTestDate] = useState(new Date().toISOString().split("T")[0]);
  const [uploadingCustom, setUploadingCustom] = useState(false);

  // File upload state (Local OCR)
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileDocTitle, setFileDocTitle] = useState("");
  const [fileLabName, setFileLabName] = useState("");
  const [fileDate, setFileDate] = useState(new Date().toISOString().split("T")[0]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [ocrError, setOcrError] = useState("");

  // Keyboard Escape Handler (WCAG AA)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/reports/samples")
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setSamples(data.samples);
          }
        })
        .catch(err => console.error("Failed to load samples:", err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleProcessSample = async (sampleId) => {
    setLoadingSampleId(sampleId);
    try {
      const res = await fetch(`/api/reports/process-sample/${sampleId}`, {
        method: "POST"
      });
      const data = await res.json();
      if (data.success && data.report) {
        onReportIngested(data.report);
        onClose();
      }
    } catch (err) {
      console.error("Failed to process sample:", err);
    } finally {
      setLoadingSampleId(null);
    }
  };

  const handleCustomUpload = async (e) => {
    e.preventDefault();
    if (!customText.trim()) return;

    setUploadingCustom(true);
    try {
      const res = await fetch("/api/reports/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawText: customText,
          documentTitle: documentTitle || labName || "Custom Ingested Report",
          labName: labName || "Diagnostic Center",
          testDate: testDate
        })
      });
      const data = await res.json();
      if (data.success && data.report) {
        onReportIngested(data.report);
        onClose();
      }
    } catch (err) {
      console.error("Custom report upload failed:", err);
    } finally {
      setUploadingCustom(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploadingFile(true);
    setOcrError("");

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("documentTitle", fileDocTitle || `Scanned Report (${selectedFile.name})`);
    formData.append("labName", fileLabName || "Local Scanned Laboratory");
    formData.append("testDate", fileDate);

    try {
      const res = await fetch("/api/reports/upload-file", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.success && data.report) {
        onReportIngested(data.report);
        onClose();
      } else {
        setOcrError(data.error || "OCR extraction failed to parse legible text.");
      }
    } catch (err) {
      setOcrError("Failed to upload file or run OCR engine.");
    } finally {
      setUploadingFile(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
    >
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <h3 id="upload-modal-title" className="text-base font-bold text-white">
                Ingest & Structure Diagnostic Report
              </h3>
              <p className="text-xs text-slate-400">
                Choose synthetic templates, paste OCR text, or upload document images for local Tesseract OCR.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close ingestion dialog"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ingestion Mode Switcher */}
        <div className="px-6 pt-4 pb-2 flex flex-wrap gap-2 border-b border-slate-800 bg-slate-950/30">
          <button
            onClick={() => setActiveTab("samples")}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === "samples"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            ⚡ Pre-loaded Synthetic Reports ({samples.length})
          </button>
          <button
            onClick={() => setActiveTab("custom")}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === "custom"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            📄 Paste Custom OCR Text
          </button>
          <button
            onClick={() => setActiveTab("file")}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === "file"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-teal-400" />
            <span>Image OCR Upload (Tesseract)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          {activeTab === "samples" && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400 mb-2">
                Click any report below to test the extraction pipeline, anti-hallucination verification, and LOINC standardization:
              </p>
              {samples.map(sample => {
                const isEdgeCase = sample.id.includes("hallucination");
                const isLoading = loadingSampleId === sample.id;

                return (
                  <div
                    key={sample.id}
                    className={`p-4 rounded-xl border transition flex items-start justify-between gap-4 ${
                      isEdgeCase
                        ? "bg-rose-950/20 border-rose-800/60 hover:border-rose-600"
                        : "bg-slate-800/50 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-xs sm:text-sm">
                          {sample.title}
                        </h4>
                        {isEdgeCase && (
                          <span className="text-[10px] bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded border border-rose-500/30 font-bold uppercase">
                            SIH Guardrail Test
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-3">
                        <span>Facility: <strong className="text-slate-300">{sample.labName}</strong></span>
                        <span>•</span>
                        <span>Date: <strong className="text-slate-300">{sample.testDate}</strong></span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono line-clamp-1 mt-1">
                        {sample.snippet}
                      </div>
                    </div>

                    <button
                      onClick={() => handleProcessSample(sample.id)}
                      disabled={isLoading}
                      aria-label={`Structure report ${sample.title}`}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition active:scale-95 shadow-md flex-shrink-0 ${
                        isEdgeCase
                          ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20"
                          : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20"
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Structuring...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Structure Report</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "custom" && (
            <form onSubmit={handleCustomUpload} className="space-y-4">
              {/* Quick Fill Demo Templates Strip */}
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    Quick Suggest / Auto-Fill Sample Templates:
                  </span>
                  <span className="text-[10px] text-slate-500">1-click fill</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDocumentTitle("Liver Function Test (LFT) Comprehensive Panel");
                      setLabName("Apollo Diagnostics - Clinical Biochemistry");
                      setTestDate("2026-09-05");
                      setCustomText(`APOLLO DIAGNOSTICS - CLINICAL BIOCHEMISTRY DIVISION
Jubilee Hills, Hyderabad - 500033
Patient Name: Rajesh Kumar          Age / Gender: 48 Y / Male
Collection Date: 05-Sep-2026 08:00 AM   Reported: 05-Sep-2026 01:30 PM
===============================================================
TEST NAME                    VALUE     UNIT        REFERENCE RANGE
===============================================================
TOTAL BILIRUBIN               1.45     mg/dL       0.20 - 1.20
BILIRUBIN DIRECT              0.48     mg/dL       0.00 - 0.30
BILIRUBIN INDIRECT            0.97     mg/dL       0.10 - 0.90
SGOT (AST)                    58.0     U/L         10.0 - 40.0
SGPT (ALT)                    64.0     U/L         10.0 - 45.0
ALKALINE PHOSPHATASE (ALP)    115.0    U/L         30.0 - 120.0
TOTAL PROTEIN                 7.20     g/dL        6.40 - 8.30
SERUM ALBUMIN                 4.10     g/dL        3.50 - 5.00
SERUM GLOBULIN                3.10     g/dL        2.00 - 3.50
A / G RATIO                   1.32     Ratio       1.10 - 2.20
GAMMA GT (GGTP)               72.0     U/L         < 55.0
===============================================================
COMMENTS: Mild elevation in transaminases (AST/ALT) and total bilirubin noted. Advised clinical correlation.
*** END OF REPORT ***`);
                    }}
                    className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-blue-600/30 text-blue-300 hover:text-white border border-slate-700 hover:border-blue-500 rounded-lg transition"
                  >
                    🧪 Liver Function (LFT)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDocumentTitle("Renal Function & Electrolyte Profile");
                      setLabName("Dr. Lal PathLabs Ltd. - Central Reference Lab");
                      setTestDate("2026-09-05");
                      setCustomText(`DR. LAL PATHLABS LTD. - NATIONAL REFERENCE LAB
Sector 18, Rohini, New Delhi - 110085
Patient Name: Rajesh Kumar          Age / Sex: 48 Y / Male
Sample Collected: 05-Sep-2026 07:45 AM
===============================================================
TEST NAME                    VALUE     UNIT        REFERENCE RANGE
===============================================================
BLOOD UREA NITROGEN (BUN)    24.5      mg/dL       8.0 - 23.0
SERUM CREATININE             1.35      mg/dL       0.70 - 1.20
BUN / CREATININE RATIO       18.15     Ratio       10.0 - 20.0
URIC ACID                    7.8       mg/dL       3.5 - 7.2
SERUM SODIUM                 139.0     mEq/L       136.0 - 145.0
SERUM POTASSIUM              4.8       mEq/L       3.5 - 5.1
SERUM CHLORIDE               102.0     mEq/L       98.0 - 107.0
CALCIUM, TOTAL               9.4       mg/dL       8.8 - 10.2
PHOSPHORUS, INORGANIC        3.6       mg/dL       2.5 - 4.5
===============================================================
NOTE: Serum Creatinine mildly elevated. Please correlate clinically.
*** END OF REPORT ***`);
                    }}
                    className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-teal-600/30 text-teal-300 hover:text-white border border-slate-700 hover:border-teal-500 rounded-lg transition"
                  >
                    🫘 Renal & Electrolytes (KFT)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDocumentTitle("Cardiac Risk & Micronutrient Profile");
                      setLabName("Metropolis Healthcare Ltd.");
                      setTestDate("2026-09-05");
                      setCustomText(`METROPOLIS HEALTHCARE LTD.
Global Reference Laboratory, Mumbai
Patient: Rajesh Kumar               Age/Gender: 48 / M
===============================================================
TEST NAME                    VALUE     UNIT        REFERENCE RANGE
===============================================================
HIGH SENSITIVITY CRP (hsCRP) 4.20      mg/L        0.0 - 3.0
HOMOCYSTEINE                 18.6      umol/L      5.0 - 15.0
SERUM 25-OH VITAMIN D        16.8      ng/mL       30.0 - 100.0
VITAMIN B12                  220.0     pg/mL       211.0 - 911.0
APOLIPOPROTEIN A1 (APO-A1)   128.0     mg/dL       119.0 - 240.0
APOLIPOPROTEIN B (APO-B)     132.0     mg/dL       60.0 - 130.0
APO B / APO A1 RATIO         1.03      Ratio       < 0.90
===============================================================
*** END OF REPORT ***`);
                    }}
                    className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-purple-600/30 text-purple-300 hover:text-white border border-slate-700 hover:border-purple-500 rounded-lg transition"
                  >
                    ❤️ Cardiac & Vitamins
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label htmlFor="custom-doc-title" className="text-xs font-semibold text-slate-300 block mb-1">
                    Document / Panel Title
                  </label>
                  <input
                    id="custom-doc-title"
                    type="text"
                    placeholder="e.g. Comprehensive Metabolic Panel"
                    value={documentTitle}
                    onChange={(e) => setDocumentTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="custom-test-date" className="text-xs font-semibold text-slate-300 block mb-1">
                    Report Date
                  </label>
                  <input
                    id="custom-test-date"
                    type="date"
                    value={testDate}
                    onChange={(e) => setTestDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="custom-lab-name" className="text-xs font-semibold text-slate-300 block mb-1">
                  Diagnostic Center / Hospital Name
                </label>
                <input
                  id="custom-lab-name"
                  type="text"
                  placeholder="e.g. Max Healthcare Clinical Laboratory"
                  value={labName}
                  onChange={(e) => setLabName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="custom-ocr-text" className="text-xs font-semibold text-slate-300 block mb-1">
                  Raw Diagnostic Report OCR / Text Content (Required)
                </label>
                <textarea
                  id="custom-ocr-text"
                  rows={8}
                  required
                  placeholder={`Paste lab test results here, for example:\nTEST NAME                    VALUE     UNIT        REFERENCE RANGE\nHAEMOGLOBIN                   13.2     g/dL        13.0 - 17.0\nTOTAL CHOLESTEROL            190.0     mg/dL       < 200`}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-white font-mono leading-5 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={uploadingCustom || !customText.trim()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition disabled:opacity-50"
                >
                  {uploadingCustom ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Extracting & Validating...</span>
                    </>
                  ) : (
                    <>
                      <FileSearch className="w-4 h-4" />
                      <span>Ingest & Run Pipeline</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {activeTab === "file" && (
            <form onSubmit={handleFileUpload} className="space-y-4">
              {ocrError && (
                <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{ocrError}</span>
                </div>
              )}

              <div className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-2xl p-6 text-center transition bg-slate-950/40">
                <input
                  type="file"
                  id="image-file-input"
                  accept="image/png, image/jpeg, image/webp, text/plain"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <label htmlFor="image-file-input" className="cursor-pointer space-y-2 block">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto border border-blue-500/20">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <div className="text-xs text-slate-300 font-semibold">
                    {selectedFile ? selectedFile.name : "Click to browse or drag & drop report image"}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Supports PNG, JPG, JPEG, WEBP, or TXT (Max 10MB). Runs pure local Tesseract.js OCR.
                  </p>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label htmlFor="file-doc-title" className="text-xs font-semibold text-slate-300 block mb-1">
                    Document Title (Optional)
                  </label>
                  <input
                    id="file-doc-title"
                    type="text"
                    placeholder="e.g. Scanned Apollo Lab Slip"
                    value={fileDocTitle}
                    onChange={(e) => setFileDocTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="file-test-date" className="text-xs font-semibold text-slate-300 block mb-1">
                    Report Date
                  </label>
                  <input
                    id="file-test-date"
                    type="date"
                    value={fileDate}
                    onChange={(e) => setFileDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={uploadingFile || !selectedFile}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition disabled:opacity-50"
                >
                  {uploadingFile ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Running Local OCR Engine...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4" />
                      <span>Execute OCR & Structure</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
