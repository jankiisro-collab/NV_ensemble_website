"use client";

import { ReconstructionChart, ErrorChart } from "../Charts";

const PANEL = "qnav-panel p-5";

export default function AnalysisModule({ rows }) {
  const meanAbsErr = rows.reduce((a, r) => a + Math.abs(r.B_total_meas_nT - r.B_total_true_nT), 0) / rows.length;
  const errs = rows.map((r) => r.B_total_meas_nT - r.B_total_true_nT);
  const meanErr = errs.reduce((a, b) => a + b, 0) / errs.length;
  const stdErr = Math.sqrt(errs.reduce((a, b) => a + (b - meanErr) ** 2, 0) / errs.length);
  const maxErr = Math.max(...errs.map(Math.abs));

  return (
    <div className="space-y-6 qnav-fade-in">
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight qnav-glow-text">Analysis</h1>
        <p className="text-gray-500 text-sm mt-1">Ensemble reconstruction quality vs simulated ground truth.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MiniStat label="Mean |error|" value={`${meanAbsErr.toFixed(1)} nT`} color="#22d3ee" />
        <MiniStat label="Error σ" value={`${stdErr.toFixed(1)} nT`} color="#fb923c" />
        <MiniStat label="Max |error|" value={`${maxErr.toFixed(1)} nT`} color="#f87171" />
        <MiniStat label="Bias (mean err)" value={`${meanErr.toFixed(1)} nT`} color="#a78bfa" />
      </div>

      <div className={PANEL}>
        <h2 className="text-sm font-semibold text-gray-300 mb-1">Ensemble reconstruction vs ground truth (B_total)</h2>
        <p className="text-[11px] text-gray-600 mb-2">Y-axis auto-scales to the data range — not fixed at zero.</p>
        <ReconstructionChart rows={rows} />
      </div>

      <div className={PANEL}>
        <h2 className="text-sm font-semibold text-gray-300 mb-3">B_total reconstruction error vs time</h2>
        <ErrorChart rows={rows} />
      </div>
    </div>
  );
}

function MiniStat({ label, value, color }) {
  return (
    <div className="qnav-panel p-3.5">
      <div className="text-[10px] uppercase tracking-wide text-gray-500">{label}</div>
      <div className="text-lg font-bold font-mono mt-0.5" style={{ color }}>
        {value}
      </div>
    </div>
  );
}
