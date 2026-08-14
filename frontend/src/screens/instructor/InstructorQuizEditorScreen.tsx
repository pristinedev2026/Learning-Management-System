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
  Pressable,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import type { InstructorCoursesStackParamList } from '@/navigation/InstructorTabs';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useCreateQuiz, useUpdateQuiz } from '@/services/queries';
import { colors, spacing, typography } from '@/theme/tokens';

type Props = NativeStackScreenProps<InstructorCoursesStackParamList, 'QuizEditor'>;

type QuestionData = {
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  text: string;
  options?: string[];
  correctAnswer: string;
  points: string;
};

type FormData = {
  title: string;
  dueDate: string;
  timeLimitMinutes: string;
  questions: QuestionData[];
};

/**
 * InstructorQuizEditorScreen
 * Create or edit a quiz with dynamic questions.
 * Supports: multiple choice, true/false, short answer questions.
 */
export function InstructorQuizEditorScreen({ route, navigation }: Props) {
  const { courseId, mode, quiz } = route.params;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createMutation = useCreateQuiz();
  const updateMutation = useUpdateQuiz();

  const { control, handleSubmit, formState, watch } = useForm<FormData>({
    defaultValues: {
      title: quiz?.title ?? '',
      dueDate: quiz?.dueDate ? new Date(quiz.dueDate).toISOString().split('T')[0] : '',
      timeLimitMinutes: quiz?.timeLimitMinutes?.toString() ?? '',
      questions: quiz?.questions ?? [
        {
          type: 'multiple_choice',
          text: '',
          options: ['', '', '', ''],
          correctAnswer: '',
          points: '1',
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions',
  });

  const questionsWatch = watch('questions');

  const onSubmit = async (data: FormData) => {
    if (!data.title.trim()) {
      Alert.alert('Validation Error', 'Quiz title is required');
      return;
    }
    if (!data.dueDate) {
      Alert.alert('Validation Error', 'Due date is required');
      return;
    }
    if (data.questions.length === 0) {
      Alert.alert('Validation Error', 'Quiz must have at least one question');
      return;
    }

    // Validate each question
    for (let i = 0; i < data.questions.length; i++) {
      const q = data.questions[i];
      if (!q.text.trim()) {
        Alert.alert('Validation Error', `Question ${i + 1}: Question text is required`);
        return;
      }
      if (!q.correctAnswer.trim()) {
        Alert.alert('Validation Error', `Question ${i + 1}: Correct answer is required`);
        return;
      }
      if (isNaN(parseInt(q.points, 10))) {
        Alert.alert('Validation Error', `Question ${i + 1}: Points must be a valid number`);
        return;
      }
      if (q.type === 'multiple_choice' && (!q.options || q.options.some((o) => !o.trim()))) {
        Alert.alert('Validation Error', `Question ${i + 1}: All options are required`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: data.title,
        dueDate: new Date(data.dueDate).toISOString(),
        timeLimitMinutes: data.timeLimitMinutes ? parseInt(data.timeLimitMinutes, 10) : undefined,
        questions: data.questions.map((q) => ({
          type: q.type,
          text: q.text,
          options: q.type === 'multiple_choice' ? q.options : undefined,
          correctAnswer: q.correctAnswer,
          points: parseInt(q.points, 10),
        })),
      };

      if (mode === 'create') {
        await createMutation.mutateAsync({
          courseId,
          ...payload,
        });
      } else {
        await updateMutation.mutateAsync({
          quizId: quiz!.id,
          courseId,
          ...payload,
        });
      }

      Alert.alert('Success', `Quiz ${mode === 'create' ? 'created' : 'updated'} successfully`);
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={typography.display}>{mode === 'create' ? 'New Quiz' : 'Edit Quiz'}</Text>

        <Card style={styles.formCard}>
          {/* Title */}
          <View style={styles.field}>
            <Text style={styles.label}>Quiz Title *</Text>
            <Controller
              control={control}
              name="title"
              render={({ field: { value, onChange } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Quiz title"
                  value={value}
                  onChangeText={onChange}
                  editable={!isSubmitting}
                />
              )}
            />
            {formState.errors.title && <Text style={styles.error}>{formState.errors.title.message}</Text>}
          </View>

          {/* Due Date */}
          <View style={styles.field}>
            <Text style={styles.label}>Due Date (YYYY-MM-DD) *</Text>
            <Controller
              control={control}
              name="dueDate"
              render={({ field: { value, onChange } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="2026-08-31"
                  value={value}
                  onChangeText={onChange}
                  editable={!isSubmitting}
                />
              )}
            />
            {formState.errors.dueDate && <Text style={styles.error}>{formState.errors.dueDate.message}</Text>}
          </View>

          {/* Time Limit */}
          <View style={styles.field}>
            <Text style={styles.label}>Time Limit (minutes, optional)</Text>
            <Controller
              control={control}
              name="timeLimitMinutes"
              render={({ field: { value, onChange } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Leave blank for no time limit"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="number-pad"
                  editable={!isSubmitting}
                />
              )}
            />
          </View>
        </Card>

        {/* Questions */}
        <View>
          <View style={styles.questionsHeader}>
            <Text style={typography.subtitle}>Questions ({fields.length})</Text>
            <Button
              label="+ Add Question"
              onPress={() =>
                append({
                  type: 'multiple_choice',
                  text: '',
                  options: ['', '', '', ''],
                  correctAnswer: '',
                  points: '1',
                })
              }
              disabled={isSubmitting}
              style={styles.addQuestionBtn}
            />
          </View>

          {fields.map((field, index) => (
            <Card key={field.id} style={styles.questionCard}>
              {/* Question Type */}
              <View style={styles.field}>
                <Text style={styles.label}>Question {index + 1} Type</Text>
                <Controller
                  control={control}
                  name={`questions.${index}.type`}
                  render={({ field: { value, onChange } }) => (
                    <View style={styles.typeContainer}>
                      {(['multiple_choice', 'true_false', 'short_answer'] as const).map((type) => (
                        <Pressable
                          key={type}
                          onPress={() => onChange(type)}
                          style={[
                            styles.typeButton,
                            value === type && styles.typeButtonActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.typeButtonLabel,
                              value === type && styles.typeButtonLabelActive,
                            ]}
                          >
                            {type === 'multiple_choice'
                              ? 'Multiple Choice'
                              : type === 'true_false'
                                ? 'T/F'
                                : 'Short Answer'}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                />
              </View>

              {/* Question Text */}
              <View style={styles.field}>
                <Text style={styles.label}>Question Text *</Text>
                <Controller
                  control={control}
                  name={`questions.${index}.text`}
                  render={({ field: { value, onChange } }) => (
                    <TextInput
                      style={styles.input}
                      placeholder="Enter question"
                      value={value}
                      onChangeText={onChange}
                      editable={!isSubmitting}
                    />
                  )}
                />
              </View>

              {/* Multiple Choice Options */}
              {questionsWatch[index]?.type === 'multiple_choice' && (
                <View style={styles.field}>
                  <Text style={styles.label}>Options *</Text>
                  <Controller
                    control={control}
                    name={`questions.${index}.options`}
                    render={({ field: { value, onChange } }) => (
                      <View style={styles.optionsContainer}>
                        {(value || []).map((option, optionIdx) => (
                          <TextInput
                            key={optionIdx}
                            style={styles.optionInput}
                            placeholder={`Option ${optionIdx + 1}`}
                            value={option}
                            onChangeText={(text) => {
                              const newOptions = [...(value || [])];
                              newOptions[optionIdx] = text;
                              onChange(newOptions);
                            }}
                            editable={!isSubmitting}
                          />
                        ))}
                      </View>
                    )}
                  />
                </View>
              )}

              {/* Correct Answer */}
              <View style={styles.field}>
                <Text style={styles.label}>
                  Correct Answer {questionsWatch[index]?.type === 'true_false' ? '(true/false)' : ''}*
                </Text>
                <Controller
                  control={control}
                  name={`questions.${index}.correctAnswer`}
                  render={({ field: { value, onChange } }) => {
                    if (questionsWatch[index]?.type === 'true_false') {
                      return (
                        <View style={styles.typeContainer}>
                          {(['true', 'false'] as const).map((answer) => (
                            <Pressable
                              key={answer}
                              onPress={() => onChange(answer)}
                              style={[
                                styles.typeButton,
                                value === answer && styles.typeButtonActive,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.typeButtonLabel,
                                  value === answer && styles.typeButtonLabelActive,
                                ]}
                              >
                                {answer.charAt(0).toUpperCase() + answer.slice(1)}
                              </Text>
                            </Pressable>
                          ))}
                        </View>
                      );
                    }

                    return (
                      <TextInput
                        style={styles.input}
                        placeholder={
                          questionsWatch[index]?.type === 'multiple_choice'
                            ? 'Enter correct option text'
                            : 'Enter correct answer'
                        }
                        value={value}
                        onChangeText={onChange}
                        editable={!isSubmitting}
                      />
                    );
                  }}
                />
              </View>

              {/* Points */}
              <View style={styles.field}>
                <Text style={styles.label}>Points *</Text>
                <Controller
                  control={control}
                  name={`questions.${index}.points`}
                  render={({ field: { value, onChange } }) => (
                    <TextInput
                      style={styles.input}
                      placeholder="1"
                      value={value}
                      onChangeText={onChange}
                      keyboardType="number-pad"
                      editable={!isSubmitting}
                    />
                  )}
                />
              </View>

              {/* Remove Button */}
              <Button
                label="Remove Question"
                onPress={() => remove(index)}
                disabled={fields.length === 1 || isSubmitting}
                style={styles.removeButton}
              />
            </Card>
          ))}
        </View>

        {/* Submit Buttons */}
        <View style={styles.actions}>
          <Button
            label={isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Quiz' : 'Update Quiz'}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
          />
          <Button
            label="Cancel"
            onPress={() => navigation.goBack()}
            disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
            style={styles.cancelButton}
          />
        </View>

        {(createMutation.isPending || updateMutation.isPending) && (
          <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },

  formCard: { gap: spacing.md, paddingBottom: spacing.md },

  field: { gap: spacing.xs },
  label: { ...typography.subtitle, color: colors.ink },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    ...typography.body,
    color: colors.ink,
    backgroundColor: colors.gray100,
  },
  error: { ...typography.caption, color: colors.error },

  questionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  addQuestionBtn: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },

  questionCard: { gap: spacing.md, marginBottom: spacing.md },

  typeContainer: { flexDirection: 'row', gap: spacing.sm },
  typeButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: colors.gray100,
  },
  typeButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '20',
  },
  typeButtonLabel: { ...typography.body, color: colors.inkMuted, fontWeight: '600' },
  typeButtonLabelActive: { color: colors.primary },

  optionsContainer: { gap: spacing.sm },
  optionInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    ...typography.body,
    color: colors.ink,
    backgroundColor: colors.gray100,
  },

  removeButton: { backgroundColor: colors.error + '20', marginTop: spacing.sm },

  actions: { gap: spacing.sm, marginTop: spacing.md },
  cancelButton: { backgroundColor: colors.gray100 },

  loader: { marginTop: spacing.lg },
});
