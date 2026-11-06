import { useEffect, useState } from "react";
import {
  Ambulance, CheckCircle2, MapPin, X, AlertTriangle, Flame, Ship, Truck, ArrowRight, Loader2,
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
      <div className="absolute inset-0 bg-black/70" onClick={onCancel} />

      <div className="panel-entrance relative w-full max-w-lg">
        <div className="panel">
          {/* Success */}
          {dispatched ? (
            <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
              <CheckCircle2 className="mb-6 h-8 w-8 text-ok" />
              <h2 className="mb-2 text-2xl font-medium text-ink">
                {isReallocation ? "Reallocated" : "Dispatched"}
              </h2>
              <p className="text-sm text-ink-2">{shortCode(displayUnit)} en route</p>
              <p className="meta mt-6">Closing automatically</p>
            </div>

          /* Reallocation */
          ) : isReallocation ? (
            <div className="p-6">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-medium leading-6 text-ink">Reallocation required</h2>
                  <p className="text-sm text-ink-3">No free unit of this type. Confirm to redeploy</p>
                </div>
                <button onClick={onCancel} className="btn-icon" aria-label="Close">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Unit */}
              <div className="well mb-3 flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-raised">
                  <VehicleIcon className="h-5 w-5 text-ink-2" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="label">Reassigning unit</div>
                  <div className="truncate text-2xl font-medium leading-8 text-ink">{displayUnit}</div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="label">ETA</div>
                  <div className="flex items-baseline justify-end gap-1">
                    <span className="figure text-3xl leading-8 text-ink">{animatedEta}</span>
                    <span className="text-sm text-ink-3">min</span>
                  </div>
                </div>
              </div>

              {/* Transfer: leaving job to new target */}
              <div className="mb-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <div className="well p-3">
                  <div className="label mb-1">Leaving</div>
                  <div className="truncate font-mono text-sm text-ink-2">{reallocation.from_incident || "—"}</div>
                  <div className="mt-1 text-sm text-ink-2">{reallocation.from_severity || "Normal"}</div>
                </div>

                <ArrowRight className="h-4 w-4 text-ink-3" />

                <div className="well p-3" style={{ borderColor: "rgba(229, 72, 77, 0.4)" }}>
                  <div className="label mb-1">New target</div>
                  <div className="flex items-center gap-1 text-sm text-ink">
                    <MapPin className="h-4 w-4 shrink-0 text-ink-3" />
                    <span className="truncate">{data.location || "Incident"}</span>
                  </div>
                  <div className="mt-1 text-sm text-crit">{reallocation.to_severity || data.severity || "Critical"}</div>
                </div>
              </div>

              {/* Consequence */}
              <div className="well mb-6 flex items-start gap-3 p-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-signal" />
                <p className="text-sm leading-5 text-ink-2">
                  Confirming will pull <span className="text-ink">{shortCode(displayUnit)}</span> off its{" "}
                  {(reallocation.from_severity || "normal").toLowerCase()}-priority job, which will be returned to the dispatch queue.
                </p>
              </div>

              <div className="flex gap-3">
                <button onClick={onCancel} disabled={confirming} className="btn btn-secondary h-11 flex-1">
                  Keep current
                </button>
                <button onClick={handleConfirmReallocation} disabled={confirming} className="btn btn-primary h-11 flex-[1.6]">
                  {confirming && <Loader2 className="h-4 w-4 animate-spin" />}
                  {confirming ? "Reallocating" : "Confirm and redeploy"}
                </button>
              </div>
            </div>

          /* Auto-dispatch */
          ) : (
            <div className="p-6">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-medium leading-6 text-ink">Auto-dispatch</h2>
                  <p className="text-sm text-ink-3">Unit deploys when the countdown ends</p>
                </div>
                <button onClick={onCancel} className="btn-icon" aria-label="Close">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Countdown */}
              <div className="flex flex-col items-center py-8">
                <div className="figure text-7xl leading-none text-ink">{count}</div>
                <div className="label mt-3">seconds</div>
              </div>

              {/* Unit */}
              <div className="well mb-6 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="label mb-1">Assigning unit</div>
                    <div className="text-2xl font-medium leading-8 text-ink">{displayUnit}</div>
                  </div>
                  <div className="text-right">
                    <div className="label mb-1">ETA</div>
                    <div className="figure text-lg leading-8 text-ink">{animatedEta} min</div>
                  </div>
                </div>
                <div className="my-4 h-px bg-line" />
                <div className="label mb-1">Target location</div>
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ink-3" />
                  <span className="text-sm leading-5 text-ink">{data.location || "Target location pending"}</span>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-6">
                <div className="mb-2 flex items-center justify-between">
                  <span className="label">Dispatch progress</span>
                  <span className="meta">{count}s</span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-raised">
                  <div
                    className="h-full origin-left rounded-full bg-ink transition-transform duration-1000 ease-linear"
                    style={{ transform: `scaleX(${(100 - progressPercentage) / 100})` }}
                  />
                </div>
              </div>

              <button onClick={onCancel} className="btn btn-secondary h-11 w-full text-crit">
                Abort dispatch
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
