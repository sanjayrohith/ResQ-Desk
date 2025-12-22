import { useState, useEffect } from "react";
import { Phone, AlertTriangle, Shield } from "lucide-react";

export function Header() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-panel-header border-b border-border">
      {/* Logo & Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emergency-critical">
          <Shield className="w-6 h-6 text-emergency-critical-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            ResQ-Connect
          </h1>
          <p className="text-xs text-muted-foreground">
            Emergency Dispatch Console
          </p>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary">
          <Phone className="w-4 h-4 text-emergency-success" />
          <span className="text-sm text-muted-foreground">Active Calls:</span>
          <span className="text-lg font-bold text-foreground">3</span>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emergency-critical/20 border border-emergency-critical/50 critical-pulse">
          <AlertTriangle className="w-4 h-4 text-emergency-critical" />
          <span className="text-sm text-emergency-critical">High Priority:</span>
          <span className="text-lg font-bold text-emergency-critical">1</span>
        </div>
      </div>

      {/* Clock */}
      <div className="text-right">
        <div className="text-2xl font-mono font-bold text-foreground tracking-wider">
          {formatTime(time)}
        </div>
        <div className="text-xs text-muted-foreground">{formatDate(time)}</div>
      </div>
    </header>
  );
}
