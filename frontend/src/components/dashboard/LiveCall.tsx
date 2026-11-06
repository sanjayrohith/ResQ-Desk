import { useState, useEffect } from "react";
import { Mic, Globe, Volume2 } from "lucide-react";

export function LiveCall({ onCallEnd, onPTTChange }: { onCallEnd?: () => void, onPTTChange?: (active: boolean) => void }) {
  const [callTime, setCallTime] = useState(0);
  const [isPTTActive, setIsPTTActive] = useState(false);
  const [signalStrength, setSignalStrength] = useState(85);
  const [language, setLanguage] = useState("Tamil");

  useEffect(() => {
    const timer = setInterval(() => {
      setCallTime((t) => t + 1);
      setSignalStrength(prev => Math.min(100, Math.max(40, prev + (Math.random() > 0.5 ? 2 : -2))));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePTT = (active: boolean) => {
    setIsPTTActive(active);
    if (onPTTChange) onPTTChange(active);
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === "Tamil" ? "English" : "Tamil");
  };

  const signalBars = Math.ceil(signalStrength / 25);

  return (
    <div className="flex flex-col">
      <div className="panel-header">
        <span className="panel-title">Call</span>
        <span className="meta">Channel 01</span>
      </div>

      <div className="flex flex-col gap-4 p-4">
        {/* Duration, the signature timecode */}
        <div className="well flex items-end justify-between p-4">
          <div>
            <div className="label mb-2">Call duration</div>
            <div className={`figure text-5xl leading-none transition-colors duration-150 ${isPTTActive ? "text-signal" : "text-ink"}`}>
              {formatTime(callTime)}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex h-4 items-end gap-0.5" aria-hidden="true">
              {[1, 2, 3, 4].map((bar) => (
                <div
                  key={bar}
                  className={`w-1 rounded-sm ${bar <= signalBars ? "bg-ink-2" : "bg-raised"}`}
                  style={{ height: `${bar * 25}%` }}
                />
              ))}
            </div>
            <span className="meta">{signalStrength}%</span>
          </div>
        </div>

        {/* Language and audio */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={toggleLanguage}
            className="well flex items-center gap-3 p-3 text-left transition-colors duration-150 hover:border-line-strong"
          >
            <Globe className="h-4 w-4 shrink-0 text-ink-3" />
            <div>
              <div className="label">Language</div>
              <div className="text-sm font-medium text-ink">{language}</div>
            </div>
          </button>

          <div className="well flex items-center gap-3 p-3">
            <Volume2 className="h-4 w-4 shrink-0 text-ink-3" />
            <div>
              <div className="label">Audio</div>
              <div className="flex items-center gap-2 text-sm font-medium text-ink">
                <span className="dot bg-ok" />
                Clear
              </div>
            </div>
          </div>
        </div>

        {/* Push to talk */}
        <button
          onMouseDown={() => handlePTT(true)}
          onMouseUp={() => handlePTT(false)}
          onMouseLeave={() => handlePTT(false)}
          onTouchStart={() => handlePTT(true)}
          onTouchEnd={() => handlePTT(false)}
          className={`btn h-12 w-full ${isPTTActive ? "btn-signal scale-[0.98]" : "btn-primary"}`}
        >
          <Mic className="h-4 w-4" />
          {isPTTActive ? "Release to listen" : "Push to talk"}
        </button>
      </div>
    </div>
  );
}
