/**
 * MedLens - Drug-Lab Interaction (DLI) Scanner Service
 * 
 * Clinical Foundation:
 * Identifies high-risk pharmacological interactions between patient-reported active medications
 * and objective laboratory biomarker anomalies.
 * References: UpToDate Drug Interactions, Medscape Reference, FDA Black Box Warnings.
 * 
 * SaMD Boundary:
 * All alerts are classified as "Clinician Advisory" notes. MedLens NEVER advises the patient
 * to stop or adjust dosage independently.
 */

export const DLI_RULES = [
  {
    id: "dli-metformin-creat",
    drugKeywords: ["metformin", "glycomet", "glucophage"],
    testKeywords: ["CREATININE", "SERUM CREATININE"],
    excludeKeywords: ["RATIO", "CLEARANCE", "ESTIMATED", "URINE"],
    condition: (val, obs) => val >= 1.4,
    severity: "HIGH",
    alert: "Elevated Serum Creatinine with active Metformin use.",
    mechanism: "Impaired renal clearance increases the risk of Metformin-associated Lactic Acidosis (MALA).",
    recommendation: "Clinician review of eGFR advised. FDA guidelines suggest evaluating alternative glycemic agents if eGFR < 45 mL/min.",
    guideline: "FDA Drug Safety Communication / ADA Guidelines 2024"
  },
  {
    id: "dli-arb-acei-potassium",
    drugKeywords: ["telmisartan", "losartan", "enalapril", "ramipril", "lisinopril", "valsartan"],
    testKeywords: ["POTASSIUM", "SERUM POTASSIUM"],
    excludeKeywords: ["URINE"],
    condition: (val, obs) => val >= 5.1,
    severity: "HIGH",
    alert: "Hyperkalemia detected with active RAAS inhibitor (ACEi/ARB).",
    mechanism: "Inhibition of the renin-angiotensin-aldosterone system reduces renal potassium excretion, risking cardiac arrhythmias.",
    recommendation: "Clinician evaluation advised; consider dietary potassium review, repeat electrolyte panel, or dosage titration.",
    guideline: "ACC/AHA Clinical Practice Guidelines"
  },
  {
    id: "dli-statin-alt-ast",
    drugKeywords: ["atorvastatin", "rosuvastatin", "simvastatin", "pravastatin"],
    testKeywords: ["ALT", "SGPT", "AST", "SGOT", "ALANINE AMINOTRANSFERASE"],
    condition: (val, obs) => {
      if (obs.calibration?.ratioToULN) return obs.calibration.ratioToULN >= 3.0;
      return val >= 120;
    },
    severity: "MODERATE",
    alert: "Significant transaminase elevation (>3x ULN) with active Statin therapy.",
    mechanism: "Statins can trigger idiosyncratic hepatic transaminitis in susceptible individuals.",
    recommendation: "Clinician liver panel review recommended. Discontinuation or dose reduction may be indicated if ALT persistently exceeds 3x ULN.",
    guideline: "National Lipid Association (NLA) Statin Safety Task Force"
  },
  {
    id: "dli-statin-cpk",
    drugKeywords: ["atorvastatin", "rosuvastatin", "simvastatin"],
    testKeywords: ["CPK", "CREATINE KINASE", "CK"],
    condition: (val, obs) => {
      if (obs.calibration?.ratioToULN) return obs.calibration.ratioToULN >= 4.0;
      return val >= 600;
    },
    severity: "HIGH",
    alert: "Elevated Creatine Kinase (CPK) with active Statin therapy.",
    mechanism: "Risk of statin-associated muscle symptoms (SAMS) or rhabdomyolysis.",
    recommendation: "Immediate clinician assessment for myalgia, muscle weakness, and renal protection.",
    guideline: "AHA/ACC Cholesterol Clinical Guidelines"
  },
  {
    id: "dli-spironolactone-potassium",
    drugKeywords: ["spironolactone", "aldactone", "eplerenone"],
    testKeywords: ["POTASSIUM", "SERUM POTASSIUM"],
    condition: (val, obs) => val >= 5.0,
    severity: "HIGH",
    alert: "Hyperkalemia with potassium-sparing aldosterone antagonist.",
    mechanism: "Aldosterone blockade directly impedes renal tubular potassium excretion.",
    recommendation: "Urgent clinician review; assess concurrent ACEi/ARBs or potassium supplements.",
    guideline: "Heart Failure Society of America (HFSA)"
  },
  {
    id: "dli-levothyroxine-tsh",
    drugKeywords: ["levothyroxine", "thyronorm", "eltroxin", "synthroid"],
    testKeywords: ["TSH", "TSH (ULTRA SENSITIVE)", "THYROID STIMULATING HORMONE"],
    condition: (val, obs) => val < 0.35 || val > 4.5,
    severity: "MODERATE",
    alert: "Abnormal TSH level during Levothyroxine replacement therapy.",
    mechanism: "TSH outside target therapeutic range indicates suboptimal dosing (under-replacement if TSH > 4.5, over-replacement if TSH < 0.35).",
    recommendation: "Clinician titration of Levothyroxine dosage advised based on clinical symptoms.",
    guideline: "American Thyroid Association (ATA) Hypothyroidism Guidelines"
  },
  {
    id: "dli-anticoag-platelets",
    drugKeywords: ["warfarin", "coumadin", "rivaroxaban", "apixaban", "dabigatran"],
    testKeywords: ["PLATELET", "PLATELET COUNT"],
    condition: (val, obs) => val < 100000,
    severity: "HIGH",
    alert: "Thrombocytopenia (<100,000 cells/cumm) with active Anticoagulant use.",
    mechanism: "Co-occurrence of therapeutic anticoagulation and impaired primary hemostasis drastically elevates bleeding risk.",
    recommendation: "Urgent clinician review of bleeding risk; consider temporary dose adjustment or hematology consultation.",
    guideline: "Chest Antithrombotic Therapy Guidelines"
  },
  {
    id: "dli-antiplatelet-platelets",
    drugKeywords: ["aspirin", "clopidogrel", "ecosprin", "plavix", "ticagrelor"],
    testKeywords: ["PLATELET", "PLATELET COUNT"],
    condition: (val, obs) => val < 80000,
    severity: "HIGH",
    alert: "Significant thrombocytopenia (<80,000 cells/cumm) with Antiplatelet therapy.",
    mechanism: "Additive platelet dysfunction and quantitative depletion increase spontaneous hemorrhage risk.",
    recommendation: "Clinician evaluation recommended for continuation vs interruption of antiplatelet regimen.",
    guideline: "British Society for Haematology"
  },
  {
    id: "dli-nsaid-creat",
    drugKeywords: ["ibuprofen", "diclofenac", "naproxen", "combiflam", "voveran"],
    testKeywords: ["CREATININE", "SERUM CREATININE", "BUN"],
    condition: (val, obs) => val >= 1.3,
    severity: "MODERATE",
    alert: "Renal impairment markers elevated with active NSAID usage.",
    mechanism: "NSAIDs inhibit prostaglandin-mediated afferent arteriolar vasodilation, precipitating acute kidney injury (AKI).",
    recommendation: "Clinician review; consider switching to acetaminophen or non-nephrotoxic analgesic alternatives.",
    guideline: "KDIGO Clinical Practice Guideline for Acute Kidney Injury"
  },
  {
    id: "dli-sulfonylurea-glucose",
    drugKeywords: ["glimepiride", "glipizide", "gliclazide", "amaryl"],
    testKeywords: ["GLUCOSE", "GLUCOSE, FASTING", "GLUCOSE, POST-PRANDIAL"],
    condition: (val, obs) => val < 70,
    severity: "HIGH",
    alert: "Biochemically confirmed hypoglycemia (<70 mg/dL) on Sulfonylurea therapy.",
    mechanism: "Sulfonylureas stimulate autonomous insulin secretion independent of circulating glucose levels.",
    recommendation: "Urgent carbohydrate replenishment; clinician review of sulfonylurea dosage or de-escalation.",
    guideline: "American Diabetes Association (ADA) Standards of Care"
  }
];

