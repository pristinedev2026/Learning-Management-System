import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '@/theme/tokens';

/**
 * Temporary stand-in for screens not yet built out (build order steps 5-10).
 * Swap for the real screen as each part of the app is implemented.
 */
export function PlaceholderScreen({ title, note }: { title: string; note?: string }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={typography.title}>{title}</Text>
        <Text style={styles.note}>{note ?? 'Coming soon in a later build step.'}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  note: {
    ...typography.body,
    color: colors.inkMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
