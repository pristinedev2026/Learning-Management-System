import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { StudentCatalogStackParamList } from '@/navigation/StudentTabs';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ProgressBar } from '@/components/StatusPieces';
import { colors, spacing, typography } from '@/theme/tokens';
import type { QuizAttempt, Quiz } from '@/types';

type Props = NativeStackScreenProps<StudentCatalogStackParamList, 'QuizResults'>;

/**
 * QuizResultsScreen
 * Shows quiz results including score, percentage, and question-by-question breakdown.
 */
export function QuizResultsScreen({ route, navigation }: Props) {
  const { quizAttempt, quiz } = route.params;

  // Calculate percentage
  const maxPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
  const percentage = Math.round((quizAttempt.score / maxPoints) * 100);

  // Determine grade/feedback
  const getGradeFeedback = (pct: number) => {
    if (pct >= 90) return { tone: 'success', message: 'Excellent work!' };
    if (pct >= 80) return { tone: 'success', message: 'Good job!' };
    if (pct >= 70) return { tone: 'info', message: 'Satisfactory' };
    if (pct >= 60) return { tone: 'warning', message: 'Needs improvement' };
    return { tone: 'error', message: 'Please review the material' };
  };

  const feedback = getGradeFeedback(percentage);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Score Summary */}
        <Card
          style={[
            styles.scoreCard,
            feedback.tone === 'success' && styles.scoreCardSuccess,
            feedback.tone === 'warning' && styles.scoreCardWarning,
            feedback.tone === 'error' && styles.scoreCardError,
          ]}
        >
          <Text style={styles.scoreLabel}>Your Score</Text>
          <Text
            style={[
              styles.scoreValue,
              feedback.tone === 'success' && styles.scoreValueSuccess,
              feedback.tone === 'warning' && styles.scoreValueWarning,
              feedback.tone === 'error' && styles.scoreValueError,
            ]}
          >
            {percentage}%
          </Text>
          <Text style={styles.scoreDetail}>
            {quizAttempt.score} of {maxPoints} points
          </Text>
          <Text style={styles.feedback}>{feedback.message}</Text>
        </Card>

        {/* Progress visualization */}
        <Card style={styles.section}>
          <ProgressBar percent={percentage} />
          <Text style={styles.progressLabel}>Performance</Text>
        </Card>

        {/* Quiz Info */}
        <Card style={styles.section}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Quiz</Text>
            <Text style={styles.infoValue}>{quiz.title}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Questions</Text>
            <Text style={styles.infoValue}>{quiz.questions.length}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Submitted</Text>
            <Text style={styles.infoValue}>
              {new Date(quizAttempt.submittedAt).toLocaleString()}
            </Text>
          </View>
        </Card>

        {/* Question Breakdown */}
        <View style={styles.breakdownSection}>
          <Text style={typography.subtitle}>Question Summary</Text>
          {quiz.questions.map((question, idx) => {
            const userAnswer = quizAttempt.answers[question.id];
            const isCorrect = userAnswer === question.correctAnswer;

            return (
              <Card
                key={question.id}
                style={[
                  styles.questionResultCard,
                  isCorrect && styles.questionResultCardCorrect,
                  !isCorrect && styles.questionResultCardWrong,
                ]}
              >
                <View style={styles.questionResultHeader}>
                  <Text style={styles.questionResultNumber}>
                    {isCorrect ? '✓' : '✗'} Question {idx + 1}
                  </Text>
                  <Text style={styles.questionResultPoints}>
                    {isCorrect ? question.points : 0}/{question.points} pts
                  </Text>
                </View>

                <Text style={styles.questionResultText}>{question.text}</Text>

                <View style={styles.answerSection}>
                  <Text style={styles.answerLabel}>Your answer</Text>
                  <Text
                    style={[
                      styles.answerValue,
                      isCorrect && styles.answerCorrect,
                      !isCorrect && styles.answerWrong,
                    ]}
                  >
                    {userAnswer}
                  </Text>
                </View>

                {!isCorrect && (
                  <View style={styles.answerSection}>
                    <Text style={styles.answerLabel}>Correct answer</Text>
                    <Text style={[styles.answerValue, styles.answerCorrect]}>
                      {question.correctAnswer}
                    </Text>
                  </View>
                )}
              </Card>
            );
          })}
        </View>

        {/* Actions */}
        <Button
          label="Back to Course"
          onPress={() => {
            navigation.popToTop();
            navigation.goBack();
          }}
          style={styles.backButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },

  scoreCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  scoreCardSuccess: { backgroundColor: colors.success + '15' },
  scoreCardWarning: { backgroundColor: colors.warning + '15' },
  scoreCardError: { backgroundColor: colors.error + '15' },

  scoreLabel: { ...typography.caption, color: colors.inkMuted },
  scoreValue: { fontSize: 48, fontWeight: 'bold', color: colors.success },
  scoreValueSuccess: { color: colors.success },
  scoreValueWarning: { color: colors.warning },
  scoreValueError: { color: colors.error },
  scoreDetail: { ...typography.subtitle },
  feedback: { ...typography.body, fontWeight: '500', marginTop: spacing.sm },

  section: { gap: spacing.sm },

  progressLabel: { ...typography.caption, color: colors.inkMuted, textAlign: 'center', marginTop: spacing.sm },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  infoLabel: { ...typography.body, color: colors.inkMuted, fontWeight: '500' },
  infoValue: { ...typography.body, fontWeight: '600' },

  divider: { height: 1, backgroundColor: colors.border },

  breakdownSection: { marginTop: spacing.lg, gap: spacing.md },

  questionResultCard: { gap: spacing.sm, borderLeftWidth: 4 },
  questionResultCardCorrect: { borderLeftColor: colors.success, backgroundColor: colors.success + '08' },
  questionResultCardWrong: { borderLeftColor: colors.error, backgroundColor: colors.error + '08' },

  questionResultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionResultNumber: { ...typography.subtitle, fontWeight: '600' },
  questionResultPoints: { ...typography.caption, fontWeight: '600' },

  questionResultText: { ...typography.body, lineHeight: 20 },

  answerSection: { paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, gap: spacing.xs },
  answerLabel: { ...typography.caption, color: colors.inkMuted, fontWeight: '500' },
  answerValue: { ...typography.body },
  answerCorrect: { color: colors.success, fontWeight: '600' },
  answerWrong: { color: colors.error, fontWeight: '600' },

  backButton: { marginTop: spacing.lg },
});
