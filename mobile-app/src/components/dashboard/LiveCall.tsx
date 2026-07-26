import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Globe, Lock, Mic, Phone, Radio, Volume2 } from 'lucide-react-native';
import { colors, fontFamily, fontSize } from '../../theme';
import { PanelHeader } from '../ui/PanelHeader';
import { GradientButton } from '../ui/GradientButton';

function formatTime(s: number) {
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function LiveCall({ onPTTChange }: { onPTTChange?: (active: boolean) => void }) {
  const [callTime, setCallTime] = useState(0);
  const [isPTTActive, setIsPTTActive] = useState(false);
  const [signalStrength, setSignalStrength] = useState(85);
  const [language, setLanguage] = useState('TAMIL');

  useEffect(() => {
    const timer = setInterval(() => {
      setCallTime(t => t + 1);
      setSignalStrength(prev => Math.min(100, Math.max(40, prev + (Math.random() > 0.5 ? 2 : -2))));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePTT = (active: boolean) => {
    setIsPTTActive(active);
    onPTTChange?.(active);
  };

  const signalBars = Math.ceil(signalStrength / 25);

  return (
    <View style={styles.container}>
      <PanelHeader
        icon={
          <View style={[styles.iconChip, { backgroundColor: isPTTActive ? 'rgba(239,68,68,0.2)' : 'rgba(194,194,203,0.2)' }]}>
            <Radio size={16} color={isPTTActive ? colors.red[400] : colors.cyan[400]} />
          </View>
        }
        title="COMMS LINK"
        right={
          <View style={styles.encryptedRow}>
            <Lock size={12} color={colors.emerald[400]} />
            <Text style={styles.encryptedText}>ENCRYPTED</Text>
          </View>
        }
      />

      <View style={styles.content}>
        <View style={styles.channelRow}>
          <View style={styles.channelLeft}>
            <View style={[styles.phoneChip, isPTTActive && styles.phoneChipActive]}>
              <Phone size={20} color={isPTTActive ? colors.red[400] : colors.cyan[400]} />
            </View>
            <View>
              <Text style={[styles.channelName, isPTTActive && { color: colors.red[400] }]}>
                {isPTTActive ? 'TRANSMITTING...' : 'SECURE_CH01'}
              </Text>
              <Text style={styles.channelSub}>PRIMARY FREQUENCY</Text>
            </View>
          </View>

          <View style={styles.signalCol}>
            <View style={styles.signalBars}>
              {[1, 2, 3, 4].map(bar => (
                <View
                  key={bar}
                  style={[
                    styles.signalBar,
                    { height: bar * 4, backgroundColor: bar <= signalBars ? colors.cyan[400] : colors.slate[700] },
                  ]}
                />
              ))}
            </View>
            <Text style={styles.signalPct}>{signalStrength}%</Text>
          </View>
        </View>

        <View style={[styles.timerBox, isPTTActive && styles.timerBoxActive]}>
          <Text style={[styles.timerText, isPTTActive && { color: colors.red[400] }]}>{formatTime(callTime)}</Text>
          <Text style={[styles.timerLabel, isPTTActive && { color: 'rgba(248,113,113,0.6)' }]}>SESSION DURATION</Text>
        </View>

        <View style={styles.statsRow}>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => setLanguage(prev => (prev === 'TAMIL' ? 'ENGLISH' : 'TAMIL'))}>
            <View style={styles.statIconChip}>
              <Globe size={16} color={colors.slate[400]} />
            </View>
            <View>
              <Text style={styles.statLabel}>Language</Text>
              <Text style={styles.statValue}>{language}</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.statCard}>
            <View style={styles.statIconChip}>
              <Volume2 size={16} color={colors.slate[400]} />
            </View>
            <View>
              <Text style={styles.statLabel}>Audio</Text>
              <Text style={[styles.statValue, { color: colors.emerald[400] }]}>CLEAR</Text>
            </View>
          </View>
        </View>

        <View style={styles.pttWrap}>
          <GradientButton
            variant={isPTTActive ? 'danger' : 'primary'}
            label={isPTTActive ? 'RELEASE TO LISTEN' : 'PUSH TO TALK'}
            icon={<Mic size={20} color="#fff" />}
            onPressIn={() => handlePTT(true)}
            onPressOut={() => handlePTT(false)}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  iconChip: { padding: 6, borderRadius: 10 },
  encryptedRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  encryptedText: { fontFamily: fontFamily.sansMedium, fontSize: 10, color: colors.emerald[400] },
  content: { flex: 1, padding: 20, gap: 16 },
  channelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  channelLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flexShrink: 1 },
  phoneChip: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(194,194,203,0.1)',
  },
  phoneChipActive: {
    backgroundColor: 'rgba(239,68,68,0.2)',
  },
  channelName: { fontFamily: fontFamily.sansBold, fontSize: fontSize.lg, color: colors.foreground },
  channelSub: { fontFamily: fontFamily.sansMedium, fontSize: 10, color: colors.slate[500], marginTop: 2 },
  signalCol: { alignItems: 'flex-end', gap: 4 },
  signalBars: { flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: 16 },
  signalBar: { width: 6, borderRadius: 2 },
  signalPct: { fontFamily: fontFamily.sans, fontSize: 9, color: colors.slate[500] },
  timerBox: {
    borderRadius: 16,
    paddingVertical: 24,
    alignItems: 'center',
    backgroundColor: 'rgba(17,17,16,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(42,42,39,0.3)',
  },
  timerBoxActive: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderColor: 'rgba(239,68,68,0.3)',
  },
  timerText: {
    fontFamily: fontFamily.monoBold,
    fontSize: fontSize['5xl'],
    color: colors.foreground,
  },
  timerLabel: {
    fontFamily: fontFamily.sansSemibold,
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: 'rgba(194,194,203,0.6)',
    marginTop: 8,
  },
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(17,17,16,0.3)',
    borderWidth: 1,
    borderColor: 'rgba(42,42,39,0.3)',
  },
  statIconChip: { padding: 8, borderRadius: 8, backgroundColor: 'rgba(26,26,24,0.5)' },
  statLabel: { fontFamily: fontFamily.sansMedium, fontSize: 9, textTransform: 'uppercase', color: colors.slate[500] },
  statValue: { fontFamily: fontFamily.sansSemibold, fontSize: 14, color: colors.foreground, marginTop: 2 },
  pttWrap: { marginTop: 'auto' },
});
