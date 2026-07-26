import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  Ambulance,
  ArrowRight,
  CheckCircle2,
  Clock,
  Flame,
  MapPin,
  Navigation,
  Repeat,
  Ship,
  ShieldAlert,
  Siren,
  Truck,
  XCircle,
  AlertTriangle,
  Zap,
} from 'lucide-react-native';
import { colors, fontFamily, fontSize } from '../../theme';
import { Panel } from '../ui/Panel';
import { GradientButton } from '../ui/GradientButton';
import { useCountUp } from '../../hooks/useCountUp';
import { reallocateUnit } from '../../api/client';
import { IncidentData } from '../../api/types';

function shortCode(unitId: string) {
  const parts = unitId.trim().split(/\s+/);
  return parts[parts.length - 1] || unitId;
}

function vehicleIcon(unitId: string) {
  const u = unitId.toLowerCase();
  if (u.includes('fire')) return Flame;
  if (u.includes('boat') || u.includes('rescue')) return Ship;
  if (u.includes('ambulance')) return Ambulance;
  return Truck;
}

export function DispatchPopup({
  data,
  onCancel,
  onComplete,
}: {
  data: IncidentData;
  onCancel: () => void;
  onComplete: () => void;
}) {
  const reallocation = data?.reallocation || null;
  const isReallocation = !!reallocation;

  const [count, setCount] = useState(3);
  const [dispatched, setDispatched] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const displayUnit = isReallocation ? reallocation!.unit_id : data?.suggested_unit || 'A12';
  const etaValue = isReallocation && reallocation?.eta_minutes != null ? reallocation.eta_minutes : 6;
  const animatedEta = Math.round(useCountUp(etaValue, 1000));

  const spin1 = useRef(new Animated.Value(0)).current;
  const spin2 = useRef(new Animated.Value(0)).current;
  const spin3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loops = [
      Animated.loop(Animated.timing(spin1, { toValue: 1, duration: 8000, easing: Easing.linear, useNativeDriver: true })),
      Animated.loop(Animated.timing(spin2, { toValue: 1, duration: 6000, easing: Easing.linear, useNativeDriver: true })),
      Animated.loop(Animated.timing(spin3, { toValue: 1, duration: 4000, easing: Easing.linear, useNativeDriver: true })),
    ];
    loops.forEach(l => l.start());
    return () => loops.forEach(l => l.stop());
  }, [spin1, spin2, spin3]);

  useEffect(() => {
    if (isReallocation || dispatched) return;
    let timer: ReturnType<typeof setTimeout>;
    if (count > 0) {
      timer = setTimeout(() => setCount(count - 1), 1000);
    } else {
      setDispatched(true);
    }
    return () => clearTimeout(timer);
  }, [count, isReallocation, dispatched]);

  useEffect(() => {
    if (!dispatched) return;
    const t = setTimeout(() => onComplete(), 2000);
    return () => clearTimeout(t);
  }, [dispatched, onComplete]);

  const handleConfirmReallocation = async () => {
    setConfirming(true);
    try {
      await reallocateUnit({
        unit_id: reallocation!.unit_id,
        incident_id: data?.incident_id,
        severity: data?.severity,
      });
    } catch (e) {
      console.error('Reallocation failed:', e);
    } finally {
      setConfirming(false);
      setDispatched(true);
    }
  };

  const progressPercentage = (count / 3) * 100;
  const VehicleIcon = vehicleIcon(displayUnit);

  const spinDeg = (v: Animated.Value, reverse = false) =>
    v.interpolate({ inputRange: [0, 1], outputRange: reverse ? ['360deg', '0deg'] : ['0deg', '360deg'] });

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onCancel} />

        <View style={styles.modalWrap}>
          <Panel glow style={styles.panel}>
            <View
              style={[
                styles.topBar,
                { backgroundColor: dispatched ? colors.emerald[500] : isReallocation ? colors.amber[500] : colors.cyan[500] },
              ]}
            />

            {dispatched ? (
              <View style={styles.successBody}>
                <View style={styles.successIconWrap}>
                  <CheckCircle2 size={56} color={colors.emerald[400]} />
                </View>
                <Text style={styles.successTitle}>{isReallocation ? 'Reallocated' : 'Dispatched'}</Text>
                <View style={styles.successPill}>
                  <Zap size={14} color={colors.emerald[400]} />
                  <Text style={styles.successPillText}>{shortCode(displayUnit)} En Route</Text>
                </View>
                <Text style={styles.closingText}>Closing automatically...</Text>
              </View>
            ) : isReallocation ? (
              <View style={styles.body}>
                <View style={styles.headerRow}>
                  <View style={styles.headerLeft}>
                    <View style={styles.amberIconChip}>
                      <Repeat size={18} color={colors.amber[400]} />
                    </View>
                    <View style={{ flexShrink: 1 }}>
                      <Text style={styles.headerTitle}>Reallocation Required</Text>
                      <Text style={styles.headerSub}>Priority Override · Confirm to proceed</Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={onCancel} style={styles.closeBtn}>
                    <XCircle size={18} color={colors.slate[500]} />
                  </TouchableOpacity>
                </View>

                <View style={styles.unitHero}>
                  <View style={styles.unitHeroIconWrap}>
                    <VehicleIcon size={26} color={colors.amber[400]} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.smallLabel}>Reassigning Unit</Text>
                    <Text style={styles.unitHeroText} numberOfLines={1}>{displayUnit}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.smallLabel}>ETA</Text>
                    <View style={styles.etaRow}>
                      <Text style={styles.etaValue}>{animatedEta}</Text>
                      <Text style={styles.etaUnit}>MIN</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.transferRow}>
                  <View style={styles.leavingCard}>
                    <Text style={styles.transferLabel}>Leaving</Text>
                    <Text style={styles.transferValue} numberOfLines={1}>
                      {reallocation?.from_incident || '—'}
                    </Text>
                    <View style={styles.transferBadgeNeutral}>
                      <Text style={styles.transferBadgeTextNeutral}>{reallocation?.from_severity || 'Normal'}</Text>
                    </View>
                  </View>

                  <ArrowRight size={16} color="rgba(245,158,11,0.6)" />

                  <View style={styles.targetCard}>
                    <Text style={styles.transferLabelRed}>New Target</Text>
                    <View style={styles.targetLocRow}>
                      <MapPin size={11} color={colors.red[400]} />
                      <Text style={styles.transferValueLight} numberOfLines={1}>
                        {data.location || 'Incident'}
                      </Text>
                    </View>
                    <View style={styles.transferBadgeRed}>
                      <ShieldAlert size={11} color={colors.red[300]} />
                      <Text style={styles.transferBadgeTextRed}>
                        {reallocation?.to_severity || data.severity || 'Critical'}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.consequenceNote}>
                  <AlertTriangle size={16} color={colors.amber[400]} />
                  <Text style={styles.consequenceText}>
                    No free unit of this type is available. Confirming will pull{' '}
                    <Text style={styles.consequenceStrong}>{shortCode(displayUnit)}</Text> off its{' '}
                    {(reallocation?.from_severity || 'normal').toLowerCase()}-priority job, which will be returned to
                    the dispatch queue.
                  </Text>
                </View>

                <View style={styles.actionsRow}>
                  <TouchableOpacity style={styles.keepBtn} onPress={onCancel} disabled={confirming}>
                    <XCircle size={16} color={colors.slate[400]} />
                    <Text style={styles.keepBtnText}>Keep Current</Text>
                  </TouchableOpacity>
                  <View style={styles.confirmBtnWrap}>
                    <GradientButton
                      variant="amber"
                      label={confirming ? 'Reallocating…' : 'Confirm & Redeploy'}
                      icon={<Repeat size={16} color="#0f0f0f" />}
                      loading={confirming}
                      onPress={handleConfirmReallocation}
                    />
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.body}>
                <View style={styles.headerRow}>
                  <View style={styles.headerLeft}>
                    <View style={styles.redIconChip}>
                      <Siren size={18} color={colors.red[400]} />
                    </View>
                    <View>
                      <Text style={styles.headerTitle}>Auto-Dispatch</Text>
                      <Text style={styles.headerSub}>Initiating unit deployment</Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={onCancel} style={styles.closeBtn}>
                    <XCircle size={18} color={colors.slate[500]} />
                  </TouchableOpacity>
                </View>

                <View style={styles.countdownWrap}>
                  <Animated.View style={[styles.ring1, { transform: [{ rotate: spinDeg(spin1) }] }]} />
                  <Animated.View style={[styles.ring2, { transform: [{ rotate: spinDeg(spin2, true) }] }]} />
                  <Animated.View style={[styles.ring3, { transform: [{ rotate: spinDeg(spin3) }] }]} />
                  <View style={styles.countdownCore}>
                    <Text style={styles.countdownText}>{count}</Text>
                  </View>
                </View>

                <View style={styles.unitInfoCard}>
                  <View style={styles.unitInfoRow}>
                    <View>
                      <Text style={styles.smallLabel}>Assigning Unit</Text>
                      <View style={styles.unitInfoNameRow}>
                        <Text style={styles.unitInfoName}>{displayUnit}</Text>
                        <View style={styles.etaChip}>
                          <Clock size={13} color={colors.cyan[400]} />
                          <Text style={styles.etaChipText}>{animatedEta} MIN ETA</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.navIconChip}>
                      <Navigation size={22} color={colors.cyan[400]} />
                    </View>
                  </View>
                  <View style={styles.divider} />
                  <View>
                    <Text style={styles.smallLabel}>Target Location</Text>
                    <View style={styles.targetLocationRow}>
                      <MapPin size={15} color={colors.red[400]} />
                      <Text style={styles.targetLocationText}>{data.location || 'Target coordinates pending...'}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.progressSection}>
                  <View style={styles.progressHeaderRow}>
                    <Text style={styles.progressLabel}>Dispatch Progress</Text>
                    <Text style={styles.progressCount}>{count}s</Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${100 - progressPercentage}%` }]} />
                  </View>
                </View>

                <TouchableOpacity style={styles.abortBtn} onPress={onCancel}>
                  <AlertTriangle size={16} color={colors.red[400]} />
                  <Text style={styles.abortBtnText}>Abort Dispatch</Text>
                </TouchableOpacity>
              </View>
            )}
          </Panel>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(8,8,7,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalWrap: { width: '100%', maxWidth: 480 },
  panel: { width: '100%' },
  topBar: { height: 4, width: '100%' },
  body: { padding: 24, gap: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, marginRight: 8 },
  amberIconChip: { padding: 10, borderRadius: 12, backgroundColor: 'rgba(245,158,11,0.15)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)' },
  redIconChip: { padding: 8, borderRadius: 12, backgroundColor: 'rgba(239,68,68,0.2)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
  headerTitle: { fontFamily: fontFamily.sansBold, fontSize: fontSize.lg, color: colors.foreground },
  headerSub: { fontFamily: fontFamily.sansMedium, fontSize: 11, letterSpacing: 0.6, color: 'rgba(251,191,36,0.8)', marginTop: 2, textTransform: 'uppercase' },
  closeBtn: { padding: 8, borderRadius: 12 },

  unitHero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderRadius: 16,
    padding: 16,
    backgroundColor: 'rgba(26,26,24,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(42,42,39,0.5)',
  },
  unitHeroIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(245,158,11,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallLabel: { fontFamily: fontFamily.sansMedium, fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.slate[500] },
  unitHeroText: { fontFamily: fontFamily.sansBold, fontSize: fontSize['2xl'], color: colors.foreground, marginTop: 2 },
  etaRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  etaValue: { fontFamily: fontFamily.sansBold, fontSize: fontSize['2xl'], color: colors.amber[400] },
  etaUnit: { fontFamily: fontFamily.sansSemibold, fontSize: 12, color: 'rgba(251,191,36,0.7)' },

  transferRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  leavingCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    backgroundColor: 'rgba(17,17,16,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(42,42,39,0.4)',
    opacity: 0.9,
  },
  targetCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  transferLabel: { fontFamily: fontFamily.sansSemibold, fontSize: 9, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.slate[500], marginBottom: 6 },
  transferLabelRed: { fontFamily: fontFamily.sansSemibold, fontSize: 9, letterSpacing: 0.8, textTransform: 'uppercase', color: 'rgba(248,113,113,0.8)', marginBottom: 6 },
  transferValue: { fontFamily: fontFamily.mono, fontSize: 12, color: colors.slate[300] },
  transferValueLight: { fontFamily: fontFamily.sans, fontSize: 12, color: colors.slate[200], flexShrink: 1 },
  targetLocRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  transferBadgeNeutral: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(42,42,39,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(69,68,64,0.4)',
  },
  transferBadgeTextNeutral: { fontFamily: fontFamily.sansBold, fontSize: 10, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.slate[300] },
  transferBadgeRed: {
    marginTop: 8,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(239,68,68,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.4)',
  },
  transferBadgeTextRed: { fontFamily: fontFamily.sansBold, fontSize: 10, letterSpacing: 0.6, textTransform: 'uppercase', color: '#fca5a5' },

  consequenceNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: 'rgba(245,158,11,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.2)',
  },
  consequenceText: { flex: 1, fontFamily: fontFamily.sans, fontSize: 11, lineHeight: 16, color: colors.slate[400] },
  consequenceStrong: { fontFamily: fontFamily.sansSemibold, color: colors.slate[200] },

  actionsRow: { flexDirection: 'row', gap: 12 },
  keepBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(26,26,24,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(42,42,39,0.5)',
  },
  keepBtnText: { fontFamily: fontFamily.sansSemibold, fontSize: 12, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.slate[400] },
  confirmBtnWrap: { flex: 1.6 },

  countdownWrap: { alignSelf: 'center', width: 176, height: 176, alignItems: 'center', justifyContent: 'center', marginVertical: 16 },
  ring1: { position: 'absolute', width: 176, height: 176, borderRadius: 88, borderWidth: 1, borderColor: 'rgba(194,194,203,0.2)' },
  ring2: { position: 'absolute', width: 144, height: 144, borderRadius: 72, borderWidth: 1, borderColor: 'rgba(194,194,203,0.3)' },
  ring3: { position: 'absolute', width: 112, height: 112, borderRadius: 56, borderWidth: 2, borderColor: 'rgba(194,194,203,0.4)', borderStyle: 'dashed' },
  countdownCore: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(194,194,203,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(194,194,203,0.3)',
  },
  countdownText: { fontFamily: fontFamily.sansBold, fontSize: fontSize['6xl'], color: colors.foreground },

  unitInfoCard: {
    borderRadius: 16,
    padding: 20,
    gap: 16,
    backgroundColor: 'rgba(17,17,16,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(42,42,39,0.5)',
  },
  unitInfoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  unitInfoNameRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 },
  unitInfoName: { fontFamily: fontFamily.sansBold, fontSize: fontSize['2xl'], color: colors.foreground },
  etaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(194,194,203,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(194,194,203,0.3)',
  },
  etaChipText: { fontFamily: fontFamily.sansSemibold, fontSize: 12, color: colors.cyan[400] },
  navIconChip: { padding: 12, borderRadius: 12, backgroundColor: 'rgba(194,194,203,0.1)', borderWidth: 1, borderColor: 'rgba(194,194,203,0.2)' },
  divider: { height: 1, backgroundColor: 'rgba(42,42,39,0.5)' },
  targetLocationRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 8 },
  targetLocationText: { flex: 1, fontFamily: fontFamily.sans, fontSize: 13, lineHeight: 18, color: colors.slate[300] },

  progressSection: { gap: 8 },
  progressHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  progressLabel: { fontFamily: fontFamily.sansMedium, fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.slate[500] },
  progressCount: { fontFamily: fontFamily.mono, fontSize: 12, color: colors.cyan[400] },
  progressTrack: { height: 8, width: '100%', borderRadius: 4, backgroundColor: colors.slate[800], overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: colors.cyan[400] },

  abortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  abortBtnText: { fontFamily: fontFamily.sansSemibold, fontSize: 12, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.red[400] },

  successBody: { paddingVertical: 48, paddingHorizontal: 24, alignItems: 'center' },
  successIconWrap: {
    padding: 24,
    borderRadius: 999,
    backgroundColor: 'rgba(16,185,129,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
    marginBottom: 24,
  },
  successTitle: { fontFamily: fontFamily.sansBold, fontSize: fontSize['3xl'], letterSpacing: -0.5, textTransform: 'uppercase', color: colors.foreground, marginBottom: 12 },
  successPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(16,185,129,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
  },
  successPillText: { fontFamily: fontFamily.sansMedium, fontSize: 13, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.emerald[400] },
  closingText: { fontFamily: fontFamily.sans, fontSize: 12, color: colors.slate[500], marginTop: 24 },
});
