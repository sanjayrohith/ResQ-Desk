import React from 'react';
import { StyleSheet, View, Text, ViewProps } from 'react-native';
import { colors, fontFamily, radius } from '../../theme';

interface DataCellProps extends ViewProps {
  active?: boolean;
}

export function DataCell({ active, style, children, ...rest }: DataCellProps) {
  return (
    <View style={[styles.cell, active && styles.cellActive, style]} {...rest}>
      {children}
    </View>
  );
}

export function DataLabel({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.labelRow}>
      {icon}
      <Text style={styles.label}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cell: {
    padding: 16,
    borderRadius: radius.xl,
    backgroundColor: 'rgba(17, 17, 16, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(42, 42, 39, 0.3)',
  },
  cellActive: {
    backgroundColor: 'rgba(17, 17, 16, 0.5)',
    borderColor: 'rgba(194, 194, 203, 0.3)',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  label: {
    fontFamily: fontFamily.sansMedium,
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.slate[500],
  },
});
