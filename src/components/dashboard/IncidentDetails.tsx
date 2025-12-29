import { MapPin, Activity, ShieldAlert, Brain, Target, Sparkles, TrendingUp, Tag } from "lucide-react";

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

  const severityConfig: Record<string, { bg: string; text: string; glow: string; label: string }> = {
    Critical: { 
      bg: "bg-gradient-to-r from-red-500/20 to-red-600/10", 
      text: "text-red-400", 
      glow: "shadow-red-500/20",
      label: "CRITICAL"
    },
    High: { 
      bg: "bg-gradient-to-r from-amber-500/20 to-orange-500/10", 
      text: "text-amber-400", 
      glow: "shadow-amber-500/20",
      label: "HIGH"
    },
    Medium: { 
      bg: "bg-gradient-to-r from-yellow-500/20 to-amber-500/10", 
      text: "text-yellow-400", 
      glow: "shadow-yellow-500/20",
      label: "MEDIUM"
    },
    Low: { 
      bg: "bg-gradient-to-r from-emerald-500/20 to-green-500/10", 
      text: "text-emerald-400", 
      glow: "shadow-emerald-500/20",
      label: "LOW"
    },
    Normal: { 
      bg: "bg-slate-800/50", 
      text: "text-slate-400", 
      glow: "",
      label: "NORMAL"
    },
  };

  const safeSeverity = data.severity 
    ? (data.severity.charAt(0).toUpperCase() + data.severity.slice(1).toLowerCase()) 
    : "Normal";
  const severityStyle = severityConfig[safeSeverity] || severityConfig.Normal;
  const confidencePercent = hasData && data.confidence_score ? Math.round(data.confidence_score * 100) : 0;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      
      {/* Header */}
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${isLoading ? 'bg-cyan-500/20' : hasData ? 'bg-emerald-500/20' : 'bg-slate-700/50'}`}>
            <Target className={`w-4 h-4 ${isLoading ? 'text-cyan-400 animate-spin' : hasData ? 'text-emerald-400' : 'text-slate-500'}`} />
          </div>
          <span className="panel-title text-cyan-400">INCIDENT REPORT</span>
        </div>
        <div className={`status-badge ${isLoading ? 'status-live' : hasData ? 'status-online' : 'bg-slate-800/50 text-slate-500 border border-slate-700/50'}`}>
          {isLoading ? (
            <>
              <Sparkles className="w-3 h-3 animate-pulse" />
              AI ANALYZING
            </>
          ) : hasData ? (
            "DATA COMPLETE"
          ) : (
            "AWAITING INPUT"
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-5 space-y-4 overflow-y-auto scrollbar-tactical">
        
        {/* Emergency Type & Severity - Side by side */}
        <div className="grid grid-cols-2 gap-4">
          {/* Emergency Type */}
          <div className="space-y-2">
            <label className="data-label">
              <ShieldAlert className="w-3.5 h-3.5" />
              Emergency Type
            </label>
            <div className={`data-cell h-14 flex items-center ${hasData ? 'data-cell-active' : ''}`}>
              {isLoading ? (
                <div className="h-5 w-24 bg-slate-700/50 rounded animate-pulse shimmer" />
              ) : (
                <span className={`font-mono text-base font-bold uppercase tracking-tight ${hasData ? 'text-white' : 'text-slate-700'}`}>
                  {hasData ? data.emergency_type : "—"}
                </span>
              )}
            </div>
          </div>

          {/* Severity */}
          <div className="space-y-2">
            <label className="data-label">
              <Activity className="w-3.5 h-3.5" />
              Severity Level
            </label>
            <div className="data-cell h-14 flex items-center justify-center">
              {isLoading ? (
                <div className="h-7 w-full bg-slate-700/50 rounded-lg animate-pulse shimmer" />
              ) : hasData ? (
                <div className={`w-full py-2 rounded-lg text-center font-bold text-xs uppercase tracking-wider border ${severityStyle.bg} ${severityStyle.text} border-current/30 shadow-lg ${severityStyle.glow}`}>
                  {severityStyle.label}
                </div>
              ) : (
                <span className="text-slate-700 font-mono">—</span>
              )}
            </div>
          </div>
        </div>

        {/* Location - Full width */}
        <div className="space-y-2">
          <label className="data-label">
            <MapPin className="w-3.5 h-3.5" />
            Identified Location
          </label>
          <div className={`data-cell flex items-center ${hasData ? 'data-cell-active' : ''}`}>
            {isLoading ? (
              <div className="h-5 w-full bg-slate-700/50 rounded animate-pulse shimmer" />
            ) : (
              <span className={`font-mono text-sm ${hasData ? 'text-white' : 'text-slate-700'}`}>
                {hasData ? data.location : "Waiting for location data..."}
              </span>
            )}
          </div>
        </div>

        {/* AI Confidence & Keywords */}
        <div className="grid grid-cols-12 gap-4">
          {/* AI Confidence */}
          <div className="col-span-4 space-y-2">
            <label className="data-label">
              <TrendingUp className="w-3.5 h-3.5" />
              AI Confidence
            </label>
            <div className="data-cell flex flex-col items-center justify-center py-5">
              {isLoading ? (
                <div className="w-16 h-16 rounded-full border-4 border-slate-700/50 border-t-cyan-500 animate-spin" />
              ) : (
                <>
                  {/* Circular Progress */}
                  <div className="relative w-20 h-20 mb-2">
                    <svg className="w-full h-full -rotate-90">
                      <circle
                        cx="40"
                        cy="40"
                        r="36"
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="none"
                        className="text-slate-800"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="36"
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="none"
                        strokeDasharray={`${confidencePercent * 2.26} 226`}
                        strokeLinecap="round"
                        className={`transition-all duration-1000 ${hasData ? 'text-cyan-400' : 'text-slate-700'}`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-2xl font-bold number-ticker ${hasData ? 'text-cyan-400 text-glow-cyan' : 'text-slate-700'}`}>
                        {confidencePercent}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Percent</span>
                </>
              )}
            </div>
          </div>

          {/* Keywords */}
          <div className="col-span-8 space-y-2">
            <label className="data-label">
              <Tag className="w-3.5 h-3.5" />
              Detected Keywords
            </label>
            <div className="data-cell min-h-[120px]">
              {isLoading ? (
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-7 w-16 bg-slate-700/50 rounded-lg animate-pulse shimmer" />
                  ))}
                </div>
              ) : hasData && data.keywords && data.keywords.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {data.keywords.map((k, i) => (
                    <span key={i} className="keyword-tag">
                      {k}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-600 text-sm">
                  No keywords detected
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tactical Reasoning */}
        <div className="space-y-2">
          <label className="data-label">
            <Brain className="w-3.5 h-3.5" />
            AI Reasoning
          </label>
          <div className={`data-cell min-h-[80px] ${hasData ? 'data-cell-active' : ''}`}>
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-4 w-full bg-slate-700/50 rounded animate-pulse shimmer" />
                <div className="h-4 w-3/4 bg-slate-700/50 rounded animate-pulse shimmer" />
              </div>
            ) : (
              <p className={`text-sm leading-relaxed italic ${hasData ? 'text-slate-300' : 'text-slate-700'}`}>
                {hasData ? `"${data.reasoning}"` : "Waiting for AI analysis..."}
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}