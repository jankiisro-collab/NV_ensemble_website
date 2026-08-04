# QNAV — NV-Center Ensemble Quantum Navigation Console (v3)

A fully interactive, responsive Next.js console with real navigation
(top bar + collapsible sidebar), six modules, a 3D live sensor-geometry
viewer, and a real-coastline world map with click-to-place waypoints.
The entire physics pipeline runs client-side in JS — every control
updates instantly, no backend required.

## Modules (left sidebar)

- **Mission Control** — status summary, quick links, no charts (charts live in Analysis)
- **Vehicle & Motion** — validated vehicle presets (Ground/Aircraft/Drone/Ship): speed range, altitude range, climb-rate lock for ground vehicles
- **Location & Route** — real-geometry world map (actual country shapes via GeoJSON, not a stylized placeholder), click to drop waypoints, edit lat/lon directly, animated zoom from world view into the route view
- **Sensor Ensemble** — 3D live diamond-axis geometry (drag to rotate, auto-rotating), diamond count 3–8, Stage 6 noise budget (η_NV, shot-noise std) shown live
- **Analysis** — exactly 2 charts as requested: reconstruction vs ground truth, and reconstruction error vs time — Y-axis now auto-scales with padding instead of being pinned to a misleading 0–60000 range
- **Data Export** — CSV (exact requested column set, one B_proj_Di column per active diamond) + bonus JSON export

## What changed from v2

1. Real navigation shell — top bar + sidebar, 6 modules, fully responsive (sidebar becomes a slide-over drawer on mobile)
2. 3D live ensemble geometry (react-three-fiber/drei) — replaces the flat SVG diagram
3. Real world map (react-simple-maps + actual country GeoJSON, `public/data/world.geojson`) instead of a stylized/schematic placeholder — click to add waypoints, edit precisely via lat/lon inputs
4. Multi-waypoint routes — trajectory now follows real point-to-point legs when 2+ waypoints are placed (duration is derived from path length ÷ speed); falls back to the original synthetic demo pattern with 0 or 1 waypoints
5. Removed the old "Trajectory (local NE plane)" widget — trajectory is now shown correctly geo-referenced on the real map, so it stays correct through zoom/pan
6. Fixed the Y-axis autoscale bug on the reconstruction chart (was pinned near 0–60000 regardless of data)
7. Framer-motion animations throughout: sidebar active-indicator, module transitions, staggered stat cards, waypoint list add/remove, map zoom tween
8. "Quantum lab" visual identity: dark navy/glow theme, animated grid backdrop, glowing panel borders, live-pulse indicator, atom-ring logo

## Run locally

```bash
npm install
npm run dev
```

## Deploy to Vercel

Push to your connected GitHub repo (`nv-center-ensemble`) — Vercel
auto-redeploys, no config changes needed.

```bash
git add .
git commit -m "v3: navigation shell, 3D ensemble, real world map, waypoint routes"
git push
```

## Honesty notes

- **Geomagnetic model**: centered-dipole approximation, not full IGRF
  (IGRF coefficient tables only run in Python/Fortran and can't execute
  live in a browser). Correct in magnitude and large-scale structure,
  not IGRF-precision. Labeled in the app footer.
- **World map**: real country boundaries (public domain GeoJSON,
  177 features), rendered via an equal-earth projection — genuinely
  accurate, not schematic.

## File map (new/changed since v2)

- `lib/simulation.js` — added `generateWaypointTrajectory` for multi-point routes
- `components/Dashboard.js` — root shell: navigation state, waypoint state, live recompute
- `components/TopBar.js`, `components/Sidebar.js` — navigation chrome
- `components/DiamondDiagram3D.js` — 3D sensor geometry (react-three-fiber)
- `components/WorldMapReal.js` — real-geometry map with world↔route zoom tween
- `components/Charts.js` — the 2 required charts, now with padded auto-scaling Y-axis
- `components/modules/*` — one file per sidebar module
- `public/data/world.geojson` — world country boundary data
