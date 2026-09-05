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

export default router;
