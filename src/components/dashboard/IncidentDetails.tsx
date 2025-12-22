import { MapPin, Clock, AlertTriangle, Users } from "lucide-react";

export interface IncidentData {
  location: string;
  emergencyType: string;
  severity: string;
  adults: string;
  children: string;
  elderly: string;
  flags: string[];
}

interface IncidentDetailsProps {
  data: IncidentData;
  isLoading?: boolean;
}

export function IncidentDetails({ data, isLoading }: IncidentDetailsProps) {
  const [elapsedTime, setElapsedTime] = useState("00:00:00");
  
  // Timer effect
  useEffect(() => {
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const hours = Math.floor(elapsed / 3600000);
      const minutes = Math.floor((elapsed % 3600000) / 60000);
      const seconds = Math.floor((elapsed % 60000) / 1000);
      setElapsedTime(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const severityConfig = {
    critical: { color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/30" },
    high: { color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/30" },
    medium: { color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
    low: { color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
    normal: { color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/30" },
  };

  const severity = severityConfig[data.severity as keyof typeof severityConfig] || severityConfig.normal;

  return (
    <div className="floating-card floating-card-red flex flex-col h-full">
      {/* Header */}
      <div className="panel-header">
        <span className="panel-title text-red-400 text-glow-red">
          Active Incident
        </span>
        <div className="flex gap-0.5">
          <span className="w-1 h-1 rounded-full bg-slate-600" />
          <span className="w-1 h-1 rounded-full bg-slate-600" />
          <span className="w-1 h-1 rounded-full bg-slate-600" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col overflow-y-auto scrollbar-tactical">
        {/* Priority Badge */}
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className={`w-4 h-4 ${severity.color}`} />
          <span className={`text-[10px] uppercase tracking-wider ${severity.color}`}>
            Priority: {data.severity || "Normal"}
          </span>
        </div>

        {/* Emergency Type - Main Title */}
        <h2 className="text-2xl font-bold text-white uppercase tracking-tight mb-6 leading-tight">
          {data.emergencyType || "Awaiting Classification..."}
        </h2>

        {/* Location & Time Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Location */}
          <div className={`p-3 rounded border ${severity.border} ${severity.bg}`}>
            <div className="flex items-center gap-2 mb-2">
              <MapPin className={`w-3.5 h-3.5 ${severity.color}`} />
              <span className="text-[9px] text-slate-500 uppercase tracking-wider">Location Status</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {data.location || "Triangulating signal..."}
            </p>
          </div>

          {/* Elapsed Time */}
          <div className="inner-card p-3">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-3.5 h-3.5 text-cyan-400" style={{ filter: 'drop-shadow(0 0 4px rgba(0,212,255,0.5))' }} />
              <span className="text-[9px] text-slate-500 uppercase tracking-wider">Elapsed Time</span>
            </div>
            <p className="text-2xl font-bold font-mono text-cyan-400 tabular-nums text-glow-cyan">
              {elapsedTime}
            </p>
          </div>
        </div>

        {/* Victim Registry */}
        <div className="mb-6">
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Adults", value: data.adults, icon: "👤" },
              { label: "Children", value: data.children, icon: "👶" },
              { label: "Elderly", value: data.elderly, icon: "👴" },
            ].map((item) => (
              <div key={item.label} className="inner-card p-4 text-center">
                <Users className="w-4 h-4 text-slate-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white mb-1">{item.value || "0"}</div>
                <div className="text-[9px] text-slate-500 uppercase tracking-wider">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tactical Alerts */}
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-3 border-b border-[#1a2332] pb-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-amber-500">
              Tactical Alerts
            </span>
            <div className="flex gap-0.5">
              <span className="w-1 h-1 rounded-full bg-slate-600" />
              <span className="w-1 h-1 rounded-full bg-slate-600" />
              <span className="w-1 h-1 rounded-full bg-slate-600" />
            </div>
          </div>
          
          <div className="p-3 rounded border border-amber-500/20 bg-amber-500/5">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-bold text-amber-500 uppercase">Hazard Warning</span>
            </div>
            {data.flags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {data.flags.map((flag, i) => (
                  <span key={i} className="px-2 py-1 text-xs bg-amber-500/10 text-amber-400 rounded border border-amber-500/20">
                    {flag}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No special conditions reported...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";