import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Activity, 
  AlertCircle, 
  CheckCircle2,
  Info,
  Sliders,
  Scale
} from "lucide-react";
import ProvenanceBadge from "./ProvenanceBadge";

export default function TrendTracker({ reports }) {
  const [trendsData, setTrendsData] = useState({});
  const [selectedParam, setSelectedParam] = useState("GLUCOSE, FASTING (PLASMA)");
  const [isCalibratedView, setIsCalibratedView] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/trends")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.trends) {
          setTrendsData(data.trends);
          const keys = Object.keys(data.trends);
          if (keys.length > 0 && !data.trends[selectedParam]) {
            setSelectedParam(keys[0]);
          }
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load trends:", err);
        setLoading(false);
      });
  }, [reports]);

  const availableParams = Object.keys(trendsData);
  const currentPoints = trendsData[selectedParam] || [];

  // Check for inter-lab calibration artifacts in this series
  const artifactPoint = currentPoints.find(p => p.calibration?.isCalibrationArtifact);
  const hasInterLabShift = currentPoints.some(p => p.calibration?.interLabShift);

  // Parse reference interval bounds for the parameter
  let minNorm = null;
  let maxNorm = null;
  if (currentPoints.length > 0 && currentPoints[0].referenceRange) {
    const rangeMatch = currentPoints[0].referenceRange.match(/(\d+(?:\.\d+)?)\s*[-–—to]+\s*(\d+(?:\.\d+)?)/);
    if (rangeMatch) {
      minNorm = parseFloat(rangeMatch[1]);
      maxNorm = parseFloat(rangeMatch[2]);
    } else {
      const ltMatch = currentPoints[0].referenceRange.match(/<\s*=?\s*(\d+(?:\.\d+)?)/);
      if (ltMatch) {
        maxNorm = parseFloat(ltMatch[1]);
        minNorm = 0;
      }
    }
  }

  // Calculate SVG scale
  const rawValues = currentPoints.map(p => p.value);
  const calValues = currentPoints.map(p => p.calibration?.percentOfNormal ?? 50);

  let minVal, maxVal;
  if (isCalibratedView) {
    const allCal = [...calValues, 0, 100];
    minVal = Math.min(-20, Math.min(...allCal) - 10);
    maxVal = Math.max(120, Math.max(...allCal) + 15);
  } else {
    const allNumbers = [...rawValues];
    if (minNorm !== null) allNumbers.push(minNorm);
    if (maxNorm !== null) allNumbers.push(maxNorm);
    minVal = allNumbers.length > 0 ? Math.min(...allNumbers) * 0.85 : 0;
    maxVal = allNumbers.length > 0 ? Math.max(...allNumbers) * 1.15 : 100;
  }

  const range = maxVal - minVal || 1;

  const width = 760;
  const height = 300;
  const paddingX = 70;
  const paddingY = 40;

  const getX = (index) => {
    if (currentPoints.length === 1) return width / 2;
    return paddingX + (index / (currentPoints.length - 1)) * (width - 2 * paddingX);
  };

  const getY = (val) => {
    return height - paddingY - ((val - minVal) / range) * (height - 2 * paddingY);
  };

  const activeValues = isCalibratedView ? calValues : rawValues;
  const isDecreasing = activeValues.length >= 2 && activeValues[activeValues.length - 1] < activeValues[0];
  const isIncreasing = activeValues.length >= 2 && activeValues[activeValues.length - 1] > activeValues[0];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Longitudinal Biomarker Trajectory & Calibration Engine
              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">
                Multi-Lab Calibrated
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Harmonizes diverse laboratory instruments, units, and reference intervals into a unified clinical baseline.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Calibrate Data Toggle */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-700/80">
            <button
              onClick={() => setIsCalibratedView(false)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                !isCalibratedView
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Raw Metric View
            </button>
            <button
              onClick={() => setIsCalibratedView(true)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                isCalibratedView
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                  : "text-slate-400 hover:text-purple-300"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Calibrate Data</span>
              <span className="text-[9px] bg-purple-400/20 text-purple-200 px-1 py-0.2 rounded font-mono">
                Normalized
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Parameter Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {availableParams.map(param => (
          <button
            key={param}
            onClick={() => setSelectedParam(param)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedParam === param
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-700"
            }`}
          >
            {param}
          </button>
        ))}
      </div>

      {/* Calibration Drift Warning Notice */}
      {artifactPoint && (
        <div className="bg-purple-950/40 border border-purple-800/60 rounded-xl p-3.5 flex items-start gap-3 text-xs text-purple-200 shadow-lg">
          <Info className="w-5 h-5 text-purple-400 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <div className="font-bold text-purple-300 flex items-center gap-2">
              <span>Analytical Calibration Drift Detected</span>
              <span className="text-[10px] bg-purple-500/30 px-2 py-0.2 rounded border border-purple-400/30 font-normal">
                Anti-False Alarm Guard
              </span>
            </div>
            <p className="text-purple-200/90 leading-relaxed">
              {artifactPoint.calibration.artifactExplanation}
            </p>
          </div>
        </div>
      )}

      {/* Chart Canvas Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <span>{selectedParam}</span>
              {currentPoints.length > 0 && (
                <span className="text-xs font-normal text-slate-400">
                  {isCalibratedView ? "(% of Reference Interval & Multiples of ULN)" : `(${currentPoints[0].unit})`}
                </span>
              )}
            </h4>
            <span className="text-xs text-slate-400">
              {isCalibratedView 
                ? "Calibrated Baseline: [0% = Normal Lower Bound, 100% = Upper Limit of Normal (ULN)]"
                : `Reference Interval: ${currentPoints[0]?.referenceRange || "Standard"}`
              }
            </span>
          </div>

          {currentPoints.length >= 2 && (
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold ${
              isDecreasing 
                ? "bg-blue-950/70 text-blue-300 border border-blue-700/60" 
                : "bg-amber-950/70 text-amber-300 border border-amber-700/60"
            }`}>
              {isDecreasing ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
              <span>{isDecreasing ? "Downward Trajectory" : "Upward Trajectory"}</span>
            </div>
          )}
        </div>

        {/* SVG Chart */}
        {currentPoints.length === 0 ? (
          <div className="py-20 text-center text-slate-500 text-xs">
            No data points recorded for this parameter yet.
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-[320px] select-none">
              <defs>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={isCalibratedView ? "#a855f7" : "#3b82f6"} />
                  <stop offset="100%" stopColor={isCalibratedView ? "#06b6d4" : "#0d9488"} />
                </linearGradient>
                <linearGradient id="normalBand" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#059669" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#059669" stopOpacity="0.05" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((step, idx) => {
                const y = paddingY + step * (height - 2 * paddingY);
                const val = (maxVal - step * range).toFixed(isCalibratedView ? 0 : 1);
                return (
                  <g key={idx}>
                    <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="#1e293b" strokeDasharray="4 4" />
                    <text x={paddingX - 12} y={y + 4} textAnchor="end" fill="#64748b" fontSize="11" fontFamily="JetBrains Mono">
                      {val}{isCalibratedView ? "%" : ""}
                    </text>
                  </g>
                );
              })}

              {/* Reference Range Shaded Band */}
              {isCalibratedView ? (
                // Calibrated Normal Corridor: 0% to 100%
                <g>
                  <rect
                    x={paddingX}
                    y={getY(100)}
                    width={width - 2 * paddingX}
                    height={Math.max(4, getY(0) - getY(100))}
                    fill="url(#normalBand)"
                    stroke="#059669"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    strokeOpacity="0.6"
                  />
                  <line x1={paddingX} y1={getY(50)} x2={width - paddingX} y2={getY(50)} stroke="#059669" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.4" />
                  <text
                    x={width - paddingX - 10}
                    y={getY(100) - 6}
                    fill="#10b981"
                    fontSize="10"
                    textAnchor="end"
                    fontWeight="600"
                  >
                    Calibrated Normal Range [0% to 100% ULN]
                  </text>
                </g>
              ) : (
                minNorm !== null && maxNorm !== null && (
                  <g>
                    <rect
                      x={paddingX}
                      y={getY(maxNorm)}
                      width={width - 2 * paddingX}
                      height={Math.max(4, getY(minNorm) - getY(maxNorm))}
                      fill="url(#normalBand)"
                      stroke="#059669"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                      strokeOpacity="0.4"
                    />
                    <text
                      x={width - paddingX - 10}
                      y={getY(maxNorm) - 6}
                      fill="#10b981"
                      fontSize="10"
                      textAnchor="end"
                      fontWeight="600"
                    >
                      Standard Normal Range ({minNorm} - {maxNorm})
                    </text>
                  </g>
                )
              )}

              {/* Connecting Line Path */}
              {currentPoints.length > 1 && (
                <path
                  d={currentPoints.reduce((acc, pt, idx) => {
                    const x = getX(idx);
                    const plotVal = isCalibratedView ? (pt.calibration?.percentOfNormal ?? 50) : pt.value;
                    const y = getY(plotVal);
                    return `${acc} ${idx === 0 ? "M" : "L"} ${x} ${y}`;
                  }, "")}
                  fill="none"
                  stroke="url(#lineGrad)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Data Points */}
              {currentPoints.map((pt, idx) => {
                const cx = getX(idx);
                const plotVal = isCalibratedView ? (pt.calibration?.percentOfNormal ?? 50) : pt.value;
                const cy = getY(plotVal);
                const isAbnormal = isCalibratedView 
                  ? (plotVal < 0 || plotVal > 100)
                  : (pt.flag === "HIGH" || pt.flag === "LOW");

                return (
                  <g key={idx} className="group">
                    {/* Outer pulse */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r="9"
                      fill={isAbnormal ? "#f43f5e" : (isCalibratedView ? "#a855f7" : "#0d9488")}
                      opacity="0.25"
                    />
                    {/* Main dot */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r="5.5"
                      fill={isAbnormal ? "#f43f5e" : (isCalibratedView ? "#a855f7" : "#0d9488")}
                      stroke="#0f172a"
                      strokeWidth="2.5"
                    />
                    {/* Value label above */}
                    <text
                      x={cx}
                      y={cy - 14}
                      textAnchor="middle"
                      fill="#f8fafc"
                      fontSize="11"
                      fontWeight="bold"
                      fontFamily="JetBrains Mono"
                    >
                      {isCalibratedView ? `${plotVal}% (${pt.calibration?.ratioToULN ? pt.calibration.ratioToULN + 'x ULN' : ''})` : pt.value}
                    </text>
                    {/* Date label below */}
                    <text
                      x={cx}
                      y={height - paddingY + 22}
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize="11"
                      fontWeight="500"
                    >
                      {pt.date}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}

        {/* Longitudinal History Table with Calibrated Metrics & Provenance */}
        <div className="pt-3 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Chronological Audit & Calibration Table
            </h5>
            <span className="text-[11px] text-slate-400">
              Tracking: <strong>{currentPoints.length} lab visits</strong>
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Diagnostic Lab Facility</th>
                  <th className="py-2.5 px-3">Raw Value</th>
                  <th className="py-2.5 px-3">Lab Reference Interval</th>
                  <th className="py-2.5 px-3">Calibrated Range %</th>
                  <th className="py-2.5 px-3">Ratio to ULN</th>
                  <th className="py-2.5 px-3">Calibration Status</th>
                  <th className="py-2.5 px-3">Provenance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {currentPoints.map((pt, idx) => {
                  const cal = pt.calibration || {};
                  const isHigh = pt.flag === "HIGH" || cal.calibrationStatus === "ABOVE_UPPER_LIMIT" || cal.calibrationStatus === "CRITICALLY_ELEVATED";
                  const isLow = pt.flag === "LOW" || cal.calibrationStatus === "BELOW_LOWER_LIMIT";

                  return (
                    <tr key={idx} className="hover:bg-slate-800/30 transition">
                      <td className="py-2.5 px-3 font-medium text-slate-300 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {pt.date}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">
                        <div className="text-slate-200 font-medium">{pt.labName}</div>
                        {pt.reportCalibrationMeta?.methods?.[0] && (
                          <div className="text-[10px] text-slate-500">{pt.reportCalibrationMeta.methods[0]}</div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-white">
                        {pt.value} <span className="text-slate-400 text-xs font-normal">{pt.unit}</span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-400">{pt.referenceRange}</td>
                      <td className="py-2.5 px-3 font-mono font-semibold">
                        {cal.percentOfNormal !== null && cal.percentOfNormal !== undefined ? (
                          <span className={`${
                            isHigh ? "text-rose-400" : isLow ? "text-blue-400" : "text-emerald-400"
                          }`}>
                            {cal.percentOfNormal}%
                          </span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-300">
                        {cal.ratioToULN ? (
                          <span className="bg-slate-800 px-2 py-0.5 rounded text-[11px] font-semibold text-purple-300 border border-slate-700">
                            {cal.ratioToULN}x ULN
                          </span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isHigh ? "bg-rose-950 text-rose-400 border border-rose-800" :
                          isLow ? "bg-blue-950 text-blue-400 border border-blue-800" :
                          "bg-emerald-950 text-emerald-400 border border-emerald-800"
                        }`}>
                          {cal.calibrationStatus || pt.flag}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <ProvenanceBadge type={pt.provenance} showTooltip={false} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
