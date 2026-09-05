import { describe, it, expect } from "vitest";
import {
  getReferenceBounds,
  harmonizeUnit,
  calibrateObservation,
  extractCalibrationMetadata,
  calibrateTrendSeries
} from "../src/services/calibrationService.js";

describe("MedLens Clinical Calibration Service", () => {
  describe("getReferenceBounds", () => {
    it("correctly parses dual-boundary standard intervals", () => {
      const bounds = getReferenceBounds("13.0 - 17.0");
      expect(bounds.min).toBe(13.0);
      expect(bounds.max).toBe(17.0);
      expect(bounds.type).toBe("interval");
    });

    it("correctly parses single upper boundary inequality", () => {
      const bounds = getReferenceBounds("< 140.0");
      expect(bounds.min).toBe(0);
      expect(bounds.max).toBe(140.0);
      expect(bounds.type).toBe("upper_only");
    });

    it("gracefully handles absent or empty ranges", () => {
      const bounds = getReferenceBounds("");
      expect(bounds.min).toBeNull();
      expect(bounds.max).toBeNull();
      expect(bounds.type).toBe("none");
    });
  });

  describe("harmonizeUnit", () => {
    it("converts mmol/L glucose to standard mg/dL", () => {
      const result = harmonizeUnit("GLUCOSE, FASTING", 5.5, "mmol/L");
      expect(result.isConverted).toBe(true);
      expect(result.unit).toBe("mg/dL");
      expect(result.value).toBeCloseTo(99.1, 1);
    });

    it("converts umol/L creatinine to standard mg/dL", () => {
      const result = harmonizeUnit("SERUM CREATININE", 88.4, "umol/L");
      expect(result.isConverted).toBe(true);
      expect(result.unit).toBe("mg/dL");
      expect(result.value).toBe(1.0);
    });

    it("preserves already canonical mg/dL units without alteration", () => {
      const result = harmonizeUnit("GLUCOSE, FASTING", 95, "mg/dL");
      expect(result.isConverted).toBe(false);
      expect(result.value).toBe(95);
      expect(result.unit).toBe("mg/dL");
    });
  });

  describe("calibrateObservation", () => {
    it("calibrates an optimal in-range biomarker", () => {
      const obs = {
        testName: "GLUCOSE, FASTING",
        numericValue: 85,
        unit: "mg/dL",
        referenceRange: "70.0 - 100.0"
      };
      const cal = calibrateObservation(obs);
      expect(cal.calibrated).toBe(true);
      expect(cal.normalizedIndex).toBe(0.5);
      expect(cal.percentOfNormal).toBe(50);
      expect(cal.ratioToULN).toBe(0.85);
      expect(cal.calibrationStatus).toBe("OPTIMAL_NORMAL");
    });

    it("calibrates an elevated biomarker above upper reference limit", () => {
      const obs = {
        testName: "GLUCOSE, FASTING",
        numericValue: 142,
        unit: "mg/dL",
        referenceRange: "70.0 - 99.0"
      };
      const cal = calibrateObservation(obs);
      expect(cal.calibrated).toBe(true);
      expect(cal.normalizedIndex).toBeGreaterThan(1.0);
      expect(cal.ratioToULN).toBe(1.43);
      expect(cal.calibrationStatus).toBe("CRITICALLY_ELEVATED");
    });

    it("calibrates a depressed biomarker below lower reference limit", () => {
      const obs = {
        testName: "HAEMOGLOBIN",
        numericValue: 11.8,
        unit: "g/dL",
        referenceRange: "13.0 - 17.0"
      };
      const cal = calibrateObservation(obs);
      expect(cal.calibrated).toBe(true);
      expect(cal.normalizedIndex).toBeLessThan(0.0);
      expect(cal.calibrationStatus).toBe("BELOW_LOWER_LIMIT");
    });

    it("refuses to calibrate when reference range is absent to prevent hallucination", () => {
      const obs = {
        testName: "SPECIALTY_PROTEIN",
        numericValue: 42,
        unit: "U/L",
        referenceRange: ""
      };
      const cal = calibrateObservation(obs);
      expect(cal.calibrated).toBe(false);
      expect(cal.reason).toBe("REFERENCE_RANGE_ABSENT");
      expect(cal.normalizedIndex).toBeNull();
    });
  });

  describe("extractCalibrationMetadata", () => {
    it("extracts analytical methods and instrument names from report text", () => {
      const sampleText = "Method: HPLC (Bio-Rad D-10) for HbA1c; Hexokinase for Plasma Glucose. NABL ISO 15189";
      const meta = extractCalibrationMetadata(sampleText);
      expect(meta.methods).toContain("HPLC (High-Performance Liquid Chromatography)");
      expect(meta.methods).toContain("Hexokinase (Enzymatic)");
      expect(meta.analyzers).toContain("Bio-Rad D-10 Hemoglobin Analyzer");
      expect(meta.accreditations).toContain("NABL (ISO 15189)");
    });
  });

  describe("calibrateTrendSeries", () => {
    it("detects inter-lab calibration shift across multiple diagnostic visits", () => {
      const points = [
        {
          date: "2026-06-15",
          labName: "Dr. Lal PathLabs",
          value: 95,
          unit: "mg/dL",
          referenceRange: "70.0 - 100.0"
        },
        {
          date: "2026-08-10",
          labName: "Metropolis Healthcare",
          value: 104,
          unit: "mg/dL",
          referenceRange: "70.0 - 125.0"
        }
      ];

      const calibratedSeries = calibrateTrendSeries(points);
      expect(calibratedSeries.length).toBe(2);
      expect(calibratedSeries[1].calibration.interLabShift).not.toBeNull();
      expect(calibratedSeries[1].calibration.interLabShift.previousLab).toBe("Dr. Lal PathLabs");
      expect(calibratedSeries[1].calibration.interLabShift.currentLab).toBe("Metropolis Healthcare");
    });
  });
});
