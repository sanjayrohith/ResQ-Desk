import { useState, useEffect } from "react";
import { Mic, Radio, Signal, Globe } from "lucide-react";

// 1. Add 'onPTTChange' to props
export function LiveCall({ onCallEnd, onPTTChange }: { onCallEnd?: () => void, onPTTChange?: (active: boolean) => void }) {
  const [callTime, setCallTime] = useState(0);
  const [isPTTActive, setIsPTTActive] = useState(false);
  const [signalStrength, setSignalStrength] = useState(85);
  const [language, setLanguage] = useState("TAMIL (AUTO)");

  useEffect(() => {
    const timer = setInterval(() => {
      setCallTime((t) => t + 1);
      setSignalStrength(prev => Math.min(100, Math.max(40, prev + (Math.random() > 0.5 ? 2 : -2))));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Helper to handle PTT state changes
  const handlePTT = (active: boolean) => {
    setIsPTTActive(active);
    if (onPTTChange) onPTTChange(active); // Notify parent immediately
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === "TAMIL (AUTO)" ? "ENGLISH (MANUAL)" : "TAMIL (AUTO)");
  };

  return (
    <div className="floating-card floating-card-cyan flex flex-col h-full bg-zinc-900 border-zinc-800">
      {/* Header - Reduced padding to p-3 */}
      <div className="panel-header border-b border-white/5 p-3 flex justify-between items-center shrink-0">
        <span className="text-[10px] font-black text-cyan-400 tracking-widest uppercase flex items-center gap-2">
          <Radio className={`w-3 h-3 ${isPTTActive ? "animate-ping" : ""}`} /> 
          Comms Link
        </span>
        <div className="flex gap-1">
          <div className={`w-1 h-2 rounded-sm ${signalStrength > 20 ? "bg-cyan-500" : "bg-zinc-700"}`} />
          <div className={`w-1 h-2 rounded-sm ${signalStrength > 40 ? "bg-cyan-500" : "bg-zinc-700"}`} />
          <div className={`w-1 h-2 rounded-sm ${signalStrength > 60 ? "bg-cyan-500" : "bg-zinc-700"}`} />
          <div className={`w-1 h-2 rounded-sm ${signalStrength > 80 ? "bg-cyan-500" : "bg-zinc-700"}`} />
        </div>
      </div>

      {/* Content - Reduced padding to p-3 and added overflow-y-auto as safety */}
      <div className="flex-1 p-3 flex flex-col min-h-0 overflow-y-auto">
        
        {/* Main Channel Info */}
        <div className="shrink-0 mb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">Active Freq</span>
            <span className="text-[9px] text-zinc-500 font-mono">ENCRYPTED</span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full shrink-0 ${isPTTActive ? "bg-red-500/20 text-red-500" : "bg-cyan-500/10 text-cyan-400"}`}>
              {isPTTActive ? <Mic className="w-5 h-5 animate-pulse" /> : <Radio className="w-5 h-5" />}
            </div>
            <div>
              <div className={`text-xl font-black tracking-tight ${isPTTActive ? "text-red-500" : "text-white"}`}>
                {isPTTActive ? "TRANSMITTING" : "SECURE_01"}
              </div>
            </div>
          </div>
        </div>

        {/* Big Timer - Reduced vertical padding (py-2) and text size (text-5xl) */}
        <div className="text-center py-3 bg-zinc-950/50 rounded border border-zinc-800 mb-3 shrink-0">
          <div className="text-5xl font-black font-mono text-white tabular-nums tracking-tighter text-glow-cyan leading-none">
            {formatTime(callTime)}
          </div>
          <div className="text-[9px] text-cyan-500/50 uppercase tracking-[0.3em] font-bold mt-1">
            Session Duration
          </div>
        </div>

        {/* Tactical Controls Grid - Pushed to bottom with mt-auto */}
        <div className="grid grid-cols-2 gap-2 mt-auto shrink-0">
          {/* Language Toggle */}
          <button 
            onClick={toggleLanguage}
            className="flex flex-col items-center justify-center p-2 rounded bg-zinc-950 border border-zinc-800 hover:border-cyan-500/30 transition-all group"
          >
            <div className="flex items-center gap-1 mb-0.5">
              <Globe className="w-3 h-3 text-zinc-500 group-hover:text-cyan-400" />
              <span className="text-[9px] text-zinc-500 uppercase font-bold">Lang</span>
            </div>
            <span className="text-[10px] font-bold text-white group-hover:text-cyan-400 truncate w-full text-center">
              {language.split(" ")[0]}
            </span>
          </button>

          {/* Signal Boost */}
          <button 
            onClick={() => setSignalStrength(100)}
            className="flex flex-col items-center justify-center p-2 rounded bg-zinc-950 border border-zinc-800 hover:border-emerald-500/30 transition-all group"
          >
            <div className="flex items-center gap-1 mb-0.5">
              <Signal className="w-3 h-3 text-zinc-500 group-hover:text-emerald-400" />
              <span className="text-[9px] text-zinc-500 uppercase font-bold">Signal</span>
            </div>
            <span className="text-[10px] font-bold text-white group-hover:text-emerald-400">{signalStrength}%</span>
          </button>

          {/* PTT BUTTON - Using handlePTT for Mouse Events */}
          <button
            onMouseDown={() => handlePTT(true)}
            onMouseUp={() => handlePTT(false)}
            onMouseLeave={() => handlePTT(false)}
            className={`col-span-2 py-3 rounded font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2
              ${isPTTActive 
                ? "bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.5)] scale-[0.98]" 
                : "bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_rgba(8,145,178,0.3)]"
              }`}
          >
            <Mic className="w-4 h-4" />
            {isPTTActive ? "RELEASE TO LISTEN" : "PUSH TO TALK"}
          </button>
        </div>
      </div>
    </div>
  );
}