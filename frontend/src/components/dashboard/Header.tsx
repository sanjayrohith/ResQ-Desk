import { useState, useEffect } from "react";
import { Odometer } from "./Odometer";

export function Header() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <header className="flex h-16 items-center justify-between border-b border-line bg-base px-6">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <img src="/logo.png" alt="ResQ Desk" className="h-8 w-8 object-contain" />
        <h1 className="text-lg font-medium leading-none text-ink">ResQ Desk</h1>
        <span className="hidden h-4 w-px bg-line-strong lg:block" />
        <p className="hidden text-sm text-ink-3 lg:block">Emergency response</p>
      </div>

      {/* Status and clock */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-sm text-ink-2">
          <span className="dot bg-ok" />
          System online
        </div>
        <span className="h-4 w-px bg-line-strong" />
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-ink-3 md:block">{formatDate(time)}</span>
          <div className="figure text-2xl leading-none text-ink">
            <Odometer value={formatTime(time)} />
          </div>
        </div>
      </div>
    </header>
  );
}
