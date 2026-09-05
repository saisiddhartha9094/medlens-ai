/**
 * MedLens - Anti-Hallucination Reference-Range Validator
 * 
 * CORE RESPONSIBLE AI GUARD:
 * Ensures the system never invents, infers, or hallucinates reference intervals
 * from LLM parametric memory. Every reference range MUST be grounded verbatim
 * or within high-confidence token windows in the source document OCR text.
 * 
 * CLINICAL RIGOR RULE:
 * Numeric boundaries (e.g. 13.0 vs 10.0) MUST match exact numbers found in the
 * source text. Levenshtein fuzziness is ONLY allowed for layout whitespace,
 * punctuation, and descriptor labels (e.g. "Desirable:", "Ref:"), NEVER for altered digits.
 */

/**
 * Normalizes text for comparison: lowercases, collapses whitespace, strips extraneous punctuation
 */
export function normalizeText(str) {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/[^\w\d.<>=\-+%/]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extracts all numeric values from a string
 */
export function extractNumbers(str) {
  if (!str) return [];
  const matches = str.match(/\b\d+(?:\.\d+)?\b/g);
  return matches ? matches.map(n => parseFloat(n)) : [];
}

/**
 * Extracts numbers and boundary operators (<, >, <=, >=, -) from a range string
 */
export function parseRangeTokens(rangeStr) {
  if (!rangeStr) return [];
  const normalized = rangeStr.replace(/,/g, "").trim();
  const tokens = [];

  // Match intervals like "13.0 - 17.0" or "70 to 99"
  const intervalMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:[-–—]|to)\s*(\d+(?:\.\d+)?)/i);
  if (intervalMatch) {
    tokens.push({
      type: "interval",
      min: parseFloat(intervalMatch[1]),
      max: parseFloat(intervalMatch[2]),
      raw: intervalMatch[0]
    });
  }

  // Match inequalities like "< 200", "<= 100", "> 40", ">= 240"
  const boundMatches = normalized.matchAll(/([<>]=?)\s*(\d+(?:\.\d+)?)/g);
  for (const m of boundMatches) {
    tokens.push({
      type: "bound",
      op: m[1].trim(),
      val: parseFloat(m[2]),
      raw: m[0]
    });
  }

  return tokens;
}

/**
 * Validates whether an extracted reference range exists in the source OCR text.
 * 
 * @param {string} testName - Name of the test
 * @param {string} referenceRange - Extracted reference range from LLM
 * @param {string} sourceOcrText - Raw extracted text from the lab report
 * @returns {Object} Verification result with audit trail and confidence score
 */
export function verifyReferenceRange(testName, referenceRange, sourceOcrText) {
  const isAbsent = !referenceRange || 
    referenceRange.trim() === "" || 
    /^(n\/?a|none|not provided|not established)$/i.test(referenceRange.trim()) ||
    /pending|not established|standardization|pending clinical/i.test(referenceRange);

  if (isAbsent) {
    return {
      isValid: false,
      isHallucinated: false,
      isAbsentInSource: true,
      status: "RANGE_ABSENT_IN_SOURCE",
      confidence: 1.0,
      provenance: "AI_EXTRACTED_NEEDS_REVIEW",
      reason: "No reference interval was provided in the source document. Clinical correlation required.",
      recommendation: "Flagged for manual review. MedLens refuses to invent reference intervals.",
      matchSnippet: null
    };
  }

  const normSource = normalizeText(sourceOcrText);
  const normRange = normalizeText(referenceRange);

  // 1. Exact Substring Match Check
  if (normSource.includes(normRange)) {
    const index = normSource.indexOf(normRange);
    const start = Math.max(0, index - 25);
    const end = Math.min(normSource.length, index + normRange.length + 25);
    const snippet = normSource.substring(start, end);

    return {
      isValid: true,
      isHallucinated: false,
      isAbsentInSource: false,
      status: "VERIFIED_EXACT_MATCH",
      confidence: 1.0,
      provenance: "AI_EXTRACTED_VERIFIED",
      matchType: "EXACT_SUBSTRING",
      reason: "Extracted reference interval matches source document verbatim.",
      matchSnippet: `...${snippet}...`
    };
  }

  // 2. Strict Numeric Grounding Check
  // In clinical reports, numbers in the range must exist in the source text!
  const rangeNumbers = extractNumbers(referenceRange);
  if (rangeNumbers.length > 0) {
    // Check if every number extracted in the range actually appears in the source text
    const missingNumbers = rangeNumbers.filter(num => {
      // Look for the number as a discrete numeric token
      const numStr = num.toString();
      const regex = new RegExp(`\\b${numStr.replace(".", "\\.")}\\b`);
      return !regex.test(sourceOcrText);
    });

    if (missingNumbers.length > 0) {
      // At least one number in the claimed range DOES NOT exist in the source report!
      // This is a definitive hallucination flag.
      return {
        isValid: false,
        isHallucinated: true,
        isAbsentInSource: false,
        status: "HALLUCINATION_BLOCKED",
        confidence: 0.05,
        provenance: "AI_EXTRACTED_NEEDS_REVIEW",
        reason: `ANTI-HALLUCINATION GUARD TRIGGERED: Reference interval "${referenceRange}" contains values [${missingNumbers.join(", ")}] not present anywhere in the source document OCR.`,
        recommendation: "Evaluation blocked. MedLens strictly prohibits hallucinated or externally inferred ranges.",
        matchSnippet: null
      };
    }

    // All numbers exist in source; now verify if they appear together in the test context
    const rangeTokens = parseRangeTokens(referenceRange);
    if (rangeTokens.length > 0) {
      let matchedSnippets = [];
      let contextValid = false;

      for (const token of rangeTokens) {
        if (token.type === "interval") {
          const minStr = token.min.toString();
          const maxStr = token.max.toString();
          const regex = new RegExp(`${minStr.replace(".", "\\.")}\\s*[-–—to]+\\s*${maxStr.replace(".", "\\.")}`, "i");
          const match = sourceOcrText.match(regex);
          if (match) {
            matchedSnippets.push(match[0]);
            contextValid = true;
          }
        } else if (token.type === "bound") {
          const valStr = token.val.toString();
          const op = token.op.replace(/[<>]/g, "\\$&");
          const regex = new RegExp(`${op}\\s*=?\\s*${valStr.replace(".", "\\.")}`, "i");
          const match = sourceOcrText.match(regex);
          if (match) {
            matchedSnippets.push(match[0]);
            contextValid = true;
          }
        }
      }

      if (contextValid && matchedSnippets.length > 0) {
        return {
          isValid: true,
          isHallucinated: false,
          isAbsentInSource: false,
          status: "VERIFIED_NUMERIC_BOUNDS",
          confidence: 0.95,
          provenance: "AI_EXTRACTED_VERIFIED",
          matchType: "NUMERIC_TOKEN_WINDOW",
          reason: "Numeric range bounds strictly verified within source document text.",
          matchSnippet: matchedSnippets.join(", ")
        };
      }
    }
  }

  // 3. Qualitative / Non-numeric exact match check (e.g. "Negative at 1:40")
  if (rangeNumbers.length === 0) {
    const qualTokens = normRange.split(" ").filter(w => w.length > 2);
    const allFound = qualTokens.every(t => normSource.includes(t));
    if (allFound) {
      return {
        isValid: true,
        isHallucinated: false,
        isAbsentInSource: false,
        status: "VERIFIED_QUALITATIVE_MATCH",
        confidence: 0.90,
        provenance: "AI_EXTRACTED_VERIFIED",
        matchType: "QUALITATIVE_TOKEN_MATCH",
        reason: "Qualitative interval description grounded in source text.",
        matchSnippet: referenceRange
      };
    }
  }

  // 4. Default: Cannot verify range in source OCR text
  return {
    isValid: false,
    isHallucinated: true,
    isAbsentInSource: false,
    status: "HALLUCINATION_BLOCKED",
    confidence: 0.1,
    provenance: "AI_EXTRACTED_NEEDS_REVIEW",
    reason: `POTENTIAL HALLUCINATION: Range "${referenceRange}" was NOT found in source OCR text. The AI may be inferring external medical knowledge not present in this document.`,
    recommendation: "Evaluation blocked. Value flagged for manual clinical verification.",
    matchSnippet: null
  };
}

