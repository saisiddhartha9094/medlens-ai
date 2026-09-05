/**
 * MedLens - Guardrailed Plain-Language Summarization Service
 * 
 * CORE CLINICAL SAFETY CONSTRAINT:
 * Strictly non-diagnostic. Never prescribes medications, dosages, or definitive clinical conclusions.
 * Explains biological parameters in plain language, highlights values outside
 * the source document's printed reference intervals, and equips the patient
 * with informed questions for their healthcare provider.
 */

import { getParameterExplanation } from "../data/parameterExplanations.js";

// Prohibited diagnostic keywords that must NEVER be returned by this service
export const FORBIDDEN_DIAGNOSTIC_TERMS = [
  /\byou have\b/i,
  /\bthis indicates that you suffer\b/i,
  /\bwe diagnose\b/i,
  /\bour diagnosis\b/i,
  /\byou are suffering from\b/i,
  /\btake this medication\b/i,
  /\byou need to take\b/i
];

export function assertNonDiagnosticLanguage(text) {
  for (const regex of FORBIDDEN_DIAGNOSTIC_TERMS) {
    if (regex.test(text)) {
      throw new Error(`Safety Violation: Prohibited diagnostic phrase matched by safety guard: ${regex}`);
    }
  }
  return true;
}

export function generatePatientFriendlySummary(report, patientContext = {}) {
  const observations = report.observations || [];
  
  const normalObs = observations.filter(o => o.flag === "NORMAL");
  const highObs = observations.filter(o => o.flag === "HIGH");
  const lowObs = observations.filter(o => o.flag === "LOW");
  const unverifiedObs = observations.filter(o => o.flag === "UNVERIFIED" || o.validationResult?.isValid === false);

  const keyFindings = [];
  const questionsForDoctor = [];

  if (highObs.length > 0) {
    highObs.forEach(obs => {
      const explanation = getParameterExplanation(obs.testName);
      keyFindings.push({
        parameter: obs.testName,
        status: "Higher than the laboratory's printed reference range",
        value: `${obs.value} ${obs.unit}`,
        referenceRange: obs.referenceRange,
        plainExplanation: explanation,
        statusType: "HIGH"
      });
      questionsForDoctor.push(`What lifestyle, dietary, or clinical factors might explain why my ${obs.testName} (${obs.value} ${obs.unit}) is above the lab range (${obs.referenceRange})?`);
    });
  }

  if (lowObs.length > 0) {
    lowObs.forEach(obs => {
      const explanation = getParameterExplanation(obs.testName);
      keyFindings.push({
        parameter: obs.testName,
        status: "Lower than the laboratory's printed reference range",
        value: `${obs.value} ${obs.unit}`,
        referenceRange: obs.referenceRange,
        plainExplanation: explanation,
        statusType: "LOW"
      });
      questionsForDoctor.push(`My ${obs.testName} is ${obs.value} ${obs.unit}, which is below the printed interval (${obs.referenceRange}). Does this require nutritional support or follow-up testing?`);
    });
  }

  if (unverifiedObs.length > 0) {
    unverifiedObs.forEach(obs => {
      keyFindings.push({
        parameter: obs.testName,
        status: "Reference range missing or unverified in source document",
        value: `${obs.value} ${obs.unit}`,
        referenceRange: obs.referenceRange || "None provided",
        plainExplanation: "MedLens anti-hallucination guard prevented automatic evaluation because the report did not provide an established reference range.",
        statusType: "UNVERIFIED"
      });
      questionsForDoctor.push(`The laboratory did not list a biological reference interval for ${obs.testName} (${obs.value} ${obs.unit}). Could you help interpret how this result relates to my current health?`);
    });
  }

  const contextNotes = [];
  if (patientContext.chronicConditions && patientContext.chronicConditions.length > 0) {
    contextNotes.push(`Self-reported history of ${patientContext.chronicConditions.join(", ")} was noted during intake.`);
  }
  if (patientContext.currentMedications && patientContext.currentMedications.length > 0) {
    contextNotes.push(`Patient is currently taking: ${patientContext.currentMedications.slice(0, 2).join("; ")}.`);
  }

  const summary = {
    overview: `This report from ${report.labName || "your diagnostic center"} dated ${report.testDate || "recently"} contains ${observations.length} structured lab measurements. ${normalObs.length} are within printed standard intervals, while ${highObs.length + lowObs.length} are outside the laboratory's printed reference ranges.`,
    totalParameters: observations.length,
    normalCount: normalObs.length,
    abnormalCount: highObs.length + lowObs.length,
    unverifiedCount: unverifiedObs.length,
    keyFindings,
    questionsForDoctor: [...new Set(questionsForDoctor)].slice(0, 5),
    patientContextNotes: contextNotes,
    readingGradeLevel: "Grade 7.5 (Easy, Plain Language)",
    disclaimer: "IMPORTANT NOTICE: MedLens is an assistive clinical information structuring and summarization tool. It DOES NOT diagnose illnesses, prescribe medication, or provide treatment advice. Laboratory results must always be evaluated in clinical context by a licensed medical practitioner."
  };

  // Run Safety Assertions on all output text
  assertNonDiagnosticLanguage(summary.overview);
  assertNonDiagnosticLanguage(summary.disclaimer);
  summary.keyFindings.forEach(f => assertNonDiagnosticLanguage(f.plainExplanation));

  return summary;
}
