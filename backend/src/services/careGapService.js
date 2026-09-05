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
    requiredCondition: "Diabetes",
    testNames: ["URINE MICROALBUMIN", "ALBUMIN/CREATININE RATIO", "MICROALBUMIN", "uACR"],
    recommendedTest: "Urine Microalbumin / Albumin-Creatinine Ratio (uACR)",
    intervalMonths: 12,
    guidelineBody: "American Diabetes Association (ADA) / KDIGO",
    clinicalRationale: "Annual screening detects subclinical diabetic nephropathy prior to irreversible eGFR decline.",
    priority: "HIGH"
  },
  {
    id: "gap-dm-hba1c",
    requiredCondition: "Diabetes",
    testNames: ["HbA1c", "GLYCOSYLATED HB", "HbA1c (GLYCOSYLATED HB)"],
    recommendedTest: "HbA1c (Glycosylated Hemoglobin)",
    intervalMonths: 4,
    guidelineBody: "ADA Standards of Medical Care in Diabetes",
    clinicalRationale: "Quarterly or semi-annual evaluation provides 90-day glycemic trajectory oversight.",
    priority: "HIGH"
  },
  {
    id: "gap-dm-eye",
    requiredCondition: "Diabetes",
    testNames: ["DILATED EYE EXAM", "RETINOPATHY SCREENING", "FUNDUS EXAMINATION"],
    recommendedTest: "Annual Dilated Retinal Eye Examination",
    intervalMonths: 12,
    guidelineBody: "American Academy of Ophthalmology (AAO) / ADA",
    clinicalRationale: "Early detection of proliferative diabetic retinopathy prevents vision loss.",
    priority: "MODERATE"
  },
  {
    id: "gap-htn-renal",
    requiredCondition: "Hypertension",
    testNames: ["SERUM CREATININE", "CREATININE", "BUN", "ELECTROLYTES"],
    recommendedTest: "Serum Creatinine & Electrolytes (Renal Function Panel)",
    intervalMonths: 12,
    guidelineBody: "ACC/AHA Hypertension Clinical Guidelines",
    clinicalRationale: "Monitors target organ damage and electrolyte stability on antihypertensive therapy.",
    priority: "MODERATE"
  },
  {
    id: "gap-age-lipid",
    minAge: 40,
    testNames: ["TOTAL CHOLESTEROL", "LIPID PROFILE", "LDL CHOLESTEROL", "TRIGLYCERIDES"],
    recommendedTest: "Complete Lipid Profile (Cardiovascular ASCVD Risk)",
    intervalMonths: 12,
    guidelineBody: "USPSTF / American College of Cardiology (ACC)",
    clinicalRationale: "Annual screening stratifies 10-year atherosclerotic cardiovascular disease risk.",
    priority: "MODERATE"
  },
  {
    id: "gap-age-dm-screen",
    minAge: 35,
    testNames: ["GLUCOSE, FASTING", "GLUCOSE, FASTING (PLASMA)", "HbA1c"],
    recommendedTest: "Fasting Blood Glucose or HbA1c",
    intervalMonths: 36,
    guidelineBody: "USPSTF Prediabetes & Type 2 Diabetes Recommendation",
    clinicalRationale: "Universal screening in adults 35-70 years facilitates prediabetes intervention.",
    priority: "LOW"
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
  const context = patient.patientContext || {};
  const conditions = context.chronicConditions || [];
  const conditionStrings = conditions.map(c => c.toLowerCase());

  const currentDate = new Date();
  const careGaps = [];

  for (const protocol of SCREENING_PROTOCOLS) {
    // Condition eligibility check
    let isEligible = false;

    if (protocol.requiredCondition) {
      isEligible = conditionStrings.some(c => c.includes(protocol.requiredCondition.toLowerCase()));
    } else if (protocol.minAge) {
      isEligible = age >= protocol.minAge;
    }

    if (!isEligible) continue;

    // Search for latest execution of this test across reports
    let latestTestDate = null;
    let latestReportTitle = null;

    for (const report of reports) {
      const hasMatchingTest = (report.observations || []).some(obs => {
        const obsName = (obs.testName || "").toUpperCase();
        return protocol.testNames.some(target => obsName.includes(target.toUpperCase()));
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
