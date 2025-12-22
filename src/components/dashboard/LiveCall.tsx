import { useState, useEffect } from "react";
import { Phone, Mic, MicOff, Pause, Play, PhoneOff, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LiveCallProps {
  onCallEnd?: () => void;
}

export function LiveCall({ onCallEnd }: LiveCallProps) {
  const [callTime, setCallTime] = useState(134); // Start at 2:14
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [callStatus, setCallStatus] = useState<"connected" | "hold" | "ended">("connected");

  useEffect(() => {
    if (callStatus === "connected") {
      const timer = setInterval(() => setCallTime((t) => t + 1), 1000);
      return () => clearInterval(timer);
    }
  }, [callStatus]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleMute = () => setIsMuted(!isMuted);
  
  const handleHold = () => {
    setIsOnHold(!isOnHold);
    setCallStatus(isOnHold ? "connected" : "hold");
  };

  const handleEndCall = () => {
    setCallStatus("ended");
    onCallEnd?.();
  };

  const statusColors = {
    connected: "bg-emergency-success",
    hold: "bg-emergency-warning",
    ended: "bg-emergency-busy",
  };

  const statusLabels = {
    connected: "CONNECTED",
    hold: "ON HOLD",
    ended: "ENDED",
  };

  return (
    <div className="flex flex-col h-full p-4 bg-panel rounded-lg border border-border">
      {/* Panel Header */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
        <Phone className="w-4 h-4 text-emergency-success" />
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
          Live Call
        </h2>
      </div>

      {/* Call Status */}
      <div className="flex items-center justify-between mb-4">
        <div className={`px-3 py-1 rounded text-xs font-bold uppercase ${statusColors[callStatus]} text-emergency-${callStatus === "connected" ? "success" : callStatus === "hold" ? "warning" : "busy"}-foreground`}>
          {statusLabels[callStatus]}
        </div>
        <div className="text-2xl font-mono font-bold text-foreground">
          {formatTime(callTime)}
        </div>
      </div>

      {/* Language Detection */}
      <div className="flex items-center gap-2 mb-6 px-3 py-2 bg-secondary rounded">
        <Globe className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Detected:</span>
        <span className="text-sm font-medium text-foreground">Tamil (Auto)</span>
      </div>

      {/* Waveform Visualization */}
      <div className="flex items-center justify-center gap-1 h-16 mb-6 px-4 bg-secondary rounded">
        {callStatus === "connected" && !isMuted ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="w-2 h-full waveform-bar rounded-full"
              style={{ maxHeight: "100%" }}
            />
          ))
        ) : (
          <span className="text-sm text-muted-foreground">
            {callStatus === "ended" ? "Call Ended" : isMuted ? "Muted" : "On Hold"}
          </span>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex gap-2 mt-auto">
        <Button
          variant={isMuted ? "destructive" : "secondary"}
          size="sm"
          className="flex-1"
          onClick={handleMute}
          disabled={callStatus === "ended"}
        >
          {isMuted ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
          {isMuted ? "Unmute" : "Mute"}
        </Button>

        <Button
          variant={isOnHold ? "default" : "secondary"}
          size="sm"
          className="flex-1"
          onClick={handleHold}
          disabled={callStatus === "ended"}
        >
          {isOnHold ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
          {isOnHold ? "Resume" : "Hold"}
        </Button>

        <Button
          variant="destructive"
          size="sm"
          className="flex-1"
          onClick={handleEndCall}
          disabled={callStatus === "ended"}
        >
          <PhoneOff className="w-4 h-4 mr-2" />
          End
        </Button>
      </div>
    </div>
  );
}
