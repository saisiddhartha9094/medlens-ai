import { describe, it, expect } from "vitest";
import {
  normalizeText,
  extractNumbers,
  parseRangeTokens,
  verifyReferenceRange,
  evaluateValueStatus
} from "../src/services/validatorService.js";

describe("Anti-Hallucination Validator Service", () => {
  
  describe("Pure Utility Functions", () => {
    it("normalizeText handles empty, null, and punctuation strings", () => {
      expect(normalizeText("")).toBe("");
      expect(normalizeText(null)).toBe("");
      expect(normalizeText(undefined)).toBe("");
      expect(normalizeText("  HAEMOGLOBIN: 13.0 - 17.0 g/dL!  ")).toBe("haemoglobin 13.0 - 17.0 g/dl");
    });

    it("extractNumbers pulls discrete numeric tokens", () => {
      expect(extractNumbers("")).toEqual([]);
      expect(extractNumbers(null)).toEqual([]);
      expect(extractNumbers("13.0 - 17.0")).toEqual([13.0, 17.0]);
      expect(extractNumbers("Desirable: < 200 mg/dL")).toEqual([200]);
      expect(extractNumbers("No numbers present")).toEqual([]);
    });

    it("parseRangeTokens parses intervals and boundary inequalities", () => {
      expect(parseRangeTokens("")).toEqual([]);
      expect(parseRangeTokens(null)).toEqual([]);

      const interval = parseRangeTokens("13.0 - 17.0");
      expect(interval).toHaveLength(1);
      expect(interval[0].type).toBe("interval");
      expect(interval[0].min).toBe(13.0);
      expect(interval[0].max).toBe(17.0);

      const bound = parseRangeTokens("< 200");
      expect(bound).toHaveLength(1);
      expect(bound[0].type).toBe("bound");
      expect(bound[0].op).toBe("<");
      expect(bound[0].val).toBe(200);
    });
  });

  describe("verifyReferenceRange (Core Anti-Hallucination Guard)", () => {
    const ocrSample = `DR. LAL PATHLABS LTD.
HAEMOGLOBIN                   11.8     g/dL        13.0 - 17.0
TOTAL CHOLESTEROL            242.0     mg/dL       < 200
EXPERIMENTAL CYTOKINE IL-6   18.5      pg/mL       (Reference interval pending clinical trial standardization)
ANTINUCLEAR ANTIBODY (ANA)   Negative  Titer       Negative at 1:40`;

    it("Branch 1: Verifies exact substring match in source text", () => {
      const result = verifyReferenceRange("HAEMOGLOBIN", "13.0 - 17.0", ocrSample);
      expect(result.isValid).toBe(true);
      expect(result.isHallucinated).toBe(false);
      expect(result.status).toBe("VERIFIED_EXACT_MATCH");
      expect(result.provenance).toBe("AI_EXTRACTED_VERIFIED");
      expect(result.confidence).toBe(1.0);
    });

    it("Branch 2: Verifies numeric token bounds when whitespace varies", () => {
      const result = verifyReferenceRange("TOTAL CHOLESTEROL", "<200", ocrSample);
      expect(result.isValid).toBe(true);
      expect(result.provenance).toBe("AI_EXTRACTED_VERIFIED");
      expect(result.confidence).toBeGreaterThanOrEqual(0.9);
    });

    it("Branch 3: Verifies qualitative interval descriptions", () => {
      const result = verifyReferenceRange("ANTINUCLEAR ANTIBODY (ANA)", "Negative at 1:40", ocrSample);
      expect(result.isValid).toBe(true);
      expect(result.isHallucinated).toBe(false);
      expect(result.provenance).toBe("AI_EXTRACTED_VERIFIED");
    });

    it("Branch 4: Correctly identifies absent or pending reference ranges", () => {
      const result1 = verifyReferenceRange("EXPERIMENTAL CYTOKINE IL-6", "Pending clinical trial standardization", ocrSample);
      expect(result1.isValid).toBe(false);
      expect(result1.isAbsentInSource).toBe(true);
      expect(result1.status).toBe("RANGE_ABSENT_IN_SOURCE");

      const result2 = verifyReferenceRange("TEST", "N/A", ocrSample);
      expect(result2.isValid).toBe(false);
      expect(result2.isAbsentInSource).toBe(true);
    });

    it("Branch 5 (The USP): BLOCKS fabricated/hallucinated ranges with altered numbers", () => {
      // LLM hallucinates range 10.0 - 12.0 when document has 13.0 - 17.0
      const result = verifyReferenceRange("HAEMOGLOBIN", "10.0 - 12.0", ocrSample);
      expect(result.isValid).toBe(false);
      expect(result.isHallucinated).toBe(true);
      expect(result.status).toBe("HALLUCINATION_BLOCKED");
      expect(result.provenance).toBe("AI_EXTRACTED_NEEDS_REVIEW");
      expect(result.confidence).toBeLessThan(0.2);
    });
  });

  describe("evaluateValueStatus", () => {
    const verifiedResult = { isValid: true };
    const unverifiedResult = { isValid: false, reason: "Hallucination blocked" };

    it("Refuses to assign High/Low flags if validationResult is invalid", () => {
      const evalStatus = evaluateValueStatus("11.8", "13.0 - 17.0", unverifiedResult);
      expect(evalStatus.flag).toBe("UNVERIFIED");
      expect(evalStatus.label).toBe("Needs Review");
    });

    it("Correctly evaluates standard numeric intervals", () => {
      // Below min
      const low = evaluateValueStatus("11.8", "13.0 - 17.0", verifiedResult);
      expect(low.flag).toBe("LOW");

      // Within interval
      const norm = evaluateValueStatus("14.5", "13.0 - 17.0", verifiedResult);
      expect(norm.flag).toBe("NORMAL");

      // Above max
      const high = evaluateValueStatus("18.2", "13.0 - 17.0", verifiedResult);
      expect(high.flag).toBe("HIGH");
    });

    it("Correctly evaluates boundary inequalities (< and >)", () => {
      const under200 = evaluateValueStatus("180", "< 200", verifiedResult);
      expect(under200.flag).toBe("NORMAL");

      const over200 = evaluateValueStatus("242", "< 200", verifiedResult);
      expect(over200.flag).toBe("HIGH");

      const over40 = evaluateValueStatus("52", "> 40", verifiedResult);
      expect(over40.flag).toBe("NORMAL");

      const under40 = evaluateValueStatus("35", "> 40", verifiedResult);
      expect(under40.flag).toBe("LOW");
    });

    it("Correctly evaluates qualitative values", () => {
      const neg = evaluateValueStatus("Negative", "Negative", verifiedResult);
      expect(neg.flag).toBe("NORMAL");

      const pos = evaluateValueStatus("Positive", "Negative", verifiedResult);
      expect(pos.flag).toBe("ABNORMAL");
    });
  });

});
