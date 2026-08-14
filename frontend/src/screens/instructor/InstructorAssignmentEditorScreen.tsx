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
import { useForm, Controller } from 'react-hook-form';
import type { InstructorCoursesStackParamList } from '@/navigation/InstructorTabs';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useCreateAssignment, useUpdateAssignment } from '@/services/queries';
import { colors, spacing, typography } from '@/theme/tokens';

type Props = NativeStackScreenProps<InstructorCoursesStackParamList, 'AssignmentEditor'>;

type FormData = {
  title: string;
  description: string;
  dueDate: string;
  pointsPossible: string;
  submissionType: 'text' | 'file';
};

/**
 * InstructorAssignmentEditorScreen
 * Create or edit an assignment for a course.
 * Form fields: title, description, due date, points, submission type.
 */
export function InstructorAssignmentEditorScreen({ route, navigation }: Props) {
  const { courseId, mode, assignment } = route.params;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createMutation = useCreateAssignment();
  const updateMutation = useUpdateAssignment();

  const { control, handleSubmit, formState } = useForm<FormData>({
    defaultValues: {
      title: assignment?.title ?? '',
      description: assignment?.description ?? '',
      dueDate: assignment?.dueDate ? new Date(assignment.dueDate).toISOString().split('T')[0] : '',
      pointsPossible: assignment?.pointsPossible?.toString() ?? '100',
      submissionType: assignment?.submissionType ?? 'text',
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!data.title.trim()) {
      Alert.alert('Validation Error', 'Title is required');
      return;
    }
    if (!data.description.trim()) {
      Alert.alert('Validation Error', 'Description is required');
      return;
    }
    if (!data.dueDate) {
      Alert.alert('Validation Error', 'Due date is required');
      return;
    }
    if (isNaN(parseInt(data.pointsPossible, 10))) {
      Alert.alert('Validation Error', 'Points must be a valid number');
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'create') {
        await createMutation.mutateAsync({
          courseId,
          title: data.title,
          description: data.description,
          dueDate: new Date(data.dueDate).toISOString(),
          pointsPossible: parseInt(data.pointsPossible, 10),
          submissionType: data.submissionType,
        });
      } else {
        await updateMutation.mutateAsync({
          assignmentId: assignment!.id,
          courseId,
          title: data.title,
          description: data.description,
          dueDate: new Date(data.dueDate).toISOString(),
          pointsPossible: parseInt(data.pointsPossible, 10),
          submissionType: data.submissionType,
        });
      }

      Alert.alert('Success', `Assignment ${mode === 'create' ? 'created' : 'updated'} successfully`);
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={typography.display}>{mode === 'create' ? 'New Assignment' : 'Edit Assignment'}</Text>

        <Card style={styles.formCard}>
          {/* Title */}
          <View style={styles.field}>
            <Text style={styles.label}>Title *</Text>
            <Controller
              control={control}
              name="title"
              render={({ field: { value, onChange } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Assignment title"
                  value={value}
                  onChangeText={onChange}
                  editable={!isSubmitting}
                />
              )}
            />
            {formState.errors.title && <Text style={styles.error}>{formState.errors.title.message}</Text>}
          </View>

          {/* Description */}
          <View style={styles.field}>
            <Text style={styles.label}>Description *</Text>
            <Controller
              control={control}
              name="description"
              render={({ field: { value, onChange } }) => (
                <TextInput
                  style={[styles.input, styles.textarea]}
                  placeholder="Assignment instructions and details"
                  value={value}
                  onChangeText={onChange}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  editable={!isSubmitting}
                />
              )}
            />
            {formState.errors.description && <Text style={styles.error}>{formState.errors.description.message}</Text>}
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

          {/* Points Possible */}
          <View style={styles.field}>
            <Text style={styles.label}>Points Possible *</Text>
            <Controller
              control={control}
              name="pointsPossible"
              render={({ field: { value, onChange } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="100"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="number-pad"
                  editable={!isSubmitting}
                />
              )}
            />
            {formState.errors.pointsPossible && (
              <Text style={styles.error}>{formState.errors.pointsPossible.message}</Text>
            )}
          </View>

          {/* Submission Type */}
          <View style={styles.field}>
            <Text style={styles.label}>Submission Type *</Text>
            <Controller
              control={control}
              name="submissionType"
              render={({ field: { value, onChange } }) => (
                <View style={styles.typeContainer}>
                  {(['text', 'file'] as const).map((type) => (
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
                        {type === 'text' ? 'Text' : 'File Upload'}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            />
          </View>
        </Card>

        {/* Buttons */}
        <View style={styles.actions}>
          <Button
            label={isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Assignment' : 'Update Assignment'}
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
  textarea: { minHeight: 120, textAlignVertical: 'top' },
  error: { ...typography.caption, color: colors.error },

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

  actions: { gap: spacing.sm, marginTop: spacing.md },
  cancelButton: { backgroundColor: colors.gray100 },

  loader: { marginTop: spacing.lg },
});
