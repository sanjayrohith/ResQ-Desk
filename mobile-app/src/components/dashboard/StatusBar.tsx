import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily } from '../../theme';
import { LiveDot } from '../ui/LiveDot';

export function BottomStatusBar() {
  return (
    <View style={styles.bar}>
      <View style={styles.side}>
        <View style={styles.item}>
          <LiveDot color={colors.emerald[500]} size={6} />
          <Text style={styles.text}>SYSTEM OPERATIONAL</Text>
        </View>
      </View>
      <Text style={styles.textDim}>ResQ-Desk v2.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(17,17,16,0.5)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(42,42,39,0.3)',
  },
  side: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  text: { fontFamily: fontFamily.mono, fontSize: 9, letterSpacing: 0.6, color: colors.slate[400] },
  textDim: { fontFamily: fontFamily.mono, fontSize: 9, color: colors.slate[500] },
});
