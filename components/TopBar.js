"use client";

import { useEffect, useState } from "react";
import { Menu, Download, Radio } from "lucide-react";

export default function TopBar({ onMenuClick, onDownload, rowCount }) {
  const [clock, setClock] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock(now.toISOString().slice(11, 19) + " UTC");
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="sticky top-0 z-20 backdrop-blur-md bg-[#070a10]/80 border-b border-border">
      <div className="flex items-center justify-between px-4 lg:px-6 py-3">
        <div className="flex items-center gap-3">
          <button onClick={onMenuClick} className="lg:hidden text-gray-400 hover:text-cyan p-1">
            <Menu size={22} />
          </button>
          <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
            <Radio size={13} className="text-accentGreen" />
            <span className="qnav-live-dot" />
            <span className="tracking-wide">LIVE SIMULATION</span>
            <span className="mx-1.5 text-gray-700">|</span>
            <span className="font-mono">{clock}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden md:inline text-[11px] text-gray-500 font-mono">
            {rowCount.toLocaleString()} samples
          </span>
          <button
            onClick={onDownload}
            className="flex items-center gap-1.5 bg-gradient-to-r from-cyan to-emerald-400 text-[#05070d] font-semibold text-xs px-3.5 py-2 rounded-lg hover:brightness-110 active:scale-95 transition shadow-glow"
          >
            <Download size={14} strokeWidth={2.5} />
            Export CSV
          </button>
        </div>
      </div>
    </header>
  );
}
