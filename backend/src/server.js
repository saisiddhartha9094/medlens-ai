import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import intakeRouter from "./routes/intake.js";
import reportsRouter from "./routes/reports.js";
import validatorRouter from "./routes/validator.js";
import fhirRouter from "./routes/fhir.js";
import trendsRouter from "./routes/trends.js";

import { SAMPLE_REPORTS } from "./data/sampleReports.js";
import { store, addAuditEntry } from "./data/store.js";
import { processReportExtraction } from "./services/extractionService.js";
import { generatePatientFriendlySummary } from "./services/summarizerService.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Route handlers
app.use("/api/patient", intakeRouter);
app.use("/api/reports", reportsRouter);
app.use("/api/validator", validatorRouter);
app.use("/api/fhir", fhirRouter);
app.use("/api/trends", trendsRouter);

// Healthcheck
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "MedLens Clinical Information Intelligence Engine",
    version: "1.0.0",
    activeReports: store.reports.length,
    activePatient: store.patient.fullName,
    abhaId: store.patient.abhaId,
    guardrailEngine: "Active (Levenshtein + Grounded Substring Verification)"
  });
});

/**
 * Automatically seed the first 3 historical reports on boot
 * so the application is rich with clinical data, trends, and provenance.
 */
async function seedInitialReports() {
  try {
    for (let i = 0; i < 3; i++) {
      const sample = SAMPLE_REPORTS[i];
      const extracted = await processReportExtraction(sample.rawText, {
        labName: sample.labName,
        testDate: sample.testDate,
        patientName: sample.patientName,
        patientAge: sample.patientAge,
        patientGender: sample.patientGender
      });
      extracted.id = sample.id;
      extracted.documentTitle = sample.title;
      extracted.patientSummary = generatePatientFriendlySummary(extracted, store.patient.patientContext);
      store.reports.push(extracted);
    }
    addAuditEntry(
      "SYSTEM_BOOTSTRAP_COMPLETE",
      "MedLens Core",
      "SYSTEM",
      "Preloaded 3 longitudinal lab reports (CBC, Lipid Profile, Diabetic & Renal Panel) for patient Rajesh Kumar."
    );
    console.log(`[MedLens] Preloaded ${store.reports.length} diagnostic reports with verified provenance.`);
  } catch (err) {
    console.error("[MedLens] Seed error:", err);
  }
}

seedInitialReports();

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` MedLens Clinical Intelligence API running on :${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});
