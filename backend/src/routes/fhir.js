import express from "express";
import { store, addAuditEntry } from "../data/store.js";
import { buildFhirBundle } from "../services/fhirService.js";

const router = express.Router();

// GET FHIR R4 Bundle for active patient and specific report
router.get("/export/:reportId", (req, res) => {
  try {
    const report = store.reports.find(r => r.id === req.params.reportId);
    if (!report) {
      return res.status(404).json({ success: false, error: "Report not found for FHIR export" });
    }

    const fhirBundle = buildFhirBundle(store.patient, report);

    addAuditEntry(
      "FHIR_R4_BUNDLE_GENERATED",
      "ABDM Interoperability Gateway",
      "DERIVED",
      `Exported HL7 FHIR R4 Bundle for report ${report.id} (${fhirBundle.totalEntries} entries) with ABHA ID ${store.patient.abhaId}.`
    );

    res.json({
      success: true,
      bundle: fhirBundle
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET FHIR R4 Patient Resource
router.get("/patient", (req, res) => {
  try {
    const fhirBundle = buildFhirBundle(store.patient, { observations: [] });
    const patientResource = fhirBundle.entry.find(e => e.resource.resourceType === "Patient");
    res.json({
      success: true,
      patientResource: patientResource?.resource
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
