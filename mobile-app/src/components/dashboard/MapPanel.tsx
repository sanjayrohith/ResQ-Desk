import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Circle, Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import {
  AlertCircle,
  Flame,
  Heart,
  Loader2,
  Map as MapIcon,
  Navigation2,
  Ship,
  Truck,
} from 'lucide-react-native';
import { colors, fontFamily } from '../../theme';
import { PanelHeader } from '../ui/PanelHeader';
import { LiveDot } from '../ui/LiveDot';
import { fetchUnits, geocodeLocation } from '../../api/client';
import { LiveUnit } from '../../api/types';
import { DARK_MAP_STYLE } from './mapStyle';

const FALLBACK_CENTER = { latitude: 40.7128, longitude: -74.006 };
const POLL_MS = 4000;
const MAX_DISPLAY_KM = 8;

const VEHICLE_CONFIG: Record<string, { color: string; Icon: typeof Heart; label: string }> = {
  AMBULANCE: { color: colors.cyan[400], Icon: Heart, label: 'Ambulance' },
  FIRE_ENGINE: { color: colors.orange[500], Icon: Flame, label: 'Fire Engine' },
  RESCUE_BOAT: { color: colors.purple[500], Icon: Ship, label: 'Rescue Boat' },
};
const DEFAULT_VEHICLE = { color: colors.slate[500], Icon: Truck, label: 'Unit' };

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  AVAILABLE: { color: colors.emerald[500], label: 'Available' },
  EN_ROUTE: { color: colors.cyan[400], label: 'En Route' },
  ON_SCENE: { color: colors.amber[500], label: 'On Scene' },
  RETURNING: { color: colors.slate[500], label: 'Returning' },
};

const vehicleCfg = (t: string) => VEHICLE_CONFIG[t] || DEFAULT_VEHICLE;
const statusCfg = (s: string) => STATUS_CONFIG[s] || STATUS_CONFIG.AVAILABLE;

function shortCode(unitId: string) {
  const parts = unitId.trim().split(/\s+/);
  return parts[parts.length - 1] || unitId;
}

function bearingFor(unitId: string) {
  let h = 0;
  for (let i = 0; i < unitId.length; i++) h = (h * 31 + unitId.charCodeAt(i)) >>> 0;
  return (h % 360) * (Math.PI / 180);
}

function offsetKm(center: { latitude: number; longitude: number }, km: number, bearing: number) {
  const dLat = (km / 111) * Math.cos(bearing);
  const dLng = (km / (111 * Math.cos((center.latitude * Math.PI) / 180))) * Math.sin(bearing);
  return { latitude: center.latitude + dLat, longitude: center.longitude + dLng };
}

