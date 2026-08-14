import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/Card';
import { useMyGrades } from '@/services/queries';
import { colors, spacing, typography } from '@/theme/tokens';
import { Ionicons } from '@expo/vector-icons';

export function GradesScreen() {
  const { data: grades, isLoading } = useMyGrades();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator style={styles.loader} color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={[typography.display, styles.header]}>My grades</Text>
      <FlatList
        data={grades}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={typography.subtitle}>No grades yet</Text>
          </View>
        }
        renderItem={({ item }) => <CourseGradeCard course={item} />}
      />
    </SafeAreaView>
  );
}

function CourseGradeCard({ course }: { course: any }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card style={styles.card}>
      <Pressable onPress={() => setExpanded(!expanded)} style={styles.courseHeader}>
        <Text style={typography.subtitle}>{course.title}</Text>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color={colors.inkMuted} />
      </Pressable>

      {expanded && (
        <View style={styles.details}>
          <Text style={styles.sectionTitle}>Assignments</Text>
          {course.assignments.map((a: any) => {
            const submission = a.submissions?.[0];
            return (
              <View key={a.id} style={styles.item}>
                <View style={styles.itemTop}>
                  <Text style={typography.body}>{a.title}</Text>
                  <Text style={typography.body}>
                    {submission?.score ?? '-'} / {a.pointsPossible}
                  </Text>
                </View>
                {submission?.feedback && (
                  <Text style={styles.feedback}>Feedback: {submission.feedback}</Text>
                )}
              </View>
            );
          })}

          <Text style={[styles.sectionTitle, { marginTop: spacing.md }]}>Quizzes</Text>
          {course.quizzes.map((q: any) => {
            const attempt = q.attempts?.[0];
            return (
              <View key={q.id} style={styles.item}>
                <View style={styles.itemTop}>
                  <Text style={typography.body}>{q.title}</Text>
                  <Text style={typography.body}>{attempt?.score ?? '-'} points</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  card: { marginBottom: spacing.md },
  courseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  details: { marginTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md },
  sectionTitle: { ...typography.caption, color: colors.primary, marginBottom: spacing.xs, textTransform: 'uppercase' },
  item: { marginBottom: spacing.sm },
  itemTop: { flexDirection: 'row', justifyContent: 'space-between' },
  feedback: { ...typography.caption, color: colors.inkMuted, marginTop: 2 },
  loader: { marginTop: spacing.xxl },
  emptyState: { alignItems: 'center', paddingTop: spacing.xxl },
});
