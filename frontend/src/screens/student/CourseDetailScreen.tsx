import React from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { StudentCatalogStackParamList } from '@/navigation/StudentTabs';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Tag } from '@/components/StatusPieces';
import { useCourse, useEnrollInCourse, useMyEnrollments, useAssignments, useQuizzes } from '@/services/queries';
import { useAuthStore } from '@/store/authStore';
import { colors, spacing, typography } from '@/theme/tokens';

type Props = NativeStackScreenProps<StudentCatalogStackParamList, 'CourseDetail'>;

export function CourseDetailScreen({ route, navigation }: Props) {
  const { courseId } = route.params;
  const user = useAuthStore((s) => s.user);
  const { data: course, isLoading } = useCourse(courseId);
  const { data: enrollments } = useMyEnrollments(user?.id ?? '');
  const { data: assignments } = useAssignments(courseId);
  const { data: quizzes } = useQuizzes(courseId);
  const enrollMutation = useEnrollInCourse();

  const isEnrolled = enrollments?.some((e) => e.courseId === courseId);

  if (isLoading || !course) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator style={styles.loader} color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Tag label={course.category} tone="info" />
        <Text style={typography.display}>{course.title}</Text>
        <Text style={styles.instructor}>Taught by {course.instructorName}</Text>
        <Text style={styles.description}>{course.description}</Text>

        <Card style={styles.section}>
          <Text style={typography.subtitle}>Syllabus</Text>
          <Text style={styles.body}>{course.syllabus}</Text>
        </Card>

        {course.modules.length > 0 && (
          <Card style={styles.section}>
            <Text style={typography.subtitle}>Course content</Text>
            {course.modules.map((module) => (
              <View key={module.id} style={styles.moduleContainer}>
                <Text style={styles.moduleTitle}>{module.title}</Text>
                {module.lessons.map((lesson) => (
                  <Pressable
                    key={lesson.id}
                    onPress={() =>
                      navigation.navigate('Lesson', {
                        lesson,
                        moduleId: module.id,
                        courseId,
                        allLessonsInModule: module.lessons,
                      })
                    }
                    style={({ pressed }) => [
                      styles.lessonRow,
                      pressed && { backgroundColor: colors.gray100 },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`${lesson.title}${lesson.completed ? ', completed' : ''}${lesson.durationMinutes ? `, ${lesson.durationMinutes} minutes` : ''}`}
                  >
                    <View style={styles.lessonContent}>
                      <Text style={styles.lessonTitle}>{lesson.title}</Text>
                      <View style={styles.lessonMeta}>
                        <Text style={styles.lessonType}>{lesson.type}</Text>
                        {lesson.durationMinutes && (
                          <Text style={styles.lessonDuration}>{lesson.durationMinutes} min</Text>
                        )}
                        {lesson.completed && (
                          <Text style={styles.lessonBadge}>✓ Done</Text>
                        )}
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            ))}
          </Card>
        )}

        {/* Assignments Section */}
        {assignments && assignments.length > 0 && (
          <Card style={styles.section}>
            <Text style={typography.subtitle}>Assignments</Text>
            {assignments.map((assignment) => {
              const dueDate = new Date(assignment.dueDate);
              const isOverdue = new Date() > dueDate;
              return (
                <Pressable
                  key={assignment.id}
                  onPress={() => navigation.navigate('AssignmentDetail', { assignment, courseId })}
                  style={({ pressed }) => [
                    styles.itemRow,
                    pressed && { backgroundColor: colors.gray100 },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`${assignment.title}, ${assignment.pointsPossible} points, due ${dueDate.toLocaleDateString()}`}
                >
                  <View style={styles.itemContent}>
                    <Text style={styles.itemTitle}>{assignment.title}</Text>
                    <View style={styles.itemMeta}>
                      <Text style={styles.itemSubtext}>{assignment.pointsPossible} pts</Text>
                      <Text style={[styles.itemSubtext, isOverdue && styles.overdue]}>
                        Due {dueDate.toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </Card>
        )}

        {/* Quizzes Section */}
        {quizzes && quizzes.length > 0 && (
          <Card style={styles.section}>
            <Text style={typography.subtitle}>Quizzes</Text>
            {quizzes.map((quiz) => {
              const dueDate = new Date(quiz.dueDate);
              const isOverdue = new Date() > dueDate;
              return (
                <Pressable
                  key={quiz.id}
                  onPress={() => navigation.navigate('QuizTaker', { quiz, courseId })}
                  style={({ pressed }) => [
                    styles.itemRow,
                    pressed && { backgroundColor: colors.gray100 },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`${quiz.title}, ${quiz.questions.length} questions, due ${dueDate.toLocaleDateString()}`}
                >
                  <View style={styles.itemContent}>
                    <Text style={styles.itemTitle}>{quiz.title}</Text>
                    <View style={styles.itemMeta}>
                      <Text style={styles.itemSubtext}>{quiz.questions.length} questions</Text>
                      <Text style={[styles.itemSubtext, isOverdue && styles.overdue]}>
                        Due {dueDate.toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </Card>
        )}

        <Button
          label={isEnrolled ? 'Go to course' : 'Enroll now'}
          onPress={() => {
            if (isEnrolled) {
              navigation.getParent()?.navigate('MyCourses' as never);
            } else if (user) {
              enrollMutation.mutate({ studentId: user.id, courseId });
            }
          }}
          loading={enrollMutation.isPending}
          style={styles.enrollButton}
        />

        {isEnrolled && (
          <View style={styles.actionRow}>
            <Button
              label="Announcements"
              onPress={() => navigation.navigate('CourseAnnouncements', { courseId })}
              style={styles.actionButton}
              variant="secondary"
            />
            <Button
              label="Discussions"
              onPress={() => navigation.navigate('CourseDiscussions', { courseId })}
              style={styles.actionButton}
              variant="secondary"
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xxl },
  instructor: { ...typography.body, color: colors.inkMuted },
  description: { ...typography.body, marginTop: spacing.sm },
  section: { marginTop: spacing.md, gap: spacing.xs },
  body: { ...typography.body },
  moduleContainer: { marginTop: spacing.sm },
  moduleTitle: { ...typography.subtitle, marginBottom: spacing.sm, fontWeight: '600' },
  lessonRow: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 6,
    marginBottom: spacing.xs,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  lessonContent: { gap: spacing.xs },
  lessonTitle: { ...typography.body, fontWeight: '500' },
  lessonMeta: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  lessonType: {
    ...typography.caption,
    backgroundColor: colors.gray100,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
    textTransform: 'uppercase',
    fontSize: 10,
  },
  lessonDuration: { ...typography.caption, color: colors.inkMuted },
  lessonBadge: { ...typography.caption, color: colors.success, fontWeight: 'bold' },

  itemRow: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 6,
    marginBottom: spacing.xs,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary, // Using primary for all to match theme better or keeping it
  },
  itemContent: { gap: spacing.xs },
  itemTitle: { ...typography.body, fontWeight: '500' },
  itemMeta: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  itemSubtext: { ...typography.caption, color: colors.inkMuted },
  overdue: { color: colors.danger, fontWeight: '600' },

  enrollButton: { marginTop: spacing.lg },
  actionRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  actionButton: { flex: 1 },
  loader: { marginTop: spacing.xxl },
});
