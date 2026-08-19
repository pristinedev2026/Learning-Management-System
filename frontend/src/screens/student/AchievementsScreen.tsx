import React from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, View, FlatList, Pressable } from 'react-native';
import { Card } from '@/components/Card';
import { useAchievements, useLeaderboard } from '@/services/queries';
import { colors, spacing, typography, radius } from '@/theme/tokens';
import { Ionicons } from '@expo/vector-icons';

export function AchievementsScreen() {
  const { data: achievements, isLoading: loadingAch } = useAchievements();
  const { data: leaderboard, isLoading: loadingLead } = useLeaderboard();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={typography.display}>Achievements</Text>

        {/* Streak Section */}
        <Card style={styles.streakCard}>
          <View style={styles.streakIcon}>
            <Ionicons name="flame" size={32} color={colors.warning} />
          </View>
          <View>
            <Text style={typography.title}>{achievements?.streak ?? 0} Day Streak</Text>
            <Text style={typography.caption}>Keep learning every day to grow your streak!</Text>
          </View>
        </Card>

        {/* Badges Section */}
        <Text style={[typography.subtitle, styles.sectionTitle]}>Your Badges</Text>
        {loadingAch ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <View style={styles.badgeGrid}>
            {achievements?.badges.map((badge) => (
              <View key={badge.id} style={styles.badgeItem}>
                <View style={styles.badgeIcon}>
                  <Ionicons name={badge.icon as any} size={32} color={colors.primary} />
                </View>
                <Text style={styles.badgeName}>{badge.name}</Text>
              </View>
            ))}
            {achievements?.badges.length === 0 && (
              <Text style={styles.emptyText}>No badges earned yet. Keep learning!</Text>
            )}
          </View>
        )}

        {/* Leaderboard Section */}
        <Text style={[typography.subtitle, styles.sectionTitle]}>Leaderboard</Text>
        {loadingLead ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <Card style={styles.leaderboardCard}>
            {leaderboard?.map((item, index) => (
              <View key={item.id} style={[styles.leaderboardRow, index === leaderboard.length - 1 && { borderBottomWidth: 0 }]}>
                <Text style={styles.rank}>#{index + 1}</Text>
                <View style={styles.userInfo}>
                  <Text style={typography.body}>{item.name}</Text>
                  <Text style={typography.caption}>{item._count.badges} badges</Text>
                </View>
                <View style={styles.streakInfo}>
                  <Ionicons name="flame" size={16} color={colors.warning} />
                  <Text style={styles.streakText}>{item.streakCount}</Text>
                </View>
              </View>
            ))}
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  sectionTitle: { marginTop: spacing.xl, marginBottom: spacing.md },
  streakCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg },
  streakIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.warning + '20', alignItems: 'center', justifyContent: 'center' },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  badgeItem: { width: '30%', alignItems: 'center', gap: spacing.xs },
  badgeIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primaryMuted, alignItems: 'center', justifyContent: 'center' },
  badgeName: { ...typography.caption, textAlign: 'center', fontWeight: 'bold' },
  emptyText: { ...typography.caption, color: colors.inkMuted },
  leaderboardCard: { padding: 0 },
  leaderboardRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  rank: { width: 30, ...typography.subtitle, color: colors.primary },
  userInfo: { flex: 1 },
  streakInfo: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  streakText: { ...typography.body, fontWeight: 'bold' },
});
