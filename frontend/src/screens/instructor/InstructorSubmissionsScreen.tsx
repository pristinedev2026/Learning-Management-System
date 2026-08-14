import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { InstructorSubmissionsStackParamList } from '@/navigation/InstructorTabs';
import { Card } from '@/components/Card';
import { useInstructorCourses, useSubmissions } from '@/services/queries';
import { useAuthStore } from '@/store/authStore';
import { colors, spacing, typography } from '@/theme/tokens';
import type { Course } from '@/types';

type Props = NativeStackScreenProps<InstructorSubmissionsStackParamList, 'SubmissionsInbox'>;

export function InstructorSubmissionsScreen({ navigation }: Props) {
  const user = useAuthStore((s) => s.user);
  const { data: courses, isLoading: loadingCourses } = useInstructorCourses(user?.id ?? '');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const { data: submissions, isLoading: loadingSubmissions } = useSubmissions(
    selectedCourse?.id ?? ''
  );

  if (loadingCourses) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator style={styles.loader} color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={typography.subtitle}>
          {selectedCourse ? `Submissions: ${selectedCourse.title}` : 'Select a Course'}
        </Text>
        {selectedCourse && (
          <Pressable onPress={() => setSelectedCourse(null)}>
            <Text style={styles.backLink}>← Back to Course List</Text>
          </Pressable>
        )}
      </View>

      {!selectedCourse ? (
        <FlatList
          data={courses}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Card style={styles.courseItem}>
              <Pressable
                onPress={() => setSelectedCourse(item)}
                style={({ pressed }) => pressed && { opacity: 0.7 }}
              >
                <Text style={typography.subtitle}>{item.title}</Text>
                <Text style={styles.courseMeta}>{item.studentCount} Students Enrolled</Text>
              </Pressable>
            </Card>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyBody}>No courses found.</Text>
            </View>
          }
        />
      ) : (
        <View style={{ flex: 1 }}>
          {loadingSubmissions ? (
            <ActivityIndicator style={styles.loader} color={colors.primary} />
          ) : (
            <FlatList
              data={submissions}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <Card style={styles.submissionItem}>
                  <Pressable
                    onPress={() =>
                      navigation.navigate('Grading', {
                        submission: item,
                        assignmentTitle: item.assignmentTitle ?? 'Assignment',
                        studentName: item.studentName ?? 'Student',
                      })
                    }
                    style={({ pressed }) => [
                      styles.submissionContent,
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <View style={styles.submissionHeader}>
                      <Text style={typography.subtitle}>{item.studentName ?? 'Unknown Student'}</Text>
                      <View
                        style={[
                          styles.statusBadge,
                          item.score !== undefined ? styles.statusGraded : styles.statusPending,
                        ]}
                      >
                        <Text style={styles.statusText}>
                          {item.score !== undefined ? 'Graded' : 'Ungraded'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.assignmentTitle}>{item.assignmentTitle ?? 'Assignment'}</Text>
                    {item.score !== undefined && (
                      <Text style={styles.scoreText}>Score: {item.score}</Text>
                    )}
                  </Pressable>
                </Card>
              )}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={styles.emptyBody}>No submissions for this course.</Text>
                </View>
              }
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  backLink: { ...typography.caption, color: colors.primary, marginTop: spacing.xs },
  listContent: { padding: spacing.lg, gap: spacing.md },
  loader: { marginTop: spacing.xxl },

  courseItem: { padding: spacing.md },
  courseMeta: { ...typography.caption, color: colors.inkMuted, marginTop: 4 },

  submissionItem: { padding: spacing.md },
  submissionContent: { gap: spacing.xs },
  submissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assignmentTitle: { ...typography.body, color: colors.inkMuted },
  scoreText: { ...typography.caption, fontWeight: '600', color: colors.success, marginTop: 4 },

  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: 4 },
  statusGraded: { backgroundColor: colors.success + '20' },
  statusPending: { backgroundColor: colors.warning + '20' },
  statusText: { ...typography.caption, fontSize: 10, fontWeight: 'bold' },

  emptyState: { alignItems: 'center', paddingTop: spacing.xxl },
  emptyBody: { ...typography.caption, color: colors.inkMuted },
});
