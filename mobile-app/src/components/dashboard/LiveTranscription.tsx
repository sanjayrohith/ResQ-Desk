import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Activity, Mic, MicOff } from 'lucide-react-native';
import Voice, { SpeechResultsEvent } from '@react-native-voice/voice';
import { colors, fontFamily } from '../../theme';
import { PanelHeader } from '../ui/PanelHeader';
import { StatusBadge } from '../ui/StatusBadge';
import { GradientButton } from '../ui/GradientButton';
import { LiveDot } from '../ui/LiveDot';

interface TranscriptEntry {
  text: string;
  time: string;
  type: 'caller' | 'system' | 'operator';
}

const TYPE_CONFIG: Record<TranscriptEntry['type'], { badgeBg: string; badgeText: string; text: string }> = {
  caller: { badgeBg: 'rgba(42,42,39,0.5)', badgeText: colors.slate[300], text: colors.slate[200] },
  system: { badgeBg: 'rgba(194,194,203,0.2)', badgeText: colors.cyan[400], text: colors.cyan[300] },
  operator: { badgeBg: 'rgba(245,158,11,0.2)', badgeText: colors.amber[400], text: colors.slate[200] },
};

function nowStamp() {
  return new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function LiveTranscription({
  onLineComplete,
  isMuted,
}: {
  onLineComplete: (t: string) => void;
  isMuted: boolean;
}) {
  const [listening, setListening] = useState(false);
  const [liveText, setLiveText] = useState('');
  const [history, setHistory] = useState<TranscriptEntry[]>([
    { text: "There's smoke coming from the second floor...", time: '10:42:15', type: 'caller' },
    { text: 'Keywords detected: SMOKE, FIRE, TRAPPED', time: '10:42:22', type: 'system' },
    { text: 'Please confirm your location, ma’am.', time: '10:42:28', type: 'operator' },
  ]);

  const scrollRef = useRef<ScrollView>(null);
  const commitTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    Voice.onSpeechStart = () => setListening(true);
    Voice.onSpeechEnd = () => setListening(false);
    Voice.onSpeechResults = (e: SpeechResultsEvent) => {
      const text = e.value?.[0] ?? '';
      setLiveText(text);
    };
    Voice.onSpeechError = () => setListening(false);

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  useEffect(() => {
    if (isMuted) {
      setLiveText('');
      return;
    }
  }, [isMuted]);

  useEffect(() => {
    if (!liveText || isMuted) return;
    clearTimeout(commitTimer.current);
    commitTimer.current = setTimeout(() => {
      const entry: TranscriptEntry = { text: liveText, time: nowStamp(), type: 'caller' };
      setHistory(prev => [...prev, entry]);
      onLineComplete(liveText);
      setLiveText('');
    }, 1500);
    return () => clearTimeout(commitTimer.current);
  }, [liveText, isMuted, onLineComplete]);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [history, liveText]);

  const toggleListening = async () => {
    try {
      if (listening) {
        await Voice.stop();
        setListening(false);
      } else {
        await Voice.start('en-US');
      }
    } catch (e) {
      console.error('Voice error:', e);
    }
  };

  return (
    <View style={styles.container}>
      <PanelHeader
        icon={
          <View style={styles.iconChip}>
            <Activity size={16} color={colors.cyan[400]} />
          </View>
        }
        title="LIVE INTEL"
        right={
          <StatusBadge variant={isMuted ? 'critical' : 'live'}>
            {isMuted ? 'BLOCKED' : 'LISTENING'}
          </StatusBadge>
        }
      />

      <View style={styles.waveformSection}>
        <View style={styles.waveformHeaderRow}>
          <View style={styles.waveformLabelRow}>
            <View
              style={[
                styles.waveformDot,
                { backgroundColor: listening && !isMuted ? colors.amber[400] : colors.slate[600] },
              ]}
            />
            <Text style={styles.waveformLabel}>AUDIO SIGNAL</Text>
          </View>
          <Text style={styles.channelTag}>CH-01</Text>
        </View>
        <View style={styles.waveform}>
          {Array.from({ length: 32 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.waveBar,
                {
                  height: listening && !isMuted ? 6 + Math.random() * 34 : 8,
                  backgroundColor: isMuted ? 'rgba(239,68,68,0.3)' : listening ? colors.cyan[400] : colors.slate[700],
                  opacity: listening && !isMuted ? 0.8 : 0.3,
                },
              ]}
            />
          ))}
        </View>
      </View>

      <ScrollView ref={scrollRef} style={styles.log} contentContainerStyle={styles.logContent}>
        {history.map((entry, i) => {
          const cfg = TYPE_CONFIG[entry.type];
          return (
            <View key={i} style={styles.entry}>
              <Text style={styles.entryTime}>{entry.time}</Text>
              <View style={styles.entryBody}>
                <Text style={[styles.entryBadge, { backgroundColor: cfg.badgeBg, color: cfg.badgeText }]}>
                  {entry.type}
                </Text>
                <Text style={[styles.entryText, { color: cfg.text }]}>{entry.text}</Text>
              </View>
            </View>
          );
        })}

        {isMuted && (
          <View style={styles.muteWarning}>
            <View style={styles.muteWarningRow}>
              <MicOff size={16} color={colors.red[400]} />
              <Text style={styles.muteWarningTitle}>OPERATOR OVERRIDE ACTIVE</Text>
            </View>
            <Text style={styles.muteWarningSub}>Caller audio temporarily muted</Text>
          </View>
        )}

        {!!liveText && !isMuted && (
          <View style={styles.liveEntry}>
            <View style={styles.entryTimeLive}>
              <LiveDot color={colors.cyan[400]} size={6} />
              <Text style={styles.entryTimeLiveText}>LIVE</Text>
            </View>
            <View style={styles.entryBody}>
              <Text style={[styles.entryBadge, { backgroundColor: 'rgba(194,194,203,0.2)', color: colors.cyan[400] }]}>
                Listening...
              </Text>
              <Text style={styles.liveEntryText}>{liveText}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <GradientButton
          variant={listening ? 'danger' : 'primary'}
          label={listening ? 'STOP RECORDING' : 'START RECORDING'}
          icon={listening ? <MicOff size={16} color="#fff" /> : <Mic size={16} color="#fff" />}
          onPress={toggleListening}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  iconChip: { padding: 6, borderRadius: 10, backgroundColor: 'rgba(194,194,203,0.2)' },
  waveformSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(42,42,39,0.3)',
    backgroundColor: 'rgba(17,17,16,0.3)',
  },
  waveformHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  waveformLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  waveformDot: { width: 6, height: 6, borderRadius: 3 },
  waveformLabel: { fontFamily: fontFamily.sansSemibold, fontSize: 10, letterSpacing: 0.8, color: colors.amber[400] },
  channelTag: { fontFamily: fontFamily.mono, fontSize: 10, color: colors.slate[500] },
  waveform: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    borderRadius: 12,
    backgroundColor: 'rgba(17,17,16,0.5)',
    paddingHorizontal: 16,
  },
  waveBar: { width: 3, borderRadius: 2 },
  log: { flex: 1 },
  logContent: { padding: 16, gap: 12 },
  entry: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  entryTime: { fontFamily: fontFamily.mono, fontSize: 10, color: colors.slate[600], width: 56, paddingTop: 2 },
  entryBody: { flex: 1 },
  entryBadge: {
    alignSelf: 'flex-start',
    fontFamily: fontFamily.sansBold,
    fontSize: 9,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
    overflow: 'hidden',
  },
  entryText: { fontFamily: fontFamily.sans, fontSize: 14, lineHeight: 20 },
  muteWarning: {
    marginHorizontal: 4,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(239,68,68,0.3)',
    alignItems: 'center',
  },
  muteWarningRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  muteWarningTitle: { fontFamily: fontFamily.sansSemibold, fontSize: 12, letterSpacing: 0.8, color: colors.red[400] },
  muteWarningSub: { fontFamily: fontFamily.sans, fontSize: 10, color: 'rgba(248,113,113,0.6)', marginTop: 4 },
  liveEntry: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(194,194,203,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(194,194,203,0.2)',
  },
  entryTimeLive: { width: 56, flexDirection: 'row', alignItems: 'center', gap: 4, paddingTop: 2 },
  entryTimeLiveText: { fontFamily: fontFamily.mono, fontSize: 10, color: colors.cyan[400] },
  liveEntryText: { fontFamily: fontFamily.sans, fontSize: 14, lineHeight: 20, color: colors.cyan[200], fontStyle: 'italic' },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(42,42,39,0.3)',
    backgroundColor: 'rgba(17,17,16,0.3)',
  },
});
