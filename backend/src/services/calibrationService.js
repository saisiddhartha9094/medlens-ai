/**
 * MedLens - Clinical Laboratory Data Calibration & Normalization Service
 *
 * SCIENTIFIC FOUNDATION:
 * When patient test results originate from different diagnostic laboratories or instruments,
 * raw numeric values cannot be compared naively due to:
 * 1. Reference Interval Drift (varying reference intervals across analyzers)
 * 2. Analytical Assay Calibration & Method Differences (e.g. Hexokinase vs Glucose Oxidase)
 * 3. Unit Discordance (e.g. mg/dL vs mmol/L)
 * 4. Multiples of Upper Limit of Normal (ULN), standard in hepatology and cardiology guidelines
 *
 * This service calculates:
 * - normalizedIndex: [0.0 = Lower bound of normal, 1.0 = Upper bound of normal]
 * - ratioToULN: value / upper_limit_of_normal (e.g. 1.25x ULN)
 * - unit harmonization (converting standard biomarkers to canonical LOINC units)
 * - inter-lab calibration drift detection (distinguishes analytical shifts from true physiological changes)
 * - analytical method & analyzer metadata extraction
 */

import { parseRangeTokens } from "./validatorService.js";

// Unit conversion factors to canonical clinical units (LOINC standard)
export const UNIT_CONVERSIONS = {
  "GLUCOSE": {
    "mmol/L": { toCanonical: (v) => v * 18.0182, canonicalUnit: "mg/dL" },
    "mg/dL": { toCanonical: (v) => v, canonicalUnit: "mg/dL" }
  },
  "CHOLESTEROL": {
    "mmol/L": { toCanonical: (v) => v * 38.67, canonicalUnit: "mg/dL" },
    "mg/dL": { toCanonical: (v) => v, canonicalUnit: "mg/dL" }
  },
  "TRIGLYCERIDES": {
    "mmol/L": { toCanonical: (v) => v * 88.57, canonicalUnit: "mg/dL" },
    "mg/dL": { toCanonical: (v) => v, canonicalUnit: "mg/dL" }
  },
  "CREATININE": {
    "umol/L": { toCanonical: (v) => v / 88.4, canonicalUnit: "mg/dL" },
    "µmol/L": { toCanonical: (v) => v / 88.4, canonicalUnit: "mg/dL" },
    "mg/dL": { toCanonical: (v) => v, canonicalUnit: "mg/dL" }
  },
  "HAEMOGLOBIN": {
    "g/L": { toCanonical: (v) => v / 10.0, canonicalUnit: "g/dL" },
    "g/dL": { toCanonical: (v) => v, canonicalUnit: "g/dL" }
  },
  "BILIRUBIN": {
    "umol/L": { toCanonical: (v) => v / 17.1, canonicalUnit: "mg/dL" },
    "µmol/L": { toCanonical: (v) => v / 17.1, canonicalUnit: "mg/dL" },
    "mg/dL": { toCanonical: (v) => v, canonicalUnit: "mg/dL" }
  }
};

/**
 * Parses numeric bounds from a reference range string
 */
export function getReferenceBounds(rangeStr) {
  if (!rangeStr || typeof rangeStr !== "string") {
    return { min: null, max: null, type: "none" };
  }

  const tokens = parseRangeTokens(rangeStr);
  if (tokens.length === 0) {
    const intervalMatch = rangeStr.match(/(\d+(?:\.\d+)?)\s*[-–—to]+\s*(\d+(?:\.\d+)?)/i);
    if (intervalMatch) {
      return {
        min: parseFloat(intervalMatch[1]),
        max: parseFloat(intervalMatch[2]),
        type: "interval"
      };
    }
    const ltMatch = rangeStr.match(/<\s*=?\s*(\d+(?:\.\d+)?)/);
    if (ltMatch) {
      return {
        min: 0,
        max: parseFloat(ltMatch[1]),
        type: "upper_only"
      };
    }
    const gtMatch = rangeStr.match(/>\s*=?\s*(\d+(?:\.\d+)?)/);
    if (gtMatch) {
      return {
        min: parseFloat(gtMatch[1]),
        max: null,
        type: "lower_only"
      };
    }
    return { min: null, max: null, type: "unparsed" };
  }

  const first = tokens[0];
  if (first.type === "interval") {
    return { min: first.min, max: first.max, type: "interval" };
  }
  if (first.type === "bound") {
    if (first.op.startsWith("<")) {
      return { min: 0, max: first.val, type: "upper_only" };
    }
    if (first.op.startsWith(">")) {
      return { min: first.val, max: null, type: "lower_only" };
    }
  }

  return { min: null, max: null, type: "unparsed" };
}

