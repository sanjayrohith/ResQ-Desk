import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, fontFamily, radius } from '../../theme';

interface GradientButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'danger' | 'amber';
  label: string;
  icon?: React.ReactNode;
  loading?: boolean;
}

const GRADIENTS: Record<string, [string, string]> = {
  primary: [colors.cyan[500], colors.cyan[600]],
  danger: [colors.red[500], colors.red[600]],
  amber: [colors.amber[500], colors.amber[600]],
};

export function GradientButton({
  variant = 'primary',
  label,
  icon,
  loading,
  style,
  disabled,
  ...rest
}: GradientButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={disabled || loading}
      style={[style, (disabled || loading) && styles.disabled]}
      {...rest}>
      <LinearGradient
        colors={GRADIENTS[variant]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.button}>
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          icon
        )}
        <Text style={styles.label}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: radius.xl,
  },
  label: {
    fontFamily: fontFamily.sansBold,
    fontSize: 14,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: '#fff',
  },
  disabled: {
    opacity: 0.6,
  },
});
