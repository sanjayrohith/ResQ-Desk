import { useEffect, useState } from "react";
import { Ambulance, CheckCircle2, MapPin, XCircle, AlertTriangle, ArrowRight, Radio } from "lucide-react";

interface DispatchPopupProps {
  data: any;
  onCancel: () => void;
  onComplete: () => void;
}

export function DispatchPopup({ data, onCancel, onComplete }: DispatchPopupProps) {
  const [count, setCount] = useState(3);
  const [dispatched, setDispatched] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (count > 0) {
      timer = setTimeout(() => setCount(count - 1), 1000);
    } else {
      setDispatched(true);
      timer = setTimeout(() => {
        onComplete();
      }, 2000); 
    }
    
    return () => clearTimeout(timer);
  }, [count, onComplete]);

  // Calculate progress width for the bar (3s -> 0s)
  const progressPercentage = (count / 3) * 100;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* 1. Main Glass Card */}
      <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-cyan-500/30 bg-zinc-950/80 shadow-[0_0_50px_rgba(6,182,212,0.15)] backdrop-blur-xl transition-all duration-300 transform scale-100">
        
        {/* Top Decorative Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
        
        {/* Background Scanline Texture */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,24,27,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-20" />

        <div className="relative p-6 text-center">
          
          {!dispatched ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  <span className="text-[10px] font-black tracking-[0.2em] text-red-500 uppercase">
                    Auto-Dispatch Sequence
                  </span>
                </div>
                <button 
                  onClick={onCancel} 
                  className="text-zinc-500 hover:text-white transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* The Holographic Countdown Ring */}
              <div className="relative flex justify-center py-4 mb-6">
                {/* Spinning Outer Ring */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-cyan-500/20 rounded-full animate-[spin_10s_linear_infinite]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-cyan-500/10 rounded-full animate-[spin_5s_linear_infinite_reverse]" />
                
                {/* Number Container */}
                <div className="relative z-10 flex flex-col items-center justify-center w-28 h-28 bg-cyan-950/30 rounded-full border border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                  <span className="text-6xl font-black text-white tabular-nums animate-[pulse_1s_ease-in-out_infinite] drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">
                    {count}
                  </span>
                </div>
              </div>
              
              {/* Unit Info Card */}
              <div className="bg-white/5 border border-white/10 rounded p-4 mb-6 backdrop-blur-md text-left relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-40 transition-opacity">
                    <Ambulance className="w-12 h-12 text-cyan-400 -rotate-12" />
                 </div>
                 
                 <div className="space-y-3 relative z-10">
                    <div>
                      <div className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Assigning Asset</div>
                      <div className="text-lg font-bold text-white flex items-center gap-2">
                        {data.suggested_unit || "AUTO-ASSIGN"}
                        <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 text-[9px] border border-cyan-500/30">
                          6 MIN ETA
                        </span>
                      </div>
                    </div>
                    
                    <div className="h-px bg-white/10 w-full" />

                    <div>
                      <div className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Target Coordinates</div>
                      <div className="text-sm font-mono text-zinc-300 flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <span className="break-words line-clamp-2">{data.location || "Target Zone"}</span>
                      </div>
                    </div>
                 </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                 {/* Progress Bar */}
                 <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden mb-4">
                    <div 
                      className="h-full bg-cyan-500 transition-all duration-1000 ease-linear shadow-[0_0_10px_cyan]"
                      style={{ width: `${progressPercentage}%` }}
                    />
                 </div>

                 <button 
                  onClick={onCancel}
                  className="w-full py-3 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-xs font-black uppercase tracking-[0.2em] rounded transition-all flex items-center justify-center gap-2 group"
                >
                  <AlertTriangle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Abort Sequence
                </button>
              </div>

            </>
          ) : (
            // DISPATCHED SUCCESS STATE
            <div className="py-12 flex flex-col items-center justify-center animate-in zoom-in-95 duration-300">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20 animate-pulse"></div>
                <CheckCircle2 className="w-24 h-24 text-emerald-500 relative z-10 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
              </div>
              
              <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-2 text-glow-emerald">
                DISPATCHED
              </h2>
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-sm uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded border border-emerald-500/20">
                <Radio className="w-4 h-4 animate-pulse" />
                Unit En Route
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}