import { useState } from "react";
import { Truck, Clock, Target, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Unit {
  id: string;
  type: string;
  status: "available" | "busy" | "dispatched";
  distance: number;
  eta: number;
  x: number;
  y: number;
}

const UNITS: Unit[] = [
  { id: "A12", type: "Ambulance", status: "available", distance: 2.3, eta: 6, x: 35, y: 25 },
  { id: "F07", type: "Fire Truck", status: "busy", distance: 4.1, eta: 12, x: 75, y: 35 },
  { id: "R03", type: "Rescue Boat", status: "available", distance: 3.8, eta: 9, x: 20, y: 65 },
  { id: "A08", type: "Ambulance", status: "busy", distance: 5.2, eta: 14, x: 80, y: 70 },
  { id: "R01", type: "Rescue Boat", status: "available", distance: 2.9, eta: 7, x: 55, y: 80 },
];

const INCIDENT_POSITION = { x: 50, y: 50 };

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
      title: "Tactical Dispatch Confirmed",
      description: `${selectedUnit.type} ${selectedUnit.id} is moving to target.`,
    });
  };

  return (
    <div className="flex flex-col h-full p-5 bg-[#0B0F1A] rounded-xl border border-white/5 shadow-2xl overflow-hidden">
      {/* Tactical Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-blue-500/10 border border-blue-500/20">
            <Target className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Resource Matching System</h2>
            <p className="text-xs font-bold text-white tracking-tight">Zone: R-03 // South Sector</p>
          </div>
        </div>
        <div className="px-2 py-1 bg-white/5 rounded border border-white/10 flex items-center gap-2">
            <Activity className="w-3 h-3 text-emerald-500 animate-pulse" />
            <span className="text-[9px] font-mono text-slate-400">SAT_LINK: ACTIVE</span>
        </div>
      </div>

      {/* Map Visualization */}
      <div className="relative flex-1 mb-4 bg-[#080B10] rounded-xl overflow-hidden border border-white/10 group">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Advanced Grid */}
          <defs>
            <pattern id="minorGrid" width="5" height="5" patternUnits="userSpaceOnUse">
              <path d="M 5 0 L 0 0 0 5" fill="none" stroke="white" strokeWidth="0.05" opacity="0.05" />
            </pattern>
            <pattern id="majorGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.1" opacity="0.1" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#minorGrid)" />
          <rect width="100" height="100" fill="url(#majorGrid)" />

          {/* Range Rings (Concentric circles around incident) */}
          {[15, 30, 45].map((radius) => (
            <circle
              key={radius}
              cx={INCIDENT_POSITION.x}
              cy={INCIDENT_POSITION.y}
              r={radius}
              fill="none"
              stroke="white"
              strokeWidth="0.1"
              strokeDasharray="1,2"
              opacity="0.1"
            />
          ))}

          {/* Connection Path to selected unit */}
          <line
            x1={INCIDENT_POSITION.x}
            y1={INCIDENT_POSITION.y}
            x2={selectedUnit.x}
            y2={selectedUnit.y}
            stroke={selectedUnit.status === 'available' ? '#34d399' : '#94a3b8'}
            strokeWidth="0.5"
            strokeDasharray="2,2"
            className="animate-pulse" 
            // Note: For a true 'crawling line' animation, you'd use CSS keyframes on stroke-dashoffset
          />

          {/* Incident Target */}
          <g className="animate-pulse">
            <circle cx={INCIDENT_POSITION.x} cy={INCIDENT_POSITION.y} r="3" className="fill-red-500 shadow-lg" />
            <circle cx={INCIDENT_POSITION.x} cy={INCIDENT_POSITION.y} r="6" className="fill-none stroke-red-500/50" strokeWidth="0.5" />
          </g>

          {/* Unit Markers */}
          {UNITS.map((unit) => (
            <g 
              key={unit.id} 
              className="cursor-pointer transition-all duration-300" 
              onClick={() => setSelectedUnit(unit)}
              opacity={selectedUnit.id === unit.id ? 1 : 0.6}
            >
              <circle
                cx={unit.x}
                cy={unit.y}
                r={selectedUnit.id === unit.id ? "3.5" : "2.5"}
                className={`${unit.status === 'available' ? 'fill-emerald-500' : 'fill-slate-600'} transition-all`}
              />
              {selectedUnit.id === unit.id && (
                <circle cx={unit.x} cy={unit.y} r="5" className="fill-none stroke-emerald-500/30" strokeWidth="0.5" />
              )}
              <text x={unit.x} y={unit.y - 5} textAnchor="middle" className="fill-white text-[3px] font-black uppercase tracking-tighter">
                {unit.id}
              </text>
            </g>
          ))}
        </svg>

        {/* Floating Coordinates Tooltip */}
        <div className="absolute top-3 right-3 p-2 bg-black/60 backdrop-blur-md border border-white/10 rounded font-mono text-[9px] text-blue-400">
          LAT: 12.9716 / LON: 77.5946
        </div>
      </div>

      {/* Unit Status HUD */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 rounded-lg bg-white/[0.03] border border-white/10">
          <label className="text-[9px] font-black text-slate-500 uppercase mb-1 block">Selected Asset</label>
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-bold text-white tracking-tight">{selectedUnit.type} {selectedUnit.id}</span>
          </div>
        </div>
        <div className="p-3 rounded-lg bg-white/[0.03] border border-white/10">
          <label className="text-[9px] font-black text-slate-500 uppercase mb-1 block">ETA Analysis</label>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-bold text-white tracking-tight">{selectedUnit.eta} Minutes</span>
          </div>
        </div>
      </div>

      {/* Dispatch Action */}
      <Button
        onClick={handleDispatch}
        disabled={!isDataComplete || isDispatched || selectedUnit.status === "busy"}
        className={`w-full h-12 font-black uppercase tracking-[0.1em] text-xs transition-all duration-500 ${
          isDispatched 
            ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
            : "bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
        }`}
      >
        {isDispatched ? "✓ DEPLOYMENT INITIALIZED" : "CONFIRM & DISPATCH UNIT"}
      </Button>
    </div>
  );
}