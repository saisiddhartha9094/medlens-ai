import { describe, it, expect } from "vitest";
import { generatePatientFriendlySummary, assertNonDiagnosticLanguage } from "../src/services/summarizerService.js";

describe("Plain-Language Summarizer Service (Responsible AI Guardrails)", () => {

  const mockReport = {
    labName: "Dr. Lal PathLabs",
    testDate: "2026-06-15",
    observations: [
      {
        testName: "HAEMOGLOBIN",
        value: "10.5",
        unit: "g/dL",
        referenceRange: "13.0 - 17.0",
        flag: "LOW"
      },
      {
        testName: "GLUCOSE, FASTING (PLASMA)",
        value: "145.0",
        unit: "mg/dL",
        referenceRange: "70.0 - 99.0",
        flag: "HIGH"
      },
      {
        testName: "TOTAL CHOLESTEROL",
        value: "180.0",
        unit: "mg/dL",
        referenceRange: "< 200",
        flag: "NORMAL"
      }
    ]
  };

  it("always includes the mandatory clinical non-diagnostic disclaimer", () => {
    const summary = generatePatientFriendlySummary(mockReport);
    expect(summary.disclaimer).toBeDefined();
    expect(summary.disclaimer).toContain("DOES NOT diagnose illnesses");
    expect(summary.disclaimer).toContain("licensed medical practitioner");
  });

  it("never includes prohibited diagnostic phrases", () => {
    const summary = generatePatientFriendlySummary(mockReport);
    const fullText = JSON.stringify(summary).toLowerCase();

    // Strict non-diagnostic assertion
    expect(fullText).not.toContain("you have diabetes");
    expect(fullText).not.toContain("you suffer from");
    expect(fullText).not.toContain("we diagnose");
    expect(fullText).not.toContain("our diagnosis");
    expect(fullText).not.toContain("take this medication");

    expect(() => assertNonDiagnosticLanguage(summary.overview)).not.toThrow();
  });

  it("generates informed questions for the patient's physician", () => {
    const summary = generatePatientFriendlySummary(mockReport);
    expect(summary.questionsForDoctor.length).toBeGreaterThanOrEqual(2);
    expect(summary.questionsForDoctor.some(q => q.includes("HAEMOGLOBIN"))).toBe(true);
    expect(summary.questionsForDoctor.some(q => q.includes("GLUCOSE"))).toBe(true);
  });

  it("throws safety error if forbidden diagnostic text is tested", () => {
    expect(() => {
      assertNonDiagnosticLanguage("Based on this, you have diabetes and need treatment.");
    }).toThrow(/Safety Violation/);
  });

});
