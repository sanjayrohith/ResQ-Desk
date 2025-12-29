import { useState, useEffect } from "react";
import { Flame, Map as MapIcon, Layers, Navigation, Truck, Shield, Heart, Clock, AlertCircle } from "lucide-react";

interface MapPanelProps {
  severity: string;
  isDataComplete: boolean;
}

export function MapPanel({ severity, isDataComplete }: MapPanelProps) {
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setPulse(p => !p), 2000);
    return () => clearInterval(interval);
  }, []);

  const units = [
    { id: "A12", type: "AMB", label: "Ambulance", eta: "6m", x: 65, y: 40, color: "bg-cyan-500", text: "text-cyan-400", icon: Heart },
    { id: "F07", type: "FIRE", label: "Fire Unit", eta: "12m", x: 80, y: 70, color: "bg-orange-500", text: "text-orange-400", icon: Flame },
    { id: "P04", type: "POL", label: "Police", eta: "4m", x: 30, y: 60, color: "bg-emerald-500", text: "text-emerald-400", icon: Shield },
    { id: "R03", type: "RES", label: "Rescue", eta: "9m", x: 20, y: 30, color: "bg-purple-500", text: "text-purple-400", icon: Truck },
  ];

  const isCritical = severity?.toLowerCase() === "critical";

  return (
    <div className="flex flex-col h-full overflow-hidden">
      
      {/* Header */}
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/20">
            <MapIcon className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="panel-title text-cyan-400">TACTICAL MAP</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-cyan-500/30 transition-all">
            <Layers className="w-3 h-3 text-slate-400" />
            <span className="text-[10px] text-slate-300 font-medium">LAYERS</span>
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative flex-1 bg-slate-950 overflow-hidden">
        
        {/* Map Tiles Background */}
        <div 
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: `url('https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/14/11756/7483.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.6) saturate(0.8)'
          }}
        />

        {/* Grid Overlay */}
        <div className="absolute inset-0 tactical-grid opacity-30 pointer-events-none" />
        
        {/* Vignette Effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-transparent to-slate-950/80 pointer-events-none" />

        {/* INCIDENT ZONE */}
        {isDataComplete && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            {/* Danger Zone Rings */}
            <div className={`absolute -inset-32 rounded-full transition-opacity duration-500 ${pulse ? 'opacity-40' : 'opacity-20'}`}
              style={{ 
                background: isCritical 
                  ? 'radial-gradient(circle, rgba(239,68,68,0.4) 0%, rgba(239,68,68,0.1) 40%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(245,158,11,0.3) 0%, rgba(245,158,11,0.1) 40%, transparent 70%)'
              }}
            />
            
            {/* Animated Rings */}
            <div className={`absolute -inset-20 border rounded-full animate-ping opacity-20 ${isCritical ? 'border-red-500' : 'border-amber-500'}`} 
              style={{ animationDuration: '3s' }}
            />
            <div className={`absolute -inset-16 border rounded-full animate-ping opacity-30 ${isCritical ? 'border-red-500' : 'border-amber-500'}`}
              style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}
            />
            
            {/* Spinning Ring */}
            <div className={`absolute -inset-12 border-2 border-dashed rounded-full animate-spin ${isCritical ? 'border-red-500/40' : 'border-amber-500/40'}`}
              style={{ animationDuration: '10s' }}
            />
            
            {/* Center Marker */}
            <div className="relative flex flex-col items-center">
              <div className={`relative p-3 rounded-2xl ${isCritical ? 'bg-red-500/20' : 'bg-amber-500/20'} backdrop-blur-sm border ${isCritical ? 'border-red-500/50' : 'border-amber-500/50'}`}>
                <div className={`absolute inset-0 rounded-2xl ${isCritical ? 'bg-red-500' : 'bg-amber-500'} blur-xl opacity-50 animate-pulse`} />
                <Flame className={`w-8 h-8 relative z-10 ${isCritical ? 'text-red-400' : 'text-amber-400'}`} />
              </div>
              
              {/* Label */}
              <div className={`absolute top-full mt-2 px-3 py-1.5 rounded-lg backdrop-blur-sm whitespace-nowrap ${
                isCritical 
                  ? 'bg-red-500/20 border border-red-500/30' 
                  : 'bg-amber-500/20 border border-amber-500/30'
              }`}>
                <div className="flex items-center gap-2">
                  <AlertCircle className={`w-3 h-3 ${isCritical ? 'text-red-400' : 'text-amber-400'}`} />
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isCritical ? 'text-red-400' : 'text-amber-400'}`}>
                    {isCritical ? 'CRITICAL ZONE' : 'INCIDENT ZONE'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* UNIT MARKERS */}
        {units.map((unit) => {
          const UnitIcon = unit.icon;
          const isSelected = selectedUnit === unit.id;
          
          return (
            <button
              key={unit.id}
              onClick={() => setSelectedUnit(isSelected ? null : unit.id)}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 group"
              style={{ left: `${unit.x}%`, top: `${unit.y}%` }}
            >
              {/* Marker Glow */}
              <div className={`absolute inset-0 rounded-full blur-md opacity-50 transition-all ${unit.color} ${isSelected ? 'scale-150' : 'scale-100'}`} />
              
              {/* Marker Dot */}
              <div className={`relative w-4 h-4 rounded-full border-2 border-white/50 shadow-lg transition-all duration-300 ${unit.color} ${isSelected ? 'scale-125' : 'group-hover:scale-110'}`}>
                {/* Pulse effect for selected */}
                {isSelected && (
                  <div className={`absolute inset-0 rounded-full ${unit.color} animate-ping opacity-40`} />
                )}
              </div>
              
              {/* Info Card */}
              <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 transition-all duration-200 ${isSelected ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0'}`}>
                <div className="bg-slate-900/95 backdrop-blur-sm rounded-xl border border-slate-700/50 p-3 shadow-xl min-w-[120px]">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1.5 rounded-lg ${unit.color}/20`}>
                      <UnitIcon className={`w-3.5 h-3.5 ${unit.text}`} />
                    </div>
                    <div>
                      <div className={`text-xs font-bold ${unit.text}`}>{unit.id}</div>
                      <div className="text-[9px] text-slate-500">{unit.label}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
                    <span className="text-[9px] text-slate-500 uppercase">ETA</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span className="text-xs font-bold text-white">{unit.eta}</span>
                    </div>
                  </div>
                </div>
              </div>
            </button>
          );
        })}

        {/* Compass */}
        <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 flex items-center justify-center">
          <Navigation className="w-5 h-5 text-slate-400" />
        </div>
      </div>
      
      {/* Footer - Unit Legend */}
      <div className="p-4 bg-slate-900/50 border-t border-slate-700/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 live-dot" />
            <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider">Live Tracking</span>
          </div>
          {isDataComplete && (
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider animate-pulse">Incident Active</span>
            </div>
          )}
        </div>
        
        {/* Unit Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {units.map((unit) => {
            const UnitIcon = unit.icon;
            return (
              <button
                key={unit.id}
                onClick={() => setSelectedUnit(selectedUnit === unit.id ? null : unit.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all shrink-0 ${
                  selectedUnit === unit.id 
                    ? `${unit.color}/20 border border-current/30 ${unit.text}` 
                    : 'bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:border-slate-600'
                }`}
              >
                <UnitIcon className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold">{unit.id}</span>
                <span className="text-[10px] opacity-60">{unit.eta}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}