/**
 * Scans active patient medications against observation values
 * @param {Array<string>} medications - List of medication strings from patient context
 * @param {Array<Object>} observations - Extracted clinical observations
 * @returns {Array<Object>} Flagged drug-lab interactions
 */
export function scanDrugLabInteractions(medications = [], observations = []) {
  if (!Array.isArray(medications) || !Array.isArray(observations)) {
    return [];
  }

  const flaggedInteractions = [];

  for (const medString of medications) {
    const medLower = medString.toLowerCase();

    for (const rule of DLI_RULES) {
      const drugMatched = rule.drugKeywords.some(keyword => medLower.includes(keyword.toLowerCase()));
      if (!drugMatched) continue;

      for (const obs of observations) {
        const obsName = (obs.testName || "").toUpperCase();

        // Skip observations that match exclusion keywords (e.g. RATIO, CLEARANCE)
        if (rule.excludeKeywords && rule.excludeKeywords.some(ex => obsName.includes(ex.toUpperCase()))) {
          continue;
        }

        const testMatched = rule.testKeywords.some(keyword => {
          const kw = keyword.toUpperCase().trim();
          // For short acronyms (<= 4 chars, e.g. AST, ALT, CPK, CK), enforce word boundaries
          if (kw.length <= 4) {
            const regex = new RegExp(`(^|[^A-Z0-9])${kw}([^A-Z0-9]|$)`, "i");
            return regex.test(obsName);
          }
          return obsName.includes(kw);
        });

        if (!testMatched) continue;

        const val = obs.numericValue !== undefined && obs.numericValue !== null 
          ? obs.numericValue 
          : parseFloat(obs.value);

        if (isNaN(val)) continue;

        if (rule.condition(val, obs)) {
          flaggedInteractions.push({
            ruleId: rule.id,
            matchedMedication: medString.trim(),
            testName: obs.testName,
            observedValue: val,
            unit: obs.unit || "",
            referenceRange: obs.referenceRange || "",
            severity: rule.severity,
            alert: rule.alert,
            mechanism: rule.mechanism,
            recommendation: rule.recommendation,
            guideline: rule.guideline
          });
        }
      }
    }
  }

  return flaggedInteractions;
}
