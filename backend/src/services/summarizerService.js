/**
 * MedLens - Guardrailed Plain-Language Summarization Service
 * 
 * CORE CLINICAL SAFETY CONSTRAINT:
 * Strictly non-diagnostic. Never prescribes medications or dosages.
 * Explains biological parameters in plain language, highlights values outside
 * the source document's printed reference intervals, and equips the patient
 * with informed questions for their healthcare provider.
 */

const PARAMETER_EXPLANATIONS = {
  "HAEMOGLOBIN": "The oxygen-carrying protein inside your red blood cells that delivers energy throughout your body.",
  "RBC COUNT": "The total number of red blood cells circulating to carry oxygen and nutrients.",
  "TOTAL LEUKOCYTE COUNT (WBC)": "White blood cells that form your body's immune defense against infections and inflammation.",
  "PLATELET COUNT": "Cell fragments essential for normal blood clotting to prevent bleeding.",
  "TOTAL CHOLESTEROL": "A fatty substance necessary for building cell walls and hormones, measured in your bloodstream.",
  "TRIGLYCERIDES": "The most common type of fat in the body, derived from calories that your body does not immediately use.",
  "HDL CHOLESTEROL": "Often called 'good cholesterol' because it helps clear excess cholesterol from your arteries back to the liver.",
  "LDL CHOLESTEROL (DIRECT)": "Often called 'bad cholesterol' because high amounts can lead to buildup in blood vessel walls.",
  "GLUCOSE, FASTING (PLASMA)": "The concentration of sugar in your blood after fasting, which cells use as an essential energy source.",
  "GLUCOSE, POST-PRANDIAL": "Blood sugar concentration measured 2 hours after a meal to see how efficiently the body handles dietary carbs.",
  "HbA1c (GLYCOSYLATED HB)": "Measures your average blood sugar levels over the preceding 2 to 3 months.",
  "SERUM CREATININE": "A natural waste product from muscle wear-and-tear filtered exclusively by healthy kidneys.",
  "BLOOD UREA NITROGEN (BUN)": "A breakdown product of dietary protein filtered and excreted by your kidneys.",
  "TSH (ULTRA SENSITIVE)": "Thyroid Stimulating Hormone released by the pituitary gland to regulate your body's metabolism rate.",
  "SERUM 25-OH VITAMIN D": "Essential vitamin synthesized via sunlight and food that supports calcium absorption and immune health.",
  "HIGH SENSITIVITY CRP (hsCRP)": "A sensitive blood marker produced by the liver that reflects generalized inflammation in the body."
};

export function generatePatientFriendlySummary(report, patientContext = {}) {
  const observations = report.observations || [];
  
  const normalObs = observations.filter(o => o.flag === "NORMAL");
  const highObs = observations.filter(o => o.flag === "HIGH");
  const lowObs = observations.filter(o => o.flag === "LOW");
  const unverifiedObs = observations.filter(o => o.flag === "UNVERIFIED" || o.validationResult?.isValid === false);

  const keyFindings = [];
  const questionsForDoctor = [];

  // Plain language summary of out-of-range parameters
  if (highObs.length > 0) {
    highObs.forEach(obs => {
      const explanation = PARAMETER_EXPLANATIONS[obs.testName.toUpperCase()] || "A standard blood biomarker measured in this diagnostic panel.";
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
      const explanation = PARAMETER_EXPLANATIONS[obs.testName.toUpperCase()] || "A standard blood biomarker measured in this diagnostic panel.";
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

  // Cross-reference with patient-reported context
  const contextNotes = [];
  if (patientContext.chronicConditions && patientContext.chronicConditions.length > 0) {
    contextNotes.push(`Self-reported history of ${patientContext.chronicConditions.join(", ")} was noted during intake.`);
  }
  if (patientContext.currentMedications && patientContext.currentMedications.length > 0) {
    contextNotes.push(`Patient is currently taking: ${patientContext.currentMedications.slice(0, 2).join("; ")}.`);
  }

  return {
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
}
