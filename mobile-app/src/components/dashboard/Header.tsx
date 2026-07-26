import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AlertTriangle, Clock, Users, Wifi } from 'lucide-react-native';
import { colors, fontFamily, fontSize } from '../../theme';
import { Odometer } from './Odometer';
import { LiveDot } from '../ui/LiveDot';

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

function formatDate(date: Date) {
  return date
    .toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    .toUpperCase();
}

export function Header() {
  const [time, setTime] = useState(new Date());
  const [latency] = useState(24);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.header}>
      <View style={styles.topRow}>
        <View style={styles.brandRow}>
          <View style={styles.logoWrap}>
            <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
          </View>
          <View>
            <View style={styles.titleRow}>
              <Text style={styles.title}>
                RESQ<Text style={styles.titleAccent}>DESK</Text>
              </Text>
              <View style={styles.versionPill}>
                <Text style={styles.versionText}>v2.0</Text>
              </View>
            </View>
            <Text style={styles.subtitle}>EMERGENCY RESPONSE SYSTEM</Text>
          </View>
        </View>

        <View style={styles.timeBlock}>
          <View style={styles.dateRow}>
            <Clock size={12} color={colors.slate[500]} />
            <Text style={styles.dateText}>{formatDate(time)}</Text>
          </View>
          <Odometer value={formatTime(time)} />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statusRow}>
        <View style={[styles.pill, styles.pillOnline]}>
          <LiveDot color={colors.emerald[500]} size={8} />
          <Text style={[styles.pillText, { color: colors.emerald[400] }]}>SYSTEM ONLINE</Text>
        </View>

        <View style={styles.pillNeutral}>
          <Wifi size={13} color={colors.cyan[400]} />
          <Text style={styles.pillTextMuted}>
            <Text style={{ color: colors.cyan[400], fontFamily: fontFamily.sansSemibold }}>{latency}ms</Text>
          </Text>
        </View>

        <View style={styles.pillNeutral}>
          <Users size={13} color={colors.amber[400]} />
          <Text style={styles.pillTextMuted}>
            Active: <Text style={{ color: colors.amber[400], fontFamily: fontFamily.sansSemibold }}>03</Text>
          </Text>
        </View>

        <View style={[styles.pill, styles.pillCritical]}>
          <AlertTriangle size={13} color={colors.red[400]} />
          <Text style={[styles.pillText, { color: colors.red[400] }]}>0 ALERTS</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: 'rgba(17, 17, 16, 0.4)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(42, 42, 39, 0.5)',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexShrink: 1,
  },
  logoWrap: {
    width: 38,
    height: 38,
  },
  logo: {
    width: 38,
    height: 38,
    resizeMode: 'contain',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: fontFamily.sansBold,
    fontSize: fontSize.lg,
    color: colors.foreground,
    letterSpacing: -0.3,
  },
  titleAccent: {
    color: colors.cyan[300],
  },
  versionPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: 'rgba(194,194,203,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(194,194,203,0.3)',
  },
  versionText: {
    fontFamily: fontFamily.sansBold,
    fontSize: 9,
    color: colors.cyan[400],
  },
  subtitle: {
    fontFamily: fontFamily.sansMedium,
    fontSize: 10,
    letterSpacing: 0.8,
    color: colors.slate[500],
    marginTop: 2,
  },
  timeBlock: {
    alignItems: 'flex-end',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  dateText: {
    fontFamily: fontFamily.sansMedium,
    fontSize: 10,
    letterSpacing: 0.8,
    color: colors.slate[500],
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  pillNeutral: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(26,26,24,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(42,42,39,0.5)',
  },
  pillOnline: {
    backgroundColor: 'rgba(16,185,129,0.1)',
    borderColor: 'rgba(16,185,129,0.2)',
  },
  pillCritical: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderColor: 'rgba(239,68,68,0.2)',
  },
  pillText: {
    fontFamily: fontFamily.sansSemibold,
    fontSize: 11,
  },
  pillTextMuted: {
    fontFamily: fontFamily.sans,
    fontSize: 11,
    color: colors.slate[400],
  },
});
