import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { colors, radius } from '../../theme';

interface PanelProps extends ViewProps {
  critical?: boolean;
  glow?: boolean;
}

/** Glassmorphic card — RN port of the web app's `.panel` / `.panel-glow` / `.panel-critical` classes. */
export function Panel({ style, critical, children, ...rest }: PanelProps) {
  return (
    <View
      style={[styles.panel, critical && styles.panelCritical, style]}
      {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: radius['2xl'],
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.panelBorder,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 8,
  },
  panelCritical: {
    borderColor: 'rgba(239, 68, 68, 0.3)',
    shadowColor: colors.red[500],
    shadowOpacity: 0.3,
  },
});
