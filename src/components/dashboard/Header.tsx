import { useState, useEffect } from "react";
import { Activity, Shield, Clock, Wifi, Users, AlertTriangle } from "lucide-react";

export function Header() {
  const [time, setTime] = useState(new Date());
  const [latency] = useState(24);

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
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    }).toUpperCase();
  };

  return (
    <header className="relative flex items-center justify-between px-6 py-4 bg-slate-900/40 backdrop-blur-xl border-b border-slate-700/50">
      {/* Gradient Line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
      
      {/* Left: Brand */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full" />
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-lg shadow-cyan-500/30">
              <Shield className="w-6 h-6 text-white" />
            </div>
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              RESQ<span className="gradient-text-cyan">DESK</span>
              <span className="px-2 py-0.5 text-[9px] font-bold bg-cyan-500/20 text-cyan-400 rounded-full border border-cyan-500/30">
                v2.0
              </span>
            </h1>
            <p className="text-[10px] text-slate-500 font-medium tracking-wider">
              EMERGENCY RESPONSE SYSTEM
            </p>
          </div>
        </div>
      </div>

      {/* Center: System Status */}
      <div className="flex items-center gap-3">
        {/* System Online */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-emerald-500 live-dot" />
          </div>
          <span className="text-xs font-semibold text-emerald-400">SYSTEM ONLINE</span>
        </div>
        
        {/* Latency */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <Wifi className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs text-slate-400">
            <span className="font-semibold text-cyan-400 number-ticker">{latency}ms</span>
          </span>
        </div>

        {/* Active Units */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <Users className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs text-slate-400">
            Active: <span className="font-semibold text-amber-400 number-ticker">03</span>
          </span>
        </div>

        {/* Priority Alerts */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
          <span className="text-xs font-semibold text-red-400 number-ticker">0</span>
          <span className="text-xs text-red-400/70">ALERTS</span>
        </div>
      </div>

      {/* Right: Time */}
      <div className="flex items-center gap-5">
        <div className="text-right">
          <div className="flex items-center gap-2 justify-end mb-1">
            <Clock className="w-4 h-4 text-slate-500" />
            <span className="text-[10px] text-slate-500 font-medium tracking-wider">
              {formatDate(time)}
            </span>
          </div>
          <div className="text-3xl font-bold font-mono text-white tracking-wider number-ticker text-glow-cyan">
            {formatTime(time)}
          </div>
        </div>
      </div>
    </header>
  );
}