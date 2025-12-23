import { MapPin, Clock, AlertTriangle, Brain, Target } from "lucide-react";
import { useState, useEffect } from "react";

// SAFETY 1: All fields are optional (?) to prevent TypeScript errors on partial data
export interface IncidentData {
  location?: string;
  emergency_type?: string;
  severity?: string;
  keywords?: string[];
  reasoning?: string;
  confidence_score?: number;
}

interface IncidentDetailsProps {
  data: IncidentData;
  isLoading?: boolean;
}

export function IncidentDetails({ data, isLoading }: IncidentDetailsProps) {
  const [elapsedTime, setElapsedTime] = useState("00:00:00");

  useEffect(() => {
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const hours = Math.floor(elapsed / 3600000);
      const minutes = Math.floor((elapsed % 3600000) / 60000);
      const seconds = Math.floor((elapsed % 60000) / 1000);
      setElapsedTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const severityConfig: any = {
    Critical: { color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/30" },
    High: { color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/30" },
    Medium: { color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
    Low: { color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
    Normal: { color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/30" },
  };

  // SAFETY 2: Normalize Severity (Handle "critical", "Critical", "CRITICAL", or missing)
  // This prevents the UI from breaking if the casing doesn't match 'severityConfig' keys exactly.
  const safeSeverity = data.severity 
    ? (data.severity.charAt(0).toUpperCase() + data.severity.slice(1).toLowerCase()) 
    : "Normal";
    
  const severity = severityConfig[safeSeverity] || severityConfig.Normal;

  // SAFETY 3: Handle Keywords
  // We check if it is actually an Array. If it's a string (like "None") or undefined, we use an empty array.
  const safeKeywords = Array.isArray(data.keywords) ? data.keywords : [];

  return (
    <div className="floating-card floating-card-red flex flex-col h-full bg-zinc-900 border-zinc-800">
      <div className="panel-header border-b border-white/5 p-4 flex justify-between items-center">
        <span className="text-xs font-black text-red-400 tracking-widest uppercase flex items-center gap-2">
          <Target className="w-3 h-3 animate-pulse" /> Active Incident Analysis
        </span>
        {isLoading && <span className="text-[10px] text-cyan-400 animate-pulse font-mono">PROCESSING...</span>}
      </div>

      <div className="flex-1 p-5 space-y-6 overflow-y-auto">
        {/* Severity & Confidence Header */}
        <div className="flex justify-between items-start">
          <div className={`px-3 py-1 border ${severity.border} ${severity.bg} rounded-sm`}>
            <span className={`text-[10px] font-bold uppercase tracking-tighter ${severity.color}`}>
              {safeSeverity} Priority
            </span>
          </div>
          <div className="text-right">
            <div className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">AI Confidence</div>
            <div className="text-lg font-mono text-cyan-400">
              {/* SAFETY 4: Check existence before math */}
              {data.confidence_score !== undefined ? (data.confidence_score * 100).toFixed(0) : "0"}%
            </div>
          </div>
        </div>

        {/* Main Classification */}
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight leading-none mb-1">
            {data.emergency_type || "Analyzing..."}
          </h2>
          <div className="h-1 w-12 bg-red-600"></div>
        </div>

        {/* Location & Time Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-zinc-950 border border-zinc-800 relative">
            <div className="flex items-center gap-2 mb-2 text-zinc-500">
              <MapPin className="w-3 h-3" />
              <span className="text-[9px] uppercase font-bold tracking-widest">Signal Origin</span>
            </div>
            <p className="text-sm font-medium text-zinc-200">
              {data.location || "Unknown Location"}
            </p>
          </div>
          <div className="p-4 bg-zinc-950 border border-zinc-800">
            <div className="flex items-center gap-2 mb-2 text-zinc-500">
              <Clock className="w-3 h-3" />
              <span className="text-[9px] uppercase font-bold tracking-widest">Active Time</span>
            </div>
            <p className="text-xl font-mono text-white tracking-tighter">{elapsedTime}</p>
          </div>
        </div>

        {/* AI Reasoning Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-zinc-500">
            <Brain className="w-3 h-3" />
            <span className="text-[9px] uppercase font-bold tracking-widest">Tactical Reasoning</span>
          </div>
          <div className="p-4 bg-zinc-950/50 border border-zinc-800 italic text-xs leading-relaxed text-zinc-400">
            "{data.reasoning || "Waiting for intelligence feed..."}"
          </div>
        </div>

        {/* Keywords / Flags */}
        <div className="space-y-3">
          <span className="text-[9px] font-bold uppercase tracking-widest text-amber-500">Detected Keywords</span>
          <div className="flex flex-wrap gap-2">
            {safeKeywords.length > 0 ? (
              safeKeywords.map((word, i) => (
                <span key={i} className="px-2 py-1 text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-tighter">
                  {word}
                </span>
              ))
            ) : (
              <span className="text-[10px] text-zinc-600 font-mono">No keywords detected</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}