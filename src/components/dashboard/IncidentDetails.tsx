import { MapPin, Activity, ShieldAlert, Brain, Target } from "lucide-react";

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
  const hasData = !!data.location && data.location !== "Awaiting data...";

  const severityConfig: any = {
    Critical: "bg-red-500/20 text-red-500 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]",
    High: "bg-amber-500/20 text-amber-500 border-amber-500/50",
    Medium: "bg-yellow-500/20 text-yellow-500 border-yellow-500/50",
    Low: "bg-emerald-500/20 text-emerald-500 border-emerald-500/50",
    Normal: "bg-white/5 text-slate-400 border-white/10",
  };

  const safeSeverity = data.severity 
    ? (data.severity.charAt(0).toUpperCase() + data.severity.slice(1).toLowerCase()) 
    : "Normal";
  const badgeStyle = severityConfig[safeSeverity] || severityConfig.Normal;

  return (
    // BG set to Transparent to allow Glass Card to show through
    <div className="flex flex-col h-full bg-transparent overflow-hidden relative">
      
      <div className="panel-header border-b border-white/5 p-4 flex justify-between items-center bg-black/20">
        <span className="text-xs font-black text-cyan-400 tracking-[0.2em] uppercase flex items-center gap-2">
          <Target className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} /> 
          INCIDENT REPORT FORM
        </span>
        <div className="flex items-center gap-2">
          {isLoading ? (
            <span className="text-[10px] text-cyan-400 animate-pulse font-mono">AI ANALYZING...</span>
          ) : hasData ? (
             <span className="text-[10px] text-emerald-500 font-mono">COMPLETE</span>
          ) : (
            <span className="text-[10px] text-zinc-500 font-mono">WAITING FOR INPUT</span>
          )}
        </div>
      </div>

      <div className="flex-1 p-5 space-y-5 overflow-y-auto">
        
        {/* Emergency Type & Severity */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" /> Emergency Type
            </label>
            <div className={`p-3 border h-12 flex items-center transition-all duration-500 ${hasData ? "bg-white/5 border-cyan-500/30 text-white shadow-[inset_0_0_10px_rgba(6,182,212,0.1)]" : "bg-white/5 border-white/5 text-zinc-700"}`}>
               <span className="font-mono text-sm font-bold uppercase tracking-tight">
                 {hasData ? data.emergency_type : "-----------------"}
               </span>
            </div>
          </div>

          <div className="space-y-1">
             <label className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest flex items-center gap-1">
              <Activity className="w-3 h-3" /> Severity Level
            </label>
            <div className={`p-3 border h-12 flex items-center justify-between bg-white/5 border-white/5`}>
              {hasData ? (
                <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase tracking-wider w-full text-center ${badgeStyle}`}>
                  {safeSeverity}
                </span>
              ) : (
                <span className="text-zinc-700 font-mono text-sm">-----------</span>
              )}
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="space-y-1">
          <label className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest flex items-center gap-1">
            <MapPin className="w-3 h-3" /> Identified Location
          </label>
          <div className={`p-3 border h-12 flex items-center transition-all ${hasData ? "bg-white/5 border-cyan-500/30 text-white" : "bg-white/5 border-white/5 text-zinc-700"}`}>
             <span className="font-mono text-sm truncate">
               {hasData ? data.location : "----------------------------------------"}
             </span>
          </div>
        </div>

        {/* Confidence & Keywords */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-4 space-y-1">
            <label className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">AI Confidence</label>
            <div className={`p-3 border h-24 flex flex-col items-center justify-center bg-white/5 border-white/5`}>
              <span className={`text-3xl font-black tabular-nums ${hasData ? "text-cyan-400 text-glow-cyan" : "text-zinc-800"}`}>
                {hasData && data.confidence_score ? (data.confidence_score * 100).toFixed(0) : "00"}%
              </span>
              <div className="w-full bg-zinc-800 h-1 mt-2 rounded-full overflow-hidden">
                <div 
                  className="bg-cyan-400 h-full transition-all duration-1000 box-shadow-[0_0_10px_cyan]" 
                  style={{ width: hasData && data.confidence_score ? `${data.confidence_score * 100}%` : '0%' }}
                />
              </div>
            </div>
          </div>

          <div className="col-span-8 space-y-1">
            <label className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">Detected Keywords</label>
            <div className={`p-3 border h-24 overflow-hidden bg-white/5 border-white/5`}>
               {hasData && data.keywords && data.keywords.length > 0 ? (
                 <div className="flex flex-wrap gap-2">
                   {data.keywords.map((k, i) => (
                     <span key={i} className="px-1.5 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-bold uppercase">
                       {k}
                     </span>
                   ))}
                 </div>
               ) : (
                 <div className="text-zinc-700 font-mono text-xs space-y-1">
                   <p>-- -- --</p>
                   <p>-- -- --</p>
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* Reasoning */}
        <div className="space-y-1">
          <label className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest flex items-center gap-1">
            <Brain className="w-3 h-3" /> Tactical Reasoning
          </label>
          <div className={`p-3 border min-h-[80px] bg-white/5 ${hasData ? "border-cyan-500/30" : "border-white/5"}`}>
             <p className={`font-mono text-xs leading-relaxed italic ${hasData ? "text-cyan-100/70" : "text-zinc-800"}`}>
               {hasData ? `"${data.reasoning}"` : "Waiting for intelligence feed..."}
             </p>
          </div>
        </div>

      </div>
    </div>
  );
}