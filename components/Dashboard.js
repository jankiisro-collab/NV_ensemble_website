"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, SlidersHorizontal, RotateCcw } from "lucide-react";
import { runFullSimulation, buildGeometry, computeNoiseBudget } from "../lib/simulation";
import { rowsToCsv, downloadCsv } from "../lib/csv";
import { VEHICLE_PRESETS } from "../lib/vehiclePresets";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import OverviewModule from "./modules/OverviewModule";
import VehicleModule from "./modules/VehicleModule";
import LocationModule from "./modules/LocationModule";
import EnsembleModule from "./modules/EnsembleModule";
import AnalysisModule from "./modules/AnalysisModule";
import ExportModule from "./modules/ExportModule";

const DEFAULT_PARAMS = {
  vehicleType: "aircraft",
  speed: 120,
  startAlt: 3000,
  climbRate: 5,
  turnRate: 2,
  altMin: 0,
  altMax: 12000,
  startLat: 23.0225,
  startLon: 72.5714,
  startDate: "2026-01-01",
  startTime: "00:00",
  duration: 600,
  dt: 1,
  nDiamonds: 4,
  anomalyAmplitude: 150,
  correlationLength: 30,
  anomalySeed: 42,
  integrationTimeS: 10,
  noiseSeed: 123,
};

let wpCounter = 1;

