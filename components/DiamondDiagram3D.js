"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html, Sphere as DreiSphere, Line } from "@react-three/drei";

const COLORS = ["#f87171", "#22d3ee", "#34d399", "#fb923c", "#c084fc", "#facc15", "#f472b6", "#a3e635"];

function Axis({ axis, color, label }) {
  const end = [axis.nx * 2.1, axis.ny * 2.1, axis.nz * 2.1];
  return (
    <group>
      <Line points={[[0, 0, 0], end]} color={color} lineWidth={2.5} />
      <mesh position={end}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.4} />
      </mesh>
      <Html position={[end[0] * 1.18, end[1] * 1.18, end[2] * 1.18]} center>
        <div
          style={{
            color,
            fontSize: 11,
            fontFamily: "ui-monospace, monospace",
            fontWeight: 600,
            textShadow: "0 0 6px rgba(0,0,0,0.8)",
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
        >
          {label}
        </div>
      </Html>
    </group>
  );
}

function Scene({ geometry }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={40} color="#22d3ee" />
      <pointLight position={[-5, -3, -5]} intensity={20} color="#a78bfa" />

      {/* wireframe sphere */}
      <DreiSphere args={[2, 24, 18]}>
        <meshBasicMaterial color="#1e2b3d" wireframe transparent opacity={0.55} />
      </DreiSphere>

      {/* core */}
      <mesh>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color="#334155" emissive="#22d3ee" emissiveIntensity={0.3} />
      </mesh>

      {geometry.map((ax, i) => (
        <Axis key={i} axis={ax} color={COLORS[i % COLORS.length]} label={`D${i + 1}`} />
      ))}

      <OrbitControls enablePan={false} minDistance={3} maxDistance={9} autoRotate autoRotateSpeed={1.1} />
    </>
  );
}

export default function DiamondDiagram3D({ geometry }) {
  return (
    <div className="w-full h-[280px] rounded-lg overflow-hidden bg-[#070c14] border border-[#1a2436]">
      <Canvas camera={{ position: [3.4, 2.4, 4.2], fov: 45 }}>
        <Suspense fallback={null}>
          <Scene geometry={geometry} />
        </Suspense>
      </Canvas>
    </div>
  );
}
