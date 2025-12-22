import { useState, useEffect } from "react";
import { Activity, Zap, Clock } from "lucide-react";

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
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const year = date.getFullYear();
    const offset = date.getTimezoneOffset();
    const offsetHours = Math.abs(Math.floor(offset / 60));
    const offsetMins = Math.abs(offset % 60);
    const offsetSign = offset <= 0 ? '+' : '-';
    const tz = `UTC${offsetSign}${offsetHours.toString().padStart(2, '0')}:${offsetMins.toString().padStart(2, '0')}`;
    return `${day} ${month} ${year} // ${tz}`;
  };

  return (
    <header className="relative flex items-center justify-between px-6 py-3 bg-gradient-to-b from-[#0c1118] to-[#080c12] border-b border-[#1a2835]/60" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.5), 0 8px 40px rgba(0,0,0,0.3), 0 0 60px -20px rgba(0,212,255,0.1)' }}>
      {/* Left: Brand */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          {/* Logo Icon */}
          <div className="flex items-center justify-center w-9 h-9 rounded-lg border border-cyan-500/40 bg-cyan-500/10" style={{ boxShadow: '0 0 20px rgba(0,212,255,0.2), inset 0 1px 0 rgba(255,255,255,0.1)' }}>
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">
              RESQ<span className="text-cyan-400">CONNECT</span>
            </h1>
            <p className="text-[9px] text-slate-500 uppercase tracking-[0.15em] -mt-0.5">
              Tactical Dispatch System v2.4
            </p>
          </div>
        </div>
      </div>

      {/* Center: System Status */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 6px rgba(16,185,129,0.9), 0 0 20px rgba(16,185,129,0.5), 0 0 40px rgba(16,185,129,0.3)' }} />
          <span className="text-xs font-medium text-slate-400">SYSTEM ONLINE</span>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span>LATENCY: <span className="text-cyan-400">24ms</span></span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Activity className="w-3.5 h-3.5 text-amber-400" />
          <span>ACTIVE: <span className="text-amber-400">03</span></span>
        </div>
      </div>

      {/* Right: Time */}
      <div className="text-right">
        <div className="text-2xl font-bold font-mono text-white tracking-wider tabular-nums">
          {formatTime(time)}
        </div>
        <div className="text-[10px] text-slate-500 tracking-wide">
          {formatDate(time)}
        </div>
      </div>
    </header>
  );
}