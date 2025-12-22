import { ClipboardList, MapPin, AlertCircle, Users, Flag, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge"; // Assuming you have shadcn badge

export interface IncidentData {
  location: string;
  emergencyType: string;
  severity: string;
  adults: string;
  children: string;
  elderly: string;
  flags: string[];
}

export function IncidentDetails({ data }: { data: IncidentData }) {
  const severityStyles = {
    critical: "border-red-500/50 bg-red-500/10 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]",
    high: "border-orange-500/50 bg-orange-500/10 text-orange-400",
    medium: "border-yellow-500/50 bg-yellow-500/10 text-yellow-400",
    low: "border-green-500/50 bg-green-500/10 text-green-400",
    normal: "border-slate-700 bg-slate-800/40 text-slate-400"
  };

  const currentStyle = severityStyles[data.severity as keyof typeof severityStyles] || severityStyles.normal;

  return (
    <div className="flex flex-col h-full p-5 bg-[#0B0F1A] rounded-xl border border-white/5 shadow-2xl">
      {/* Header with Pulse for 'Live' effect */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <ClipboardList className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Active Incident</h2>
            <p className="text-sm font-semibold text-white uppercase tracking-tight">{data.emergencyType || "Awaiting Classification..."}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500/10 border border-red-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] font-bold text-red-500 uppercase">Live</span>
        </div>
      </div>

      <div className="space-y-6 flex-1">
        {/* Location - Hero Style */}
        <div className="p-4 rounded-lg bg-white/5 border border-white/10 group hover:border-blue-500/30 transition-colors">
          <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase mb-2">
            <MapPin className="w-3 h-3" /> Incident Location
          </label>
          <div className="text-lg font-medium text-blue-50 text-balance leading-tight">
            {data.location || "Triangulating signal..."}
          </div>
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg border transition-all duration-500 ${currentStyle}`}>
            <label className="text-[10px] font-black uppercase opacity-60 mb-1 block">Priority Level</label>
            <div className="text-xl font-black uppercase italic tracking-tighter">
              {data.severity || "Pending"}
            </div>
          </div>
          
          <div className="p-4 rounded-lg border border-white/10 bg-white/5">
            <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block">Time Elapsed</label>
            <div className="flex items-center gap-2 text-xl font-mono text-white">
              <Clock className="w-4 h-4 text-blue-400" /> 04:12
            </div>
          </div>
        </div>

        {/* Victims - Visual Counters */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase">
            <Users className="w-3 h-3" /> Victim Registry
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Adults", val: data.adults },
              { label: "Children", val: data.children },
              { label: "Elderly", val: data.elderly }
            ].map((v) => (
              <div key={v.label} className="bg-white/5 rounded-lg p-3 text-center border border-white/5">
                <div className="text-xl font-bold text-white">{v.val || "0"}</div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">{v.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Flags - Modern Chips */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase">
            <Flag className="w-3 h-3" /> Tactical Alerts
          </label>
          <div className="flex flex-wrap gap-2">
            {data.flags.length > 0 ? (
              data.flags.map((f) => (
                <Badge key={f} variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/20 px-3 py-1">
                  {f}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-slate-600 italic">No special conditions reported...</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}