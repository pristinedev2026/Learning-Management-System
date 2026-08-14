import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { InstructorSubmissionsStackParamList } from '@/navigation/InstructorTabs';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useGradeSubmission } from '@/services/queries';
import { colors, spacing, typography } from '@/theme/tokens';

type Props = NativeStackScreenProps<InstructorSubmissionsStackParamList, 'Grading'>;

export function InstructorGradingScreen({ route, navigation }: Props) {
  const { submission, assignmentTitle, studentName } = route.params;
  const [score, setScore] = useState(submission.score?.toString() ?? '');
  const [feedback, setFeedback] = useState(submission.feedback ?? '');

  const gradeMutation = useGradeSubmission();

  const handleGrade = () => {
    const scoreNum = parseFloat(score);
    if (isNaN(scoreNum)) {
      Alert.alert('Invalid Score', 'Please enter a numeric score.');
      return;
    }

    gradeMutation.mutate(
      {
        submissionId: submission.id,
        score: scoreNum,
        feedback,
      },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Submission graded successfully', [
            { text: 'OK', onPress: () => navigation.goBack() },
          ]);
        },
        onError: (error) => {
          Alert.alert('Error', error instanceof Error ? error.message : 'Failed to grade submission');
        },
      }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={typography.display}>{studentName}</Text>
          <Text style={typography.subtitle}>{assignmentTitle}</Text>
          <Text style={styles.date}>Submitted on: {new Date(submission.submittedAt).toLocaleDateString()}</Text>
        </View>

        <Card style={styles.contentCard}>
          <Text style={styles.sectionTitle}>Submission Content</Text>
          {submission.content ? (
            <Text style={styles.submissionText}>{submission.content}</Text>
          ) : submission.fileUrl ? (
            <View style={styles.fileBox}>
              <Text style={styles.fileUrl}>{submission.fileUrl}</Text>
              <Text style={typography.caption}>(In a real app, this would be a link or preview)</Text>
            </View>
          ) : (
            <Text style={styles.noContent}>No content provided.</Text>
          )}
        </Card>

        <View style={styles.form}>
          <Text style={styles.label}>Score</Text>
          <TextInput
            style={styles.input}
            value={score}
            onChangeText={setScore}
            keyboardType="numeric"
            placeholder="e.g. 95"
            placeholderTextColor={colors.inkMuted}
          />

          <Text style={styles.label}>Feedback</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={feedback}
            onChangeText={setFeedback}
            multiline
            numberOfLines={4}
            placeholder="Enter feedback for the student..."
            placeholderTextColor={colors.inkMuted}
            textAlignVertical="top"
          />

          <Button
            label={gradeMutation.isPending ? 'Saving...' : 'Submit Grade'}
            onPress={handleGrade}
            disabled={gradeMutation.isPending}
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.lg, gap: spacing.lg },
  header: { gap: spacing.xs },
  date: { ...typography.caption, color: colors.inkMuted },

  contentCard: { padding: spacing.md },
  sectionTitle: { ...typography.subtitle, marginBottom: spacing.sm },
  submissionText: { ...typography.body, color: colors.ink },
  fileBox: { padding: spacing.md, backgroundColor: colors.gray100, borderRadius: 8, gap: 4 },
  fileUrl: { ...typography.body, color: colors.primary, textDecorationLine: 'underline' },
  noContent: { ...typography.body, color: colors.inkMuted, fontStyle: 'italic' },

  form: { gap: spacing.md },
  label: { ...typography.body, fontWeight: '600', color: colors.ink },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    ...typography.body,
  },
  textArea: { minHeight: 120 },
  submitButton: { marginTop: spacing.sm },
});
