import { useState, useEffect } from "react";
import { Mic, Radio, Signal, Globe, Phone, Lock, Volume2 } from "lucide-react";

export function LiveCall({ onCallEnd, onPTTChange }: { onCallEnd?: () => void, onPTTChange?: (active: boolean) => void }) {
  const [callTime, setCallTime] = useState(0);
  const [isPTTActive, setIsPTTActive] = useState(false);
  const [signalStrength, setSignalStrength] = useState(85);
  const [language, setLanguage] = useState("TAMIL");

  useEffect(() => {
    const timer = setInterval(() => {
      setCallTime((t) => t + 1);
      setSignalStrength(prev => Math.min(100, Math.max(40, prev + (Math.random() > 0.5 ? 2 : -2))));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePTT = (active: boolean) => {
    setIsPTTActive(active);
    if (onPTTChange) onPTTChange(active); 
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === "TAMIL" ? "ENGLISH" : "TAMIL");
  };

  // Signal bars calculation
  const signalBars = Math.ceil(signalStrength / 25);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${isPTTActive ? 'bg-red-500/20' : 'bg-cyan-500/20'}`}>
            <Radio className={`w-4 h-4 ${isPTTActive ? 'text-red-400 animate-pulse' : 'text-cyan-400'}`} />
          </div>
          <span className="panel-title text-cyan-400">
            COMMS LINK
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Lock className="w-3 h-3 text-emerald-400" />
          <span className="text-[10px] font-medium text-emerald-400">ENCRYPTED</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-5 flex flex-col gap-4">
        
        {/* Channel Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`relative p-3 rounded-xl transition-all duration-300 ${
              isPTTActive 
                ? 'bg-red-500/20 shadow-lg shadow-red-500/20' 
                : 'bg-cyan-500/10'
            }`}>
              {isPTTActive && (
                <div className="absolute inset-0 rounded-xl bg-red-500/30 animate-ping" />
              )}
              <Phone className={`w-5 h-5 relative z-10 ${isPTTActive ? 'text-red-400' : 'text-cyan-400'}`} />
            </div>
            <div>
              <div className={`text-lg font-bold tracking-tight transition-colors ${
                isPTTActive ? 'text-red-400' : 'text-white'
              }`}>
                {isPTTActive ? "TRANSMITTING..." : "SECURE_CH01"}
              </div>
              <div className="text-[10px] text-slate-500 font-medium">PRIMARY FREQUENCY</div>
            </div>
          </div>
          
          {/* Signal Indicator */}
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-end gap-0.5 h-4">
              {[1, 2, 3, 4].map((bar) => (
                <div
                  key={bar}
                  className={`w-1.5 rounded-sm transition-all ${
                    bar <= signalBars ? 'bg-cyan-400' : 'bg-slate-700'
                  }`}
                  style={{ height: `${bar * 25}%` }}
                />
              ))}
            </div>
            <span className="text-[9px] text-slate-500">{signalStrength}%</span>
          </div>
        </div>

        {/* Timer Display */}
        <div className={`relative overflow-hidden rounded-2xl p-6 text-center transition-all duration-300 ${
          isPTTActive 
            ? 'bg-red-500/10 border border-red-500/30' 
            : 'bg-slate-900/50 border border-slate-700/30'
        }`}>
          {/* Background Pulse for PTT */}
          {isPTTActive && (
            <div className="absolute inset-0 bg-red-500/5 animate-pulse" />
          )}
          
          <div className="relative">
            <div className={`text-5xl font-bold font-mono number-ticker tracking-tight ${
              isPTTActive ? 'text-red-400 text-glow-red' : 'text-white text-glow-cyan'
            }`}>
              {formatTime(callTime)}
            </div>
            <div className={`text-[10px] font-semibold uppercase tracking-widest mt-2 ${
              isPTTActive ? 'text-red-400/60' : 'text-cyan-400/60'
            }`}>
              SESSION DURATION
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={toggleLanguage}
            className="group flex items-center gap-3 p-3 rounded-xl bg-slate-900/30 border border-slate-700/30 hover:border-cyan-500/30 hover:bg-slate-900/50 transition-all"
          >
            <div className="p-2 rounded-lg bg-slate-800/50 group-hover:bg-cyan-500/10 transition-colors">
              <Globe className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
            </div>
            <div className="text-left">
              <div className="text-[9px] text-slate-500 uppercase font-medium">Language</div>
              <div className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors">
                {language}
              </div>
            </div>
          </button>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/30 border border-slate-700/30">
            <div className="p-2 rounded-lg bg-slate-800/50">
              <Volume2 className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-left">
              <div className="text-[9px] text-slate-500 uppercase font-medium">Audio</div>
              <div className="text-sm font-semibold text-emerald-400">CLEAR</div>
            </div>
          </div>
        </div>

        {/* PTT Button */}
        <div className="mt-auto">
          <button
            onMouseDown={() => handlePTT(true)}
            onMouseUp={() => handlePTT(false)}
            onMouseLeave={() => handlePTT(false)}
            onTouchStart={() => handlePTT(true)}
            onTouchEnd={() => handlePTT(false)}
            className={`relative w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-3 overflow-hidden ${
              isPTTActive 
                ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-xl shadow-red-500/30 scale-[0.98]" 
                : "bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/30 hover:scale-[1.02]"
            }`}
          >
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000" />
            
            <Mic className={`w-5 h-5 ${isPTTActive ? 'animate-pulse' : ''}`} />
            <span>{isPTTActive ? "RELEASE TO LISTEN" : "PUSH TO TALK"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}