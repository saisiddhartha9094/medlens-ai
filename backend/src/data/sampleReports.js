/**
 * MedLens - Realistic Clinical Sample Diagnostic Reports
 * Synthetic, HIPAA-safe test data simulating top diagnostic lab report formats.
 */

export const SAMPLE_REPORTS = [
  {
    id: "rep-cbc-001",
    title: "Complete Blood Count (CBC) - Dr. Lal PathLabs",
    labName: "Dr. Lal PathLabs Ltd. - Central Reference Lab",
    testDate: "2026-06-15",
    patientName: "Rajesh Kumar",
    patientAge: 48,
    patientGender: "Male",
    doctorName: "Dr. Arvind Mehta, MD",
    category: "Hematology",
    rawText: `===============================================================
DR. LAL PATHLABS LTD. - NATIONAL REFERENCE LAB
Block-E, Sector 18, Rohini, New Delhi - 110085
Accreditation: NABL (ISO 15189:2012) / CAP Certified
===============================================================
Patient Name: Rajesh Kumar          Age / Sex: 48 Y / Male
PID / UHID  : DLPL-99281-2026       Registered: 15-Jun-2026 08:30 AM
Referred By : Dr. Arvind Mehta, MD  Reported  : 15-Jun-2026 02:45 PM
Sample Type : EDTA Whole Blood      BarCode   : *992812026*
===============================================================
TEST NAME                    VALUE     UNIT        REFERENCE RANGE
===============================================================
HAEMOGLOBIN                   11.8     g/dL        13.0 - 17.0
RBC COUNT                     4.10     mill/cumm   4.50 - 5.50
PCV (HEMATOCRIT)              36.2     %           40.0 - 50.0
MCV                           88.3     fL          80.0 - 100.0
MCH                           28.8     pg          27.0 - 32.0
MCHC                          32.6     g/dL        31.5 - 34.5
TOTAL LEUKOCYTE COUNT (WBC)   11800    cells/cumm  4000 - 10000
NEUTROPHILS                   76       %           40 - 70
LYMPHOCYTES                   18       %           20 - 40
MONOCYTES                     4        %           2 - 8
EOSINOPHILS                   2        %           1 - 6
BASOPHILS                     0        %           0 - 1
ABSOLUTE NEUTROPHIL COUNT     8968     cells/cumm  2000 - 7000
PLATELET COUNT                185000   cells/cumm  150000 - 450000
===============================================================
COMMENTS:
Mild normocytic normochromic anemia observed. Leukocytosis with
neutrophilia noted. Please correlate clinically.
*** END OF REPORT ***`
  },
  {
    id: "rep-lipid-002",
    title: "Lipid Profile (Cardiovascular Risk) - Apollo Diagnostics",
    labName: "Apollo Diagnostics - Clinical Biochemistry",
    testDate: "2026-07-02",
    patientName: "Rajesh Kumar",
    patientAge: 48,
    patientGender: "Male",
    doctorName: "Dr. Arvind Mehta, MD",
    category: "Biochemistry",
    rawText: `===============================================================
APOLLO DIAGNOSTICS - CLINICAL BIOCHEMISTRY DIVISION
Apollo Hospitals Enterprise Ltd, Jubilee Hills, Hyderabad
===============================================================
Patient Name: Rajesh Kumar          Age / Gender: 48 Yrs / Male
Sample ID   : AP-LIP-48201          Collection  : 02-Jul-2026 07:15 AM
Referred By : Dr. Arvind Mehta, MD  Reported    : 02-Jul-2026 12:30 PM
Test Panel  : LIPID PROFILE (FASTING - 12 HRS)
===============================================================
INVESTIGATION                OBSERVED  UNIT        BIOLOGICAL REF INTERVAL
===============================================================
TOTAL CHOLESTEROL            242.0     mg/dL       Desirable: < 200
                                                   Borderline: 200 - 239
                                                   High: >= 240
TRIGLYCERIDES                215.0     mg/dL       Normal: < 150
                                                   Borderline: 150 - 199
                                                   High: 200 - 499
HDL CHOLESTEROL              38.5      mg/dL       Desirable: > 40
                                                   Low: < 40
LDL CHOLESTEROL (DIRECT)     160.5     mg/dL       Optimal: < 100
                                                   Near Optimal: 100 - 129
                                                   Borderline High: 130 - 159
                                                   High: >= 160
VLDL CHOLESTEROL             43.0      mg/dL       Normal: 5 - 40
CHOL / HDL RATIO             6.28      Ratio       Low Risk: 3.3 - 4.4
                                                   Moderate: 4.5 - 7.0
LDL / HDL RATIO              4.17      Ratio       Low Risk: 0.5 - 3.0
===============================================================
METHODOLOGY: Fully Automated Enzymatic Spectrophotometry.
Note: Fasting status confirmed (12 hours). Please correlate clinically.
*** END OF REPORT ***`
  },
  {
    id: "rep-diabetic-003",
    title: "Diabetic & Renal Health Panel - Metropolis Healthcare",
    labName: "Metropolis Healthcare Ltd. - Global Reference Lab",
    testDate: "2026-08-10",
    patientName: "Rajesh Kumar",
    patientAge: 48,
    patientGender: "Male",
    doctorName: "Dr. Arvind Mehta, MD",
    category: "Endocrinology & Nephrology",
    rawText: `===============================================================
METROPOLIS HEALTHCARE LTD.
Global Reference Laboratory, Kohinoor City, Kurla (W), Mumbai
===============================================================
Patient Name: Rajesh Kumar          Age / Gender: 48 Y / M
Registration: MHL-MUM-773918        Collected   : 10-Aug-2026 08:00 AM
Ref. Doctor : Dr. Arvind Mehta, MD  Report Date : 10-Aug-2026 01:15 PM
===============================================================
TEST DESCRIPTION             RESULT    UNIT        REFERENCE RANGE
===============================================================
GLUCOSE, FASTING (PLASMA)    142.0     mg/dL       70.0 - 99.0 (Normal)
                                                   100.0 - 125.0 (Impaired)
                                                   >= 126.0 (Diabetic)
GLUCOSE, POST-PRANDIAL       210.0     mg/dL       < 140.0 (Normal)
                                                   140.0 - 199.0 (Impaired)
                                                   >= 200.0 (Diabetic)
HbA1c (GLYCOSYLATED HB)      7.9       %           < 5.7 (Non-diabetic)
                                                   5.7 - 6.4 (Prediabetes)
                                                   >= 6.5 (Diabetes)
ESTIMATED AVG GLUCOSE (eAG)  180.0     mg/dL       N/A
SERUM CREATININE             1.08      mg/dL       0.70 - 1.20
BLOOD UREA NITROGEN (BUN)    16.5      mg/dL       8.0 - 23.0
BUN / CREATININE RATIO       15.28     Ratio       10.0 - 20.0
URIC ACID                    6.4       mg/dL       3.5 - 7.2
===============================================================
Method: HPLC (Bio-Rad D-10) for HbA1c; Hexokinase for Plasma Glucose.
*** END OF REPORT ***`
  },
  {
    id: "rep-thyroid-004",
    title: "Thyroid Function Test (Total & Free) - SRL Diagnostics",
    labName: "SRL Diagnostics Ltd.",
    testDate: "2026-08-20",
    patientName: "Rajesh Kumar",
    patientAge: 48,
    patientGender: "Male",
    doctorName: "Dr. S. K. Roy, Endocrinologist",
    category: "Endocrinology",
    rawText: `===============================================================
SRL DIAGNOSTICS - CLINICAL REFERENCE LAB
===============================================================
Patient Name: Rajesh Kumar          Age / Gender: 48 Y / Male
Accession No: SRL-DEL-2026-5591     Date of Specimen: 20-Aug-2026
Doctor      : Dr. S. K. Roy         Status : Final Verified
===============================================================
TEST NAME                    RESULT    UNITS       BIOLOGICAL REFERENCE
===============================================================
T3, TOTAL (TRIIODOTHYRONINE) 1.25      ng/mL       0.80 - 2.00
T4, TOTAL (THYROXINE)        8.40      ug/dL       5.10 - 14.10
TSH (ULTRA SENSITIVE)        6.85      uIU/mL      0.45 - 4.50
FREE T3                      3.10      pg/mL       2.30 - 4.20
FREE T4                      1.12      ng/dL       0.89 - 1.76
===============================================================
INTERPRETATION:
Elevated TSH with normal Free T3 and Free T4 indicates Subclinical
Hypothyroidism. Advised follow-up in 8-12 weeks.
*** END OF REPORT ***`
  },
  {
    id: "rep-hallucination-test-005",
    title: "⚠️ SIH Edge Case: Report with Missing Range & Ambiguous Biomarker",
    labName: "Apex Specialty Pathlab - Advanced Immunology",
    testDate: "2026-08-25",
    patientName: "Rajesh Kumar",
    patientAge: 48,
    patientGender: "Male",
    doctorName: "Dr. Arvind Mehta, MD",
    category: "Immunology & Vitamins",
    rawText: `===============================================================
APEX SPECIALTY PATHLAB - ADVANCED IMMUNOLOGY & SPECIAL LABS
===============================================================
Patient: Rajesh Kumar               Age/Sex: 48 / M
Ref By : Dr. Arvind Mehta, MD       Date   : 25-Aug-2026
===============================================================
TEST INVESTIGATION           VALUE     UNIT        REFERENCE INTERVAL
===============================================================
SERUM 25-OH VITAMIN D        14.2      ng/mL       Deficiency: < 20
                                                   Insufficiency: 20 - 29
                                                   Sufficiency: 30 - 100
HIGH SENSITIVITY CRP (hsCRP) 4.8       mg/L        0.0 - 3.0
EXPERIMENTAL CYTOKINE IL-6   18.5      pg/mL       (Reference interval pending clinical trial standardization)
ANTINUCLEAR ANTIBODY (ANA)   Negative  Titer       Negative at 1:40
===============================================================
NOTICE FOR CLINICIAN:
IL-6 assay reference interval has NOT been established by manufacturer
for this demographic batch. No reference range is provided in this source document.
*** END OF REPORT ***`
  }
];
