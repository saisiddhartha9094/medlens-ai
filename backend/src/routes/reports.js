import express from "express";
import { SAMPLE_REPORTS } from "../data/sampleReports.js";
import { store, addAuditEntry } from "../data/store.js";
import { processReportExtraction } from "../services/extractionService.js";
import { generatePatientFriendlySummary } from "../services/summarizerService.js";

const router = express.Router();

// GET all available pre-loaded synthetic reports
router.get("/samples", (req, res) => {
  res.json({
    success: true,
    samples: SAMPLE_REPORTS.map(s => ({
      id: s.id,
      title: s.title,
      labName: s.labName,
      testDate: s.testDate,
      category: s.category,
      snippet: s.rawText.substring(0, 300) + "..."
    }))
  });
});

// GET all processed reports for active patient
router.get("/", (req, res) => {
  res.json({
    success: true,
    reports: store.reports.map(r => ({
      id: r.id,
      documentTitle: r.documentTitle,
      labName: r.labName,
      testDate: r.testDate,
      observationsCount: r.observationsCount,
      abnormalCount: r.abnormalCount,
      unverifiedCount: r.unverifiedCount,
      processedAt: r.processedAt
    }))
  });
});

// GET single report details with observations, summary, and provenance
router.get("/:id", (req, res) => {
  const report = store.reports.find(r => r.id === req.params.id);
  if (!report) {
    return res.status(404).json({ success: false, error: "Report not found" });
  }
  res.json({
    success: true,
    report
  });
});

// POST process one of the synthetic sample reports
router.post("/process-sample/:sampleId", async (req, res) => {
  try {
    const sample = SAMPLE_REPORTS.find(s => s.id === req.params.sampleId);
    if (!sample) {
      return res.status(404).json({ success: false, error: "Sample report not found" });
    }

    // Process extraction
    const extractedReport = await processReportExtraction(sample.rawText, {
      labName: sample.labName,
      testDate: sample.testDate,
      patientName: sample.patientName || store.patient.fullName,
      patientAge: sample.patientAge || store.patient.age,
      patientGender: sample.patientGender || store.patient.gender
    });

    extractedReport.id = sample.id;
    extractedReport.documentTitle = sample.title;

    // Generate guardrailed summary
    extractedReport.patientSummary = generatePatientFriendlySummary(
      extractedReport,
      store.patient.patientContext
    );

    // Save or update in store
    const existingIdx = store.reports.findIndex(r => r.id === sample.id);
    if (existingIdx !== -1) {
      store.reports[existingIdx] = extractedReport;
    } else {
      store.reports.unshift(extractedReport);
    }

    addAuditEntry(
      "REPORT_INGESTED_AND_EXTRACTED",
      "MedLens Ingestion Gateway",
      "AI_EXTRACTED_VERIFIED",
      `Ingested '${sample.title}' (${extractedReport.observationsCount} parameters). Verified ${extractedReport.observationsCount - extractedReport.unverifiedCount} against source OCR. Flagged ${extractedReport.unverifiedCount} unverified.`,
      { reportId: sample.id, observationsCount: extractedReport.observationsCount }
    );

    res.json({
      success: true,
      message: "Report processed successfully",
      report: extractedReport
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST custom report upload / text paste
router.post("/upload", async (req, res) => {
  try {
    const { rawText, documentTitle, labName, testDate } = req.body;

    if (!rawText || rawText.trim().length === 0) {
      return res.status(400).json({ success: false, error: "Report text or document OCR is required." });
    }

    const extractedReport = await processReportExtraction(rawText, {
      labName: labName || "Uploaded Diagnostic Report",
      testDate: testDate || new Date().toISOString().split("T")[0],
      patientName: store.patient.fullName,
      patientAge: store.patient.age,
      patientGender: store.patient.gender
    });

    if (documentTitle) extractedReport.documentTitle = documentTitle;

    extractedReport.patientSummary = generatePatientFriendlySummary(
      extractedReport,
      store.patient.patientContext
    );

    store.reports.unshift(extractedReport);

    addAuditEntry(
      "CUSTOM_DOCUMENT_EXTRACTED",
      "User Document Ingestion",
      "AI_EXTRACTED_VERIFIED",
      `Custom document '${extractedReport.documentTitle}' extracted with ${extractedReport.observationsCount} observations.`,
      { reportId: extractedReport.id }
    );

    res.json({
      success: true,
      message: "Custom report ingested and structured successfully",
      report: extractedReport
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
