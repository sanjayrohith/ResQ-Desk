import { useState, useRef, useEffect } from "react";
import { FileText, Mic, MicOff, AlertCircle, Clock } from "lucide-react";
import "regenerator-runtime/runtime";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

export function LiveTranscription({ onLineComplete }: { onLineComplete: (t: string) => void }) {
  const { transcript, listening, resetTranscript } = useSpeechRecognition();
  const [history, setHistory] = useState<{ text: string; time: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!transcript) return;
    const timer = setTimeout(() => {
      setHistory((prev) => [...prev, { text: transcript, time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' }) }]);
      onLineComplete(transcript);
      resetTranscript();
    }, 1500);
    return () => clearTimeout(timer);
  }, [transcript]);

  return (
    <div className="flex flex-col h-full bg-[#0B0F1A] rounded-xl border border-white/5 overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-black text-slate-300 uppercase tracking-widest">Real-Time Intel Feed</span>
        </div>
        <div className={`flex items-center gap-2 px-2 py-1 rounded text-[9px] font-black border transition-all ${listening ? "bg-red-500/10 border-red-500/40 text-red-500 animate-pulse" : "bg-white/5 border-white/10 text-slate-500"}`}>
          {listening ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3" />}
          {listening ? "RECORDING" : "IDLE"}
        </div>
      </div>

      {/* Transcript Log */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 font-mono scrollbar-hide">
        {history.map((entry, i) => (
          <div key={i} className="flex gap-3 group animate-in fade-in slide-in-from-left-2">
            <span className="text-[10px] text-slate-600 mt-1 font-bold">{entry.time}</span>
            <div className="flex-1 p-3 rounded-lg bg-white/[0.03] border border-white/5 text-sm text-slate-300 leading-relaxed group-hover:border-blue-500/20 transition-colors">
              {entry.text}
            </div>
          </div>
        ))}

        {/* Live Buffer */}
        {transcript && (
          <div className="flex gap-3">
             <span className="text-[10px] text-blue-500 mt-1 animate-pulse font-bold">LIVE</span>
             <div className="flex-1 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20 text-sm text-blue-100 italic">
               {transcript}<span className="inline-block w-2 h-4 bg-blue-500 ml-1 animate-ping" />
             </div>
          </div>
        )}

        {history.length === 0 && !transcript && (
          <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
            <AlertCircle className="w-12 h-12 mb-4" />
            <p className="text-xs font-black uppercase tracking-widest text-center">System Ready<br/>Waiting for Audio Input</p>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="p-4 border-t border-white/5 bg-black/40 grid grid-cols-2 gap-2">
        <button
          onClick={() => SpeechRecognition.startListening({ continuous: true })}
          className={`py-2 rounded font-black text-[10px] uppercase tracking-tighter transition-all ${listening ? 'bg-slate-800 text-slate-500' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]'}`}
        >
          Initialize Mic
        </button>
        <button
          onClick={SpeechRecognition.stopListening}
          className="py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded font-black text-[10px] uppercase tracking-tighter text-slate-300"
        >
          Secure Line
        </button>
      </div>
    </div>
  );
}