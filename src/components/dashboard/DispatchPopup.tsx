import { useEffect, useState } from "react";
import { Ambulance, CheckCircle2, MapPin, XCircle } from "lucide-react";

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
        // Only call complete if we haven't been cancelled
        onComplete();
      }, 2000); 
    }
    
    // CLEANUP: If the user clicks 'Abort', this runs and stops onComplete from firing
    return () => clearTimeout(timer);
  }, [count, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-md p-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl shadow-2xl">
        <div className="bg-zinc-950 rounded-lg p-8 text-center border border-white/10 relative overflow-hidden">
          
          {!dispatched ? (
            <>
              {/* Top Right X Button */}
              <button 
                onClick={onCancel} 
                className="absolute top-2 right-2 p-2 text-zinc-600 hover:text-red-500 transition-colors z-20"
              >
                <XCircle className="w-5 h-5" />
              </button>

              <div className="mb-6 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-20 animate-pulse"></div>
                  <Ambulance className="w-16 h-16 text-cyan-400 relative z-10" />
                </div>
              </div>
              
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">
                Auto-Dispatch Sequence
              </h2>
              
              <div className="text-zinc-400 text-sm mb-6 font-mono">
                Unit <span className="text-cyan-400 font-bold">{data.suggested_unit || "AUTO-ASSIGN"}</span> routed to:
                <div className="text-white font-bold mt-1 flex items-center justify-center gap-2">
                  <MapPin className="w-4 h-4" /> {data.analysis?.location || "Target Zone"}
                </div>
              </div>

              <div className="text-6xl font-black text-white tabular-nums mb-8 animate-bounce">
                {count}
              </div>

              {/* Main Abort Button */}
              <button 
                onClick={onCancel}
                className="text-xs text-red-400 hover:text-red-300 uppercase tracking-widest font-bold border-b border-red-500/30 pb-1 hover:border-red-500 transition-all cursor-pointer z-20"
              >
                Abort Sequence
              </button>
            </>
          ) : (
            <div className="py-10 animate-in zoom-in duration-300">
              <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto mb-4" />
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
                DISPATCHED
              </h2>
              <p className="text-emerald-400 font-mono mt-2">UNIT EN ROUTE</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}