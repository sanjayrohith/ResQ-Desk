import React from 'react';
import { StyleSheet, View, Text, ViewStyle } from 'react-native';
import { colors, fontFamily, radius } from '../../theme';

export type StatusBadgeVariant = 'online' | 'live' | 'critical' | 'warning' | 'neutral';

const VARIANTS: Record<StatusBadgeVariant, { bg: string; text: string; border: string }> = {
  online: { bg: 'rgba(16,185,129,0.1)', text: colors.emerald[400], border: 'rgba(16,185,129,0.2)' },
  live: { bg: 'rgba(194,194,203,0.1)', text: colors.cyan[400], border: 'rgba(194,194,203,0.2)' },
  critical: { bg: 'rgba(239,68,68,0.1)', text: colors.red[400], border: 'rgba(239,68,68,0.2)' },
  warning: { bg: 'rgba(245,158,11,0.1)', text: colors.amber[400], border: 'rgba(245,158,11,0.2)' },
  neutral: { bg: colors.slate[800], text: colors.slate[500], border: colors.slate[700] },
};

export function StatusBadge({
  variant,
  children,
  style,
}: {
  variant: StatusBadgeVariant;
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  const v = VARIANTS[variant];
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: v.bg, borderColor: v.border },
        style,
      ]}>
      <Text style={[styles.text, { color: v.text }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  text: {
    fontFamily: fontFamily.sansSemibold,
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
