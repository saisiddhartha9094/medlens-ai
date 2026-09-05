/**
 * MedLens - Plain-Language Parameter Explanations
 * Layman-accessible descriptions with non-diagnostic language.
 */

export const PARAMETER_EXPLANATIONS = {
  "HAEMOGLOBIN": "The oxygen-carrying protein inside red blood cells that delivers energy throughout tissues.",
  "RBC COUNT": "The total count of red blood cells circulating to carry oxygen and nutrients.",
  "TOTAL LEUKOCYTE COUNT (WBC)": "White blood cells that form your body's immune defense against infections and inflammation.",
  "PLATELET COUNT": "Cell fragments essential for normal blood clotting to seal minor vascular tears.",
  "TOTAL CHOLESTEROL": "A vital fatty lipid used by cells to build membrane walls and hormone messengers.",
  "TRIGLYCERIDES": "The primary storage form of dietary fats circulating in your bloodstream.",
  "HDL CHOLESTEROL": "Often called protective cholesterol because it carries excess lipids back to the liver for clearance.",
  "LDL CHOLESTEROL (DIRECT)": "Lipid particles transporting cholesterol to cells; elevated levels can form vascular deposits.",
  "GLUCOSE, FASTING (PLASMA)": "The baseline sugar concentration in your blood after fasting, supplying cellular fuel.",
  "GLUCOSE, POST-PRANDIAL": "Blood sugar measured 2 hours following a meal, reflecting post-meal glucose handling.",
  "HbA1c (GLYCOSYLATED HB)": "Average glycemic exposure over the preceding 2 to 3 months reflected on red blood cell proteins.",
  "SERUM CREATININE": "A natural muscle metabolism byproduct filtered and cleared by healthy kidneys.",
  "BLOOD UREA NITROGEN (BUN)": "A normal nitrogenous breakdown product of dietary proteins filtered by your renal system.",
  "TSH (ULTRA SENSITIVE)": "Pituitary hormone signaling the thyroid gland to balance your basal metabolic rate.",
  "SERUM 25-OH VITAMIN D": "Fat-soluble nutrient synthesized via sunlight supporting bone mineralization and cellular health.",
  "VITAMIN B12": "Water-soluble vitamin essential for nervous system maintenance and red blood cell production.",
  "HIGH SENSITIVITY CRP (hsCRP)": "A sensitive hepatic acute-phase reactant reflecting general vascular inflammation.",
  "TOTAL BILIRUBIN": "Yellow pigment produced during the natural breakdown of aged red blood cells and processed by the liver.",
  "SGOT (AST)": "Enzyme found predominantly in liver and muscle cells released into circulation when tissues are stressed.",
  "SGPT (ALT)": "Liver-specific enzyme that helps convert proteins into energy for liver cells.",
  "ALKALINE PHOSPHATASE (ALP)": "Enzyme related to the bile ducts and bone turnover systems.",
  "SERUM SODIUM": "Major extracellular electrolyte regulating total fluid volume and nerve transmission.",
  "SERUM POTASSIUM": "Critical intracellular electrolyte governing cellular membrane potentials and cardiac rhythm."
};

export function getParameterExplanation(testName) {
  if (!testName) return "A clinical laboratory biomarker measured in this diagnostic panel.";
  const upper = testName.toUpperCase().trim();
  if (PARAMETER_EXPLANATIONS[upper]) return PARAMETER_EXPLANATIONS[upper];

  for (const [key, val] of Object.entries(PARAMETER_EXPLANATIONS)) {
    if (upper.includes(key) || key.includes(upper)) {
      return val;
    }
  }
  return "A standard biological biomarker measured in this diagnostic investigation.";
}
