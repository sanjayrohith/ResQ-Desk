import { useState, useEffect, useRef } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { FileText, Mic, MicOff, AlertCircle } from "lucide-react";
import "regenerator-runtime/runtime";

interface LiveTranscriptionProps {
  onLineComplete: (fullTranscript: string) => void;
}

// Reuse your existing keywords logic
const CRITICAL_KEYWORDS = ["bleeding", "trapped", "unconscious", "dying", "emergency"];
const WARNING_KEYWORDS = ["baby", "pregnant", "elderly", "child", "disabled"];

function highlightKeywords(text: string) {
  const words = text.split(" ");
  return words.map((word, i) => {
    const cleanWord = word.toLowerCase().replace(/[.,!?]/g, "");
    if (CRITICAL_KEYWORDS.some(kw => cleanWord.includes(kw))) {
      return <span key={i} className="px-1 mx-0.5 rounded bg-emergency-critical/30 text-emergency-critical font-semibold">{word}</span>;
    }
    if (WARNING_KEYWORDS.some(kw => cleanWord.includes(kw))) {
      return <span key={i} className="px-1 mx-0.5 rounded bg-emergency-warning/30 text-emergency-warning font-semibold">{word}</span>;
    }
    return <span key={i}>{word} </span>;
  });
}

export function LiveTranscription({ onLineComplete }: LiveTranscriptionProps) {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const [history, setHistory] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // --- THE LOGIC: DETECT SILENCE & SEND ---
  useEffect(() => {
    // If there is no text, do nothing
    if (!transcript) return;

    // Set a timer: If user stops talking for 1.2 seconds, we assume sentence is done
    const timer = setTimeout(() => {
      // 1. Add to local history for display
      setHistory((prev) => [...prev, transcript]);
      
      // 2. Send to Parent -> AWS Bedrock
      onLineComplete(transcript);
      
      // 3. Reset the current buffer for the next sentence
      resetTranscript();
    }, 1200);

    return () => clearTimeout(timer);
  }, [transcript, onLineComplete, resetTranscript]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, transcript]);

  // Fallback for unsupported browsers
  if (!browserSupportsSpeechRecognition) {
    return <div className="p-4 text-emergency-critical">Browser doesn't support speech recognition. Use Chrome.</div>;
  }

  return (
    <div className="flex flex-col h-full p-4 bg-panel rounded-lg border border-border">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
        <FileText className="w-4 h-4 text-emergency-success" />
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
          Live Transcription
        </h2>
        
        {/* Mic Status Indicator */}
        <div className={`ml-auto flex items-center gap-2 px-2 py-1 rounded text-xs border ${listening ? "bg-emergency-critical/20 border-emergency-critical/50 text-emergency-critical animate-pulse" : "bg-secondary border-border text-muted-foreground"}`}>
          {listening ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3" />}
          {listening ? "LISTENING" : "MUTED"}
        </div>
      </div>

      {/* Transcript Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4">
        {/* 1. Show History (Past Sentences) */}
        {history.map((line, i) => (
          <div key={i} className="text-sm">
            <span className="text-muted-foreground font-semibold">Log: </span>
            <span className="text-foreground">{highlightKeywords(line)}</span>
          </div>
        ))}

        {/* 2. Show Current Live Text (What you are saying RIGHT NOW) */}
        {transcript && (
          <div className="text-sm">
            <span className="text-emergency-warning font-semibold">Live: </span>
            <span className="text-foreground italic typing-cursor">
              {highlightKeywords(transcript)}
            </span>
          </div>
        )}
        
        {history.length === 0 && !transcript && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
            <AlertCircle className="w-8 h-8 mb-2" />
            <span className="text-xs">Waiting for audio...</span>
          </div>
        )}
      </div>

      {/* Manual Controls */}
      <div className="flex gap-2 mt-auto">
        <button
          onClick={() => SpeechRecognition.startListening({ continuous: true, language: 'en-IN' })}
          className={`flex-1 py-2 text-xs font-bold rounded uppercase transition-colors ${listening ? 'bg-secondary text-muted-foreground cursor-not-allowed' : 'bg-emergency-success hover:bg-emerald-600 text-white'}`}
          disabled={listening}
        >
          Start Mic
        </button>
        <button
          onClick={SpeechRecognition.stopListening}
          className="flex-1 py-2 text-xs font-bold bg-secondary hover:bg-secondary/80 text-foreground rounded uppercase border border-border"
        >
          Stop
        </button>
        <button
          onClick={() => { setHistory([]); resetTranscript(); }}
          className="px-3 py-2 text-xs font-bold bg-secondary hover:bg-destructive/20 hover:text-destructive text-muted-foreground rounded uppercase border border-border"
        >
          Clear
        </button>
      </div>
    </div>
  );
}