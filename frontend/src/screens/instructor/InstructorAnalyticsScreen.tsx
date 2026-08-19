import React from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/Card';
import { useInstructorAnalytics } from '@/services/queries';
import { useAuthStore } from '@/store/authStore';
import { colors, spacing, typography } from '@/theme/tokens';

export function InstructorAnalyticsScreen() {
  const user = useAuthStore((s) => s.user);
  const { data: analytics, isLoading } = useInstructorAnalytics(user?.id ?? '');

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator style={styles.loader} color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={typography.display}>Instructor Analytics</Text>
        <Text style={styles.subtitle}>Insights into your course performance.</Text>

        <Text style={[typography.subtitle, styles.sectionTitle]}>Course Engagement</Text>
        {analytics?.courseEngagement.map((item) => (
          <Card key={item.id} style={styles.engagementCard}>
            <View style={styles.engagementHeader}>
              <Text style={typography.subtitle}>{item.title}</Text>
              <Text style={styles.studentCount}>{item.students} students</Text>
            </View>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${item.completionRate}%` }]} />
              </View>
              <Text style={styles.progressText}>{item.completionRate}% avg. completion</Text>
            </View>
          </Card>
        ))}

        <Text style={[typography.subtitle, styles.sectionTitle]}>Recent Activity (Last 7 Days)</Text>
        <Card style={styles.trendCard}>
          {analytics?.activityTrend.map((item) => (
            <View key={item.date} style={styles.trendRow}>
              <Text style={styles.trendDate}>{new Date(item.date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })}</Text>
              <View style={styles.trendBarContainer}>
                 <View style={[styles.trendBar, { width: `${Math.min(item.completions * 5, 100)}%` }]} />
              </View>
              <Text style={styles.trendValue}>{item.completions} lessons</Text>
            </View>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  subtitle: { ...typography.body, color: colors.inkMuted, marginBottom: spacing.lg },
  loader: { marginTop: spacing.xxl },
  sectionTitle: { marginTop: spacing.lg, marginBottom: spacing.md },
  engagementCard: { marginBottom: spacing.sm, gap: spacing.sm },
  engagementHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  studentCount: { ...typography.caption, color: colors.inkMuted },
  progressContainer: { gap: 4 },
  progressBar: { height: 8, backgroundColor: colors.gray200, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary },
  progressText: { ...typography.caption, color: colors.inkMuted },
  trendCard: { padding: spacing.md },
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginVertical: 4 },
  trendDate: { width: 60, ...typography.caption },
  trendBarContainer: { flex: 1, height: 12, backgroundColor: colors.gray100, borderRadius: 6, overflow: 'hidden' },
  trendBar: { height: '100%', backgroundColor: colors.progress, borderRadius: 6 },
  trendValue: { width: 60, ...typography.caption, textAlign: 'right' },
});
