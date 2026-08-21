import React from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, View, RefreshControl } from 'react-native';
import { Card } from '@/components/Card';
import { Tag } from '@/components/StatusPieces';
import { useInstructorCourses, useInstructorStats, useInstructorStudents } from '@/services/queries';
import { useAuthStore } from '@/store/authStore';
import { colors, spacing, typography } from '@/theme/tokens';
import { Ionicons } from '@expo/vector-icons';

export function DashboardScreen() {
  const user = useAuthStore((s) => s.user);
  const { data: courses, isLoading: loadingCourses, refetch: refetchCourses } = useInstructorCourses(user?.id ?? '');
  const { data: stats, isLoading: loadingStats, refetch: refetchStats } = useInstructorStats(user?.id ?? '');
  const { data: students, isLoading: loadingStudents, refetch: refetchStudents } = useInstructorStudents(user?.id ?? '');

  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchCourses(), refetchStats(), refetchStudents()]);
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={typography.display}>Welcome back{user ? `, ${user.name.split(' ')[0]}` : ''}</Text>

        <View style={styles.statsRow}>
          <StatCard
            label="Courses"
            value={stats?.totalCourses ?? 0}
            icon="library-outline"
            loading={loadingStats}
          />
          <StatCard
            label="Students"
            value={stats?.totalStudents ?? 0}
            icon="people-outline"
            loading={loadingStats}
          />
          <StatCard
            label="To grade"
            value={stats?.toGrade ?? 0}
            tone="progress"
            icon="time-outline"
            loading={loadingStats}
          />
        </View>

        <Text style={[typography.subtitle, styles.sectionTitle]}>Your courses</Text>
        {loadingCourses ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          courses?.map((course) => (
            <Card key={course.id} style={styles.courseCard}>
              <Text style={typography.subtitle}>{course.title}</Text>
              <Text style={styles.courseMeta}>
                {course.studentCount.toLocaleString()} students · {course.modules.length} modules
              </Text>
              <Tag label={course.category} tone="info" />
            </Card>
          ))
        )}

        <Text style={[typography.subtitle, styles.sectionTitle]}>Enrolled students</Text>
        {loadingStudents ? (
          <ActivityIndicator color={colors.primary} />
        ) : students && students.length > 0 ? (
          students.map((student) => (
            <Card key={student.id} style={styles.studentCard}>
              <View style={styles.studentContent}>
                <Ionicons name="person-circle-outline" size={32} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={typography.subtitle}>{student.name}</Text>
                  <Text style={styles.studentMeta} numberOfLines={1}>
                    {student.enrolledCourses.join(', ')}
                  </Text>
                </View>
              </View>
            </Card>
          ))
        ) : (
          <View style={styles.card}>
             <Text style={typography.caption}>No students found.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({
  label,
  value,
  tone,
  icon,
  loading,
}: {
  label: string;
  value: number;
  tone?: 'progress';
  icon: any;
  loading?: boolean;
}) {
  return (
    <Card style={styles.statCard}>
      <Ionicons name={icon} size={24} color={tone === 'progress' ? colors.progress : colors.primary} />
      {loading ? (
        <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 8 }} />
      ) : (
        <Text style={[typography.display, tone === 'progress' && styles.statValueProgress]}>
          {value}
        </Text>
      )}
      <Text style={typography.caption}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: spacing.md },
  statValueProgress: { color: colors.progress },
  sectionTitle: { marginTop: spacing.xl, marginBottom: spacing.sm },
  courseCard: { marginBottom: spacing.sm, gap: spacing.xs, alignItems: 'flex-start' },
  courseMeta: { ...typography.caption },
  studentCard: { marginBottom: spacing.sm },
  studentContent: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  studentMeta: { ...typography.caption, color: colors.inkMuted },
});
