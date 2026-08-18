import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

type Tone = 'progress' | 'success' | 'danger' | 'info' | 'neutral';

export function Tag({ label, tone = 'neutral', showIcon = true }: { label: string; tone?: Tone; showIcon?: boolean }) {
  const { colors, radius, spacing, typography } = useTheme();

  const toneColors: Record<Tone, { bg: string; fg: string; icon?: any }> = {
    progress: { bg: colors.isDark ? '#4A3215' : '#F6E9D8', fg: colors.progress, icon: 'time-outline' },
    success: { bg: colors.isDark ? '#123D33' : '#DCEFEC', fg: colors.success, icon: 'checkmark-circle-outline' },
    danger: { bg: colors.isDark ? '#4D1A12' : '#F5E1DC', fg: colors.danger, icon: 'alert-circle-outline' },
    info: { bg: colors.isDark ? '#152C4D' : '#DEEAF6', fg: colors.info, icon: 'information-circle-outline' },
    neutral: { bg: colors.gray100, fg: colors.gray700 },
  };

  const t = toneColors[tone];

  const dynamicStyles = StyleSheet.create({
    tag: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: radius.pill,
      alignSelf: 'flex-start',
    },
    tagContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    tagLabel: {
      ...typography.label,
      letterSpacing: 0.2,
    },
  });

  return (
    <View
      style={[dynamicStyles.tag, { backgroundColor: t.bg }]}
      accessible
      accessibilityLabel={label}
    >
      <View style={dynamicStyles.tagContent}>
        {showIcon && t.icon && (
          <Ionicons name={t.icon} size={12} color={t.fg} style={{ marginRight: 4 }} />
        )}
        <Text style={[dynamicStyles.tagLabel, { color: t.fg }]}>{label}</Text>
      </View>
    </View>
  );
}

export function ProgressBar({ percent }: { percent: number }) {
  const { colors, radius } = useTheme();
  const clamped = Math.max(0, Math.min(100, percent));

  const dynamicStyles = StyleSheet.create({
    track: {
      height: 6,
      borderRadius: radius.pill,
      backgroundColor: colors.gray100,
      overflow: 'hidden',
    },
    fill: {
      height: '100%',
      backgroundColor: colors.success,
      borderRadius: radius.pill,
    },
  });

  return (
    <View
      style={dynamicStyles.track}
      accessible
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: clamped }}
    >
      <View style={[dynamicStyles.fill, { width: `${clamped}%` }]} />
    </View>
  );
}
