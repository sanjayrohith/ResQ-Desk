import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily } from '../../theme';

const DIGIT_HEIGHT = 34;

function OdometerDigit({ digit }: { digit: number }) {
  const translateY = useRef(new Animated.Value(-digit * DIGIT_HEIGHT)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: -digit * DIGIT_HEIGHT,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [digit, translateY]);

  return (
    <View style={styles.digitMask}>
      <Animated.View style={{ transform: [{ translateY }] }}>
        {Array.from({ length: 10 }, (_, n) => (
          <View key={n} style={styles.cell}>
            <Text style={styles.digitText}>{n}</Text>
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

/** Rolling-digit clock display — RN port of frontend Odometer.tsx. */
export function Odometer({ value }: { value: string }) {
  return (
    <View style={styles.row}>
      {value.split('').map((ch, i) =>
        /\d/.test(ch) ? (
          <OdometerDigit key={i} digit={Number(ch)} />
        ) : (
          <Text key={i} style={styles.sep}>
            {ch}
          </Text>
        ),
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  digitMask: { height: DIGIT_HEIGHT, width: 20, overflow: 'hidden' },
  cell: { height: DIGIT_HEIGHT, alignItems: 'center', justifyContent: 'center' },
  digitText: {
    fontFamily: fontFamily.monoBold,
    fontSize: 26,
    color: colors.foreground,
  },
  sep: {
    fontFamily: fontFamily.monoBold,
    fontSize: 26,
    color: colors.foreground,
    marginHorizontal: 1,
  },
});
