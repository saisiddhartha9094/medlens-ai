import React from "react";

/**
 * TrafficLightGauge - Intuitive Visual Analog Meter for Clinical Observations
 * 
 * Visualizes where an observed biomarker reading sits relative to clinical reference intervals:
 * - Green: Optimal / Expected In-Range (0% to 85% of normal interval)
 * - Amber: Borderline / High-Normal Zone (85% to 100% of ULN)
 * - Red: Elevated (>100% of ULN) or Depressed (<0% of Lower Bound)
 */
export default function TrafficLightGauge({ 
  value, 
  unit = "", 
  referenceRange = "", 
  calibration = null,
  flag = "NORMAL"
}) {
  const numVal = parseFloat(value);
  if (isNaN(numVal)) return null;

  // Extract bounds
  let minBound = null;
  let maxBound = null;

  if (calibration?.bounds?.min !== null && calibration?.bounds?.min !== undefined) {
    minBound = calibration.bounds.min;
    maxBound = calibration.bounds.max;
  } else if (referenceRange) {
    const match = referenceRange.match(/(\d+(?:\.\d+)?)\s*[-–—to]+\s*(\d+(?:\.\d+)?)/);
    if (match) {
      minBound = parseFloat(match[1]);
      maxBound = parseFloat(match[2]);
    } else {
      const lt = referenceRange.match(/<\s*=?\s*(\d+(?:\.\d+)?)/);
      if (lt) {
        minBound = 0;
        maxBound = parseFloat(lt[1]);
      }
    }
  }

  // If bounds cannot be determined, return clean fallback
  if (minBound === null && maxBound === null) {
    return (
      <div className="text-[11px] text-slate-500 italic">
        Reference interval not provided for visual calibration
      </div>
    );
  }

  // Effective min and max for rendering meter span
  const lower = minBound !== null ? minBound : 0;
  const upper = maxBound !== null ? maxBound : lower * 2 || 100;
  const span = upper - lower || 1;

  // Calculate clamp percentage: 0% to 100% of the gauge track
  // Map lower to 20% mark, upper to 80% mark, leaving 0-20% for Low and 80-100% for High
  let gaugePos = 50;
  if (numVal <= lower) {
    // Depressed region (0% - 20%)
    const underRatio = Math.max(0, (numVal - lower * 0.7) / (lower * 0.3 || 1));
    gaugePos = Math.max(5, underRatio * 20);
  } else if (numVal >= upper) {
    // Elevated region (80% - 100%)
    const overRatio = Math.min(1, (numVal - upper) / (upper * 0.5 || 1));
    gaugePos = 80 + overRatio * 18;
  } else {
    // In-range region (20% - 80%)
    const inRangeRatio = (numVal - lower) / span;
    gaugePos = 20 + inRangeRatio * 60;
  }

  const isLow = flag === "LOW" || numVal < lower;
  const isHigh = flag === "HIGH" || numVal > upper;
  const isBorderline = !isLow && !isHigh && (numVal >= upper - span * 0.15);
  const isOptimal = !isLow && !isHigh && !isBorderline;

  const statusColor = isHigh
    ? "text-rose-400 bg-rose-950/80 border-rose-700/80"
    : isLow
    ? "text-blue-400 bg-blue-950/80 border-blue-700/80"
    : isBorderline
    ? "text-amber-400 bg-amber-950/80 border-amber-700/80"
    : "text-emerald-400 bg-emerald-950/80 border-emerald-700/80";

  const statusText = isHigh
    ? "Elevated (Above Upper Limit)"
    : isLow
    ? "Low (Below Lower Limit)"
    : isBorderline
    ? "Borderline High-Normal"
    : "Optimal Within Range";

  return (
    <div className="w-full space-y-1.5 py-1">
      {/* Top Status & Value Label */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-white text-sm">{numVal}</span>
          <span className="text-slate-400 text-xs">{unit}</span>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusColor}`}>
          {statusText}
        </span>
      </div>

      {/* Traffic-Light Colored Track */}
      <div className="relative h-2.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800 flex">
        {/* Low Region (Blue/Rose) */}
        <div className="h-full w-[20%] bg-gradient-to-r from-blue-700/60 to-blue-500/40" title="Low / Deficient" />
        {/* Optimal Green Corridor */}
        <div className="h-full w-[50%] bg-gradient-to-r from-emerald-600/70 via-emerald-500/80 to-emerald-400/70" title="Optimal Range" />
        {/* Borderline Amber Corridor */}
        <div className="h-full w-[10%] bg-gradient-to-r from-amber-500/70 to-amber-600/80" title="Borderline High" />
        {/* Elevated Red Corridor */}
        <div className="h-full w-[20%] bg-gradient-to-r from-rose-600/70 to-rose-700/90" title="Elevated / High" />

        {/* Needle Marker Indicator */}
        <div 
          className="absolute top-0 bottom-0 w-2 -ml-1 rounded-full bg-white shadow-md border border-slate-900 transition-all duration-500"
          style={{ left: `${gaugePos}%` }}
        />
      </div>

      {/* Boundary Labels */}
      <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono px-0.5">
        <span>Low: &lt;{lower}</span>
        <span className="text-emerald-400/80">Normal: {lower} – {upper}</span>
        <span>High: &gt;{upper}</span>
      </div>
    </div>
  );
}
