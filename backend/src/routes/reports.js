import express from "express";
import multer from "multer";
import { createWorker } from "tesseract.js";
import { SAMPLE_REPORTS } from "../data/sampleReports.js";
import { store, addAuditEntry, saveReport, updateObservationValue } from "../data/store.js";
import { processReportExtraction } from "../services/extractionService.js";
import { generatePatientFriendlySummary } from "../services/summarizerService.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Configure Multer for file uploads (max 10MB)
const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype === "text/plain") {
      cb(null, true);
    } else {
      cb(new Error("Only image and plain text medical reports are supported for local OCR"));
    }
  }
});

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
    activeReport: store.reports[0] || null,
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

    const extractedReport = await processReportExtraction(sample.rawText, {
      labName: sample.labName,
      testDate: sample.testDate,
      patientName: sample.patientName || store.patient.fullName,
      patientAge: sample.patientAge || store.patient.age,
      patientGender: sample.patientGender || store.patient.gender
    });

    extractedReport.id = sample.id;
    extractedReport.documentTitle = sample.title;
    extractedReport.patientSummary = generatePatientFriendlySummary(
      extractedReport,
      store.patient.patientContext
    );

    saveReport(extractedReport);

    addAuditEntry(
      "REPORT_INGESTED_AND_EXTRACTED",
      "MedLens Ingestion Gateway",
      "AI_EXTRACTED_VERIFIED",
      `Ingested '${sample.title}' (${extractedReport.observationsCount} parameters). Verified against source document OCR.`,
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

// POST custom report upload / text paste with strict validation
router.post("/upload", async (req, res) => {
  try {
    const { rawText, documentTitle, labName, testDate } = req.body;

    if (!rawText || typeof rawText !== "string" || rawText.trim().length === 0) {
      return res.status(400).json({ success: false, error: "Report text or document OCR is required." });
    }

    if (rawText.length > 50000) {
      return res.status(400).json({ success: false, error: "Payload exceeds maximum allowed length (50,000 characters)." });
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

    saveReport(extractedReport);

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

// POST real image file upload with Tesseract.js local OCR!
router.post("/upload-file", upload.single("file"), async (req, res) => {
  let worker = null;
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No report document file provided." });
    }

    let ocrText = "";

    if (req.file.mimetype === "text/plain") {
      ocrText = req.file.buffer.toString("utf-8");
    } else {
      // Run local Tesseract OCR on image buffer
      worker = await createWorker("eng");
      const ret = await worker.recognize(req.file.buffer);
      ocrText = ret.data.text;
    }

    if (!ocrText || ocrText.trim().length === 0) {
      return res.status(422).json({ success: false, error: "OCR extraction could not detect legible text in this document." });
    }

    const documentTitle = req.body.documentTitle || `Uploaded Scanned Report (${req.file.originalname})`;
    const labName = req.body.labName || "Scanned Diagnostic Document";
    const testDate = req.body.testDate || new Date().toISOString().split("T")[0];

    const extractedReport = await processReportExtraction(ocrText, {
      labName,
      testDate,
      patientName: store.patient.fullName,
      patientAge: store.patient.age,
      patientGender: store.patient.gender
    });

    extractedReport.documentTitle = documentTitle;
    extractedReport.patientSummary = generatePatientFriendlySummary(
      extractedReport,
      store.patient.patientContext
    );

    saveReport(extractedReport);

    addAuditEntry(
      "OCR_DOCUMENT_INGESTED",
      "Tesseract.js Local Engine",
      "AI_EXTRACTED_VERIFIED",
      `Processed file '${req.file.originalname}' (${req.file.size} bytes) via Tesseract OCR. Extracted ${extractedReport.observationsCount} observations.`,
      { originalName: req.file.originalname, mimeType: req.file.mimetype }
    );

    res.json({
      success: true,
      message: "Scanned report processed with local OCR",
      report: extractedReport
    });
  } catch (err) {
    console.error("File OCR error:", err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    if (worker) {
      await worker.terminate();
    }
  }
});

// PATCH /api/reports/:reportId/observations/:observationId
// Human-in-the-Loop Clinical Field Editing with HUMAN_CORRECTED provenance
router.patch("/:reportId/observations/:observationId", authenticateToken(true), (req, res) => {
  try {
    const { reportId, observationId } = req.params;
    const { value, referenceRange, flag } = req.body;

    const clinicianName = req.user?.name || "Dr. Arvind Mehta, MD (Clinician)";
    const result = updateObservationValue(reportId, observationId, { value, referenceRange, flag }, clinicianName);

    res.json({
      success: true,
      message: "Observation successfully updated by clinician with HUMAN_CORRECTED provenance",
      observation: result.updatedObservation,
      report: result.report
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
