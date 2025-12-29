import { useEffect, useState } from "react";
import { Ambulance, CheckCircle2, MapPin, XCircle, AlertTriangle, Siren, Navigation, Clock, Zap } from "lucide-react";

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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={onCancel} />
      
      {/* Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full transition-all duration-500 ${
          dispatched 
            ? 'bg-emerald-500/20 blur-[100px]' 
            : 'bg-cyan-500/20 blur-[100px] animate-pulse'
        }`} />
      </div>
      
      {/* Modal */}
      <div className="relative w-full max-w-lg animate-in zoom-in-95 fade-in duration-300">
        <div className="panel panel-glow overflow-hidden">
          
          {/* Top Gradient Line */}
          <div className={`absolute top-0 left-0 right-0 h-1 ${
            dispatched 
              ? 'bg-gradient-to-r from-transparent via-emerald-500 to-transparent' 
              : 'bg-gradient-to-r from-transparent via-cyan-500 to-transparent'
          }`} />
          
          <div className="p-6">
            
            {!dispatched ? (
              <>
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-red-500/20 border border-red-500/30">
                      <Siren className="w-5 h-5 text-red-400 animate-pulse" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">Auto-Dispatch</h2>
                      <p className="text-xs text-slate-500">Initiating unit deployment</p>
                    </div>
                  </div>
                  <button 
                    onClick={onCancel} 
                    className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-slate-800/50 transition-all"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                {/* Countdown Display */}
                <div className="relative flex justify-center py-8 mb-8">
                  {/* Animated Rings */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="w-44 h-44 border border-cyan-500/20 rounded-full animate-spin" style={{ animationDuration: '8s' }} />
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="w-36 h-36 border border-cyan-500/30 rounded-full animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }} />
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="w-28 h-28 border-2 border-dashed border-cyan-500/40 rounded-full animate-spin" style={{ animationDuration: '4s' }} />
                  </div>
                  
                  {/* Number Container */}
                  <div className="relative z-10 flex flex-col items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500/20 to-transparent border border-cyan-500/30 shadow-2xl shadow-cyan-500/20">
                    <span className="text-6xl font-bold text-white number-ticker text-glow-cyan">
                      {count}
                    </span>
                  </div>
                </div>
                
                {/* Unit Info Card */}
                <div className="rounded-2xl bg-slate-900/50 border border-slate-700/50 p-5 mb-6 relative overflow-hidden">
                  {/* Decorative Icon */}
                  <div className="absolute top-4 right-4 opacity-10">
                    <Ambulance className="w-20 h-20 text-cyan-400 -rotate-12" />
                  </div>
                  
                  <div className="space-y-4 relative z-10">
                    {/* Unit Assignment */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mb-1">Assigning Unit</div>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-white">{data.suggested_unit || "A12"}</span>
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/20 border border-cyan-500/30">
                            <Clock className="w-3.5 h-3.5 text-cyan-400" />
                            <span className="text-xs font-semibold text-cyan-400">6 MIN ETA</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                        <Navigation className="w-6 h-6 text-cyan-400" />
                      </div>
                    </div>
                    
                    <div className="h-px bg-slate-700/50" />
                    
                    {/* Location */}
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mb-2">Target Location</div>
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-300 leading-relaxed">{data.location || "Target coordinates pending..."}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">Dispatch Progress</span>
                    <span className="text-xs font-mono text-cyan-400">{count}s</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-1000 ease-linear rounded-full shadow-lg shadow-cyan-500/30"
                      style={{ width: `${100 - progressPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Abort Button */}
                <button 
                  onClick={onCancel}
                  className="w-full py-4 rounded-xl font-semibold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Abort Dispatch
                </button>
              </>
            ) : (
              // DISPATCHED SUCCESS STATE
              <div className="py-12 flex flex-col items-center justify-center animate-in zoom-in-95 duration-300">
                {/* Success Icon */}
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-emerald-500 blur-3xl opacity-30 animate-pulse" />
                  <div className="relative p-6 rounded-full bg-gradient-to-br from-emerald-500/20 to-transparent border border-emerald-500/30">
                    <CheckCircle2 className="w-16 h-16 text-emerald-400" />
                  </div>
                </div>
                
                {/* Success Text */}
                <h2 className="text-3xl font-bold text-white uppercase tracking-tight mb-3 text-glow-emerald">
                  Dispatched
                </h2>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <Zap className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span className="text-sm font-medium text-emerald-400 uppercase tracking-wider">
                    Unit En Route
                  </span>
                </div>
                
                {/* Auto-close notice */}
                <p className="text-xs text-slate-500 mt-6">Closing automatically...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}