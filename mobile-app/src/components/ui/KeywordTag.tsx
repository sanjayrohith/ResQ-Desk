import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { colors, fontFamily, radius } from '../../theme';

export function KeywordTag({ children }: { children: React.ReactNode }) {
  return <Text style={styles.tag}>{children}</Text>;
}

const styles = StyleSheet.create({
  tag: {
    fontFamily: fontFamily.sansSemibold,
    fontSize: 11,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: colors.amber[400],
    backgroundColor: 'rgba(245,158,11,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.2)',
    borderRadius: radius.lg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    overflow: 'hidden',
  },
});
