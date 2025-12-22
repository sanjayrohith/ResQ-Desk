import { useState, useEffect } from "react";
import { Phone, AlertTriangle, Shield, Signal, Wifi, Activity, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  const [time, setTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(true);

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
    <header className="flex items-center justify-between px-6 py-3 bg-[#0B0F1A]/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-50">
      {/* Left: Brand Identity */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 shadow-[0_0_15px_rgba(37,99,235,0.3)]">
            <Shield className="w-5 h-5 text-white" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-[#0B0F1A] rounded-full animate-pulse" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black tracking-tighter text-white uppercase leading-none">
              ResQ<span className="text-blue-500">Connect</span>
            </h1>
            <span className="text-[9px] font-bold text-slate-500 tracking-[0.2em] uppercase">
              Emergency Dispatch OS v2.4
            </span>
          </div>
        </div>
        
        {/* Vertical Divider */}
        <div className="h-8 w-px bg-white/10 hidden md:block" />

        {/* System Stats (Arch/Polybar style) */}
        <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-500 font-bold">ONLINE</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <Activity className="w-3.5 h-3.5" />
                <span>LAT: 24ms</span>
            </div>
        </div>
      </div>

      {/* Center: HUD Counters */}
      <div className="flex items-center gap-3 absolute left-1/2 transform -translate-x-1/2">
        <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
          <div className="flex items-center gap-2 border-r border-white/10 pr-3">
            <Phone className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-[10px] text-slate-400 uppercase font-bold">Active</span>
            <span className="text-sm font-black text-white">03</span>
          </div>
          
          <div className="flex items-center gap-2 pl-1">
            <AlertTriangle className="w-3.5 h-3.5 text-red-500 animate-[bounce_1s_infinite]" />
            <span className="text-[10px] text-red-400 uppercase font-bold">Critical</span>
            <span className="text-sm font-black text-red-500">01</span>
          </div>
        </div>
      </div>

      {/* Right: Time & User */}
      <div className="flex items-center gap-6">
        <div className="text-right hidden sm:block">
          <div className="text-2xl font-black font-mono text-white tracking-widest leading-none tabular-nums">
            {formatTime(time)}
          </div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right mt-1">
            {formatDate(time)}
          </div>
        </div>

        <div className="h-8 w-px bg-white/10" />

        <Button size="icon" variant="ghost" className="text-slate-400 hover:text-white hover:bg-white/10">
            <Menu className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}