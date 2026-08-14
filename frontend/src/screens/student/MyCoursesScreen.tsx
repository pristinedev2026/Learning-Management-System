import React from 'react';
import { ActivityIndicator, FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Card } from '@/components/Card';
import { ProgressBar, Tag } from '@/components/StatusPieces';
import { useCourseCatalog, useMyEnrollments } from '@/services/queries';
import { useAuthStore } from '@/store/authStore';
import type { Enrollment } from '@/types';
import { colors, spacing, typography } from '@/theme/tokens';
import type { StudentCatalogStackParamList } from '@/navigation/StudentTabs';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<any, 'MyCourses'>;

export function MyCoursesScreen({ navigation }: Props) {
  const user = useAuthStore((s) => s.user);
  const { data: enrollments, isLoading } = useMyEnrollments(user?.id ?? '');
  const { data: allCourses } = useCourseCatalog();

  const courseTitle = (courseId: string) => allCourses?.find((c) => c.id === courseId)?.title ?? '…';

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator style={styles.loader} color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={[typography.display, styles.header]}>My courses</Text>
      <FlatList
        data={enrollments}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={typography.subtitle}>No courses yet</Text>
            <Text style={styles.emptyBody}>Enroll in something from the catalog to get started.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <EnrollmentCard
            enrollment={item}
            title={courseTitle(item.courseId)}
            onPress={() => navigation.getParent()?.navigate('Catalog', {
              screen: 'CourseDetail',
              params: { courseId: item.courseId },
            })}
          />
        )}
      />
    </SafeAreaView>
  );
}

function EnrollmentCard({
  enrollment,
  title,
  onPress,
}: {
  enrollment: Enrollment;
  title: string;
  onPress: () => void;
}) {
  const tone = enrollment.status === 'completed' ? 'success' : 'progress';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${enrollment.progressPercent}% complete`}
      onPress={onPress}
      style={({ pressed }) => [styles.pressable, pressed && { opacity: 0.7 }]}
    >
      <Card style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.titleWithIcon}>
            <Ionicons name="school-outline" size={20} color={colors.primary} style={{ marginRight: spacing.xs }} />
            <Text style={[typography.subtitle, { flex: 1 }]} numberOfLines={1}>
              {title}
            </Text>
          </View>
          <Tag label={enrollment.status === 'completed' ? 'Completed' : 'In progress'} tone={tone} />
        </View>
        <ProgressBar percent={enrollment.progressPercent} />
        <Text style={styles.progressLabel}>{enrollment.progressPercent}% complete</Text>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  pressable: { marginBottom: spacing.md },
  card: { gap: spacing.sm },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  titleWithIcon: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  progressLabel: { ...typography.caption },
  loader: { marginTop: spacing.xxl },
  emptyState: { alignItems: 'center', paddingTop: spacing.xxl, paddingHorizontal: spacing.xl },
  emptyBody: { ...typography.caption, marginTop: spacing.xs, textAlign: 'center' },
});
