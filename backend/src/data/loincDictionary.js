/**
 * MedLens - Standard Clinical LOINC Code Catalog
 * Maps common laboratory investigations to universal LOINC codes and descriptions.
 */

export const LOINC_DICTIONARY = {
  // Hematology
  "HAEMOGLOBIN": { code: "718-7", display: "Hemoglobin [Mass/volume] in Blood" },
  "RBC COUNT": { code: "789-8", display: "Erythrocytes [#/volume] in Blood" },
  "PCV (HEMATOCRIT)": { code: "20570-8", display: "Hematocrit [Volume Fraction] of Blood" },
  "MCV": { code: "30428-7", display: "Mean Corpuscular Volume [Entitic volume]" },
  "MCH": { code: "28539-5", display: "Mean Corpuscular Hemoglobin [Entitic mass]" },
  "MCHC": { code: "28540-3", display: "Mean Corpuscular Hemoglobin Concentration" },
  "TOTAL LEUKOCYTE COUNT (WBC)": { code: "6690-2", display: "Leukocytes [#/volume] in Blood" },
  "NEUTROPHILS": { code: "769-2", display: "Neutrophils/100 leukocytes in Blood" },
  "LYMPHOCYTES": { code: "736-9", display: "Lymphocytes/100 leukocytes in Blood" },
  "MONOCYTES": { code: "744-3", display: "Monocytes/100 leukocytes in Blood" },
  "EOSINOPHILS": { code: "711-2", display: "Eosinophils/100 leukocytes in Blood" },
  "BASOPHILS": { code: "704-7", display: "Basophils/100 leukocytes in Blood" },
  "ABSOLUTE NEUTROPHIL COUNT": { code: "751-0", display: "Neutrophils [#/volume] in Blood" },
  "PLATELET COUNT": { code: "777-3", display: "Platelets [#/volume] in Blood" },

  // Lipid Profile
  "TOTAL CHOLESTEROL": { code: "2093-3", display: "Cholesterol [Mass/volume] in Serum or Plasma" },
  "TRIGLYCERIDES": { code: "2571-8", display: "Triglyceride [Mass/volume] in Serum or Plasma" },
  "HDL CHOLESTEROL": { code: "2085-9", display: "Cholesterol in HDL [Mass/volume] in Serum or Plasma" },
  "LDL CHOLESTEROL (DIRECT)": { code: "18262-6", display: "Cholesterol in LDL [Mass/volume] in Serum or Plasma direct" },
  "VLDL CHOLESTEROL": { code: "13457-7", display: "Cholesterol in VLDL [Mass/volume] in Serum or Plasma" },
  "CHOL / HDL RATIO": { code: "9830-1", display: "Cholesterol/Cholesterol in HDL [Mass Ratio]" },
  "LDL / HDL RATIO": { code: "11054-4", display: "Cholesterol in LDL/Cholesterol in HDL [Mass Ratio]" },

  // Diabetes & Renal Panel
  "GLUCOSE, FASTING (PLASMA)": { code: "1558-6", display: "Fasting glucose [Mass/volume] in Plasma" },
  "GLUCOSE, POST-PRANDIAL": { code: "1521-4", display: "Glucose [Mass/volume] in Plasma 2 hours post-meal" },
  "HbA1c (GLYCOSYLATED HB)": { code: "4548-4", display: "Hemoglobin A1c/Hemoglobin.total in Blood" },
  "ESTIMATED AVG GLUCOSE (eAG)": { code: "27353-2", display: "Glucose average [Mass/volume] in Blood estimated from HbA1c" },
  "SERUM CREATININE": { code: "2160-0", display: "Creatinine [Mass/volume] in Serum or Plasma" },
  "BLOOD UREA NITROGEN (BUN)": { code: "3094-0", display: "Urea nitrogen [Mass/volume] in Serum or Plasma" },
  "BUN / CREATININE RATIO": { code: "3097-3", display: "Urea nitrogen/Creatinine [Mass Ratio] in Serum or Plasma" },
  "URIC ACID": { code: "3084-1", display: "Uric acid [Mass/volume] in Serum or Plasma" },

  // Liver Function Tests (LFT)
  "TOTAL BILIRUBIN": { code: "1975-2", display: "Bilirubin.total [Mass/volume] in Serum or Plasma" },
  "BILIRUBIN DIRECT": { code: "1968-7", display: "Bilirubin.conjugated [Mass/volume] in Serum or Plasma" },
  "BILIRUBIN INDIRECT": { code: "1971-1", display: "Bilirubin.unconjugated [Mass/volume] in Serum or Plasma" },
  "SGOT (AST)": { code: "1920-8", display: "Aspartate aminotransferase [Enzymatic activity/volume] in Serum or Plasma" },
  "SGPT (ALT)": { code: "1742-6", display: "Alanine aminotransferase [Enzymatic activity/volume] in Serum or Plasma" },
  "ALKALINE PHOSPHATASE (ALP)": { code: "6768-6", display: "Alkaline phosphatase [Enzymatic activity/volume] in Serum or Plasma" },
  "TOTAL PROTEIN": { code: "2885-2", display: "Protein [Mass/volume] in Serum or Plasma" },
  "SERUM ALBUMIN": { code: "1751-7", display: "Albumin [Mass/volume] in Serum or Plasma" },
  "SERUM GLOBULIN": { code: "2345-7", display: "Globulin [Mass/volume] in Serum or Plasma" },
  "A / G RATIO": { code: "1759-0", display: "Albumin/Globulin [Mass Ratio] in Serum or Plasma" },
  "GAMMA GT (GGTP)": { code: "2324-2", display: "Gamma glutamyl transferase [Enzymatic activity/volume] in Serum or Plasma" },

  // Electrolytes & Minerals
  "SERUM SODIUM": { code: "2951-2", display: "Sodium [Moles/volume] in Serum or Plasma" },
  "SERUM POTASSIUM": { code: "2823-3", display: "Potassium [Moles/volume] in Serum or Plasma" },
  "SERUM CHLORIDE": { code: "2075-0", display: "Chloride [Moles/volume] in Serum or Plasma" },
  "CALCIUM, TOTAL": { code: "17861-6", display: "Calcium [Mass/volume] in Serum or Plasma" },
  "PHOSPHORUS, INORGANIC": { code: "2777-1", display: "Phosphate [Mass/volume] in Serum or Plasma" },

  // Thyroid Panel
  "T3, TOTAL (TRIIODOTHYRONINE)": { code: "3053-1", display: "Triiodothyronine (T3) [Mass/volume] in Serum or Plasma" },
  "T4, TOTAL (THYROXINE)": { code: "3026-7", display: "Thyroxine (T4) [Mass/volume] in Serum or Plasma" },
  "TSH (ULTRA SENSITIVE)": { code: "3016-3", display: "Thyrotropin [Units/volume] in Serum or Plasma" },
  "FREE T3": { code: "3051-5", display: "Free Triiodothyronine (FT3) [Mass/volume] in Serum or Plasma" },
  "FREE T4": { code: "3024-2", display: "Free Thyroxine (FT4) [Mass/volume] in Serum or Plasma" },

  // Vitamins, Cardiac & Immunology
  "SERUM 25-OH VITAMIN D": { code: "62292-8", display: "25-Hydroxyvitamin D3 + 25-Hydroxyvitamin D2 [Mass/volume]" },
  "VITAMIN B12": { code: "2132-9", display: "Cobalamin (Vitamin B12) [Mass/volume] in Serum or Plasma" },
  "HOMOCYSTEINE": { code: "2428-1", display: "Homocysteine [Moles/volume] in Serum or Plasma" },
  "HIGH SENSITIVITY CRP (hsCRP)": { code: "30522-7", display: "C reactive protein [Mass/volume] in Serum or Plasma by High sensitivity method" },
  "APOLIPOPROTEIN A1 (APO-A1)": { code: "1869-7", display: "Apolipoprotein A-I [Mass/volume] in Serum or Plasma" },
  "APOLIPOPROTEIN B (APO-B)": { code: "1871-3", display: "Apolipoprotein B [Mass/volume] in Serum or Plasma" },
  "APO B / APO A1 RATIO": { code: "32675-1", display: "Apolipoprotein B/Apolipoprotein A-I [Mass Ratio] in Serum or Plasma" },
  "EXPERIMENTAL CYTOKINE IL-6": { code: "26881-3", display: "Interleukin 6 [Mass/volume] in Serum or Plasma" },
  "ANTINUCLEAR ANTIBODY (ANA)": { code: "8061-4", display: "Antinuclear antibodies [Titer] in Serum" }
};

export function findLoincMapping(testName) {
  if (!testName) return { code: "UNK-LOINC", display: "Unclassified Clinical Observation" };
  const upper = testName.toUpperCase().trim();
  if (LOINC_DICTIONARY[upper]) return LOINC_DICTIONARY[upper];

  for (const [key, val] of Object.entries(LOINC_DICTIONARY)) {
    const keyUpper = key.toUpperCase();
    if (upper.includes(keyUpper) || keyUpper.includes(upper)) {
      return val;
    }
  }
  return { code: "UNK-LOINC", display: "Unclassified Clinical Observation" };
}
