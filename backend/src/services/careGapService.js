/**
 * MedLens - Preventive Care Gap & Screening Reminder Engine
 * 
 * Clinical Foundation:
 * Automatically cross-references patient demographics and documented chronic conditions
 * against established institutional clinical screening guidelines (ADA, USPSTF, KDIGO, ACC/AHA).
 * 
 * Zero External Dependencies:
 * Encodes verified medical knowledge protocols and compares against EHR chronological test records.
 */

export const SCREENING_PROTOCOLS = [
  {
    id: "gap-dm-uacr",
    condition: "Diabetes",
    requiredCondition: "Diabetes",
    test: "Urine Microalbumin / Albumin-Creatinine Ratio (uACR)",
    recommendedTest: "Urine Microalbumin / Albumin-Creatinine Ratio (uACR)",
    testNames: ["URINE MICROALBUMIN", "ALBUMIN/CREATININE RATIO", "MICROALBUMIN", "uACR"],
    intervalMonths: 12,
    guidelineBody: "American Diabetes Association (ADA) / KDIGO",
    clinicalRationale: "Annual screening detects subclinical diabetic nephropathy prior to irreversible eGFR decline.",
    priority: "HIGH"
  },
  {
    id: "gap-dm-hba1c",
    condition: "Diabetes",
    requiredCondition: "Diabetes",
    test: "HbA1c (Glycosylated Hemoglobin)",
    recommendedTest: "HbA1c (Glycosylated Hemoglobin)",
    testNames: ["HbA1c", "GLYCOSYLATED HB", "HbA1c (GLYCOSYLATED HB)"],
    intervalMonths: 4,
    guidelineBody: "ADA Standards of Medical Care in Diabetes",
    clinicalRationale: "Quarterly or semi-annual evaluation provides 90-day glycemic trajectory oversight.",
    priority: "HIGH"
  },
  {
    id: "gap-dm-eye",
    condition: "Diabetes",
    requiredCondition: "Diabetes",
    test: "Annual Dilated Retinal Eye Examination",
    recommendedTest: "Annual Dilated Retinal Eye Examination",
    testNames: ["DILATED EYE EXAM", "RETINOPATHY SCREENING", "FUNDUS EXAMINATION"],
    intervalMonths: 12,
    guidelineBody: "American Academy of Ophthalmology (AAO) / ADA",
    clinicalRationale: "Early detection of proliferative diabetic retinopathy prevents vision loss.",
    priority: "MODERATE"
  },
  {
    id: "gap-dm-foot",
    condition: "Diabetes",
    requiredCondition: "Diabetes",
    test: "Comprehensive Diabetic Foot Examination",
    recommendedTest: "Comprehensive Diabetic Foot Examination",
    testNames: ["FOOT EXAM", "MONOFILAMENT", "DIABETIC FOOT"],
    intervalMonths: 12,
    guidelineBody: "ADA Standards of Care",
    clinicalRationale: "Annual sensory testing detects distal symmetric polyneuropathy and prevents ulceration.",
    priority: "MODERATE"
  },
  {
    id: "gap-htn-renal",
    condition: "Hypertension",
    requiredCondition: "Hypertension",
    test: "Serum Creatinine & Electrolytes (Renal Function Panel)",
    recommendedTest: "Serum Creatinine & Electrolytes (Renal Function Panel)",
    testNames: ["SERUM CREATININE", "CREATININE", "BUN", "ELECTROLYTES"],
    intervalMonths: 12,
    guidelineBody: "ACC/AHA Hypertension Clinical Guidelines",
    clinicalRationale: "Monitors target organ damage and electrolyte stability on antihypertensive therapy.",
    priority: "MODERATE"
  },
  {
    id: "gap-age-lipid",
    minAge: 40,
    test: "Complete Lipid Profile (Cardiovascular ASCVD Risk)",
    recommendedTest: "Complete Lipid Profile (Cardiovascular ASCVD Risk)",
    testNames: ["TOTAL CHOLESTEROL", "LIPID PROFILE", "LDL CHOLESTEROL", "TRIGLYCERIDES"],
    intervalMonths: 12,
    guidelineBody: "USPSTF / American College of Cardiology (ACC)",
    clinicalRationale: "Annual screening stratifies 10-year atherosclerotic cardiovascular disease risk.",
    priority: "MODERATE"
  },
  {
    id: "gap-colorectal-fit",
    minAge: 45,
    maxAge: 75,
    test: "Colorectal Cancer Screening (FIT / Colonoscopy)",
    recommendedTest: "Colorectal Cancer Screening (FIT / Colonoscopy)",
    testNames: ["OCCULT BLOOD", "FOBT", "FIT", "COLONOSCOPY", "STOOL DNA"],
    intervalMonths: 12,
    guidelineBody: "USPSTF Grade A Recommendation",
    clinicalRationale: "Universal screening in adults 45-75 detects adenomatous polyps and early-stage colorectal neoplasia.",
    priority: "HIGH"
  },
  {
    id: "gap-age-dm-screen",
    minAge: 35,
    test: "Fasting Blood Glucose or HbA1c",
    recommendedTest: "Fasting Blood Glucose or HbA1c",
    testNames: ["GLUCOSE, FASTING", "GLUCOSE, FASTING (PLASMA)", "HbA1c"],
    intervalMonths: 36,
    guidelineBody: "USPSTF Prediabetes & Type 2 Diabetes Recommendation",
    clinicalRationale: "Universal screening in adults 35-70 years facilitates prediabetes intervention.",
    priority: "LOW"
  },
  {
    id: "gap-female-mammogram",
    minAge: 40,
    maxAge: 74,
    gender: "Female",
    test: "Screening Mammography (Breast Cancer)",
    recommendedTest: "Screening Mammography (Breast Cancer)",
    testNames: ["MAMMOGRAPHY", "MAMMOGRAM", "BREAST IMAGING"],
    intervalMonths: 24,
    guidelineBody: "USPSTF Grade B Recommendation",
    clinicalRationale: "Biennial screening reduces breast cancer mortality in women aged 40-74.",
    priority: "HIGH"
  }
];

