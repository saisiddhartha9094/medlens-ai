import { describe, it, expect } from "vitest";
import { scanDrugLabInteractions, DLI_RULES } from "../src/services/dliService.js";
import { calculateSeriesVelocity, computeAllBiomarkerVelocities } from "../src/services/velocityService.js";
import { evaluateCareGaps, SCREENING_PROTOCOLS } from "../src/services/careGapService.js";

describe("MedLens Clinical Extensions Suite", () => {
  describe("Drug-Lab Interaction (DLI) Scanner", () => {
    it("flags Metformin + elevated Creatinine interaction", () => {
      const medications = ["Metformin 500mg twice daily"];
      const observations = [
        { testName: "SERUM CREATININE", value: 1.6, numericValue: 1.6, unit: "mg/dL" }
      ];

      const interactions = scanDrugLabInteractions(medications, observations);
      expect(interactions.length).toBe(1);
      expect(interactions[0].ruleId).toBe("dli-metformin-creat");
      expect(interactions[0].severity).toBe("HIGH");
      expect(interactions[0].mechanism).toContain("Lactic Acidosis");
    });

    it("does not flag Metformin when Creatinine is normal", () => {
      const medications = ["Metformin 500mg twice daily"];
      const observations = [
        { testName: "SERUM CREATININE", value: 0.9, numericValue: 0.9, unit: "mg/dL" }
      ];

      const interactions = scanDrugLabInteractions(medications, observations);
      expect(interactions.length).toBe(0);
    });

    it("flags Telmisartan + elevated Potassium interaction", () => {
      const medications = ["Telmisartan 40mg once daily"];
      const observations = [
        { testName: "SERUM POTASSIUM", value: 5.4, numericValue: 5.4, unit: "mmol/L" }
      ];

      const interactions = scanDrugLabInteractions(medications, observations);
      expect(interactions.length).toBe(1);
      expect(interactions[0].ruleId).toBe("dli-arb-acei-potassium");
      expect(interactions[0].severity).toBe("HIGH");
    });

    it("gracefully returns empty array on empty inputs", () => {
      expect(scanDrugLabInteractions([], [])).toEqual([]);
      expect(scanDrugLabInteractions(null, null)).toEqual([]);
    });
  });

  describe("Biomarker Velocity Engine", () => {
    it("calculates rate of change and flags rapid glycemic velocity", () => {
      const points = [
        { date: "2026-06-15", value: 95, unit: "mg/dL" },
        { date: "2026-08-10", value: 142, unit: "mg/dL" }
      ];

      const velocity = calculateSeriesVelocity("GLUCOSE, FASTING", points);
      expect(velocity.hasVelocity).toBe(true);
      expect(velocity.daysSpan).toBe(56);
      expect(velocity.totalDelta).toBe(47);
      expect(velocity.velocityPerMonth).toBeGreaterThan(20);
      expect(velocity.isAlert).toBe(true);
      expect(velocity.alertSeverity).toBe("HIGH");
      expect(velocity.trajectoryDirection).toBe("UPWARD_ACCELERATING");
    });

    it("identifies precipitous hemoglobin drop", () => {
      const points = [
        { date: "2026-06-01", value: 14.5, unit: "g/dL" },
        { date: "2026-07-01", value: 12.0, unit: "g/dL" }
      ];

      const velocity = calculateSeriesVelocity("HAEMOGLOBIN", points);
      expect(velocity.hasVelocity).toBe(true);
      expect(velocity.velocityPerMonth).toBeLessThan(-2.0);
      expect(velocity.isAlert).toBe(true);
      expect(velocity.alertTitle).toContain("Precipitous Hemoglobin Decline");
    });

    it("returns hasVelocity: false when only 1 point is available", () => {
      const points = [{ date: "2026-06-15", value: 95, unit: "mg/dL" }];
      const velocity = calculateSeriesVelocity("GLUCOSE", points);
      expect(velocity.hasVelocity).toBe(false);
      expect(velocity.reason).toBe("INSUFFICIENT_DATA_POINTS");
    });
  });

  describe("Preventive Care Gap & Screening Reminder Engine", () => {
    it("identifies overdue microalbumin screening for diabetic patient with no urine test", () => {
      const patient = {
        age: 48,
        gender: "Male",
        patientContext: {
          chronicConditions: ["Type 2 Diabetes Mellitus", "Hypertension"]
        }
      };

      const reports = [
        {
          testDate: "2026-06-15",
          observations: [{ testName: "HAEMOGLOBIN", value: "14.0" }]
        }
      ];

      const gapsReport = evaluateCareGaps(patient, reports);
      expect(gapsReport.totalGapsEvaluated).toBeGreaterThan(0);
      
      const uacrGap = gapsReport.careGaps.find(g => g.protocolId === "gap-dm-uacr");
      expect(uacrGap).toBeDefined();
      expect(uacrGap.status).toBe("OVERDUE");
      expect(uacrGap.actionRequired).toBe(true);
      expect(uacrGap.guidelineBody).toContain("ADA");
    });

    it("marks lipid panel as UP_TO_DATE when recent report exists", () => {
      const patient = {
        age: 48,
        gender: "Male",
        patientContext: { chronicConditions: ["Dyslipidemia"] }
      };

      const today = new Date().toISOString().split("T")[0];
      const reports = [
        {
          testDate: today,
          observations: [{ testName: "TOTAL CHOLESTEROL", value: "185" }]
        }
      ];

      const gapsReport = evaluateCareGaps(patient, reports);
      const lipidGap = gapsReport.careGaps.find(g => g.protocolId === "gap-age-lipid");
      expect(lipidGap).toBeDefined();
      expect(lipidGap.status).toBe("UP_TO_DATE");
      expect(lipidGap.actionRequired).toBe(false);
    });
  });
});
