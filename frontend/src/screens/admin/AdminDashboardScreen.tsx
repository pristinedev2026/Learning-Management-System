import React from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/Card';
import { useAdminStats } from '@/services/queries';
import { colors, spacing, typography } from '@/theme/tokens';
import { Ionicons } from '@expo/vector-icons';

export function AdminDashboardScreen() {
  const { data: stats, isLoading } = useAdminStats();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={typography.display}>Platform Overview</Text>
        <Text style={styles.subtitle}>System-wide statistics and activity.</Text>

        <View style={styles.statsGrid}>
          <StatCard
            label="Total Users"
            value={stats?.totalUsers ?? 0}
            icon="people-outline"
            loading={isLoading}
          />
          <StatCard
            label="Total Courses"
            value={stats?.totalCourses ?? 0}
            icon="library-outline"
            loading={isLoading}
          />
          <StatCard
            label="Enrollments"
            value={stats?.totalEnrollments ?? 0}
            icon="school-outline"
            loading={isLoading}
          />
          <StatCard
            label="Submissions"
            value={stats?.totalSubmissions ?? 0}
            icon="document-text-outline"
            loading={isLoading}
          />
        </View>

        <Text style={[typography.subtitle, styles.sectionTitle]}>User Roles</Text>
        <View style={styles.roleGrid}>
          <RoleCard label="Students" count={stats?.roles?.student ?? 0} icon="person-outline" color={colors.primary} loading={isLoading} />
          <RoleCard label="Instructors" count={stats?.roles?.instructor ?? 0} icon="briefcase-outline" color={colors.progress} loading={isLoading} />
          <RoleCard label="Admins" count={stats?.roles?.admin ?? 0} icon="shield-checkmark-outline" color={colors.info} loading={isLoading} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({
  label,
  value,
  icon,
  loading,
}: {
  label: string;
  value: number;
  icon: any;
  loading?: boolean;
}) {
  return (
    <Card style={styles.statCard}>
      <Ionicons name={icon} size={28} color={colors.primary} />
      {loading ? (
        <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 8 }} />
      ) : (
        <Text style={typography.display}>{value.toLocaleString()}</Text>
      )}
      <Text style={typography.caption}>{label}</Text>
    </Card>
  );
}

function RoleCard({ label, count, icon, color, loading }: { label: string; count: number; icon: any; color: string; loading?: boolean }) {
  return (
    <Card style={styles.roleCard}>
      <View style={[styles.roleIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View>
        <Text style={typography.subtitle}>{label}</Text>
        {loading ? (
           <ActivityIndicator size="small" color={color} style={{ alignSelf: 'flex-start', marginTop: 4 }} />
        ) : (
          <Text style={styles.roleCount}>{count.toLocaleString()} registered</Text>
        )}
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  subtitle: { ...typography.body, color: colors.inkMuted, marginTop: spacing.xs, marginBottom: spacing.lg },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  statCard: { width: '47%', alignItems: 'center', paddingVertical: spacing.lg },
  sectionTitle: { marginTop: spacing.xl, marginBottom: spacing.md },
  roleGrid: { gap: spacing.sm },
  roleCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md },
  roleIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  roleCount: { ...typography.caption, color: colors.inkMuted },
});
