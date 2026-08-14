import React, { useState } from 'react';
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
import type { StudentCatalogStackParamList } from '@/navigation/StudentTabs';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useSubmitQuizAttempt } from '@/services/queries';
import { useAuthStore } from '@/store/authStore';
import { colors, spacing, typography } from '@/theme/tokens';
import type { Quiz, Question, QuestionType } from '@/types';

type Props = NativeStackScreenProps<StudentCatalogStackParamList, 'QuizTaker'>;

/**
 * QuizTakerScreen
 * Displays quiz questions one-by-one or all at once depending on preferences.
 * Collects answers and submits them for auto-grading.
 */
export function QuizTakerScreen({ route, navigation }: Props) {
  const { quiz, courseId } = route.params;
  const user = useAuthStore((s) => s.user);
  const submitMutation = useSubmitQuizAttempt();

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const allAnswered = quiz.questions.every((q) => answers[q.id]);

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleNext = () => {
    if (!answers[currentQuestion.id]) {
      Alert.alert('Required', 'Please answer this question before proceeding');
      return;
    }
    if (!isLastQuestion) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!allAnswered) {
      Alert.alert('Incomplete', 'Please answer all questions before submitting');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'Not logged in');
      return;
    }

    try {
      const result = await submitMutation.mutateAsync({
        quizId: quiz.id,
        studentId: user.id,
        answers,
      });

      // Navigate to results screen with the attempt data
      navigation.replace('QuizResults', {
        quizAttempt: result,
        quiz,
        courseId,
      });
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to submit quiz');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={typography.display}>{quiz.title}</Text>
          <Text style={styles.progress}>
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` },
            ]}
          />
        </View>

        {/* Question */}
        <Card style={styles.questionCard}>
          <Text style={typography.subtitle}>{currentQuestion.text}</Text>

          {/* Answer Options */}
          <View style={styles.answersContainer}>
            {currentQuestion.type === 'multiple_choice' && (
              <MultipleChoiceQuestion
                question={currentQuestion}
                selectedAnswer={answers[currentQuestion.id]}
                onSelect={(answer) => handleAnswerSelect(currentQuestion.id, answer)}
              />
            )}

            {currentQuestion.type === 'true_false' && (
              <TrueFalseQuestion
                question={currentQuestion}
                selectedAnswer={answers[currentQuestion.id]}
                onSelect={(answer) => handleAnswerSelect(currentQuestion.id, answer)}
              />
            )}

            {currentQuestion.type === 'short_answer' && (
              <ShortAnswerQuestion
                question={currentQuestion}
                selectedAnswer={answers[currentQuestion.id]}
                onSelect={(answer) => handleAnswerSelect(currentQuestion.id, answer)}
              />
            )}
          </View>

          {/* Points info */}
          <Text style={styles.points}>{currentQuestion.points} point(s)</Text>
        </Card>

        {/* Navigation */}
        <View style={styles.navigation}>
          <Button
            label="← Previous"
            onPress={handlePrevious}
            style={styles.navButton}
            disabled={currentQuestionIndex === 0}
          />
          {isLastQuestion ? (
            <Button
              label="Submit Quiz"
              onPress={handleSubmit}
              loading={submitMutation.isPending}
              style={styles.submitButton}
              disabled={!allAnswered}
            />
          ) : (
            <Button
              label="Next →"
              onPress={handleNext}
              style={styles.navButton}
            />
          )}
        </View>

        {/* Question List */}
        <View style={styles.questionListSection}>
          <Text style={typography.subtitle}>Questions</Text>
          <View style={styles.questionList}>
            {quiz.questions.map((q, idx) => (
              <Pressable
                key={q.id}
                onPress={() => setCurrentQuestionIndex(idx)}
                style={({ pressed }) => [
                  styles.questionListItem,
                  idx === currentQuestionIndex && styles.questionListItemActive,
                  answers[q.id] && styles.questionListItemAnswered,
                  pressed && { opacity: 0.7 },
                ]}
                accessibilityLabel={`Question ${idx + 1}${answers[q.id] ? ', answered' : ''}`}
              >
                <Text
                  style={[
                    styles.questionListItemText,
                    idx === currentQuestionIndex && styles.questionListItemActiveText,
                  ]}
                >
                  {idx + 1}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MultipleChoiceQuestion({
  question,
  selectedAnswer,
  onSelect,
}: {
  question: Question;
  selectedAnswer?: string;
  onSelect: (answer: string) => void;
}) {
  return (
    <>
      {question.options?.map((option) => (
        <Pressable
          key={option}
          onPress={() => onSelect(option)}
          style={({ pressed }) => [
            styles.optionButton,
            selectedAnswer === option && styles.optionButtonSelected,
            pressed && { opacity: 0.8 },
          ]}
          accessibilityRole="radio"
          accessibilityState={{ selected: selectedAnswer === option }}
        >
          <View
            style={[
              styles.radioButton,
              selectedAnswer === option && styles.radioButtonSelected,
            ]}
          />
          <Text
            style={[
              styles.optionText,
              selectedAnswer === option && styles.optionTextSelected,
            ]}
          >
            {option}
          </Text>
        </Pressable>
      ))}
    </>
  );
}

function TrueFalseQuestion({
  question,
  selectedAnswer,
  onSelect,
}: {
  question: Question;
  selectedAnswer?: string;
  onSelect: (answer: string) => void;
}) {
  const options = ['True', 'False'];
  return (
    <>
      {options.map((option) => (
        <Pressable
          key={option}
          onPress={() => onSelect(option)}
          style={({ pressed }) => [
            styles.optionButton,
            selectedAnswer === option && styles.optionButtonSelected,
            pressed && { opacity: 0.8 },
          ]}
          accessibilityRole="radio"
          accessibilityState={{ selected: selectedAnswer === option }}
        >
          <View
            style={[
              styles.radioButton,
              selectedAnswer === option && styles.radioButtonSelected,
            ]}
          />
          <Text
            style={[
              styles.optionText,
              selectedAnswer === option && styles.optionTextSelected,
            ]}
          >
            {option}
          </Text>
        </Pressable>
      ))}
    </>
  );
}

function ShortAnswerQuestion({
  question,
  selectedAnswer,
  onSelect,
}: {
  question: Question;
  selectedAnswer?: string;
  onSelect: (answer: string) => void;
}) {
  return (
    <View style={styles.shortAnswerContainer}>
      <TextInput
        style={styles.shortAnswerInput}
        placeholder="Type your answer..."
        placeholderTextColor={colors.inkMuted}
        value={selectedAnswer}
        onChangeText={onSelect}
      />
    </View>
  );
}

const TextInput: React.FC<any> = ({ style, ...props }) => (
  <View style={style}>
    <__TextInput {...props} />
  </View>
);

import { TextInput as __TextInput } from 'react-native';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },

  header: { gap: spacing.xs, marginBottom: spacing.md },
  progress: { ...typography.caption, color: colors.inkMuted },

  progressBar: {
    height: 6,
    backgroundColor: colors.gray200,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },

  questionCard: { gap: spacing.md, padding: spacing.md },

  answersContainer: { gap: spacing.sm },

  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    gap: spacing.md,
  },
  optionButtonSelected: {
    backgroundColor: colors.primary + '15',
    borderColor: colors.primary,
  },

  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
  },
  radioButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  optionText: { ...typography.body, flex: 1, color: colors.ink },
  optionTextSelected: { fontWeight: '600', color: colors.primary },

  shortAnswerContainer: { marginVertical: spacing.sm },
  shortAnswerInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.background,
  },

  points: { ...typography.caption, color: colors.inkMuted, marginTop: spacing.sm },

  navigation: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  navButton: { flex: 1 },
  submitButton: { flex: 1, backgroundColor: colors.success },

  questionListSection: { marginTop: spacing.xl, gap: spacing.sm },
  questionList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  questionListItem: {
    width: '14%',
    aspectRatio: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray50,
  },
  questionListItemActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  questionListItemAnswered: {
    backgroundColor: colors.success + '20',
    borderColor: colors.success,
  },
  questionListItemText: { ...typography.subtitle, fontSize: 12, fontWeight: '600' },
  questionListItemActiveText: { color: 'white' },
});