export function MapPanel({
  severity,
  isDataComplete,
  location,
}: {
  severity: string;
  isDataComplete: boolean;
  location?: string;
}) {
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [units, setUnits] = useState<LiveUnit[]>([]);
  const [incidentCenter, setIncidentCenter] = useState<{ latitude: number; longitude: number } | null>(null);
  const [geocoding, setGeocoding] = useState(false);

  const isCritical = (severity || '').toLowerCase() === 'critical';
  const mapRef = useRef<MapView>(null);
  const geoCache = useRef<Record<string, { latitude: number; longitude: number }>>({});

  const anchor = incidentCenter || FALLBACK_CENTER;

  useEffect(() => {
    if (!isDataComplete || !location || location === 'Awaiting data...') {
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
        const result = await geocodeLocation(location);
        if (!active) return;
        const c = result ? { latitude: result.lat, longitude: result.lng } : FALLBACK_CENTER;
        geoCache.current[key] = c;
        setIncidentCenter(c);
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

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await fetchUnits();
        if (active) setUnits(data);
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

  const unitBase = useMemo(() => {
    const map: Record<string, { latitude: number; longitude: number }> = {};
    units.forEach(u => {
      const km = Math.min(Math.max(u.distance_km ?? 3, 0.4), MAX_DISPLAY_KM);
      map[u.unit_id] = offsetKm(anchor, km, bearingFor(u.unit_id));
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [units.map(u => `${u.unit_id}:${u.distance_km}`).join(','), anchor.latitude, anchor.longitude]);

  useEffect(() => {
    if (!incidentCenter) return;
    const points = [incidentCenter, ...Object.values(unitBase)];
    if (points.length > 0) {
      mapRef.current?.fitToCoordinates(points, {
        edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
        animated: true,
      });
    }
  }, [incidentCenter, unitBase]);

  const availableCount = units.filter(u => u.status === 'AVAILABLE').length;
  const inbound = units.filter(u => u.status === 'EN_ROUTE');
  const assigned = inbound[0];

  return (
    <View style={styles.container}>
      <PanelHeader
        icon={
          <View style={styles.iconChip}>
            <MapIcon size={16} color={colors.cyan[400]} />
          </View>
        }
        title="TACTICAL MAP"
        right={
          isDataComplete && location ? (
            <View style={styles.locChip}>
              {geocoding ? (
                <Loader2 size={12} color={colors.cyan[400]} />
              ) : (
                <AlertCircle size={12} color={isCritical ? colors.red[400] : colors.amber[400]} />
              )}
              <Text style={styles.locChipText} numberOfLines={1}>
                {location}
              </Text>
            </View>
          ) : undefined
        }
      />

      <View style={styles.mapWrap}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          provider={PROVIDER_GOOGLE}
          customMapStyle={DARK_MAP_STYLE}
          initialRegion={{
            latitude: FALLBACK_CENTER.latitude,
            longitude: FALLBACK_CENTER.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}>
          {incidentCenter && (
            <>
              <Circle
                center={incidentCenter}
                radius={300}
                strokeColor={isCritical ? colors.red[500] : colors.amber[500]}
                fillColor={`${isCritical ? colors.red[500] : colors.amber[500]}22`}
              />
              <Marker coordinate={incidentCenter} title={isCritical ? 'CRITICAL ZONE' : 'INCIDENT ZONE'} description={location}>
                <View style={[styles.incidentMarker, { backgroundColor: isCritical ? colors.red[500] : colors.amber[500] }]} />
              </Marker>
            </>
          )}

          {incidentCenter &&
            units.map(u => {
              if (u.status !== 'EN_ROUTE' || !unitBase[u.unit_id]) return null;
              return (
                <Polyline
                  key={`route-${u.unit_id}`}
                  coordinates={[unitBase[u.unit_id], incidentCenter]}
                  strokeColor={statusCfg(u.status).color}
                  strokeWidth={2}
                  lineDashPattern={[6, 8]}
                />
              );
            })}

          {units.map(unit => {
            const pos = unitBase[unit.unit_id];
            if (!pos) return null;
            const sc = statusCfg(unit.status);
            const vc = vehicleCfg(unit.vehicle_type);
            return (
              <Marker
                key={unit.unit_id}
                coordinate={pos}
                title={`${shortCode(unit.unit_id)} · ${vc.label}`}
                description={`${sc.label}${unit.eta_minutes != null ? ` · ${unit.eta_minutes}m` : ''}`}
                onPress={() => setSelectedUnit(selectedUnit === unit.unit_id ? null : unit.unit_id)}>
                <View style={[styles.unitMarker, { backgroundColor: sc.color }]} />
              </Marker>
            );
          })}
        </MapView>

        {isDataComplete && (
          <View style={styles.dispatchOverlay}>
            {assigned ? (
              <View style={styles.overlayRow}>
                <Navigation2 size={16} color={colors.cyan[400]} />
                <View>
                  <Text style={styles.overlayTitle}>{shortCode(assigned.unit_id)} inbound</Text>
                  <Text style={styles.overlaySub}>
                    {assigned.eta_minutes != null ? `${assigned.eta_minutes} min` : 'en route'}
                    {assigned.distance_km != null ? ` · ${assigned.distance_km} km` : ''}
                    {inbound.length > 1 ? ` · +${inbound.length - 1} more` : ''}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.overlayRow}>
                <AlertCircle size={16} color={colors.amber[400]} />
                <Text style={styles.overlaySub}>Awaiting dispatch confirmation</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.legend}>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <View key={key} style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: cfg.color }]} />
              <Text style={styles.legendText}>{cfg.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.footerHeader}>
          <View style={styles.footerLeft}>
            <LiveDot color={colors.cyan[400]} size={8} />
            <Text style={styles.footerTitle}>Live Fleet</Text>
            <Text style={styles.footerSub}>
              · {availableCount}/{units.length} available
            </Text>
          </View>
          {inbound.length > 0 && (
            <View style={styles.footerLeft}>
              <Navigation2 size={14} color={colors.cyan[400]} />
              <Text style={styles.inboundText}>{inbound.length} inbound</Text>
            </View>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.unitRow}>
          {units.length === 0 && <Text style={styles.connectingText}>Connecting to unit feed…</Text>}
          {units.map(unit => {
            const vc = vehicleCfg(unit.vehicle_type);
            const sc = statusCfg(unit.status);
            const isSelected = selectedUnit === unit.unit_id;
            return (
              <TouchableOpacity
                key={unit.unit_id}
                onPress={() => setSelectedUnit(isSelected ? null : unit.unit_id)}
                style={[
                  styles.unitChip,
                  isSelected ? { backgroundColor: `${vc.color}20`, borderColor: `${vc.color}80` } : styles.unitChipDefault,
                ]}>
                <vc.Icon size={14} color={isSelected ? vc.color : colors.slate[400]} />
                <Text style={[styles.unitChipText, { color: isSelected ? vc.color : colors.slate[400] }]}>
                  {shortCode(unit.unit_id)}
                </Text>
                <View style={[styles.unitChipDot, { backgroundColor: sc.color }]} />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  iconChip: { padding: 6, borderRadius: 10, backgroundColor: 'rgba(194,194,203,0.2)' },
  locChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(26,26,24,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(42,42,39,0.5)',
    maxWidth: 160,
  },
  locChipText: { fontFamily: fontFamily.sansMedium, fontSize: 10, color: colors.slate[300] },
  mapWrap: { flex: 1, position: 'relative' },
  incidentMarker: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  unitMarker: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  dispatchOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    maxWidth: '70%',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(17,17,16,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(42,42,39,0.5)',
  },
  overlayRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  overlayTitle: { fontFamily: fontFamily.sansBold, fontSize: 11, color: colors.foreground },
  overlaySub: { fontFamily: fontFamily.sans, fontSize: 9, color: colors.slate[400] },
  legend: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
    backgroundColor: 'rgba(17,17,16,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(42,42,39,0.5)',
  },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontFamily: fontFamily.sans, fontSize: 9, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.slate[400] },
  footer: {
    padding: 16,
    backgroundColor: 'rgba(17,17,16,0.5)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(42,42,39,0.3)',
  },
  footerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  footerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  footerTitle: { fontFamily: fontFamily.sansSemibold, fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.slate[300] },
  footerSub: { fontFamily: fontFamily.sans, fontSize: 10, color: colors.slate[500] },
  inboundText: { fontFamily: fontFamily.sansBold, fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.cyan[400] },
  unitRow: { flexDirection: 'row', gap: 8 },
  connectingText: { fontFamily: fontFamily.sans, fontSize: 10, color: colors.slate[600], paddingVertical: 8 },
  unitChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  unitChipDefault: {
    backgroundColor: 'rgba(26,26,24,0.5)',
    borderColor: 'rgba(42,42,39,0.5)',
  },
  unitChipText: { fontFamily: fontFamily.sansSemibold, fontSize: 12 },
  unitChipDot: { width: 6, height: 6, borderRadius: 3 },
});
