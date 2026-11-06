import { useState, useEffect, useRef, useMemo } from "react";
import { Flame, Truck, Heart, Ship, Navigation2, Loader2 } from "lucide-react";
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

// Fallback center (Chennai, Tamil Nadu) used only if geocoding fails.
const FALLBACK_CENTER: [number, number] = [13.0827, 80.2707];
const TRAVEL_MS = 30000; // visual travel time for an EN_ROUTE unit
const POLL_MS = 4000;
const MAX_DISPLAY_KM = 8; // clamp far units so the scene stays framed

const API_URL = import.meta.env.VITE_API_URL || "https://resq-backend-9585.onrender.com";

const CRIT = "#e5484d";
const SIGNAL = "#e8a33d";
const BASE = "#141415";

// Vehicle type is told apart by icon. Color is reserved for status.
const VEHICLE_CONFIG: Record<string, { icon: typeof Heart; label: string }> = {
  AMBULANCE: { icon: Heart, label: "Ambulance" },
  FIRE_ENGINE: { icon: Flame, label: "Fire engine" },
  RESCUE_BOAT: { icon: Ship, label: "Rescue boat" },
};
const DEFAULT_VEHICLE = { icon: Truck, label: "Unit" };

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  AVAILABLE: { color: "#4cc38a", label: "Available" },
  EN_ROUTE: { color: SIGNAL, label: "En route" },
  ON_SCENE: { color: "#ededed", label: "On scene" },
  RETURNING: { color: "#85858b", label: "Returning" },
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

function createUnitIcon(statusColor: string) {
  return L.divIcon({
    className: "",
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${statusColor};border:2px solid ${BASE};"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function createIncidentIcon(isCritical: boolean) {
  const color = isCritical ? CRIT : SIGNAL;
  return L.divIcon({
    className: "",
    html: `<div style="width:18px;height:18px;border-radius:50%;background:${color};border:3px solid ${BASE};"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
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
    if (!isDataComplete || !location || location === "Awaiting data") {
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
      icons[u.unit_id] = createUnitIcon(s.color);
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

  const zoneColor = isCritical ? CRIT : SIGNAL;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="panel-header">
        <span className="panel-title">Map</span>
        {isDataComplete && location && (
          <div className="flex max-w-[60%] items-center gap-2 text-sm text-ink-2">
            {geocoding && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-ink-3" />}
            <span className="truncate">{location}</span>
          </div>
        )}
      </div>

      <div className="relative flex-1 overflow-hidden">
        <MapContainer
          center={FALLBACK_CENTER}
          zoom={13}
          className="h-full w-full"
          zoomControl={false}
          attributionControl={false}
          style={{ background: BASE }}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          <MapController incidentCenter={incidentCenter} bounds={bounds} focus={focusPos} />

          {/* Incident zone at the geocoded location */}
          {incidentCenter && (
            <>
              <Circle center={incidentCenter} radius={300} pathOptions={{ color: zoneColor, fillColor: zoneColor, fillOpacity: 0.06, weight: 1, opacity: 0.6, dashArray: "6 6" }} />
              <Marker position={incidentCenter} icon={incidentIcon}>
                <Popup className="tactical-popup">
                  <div className="text-sm font-medium">{isCritical ? "Critical zone" : "Incident zone"}</div>
                  {location && <div className="text-xs text-ink-3">{location}</div>}
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
                pathOptions={{ color: SIGNAL, weight: 2, opacity: 0.7, dashArray: "6 8" }}
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
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-sm font-medium">{shortCode(unit.unit_id)}</span>
                    <span className="text-xs text-ink-3">{vc.label}</span>
                  </div>
                  <div className="mb-1 flex items-center gap-2 text-xs">
                    <span className="dot" style={{ backgroundColor: sc.color }} />
                    <span>{sc.label}</span>
                    {unit.assigned_severity && <span className="text-ink-3">on {unit.assigned_severity.toLowerCase()}</span>}
                  </div>
                  <div className="meta flex items-center gap-3">
                    {unit.eta_minutes != null && <span className="text-ink">{unit.eta_minutes} min</span>}
                    {unit.distance_km != null && <span>{unit.distance_km} km</span>}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Dispatch summary */}
        {isDataComplete && (
          <div className="absolute left-4 top-4 z-[500] max-w-[70%] rounded-lg border border-line bg-surface px-3 py-2">
            {assigned ? (
              <div className="flex items-center gap-3">
                <Navigation2 className="h-4 w-4 shrink-0 text-signal" />
                <div>
                  <div className="text-sm font-medium text-ink">{shortCode(assigned.unit_id)} inbound</div>
                  <div className="meta">
                    {assigned.eta_minutes != null ? `${assigned.eta_minutes} min` : "en route"}
                    {assigned.distance_km != null ? ` · ${assigned.distance_km} km` : ""}
                    {inbound.length > 1 ? ` · +${inbound.length - 1} more` : ""}
                  </div>
                </div>
              </div>
            ) : (
              <span className="text-sm text-ink-2">Awaiting dispatch confirmation</span>
            )}
          </div>
        )}

        {/* Status legend */}
        <div className="absolute bottom-4 right-4 z-[500] flex flex-col gap-1 rounded-lg border border-line bg-surface px-3 py-2">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-2">
              <span className="dot" style={{ backgroundColor: cfg.color }} />
              <span className="text-xs text-ink-2">{cfg.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Fleet */}
      <div className="shrink-0 border-t border-line p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-baseline gap-3">
            <span className="text-sm font-medium text-ink">Fleet</span>
            <span className="meta">{availableCount}/{units.length} available</span>
          </div>
          {inbound.length > 0 && (
            <span className="meta text-signal">{inbound.length} inbound</span>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {units.length === 0 && <span className="py-2 text-sm text-ink-3">Connecting to unit feed</span>}
          {units.map((unit) => {
            const vc = vehicleCfg(unit.vehicle_type);
            const sc = statusCfg(unit.status);
            const UnitIcon = vc.icon;
            const isSelected = selectedUnit === unit.unit_id;
            return (
              <button
                key={unit.unit_id}
                onClick={() => setSelectedUnit(isSelected ? null : unit.unit_id)}
                title={`${vc.label} · ${sc.label}. Click to locate`}
                className={`flex h-8 shrink-0 items-center gap-2 rounded-lg border px-3 transition-colors duration-150 ${
                  isSelected
                    ? "border-line-strong bg-raised text-ink"
                    : "border-line text-ink-2 hover:border-line-strong hover:text-ink"
                }`}
              >
                <UnitIcon className="h-4 w-4 text-ink-3" />
                <span className="text-sm font-medium">{shortCode(unit.unit_id)}</span>
                <span className="dot" style={{ backgroundColor: sc.color }} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
