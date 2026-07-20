import { useState, useEffect, useRef, useMemo } from "react";
import { Flame, Map as MapIcon, Truck, Shield, Heart, Clock, AlertCircle, Ship } from "lucide-react";
import { MapContainer, TileLayer, Marker, Circle, Popup, useMap } from "react-leaflet";
import L from "leaflet";

interface MapPanelProps {
  severity: string;
  isDataComplete: boolean;
  location?: string;
}

// Live unit shape returned by GET /units
interface LiveUnit {
  unit_id: string;
  vehicle_type: string;
  lat: number | null;
  lng: number | null;
  distance_km: number | null;
  eta_minutes: number | null;
  status: string;
  assigned_incident: string | null;
  assigned_severity: string | null;
}

// Default center (New York City) — incidents render here.
const DEFAULT_CENTER: [number, number] = [40.7128, -74.006];

// How long (ms) an EN_ROUTE unit takes to visually reach the scene.
const TRAVEL_MS = 30000;
// Poll interval for live unit state.
const POLL_MS = 4000;

const API_URL = import.meta.env.VITE_API_URL || "https://resq-backend-9585.onrender.com";

const VEHICLE_CONFIG: Record<string, { color: string; icon: typeof Heart; label: string }> = {
  AMBULANCE: { color: "#06b6d4", icon: Heart, label: "Ambulance" },
  FIRE_ENGINE: { color: "#f97316", icon: Flame, label: "Fire Engine" },
  RESCUE_BOAT: { color: "#a855f7", icon: Ship, label: "Rescue Boat" },
};
const DEFAULT_VEHICLE = { color: "#64748b", icon: Truck, label: "Unit" };

const STATUS_CONFIG: Record<string, { color: string; label: string; pulse: boolean }> = {
  AVAILABLE: { color: "#10b981", label: "Available", pulse: false },
  EN_ROUTE: { color: "#06b6d4", label: "En Route", pulse: true },
  ON_SCENE: { color: "#f59e0b", label: "On Scene", pulse: false },
  RETURNING: { color: "#64748b", label: "Returning", pulse: false },
};

function vehicleCfg(type: string) {
  return VEHICLE_CONFIG[type] || DEFAULT_VEHICLE;
}
function statusCfg(status: string) {
  return STATUS_CONFIG[status] || STATUS_CONFIG.AVAILABLE;
}

// Short code for display, e.g. "Fire Engine FE12" -> "FE12"
function shortCode(unitId: string): string {
  const parts = unitId.trim().split(/\s+/);
  return parts[parts.length - 1] || unitId;
}

