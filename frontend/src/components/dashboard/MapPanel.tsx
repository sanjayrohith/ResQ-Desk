import { useState, useEffect, useRef, useMemo } from "react";
import { Flame, Map as MapIcon, Truck, Shield, Heart, Clock, AlertCircle } from "lucide-react";
import { MapContainer, TileLayer, Marker, Circle, Popup, useMap } from "react-leaflet";
import L from "leaflet";

interface MapPanelProps {
  severity: string;
  isDataComplete: boolean;
  location?: string;
}

// Default center (New York City)
const DEFAULT_CENTER: [number, number] = [40.7128, -74.006];

// Generate unit positions offset from center
function getUnitPositions(center: [number, number]) {
  return [
    { id: "A12", label: "Ambulance", eta: "6m", lat: center[0] + 0.008, lng: center[1] + 0.012, color: "#06b6d4", icon: Heart },
    { id: "F07", label: "Fire Unit", eta: "12m", lat: center[0] - 0.006, lng: center[1] + 0.018, color: "#f97316", icon: Flame },
    { id: "P04", label: "Police", eta: "4m", lat: center[0] - 0.005, lng: center[1] - 0.01, color: "#10b981", icon: Shield },
    { id: "R03", label: "Rescue", eta: "9m", lat: center[0] + 0.01, lng: center[1] - 0.008, color: "#a855f7", icon: Truck },
  ];
}

function createUnitIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width: 16px; height: 16px; border-radius: 50%;
      background: ${color}; border: 2px solid rgba(255,255,255,0.6);
      box-shadow: 0 0 12px ${color}88, 0 0 4px ${color}44;
    "></div>`,
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
  const isCritical = severity?.toLowerCase() === "critical";
  const center = DEFAULT_CENTER;
  const units = useMemo(() => getUnitPositions(center), [center]);

  const unitIcons = useMemo(() => {
    const icons: Record<string, L.DivIcon> = {};
    units.forEach(u => { icons[u.id] = createUnitIcon(u.color); });
    return icons;
  }, [units]);

  const incidentIcon = useMemo(() => createIncidentIcon(isCritical), [isCritical]);

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

          {/* Unit markers */}
          {units.map((unit) => (
            <Marker
              key={unit.id}
              position={[unit.lat, unit.lng]}
              icon={unitIcons[unit.id]}
              eventHandlers={{
                click: () => setSelectedUnit(selectedUnit === unit.id ? null : unit.id),
              }}
            >
              <Popup className="tactical-popup">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold" style={{ color: unit.color }}>{unit.id}</span>
                  <span className="text-[10px] text-slate-400">{unit.label}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px]">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span className="font-bold text-white">ETA: {unit.eta}</span>
                </div>
              </Popup>
            </Marker>
          ))}
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
          {units.map((unit) => {
            const UnitIcon = unit.icon;
            const isSelected = selectedUnit === unit.id;
            return (
              <button
                key={unit.id}
                onClick={() => setSelectedUnit(isSelected ? null : unit.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all shrink-0 ${
                  isSelected
                    ? 'border border-current/30'
                    : 'bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:border-slate-600'
                }`}
                style={isSelected ? { color: unit.color, backgroundColor: `${unit.color}20` } : undefined}
              >
                <UnitIcon className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold">{unit.id}</span>
                <span className="text-[10px] opacity-60">{unit.eta}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}