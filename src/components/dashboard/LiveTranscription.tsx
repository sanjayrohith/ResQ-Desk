import { useState, useRef, useEffect } from "react";
import { Mic, MicOff } from "lucide-react";
import "regenerator-runtime/runtime";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

interface TranscriptEntry {
  text: string;
  time: string;
  type: "caller" | "system" | "operator";
}

// 1. Accept 'isMuted' prop
export function LiveTranscription({ onLineComplete, isMuted }: { onLineComplete: (t: string) => void, isMuted: boolean }) {
  const { transcript, listening, resetTranscript } = useSpeechRecognition();
  const [history, setHistory] = useState<TranscriptEntry[]>([
    { text: "There's smoke coming from the second floor...", time: "10:42:15", type: "caller" },
    { text: "Keywords detected: SMOKE, FIRE, TRAPPED", time: "10:42:22", type: "system" },
    { text: "Please confirm your location, ma'am.", time: "10:42:28", type: "operator" },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 2. Clear transcript immediately if muted so no partial text stays
  useEffect(() => {
    if (isMuted) {
      resetTranscript();
    }
  }, [transcript, isMuted, resetTranscript]);

  useEffect(() => {
    // 3. Prevent processing if muted or empty
    if (!transcript || isMuted) return;

    const timer = setTimeout(() => {
      const newEntry: TranscriptEntry = {
        text: transcript,
        time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        type: "caller"
      };
      setHistory((prev) => [...prev, newEntry]);
      onLineComplete(transcript);
      resetTranscript();
    }, 1500);
    return () => clearTimeout(timer);
  }, [transcript, isMuted]); 

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const getTypeStyles = (type: TranscriptEntry["type"]) => {
    switch (type) {
      case "caller":
        return { badge: "bg-slate-700 text-slate-300", text: "text-slate-300" };
      case "system":
        return { badge: "bg-cyan-500/20 text-cyan-400", text: "text-cyan-400" };
      case "operator":
        return { badge: "bg-amber-500/20 text-amber-400", text: "text-slate-300" };
    }
  };

  return (
    <div className="floating-card floating-card-cyan flex flex-col h-full">
      {/* Header */}
      <div className="panel-header">
        <span className="panel-title text-cyan-400 text-glow-cyan">
          Real-Time Intel
        </span>
        <div className={`flex items-center gap-2 px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-wider ${
          isMuted ? "bg-red-500/10 border-red-500/30 text-red-500" : "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
        }`}>
          {isMuted ? "MIC BLOCKED (OPR)" : "LISTENING"}
        </div>
      </div>

      {/* Audio Waveform Visualization */}
      <div className="px-4 py-3 border-b border-[#1a2835]/50" style={{ background: 'linear-gradient(180deg, rgba(8,12,18,0.8) 0%, rgba(6,10,14,0.9) 100%)' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[9px] text-amber-500 uppercase tracking-wider font-bold">Audio Input Signal</span>
          <span className="text-[9px] text-slate-500">CH-01 ACTIVE</span>
        </div>
        <div className="h-12 flex items-center justify-center gap-[2px] overflow-hidden">
          {[...Array(60)].map((_, i) => (
            <div
              key={i}
              className={`w-[3px] rounded-sm transition-all ${
                isMuted ? "bg-red-500/20" : "bg-amber-500/80" 
              } ${listening && !isMuted ? 'waveform-bar' : ''}`}
              style={{ 
                height: listening && !isMuted ? `${Math.random() * 100}%` : '20%',
                animationDelay: `${i * 0.02}s`,
                opacity: listening && !isMuted ? 0.9 : 0.3
              }}
            />
          ))}
        </div>
      </div>

      {/* Transcript Log */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-tactical">
        {history.map((entry, i) => {
          const styles = getTypeStyles(entry.type);
          return (
            <div key={i} className="flex items-start gap-3">
              <span className="text-[10px] text-slate-600 font-mono mt-1 shrink-0">{entry.time}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold shrink-0 ${styles.badge}`}>
                {entry.type}
              </span>
              <p className={`text-sm leading-relaxed ${styles.text}`}>{entry.text}</p>
            </div>
          );
        })}

        {/* Operator Speaking Indicator */}
        {isMuted && (
           <div className="flex items-start gap-3 opacity-60">
             <span className="text-[10px] text-red-500 font-mono mt-1 shrink-0 animate-pulse">OPR</span>
             <div className="flex-1 p-2 rounded border border-dashed border-red-500/30 text-xs text-red-400 font-mono uppercase tracking-widest text-center">
               // OPERATOR OVERRIDE ACTIVE //
             </div>
           </div>
        )}

        {/* Live Buffer (Only show if NOT muted) */}
        {transcript && !isMuted && (
          <div className="flex items-start gap-3">
            <span className="text-[10px] text-cyan-500 font-mono mt-1 shrink-0 animate-pulse">LIVE</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded uppercase font-bold shrink-0 bg-cyan-500/20 text-cyan-400">
              caller
            </span>
            <p className="text-sm leading-relaxed text-cyan-300 italic">
              {transcript}
              <span className="inline-block w-0.5 h-4 bg-cyan-400 ml-1 animate-pulse" />
            </p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-3 border-t border-[#1a2835]/50" style={{ background: 'linear-gradient(180deg, rgba(8,12,18,0.9) 0%, rgba(6,10,14,1) 100%)' }}>
        <button
          onClick={() => {
            if (listening) {
              SpeechRecognition.stopListening();
            } else {
              SpeechRecognition.startListening({ continuous: true });
            }
          }}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded border transition-all ${
            listening 
              ? "bg-red-500/10 border-red-500/30 text-red-400" 
              : "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20"
          }`}
        >
          {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          <span className="text-[11px] font-bold uppercase tracking-wider">
            {listening ? "Stop Recording" : "Start Recording"}
          </span>
        </button>
      </div>
    </div>
  );
}