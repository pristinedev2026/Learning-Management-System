import React, { useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { StudentCatalogStackParamList } from '@/navigation/StudentTabs';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Tag } from '@/components/StatusPieces';
import { colors, spacing, typography } from '@/theme/tokens';
import type { Assignment, Submission } from '@/types';

type Props = NativeStackScreenProps<StudentCatalogStackParamList, 'AssignmentDetail'>;

/**
 * AssignmentDetailScreen
 * Shows assignment details: title, description, due date, points, submission type.
 * Allows student to start a new submission or view existing submission.
 */
export function AssignmentDetailScreen({ route, navigation }: Props) {
  const { assignment, courseId } = route.params;
  const [existingSubmission, setExistingSubmission] = useState<Submission | null>(null);

  const dueDate = new Date(assignment.dueDate);
  const isOverdue = new Date() > dueDate;
  const formattedDueDate = dueDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleStartSubmission = () => {
    navigation.navigate('Submission', {
      assignment,
      courseId,
      existingSubmission: existingSubmission ?? undefined,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Title and Status */}
        <View style={styles.header}>
          <Text style={typography.display}>{assignment.title}</Text>
          <View style={styles.statusRow}>
            <Tag
              label={isOverdue ? 'Overdue' : 'Active'}
              tone={isOverdue ? 'warning' : 'info'}
            />
            <Text style={styles.points}>{assignment.pointsPossible} pts</Text>
          </View>
        </View>

        {/* Description */}
        <Card style={styles.section}>
          <Text style={typography.subtitle}>Description</Text>
          <Text style={styles.body}>{assignment.description}</Text>
        </Card>

        {/* Details */}
        <Card style={styles.section}>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Due date</Text>
            <Text style={[styles.value, isOverdue && styles.overdueText]}>
              {formattedDueDate}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.label}>Submission type</Text>
            <Text style={styles.value}>
              {assignment.submissionType === 'text' ? 'Text entry' : 'File upload'}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.label}>Points possible</Text>
            <Text style={styles.value}>{assignment.pointsPossible}</Text>
          </View>
        </Card>

        {/* Submission Status */}
        {existingSubmission ? (
          <Card style={[styles.section, styles.submittedCard]}>
            <Text style={[typography.subtitle, styles.submittedTitle]}>✓ Submitted</Text>
            <Text style={styles.submittedDate}>
              Submitted {new Date(existingSubmission.submittedAt).toLocaleDateString()}
            </Text>
            {existingSubmission.score !== undefined && (
              <Text style={styles.score}>
                Score: {existingSubmission.score}/{assignment.pointsPossible}
              </Text>
            )}
            {existingSubmission.feedback && (
              <View style={styles.feedbackSection}>
                <Text style={styles.feedbackLabel}>Feedback</Text>
                <Text style={styles.feedbackText}>{existingSubmission.feedback}</Text>
              </View>
            )}
          </Card>
        ) : (
          <Card style={[styles.section, styles.notSubmittedCard]}>
            <Text style={[typography.subtitle, styles.notSubmittedTitle]}>
              Not yet submitted
            </Text>
          </Card>
        )}

        {/* Submit Button */}
        <Button
          label={existingSubmission ? 'Update submission' : 'Submit assignment'}
          onPress={handleStartSubmission}
          style={styles.submitButton}
        />

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
  statusRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  points: { ...typography.subtitle, color: colors.success, fontWeight: '600' },

  section: { gap: spacing.sm },
  body: { ...typography.body, lineHeight: 24 },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  label: { ...typography.body, color: colors.inkMuted, fontWeight: '500' },
  value: { ...typography.body },
  overdueText: { color: colors.warning },

  submittedCard: { backgroundColor: colors.success + '10', borderLeftWidth: 4, borderLeftColor: colors.success },
  submittedTitle: { color: colors.success, fontWeight: '600' },
  submittedDate: { ...typography.caption, color: colors.inkMuted },
  score: { ...typography.subtitle, marginTop: spacing.sm, color: colors.success, fontWeight: '600' },

  feedbackSection: { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  feedbackLabel: { ...typography.subtitle, fontWeight: '600', marginBottom: spacing.xs },
  feedbackText: { ...typography.body, lineHeight: 20 },

  notSubmittedCard: { backgroundColor: colors.gray100 },
  notSubmittedTitle: { color: colors.inkMuted },

  submitButton: { marginTop: spacing.lg },
  backButton: { marginTop: spacing.md },
});
