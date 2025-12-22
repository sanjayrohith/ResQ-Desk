import { useState } from "react";
import { Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Unit {
  id: string;
  type: string;
  typeShort: string;
  status: "available" | "busy" | "dispatched";
  eta: number;
  angle: number; // Position on radar in degrees
  distance: number; // Distance from center (0-1)
}

const UNITS: Unit[] = [
  { id: "A12", type: "Ambulance", typeShort: "AMBULANCE", status: "available", eta: 6, angle: 45, distance: 0.35 },
  { id: "F07", type: "Fire Truck", typeShort: "FIRE", status: "busy", eta: 12, angle: 120, distance: 0.55 },
  { id: "P04", type: "Police", typeShort: "POLICE", status: "available", eta: 4, angle: 200, distance: 0.7 },
  { id: "R03", type: "Rescue", typeShort: "RESCUE", status: "available", eta: 9, angle: 280, distance: 0.45 },
];

interface MapPanelProps {
  severity: string;
  isDataComplete: boolean;
}

export function MapPanel({ isDataComplete = true }: MapPanelProps) {
  const [selectedUnit, setSelectedUnit] = useState<Unit>(UNITS[0]);
  const [isDispatched, setIsDispatched] = useState(false);
  const { toast } = useToast();

  const handleDispatch = () => {
    setIsDispatched(true);
    toast({
      title: "Dispatch Confirmed",
      description: `${selectedUnit.type} ${selectedUnit.id} en route to incident.`,
    });
  };

  // Convert polar to cartesian for radar positioning
  const polarToCartesian = (angle: number, distance: number) => {
    const radian = (angle - 90) * (Math.PI / 180);
    return {
      x: 50 + distance * 40 * Math.cos(radian),
      y: 50 + distance * 40 * Math.sin(radian),
    };
  };

  return (
    <div className="floating-card floating-card-cyan flex flex-col h-full">
      {/* Header */}
      <div className="panel-header">
        <span className="panel-title text-cyan-400 text-glow-cyan">
          Resource Matching
        </span>
        <div className="flex gap-0.5">
          <span className="w-1 h-1 rounded-full bg-slate-600" />
          <span className="w-1 h-1 rounded-full bg-slate-600" />
          <span className="w-1 h-1 rounded-full bg-slate-600" />
        </div>
      </div>

      {/* Zone Info */}
      <div className="px-4 py-2 border-b border-[#1a2835]/50 flex items-center justify-between" style={{ background: 'rgba(8,12,18,0.5)' }}>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500 uppercase">Zone</span>
          <span className="text-sm font-bold text-white">R-03 // SOUTH SECTOR</span>
        </div>
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: "0.2s" }} />
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: "0.4s" }} />
        </div>
      </div>

      {/* Radar Display */}
      <div className="flex-1 p-4 flex items-center justify-center">
        <div className="relative w-full max-w-[300px] aspect-square">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Background */}
            <circle cx="50" cy="50" r="48" fill="#060a0f" stroke="#1a2835" strokeWidth="0.5" />
            
            {/* Grid lines */}
            <line x1="50" y1="2" x2="50" y2="98" stroke="#1a2332" strokeWidth="0.3" />
            <line x1="2" y1="50" x2="98" y2="50" stroke="#1a2332" strokeWidth="0.3" />
            <line x1="15" y1="15" x2="85" y2="85" stroke="#1a2332" strokeWidth="0.2" />
            <line x1="85" y1="15" x2="15" y2="85" stroke="#1a2332" strokeWidth="0.2" />
            
            {/* Concentric circles */}
            {[15, 30, 45].map((r) => (
              <circle key={r} cx="50" cy="50" r={r} fill="none" stroke="#1a2332" strokeWidth="0.3" />
            ))}
            
            {/* Radar sweep effect */}
            <defs>
              <linearGradient id="sweepGradient" gradientTransform="rotate(90)">
                <stop offset="0%" stopColor="rgba(0, 212, 255, 0)" />
                <stop offset="100%" stopColor="rgba(0, 212, 255, 0.15)" />
              </linearGradient>
            </defs>
            <path
              d="M 50 50 L 50 5 A 45 45 0 0 1 95 50 Z"
              fill="url(#sweepGradient)"
              className="radar-sweep origin-center"
            />

            {/* Center incident marker */}
            <circle cx="50" cy="50" r="3" fill="#ef4444" className="glow-pulse" />
            <circle cx="50" cy="50" r="5" fill="none" stroke="#ef4444" strokeWidth="0.5" opacity="0.5" />
            
            {/* Coordinate labels */}
            <text x="50" y="8" textAnchor="middle" className="fill-slate-600 text-[3px]">°16° N</text>
            <text x="92" y="52" textAnchor="start" className="fill-slate-600 text-[3px]">° E</text>

            {/* Unit markers */}
            {UNITS.map((unit) => {
              const pos = polarToCartesian(unit.angle, unit.distance);
              const isSelected = selectedUnit.id === unit.id;
              return (
                <g
                  key={unit.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedUnit(unit)}
                >
                  {/* Selection ring */}
                  {isSelected && (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="5"
                      fill="none"
                      stroke={unit.status === "available" ? "#10b981" : "#6b7280"}
                      strokeWidth="0.5"
                      className="animate-pulse"
                    />
                  )}
                  {/* Unit dot */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isSelected ? "3" : "2.5"}
                    fill={unit.status === "available" ? "#10b981" : unit.status === "busy" ? "#f59e0b" : "#6b7280"}
                    className="transition-all"
                  />
                  {/* Unit label */}
                  <text
                    x={pos.x}
                    y={pos.y - 6}
                    textAnchor="middle"
                    className="fill-white text-[3px] font-bold"
                  >
                    {unit.id}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Unit List */}
      <div className="border-t border-[#1a2835]/50">
        {UNITS.map((unit) => {
          const isSelected = selectedUnit.id === unit.id;
          return (
            <div
              key={unit.id}
              onClick={() => setSelectedUnit(unit)}
              className={`flex items-center justify-between px-4 py-3 border-b border-[#1a2835]/40 cursor-pointer transition-all ${
                isSelected ? "bg-cyan-500/10" : "hover:bg-[#0a0e14]/80"
              }`}
              style={isSelected ? { boxShadow: 'inset 0 0 20px rgba(0,212,255,0.1)' } : {}}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    unit.status === "available" ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                />
                <div>
                  <span className={`font-bold ${isSelected ? "text-cyan-400" : "text-white"}`}>
                    {unit.id}
                  </span>
                  <span className="text-slate-500 text-xs ml-2">{unit.typeShort}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <span className={`font-mono ${isSelected ? "text-cyan-400" : "text-slate-400"}`}>
                  {unit.eta} MIN
                </span>
                <span className="text-[9px] text-slate-600 uppercase">ETA</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Asset Footer */}
      <div className="p-4 border-t border-[#1a2835]/50" style={{ background: 'linear-gradient(180deg, rgba(8,12,18,0.9) 0%, rgba(6,10,14,1) 100%)' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[9px] text-slate-500 uppercase tracking-wider">Selected Asset</div>
            <div className="text-sm font-bold text-white">
              {selectedUnit.typeShort} {selectedUnit.id}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span className="text-lg font-bold font-mono text-cyan-400">{selectedUnit.eta} MIN</span>
          </div>
        </div>
        
        <button
          onClick={handleDispatch}
          disabled={!isDataComplete || isDispatched || selectedUnit.status === "busy"}
          className={`w-full py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-all ${
            isDispatched
              ? "bg-slate-800 text-slate-500 cursor-not-allowed"
              : selectedUnit.status === "busy"
              ? "bg-amber-500/20 text-amber-500 border border-amber-500/30 cursor-not-allowed"
              : "bg-cyan-500 text-[#0a0e14] hover:bg-cyan-400"
          }`}
          style={!isDispatched && selectedUnit.status !== "busy" ? { boxShadow: '0 0 20px rgba(0,212,255,0.4), 0 0 40px rgba(0,212,255,0.2), inset 0 1px 0 rgba(255,255,255,0.2)' } : {}}
        >
          {isDispatched ? "✓ DISPATCHED" : selectedUnit.status === "busy" ? "UNIT BUSY" : "DISPATCH UNIT"}
        </button>
      </div>
    </div>
  );
}