function createUnitIcon(statusColor: string, pulse: boolean) {
  const pulseRing = pulse
    ? `<div style="position:absolute;width:30px;height:30px;border-radius:50%;background:${statusColor};opacity:0.35;animation:unitPing 1.6s cubic-bezier(0,0,0.2,1) infinite;"></div>`
    : "";
  return L.divIcon({
    className: "",
    html: `<div style="position:relative;display:flex;align-items:center;justify-content:center;width:16px;height:16px;">
      ${pulseRing}
      <div style="
        width: 16px; height: 16px; border-radius: 50%;
        background: ${statusColor}; border: 2px solid rgba(255,255,255,0.7);
        box-shadow: 0 0 12px ${statusColor}88, 0 0 4px ${statusColor}44; position:relative; z-index:1;
      "></div>
    </div>
    <style>@keyframes unitPing{75%,100%{transform:scale(2.2);opacity:0;}}</style>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function createIncidentIcon(isCritical: boolean) {
  const color = isCritical ? "#ef4444" : "#f59e0b";
  return L.divIcon({
    className: "",
    html: `<div style="position:relative;display:flex;align-items:center;justify-content:center;">
      <div style="position:absolute;width:40px;height:40px;border-radius:50%;background:${color};opacity:0.3;animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>
      <div style="position:absolute;width:28px;height:28px;border-radius:50%;background:${color};opacity:0.4;animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;animation-delay:0.5s;"></div>
      <div style="width:18px;height:18px;border-radius:50%;background:${color};border:3px solid rgba(255,255,255,0.7);box-shadow:0 0 20px ${color}aa;position:relative;z-index:1;"></div>
    </div>
    <style>@keyframes ping{75%,100%{transform:scale(2);opacity:0;}}</style>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
}

// Recenter map when incident data changes
function MapUpdater({ center, isDataComplete }: { center: [number, number]; isDataComplete: boolean }) {
  const map = useMap();
  const hasFlown = useRef(false);

  useEffect(() => {
    if (isDataComplete && !hasFlown.current) {
      map.flyTo(center, 15, { duration: 1.5 });
      hasFlown.current = true;
    }
  }, [isDataComplete, center, map]);

  useEffect(() => {
    if (!isDataComplete) {
      hasFlown.current = false;
    }
  }, [isDataComplete]);

  return null;
}

export function MapPanel({ severity, isDataComplete, location }: MapPanelProps) {
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [units, setUnits] = useState<LiveUnit[]>([]);
  const [tick, setTick] = useState(0); // drives EN_ROUTE animation frames
  const isCritical = severity?.toLowerCase() === "critical";
  const center = DEFAULT_CENTER;

  // Track when each unit first entered EN_ROUTE, for travel interpolation.
  const enRouteStart = useRef<Record<string, number>>({});

  const incidentIcon = useMemo(() => createIncidentIcon(isCritical), [isCritical]);

  // Poll live unit state.
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/units`);
        if (!res.ok) return;
        const data: LiveUnit[] = await res.json();
        if (!active) return;

        const now = Date.now();
        const seen = new Set<string>();
        data.forEach((u) => {
          seen.add(u.unit_id);
          if (u.status === "EN_ROUTE") {
            if (!enRouteStart.current[u.unit_id]) enRouteStart.current[u.unit_id] = now;
          } else {
            delete enRouteStart.current[u.unit_id];
          }
        });
        // Drop stale animation clocks.
        Object.keys(enRouteStart.current).forEach((id) => {
          if (!seen.has(id)) delete enRouteStart.current[id];
        });

        setUnits(data);
      } catch {
        /* backend offline — keep last known state */
      }
    };
    load();
    const id = setInterval(load, POLL_MS);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  // Animation heartbeat: re-render EN_ROUTE units drifting toward the scene.
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Compute the on-screen position of a unit (interpolated if EN_ROUTE).
  const displayPos = (u: LiveUnit): [number, number] | null => {
    if (u.lat == null || u.lng == null) return null;
    const base: [number, number] = [u.lat, u.lng];
    if (u.status !== "EN_ROUTE") return base;
    const start = enRouteStart.current[u.unit_id];
    if (!start) return base;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = tick; // depend on heartbeat
    const progress = Math.min(0.85, (Date.now() - start) / TRAVEL_MS);
    return [base[0] + (center[0] - base[0]) * progress, base[1] + (center[1] - base[1]) * progress];
  };

  const unitIcons = useMemo(() => {
    const icons: Record<string, L.DivIcon> = {};
    units.forEach((u) => {
      const s = statusCfg(u.status);
      icons[u.unit_id] = createUnitIcon(s.color, s.pulse);
    });
    return icons;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [units.map((u) => `${u.unit_id}:${u.status}`).join(",")]);

  const availableCount = units.filter((u) => u.status === "AVAILABLE").length;

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Header */}
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/20">
            <MapIcon className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="panel-title text-cyan-400">TACTICAL MAP</span>
        </div>
        {isDataComplete && location && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50 max-w-[60%]">
            <AlertCircle className={`w-3 h-3 shrink-0 ${isCritical ? 'text-red-400' : 'text-amber-400'}`} />
            <span className="text-[10px] text-slate-300 font-medium truncate">{location}</span>
          </div>
        )}
      </div>

      {/* Real Leaflet Map */}
      <div className="relative flex-1 overflow-hidden">
        <MapContainer
          center={center}
          zoom={14}
          className="h-full w-full"
          zoomControl={false}
          attributionControl={false}
          style={{ background: "#0f172a" }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <MapUpdater center={center} isDataComplete={isDataComplete} />

          {/* Incident zone */}
          {isDataComplete && (
            <>
              <Circle
                center={center}
                radius={300}
                pathOptions={{
                  color: isCritical ? "#ef4444" : "#f59e0b",
                  fillColor: isCritical ? "#ef4444" : "#f59e0b",
                  fillOpacity: 0.08,
                  weight: 2,
                  opacity: 0.5,
                  dashArray: "8 6",
                }}
              />
              <Circle
                center={center}
                radius={150}
                pathOptions={{
                  color: isCritical ? "#ef4444" : "#f59e0b",
                  fillColor: isCritical ? "#ef4444" : "#f59e0b",
                  fillOpacity: 0.15,
                  weight: 1,
                  opacity: 0.6,
                }}
              />
              <Marker position={center} icon={incidentIcon}>
                <Popup className="tactical-popup">
                  <div className="text-xs font-bold uppercase">{isCritical ? "🔴 CRITICAL ZONE" : "🟡 INCIDENT ZONE"}</div>
                  {location && <div className="text-[10px] mt-1 text-slate-400">{location}</div>}
                </Popup>
              </Marker>
            </>
          )}

          {/* Live unit markers */}
          {units.map((unit) => {
            const pos = displayPos(unit);
            if (!pos) return null;
            const vc = vehicleCfg(unit.vehicle_type);
            const sc = statusCfg(unit.status);
            return (
              <Marker
                key={unit.unit_id}
                position={pos}
                icon={unitIcons[unit.unit_id]}
                eventHandlers={{
                  click: () => setSelectedUnit(selectedUnit === unit.unit_id ? null : unit.unit_id),
                }}
              >
                <Popup className="tactical-popup">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold" style={{ color: vc.color }}>{shortCode(unit.unit_id)}</span>
                    <span className="text-[10px] text-slate-400">{vc.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded"
                      style={{ color: sc.color, backgroundColor: `${sc.color}22` }}
                    >
                      {sc.label}
                    </span>
                    {unit.assigned_severity && (
                      <span className="text-[9px] text-slate-400">on {unit.assigned_severity}</span>
                    )}
                  </div>
                  {unit.eta_minutes != null && (
                    <div className="flex items-center gap-1 text-[10px]">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span className="font-bold text-white">ETA: {unit.eta_minutes}m</span>
                    </div>
                  )}
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Vignette overlay for theme blend */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-slate-950/30 via-transparent to-slate-950/50 z-[400]" />
      </div>

      {/* Footer - Unit Legend */}
      <div className="p-4 bg-slate-900/50 border-t border-slate-700/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 live-dot" />
            <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider">Live Tracking</span>
            <span className="text-[10px] text-slate-500">· {availableCount}/{units.length} available</span>
          </div>
          {isDataComplete && (
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider animate-pulse">Incident Active</span>
            </div>
          )}
        </div>

        {/* Unit Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {units.length === 0 && (
            <span className="text-[10px] text-slate-600 py-2">Connecting to unit feed…</span>
          )}
          {units.map((unit) => {
            const vc = vehicleCfg(unit.vehicle_type);
            const sc = statusCfg(unit.status);
            const UnitIcon = vc.icon;
            const isSelected = selectedUnit === unit.unit_id;
            return (
              <button
                key={unit.unit_id}
                onClick={() => setSelectedUnit(isSelected ? null : unit.unit_id)}
                title={`${vc.label} · ${sc.label}`}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all shrink-0 border ${
                  isSelected ? 'border-current/30' : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
                }`}
                style={isSelected ? { color: vc.color, backgroundColor: `${vc.color}20` } : { color: "#94a3b8" }}
              >
                <UnitIcon className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold">{shortCode(unit.unit_id)}</span>
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: sc.color, boxShadow: `0 0 6px ${sc.color}` }}
                  title={sc.label}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
