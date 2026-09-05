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

export default router;
