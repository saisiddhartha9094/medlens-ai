import { describe, it, expect } from "vitest";
import { extractObservationsFromText } from "../src/services/extractionService.js";
import { findLoincMapping } from "../src/data/loincDictionary.js";

describe("Clinical Extraction Service", () => {

  it("extracts Complete Blood Count (CBC) report observations", () => {
    const text = `DR. LAL PATHLABS LTD.
TEST NAME                    VALUE     UNIT        REFERENCE RANGE
HAEMOGLOBIN                   11.8     g/dL        13.0 - 17.0
TOTAL LEUKOCYTE COUNT (WBC)   11800    cells/cumm  4000 - 10000
PLATELET COUNT                185000   cells/cumm  150000 - 450000`;

    const result = extractObservationsFromText(text);
    expect(result.observations).toHaveLength(3);

    const hb = result.observations[0];
    expect(hb.testName).toBe("HAEMOGLOBIN");
    expect(hb.value).toBe("11.8");
    expect(hb.unit).toBe("g/dL");
    expect(hb.referenceRange).toBe("13.0 - 17.0");
    expect(hb.flag).toBe("LOW");
    expect(hb.loincCode).toBe("718-7");
    expect(hb.provenance).toBe("AI_EXTRACTED_VERIFIED");
  });

  it("extracts Liver Function Test (LFT) observations", () => {
    const text = `APOLLO DIAGNOSTICS
TEST NAME                    VALUE     UNIT        REFERENCE RANGE
TOTAL BILIRUBIN               1.45     mg/dL       0.20 - 1.20
SGOT (AST)                    58.0     U/L         10.0 - 40.0
SGPT (ALT)                    64.0     U/L         10.0 - 45.0
ALKALINE PHOSPHATASE (ALP)    115.0    U/L         30.0 - 120.0`;

    const result = extractObservationsFromText(text);
    expect(result.observations).toHaveLength(4);
    
    const alt = result.observations.find(o => o.testName.includes("SGPT"));
    expect(alt).toBeDefined();
    expect(alt.value).toBe("64.0");
    expect(alt.flag).toBe("HIGH");
    expect(alt.loincCode).toBe("1742-6");
  });

  it("extracts Renal & Electrolyte (KFT) observations", () => {
    const text = `METROPOLIS HEALTHCARE
TEST NAME                    VALUE     UNIT        REFERENCE RANGE
BLOOD UREA NITROGEN (BUN)    24.5      mg/dL       8.0 - 23.0
SERUM CREATININE             1.35      mg/dL       0.70 - 1.20
SERUM SODIUM                 139.0     mEq/L       136.0 - 145.0`;

    const result = extractObservationsFromText(text);
    expect(result.observations).toHaveLength(3);

    const creat = result.observations.find(o => o.testName.includes("CREATININE"));
    expect(creat.value).toBe("1.35");
    expect(creat.flag).toBe("HIGH");
    expect(creat.loincCode).toBe("2160-0");
  });

  it("gracefully handles unestablished biological ranges", () => {
    const text = `APEX SPECIALTY PATHLAB
TEST INVESTIGATION           VALUE     UNIT        REFERENCE INTERVAL
EXPERIMENTAL CYTOKINE IL-6   18.5      pg/mL       (Reference interval pending clinical trial standardization)`;

    const result = extractObservationsFromText(text);
    expect(result.observations).toHaveLength(1);
    const cytokine = result.observations[0];
    expect(cytokine.flag).toBe("UNVERIFIED");
    expect(cytokine.provenance).toBe("AI_EXTRACTED_NEEDS_REVIEW");
    expect(cytokine.validationResult.isValid).toBe(false);
  });

  it("maps test names to universal LOINC codes", () => {
    expect(findLoincMapping("Haemoglobin").code).toBe("718-7");
    expect(findLoincMapping("Total Cholesterol").code).toBe("2093-3");
    expect(findLoincMapping("HbA1c").code).toBe("4548-4");
    expect(findLoincMapping("Unknown Random Marker").code).toBe("UNK-LOINC");
  });

});
