import React from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
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
import { Tag } from '@/components/StatusPieces';
import { useCourse, useAssignments, useQuizzes } from '@/services/queries';
import { colors, spacing, typography } from '@/theme/tokens';

type Props = NativeStackScreenProps<InstructorCoursesStackParamList, 'CourseDetail'>;

/**
 * InstructorCourseDetailScreen
 * Shows course structure (modules/lessons/assignments/quizzes) for editing.
 * Allows adding/editing/deleting modules, lessons, assignments, and quizzes.
 */
export function InstructorCourseDetailScreen({ route, navigation }: Props) {
  const { courseId } = route.params;
  const { data: course, isLoading } = useCourse(courseId);
  const { data: assignments = [] } = useAssignments(courseId);
  const { data: quizzes = [] } = useQuizzes(courseId);

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
        {/* Course Header */}
        <View style={styles.header}>
          <Text style={typography.display} numberOfLines={2}>
            {course.title}
          </Text>
          <Text style={styles.category}>{course.category}</Text>
        </View>

        <Button
          label="✎ Edit Course Info"
          onPress={() =>
            navigation.navigate('CourseEditor', {
              mode: 'edit',
              course,
            })
          }
          style={styles.editButton}
        />

        <Button
          label="📢 Post Announcement"
          onPress={() => navigation.navigate('PostAnnouncement', { courseId })}
          style={styles.announcementButton}
          variant="secondary"
        />

        {/* Modules Section */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={typography.subtitle}>Modules</Text>
            <Button
              label="+ Add Module"
              onPress={() =>
                navigation.navigate('ModuleEditor', {
                  courseId,
                  mode: 'create',
                })
              }
              style={styles.smallButton}
            />
          </View>

          {course.modules.length === 0 ? (
            <Text style={styles.emptyText}>No modules yet</Text>
          ) : (
            course.modules.map((module, moduleIdx) => (
              <View key={module.id} style={styles.moduleContainer}>
                <View style={styles.moduleHeader}>
                  <Text style={styles.moduleName}>
                    {moduleIdx + 1}. {module.title}
                  </Text>
                  <Pressable
                    onPress={() =>
                      navigation.navigate('ModuleEditor', {
                        courseId,
                        module,
                        mode: 'edit',
                      })
                    }
                    style={styles.editIcon}
                    accessibilityRole="button"
                    accessibilityLabel="Edit module"
                  >
                    <Text>✎</Text>
                  </Pressable>
                </View>

                {/* Lessons */}
                <View style={styles.lessonsContainer}>
                  {module.lessons.length === 0 ? (
                    <Text style={styles.emptyLessonText}>No lessons</Text>
                  ) : (
                    module.lessons.map((lesson, lessonIdx) => (
                      <Pressable
                        key={lesson.id}
                        onPress={() =>
                          navigation.navigate('LessonEditor', {
                            courseId,
                            moduleId: module.id,
                            lesson,
                            mode: 'edit',
                          })
                        }
                        style={({ pressed }) => [
                          styles.lessonRow,
                          pressed && { backgroundColor: colors.gray100 },
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel={`${lesson.title}, ${lesson.type}`}
                      >
                        <View style={styles.lessonInfo}>
                          <Text style={styles.lessonTitle}>
                            {lessonIdx + 1}. {lesson.title}
                          </Text>
                          <View style={styles.lessonMeta}>
                            <Text style={styles.lessonType}>{lesson.type}</Text>
                            {lesson.durationMinutes && (
                              <Text style={styles.lessonDuration}>{lesson.durationMinutes}m</Text>
                            )}
                          </View>
                        </View>
                      </Pressable>
                    ))
                  )}

                  <Button
                    label="+ Add Lesson"
                    onPress={() =>
                      navigation.navigate('LessonEditor', {
                        courseId,
                        moduleId: module.id,
                        mode: 'create',
                      })
                    }
                    style={styles.addLessonButton}
                  />
                </View>
              </View>
            ))
          )}
        </Card>

        {/* Manage Assignments & Quizzes */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={typography.subtitle}>Assignments ({assignments.length})</Text>
            <Button
              label="+ Add"
              onPress={() =>
                navigation.navigate('AssignmentEditor', {
                  courseId,
                  mode: 'create',
                })
              }
              style={styles.smallButton}
            />
          </View>

          {assignments.length === 0 ? (
            <Text style={styles.emptyText}>No assignments yet</Text>
          ) : (
            assignments.map((assignment) => (
              <Pressable
                key={assignment.id}
                onPress={() =>
                  navigation.navigate('AssignmentEditor', {
                    courseId,
                    assignment,
                    mode: 'edit',
                  })
                }
                style={({ pressed }) => [
                  styles.assignmentRow,
                  pressed && { backgroundColor: colors.gray100 },
                ]}
              >
                <View style={styles.assignmentInfo}>
                  <Text style={styles.assignmentTitle}>{assignment.title}</Text>
                  <View style={styles.assignmentMeta}>
                    <Text style={styles.assignmentType}>{assignment.submissionType}</Text>
                    <Text style={styles.assignmentPoints}>{assignment.pointsPossible} pts</Text>
                    <Text style={styles.dueDate}>
                      {new Date(assignment.dueDate).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))
          )}
        </Card>

        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={typography.subtitle}>Quizzes ({quizzes.length})</Text>
            <Button
              label="+ Add"
              onPress={() =>
                navigation.navigate('QuizEditor', {
                  courseId,
                  mode: 'create',
                })
              }
              style={styles.smallButton}
            />
          </View>

          {quizzes.length === 0 ? (
            <Text style={styles.emptyText}>No quizzes yet</Text>
          ) : (
            quizzes.map((quiz) => (
              <Pressable
                key={quiz.id}
                onPress={() =>
                  navigation.navigate('QuizEditor', {
                    courseId,
                    quiz,
                    mode: 'edit',
                  })
                }
                style={({ pressed }) => [
                  styles.quizRow,
                  pressed && { backgroundColor: colors.gray100 },
                ]}
              >
                <View style={styles.quizInfo}>
                  <Text style={styles.quizTitle}>{quiz.title}</Text>
                  <View style={styles.quizMeta}>
                    <Text style={styles.quizQuestions}>{quiz.questions.length} questions</Text>
                    {quiz.timeLimitMinutes && (
                      <Text style={styles.timeLimit}>{quiz.timeLimitMinutes} min limit</Text>
                    )}
                    <Text style={styles.dueDate}>
                      {new Date(quiz.dueDate).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))
          )}
        </Card>

        <Button
          label="← Back"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },

  header: { gap: spacing.sm, marginBottom: spacing.md },
  category: { ...typography.caption, color: colors.inkMuted },

  editButton: { marginBottom: spacing.md },
  announcementButton: { marginBottom: spacing.md },

  section: { gap: spacing.md },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  smallButton: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },

  moduleContainer: { marginTop: spacing.md, gap: spacing.sm },
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.gray100,
    borderRadius: 6,
  },
  moduleName: { ...typography.subtitle, fontWeight: '600', flex: 1 },
  editIcon: { padding: spacing.sm },

  lessonsContainer: { paddingLeft: spacing.lg, gap: spacing.sm },
  lessonRow: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderLeftWidth: 2,
    borderLeftColor: colors.primary,
    borderRadius: 4,
  },
  lessonInfo: { gap: spacing.xs },
  lessonTitle: { ...typography.body, fontWeight: '500' },
  lessonMeta: { flexDirection: 'row', gap: spacing.sm },
  lessonType: { ...typography.caption, backgroundColor: colors.gray200, paddingHorizontal: spacing.xs, paddingVertical: 2, borderRadius: 4 },
  lessonDuration: { ...typography.caption, color: colors.inkMuted },

  addLessonButton: { marginTop: spacing.sm },

  emptyText: { ...typography.caption, color: colors.inkMuted, fontStyle: 'italic' },
  emptyLessonText: { ...typography.caption, color: colors.inkMuted, marginLeft: spacing.md },

  assignmentRow: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
    borderRadius: 4,
  },
  assignmentInfo: { gap: spacing.xs },
  assignmentTitle: { ...typography.body, fontWeight: '500' },
  assignmentMeta: { flexDirection: 'row', gap: spacing.sm },
  assignmentType: { ...typography.caption, backgroundColor: colors.warning + '20', paddingHorizontal: spacing.xs, paddingVertical: 2, borderRadius: 4, color: colors.warning },
  assignmentPoints: { ...typography.caption, color: colors.ink, fontWeight: '600' },

  quizRow: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
    borderRadius: 4,
    marginTop: spacing.sm,
  },
  quizInfo: { gap: spacing.xs },
  quizTitle: { ...typography.body, fontWeight: '500' },
  quizMeta: { flexDirection: 'row', gap: spacing.sm },
  quizQuestions: { ...typography.caption, backgroundColor: colors.warning + '20', paddingHorizontal: spacing.xs, paddingVertical: 2, borderRadius: 4, color: colors.warning },
  timeLimit: { ...typography.caption, color: colors.ink, fontWeight: '600' },
  dueDate: { ...typography.caption, color: colors.inkMuted },

  backButton: { marginTop: spacing.lg },

  loader: { marginTop: spacing.xxl },
});
