import { useEffect, useState } from "react";
import {
  Ambulance, CheckCircle2, MapPin, XCircle, AlertTriangle, Siren, Navigation,
  Clock, Zap, Repeat, Flame, Ship, Truck, ArrowRight, ShieldAlert,
} from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";

interface DispatchData {
  incident_id?: string;
  location?: string;
  severity?: string;
  suggested_unit?: string;
  reallocation?: {
    unit_id: string;
    from_incident?: string | null;
    from_severity?: string | null;
    to_severity?: string | null;
    eta_minutes?: number | null;
    message: string;
  } | null;
}

interface DispatchPopupProps {
  data: DispatchData;
  onCancel: () => void;
  onComplete: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || "https://resq-backend-9585.onrender.com";

// Short code, e.g. "Fire Engine FE13" -> "FE13"
function shortCode(unitId: string): string {
  const parts = unitId.trim().split(/\s+/);
  return parts[parts.length - 1] || unitId;
}

// Pick a vehicle icon from the unit name.
function vehicleIcon(unitId: string) {
  const u = unitId.toLowerCase();
  if (u.includes("fire")) return Flame;
  if (u.includes("boat") || u.includes("rescue")) return Ship;
  if (u.includes("ambulance")) return Ambulance;
  return Truck;
}

export function DispatchPopup({ data, onCancel, onComplete }: DispatchPopupProps) {
  const reallocation = data?.reallocation || null;
  const isReallocation = !!reallocation;

  const [count, setCount] = useState(3);
  const [dispatched, setDispatched] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const displayUnit = isReallocation ? reallocation.unit_id : (data?.suggested_unit || "A12");
  const etaValue = isReallocation && reallocation.eta_minutes != null ? reallocation.eta_minutes : 6;
  const animatedEta = Math.round(useCountUp(etaValue, 1000));

  // Auto-dispatch countdown ONLY for normal (non-reallocation) dispatches.
  useEffect(() => {
    if (isReallocation || dispatched) return;
    let timer: ReturnType<typeof setTimeout>;
    if (count > 0) {
      timer = setTimeout(() => setCount(count - 1), 1000);
    } else {
      setDispatched(true);
      timer = setTimeout(() => onComplete(), 2000);
    }
    return () => clearTimeout(timer);
  }, [count, onComplete, isReallocation, dispatched]);

  useEffect(() => {
    if (!dispatched) return;
    const t = setTimeout(() => onComplete(), 2000);
    return () => clearTimeout(t);
  }, [dispatched, onComplete]);

  const handleConfirmReallocation = async () => {
    setConfirming(true);
    try {
      await fetch(`${API_URL}/units/reallocate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unit_id: reallocation!.unit_id,
          incident_id: data?.incident_id,
          severity: data?.severity,
        }),
      });
    } catch (e) {
      console.error("Reallocation failed:", e);
    } finally {
      setConfirming(false);
      setDispatched(true);
    }
  };

  const progressPercentage = (count / 3) * 100;
  const VehicleIcon = vehicleIcon(displayUnit);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={onCancel} />

      {/* Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full transition-all duration-500 ${
          dispatched
            ? 'bg-emerald-500/20 blur-[100px]'
            : isReallocation
              ? 'bg-amber-500/15 blur-[100px] animate-pulse'
              : 'bg-cyan-500/20 blur-[100px] animate-pulse'
        }`} />
      </div>

      {/* Modal */}
      <div className="relative w-full max-w-lg animate-in zoom-in-95 fade-in duration-300">
        <div className="panel panel-glow overflow-hidden">
          <div className={`absolute top-0 left-0 right-0 h-1 ${
            dispatched
              ? 'bg-gradient-to-r from-transparent via-emerald-500 to-transparent'
              : isReallocation
                ? 'bg-gradient-to-r from-transparent via-amber-500 to-transparent'
                : 'bg-gradient-to-r from-transparent via-cyan-500 to-transparent'
          }`} />

          {/* ============ SUCCESS STATE ============ */}
          {dispatched ? (
            <div className="p-6 py-12 flex flex-col items-center justify-center animate-in zoom-in-95 duration-300">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-emerald-500 blur-3xl opacity-30 animate-pulse" />
                <div className="relative p-6 rounded-full bg-gradient-to-br from-emerald-500/20 to-transparent border border-emerald-500/30">
                  <CheckCircle2 className="w-16 h-16 text-emerald-400" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-white uppercase tracking-tight mb-3 text-glow-emerald">
                {isReallocation ? "Reallocated" : "Dispatched"}
              </h2>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <Zap className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="text-sm font-medium text-emerald-400 uppercase tracking-wider">
                  {shortCode(displayUnit)} En Route
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-6">Closing automatically...</p>
            </div>

          /* ============ REALLOCATION STATE ============ */
          ) : isReallocation ? (
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="relative p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30">
                    <div className="absolute inset-0 rounded-xl bg-amber-500/20 blur-md animate-pulse" />
                    <Repeat className="relative w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white leading-tight">Reallocation Required</h2>
                    <p className="text-[11px] text-amber-400/80 uppercase tracking-wider font-medium">Priority Override · Confirm to proceed</p>
                  </div>
                </div>
                <button onClick={onCancel} className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-slate-800/50 transition-all">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Unit hero */}
              <div className="rounded-2xl bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/50 p-4 mb-4 flex items-center gap-4">
                <div className="relative shrink-0">
                  <div className="absolute inset-0 bg-amber-500/25 blur-lg rounded-2xl animate-pulse" />
                  <div className="relative w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center">
                    <VehicleIcon className="w-7 h-7 text-amber-400" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Reassigning Unit</div>
                  <div className="text-2xl font-bold text-white leading-tight truncate">{displayUnit}</div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">ETA</div>
                  <div className="flex items-baseline gap-1 justify-end">
                    <span className="text-3xl font-bold text-amber-400 number-ticker">{animatedEta}</span>
                    <span className="text-xs text-amber-400/70 font-semibold">MIN</span>
                  </div>
                </div>
              </div>

              {/* Transfer flow: FROM (current job) -> TO (critical incident) */}
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 mb-4">
                {/* FROM */}
                <div className="rounded-xl bg-slate-900/50 border border-slate-700/40 p-3 opacity-90">
                  <div className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold mb-1.5">Leaving</div>
                  <div className="text-xs font-mono text-slate-300 truncate">{reallocation.from_incident || "—"}</div>
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-700/40 text-slate-300 text-[10px] font-bold uppercase tracking-wider border border-slate-600/40">
                    {reallocation.from_severity || "Normal"}
                  </div>
                </div>

                {/* Connector */}
                <div className="flex flex-col items-center gap-1.5 px-1">
                  <div className="relative w-14 h-4 text-amber-400/70">
                    <div className="reflow-track absolute top-1/2 -translate-y-1/2 left-0 right-0 h-0.5 opacity-40" />
                    <div className="reflow-dot">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_2px_rgba(245,158,11,0.6)]" />
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-400/60" />
                </div>

                {/* TO */}
                <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-3">
                  <div className="text-[9px] text-red-400/80 uppercase tracking-wider font-semibold mb-1.5">New Target</div>
                  <div className="flex items-center gap-1 text-xs text-slate-200 truncate">
                    <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                    <span className="truncate">{data.location || "Incident"}</span>
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-500/20 text-red-300 text-[10px] font-bold uppercase tracking-wider border border-red-500/40">
                    <ShieldAlert className="w-3 h-3" />
                    {reallocation.to_severity || data.severity || "Critical"}
                  </div>
                </div>
              </div>

              {/* Consequence note */}
              <div className="flex items-start gap-2.5 rounded-xl bg-amber-500/[0.07] border border-amber-500/20 px-3.5 py-2.5 mb-5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  No free unit of this type is available. Confirming will pull{" "}
                  <span className="text-slate-200 font-semibold">{shortCode(displayUnit)}</span> off its{" "}
                  <span className="text-slate-300">{(reallocation.from_severity || "normal").toLowerCase()}-priority</span> job,
                  which will be returned to the dispatch queue.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onCancel}
                  disabled={confirming}
                  className="flex-1 py-3.5 rounded-xl font-semibold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  Keep Current
                </button>
                <button
                  onClick={handleConfirmReallocation}
                  disabled={confirming}
                  className="flex-[1.6] py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100"
                >
                  <Repeat className={`w-4 h-4 ${confirming ? 'animate-spin' : ''}`} />
                  {confirming ? "Reallocating…" : "Confirm & Redeploy"}
                </button>
              </div>
            </div>

          /* ============ AUTO-DISPATCH STATE ============ */
          ) : (
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-red-500/20 border border-red-500/30">
                    <Siren className="w-5 h-5 text-red-400 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Auto-Dispatch</h2>
                    <p className="text-xs text-slate-500">Initiating unit deployment</p>
                  </div>
                </div>
                <button onClick={onCancel} className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-slate-800/50 transition-all">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Countdown */}
              <div className="relative flex justify-center py-8 mb-8">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="w-44 h-44 border border-cyan-500/20 rounded-full animate-spin" style={{ animationDuration: '8s' }} />
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="w-36 h-36 border border-cyan-500/30 rounded-full animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }} />
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="w-28 h-28 border-2 border-dashed border-cyan-500/40 rounded-full animate-spin" style={{ animationDuration: '4s' }} />
                </div>
                <div className="relative z-10 flex flex-col items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500/20 to-transparent border border-cyan-500/30 shadow-2xl shadow-cyan-500/20">
                  <span className="text-6xl font-bold text-white number-ticker text-glow-cyan">{count}</span>
                </div>
              </div>

              {/* Unit Info Card */}
              <div className="rounded-2xl bg-slate-900/50 border border-slate-700/50 p-5 mb-6 relative overflow-hidden">
                <div className="absolute top-4 right-4 opacity-10">
                  <Ambulance className="w-20 h-20 text-cyan-400 -rotate-12" />
                </div>
                <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mb-1">Assigning Unit</div>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-white">{displayUnit}</span>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border bg-cyan-500/20 border-cyan-500/30">
                          <Clock className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="text-xs font-semibold text-cyan-400">{animatedEta} MIN ETA</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl border bg-cyan-500/10 border-cyan-500/20">
                      <Navigation className="w-6 h-6 text-cyan-400" />
                    </div>
                  </div>
                  <div className="h-px bg-slate-700/50" />
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mb-2">Target Location</div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-300 leading-relaxed">{data.location || "Target coordinates pending..."}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Dispatch Progress</span>
                  <span className="text-xs font-mono text-cyan-400">{count}s</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-1000 ease-linear rounded-full shadow-lg shadow-cyan-500/30"
                    style={{ width: `${100 - progressPercentage}%` }}
                  />
                </div>
              </div>

              {/* Abort */}
              <button
                onClick={onCancel}
                className="w-full py-4 rounded-xl font-semibold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50"
              >
                <AlertTriangle className="w-4 h-4" />
                Abort Dispatch
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