/**
 * Harmonizes test unit to canonical clinical standard
 */
export function harmonizeUnit(testName, value, unit) {
  if (value === null || isNaN(value) || !unit) {
    return { value, unit, isConverted: false };
  }

  const normTest = testName.toUpperCase();
  const normUnit = unit.trim();

  for (const [key, mapping] of Object.entries(UNIT_CONVERSIONS)) {
    if (normTest.includes(key)) {
      if (mapping[normUnit]) {
        const converter = mapping[normUnit];
        const canonicalVal = converter.toCanonical(value);
        return {
          value: Math.round(canonicalVal * 100) / 100,
          unit: converter.canonicalUnit,
          originalValue: value,
          originalUnit: unit,
          isConverted: normUnit !== converter.canonicalUnit
        };
      }
    }
  }

  return { value, unit, isConverted: false };
}

/**
 * Calibrates a single observation against its lab's specific reference interval
 */
export function calibrateObservation(obs) {
  const value = obs.numericValue !== undefined && obs.numericValue !== null ? obs.numericValue : parseFloat(obs.value);
  const rangeStr = obs.referenceRange || "";
  const testName = obs.testName || "";

  if (value === null || isNaN(value)) {
    return {
      calibrated: false,
      reason: "NON_NUMERIC_VALUE",
      normalizedIndex: null,
      ratioToULN: null
    };
  }

  const bounds = getReferenceBounds(rangeStr);

  if (bounds.type === "none" || (bounds.min === null && bounds.max === null)) {
    return {
      calibrated: false,
      reason: "REFERENCE_RANGE_ABSENT",
      normalizedIndex: null,
      ratioToULN: null,
      calibrationStatus: "UNVERIFIED_ABSENT_RANGE"
    };
  }

  const unitHarmonization = harmonizeUnit(testName, value, obs.unit || "");
  const effectiveValue = unitHarmonization.isConverted ? unitHarmonization.value : value;

  let normalizedIndex = null;
  let ratioToULN = null;
  let percentOfNormal = null;
  let calibrationStatus = "NORMAL";

  if (bounds.min !== null && bounds.max !== null && bounds.max > bounds.min) {
    const rangeSpan = bounds.max - bounds.min;
    normalizedIndex = (effectiveValue - bounds.min) / rangeSpan;
    ratioToULN = Math.round((effectiveValue / bounds.max) * 100) / 100;
    percentOfNormal = Math.round(normalizedIndex * 100);

    if (normalizedIndex < 0.0) {
      calibrationStatus = "BELOW_LOWER_LIMIT";
    } else if (normalizedIndex > 1.0) {
      calibrationStatus = normalizedIndex > 1.5 ? "CRITICALLY_ELEVATED" : "ABOVE_UPPER_LIMIT";
    } else if (normalizedIndex >= 0.85 || normalizedIndex <= 0.15) {
      calibrationStatus = "BORDERLINE_NORMAL";
    } else {
      calibrationStatus = "OPTIMAL_NORMAL";
    }
  } else if (bounds.max !== null) {
    normalizedIndex = effectiveValue / bounds.max;
    ratioToULN = Math.round((effectiveValue / bounds.max) * 100) / 100;
    percentOfNormal = Math.round(normalizedIndex * 100);
    calibrationStatus = normalizedIndex > 1.0 ? "ABOVE_UPPER_LIMIT" : "OPTIMAL_NORMAL";
  } else if (bounds.min !== null) {
    normalizedIndex = effectiveValue / bounds.min;
    ratioToULN = null;
    percentOfNormal = Math.round(normalizedIndex * 100);
    calibrationStatus = effectiveValue < bounds.min ? "BELOW_LOWER_LIMIT" : "OPTIMAL_NORMAL";
  }

  return {
    calibrated: true,
    value,
    testName,
    unit: obs.unit || "",
    referenceRange: rangeStr,
    bounds,
    normalizedIndex: normalizedIndex !== null ? Math.round(normalizedIndex * 1000) / 1000 : null,
    percentOfNormal,
    ratioToULN,
    calibrationStatus,
    harmonized: unitHarmonization,
    calibratedBand: {
      lowerBoundary: bounds.min,
      upperBoundary: bounds.max,
      midpoint: bounds.min !== null && bounds.max !== null ? (bounds.min + bounds.max) / 2 : null
    }
  };
}

