import express from "express";
import { store, addAuditEntry } from "../data/store.js";

const router = express.Router();

// GET current patient intake details
router.get("/", (req, res) => {
  res.json({
    success: true,
    patient: store.patient,
    provenance: "PATIENT_ENTERED"
  });
});

// POST update patient intake details
router.post("/", (req, res) => {
  try {
    const { fullName, age, gender, abhaId, phone, email, patientContext } = req.body;

    store.patient = {
      ...store.patient,
      fullName: fullName || store.patient.fullName,
      age: age ? parseInt(age) : store.patient.age,
      gender: gender || store.patient.gender,
      abhaId: abhaId || store.patient.abhaId,
      phone: phone || store.patient.phone,
      email: email || store.patient.email,
      patientContext: {
        ...store.patient.patientContext,
        ...patientContext
      },
      updatedAt: new Date().toISOString()
    };

    addAuditEntry(
      "PATIENT_INTAKE_UPDATED",
      "Patient / Primary User",
      "PATIENT_ENTERED",
      `Patient intake details updated for ${store.patient.fullName} (ABHA: ${store.patient.abhaId}).`
    );

    res.json({
      success: true,
      message: "Patient intake updated successfully",
      patient: store.patient
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/intake/dli - Drug-Lab Interaction Scanner
router.get("/dli", async (req, res) => {
  try {
    const { scanDrugLabInteractions } = await import("../services/dliService.js");
    const medications = store.patient?.patientContext?.currentMedications || [];
    
    // Aggregate observations from all reports
    const allObservations = [];
    (store.reports || []).forEach(r => {
      (r.observations || []).forEach(obs => {
        allObservations.push({
          ...obs,
          reportDate: r.testDate,
          labName: r.labName
        });
      });
    });

    const interactions = scanDrugLabInteractions(medications, allObservations);

    res.json({
      success: true,
      patientName: store.patient.fullName,
      activeMedications: medications,
      totalInteractionsCount: interactions.length,
      criticalCount: interactions.filter(i => i.severity === "HIGH").length,
      interactions
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/intake/care-gaps - Preventive Screening & Care Gap Engine
router.get("/care-gaps", async (req, res) => {
  try {
    const { evaluateCareGaps } = await import("../services/careGapService.js");
    const evaluation = evaluateCareGaps(store.patient, store.reports || []);

    res.json({
      success: true,
      evaluation
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

