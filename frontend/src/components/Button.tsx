import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '@/theme/ThemeContext';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'default' | 'small';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
  tone?: 'ghost'; // Added for compatibility
}

export const Button = React.memo(function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'default',
  disabled,
  loading,
  style,
  accessibilityHint,
  tone,
}: ButtonProps) {
  const { colors, radius, spacing, tapTarget, typography } = useTheme();
  const isDisabled = disabled || loading;

  const finalVariant = tone === 'ghost' ? 'outline' : variant;

  const isSecondary = finalVariant === 'secondary';
  const isOutline = finalVariant === 'outline';

  const dynamicStyles = StyleSheet.create({
    base: {
      minHeight: tapTarget.minHeight,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    small: {
      minHeight: 32,
      paddingHorizontal: spacing.md,
      borderRadius: radius.sm,
    },
    pressed: {
      opacity: 0.85,
    },
    disabled: {
      opacity: 0.5,
    },
    label: {
      ...typography.subtitle,
      color: colors.white,
    },
    labelSmall: {
      ...typography.caption,
      fontWeight: 'bold',
    },
    labelSecondary: {
      color: colors.primary,
    },
  });

  const variantStyles = StyleSheet.create({
    primary: { backgroundColor: colors.primary },
    secondary: { backgroundColor: colors.primaryMuted },
    danger: { backgroundColor: colors.danger },
    outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.primary },
    ghost: { backgroundColor: 'transparent' },
  });

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled }}
      style={({ pressed }) => [
        dynamicStyles.base,
        variantStyles[finalVariant as keyof typeof variantStyles],
        size === 'small' && dynamicStyles.small,
        isDisabled && dynamicStyles.disabled,
        pressed && !isDisabled && dynamicStyles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isSecondary || isOutline ? colors.primary : colors.white} />
      ) : (
        <Text
          style={[
            dynamicStyles.label,
            (isSecondary || isOutline) && dynamicStyles.labelSecondary,
            size === 'small' && dynamicStyles.labelSmall,
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
});
