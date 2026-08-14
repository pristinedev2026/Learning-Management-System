import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '@/theme/tokens';
import { Ionicons } from '@expo/vector-icons';

type Tone = 'progress' | 'success' | 'danger' | 'info' | 'neutral';

const toneColors: Record<Tone, { bg: string; fg: string; icon?: any }> = {
  progress: { bg: '#F6E9D8', fg: colors.progress, icon: 'time-outline' },
  success: { bg: '#DCEFEC', fg: colors.success, icon: 'checkmark-circle-outline' },
  danger: { bg: '#F5E1DC', fg: colors.danger, icon: 'alert-circle-outline' },
  info: { bg: '#DEEAF6', fg: colors.info, icon: 'information-circle-outline' },
  neutral: { bg: colors.gray100, fg: colors.gray700 },
};

export function Tag({ label, tone = 'neutral', showIcon = true }: { label: string; tone?: Tone; showIcon?: boolean }) {
  const t = toneColors[tone];
  return (
    <View
      style={[styles.tag, { backgroundColor: t.bg }]}
      accessible
      accessibilityLabel={label}
    >
      <View style={styles.tagContent}>
        {showIcon && t.icon && (
          <Ionicons name={t.icon} size={12} color={t.fg} style={{ marginRight: 4 }} />
        )}
        <Text style={[styles.tagLabel, { color: t.fg }]}>{label}</Text>
      </View>
    </View>
  );
}

export function ProgressBar({ percent }: { percent: number }) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <View
      style={styles.track}
      accessible
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: clamped }}
    >
      <View style={[styles.fill, { width: `${clamped}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
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
