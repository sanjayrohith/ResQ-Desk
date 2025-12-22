import { useState, useEffect } from "react";
import { Mic, PhoneOff, Radio } from "lucide-react";

export function LiveCall({ onCallEnd }: { onCallEnd?: () => void }) {
  const [callTime, setCallTime] = useState(320); // 05:20
  const [isPTTActive, setIsPTTActive] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCallTime((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="floating-card floating-card-cyan flex flex-col h-full">
      {/* Header */}
      <div className="panel-header">
        <span className="panel-title text-cyan-400 text-glow-cyan">
          Comms Channel
        </span>
        <div className="flex gap-0.5">
          <span className="w-1 h-1 rounded-full bg-slate-600" />
          <span className="w-1 h-1 rounded-full bg-slate-600" />
          <span className="w-1 h-1 rounded-full bg-slate-600" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col">
        {/* Active Channel Display */}
        <div className="mb-4">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Active Channel</div>
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400" style={{ filter: 'drop-shadow(0 0 4px rgba(0,212,255,0.6))' }} />
            <span className="text-lg font-bold text-cyan-400 tracking-tight text-glow-cyan">SECURE_01</span>
          </div>
        </div>

        {/* Call Timer */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-5xl font-bold font-mono text-white tracking-tight tabular-nums">
              {formatTime(callTime)}
            </div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">Live Feed</div>
          </div>
        </div>

        {/* Status Info */}
        <div className="space-y-2 mb-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 uppercase text-[10px] tracking-wider">Latency</span>
            <span className="text-cyan-400 font-mono">24ms</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 uppercase text-[10px] tracking-wider">Language</span>
            <span className="text-slate-300 px-2 py-0.5 bg-[#1a2332] rounded text-xs">TAMIL (AUTO)</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="mt-auto grid grid-cols-2 gap-3">
          <button
            onMouseDown={() => setIsPTTActive(true)}
            onMouseUp={() => setIsPTTActive(false)}
            onMouseLeave={() => setIsPTTActive(false)}
            className={`flex items-center justify-center gap-2 py-3 rounded-lg border transition-all ${
              isPTTActive 
                ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400" 
                : "inner-card text-slate-300 hover:border-cyan-500/30"
            }`}
            style={isPTTActive ? { boxShadow: '0 0 20px rgba(0,212,255,0.3), inset 0 1px 0 rgba(255,255,255,0.1)' } : {}}
          >
            <Mic className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-wider">PTT</span>
          </button>
          
          <button
            onClick={onCallEnd}
            className="flex items-center justify-center gap-2 py-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
            style={{ boxShadow: '0 0 15px rgba(239,68,68,0.15)' }}
          >
            <PhoneOff className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-wider">End Call</span>
          </button>
        </div>
      </div>
    </div>
  );
}