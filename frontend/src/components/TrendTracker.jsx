import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Activity, 
  AlertCircle, 
  CheckCircle2,
  Info
} from "lucide-react";
import ProvenanceBadge from "./ProvenanceBadge";

export default function TrendTracker({ reports }) {
  const [trendsData, setTrendsData] = useState({});
  const [selectedParam, setSelectedParam] = useState("GLUCOSE, FASTING (PLASMA)");
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
  const values = currentPoints.map(p => p.value);
  const allNumbers = [...values];
  if (minNorm !== null) allNumbers.push(minNorm);
  if (maxNorm !== null) allNumbers.push(maxNorm);

  const minVal = allNumbers.length > 0 ? Math.min(...allNumbers) * 0.85 : 0;
  const maxVal = allNumbers.length > 0 ? Math.max(...allNumbers) * 1.15 : 100;
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

  // Trajectory direction
  const isDecreasing = values.length >= 2 && values[values.length - 1] < values[0];
  const isIncreasing = values.length >= 2 && values[values.length - 1] > values[0];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Longitudinal Biomarker Trajectory Analysis
              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">
                Multi-Visit EHR View
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Tracks repeated diagnostic observations across multiple calendar dates to evaluate health trends.
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-300 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700">
          Tracking: <strong>{currentPoints.length} chronological data points</strong>
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

      {/* Chart Canvas Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <span>{selectedParam}</span>
              {currentPoints.length > 0 && (
                <span className="text-xs font-normal text-slate-400">
                  ({currentPoints[0].unit})
                </span>
              )}
            </h4>
            <span className="text-xs text-slate-400">
              Reference Interval: <strong>{currentPoints[0]?.referenceRange || "Standard"}</strong>
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
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#0d9488" />
                </linearGradient>
                <linearGradient id="normalBand" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#059669" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#059669" stopOpacity="0.05" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((step, idx) => {
                const y = paddingY + step * (height - 2 * paddingY);
                const val = (maxVal - step * range).toFixed(1);
                return (
                  <g key={idx}>
                    <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="#1e293b" strokeDasharray="4 4" />
                    <text x={paddingX - 12} y={y + 4} textAnchor="end" fill="#64748b" fontSize="11" fontFamily="JetBrains Mono">
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Reference Range Shaded Band (if available) */}
              {minNorm !== null && maxNorm !== null && (
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
              )}

              {/* Connecting Line Path */}
              {currentPoints.length > 1 && (
                <path
                  d={currentPoints.reduce((acc, pt, idx) => {
                    const x = getX(idx);
                    const y = getY(pt.value);
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
                const cy = getY(pt.value);
                const isAbnormal = pt.flag === "HIGH" || pt.flag === "LOW";

                return (
                  <g key={idx} className="group">
                    {/* Outer pulse */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r="9"
                      fill={isAbnormal ? "#f43f5e" : "#0d9488"}
                      opacity="0.25"
                    />
                    {/* Main dot */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r="5.5"
                      fill={isAbnormal ? "#f43f5e" : "#0d9488"}
                      stroke="#0f172a"
                      strokeWidth="2.5"
                    />
                    {/* Value label above */}
                    <text
                      x={cx}
                      y={cy - 14}
                      textAnchor="middle"
                      fill="#f8fafc"
                      fontSize="12"
                      fontWeight="bold"
                      fontFamily="JetBrains Mono"
                    >
                      {pt.value}
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

        {/* Longitudinal History Table with Provenance */}
        <div className="pt-3 border-t border-slate-800">
          <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Chronological Audit History
          </h5>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400">
                <tr>
                  <th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3">Lab Facility</th>
                  <th className="py-2 px-3">Recorded Value</th>
                  <th className="py-2 px-3">Reference Interval</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Provenance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {currentPoints.map((pt, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-medium text-slate-300 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {pt.date}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">{pt.labName}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-white">
                      {pt.value} <span className="text-slate-400 text-xs font-normal">{pt.unit}</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">{pt.referenceRange}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        pt.flag === "HIGH" ? "bg-rose-950 text-rose-400 border border-rose-800" :
                        pt.flag === "LOW" ? "bg-blue-950 text-blue-400 border border-blue-800" :
                        "bg-emerald-950 text-emerald-400 border border-emerald-800"
                      }`}>
                        {pt.flag}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <ProvenanceBadge type={pt.provenance} showTooltip={false} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
