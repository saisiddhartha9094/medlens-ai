/**
 * MedLens - In-Memory Clinical State & Audit Store
 * Stores patient demographic context, extracted observation records,
 * and field-level provenance audit logs.
 */

export const store = {
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
    // Patient-reported context (provenance: PATIENT_ENTERED)
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

  // Processed reports with extracted observations
  reports: [],

  // Comprehensive audit log
  auditLog: [
    {
      id: "aud-001",
      timestamp: "2026-06-15T08:35:00.000Z",
      action: "PATIENT_INTAKE_RECORDED",
      actor: "Patient (Self-Reported)",
      provenance: "PATIENT_ENTERED",
      details: "Demographic profile, ABHA ID 91-4829-1029-4821, allergies, and chronic history registered."
    }
  ]
};

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
  return entry;
}
