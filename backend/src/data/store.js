/**
 * MedLens - Persistent Clinical State, Delta Tracking & Audit Store
 * File-backed persistence (db.json) with SHA-256 caching and human verification support.
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, "db.json");

// Default initial seeded state
const DEFAULT_STATE = {
  patient: {
    id: "pat-9921",
    abhaId: "91-4829-1029-4821",
    fullName: "Rajesh Kumar",
    dateOfBirth: "1978-04-12",
    age: 48,
    gender: "Male",
    bloodGroup: "B+",
    phone: "+91 98765 43210",
    email: "rajesh.kumar@example.com",
    address: "Flat 402, Green Glen Heights, Bellandur, Bengaluru, Karnataka - 560103",
    patientContext: {
      chiefComplaints: "Occasional fatigue, increased thirst in evenings, mild lower limb heaviness after walking.",
      chronicConditions: ["Type 2 Diabetes Mellitus (Diagnosed 2021)", "Mild Dyslipidemia", "Primary Hypertension"],
      currentMedications: [
        "Metformin 500mg (1 tablet twice daily after meals)",
        "Telmisartan 40mg (1 tablet once daily in morning)",
        "Atorvastatin 10mg (1 tablet at bedtime)"
      ],
      allergies: ["Penicillin (moderate skin rash/urticaria)"],
      familyHistory: "Father had myocardial infarction at age 62; Mother has hypertension."
    },
    updatedAt: new Date().toISOString()
  },
  reports: [],
  auditLog: [
    {
      id: "aud-001",
      timestamp: "2026-06-15T08:35:00.000Z",
      action: "PATIENT_INTAKE_RECORDED",
      actor: "Patient (Self-Reported)",
      provenance: "PATIENT_ENTERED",
      details: "Demographic profile, ABHA ID 91-4829-1029-4821, allergies, and chronic history registered."
    }
  ],
  extractionCache: {} // hash -> structured report
};

function loadState() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("[MedLens DB] Error reading db.json, using defaults:", err.message);
  }
  return JSON.parse(JSON.stringify(DEFAULT_STATE));
}

function saveState() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    console.error("[MedLens DB] Error writing db.json:", err.message);
  }
}

export const store = loadState();

export function addAuditEntry(action, actor, provenance, details, metadata = {}) {
  const entry = {
    id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    action,
    actor,
    provenance,
    details,
    metadata
  };
  store.auditLog.unshift(entry);
  saveState();
  return entry;
}

export function saveReport(report) {
  const existingIdx = store.reports.findIndex(r => r.id === report.id);
  if (existingIdx !== -1) {
    store.reports[existingIdx] = report;
  } else {
    store.reports.unshift(report);
  }
  saveState();
}

export function computeTextHash(text) {
  return crypto.createHash("sha256").update((text || "").trim()).digest("hex");
}

export function getCachedExtraction(text) {
  const hash = computeTextHash(text);
  return store.extractionCache ? store.extractionCache[hash] : null;
}

export function setCachedExtraction(text, report) {
  if (!store.extractionCache) store.extractionCache = {};
  const hash = computeTextHash(text);
  store.extractionCache[hash] = report;
  saveState();
}

/**
 * Human-in-the-Loop Field Correction
 * Allows clinicians to edit extracted values/ranges and tags them with HUMAN_CORRECTED provenance.
 */
export function updateObservationValue(reportId, observationId, updatedFields, clinicianUser) {
  const report = store.reports.find(r => r.id === reportId);
  if (!report) throw new Error("Report not found");

  const obs = (report.observations || []).find(o => o.id === observationId);
  if (!obs) throw new Error("Observation not found");

  const previousValue = obs.value;
  const previousRange = obs.referenceRange;

  if (updatedFields.value !== undefined) {
    obs.value = updatedFields.value;
    obs.numericValue = isNaN(parseFloat(updatedFields.value)) ? null : parseFloat(updatedFields.value);
  }
  if (updatedFields.referenceRange !== undefined) {
    obs.referenceRange = updatedFields.referenceRange;
  }
  if (updatedFields.flag !== undefined) {
    obs.flag = updatedFields.flag;
  }

  // Tag with Human-in-the-Loop Provenance
  obs.provenance = "HUMAN_CORRECTED";
  obs.modifiedBy = clinicianUser || "Dr. Arvind Mehta (Clinician)";
  obs.modifiedAt = new Date().toISOString();

  addAuditEntry(
    "OBSERVATION_HUMAN_CORRECTED",
    obs.modifiedBy,
    "HUMAN_CORRECTED",
    `Clinician modified '${obs.testName}' from [${previousValue} | Ref: ${previousRange}] to [${obs.value} | Ref: ${obs.referenceRange}]. Status: ${obs.flag}.`,
    { reportId, observationId, previousValue, newValue: obs.value }
  );

  saveState();
  return { report, updatedObservation: obs };
}

/**
 * Cross-Report Conflict & Delta Inconsistency Detection
 * Compares incoming observations against patient's previous historical records.
 */
export function computeLongitudinalDeltas(newReport) {
  const deltas = [];
  const priorReports = store.reports
    .filter(r => r.id !== newReport.id && new Date(r.testDate) < new Date(newReport.testDate))
    .sort((a, b) => new Date(b.testDate) - new Date(a.testDate)); // latest first

  if (priorReports.length === 0) return deltas;

  const latestPrior = priorReports[0];

  (newReport.observations || []).forEach(obs => {
    if (obs.numericValue === null || isNaN(obs.numericValue)) return;

    // Search for identical test in latest prior report
    const match = (latestPrior.observations || []).find(p => 
      p.testName.toUpperCase() === obs.testName.toUpperCase() &&
      p.numericValue !== null
    );

    if (match) {
      const diff = Math.round((obs.numericValue - match.numericValue) * 100) / 100;
      const pctChange = Math.round((diff / match.numericValue) * 100);
      const isSignificant = Math.abs(pctChange) >= 20 || (obs.flag !== match.flag && obs.flag !== "NORMAL");

      deltas.push({
        testName: obs.testName,
        currentValue: obs.numericValue,
        priorValue: match.numericValue,
        priorDate: latestPrior.testDate,
        unit: obs.unit,
        diff: diff > 0 ? `+${diff}` : `${diff}`,
        pctChange: pctChange > 0 ? `+${pctChange}%` : `${pctChange}%`,
        isSignificant,
        direction: diff > 0 ? "INCREASED" : diff < 0 ? "DECREASED" : "STABLE",
        flagChange: obs.flag !== match.flag ? `${match.flag} → ${obs.flag}` : null
      });
    }
  });

  return deltas;
}
