import express from "express";
import { store } from "../data/store.js";

const router = express.Router();

// GET longitudinal biomarker trends across all reports
router.get("/", (req, res) => {
  try {
    const keyParameters = [
      "HAEMOGLOBIN",
      "PLATELET COUNT",
      "TOTAL CHOLESTEROL",
      "TRIGLYCERIDES",
      "HDL CHOLESTEROL",
      "LDL CHOLESTEROL (DIRECT)",
      "GLUCOSE, FASTING (PLASMA)",
      "GLUCOSE, POST-PRANDIAL",
      "HbA1c (GLYCOSYLATED HB)",
      "SERUM CREATININE",
      "TSH (ULTRA SENSITIVE)"
    ];

    const trends = {};

    // Initialize trend lists
    keyParameters.forEach(param => {
      trends[param] = [];
    });

    // Traverse reports in chronological order
    const sortedReports = [...store.reports].sort((a, b) => new Date(a.testDate) - new Date(b.testDate));

    sortedReports.forEach(report => {
      (report.observations || []).forEach(obs => {
        const upper = obs.testName.toUpperCase();
        for (const target of keyParameters) {
          if (upper === target || upper.includes(target) || target.includes(upper)) {
            if (obs.numericValue !== null && !isNaN(obs.numericValue)) {
              trends[target].push({
                reportId: report.id,
                date: report.testDate,
                labName: report.labName,
                value: obs.numericValue,
                unit: obs.unit,
                referenceRange: obs.referenceRange,
                flag: obs.flag,
                provenance: obs.provenance
              });
            }
            break;
          }
        }
      });
    });

    // Filter out parameters with zero data points
    const activeTrends = {};
    for (const [key, data] of Object.entries(trends)) {
      if (data.length > 0) {
        activeTrends[key] = data;
      }
    }

    res.json({
      success: true,
      patientName: store.patient.fullName,
      trends: activeTrends
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET audit logs
router.get("/audit", (req, res) => {
  res.json({
    success: true,
    auditLog: store.auditLog
  });
});

export default router;
