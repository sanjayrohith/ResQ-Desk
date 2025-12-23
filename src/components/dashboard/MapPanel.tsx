import { useState, useEffect } from "react";
import { Ambulance, Flame, Map as MapIcon, Layers, Zap } from "lucide-react";

interface MapPanelProps {
  severity: string;
  isDataComplete: boolean;
}

export function MapPanel({ severity, isDataComplete }: MapPanelProps) {
  const [selectedUnit, setSelectedUnit] = useState<string>("A12");
  const [pulse, setPulse] = useState(false);

  // Toggle pulse effect for the heatmap
  useEffect(() => {
    const interval = setInterval(() => setPulse(p => !p), 2000);
    return () => clearInterval(interval);
  }, []);

  const units = [
    { id: "A12", type: "AMB", eta: "6m", x: 65, y: 40, color: "bg-cyan-500", text: "text-cyan-400" },
    { id: "F07", type: "FIRE", eta: "12m", x: 80, y: 70, color: "bg-orange-500", text: "text-orange-500" },
    { id: "P04", type: "POL", eta: "4m", x: 30, y: 60, color: "bg-emerald-500", text: "text-emerald-500" },
    { id: "R03", type: "RES", eta: "9m", x: 20, y: 30, color: "bg-purple-500", text: "text-purple-500" },
  ];

  return (
    <div className="flex flex-col h-full bg-zinc-900 border-zinc-800 relative overflow-hidden">
      
      {/* Header */}
      <div className="panel-header border-b border-white/5 p-3 flex justify-between items-center z-20 bg-zinc-900/95 backdrop-blur">
        <span className="text-[10px] font-black text-cyan-400 tracking-widest uppercase flex items-center gap-2">
          <MapIcon className="w-3 h-3" /> Live Geospatial Grid
        </span>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
            <Layers className="w-2.5 h-2.5 text-zinc-400" />
            <span className="text-[8px] text-zinc-300 font-bold">LAYER: HEATMAP</span>
          </div>
          <span className="text-[9px] text-zinc-500 font-mono">SEC-03</span>
        </div>
      </div>

      {/* THE MAP CONTAINER */}
      <div className="relative flex-1 bg-[#09090b] overflow-hidden group">
        
        {/* 1. DARK MAP BACKGROUND (The "Realism" Hack) */}
        {/* We use a dark grayscale map pattern to simulate a satellite view */}
        <div 
          className="absolute inset-0 opacity-40 grayscale contrast-125"
          style={{
            backgroundImage: `url('https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/14/11756/7483.png')`, // Sample Dark Map Tile
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.7) contrast(1.2)'
          }}
        />
        
        {/* Grid Overlay for Tactical Feel */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

        {/* 2. THE HEATMAP (Only shows when incident is active) */}
        {isDataComplete && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
             {/* Large Diffused Heat Area (Blue/Green/Red Gradient) */}
             <div 
                className={`w-64 h-64 rounded-full blur-[60px] transition-all duration-1000 ${pulse ? "opacity-40 scale-105" : "opacity-30 scale-100"}`}
                style={{
                  background: 'radial-gradient(circle, rgba(239,68,68,0.8) 0%, rgba(245,158,11,0.5) 40%, rgba(16,185,129,0.3) 70%, transparent 100%)'
                }}
             />
             
             {/* Core Intensity Marker */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500 blur-xl opacity-60 animate-pulse"></div>
                  <Flame className="w-8 h-8 text-white relative z-10 drop-shadow-lg" />
                  
                  {/* Danger Ring */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border border-red-500/50 rounded-full animate-ping" />
                </div>
             </div>
          </div>
        )}

        {/* 3. UNITS (Tactical Dots) */}
        {units.map((unit) => (
          <button
            key={unit.id}
            onClick={() => setSelectedUnit(unit.id)}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 group/marker z-20`}
            style={{ left: `${unit.x}%`, top: `${unit.y}%` }}
          >
            {/* Range Ring */}
            <div className={`absolute inset-0 -m-4 border border-white/10 rounded-full transition-all duration-500 
              ${selectedUnit === unit.id ? "scale-100 opacity-100" : "scale-0 opacity-0"}`} 
            />
            
            {/* The Unit Dot */}
            <div className={`w-3 h-3 rounded-full shadow-[0_0_10px_black] border border-white/20 relative z-10 transition-transform hover:scale-125 ${unit.color} 
              ${selectedUnit === unit.id ? "ring-2 ring-white scale-125" : ""}`}
            ></div>

            {/* Label (Always visible for clarity now) */}
            <div className={`absolute top-4 left-1/2 -translate-x-1/2 whitespace-nowrap transition-all`}>
              <div className="bg-black/80 backdrop-blur-[2px] px-1.5 py-0.5 rounded border border-white/10 flex flex-col items-center">
                <span className={`text-[8px] font-bold leading-none mb-0.5 ${unit.text}`}>{unit.id}</span>
                <span className="text-[7px] text-zinc-400 font-mono leading-none">{unit.eta}</span>
              </div>
            </div>
          </button>
        ))}

        {/* 4. ROUTE LINE (When Incident + A12 Active) */}
        {isDataComplete && selectedUnit === "A12" && (
           <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
             <defs>
               <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                 <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                 <stop offset="100%" stopColor="#ef4444" stopOpacity="0.8" />
               </linearGradient>
               <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                 <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
               </marker>
             </defs>
             {/* Dashed Path */}
             <line 
               x1="65%" y1="40%" 
               x2="50%" y2="50%" 
               stroke="url(#routeGradient)" 
               strokeWidth="2" 
               strokeDasharray="4 4" 
               className="animate-[dash_1s_linear_infinite]"
               markerEnd="url(#arrowhead)"
             />
           </svg>
        )}
      </div>

      {/* Footer / Controls */}
      <div className="p-3 bg-zinc-900 border-t border-white/5 z-20 shrink-0">
        <div className="flex items-center justify-between mb-3">
           <div className="flex items-center gap-2">
             <Zap className="w-3 h-3 text-amber-400" />
             <span className="text-[9px] font-bold text-zinc-300 uppercase">Live Tracking Active</span>
           </div>
           {isDataComplete && <span className="text-[9px] font-black text-red-500 animate-pulse">HAZARD DETECTED</span>}
        </div>
        
        {/* Quick Legend */}
        <div className="flex justify-between gap-1">
          {units.map((unit) => (
             <div 
               key={unit.id}
               onClick={() => setSelectedUnit(unit.id)}
               className={`flex-1 flex flex-col items-center p-1.5 rounded border cursor-pointer transition-all
                 ${selectedUnit === unit.id 
                   ? "bg-white/5 border-white/20" 
                   : "bg-transparent border-transparent hover:bg-white/5"}`}
             >
               <div className={`w-1.5 h-1.5 rounded-full mb-1 ${unit.color}`} />
               <span className="text-[8px] font-bold text-zinc-400">{unit.id}</span>
             </div>
          ))}
        </div>
      </div>
      
      {/* CSS Animation for the dashed line */}
      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -8;
          }
        }
      `}</style>
    </div>
  );
}