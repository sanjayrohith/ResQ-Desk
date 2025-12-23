import { useState, useEffect } from "react";
import { Flame, Map as MapIcon, Layers, Zap } from "lucide-react";

interface MapPanelProps {
  severity: string;
  isDataComplete: boolean;
}

export function MapPanel({ severity, isDataComplete }: MapPanelProps) {
  const [selectedUnit, setSelectedUnit] = useState<string>("A12");
  const [pulse, setPulse] = useState(false);

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
    // BG Transparent for glass effect
    <div className="flex flex-col h-full bg-transparent relative overflow-hidden">
      
      <div className="panel-header border-b border-white/5 p-3 flex justify-between items-center z-20 bg-black/20 backdrop-blur">
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

      <div className="relative flex-1 bg-[#09090b] overflow-hidden group">
        
        {/* MAP BACKGROUND */}
        <div 
          className="absolute inset-0 opacity-40 grayscale contrast-125"
          style={{
            backgroundImage: `url('https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/14/11756/7483.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.7) contrast(1.2)'
          }}
        />
        
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

        {/* INCIDENT ZONE */}
        {isDataComplete && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-0 h-0">
             <div 
                className={`absolute w-96 h-96 rounded-full blur-[80px] transition-all duration-1000 ${pulse ? "opacity-30 scale-105" : "opacity-20 scale-100"}`}
                style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.6) 0%, rgba(245,158,11,0.3) 40%, transparent 70%)' }}
             />
             <div className="absolute w-32 h-32 border border-red-500/30 rounded-full animate-[ping_3s_linear_infinite]" />
             <div className="absolute w-32 h-32 border border-red-500/20 rounded-full animate-[ping_3s_linear_infinite_1s]" />
             <div className="absolute w-24 h-24 border border-red-500/40 border-t-transparent border-l-transparent rounded-full animate-spin" />
             
             <div className="relative z-20 flex flex-col items-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-600 blur-xl opacity-80 animate-pulse"></div>
                  <Flame className="w-8 h-8 text-white relative z-10 drop-shadow-[0_0_15px_rgba(239,68,68,1)]" />
                </div>
                <div className="absolute top-10 bg-black/80 backdrop-blur border border-red-500/50 px-2 py-0.5 rounded text-[8px] font-black text-red-500 uppercase tracking-widest whitespace-nowrap">
                   Thermal Spike
                </div>
             </div>
          </div>
        )}

        {/* UNITS */}
        {units.map((unit) => (
          <button
            key={unit.id}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 group/marker z-20`}
            style={{ left: `${unit.x}%`, top: `${unit.y}%` }}
          >
            <div className={`w-3 h-3 rounded-full shadow-[0_0_10px_black] border border-white/20 relative z-10 transition-transform hover:scale-125 ${unit.color}`} />
            <div className={`absolute top-4 left-1/2 -translate-x-1/2 whitespace-nowrap transition-all`}>
              <div className="bg-black/80 backdrop-blur-[2px] px-1.5 py-0.5 rounded border border-white/10 flex flex-col items-center">
                <span className={`text-[8px] font-bold leading-none mb-0.5 ${unit.text}`}>{unit.id}</span>
                <span className="text-[7px] text-zinc-400 font-mono leading-none">{unit.eta}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
      
      {/* Footer */}
      <div className="p-3 bg-black/40 border-t border-white/5 z-20 shrink-0">
        <div className="flex items-center justify-between mb-3">
           <div className="flex items-center gap-2">
             <Zap className="w-3 h-3 text-amber-400" />
             <span className="text-[9px] font-bold text-zinc-300 uppercase">Live Tracking Active</span>
           </div>
           {isDataComplete && <span className="text-[9px] font-black text-red-500 animate-pulse">HAZARD DETECTED</span>}
        </div>
      </div>
    </div>
  );
}