/**
 * Extracts analyzer, method, and calibration quality metadata from raw report text
 */
export function extractCalibrationMetadata(rawText) {
  if (!rawText) return null;

  const metadata = {
    methods: [],
    analyzers: [],
    accreditations: []
  };

  const methodPatterns = [
    { name: "HPLC (High-Performance Liquid Chromatography)", regex: /HPLC|high[- ]performance liquid chromatography/i },
    { name: "Hexokinase (Enzymatic)", regex: /Hexokinase/i },
    { name: "Glucose Oxidase / Peroxidase (GOD-POD)", regex: /GOD[- ]POD|glucose oxidase/i },
    { name: "Chemiluminescent Immunoassay (CLIA/CMIA)", regex: /CMIA|CLIA|chemiluminescent/i },
    { name: "Enzyme-Linked Immunosorbent Assay (ELISA)", regex: /ELISA/i },
    { name: "Ion-Selective Electrode (ISE)", regex: /ISE|ion[- ]selective electrode/i },
    { name: "Jaffe Kinetic Method", regex: /Jaffe|picrate/i },
    { name: "Spectrophotometry / Photometric", regex: /Photometric|Spectrophotom/i }
  ];

  for (const pat of methodPatterns) {
    if (pat.regex.test(rawText)) {
      metadata.methods.push(pat.name);
    }
  }

  const analyzerPatterns = [
    { name: "Bio-Rad D-10 Hemoglobin Analyzer", regex: /Bio[- ]Rad(?:\s+D[- ]10)?/i },
    { name: "Roche Cobas 6000/8000", regex: /Roche|Cobas/i },
    { name: "Beckman Coulter AU Series", regex: /Beckman(?:\s+Coulter)?/i },
    { name: "Abbott Architect / Alinity", regex: /Abbott|Architect|Alinity/i },
    { name: "Sysmex Hematology Analyzer", regex: /Sysmex/i }
  ];

  for (const pat of analyzerPatterns) {
    if (pat.regex.test(rawText)) {
      metadata.analyzers.push(pat.name);
    }
  }

  if (/NABL|ISO\s*15189/i.test(rawText)) metadata.accreditations.push("NABL (ISO 15189)");
  if (/CAP(?:\s+Accredited|\s+Certified)/i.test(rawText)) metadata.accreditations.push("CAP Certified");

  return metadata;
}

/**
 * Calibrates a multi-visit longitudinal trend series for a biomarker
 * Identifies inter-lab reference range drift and distinguishes true physiological changes
 * from assay calibration artifacts.
 */
export function calibrateTrendSeries(points) {
  if (!points || points.length === 0) return [];

  return points.map((pt, idx) => {
    const calibrated = calibrateObservation(pt);
    let interLabShift = null;
    let isCalibrationArtifact = false;
    let artifactExplanation = null;

    if (idx > 0) {
      const prev = points[idx - 1];
      const prevCal = calibrateObservation(prev);

      if (calibrated.calibrated && prevCal.calibrated) {
        const minDiff = (calibrated.bounds.min || 0) - (prevCal.bounds.min || 0);
        const maxDiff = (calibrated.bounds.max || 0) - (prevCal.bounds.max || 0);

        if (Math.abs(minDiff) > 0.01 || Math.abs(maxDiff) > 0.01) {
          interLabShift = {
            previousLab: prev.labName || "Prior Lab",
            currentLab: pt.labName || "Current Lab",
            previousRange: prev.referenceRange,
            currentRange: pt.referenceRange,
            upperDelta: maxDiff
          };

          const rawDelta = pt.value - prev.value;
          const indexDelta = (calibrated.normalizedIndex || 0) - (prevCal.normalizedIndex || 0);

          if (Math.abs(rawDelta) > 0 && Math.abs(indexDelta) < 0.1) {
            isCalibrationArtifact = true;
            artifactExplanation = `Raw value shifted (${rawDelta > 0 ? "+" : ""}${rawDelta.toFixed(1)} ${pt.unit || ""}), but normalized relative position remained stable (${Math.round((calibrated.normalizedIndex || 0) * 100)}% vs ${Math.round((prevCal.normalizedIndex || 0) * 100)}%) due to lab reference range calibration drift.`;
          }
        }
      }
    }

    return {
      ...pt,
      calibration: {
        ...calibrated,
        interLabShift,
        isCalibrationArtifact,
        artifactExplanation
      }
    };
  });
}
