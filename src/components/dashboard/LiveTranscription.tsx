import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Activity, MessageSquare, Zap } from "lucide-react";
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

  const getTypeConfig = (type: TranscriptEntry["type"]) => {
    switch (type) {
      case "caller":
        return { 
          badge: "bg-slate-700/50 text-slate-300 border-slate-600/50", 
          text: "text-slate-200",
          icon: MessageSquare
        };
      case "system":
        return { 
          badge: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30", 
          text: "text-cyan-300",
          icon: Zap
        };
      case "operator":
        return { 
          badge: "bg-amber-500/20 text-amber-400 border-amber-500/30", 
          text: "text-slate-200",
          icon: MessageSquare
        };
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/20">
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="panel-title text-cyan-400">LIVE INTEL</span>
        </div>
        <div className={`status-badge ${isMuted ? 'status-critical' : 'status-live'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${isMuted ? 'bg-red-400' : 'bg-cyan-400 live-dot'}`} />
          {isMuted ? "BLOCKED" : "LISTENING"}
        </div>
      </div>

      {/* Audio Waveform Visualization */}
      <div className="px-5 py-4 border-b border-slate-700/30 bg-slate-900/30">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] text-amber-400 uppercase tracking-wider font-semibold flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${listening && !isMuted ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'}`} />
            AUDIO SIGNAL
          </span>
          <span className="text-[10px] text-slate-500 font-mono">CH-01</span>
        </div>
        <div className="h-14 flex items-center justify-center gap-[3px] overflow-hidden rounded-xl bg-slate-900/50 px-4">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className={`w-1 rounded-full transition-all duration-150 ${
                isMuted ? "bg-red-500/30" : listening ? "bg-gradient-to-t from-cyan-500 to-cyan-300" : "bg-slate-700"
              }`}
              style={{ 
                height: listening && !isMuted ? `${20 + Math.random() * 80}%` : '20%',
                animationDelay: `${i * 0.03}s`,
                opacity: listening && !isMuted ? 0.8 + Math.random() * 0.2 : 0.3,
                transition: listening ? 'height 0.1s ease' : 'height 0.3s ease'
              }}
            />
          ))}
        </div>
      </div>

      {/* Transcript Log */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-tactical">
        {history.map((entry, i) => {
          const config = getTypeConfig(entry.type);
          return (
            <div key={i} className="transcript-entry group">
              <span className="text-[10px] text-slate-600 font-mono shrink-0 w-16">{entry.time}</span>
              <span className={`transcript-badge ${config.badge} border`}>
                {entry.type}
              </span>
              <p className={`text-sm leading-relaxed ${config.text}`}>{entry.text}</p>
            </div>
          );
        })}

        {/* Operator Speaking Indicator */}
        {isMuted && (
          <div className="mx-4 my-3 p-4 rounded-xl bg-red-500/10 border border-dashed border-red-500/30 text-center">
            <div className="flex items-center justify-center gap-2 text-red-400">
              <MicOff className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">OPERATOR OVERRIDE ACTIVE</span>
            </div>
            <p className="text-[10px] text-red-400/60 mt-1">Caller audio temporarily muted</p>
          </div>
        )}

        {/* Live Buffer (Only show if NOT muted) */}
        {transcript && !isMuted && (
          <div className="transcript-entry bg-cyan-500/5 border border-cyan-500/20 rounded-xl animate-pulse">
            <span className="text-[10px] text-cyan-400 font-mono shrink-0 w-16 animate-pulse">LIVE</span>
            <span className="transcript-badge bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              caller
            </span>
            <p className="text-sm leading-relaxed text-cyan-200 italic">
              {transcript}
              <span className="inline-block w-0.5 h-4 bg-cyan-400 ml-1 animate-pulse align-middle" />
            </p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 border-t border-slate-700/30 bg-slate-900/30">
        <button
          onClick={() => {
            if (listening) {
              SpeechRecognition.stopListening();
            } else {
              SpeechRecognition.startListening({ continuous: true });
            }
          }}
          className={`w-full flex items-center justify-center gap-3 py-3 rounded-xl font-semibold text-sm transition-all ${
            listening 
              ? "bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20" 
              : "bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20"
          }`}
        >
          {listening ? (
            <>
              <MicOff className="w-4 h-4" />
              <span>STOP RECORDING</span>
              <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            </>
          ) : (
            <>
              <Mic className="w-4 h-4" />
              <span>START RECORDING</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}