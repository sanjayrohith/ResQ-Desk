import { useState, useEffect, useRef } from "react";
import { FileText } from "lucide-react";

const TRANSCRIPT_LINES = [
  { speaker: "Caller", text: "Hello? Please help us! We are trapped here!" },
  { speaker: "Operator", text: "I understand. Can you tell me your location?" },
  { speaker: "Caller", text: "We are at Perumal Temple in Velachery. The water is rising." },
  { speaker: "Operator", text: "How many people are with you?" },
  { speaker: "Caller", text: "There are three of us. Two adults and one elderly person." },
  { speaker: "Caller", text: "My grandmother is here. She has mobility issues and cannot move fast." },
  { speaker: "Operator", text: "Is anyone injured or bleeding?" },
  { speaker: "Caller", text: "No bleeding but grandmother is very weak. She is almost unconscious from fear." },
  { speaker: "Operator", text: "Help is on the way. Please stay calm and move to higher ground if possible." },
];

const CRITICAL_KEYWORDS = ["bleeding", "trapped", "unconscious", "dying", "emergency"];
const WARNING_KEYWORDS = ["baby", "pregnant", "elderly", "child", "disabled"];

function highlightKeywords(text: string) {
  const words = text.split(" ");
  return words.map((word, i) => {
    const cleanWord = word.toLowerCase().replace(/[.,!?]/g, "");
    
    if (CRITICAL_KEYWORDS.some(kw => cleanWord.includes(kw))) {
      return (
        <span key={i} className="px-1 mx-0.5 rounded bg-emergency-critical/30 text-emergency-critical font-semibold">
          {word}
        </span>
      );
    }
    
    if (WARNING_KEYWORDS.some(kw => cleanWord.includes(kw))) {
      return (
        <span key={i} className="px-1 mx-0.5 rounded bg-emergency-warning/30 text-emergency-warning font-semibold">
          {word}
        </span>
      );
    }
    
    return <span key={i}>{word} </span>;
  });
}

export function LiveTranscription() {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [currentText, setCurrentText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visibleLines >= TRANSCRIPT_LINES.length) {
      setIsTyping(false);
      return;
    }

    const currentLine = TRANSCRIPT_LINES[visibleLines];
    let charIndex = 0;

    const typeInterval = setInterval(() => {
      if (charIndex <= currentLine.text.length) {
        setCurrentText(currentLine.text.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typeInterval);
        setTimeout(() => {
          setVisibleLines((v) => v + 1);
          setCurrentText("");
        }, 800);
      }
    }, 40);

    return () => clearInterval(typeInterval);
  }, [visibleLines]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [visibleLines, currentText]);

  return (
    <div className="flex flex-col h-full p-4 bg-panel rounded-lg border border-border">
      {/* Panel Header */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
        <FileText className="w-4 h-4 text-emergency-success" />
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
          Live Transcription
        </h2>
        {isTyping && (
          <span className="ml-auto px-2 py-0.5 text-xs bg-emergency-success/20 text-emergency-success rounded">
            LIVE
          </span>
        )}
      </div>

      {/* Transcript Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3 pr-2"
      >
        {TRANSCRIPT_LINES.slice(0, visibleLines).map((line, i) => (
          <div key={i} className="text-sm">
            <span className={`font-semibold ${line.speaker === "Caller" ? "text-emergency-warning" : "text-muted-foreground"}`}>
              {line.speaker}:
            </span>{" "}
            <span className="text-foreground">{highlightKeywords(line.text)}</span>
          </div>
        ))}

        {/* Currently typing line */}
        {visibleLines < TRANSCRIPT_LINES.length && currentText && (
          <div className="text-sm">
            <span className={`font-semibold ${TRANSCRIPT_LINES[visibleLines].speaker === "Caller" ? "text-emergency-warning" : "text-muted-foreground"}`}>
              {TRANSCRIPT_LINES[visibleLines].speaker}:
            </span>{" "}
            <span className="text-foreground typing-cursor">
              {highlightKeywords(currentText)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
