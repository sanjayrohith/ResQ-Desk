import { useState, useEffect, useRef, useMemo } from "react";
import { Flame, Map as MapIcon, Truck, Heart, Clock, AlertCircle, Ship, Navigation2, Loader2 } from "lucide-react";
import { MapContainer, TileLayer, Marker, Circle, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";

interface MapPanelProps {
  severity: string;
  isDataComplete: boolean;
  location?: string;
}

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

// Fallback center (New York City) used only if geocoding fails.
const FALLBACK_CENTER: [number, number] = [40.7128, -74.006];
const TRAVEL_MS = 30000; // visual travel time for an EN_ROUTE unit
const POLL_MS = 4000;
const MAX_DISPLAY_KM = 8; // clamp far units so the scene stays framed

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

const vehicleCfg = (t: string) => VEHICLE_CONFIG[t] || DEFAULT_VEHICLE;
const statusCfg = (s: string) => STATUS_CONFIG[s] || STATUS_CONFIG.AVAILABLE;

function shortCode(unitId: string): string {
  const parts = unitId.trim().split(/\s+/);
  return parts[parts.length - 1] || unitId;
}

// Deterministic bearing (radians) per unit id, so a unit keeps its position.
function bearingFor(unitId: string): number {
  let h = 0;
  for (let i = 0; i < unitId.length; i++) h = (h * 31 + unitId.charCodeAt(i)) >>> 0;
  return (h % 360) * (Math.PI / 180);
}

// Offset a lat/lng by a distance (km) along a bearing.
function offsetKm(center: [number, number], km: number, bearing: number): [number, number] {
  const dLat = (km / 111) * Math.cos(bearing);
  const dLng = (km / (111 * Math.cos((center[0] * Math.PI) / 180))) * Math.sin(bearing);
  return [center[0] + dLat, center[1] + dLng];
}

function createUnitIcon(statusColor: string, pulse: boolean) {
  const pulseRing = pulse
    ? `<div style="position:absolute;width:30px;height:30px;border-radius:50%;background:${statusColor};opacity:0.35;animation:unitPing 1.6s cubic-bezier(0,0,0.2,1) infinite;"></div>`
    : "";
  return L.divIcon({
    className: "",
    html: `<div style="position:relative;display:flex;align-items:center;justify-content:center;width:16px;height:16px;">
      ${pulseRing}
      <div style="width:16px;height:16px;border-radius:50%;background:${statusColor};border:2px solid rgba(255,255,255,0.7);box-shadow:0 0 12px ${statusColor}88,0 0 4px ${statusColor}44;position:relative;z-index:1;"></div>
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

// Controls the map camera: frames the incident + responders, or a picked unit.
function MapController({
  incidentCenter,
  bounds,
  focus,
}: {
  incidentCenter: [number, number] | null;
  bounds: [number, number][];
  focus: [number, number] | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (focus) {
      map.flyTo(focus, 16, { duration: 1 });
    }
  }, [focus, map]);

  useEffect(() => {
    if (focus) return;
    if (bounds.length >= 2) {
      map.flyToBounds(L.latLngBounds(bounds.map((b) => L.latLng(b[0], b[1]))), {
        padding: [60, 60],
        duration: 1.4,
        maxZoom: 15,
      });
    } else if (incidentCenter) {
      map.flyTo(incidentCenter, 14, { duration: 1.4 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incidentCenter?.[0], incidentCenter?.[1], bounds.length]);

  return null;
}

export function MapPanel({ severity, isDataComplete, location }: MapPanelProps) {
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [units, setUnits] = useState<LiveUnit[]>([]);
  const [tick, setTick] = useState(0);
  const [incidentCenter, setIncidentCenter] = useState<[number, number] | null>(null);
  const [geocoding, setGeocoding] = useState(false);

  const isCritical = severity?.toLowerCase() === "critical";
  const enRouteStart = useRef<Record<string, number>>({});
  const geoCache = useRef<Record<string, [number, number]>>({});

  const incidentIcon = useMemo(() => createIncidentIcon(isCritical), [isCritical]);
  const anchor = incidentCenter || FALLBACK_CENTER;

  // 1) Geocode the AI-extracted location so the incident lands at its real place.
  useEffect(() => {
    if (!isDataComplete || !location || location === "Awaiting data...") {
      setIncidentCenter(null);
      return;
    }
    const key = location.trim().toLowerCase();
    if (geoCache.current[key]) {
      setIncidentCenter(geoCache.current[key]);
      return;
    }
    let active = true;
    setGeocoding(true);
    (async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(location)}`;
        const res = await fetch(url, { headers: { Accept: "application/json" } });
        const data = await res.json();
        if (!active) return;
        if (Array.isArray(data) && data.length > 0) {
          const c: [number, number] = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
          geoCache.current[key] = c;
          setIncidentCenter(c);
        } else {
          setIncidentCenter(FALLBACK_CENTER);
        }
      } catch {
        if (active) setIncidentCenter(FALLBACK_CENTER);
      } finally {
        if (active) setGeocoding(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [location, isDataComplete]);

  // 2) Poll live unit state.
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

  // Animation heartbeat.
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // 3) Anchor each unit around the incident; nearer km => nearer on the map.
  const unitBase = useMemo(() => {
    const map: Record<string, [number, number]> = {};
    units.forEach((u) => {
      const km = Math.min(Math.max(u.distance_km ?? 3, 0.4), MAX_DISPLAY_KM);
      map[u.unit_id] = offsetKm(anchor, km, bearingFor(u.unit_id));
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [units.map((u) => `${u.unit_id}:${u.distance_km}`).join(","), anchor[0], anchor[1]]);

  // Position of a unit right now (interpolated toward incident if EN_ROUTE).
  const displayPos = (u: LiveUnit): [number, number] => {
    const base = unitBase[u.unit_id] || anchor;
    if (u.status !== "EN_ROUTE") return base;
    const start = enRouteStart.current[u.unit_id];
    if (!start) return base;
    void tick; // depend on heartbeat
    const progress = Math.min(0.88, (Date.now() - start) / TRAVEL_MS);
    return [base[0] + (anchor[0] - base[0]) * progress, base[1] + (anchor[1] - base[1]) * progress];
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

  // Camera targets.
  const focusPos = selectedUnit
    ? unitBase[selectedUnit]
      ? displayPos(units.find((u) => u.unit_id === selectedUnit)!)
      : null
    : null;

  const bounds: [number, number][] = useMemo(() => {
    if (!incidentCenter) return [];
    const pts: [number, number][] = [incidentCenter];
    units.forEach((u) => {
      const km = u.distance_km ?? 99;
      // Frame the incident plus responders that are relevant/close.
      if (km <= MAX_DISPLAY_KM || u.status === "EN_ROUTE") {
        pts.push(unitBase[u.unit_id]);
      }
    });
    return pts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incidentCenter?.[0], incidentCenter?.[1], units.length, Object.keys(unitBase).length]);

  const availableCount = units.filter((u) => u.status === "AVAILABLE").length;
  const inbound = units.filter((u) => u.status === "EN_ROUTE");
  const assigned = inbound[0];

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
            {geocoding ? (
              <Loader2 className="w-3 h-3 shrink-0 text-cyan-400 animate-spin" />
            ) : (
              <AlertCircle className={`w-3 h-3 shrink-0 ${isCritical ? 'text-red-400' : 'text-amber-400'}`} />
            )}
            <span className="text-[10px] text-slate-300 font-medium truncate">{location}</span>
          </div>
        )}
      </div>

      {/* Map */}
      <div className="relative flex-1 overflow-hidden">
        <MapContainer
          center={FALLBACK_CENTER}
          zoom={13}
          className="h-full w-full"
          zoomControl={false}
          attributionControl={false}
          style={{ background: "#0f172a" }}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          <MapController incidentCenter={incidentCenter} bounds={bounds} focus={focusPos} />

          {/* Incident zone (at the geocoded location) */}
          {incidentCenter && (
            <>
              <Circle center={incidentCenter} radius={300} pathOptions={{ color: isCritical ? "#ef4444" : "#f59e0b", fillColor: isCritical ? "#ef4444" : "#f59e0b", fillOpacity: 0.08, weight: 2, opacity: 0.5, dashArray: "8 6" }} />
              <Circle center={incidentCenter} radius={150} pathOptions={{ color: isCritical ? "#ef4444" : "#f59e0b", fillColor: isCritical ? "#ef4444" : "#f59e0b", fillOpacity: 0.15, weight: 1, opacity: 0.6 }} />
              <Marker position={incidentCenter} icon={incidentIcon}>
                <Popup className="tactical-popup">
                  <div className="text-xs font-bold uppercase">{isCritical ? "🔴 CRITICAL ZONE" : "🟡 INCIDENT ZONE"}</div>
                  {location && <div className="text-[10px] mt-1 text-slate-400">{location}</div>}
                </Popup>
              </Marker>
            </>
          )}

          {/* Route lines for inbound units */}
          {incidentCenter && units.map((u) => {
            if (u.status !== "EN_ROUTE" || !unitBase[u.unit_id]) return null;
            return (
              <Polyline
                key={`route-${u.unit_id}`}
                positions={[unitBase[u.unit_id], incidentCenter]}
                pathOptions={{ color: statusCfg(u.status).color, weight: 2, opacity: 0.6, dashArray: "6 8" }}
              />
            );
          })}

          {/* Unit markers */}
          {units.map((unit) => {
            const pos = displayPos(unit);
            const vc = vehicleCfg(unit.vehicle_type);
            const sc = statusCfg(unit.status);
            return (
              <Marker
                key={unit.unit_id}
                position={pos}
                icon={unitIcons[unit.unit_id]}
                eventHandlers={{ click: () => setSelectedUnit(selectedUnit === unit.unit_id ? null : unit.unit_id) }}
              >
                <Popup className="tactical-popup">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold" style={{ color: vc.color }}>{shortCode(unit.unit_id)}</span>
                    <span className="text-[10px] text-slate-400">{vc.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ color: sc.color, backgroundColor: `${sc.color}22` }}>{sc.label}</span>
                    {unit.assigned_severity && <span className="text-[9px] text-slate-400">on {unit.assigned_severity}</span>}
                  </div>
                  <div className="flex items-center gap-3 text-[10px]">
                    {unit.eta_minutes != null && (
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-slate-400" /><span className="font-bold text-white">{unit.eta_minutes}m</span></span>
                    )}
                    {unit.distance_km != null && <span className="text-slate-400">{unit.distance_km} km</span>}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Dispatch summary overlay */}
        {isDataComplete && (
          <div className="absolute top-3 left-3 z-[500] rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/50 px-3 py-2 max-w-[70%]">
            {assigned ? (
              <div className="flex items-center gap-2">
                <Navigation2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <div className="leading-tight">
                  <div className="text-[11px] font-bold text-white">{shortCode(assigned.unit_id)} inbound</div>
                  <div className="text-[9px] text-slate-400">
                    {assigned.eta_minutes != null ? `${assigned.eta_minutes} min` : "en route"}
                    {assigned.distance_km != null ? ` · ${assigned.distance_km} km` : ""}
                    {inbound.length > 1 ? ` · +${inbound.length - 1} more` : ""}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-[10px] text-slate-300">Awaiting dispatch confirmation</span>
              </div>
            )}
          </div>
        )}

        {/* Status legend */}
        <div className="absolute bottom-3 right-3 z-[500] rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/50 px-3 py-2 flex flex-col gap-1">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.color, boxShadow: `0 0 6px ${cfg.color}` }} />
              <span className="text-[9px] text-slate-400 uppercase tracking-wider">{cfg.label}</span>
            </div>
          ))}
        </div>

        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-slate-950/30 via-transparent to-slate-950/50 z-[400]" />
      </div>

      {/* Footer - Unit legend / selector */}
      <div className="p-4 bg-slate-900/50 border-t border-slate-700/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 live-dot" />
            <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider">Live Fleet</span>
            <span className="text-[10px] text-slate-500">· {availableCount}/{units.length} available</span>
          </div>
          {inbound.length > 0 && (
            <div className="flex items-center gap-2 text-cyan-400">
              <Navigation2 className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">{inbound.length} inbound</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {units.length === 0 && <span className="text-[10px] text-slate-600 py-2">Connecting to unit feed…</span>}
          {units.map((unit) => {
            const vc = vehicleCfg(unit.vehicle_type);
            const sc = statusCfg(unit.status);
            const UnitIcon = vc.icon;
            const isSelected = selectedUnit === unit.unit_id;
            return (
              <button
                key={unit.unit_id}
                onClick={() => setSelectedUnit(isSelected ? null : unit.unit_id)}
                title={`${vc.label} · ${sc.label} — click to locate`}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all shrink-0 border ${
                  isSelected ? 'border-current/30' : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
                }`}
                style={isSelected ? { color: vc.color, backgroundColor: `${vc.color}20` } : { color: "#94a3b8" }}
              >
                <UnitIcon className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold">{shortCode(unit.unit_id)}</span>
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: sc.color, boxShadow: `0 0 6px ${sc.color}` }} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
