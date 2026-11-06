import { useState, useRef, useEffect } from "react";
import { Mic, MicOff } from "lucide-react";
import "regenerator-runtime/runtime";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

interface TranscriptEntry {
  text: string;
  time: string;
  type: "caller" | "system" | "operator";
}

const ROLE_LABEL: Record<TranscriptEntry["type"], { name: string; className: string }> = {
  caller: { name: "Caller", className: "text-ink-2" },
  system: { name: "System", className: "text-ink-3" },
  operator: { name: "Operator", className: "text-signal" },
};

export function LiveTranscription({ onLineComplete, isMuted }: { onLineComplete: (t: string) => void, isMuted: boolean }) {
  const { transcript, listening, resetTranscript } = useSpeechRecognition();

  // Initial demo data
  const [history, setHistory] = useState<TranscriptEntry[]>([
    { text: "There's smoke coming from the second floor.", time: "10:42:15", type: "caller" },
    { text: "Keywords detected: smoke, fire, trapped", time: "10:42:22", type: "system" },
    { text: "Please confirm your location, ma'am.", time: "10:42:28", type: "operator" },
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Clear transcript while the operator is speaking
  useEffect(() => {
    if (isMuted) resetTranscript();
  }, [isMuted, resetTranscript]);

  // Send a line once the caller pauses
  useEffect(() => {
    if (!transcript || isMuted) return;

    const timer = setTimeout(() => {
      const newEntry: TranscriptEntry = {
        text: transcript,
        time: new Date().toLocaleTimeString("en-GB", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        type: "caller",
      };
      setHistory((prev) => [...prev, newEntry]);
      onLineComplete(transcript);
      resetTranscript();
    }, 1500);
    return () => clearTimeout(timer);
  }, [transcript, isMuted, onLineComplete, resetTranscript]);

  // Keep the newest line in view
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, transcript]);

  const active = listening && !isMuted;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="panel-header">
        <span className="panel-title">Live transcript</span>
        <span className="meta flex items-center gap-2">
          <span className={`dot ${isMuted ? "bg-crit" : listening ? "bg-signal dot-live" : "bg-ink-3"}`} />
          {isMuted ? "Caller muted" : listening ? "Listening" : "Idle"}
        </span>
      </div>

      {/* Input level */}
      <div className="shrink-0 border-b border-line px-4 py-3">
        <div className="flex h-12 items-center justify-center gap-1 overflow-hidden rounded-lg bg-base px-3" aria-hidden="true">
          {[...Array(48)].map((_, i) => (
            <div
              key={i}
              className={`w-0.5 rounded-sm ${isMuted ? "bg-crit/40" : active ? "bg-ink-2" : "bg-ink-3/40"}`}
              style={{
                height: active ? `${20 + Math.random() * 80}%` : "20%",
                transition: "height 100ms cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Log */}
      <div ref={scrollRef} className="scrollbar-tactical min-h-0 flex-1 divide-y divide-line overflow-y-auto px-4">
        {history.map((entry, i) => {
          const role = ROLE_LABEL[entry.type];
          return (
            <div key={i} className="grid grid-cols-[64px_1fr] gap-3 py-3">
              <span className="meta pt-0.5">{entry.time}</span>
              <div>
                <div className={`mb-1 text-xs font-medium ${role.className}`}>{role.name}</div>
                <p className="text-sm leading-5 text-ink">{entry.text}</p>
              </div>
            </div>
          );
        })}

        {isMuted && (
          <div className="py-3">
            <div className="well flex items-center gap-2 p-3 text-sm text-crit">
              <MicOff className="h-4 w-4 shrink-0" />
              Operator speaking, caller audio muted
            </div>
          </div>
        )}

        {transcript && !isMuted && (
          <div className="grid grid-cols-[64px_1fr] gap-3 py-3">
            <span className="meta pt-0.5 text-signal">Live</span>
            <div>
              <div className="mb-1 text-xs font-medium text-ink-2">Caller</div>
              <p className="text-sm leading-5 text-ink-2">
                {transcript}
                <span className="ml-1 inline-block h-3.5 w-px translate-y-0.5 bg-signal dot-live" />
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="shrink-0 border-t border-line p-4">
        <button
          onClick={() => {
            if (listening) {
              SpeechRecognition.stopListening();
            } else {
              SpeechRecognition.startListening({ continuous: true });
            }
          }}
          className="btn btn-secondary w-full"
        >
          {listening ? (
            <>
              <MicOff className="h-4 w-4" />
              Stop recording
              <span className="dot bg-crit dot-live" />
            </>
          ) : (
            <>
              <Mic className="h-4 w-4" />
              Start recording
            </>
          )}
        </button>
      </div>
    </div>
  );
}
