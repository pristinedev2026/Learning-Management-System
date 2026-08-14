import React from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/Card';
import { Tag } from '@/components/StatusPieces';
import { useInstructorCourses } from '@/services/queries';
import { useAuthStore } from '@/store/authStore';
import { colors, spacing, typography } from '@/theme/tokens';
import { Ionicons } from '@expo/vector-icons';

export function DashboardScreen() {
  const user = useAuthStore((s) => s.user);
  const { data: courses, isLoading } = useInstructorCourses(user?.id ?? '');

  const totalStudents = courses?.reduce((sum, c) => sum + c.studentCount, 0) ?? 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={typography.display}>Welcome back{user ? `, ${user.name.split(' ')[0]}` : ''}</Text>

        <View style={styles.statsRow}>
          <StatCard label="Courses" value={courses?.length ?? 0} icon="library-outline" />
          <StatCard label="Students" value={totalStudents} icon="people-outline" />
          <StatCard label="To grade" value={0} tone="progress" icon="time-outline" />
        </View>

        <Text style={[typography.subtitle, styles.sectionTitle]}>Your courses</Text>
        {isLoading ? (
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
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: number;
  tone?: 'progress';
  icon: any;
}) {
  return (
    <Card style={styles.statCard}>
      <Ionicons name={icon} size={24} color={tone === 'progress' ? colors.progress : colors.primary} />
      <Text style={[typography.display, tone === 'progress' && styles.statValueProgress]}>
        {value}
      </Text>
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
});