/**
 * Computes whether an observed numeric/qualitative value falls within the verified range.
 * If range is unverified or hallucinated, REFUSES to flag as High/Low.
 */
export function evaluateValueStatus(valueStr, rangeStr, validationResult) {
  if (!validationResult || !validationResult.isValid) {
    return {
      flag: "UNVERIFIED",
      label: "Needs Review",
      color: "amber",
      note: validationResult?.reason || "Range unverified in source document"
    };
  }

  const numVal = parseFloat(valueStr);
  if (isNaN(numVal)) {
    const valLower = String(valueStr).toLowerCase().trim();
    if (valLower.includes("negative") || valLower.includes("non-reactive") || valLower.includes("normal")) {
      return { flag: "NORMAL", label: "Normal", color: "green", note: "Qualitative negative/normal" };
    }
    if (valLower.includes("positive") || valLower.includes("reactive")) {
      return { flag: "ABNORMAL", label: "Positive", color: "red", note: "Qualitative reactive/positive" };
    }
    return { flag: "INCONCLUSIVE", label: "Reported", color: "blue", note: "Qualitative value" };
  }

  const intervalMatch = rangeStr.match(/(\d+(?:\.\d+)?)\s*[-–—to]+\s*(\d+(?:\.\d+)?)/i);
  if (intervalMatch) {
    const min = parseFloat(intervalMatch[1]);
    const max = parseFloat(intervalMatch[2]);
    if (numVal < min) {
      return { flag: "LOW", label: "Low", color: "blue", note: `Below lower bound (${min})`, min, max };
    }
    if (numVal > max) {
      return { flag: "HIGH", label: "High", color: "red", note: `Above upper bound (${max})`, min, max };
    }
    return { flag: "NORMAL", label: "Normal", color: "green", note: `Within reference interval (${min} - ${max})`, min, max };
  }

  const ltMatch = rangeStr.match(/<\s*=?\s*(\d+(?:\.\d+)?)/i);
  if (ltMatch) {
    const threshold = parseFloat(ltMatch[1]);
    if (numVal > threshold) {
      return { flag: "HIGH", label: "High", color: "red", note: `Exceeds desirable threshold (< ${threshold})`, max: threshold };
    }
    return { flag: "NORMAL", label: "Desirable", color: "green", note: `Within desirable threshold (< ${threshold})`, max: threshold };
  }

  const gtMatch = rangeStr.match(/>\s*=?\s*(\d+(?:\.\d+)?)/i);
  if (gtMatch) {
    const threshold = parseFloat(gtMatch[1]);
    if (numVal < threshold) {
      return { flag: "LOW", label: "Low", color: "blue", note: `Below desirable threshold (> ${threshold})`, min: threshold };
    }
    return { flag: "NORMAL", label: "Desirable", color: "green", note: `Above minimum threshold (> ${threshold})`, min: threshold };
  }

  return { flag: "RECORDED", label: "Recorded", color: "gray", note: "Range format requires clinical review" };
}
