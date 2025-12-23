import { MapPin, Activity, AlertTriangle, Brain, Target, ShieldAlert } from "lucide-react";
import { useState, useEffect } from "react";

// SAFETY: All fields optional to prevent crashes
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
  // Helper to determine if we have real data or if it's "Empty"
  const hasData = !!data.location && data.location !== "Awaiting data...";

  // Configuration for the severity badge colors
  const severityConfig: any = {
    Critical: "bg-red-500/20 text-red-500 border-red-500/50",
    High: "bg-amber-500/20 text-amber-500 border-amber-500/50",
    Medium: "bg-yellow-500/20 text-yellow-500 border-yellow-500/50",
    Low: "bg-emerald-500/20 text-emerald-500 border-emerald-500/50",
    Normal: "bg-slate-800 text-slate-400 border-slate-700",
  };

  // Safe Severity Access
  const safeSeverity = data.severity 
    ? (data.severity.charAt(0).toUpperCase() + data.severity.slice(1).toLowerCase()) 
    : "Normal";
  const badgeStyle = severityConfig[safeSeverity] || severityConfig.Normal;

  return (
    <div className="flex flex-col h-full bg-zinc-900 border-zinc-800 shadow-2xl overflow-hidden relative">
      
      {/* 1. Header with 'Scanning' Animation */}
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
            <span className="text-[10px] text-zinc-600 font-mono">WAITING FOR INPUT</span>
          )}
        </div>
      </div>

      {/* 2. The Form Content */}
      <div className="flex-1 p-5 space-y-5 overflow-y-auto">
        
        {/* ROW 1: Emergency Type & Severity */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" /> Emergency Type
            </label>
            <div className={`p-3 border h-12 flex items-center ${hasData ? "bg-zinc-950 border-cyan-500/30 text-white" : "bg-zinc-950/50 border-zinc-800 text-zinc-700"}`}>
               <span className="font-mono text-sm font-bold uppercase tracking-tight">
                 {hasData ? data.emergency_type : "-----------------"}
               </span>
            </div>
          </div>

          <div className="space-y-1">
             <label className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest flex items-center gap-1">
              <Activity className="w-3 h-3" /> Severity Level
            </label>
            <div className={`p-3 border h-12 flex items-center justify-between ${hasData ? "bg-zinc-950 border-zinc-700" : "bg-zinc-950/50 border-zinc-800"}`}>
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

        {/* ROW 2: Location (Full Width) */}
        <div className="space-y-1">
          <label className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest flex items-center gap-1">
            <MapPin className="w-3 h-3" /> Identified Location
          </label>
          <div className={`p-3 border h-12 flex items-center ${hasData ? "bg-zinc-950 border-cyan-500/30 text-white" : "bg-zinc-950/50 border-zinc-800 text-zinc-700"}`}>
             <span className="font-mono text-sm truncate">
               {hasData ? data.location : "----------------------------------------"}
             </span>
          </div>
        </div>

        {/* ROW 3: AI Confidence & Keywords */}
        <div className="grid grid-cols-12 gap-4">
          {/* Confidence Score */}
          <div className="col-span-4 space-y-1">
            <label className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">AI Confidence</label>
            <div className={`p-3 border h-24 flex flex-col items-center justify-center ${hasData ? "bg-zinc-950 border-zinc-700" : "bg-zinc-950/50 border-zinc-800"}`}>
              <span className={`text-3xl font-black tabular-nums ${hasData ? "text-cyan-400" : "text-zinc-800"}`}>
                {hasData && data.confidence_score ? (data.confidence_score * 100).toFixed(0) : "00"}%
              </span>
              <div className="w-full bg-zinc-800 h-1 mt-2 rounded-full overflow-hidden">
                <div 
                  className="bg-cyan-400 h-full transition-all duration-1000" 
                  style={{ width: hasData && data.confidence_score ? `${data.confidence_score * 100}%` : '0%' }}
                />
              </div>
            </div>
          </div>

          {/* Keywords */}
          <div className="col-span-8 space-y-1">
            <label className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">Detected Keywords</label>
            <div className={`p-3 border h-24 overflow-hidden ${hasData ? "bg-zinc-950 border-zinc-700" : "bg-zinc-950/50 border-zinc-800"}`}>
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

        {/* ROW 4: AI Reasoning */}
        <div className="space-y-1">
          <label className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest flex items-center gap-1">
            <Brain className="w-3 h-3" /> Tactical Reasoning
          </label>
          <div className={`p-3 border min-h-[80px] ${hasData ? "bg-zinc-950 border-cyan-500/30" : "bg-zinc-950/50 border-zinc-800"}`}>
             <p className={`font-mono text-xs leading-relaxed italic ${hasData ? "text-cyan-100/70" : "text-zinc-800"}`}>
               {hasData ? `"${data.reasoning}"` : "Waiting for intelligence feed..."}
             </p>
          </div>
        </div>

      </div>
    </div>
  );
}