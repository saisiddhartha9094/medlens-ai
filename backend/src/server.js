import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, "../../frontend/dist");

import intakeRouter from "./routes/intake.js";
import reportsRouter from "./routes/reports.js";
import validatorRouter from "./routes/validator.js";
import fhirRouter from "./routes/fhir.js";
import trendsRouter from "./routes/trends.js";
import authRouter from "./routes/auth.js";

import { SAMPLE_REPORTS } from "./data/sampleReports.js";
import { store, addAuditEntry, saveReport } from "./data/store.js";
import { processReportExtraction } from "./services/extractionService.js";
import { generatePatientFriendlySummary } from "./services/summarizerService.js";

dotenv.config();

export const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware: Helmet HTTP Header Hardening
app.use(helmet({
  contentSecurityPolicy: false, // Allows flexible UI asset rendering in local dev
  crossOriginEmbedderPolicy: false
}));

// Security Middleware: Scoped CORS Allowlist
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173").split(",");
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin) || origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:")) {
      callback(null, true);
    } else {
      callback(new Error(`CORS Error: Origin '${origin}' is not authorized.`));
    }
  },
  credentials: true
}));

// Security Middleware: Rate Limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many requests from this client. Please try again later." }
});
app.use("/api/", generalLimiter);

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 35,
  message: { success: false, error: "Upload rate limit exceeded. Please wait a few minutes before submitting additional files." }
});
app.use("/api/reports/upload", uploadLimiter);
app.use("/api/reports/upload-file", uploadLimiter);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Route handlers
app.use("/api/auth", authRouter);
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
    security: {
      helmet: "Active",
      rateLimiting: "Active",
      corsScoped: true,
      authModule: "JWT + bcrypt"
    },
    activeReports: store.reports.length,
    activePatient: store.patient.fullName,
    abhaId: store.patient.abhaId,
    guardrailEngine: "Active (Levenshtein + Grounded Substring Verification)"
  });
});

// Serve static frontend build if present
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(distPath, "index.html"));
  });
}

/**
 * Seed initial reports if database is empty on cold boot
 */
async function seedInitialReports() {
  try {
    if (store.reports.length === 0) {
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
        saveReport(extracted);
      }
      addAuditEntry(
        "SYSTEM_BOOTSTRAP_COMPLETE",
        "MedLens Core",
        "SYSTEM",
        "Seeded 3 historical reports (CBC, Lipid, Diabetic Panel) for patient Rajesh Kumar."
      );
    }
  } catch (err) {
    console.error("[MedLens] Seed error:", err);
  }
}

seedInitialReports();

// Start HTTP server only if executed directly (not when imported by vitest/supertest)
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` MedLens Clinical Intelligence API running on :${PORT}`);
    console.log(` Health check: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });
}
