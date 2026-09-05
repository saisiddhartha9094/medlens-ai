import express from "express";
import { verifyReferenceRange, evaluateValueStatus } from "../services/validatorService.js";
import { addAuditEntry } from "../data/store.js";

const router = express.Router();

/**
 * POST /api/validator/verify-range
 * Playground test endpoint to evaluate reference range hallucination prevention.
 */
router.post("/verify-range", (req, res) => {
  try {
    const { testName, observedValue, referenceRange, sourceOcrText } = req.body;

    if (!testName || !sourceOcrText) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameters: testName and sourceOcrText are required."
      });
    }

    const validation = verifyReferenceRange(testName, referenceRange, sourceOcrText);
    const evaluation = evaluateValueStatus(observedValue || "0", referenceRange, validation);

    addAuditEntry(
      validation.isHallucinated ? "HALLUCINATION_GUARD_TRIGGERED" : "RANGE_VALIDATION_PERFORMED",
      "MedLens Anti-Hallucination Engine",
      validation.provenance,
      `Validation check for '${testName}' with range '${referenceRange}': ${validation.status}.`,
      { testName, referenceRange, validation, evaluation }
    );

    res.json({
      success: true,
      testName,
      observedValue,
      referenceRange,
      validation,
      evaluation,
      verdict: validation.isValid
        ? "PASSED: Range Grounded in Source OCR"
        : validation.isHallucinated
          ? "BLOCKED: Hallucination Detected (Range Not Found in Source)"
          : "ATTENTION: Range Absent in Source Document"
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/validator/calibrate
 * Calibrate a clinical data point against reference ranges and unit standards
 */
router.post("/calibrate", async (req, res) => {
  try {
    const { calibrateObservation } = await import("../services/calibrationService.js");
    const { testName, value, unit, referenceRange, labName } = req.body;

    if (value === undefined || value === null) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameter: 'value' is required."
      });
    }

    const obs = {
      testName: testName || "UNSPECIFIED_TEST",
      value,
      numericValue: parseFloat(value),
      unit: unit || "",
      referenceRange: referenceRange || "",
      labName: labName || "Unknown Laboratory"
    };

    const calibration = calibrateObservation(obs);

    addAuditEntry(
      "DATA_CALIBRATION_PERFORMED",
      "MedLens Calibration Service",
      "AI_DERIVED",
      `Calibrated '${obs.testName}' (${obs.value} ${obs.unit}): status ${calibration.calibrationStatus}, ratio to ULN: ${calibration.ratioToULN || 'N/A'}.`,
      { obs, calibration }
    );

    res.json({
      success: true,
      observation: obs,
      calibration
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

