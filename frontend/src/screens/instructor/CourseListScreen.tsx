import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Alert,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { InstructorCoursesStackParamList } from '@/navigation/InstructorTabs';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useInstructorCourses, useDeleteCourse } from '@/services/queries';
import { useAuthStore } from '@/store/authStore';
import { colors, spacing, typography } from '@/theme/tokens';

type Props = NativeStackScreenProps<InstructorCoursesStackParamList, 'CourseList'>;

/**
 * CourseListScreen
 * Shows instructor's courses with options to create, edit, or delete.
 */
export function CourseListScreen({ navigation }: Props) {
  const user = useAuthStore((s) => s.user);
  const { data: courses, isLoading } = useInstructorCourses(user?.id ?? '');
  const deleteMutation = useDeleteCourse();

  const handleDelete = (courseId: string, title: string) => {
    Alert.alert('Delete Course', `Are you sure you want to delete "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteMutation.mutate(courseId, {
            onSuccess: () => {
              Alert.alert('Success', 'Course deleted');
            },
            onError: (error) => {
              Alert.alert('Error', error instanceof Error ? error.message : 'Failed to delete course');
            },
          });
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator style={styles.loader} color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={typography.display}>My Courses</Text>
        <Button
          label="+ New Course"
          onPress={() => navigation.navigate('CourseEditor', { mode: 'create' })}
          style={styles.createButton}
        />
      </View>

      <FlatList
        data={courses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={typography.subtitle}>No courses yet</Text>
            <Text style={styles.emptyBody}>Create your first course to get started.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Card style={styles.courseCard}>
            <Pressable
              onPress={() =>
                navigation.navigate('CourseDetail', {
                  courseId: item.id,
                  mode: 'edit',
                })
              }
              style={({ pressed }) => [
                styles.courseContent,
                pressed && { opacity: 0.7 },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`${item.title}, ${item.studentCount} students enrolled`}
            >
              <Text style={typography.subtitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.description} numberOfLines={2}>
                {item.description}
              </Text>
              <View style={styles.courseFooter}>
                <Text style={styles.category}>{item.category}</Text>
                <Text style={styles.enrollment}>{item.studentCount} students</Text>
              </View>
            </Pressable>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <Pressable
                onPress={() =>
                  navigation.navigate('CourseEditor', {
                    mode: 'edit',
                    course: item,
                  })
                }
                style={({ pressed }) => [styles.actionButton, pressed && { opacity: 0.7 }]}
                accessibilityRole="button"
                accessibilityLabel="Edit course"
              >
                <Text style={styles.actionText}>✎ Edit</Text>
              </Pressable>
              <Pressable
                onPress={() => handleDelete(item.id, item.title)}
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.deleteButton,
                  pressed && { opacity: 0.7 },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Delete course"
              >
                <Text style={styles.deleteActionText}>🗑 Delete</Text>
              </Pressable>
            </View>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.md },
  createButton: { marginTop: spacing.sm },

  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, gap: spacing.md },

  courseCard: { gap: spacing.md },
  courseContent: { gap: spacing.xs },
  description: { ...typography.body, color: colors.inkMuted, lineHeight: 18 },
  courseFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  category: { ...typography.caption, backgroundColor: colors.primary + '20', paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: 4 },
  enrollment: { ...typography.caption, color: colors.inkMuted, fontWeight: '600' },

  actions: { flexDirection: 'row', gap: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md },
  actionButton: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', borderRadius: 6 },
  actionText: { ...typography.caption, color: colors.primary, fontWeight: '600' },
  deleteButton: { backgroundColor: colors.error + '10' },
  deleteActionText: { ...typography.caption, color: colors.error, fontWeight: '600' },

  emptyState: { alignItems: 'center', paddingTop: spacing.xxl, paddingHorizontal: spacing.xl },
  emptyBody: { ...typography.caption, marginTop: spacing.xs, textAlign: 'center', color: colors.inkMuted },

  loader: { marginTop: spacing.xxl },
});