export default function Dashboard() {
  const [activeModule, setActiveModule] = useState("overview");
  const [mobileOpen, setMobileOpen] = useState(false);

  // draftParams = whatever the sliders/dropdowns currently show (editable, no
  // effect on results yet). appliedParams = what the simulation actually
  // uses — only updated when the person clicks "Set Parameters".
  const [draftParams, setDraftParams] = useState(DEFAULT_PARAMS);
  const [appliedParams, setAppliedParams] = useState(DEFAULT_PARAMS);

  const [waypoints, setWaypoints] = useState([]);
  const [activeWaypointId, setActiveWaypointId] = useState(null);
  const [viewMode, setViewMode] = useState("world");

  const isDirty = useMemo(
    () => JSON.stringify(draftParams) !== JSON.stringify(appliedParams),
    [draftParams, appliedParams]
  );

  const applyParams = () => setAppliedParams(draftParams);
  const discardParams = () => setDraftParams(appliedParams);

  // waypoints (map clicks) are already a deliberate, discrete action, so
  // they take effect immediately rather than going through the draft cycle.
  const addWaypoint = (lat, lon) => {
    const id = wpCounter++;
    setWaypoints((wps) => [...wps, { id, lat, lon }]);
    setActiveWaypointId(id);
    if (waypoints.length === 0) {
      setDraftParams((p) => ({ ...p, startLat: lat, startLon: lon }));
      setAppliedParams((p) => ({ ...p, startLat: lat, startLon: lon }));
    }
  };
  const updateWaypoint = (id, lat, lon) => {
    setWaypoints((wps) => wps.map((w) => (w.id === id ? { ...w, lat, lon } : w)));
  };
  const removeWaypoint = (id) => {
    setWaypoints((wps) => wps.filter((w) => w.id !== id));
    if (activeWaypointId === id) setActiveWaypointId(null);
  };

  // the heavy pipeline (trajectory -> field -> reconstruction) only runs
  // against appliedParams + current waypoints
  const sim = useMemo(() => {
    const preset = VEHICLE_PRESETS[appliedParams.vehicleType];
    return runFullSimulation({
      ...appliedParams,
      allowClimb: preset.allowClimb,
      waypoints: waypoints.length >= 2 ? waypoints.map((w) => ({ lat: w.lat, lon: w.lon })) : undefined,
    });
  }, [appliedParams, waypoints]);

  const { rows, geometry, noiseBudget, trajectoryMeta } = sim;

  // cheap live previews (diamond geometry + noise budget) driven straight
  // off the draft — no need to gate a 3D spin or a formula readout behind
  // Set, only the actual trajectory/reconstruction data
  const draftGeometry = useMemo(() => buildGeometry(draftParams.nDiamonds), [draftParams.nDiamonds]);
  const draftNoiseBudget = useMemo(
    () => computeNoiseBudget(draftParams.integrationTimeS),
    [draftParams.integrationTimeS]
  );

  const [showApplied, setShowApplied] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (!mounted) {
      setMounted(true);
      return;
    }
    setShowApplied(true);
    const id = setTimeout(() => setShowApplied(false), 1300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sim]);

  const handleDownload = () => {
    const csv = rowsToCsv(rows, appliedParams.nDiamonds);
    downloadCsv(`nv_ensemble_${appliedParams.vehicleType}_${appliedParams.nDiamonds}diamonds.csv`, csv);
  };

  const moduleProps = {
    overview: (
      <OverviewModule
        params={appliedParams}
        rows={rows}
        geometry={geometry}
        noiseBudget={noiseBudget}
        trajectoryMeta={trajectoryMeta}
        onNavigate={setActiveModule}
      />
    ),
    vehicle: <VehicleModule params={draftParams} setParams={setDraftParams} />,
    location: (
      <LocationModule
        waypoints={waypoints}
        activeWaypointId={activeWaypointId}
        setActiveWaypointId={setActiveWaypointId}
        addWaypoint={addWaypoint}
        updateWaypoint={updateWaypoint}
        removeWaypoint={removeWaypoint}
        viewMode={viewMode}
        setViewMode={setViewMode}
        rows={rows}
        params={draftParams}
        setParams={setDraftParams}
      />
    ),
    ensemble: (
      <EnsembleModule
        params={draftParams}
        setParams={setDraftParams}
        geometry={draftGeometry}
        noiseBudget={draftNoiseBudget}
      />
    ),
    analysis: <AnalysisModule rows={rows} />,
    export: <ExportModule rows={rows} params={appliedParams} />,
  };

  const showApplyBar = ["vehicle", "location", "ensemble"].includes(activeModule);

  return (
    <div className="relative min-h-screen">
      <div className="qnav-backdrop" />
      <div className="relative z-10 flex">
        <Sidebar active={activeModule} onSelect={setActiveModule} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

        <div className="flex-1 min-w-0">
          <TopBar onMenuClick={() => setMobileOpen(true)} onDownload={handleDownload} rowCount={rows.length} />

          <main className="px-4 lg:px-6 py-6 max-w-[1400px] mx-auto qnav-scrollbar pb-24">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeModule}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {moduleProps[activeModule]}
              </motion.div>
            </AnimatePresence>

            <footer className="text-[11px] text-gray-700 pt-10 pb-6">
              Geomagnetic truth uses a centered-dipole approximation, not the full IGRF spherical-harmonic
              model (IGRF only runs in Python). Sensor noise follows the Qnami NV-ODMR sensitivity formula.
            </footer>
          </main>
        </div>
      </div>

      <AnimatePresence>
        {showApplyBar && isDirty && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-0 left-0 right-0 z-40 lg:pl-64"
          >
            <div className="mx-auto max-w-[1400px] px-4 lg:px-6 pb-4">
              <div className="flex items-center justify-between gap-3 bg-[#0d131c]/95 backdrop-blur border border-cyan/30 rounded-xl px-4 py-3 shadow-[0_0_30px_rgba(34,211,238,0.15)]">
                <div className="flex items-center gap-2 text-xs text-gray-300">
                  <SlidersHorizontal size={14} className="text-cyan" />
                  You have unsaved parameter changes — nothing recalculates until you set them.
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={discardParams}
                    className="flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-gray-200 px-2.5 py-1.5"
                  >
                    <RotateCcw size={12} /> Discard
                  </button>
                  <button
                    onClick={applyParams}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-cyan to-emerald-400 text-[#05070d] font-semibold text-xs px-4 py-2 rounded-lg hover:brightness-110 active:scale-95 transition shadow-glow"
                  >
                    <CheckCircle2 size={14} /> Set Parameters
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showApplied && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-[#0d1b16] border border-emerald-500/40 text-emerald-300 text-xs font-medium px-3.5 py-2.5 rounded-lg shadow-[0_0_20px_rgba(52,211,153,0.15)]"
          >
            <CheckCircle2 size={15} />
            Parameters set — {rows.length.toLocaleString()} samples recomputed
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