/**
 * Evaluates patient care gaps and screening due dates against chronological test history
 * @param {Object} patient - Patient record containing age, gender, and patientContext
 * @param {Array<Object>} reports - Chronological array of patient diagnostic reports
 * @returns {Object} Comprehensive care gaps audit report
 */
export function evaluateCareGaps(patient = {}, reports = []) {
  const age = patient.age || 48;
  const gender = (patient.gender || "").toLowerCase();
  const context = patient.patientContext || {};
  const conditions = context.chronicConditions || [];
  const conditionStrings = conditions.map(c => c.toLowerCase());

  const currentDate = new Date();
  const careGaps = [];

  for (const protocol of SCREENING_PROTOCOLS) {
    // Condition eligibility check
    let isEligible = false;
    const reqCond = protocol.condition || protocol.requiredCondition;

    if (reqCond) {
      isEligible = conditionStrings.some(c => c.includes(reqCond.toLowerCase()));
    } else if (protocol.minAge) {
      isEligible = age >= protocol.minAge && (!protocol.maxAge || age <= protocol.maxAge);
    }

    if (protocol.gender && gender && protocol.gender.toLowerCase() !== gender) {
      isEligible = false;
    }

    if (!isEligible) continue;

    // Search for latest execution of this test across reports
    let latestTestDate = null;
    let latestReportTitle = null;

    const testTargets = protocol.testNames 
      ? protocol.testNames 
      : (protocol.test ? [protocol.test] : [protocol.recommendedTest]);

    for (const report of reports) {
      const hasMatchingTest = (report.observations || []).some(obs => {
        const obsName = (obs.testName || "").toUpperCase();
        return testTargets.some(target => obsName.includes(target.toUpperCase()));
      });

      if (hasMatchingTest && report.testDate) {
        const rDate = new Date(report.testDate);
        if (!latestTestDate || rDate > latestTestDate) {
          latestTestDate = rDate;
          latestReportTitle = report.documentTitle || report.labName;
        }
      }
    }

    let status = "NEVER_PERFORMED";
    let monthsElapsed = null;
    let daysElapsed = null;
    let dueDate = null;

    if (latestTestDate) {
      daysElapsed = Math.round((currentDate.getTime() - latestTestDate.getTime()) / (1000 * 60 * 60 * 24));
      monthsElapsed = Math.round((daysElapsed / 30.4375) * 10) / 10;

      const dueDateTime = new Date(latestTestDate);
      dueDateTime.setMonth(dueDateTime.getMonth() + protocol.intervalMonths);
      dueDate = dueDateTime.toISOString().split("T")[0];

      if (monthsElapsed > protocol.intervalMonths) {
        status = "OVERDUE";
      } else if (protocol.intervalMonths - monthsElapsed <= 1) {
        status = "DUE_NOW";
      } else {
        status = "UP_TO_DATE";
      }
    } else {
      status = "OVERDUE";
    }

    careGaps.push({
      protocolId: protocol.id,
      recommendedTest: protocol.recommendedTest,
      clinicalRationale: protocol.clinicalRationale,
      guidelineBody: protocol.guidelineBody,
      priority: protocol.priority,
      recommendedIntervalMonths: protocol.intervalMonths,
      status,
      latestTestDate: latestTestDate ? latestTestDate.toISOString().split("T")[0] : null,
      latestReportTitle,
      monthsElapsed,
      dueDate,
      actionRequired: status === "OVERDUE" || status === "DUE_NOW"
    });
  }

  const overdueCount = careGaps.filter(g => g.status === "OVERDUE").length;
  const dueNowCount = careGaps.filter(g => g.status === "DUE_NOW").length;
  const upToDateCount = careGaps.filter(g => g.status === "UP_TO_DATE").length;

  return {
    patientName: patient.fullName || "Patient",
    evaluatedAt: currentDate.toISOString(),
    totalGapsEvaluated: careGaps.length,
    overdueCount,
    dueNowCount,
    upToDateCount,
    adherenceScore: careGaps.length > 0 ? Math.round((upToDateCount / careGaps.length) * 100) : 100,
    careGaps
  };
}
