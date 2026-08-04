"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";

const tooltipStyle = {
  backgroundColor: "rgba(10,20,32,0.95)",
  border: "1px solid #22d3ee44",
  borderRadius: 10,
  color: "#e5e7eb",
  fontSize: 12,
  boxShadow: "0 0 20px #22d3ee22",
};

function paddedDomain(values, padFrac = 0.12) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || Math.abs(max) * 0.1 || 100;
  const pad = span * padFrac;
  return [Math.floor(min - pad), Math.ceil(max + pad)];
}

export function ReconstructionChart({ rows }) {
  const domain = paddedDomain(rows.flatMap((r) => [r.B_total_true_nT, r.B_total_meas_nT]));
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={rows} margin={{ top: 8, right: 16, left: 4, bottom: 8 }}>
        <defs>
          <linearGradient id="trueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1a2436" />
        <XAxis
          dataKey="time_s"
          stroke="#64748b"
          fontSize={11}
          label={{ value: "time (s)", position: "insideBottom", offset: -3, fill: "#64748b", fontSize: 11 }}
        />
        <YAxis
          stroke="#64748b"
          fontSize={11}
          domain={domain}
          label={{ value: "nT", angle: -90, position: "insideLeft", fill: "#64748b", fontSize: 11 }}
        />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="B_total_true_nT" name="True B_total" stroke="#34d399" dot={false} strokeWidth={2} isAnimationActive={false} />
        <Line type="monotone" dataKey="B_total_meas_nT" name="Reconstructed B_total" stroke="#22d3ee" dot={false} strokeWidth={1.6} strokeOpacity={0.95} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function ErrorChart({ rows }) {
  const withErr = rows.map((r) => ({ ...r, err: r.B_total_meas_nT - r.B_total_true_nT }));
  const domain = paddedDomain(withErr.map((r) => r.err));
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={withErr} margin={{ top: 8, right: 16, left: 4, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1a2436" />
        <XAxis
          dataKey="time_s"
          stroke="#64748b"
          fontSize={11}
          label={{ value: "time (s)", position: "insideBottom", offset: -3, fill: "#64748b", fontSize: 11 }}
        />
        <YAxis
          stroke="#64748b"
          fontSize={11}
          domain={domain}
          label={{ value: "error (nT)", angle: -90, position: "insideLeft", fill: "#64748b", fontSize: 11 }}
        />
        <Tooltip contentStyle={tooltipStyle} />
        <ReferenceLine y={0} stroke="#374151" />
        <Line type="monotone" dataKey="err" name="Reconstruction error" stroke="#f87171" dot={false} strokeWidth={1.5} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
