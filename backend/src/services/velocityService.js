/**
 * MedLens - Biomarker Velocity & Kinetic Trajectory Service
 * 
 * Mathematical Formulation:
 * Velocity measures the temporal rate of change:
 * Velocity = (V_t2 - V_t1) / Delta_t (normalized to 30-day clinical months)
 * 
 * Clinical Rationale:
 * A laboratory value within "normal" reference boundaries can still herald impending clinical
 * decompensation if its velocity of change is dangerously steep (e.g. Creatinine doubling in 1 month).
 */

export const VELOCITY_THRESHOLDS = {
  "GLUCOSE, FASTING (PLASMA)": {
    rapidDeltaPerMonth: 15.0,
    unit: "mg/dL/month",
    severity: "HIGH",
    alertName: "Rapid Glycemic Escalation",
    warningThreshold: 10.0,
    clinicalContext: "Rapidly worsening insulin resistance or acute beta-cell decompensation."
  },
  "GLUCOSE, FASTING": {
    rapidDeltaPerMonth: 15.0,
    unit: "mg/dL/month",
    severity: "HIGH",
    alertName: "Rapid Glycemic Escalation",
    warningThreshold: 10.0,
    clinicalContext: "Rapidly worsening insulin resistance or acute beta-cell decompensation."
  },
  "SERUM CREATININE": {
    rapidDeltaPerMonth: 0.15,
    unit: "mg/dL/month",
    severity: "CRITICAL",
    alertName: "Accelerated Renal Decline",
    warningThreshold: 0.08,
    clinicalContext: "Rapid elevation in creatinine indicates acute kidney injury (AKI) or rapid CKD progression."
  },
  "HAEMOGLOBIN": {
    rapidDropPerMonth: -1.0,
    unit: "g/dL/month",
    severity: "CRITICAL",
    alertName: "Precipitous Hemoglobin Decline",
    warningThreshold: -0.6,
    clinicalContext: "Precipitous decline points toward occult blood loss (e.g. GI bleed) or active hemolytic anemia."
  },
  "PLATELET COUNT": {
    rapidDropPerMonth: -40000,
    unit: "cells/cumm/month",
    severity: "HIGH",
    alertName: "Accelerated Thrombocytopenia",
    warningThreshold: -25000,
    clinicalContext: "Rapid platelet consumption or peripheral destruction; elevated hemorrhage risk."
  },
  "TOTAL CHOLESTEROL": {
    rapidDeltaPerMonth: 25.0,
    unit: "mg/dL/month",
    severity: "MODERATE",
    alertName: "Rapid Atherogenic Lipid Rise",
    warningThreshold: 15.0,
    clinicalContext: "Substantial atherogenic lipid surge requiring dietary re-evaluation or statin optimization."
  },
  "HbA1c (GLYCOSYLATED HB)": {
    rapidDeltaPerMonth: 0.4,
    unit: "%/month",
    severity: "HIGH",
    alertName: "Steep Glycated Hemoglobin Divergence",
    warningThreshold: 0.25,
    clinicalContext: "Steep upward drift in long-term glycemic control over a short chronological window."
  }
};

/**
 * Computes velocity and rate of change across an array of chronological points
 * @param {Array<Object>} points - Array of { date, value, unit, labName } sorted chronologically
 * @returns {Object} Comprehensive velocity metrics and clinical alarms
 */
export function calculateSeriesVelocity(testName, points = []) {
  if (!points || points.length < 2) {
    return {
      hasVelocity: false,
      reason: "INSUFFICIENT_DATA_POINTS",
      dataPointsCount: points ? points.length : 0
    };
  }

  const sorted = [...points].sort((a, b) => new Date(a.date) - new Date(b.date));
  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  const t1 = new Date(first.date).getTime();
  const t2 = new Date(last.date).getTime();
  const daysDiff = Math.max(1, (t2 - t1) / (1000 * 60 * 60 * 24));
  const monthsDiff = Math.max(0.1, daysDiff / 30.4375);

  const deltaValue = last.value - first.value;
  const velocityPerMonth = Math.round((deltaValue / monthsDiff) * 100) / 100;
  const velocityPerDay = Math.round((deltaValue / daysDiff) * 1000) / 1000;

  // Check against clinical thresholds
  const normKey = Object.keys(VELOCITY_THRESHOLDS).find(k => 
    testName.toUpperCase().includes(k) || k.includes(testName.toUpperCase())
  );
  const thresholdRule = normKey ? VELOCITY_THRESHOLDS[normKey] : null;

  let isAlert = false;
  let alertSeverity = "NONE";
  let alertTitle = null;
  let clinicalMessage = null;

  if (thresholdRule) {
    if (thresholdRule.rapidDeltaPerMonth && Math.abs(velocityPerMonth) >= thresholdRule.rapidDeltaPerMonth) {
      isAlert = true;
      alertSeverity = thresholdRule.severity;
      alertTitle = thresholdRule.alertName;
      clinicalMessage = `${thresholdRule.clinicalContext} (Velocity: ${velocityPerMonth > 0 ? "+" : ""}${velocityPerMonth} ${thresholdRule.unit})`;
    } else if (thresholdRule.rapidDropPerMonth && velocityPerMonth <= thresholdRule.rapidDropPerMonth) {
      isAlert = true;
      alertSeverity = thresholdRule.severity;
      alertTitle = thresholdRule.alertName;
      clinicalMessage = `${thresholdRule.clinicalContext} (Drop Rate: ${velocityPerMonth} ${thresholdRule.unit})`;
    } else if (thresholdRule.warningThreshold && Math.abs(velocityPerMonth) >= thresholdRule.warningThreshold) {
      isAlert = true;
      alertSeverity = "MODERATE";
      alertTitle = `Moderate ${testName} Velocity`;
      clinicalMessage = `Pace of change is notable (${velocityPerMonth > 0 ? "+" : ""}${velocityPerMonth} ${thresholdRule.unit}). Continued monitoring recommended.`;
    }
  }

  let trajectoryDirection = "STABLE";
  if (velocityPerMonth > 0.05) trajectoryDirection = "UPWARD_ACCELERATING";
  else if (velocityPerMonth < -0.05) trajectoryDirection = "DOWNWARD_DECELERATING";

  return {
    hasVelocity: true,
    testName,
    dataPointsCount: sorted.length,
    initialDate: first.date,
    latestDate: last.date,
    initialValue: first.value,
    latestValue: last.value,
    unit: last.unit || "",
    totalDelta: Math.round(deltaValue * 100) / 100,
    daysSpan: Math.round(daysDiff),
    monthsSpan: Math.round(monthsDiff * 10) / 10,
    velocityPerMonth,
    velocityPerDay,
    trajectoryDirection,
    isAlert,
    alertSeverity,
    alertTitle,
    clinicalMessage
  };
}

/**
 * Computes velocities across all biomarker series from reports
 * @param {Array<Object>} reports - List of clinical reports
 * @returns {Object} Map of testName -> velocity metric object
 */
export function computeAllBiomarkerVelocities(trends = {}) {
  const velocities = {};

  for (const [testName, points] of Object.entries(trends)) {
    if (Array.isArray(points) && points.length >= 2) {
      velocities[testName] = calculateSeriesVelocity(testName, points);
    }
  }

  return velocities;
}
