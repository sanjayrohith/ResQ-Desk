import { useState, useEffect } from "react";
import { Phone, Mic, MicOff, Pause, Play, PhoneOff, Globe, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LiveCall({ onCallEnd }: { onCallEnd?: () => void }) {
  const [callTime, setCallTime] = useState(241); // 04:01
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);

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
    <div className="flex flex-col h-full p-5 bg-[#0D1117] rounded-xl border border-white/5 relative overflow-hidden">
      {/* Background Decor for 'Vibe' */}
      <div className="absolute top-0 right-0 p-2 opacity-10 font-mono text-[8px] text-blue-400 select-none">
        FREQ_800Hz // SIGNAL_STABLE // ENCRYPTED
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20">
          <Phone className="w-4 h-4 text-emerald-400" />
        </div>
        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Secondary Comms Channel</h2>
      </div>

      <div className="flex flex-col items-center justify-center py-6 mb-4 bg-white/[0.02] rounded-lg border border-white/5">
        <div className="text-[10px] font-bold text-emerald-500/60 uppercase mb-1 tracking-tighter">Connection Active</div>
        <div className="text-5xl font-black font-mono text-white tracking-tighter">
          {formatTime(callTime)}
        </div>
      </div>

      <div className="space-y-4">
        {/* Signal & Language */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded border border-white/5">
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[10px] font-bold text-slate-300 uppercase">Tamil (AUTO)</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded border border-white/5">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-[10px] font-bold text-slate-300 uppercase">Latency: 24ms</span>
          </div>
        </div>

        {/* Waveform Visualization - Styled as 'Digital Spectrum' */}
        <div className="h-24 bg-[#080B10] border border-white/5 rounded-lg flex items-center justify-center gap-1 px-6 group">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-emerald-500/40 rounded-full animate-pulse group-hover:bg-emerald-400 transition-all"
              style={{ height: `${Math.random() * 80 + 10}%`, animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-2 mt-auto pt-4">
        <Button variant="outline" className="flex-1 bg-white/5 border-white/10 hover:bg-white/10 text-white font-bold text-[10px] uppercase" onClick={() => setIsMuted(!isMuted)}>
          {isMuted ? <MicOff className="mr-2 w-3.5 h-3.5 text-red-400" /> : <Mic className="mr-2 w-3.5 h-3.5 text-blue-400" />}
          {isMuted ? "Unmute" : "Mute"}
        </Button>
        <Button variant="outline" className="flex-1 bg-white/5 border-white/10 hover:bg-white/10 text-white font-bold text-[10px] uppercase" onClick={() => setIsOnHold(!isOnHold)}>
          {isOnHold ? <Play className="mr-2 w-3.5 h-3.5 text-emerald-400" /> : <Pause className="mr-2 w-3.5 h-3.5 text-yellow-400" />}
          Hold
        </Button>
        <Button variant="destructive" className="flex-1 font-bold text-[10px] uppercase bg-red-600/80 hover:bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.2)]" onClick={onCallEnd}>
          <PhoneOff className="mr-2 w-3.5 h-3.5" />
          End Call
        </Button>
      </div>
    </div>
  );
}