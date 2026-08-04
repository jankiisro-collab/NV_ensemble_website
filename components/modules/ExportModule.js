"use client";

import { Download, FileJson } from "lucide-react";
import { rowsToCsv, downloadCsv } from "../../lib/csv";

const PANEL = "qnav-panel p-5";

const BASE_COLS = [
  "time_s", "lat_deg", "lon_deg", "alt_m", "Px_m", "Py_m", "Pz_m",
  "roll_deg", "pitch_deg", "yaw_deg", "Bx_true_nT", "By_true_nT",
  "Bz_true_nT", "B_total_true_nT",
];
const TAIL_COLS = ["Bx_meas_nT", "By_meas_nT", "Bz_meas_nT", "B_total_meas_nT"];

export default function ExportModule({ rows, params }) {
  const diamondCols = Array.from({ length: params.nDiamonds }, (_, i) => `B_proj_D${i + 1}_nT`);
  const allCols = [...BASE_COLS, ...diamondCols, ...TAIL_COLS];

  const handleCsv = () => {
    const csv = rowsToCsv(rows, params.nDiamonds);
    downloadCsv(`nv_ensemble_${params.vehicleType}_${params.nDiamonds}diamonds.csv`, csv);
  };

  const handleJson = () => {
    const blob = new Blob([JSON.stringify(rows, null, 0)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nv_ensemble_${params.vehicleType}_${params.nDiamonds}diamonds.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 qnav-fade-in max-w-2xl">
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight qnav-glow-text">Data Export</h1>
        <p className="text-gray-500 text-sm mt-1">Download the current simulation run — recalculates from whatever is set right now.</p>
      </div>

      <div className={PANEL}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm text-gray-200 font-medium">{rows.length.toLocaleString()} rows</div>
            <div className="text-[11px] text-gray-500">{allCols.length} columns · {params.nDiamonds} diamond channels</div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCsv}
              className="flex items-center gap-1.5 bg-gradient-to-r from-cyan to-emerald-400 text-[#05070d] font-semibold text-xs px-4 py-2.5 rounded-lg hover:brightness-110 active:scale-95 transition shadow-glow"
            >
              <Download size={14} /> CSV
            </button>
            <button
              onClick={handleJson}
              className="flex items-center gap-1.5 border border-border text-gray-300 font-medium text-xs px-4 py-2.5 rounded-lg hover:border-cyan/50 hover:text-cyan transition"
            >
              <FileJson size={14} /> JSON
            </button>
          </div>
        </div>

        <div className="text-[11px] text-gray-500 mb-2">Columns included</div>
        <div className="flex flex-wrap gap-1.5">
          {allCols.map((c) => (
            <span key={c} className="px-2 py-1 rounded-md bg-white/5 border border-border text-[10px] font-mono text-gray-400">
              {c}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
