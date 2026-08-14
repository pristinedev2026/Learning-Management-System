import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { InstructorCoursesStackParamList } from '@/navigation/InstructorTabs';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useCreateCourse, useUpdateCourse } from '@/services/queries';
import { colors, spacing, typography } from '@/theme/tokens';
import type { Course } from '@/types';

type Props = NativeStackScreenProps<InstructorCoursesStackParamList, 'CourseEditor'>;

type CourseFormData = {
  title: string;
  description: string;
  syllabus: string;
  category: string;
  coverImageUrl?: string;
};

/**
 * CourseEditorScreen
 * Create or edit a course with form validation.
 */
export function CourseEditorScreen({ route, navigation }: Props) {
  const { mode, course } = route.params;
  const createMutation = useCreateCourse();
  const updateMutation = useUpdateCourse();
  const isLoading = createMutation.isPending || updateMutation.isPending;

  const { control, handleSubmit, reset, formState: { errors } } = useForm<CourseFormData>({
    defaultValues: {
      title: course?.title ?? '',
      description: course?.description ?? '',
      syllabus: course?.syllabus ?? '',
      category: course?.category ?? '',
      coverImageUrl: course?.coverImageUrl ?? '',
    },
  });

  useEffect(() => {
    if (course) {
      reset({
        title: course.title,
        description: course.description,
        syllabus: course.syllabus,
        category: course.category,
        coverImageUrl: course.coverImageUrl,
      });
    }
  }, [course, reset]);

  const onSubmit = async (data: CourseFormData) => {
    try {
      if (mode === 'create') {
        await createMutation.mutateAsync(data);
        Alert.alert('Success', 'Course created!', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else if (mode === 'edit' && course) {
        await updateMutation.mutateAsync({
          courseId: course.id,
          ...data,
        });
        Alert.alert('Success', 'Course updated!', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to save course');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={typography.display}>{mode === 'create' ? 'New Course' : 'Edit Course'}</Text>

        <Card style={styles.section}>
          {/* Title */}
          <View style={styles.field}>
            <Text style={styles.label}>Course Title *</Text>
            <Controller
              control={control}
              name="title"
              rules={{ required: 'Title is required' }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="e.g. React Native Fundamentals"
                  placeholderTextColor={colors.inkMuted}
                  value={value}
                  onChangeText={onChange}
                  editable={!isLoading}
                />
              )}
            />
            {errors.title && <Text style={styles.error}>{errors.title.message}</Text>}
          </View>

          {/* Description */}
          <View style={styles.field}>
            <Text style={styles.label}>Description *</Text>
            <Controller
              control={control}
              name="description"
              rules={{ required: 'Description is required' }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="What students will learn..."
                  placeholderTextColor={colors.inkMuted}
                  value={value}
                  onChangeText={onChange}
                  multiline
                  numberOfLines={4}
                  editable={!isLoading}
                  textAlignVertical="top"
                />
              )}
            />
            {errors.description && <Text style={styles.error}>{errors.description.message}</Text>}
          </View>

          {/* Syllabus */}
          <View style={styles.field}>
            <Text style={styles.label}>Syllabus *</Text>
            <Controller
              control={control}
              name="syllabus"
              rules={{ required: 'Syllabus is required' }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Week-by-week course outline..."
                  placeholderTextColor={colors.inkMuted}
                  value={value}
                  onChangeText={onChange}
                  multiline
                  numberOfLines={6}
                  editable={!isLoading}
                  textAlignVertical="top"
                />
              )}
            />
            {errors.syllabus && <Text style={styles.error}>{errors.syllabus.message}</Text>}
          </View>

          {/* Category */}
          <View style={styles.field}>
            <Text style={styles.label}>Category *</Text>
            <Controller
              control={control}
              name="category"
              rules={{ required: 'Category is required' }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Mobile Development"
                  placeholderTextColor={colors.inkMuted}
                  value={value}
                  onChangeText={onChange}
                  editable={!isLoading}
                />
              )}
            />
            {errors.category && <Text style={styles.error}>{errors.category.message}</Text>}
          </View>

          {/* Cover Image URL (optional) */}
          <View style={styles.field}>
            <Text style={styles.label}>Cover Image URL (optional)</Text>
            <Controller
              control={control}
              name="coverImageUrl"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="https://example.com/image.jpg"
                  placeholderTextColor={colors.inkMuted}
                  value={value}
                  onChangeText={onChange}
                  editable={!isLoading}
                />
              )}
            />
          </View>
        </Card>

        {/* Submit Buttons */}
        <Button
          label={isLoading ? 'Saving...' : mode === 'create' ? 'Create Course' : 'Update Course'}
          onPress={handleSubmit(onSubmit)}
          loading={isLoading}
          style={styles.submitButton}
        />

        <Button
          label="Cancel"
          onPress={() => navigation.goBack()}
          style={styles.cancelButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },

  section: { gap: spacing.md },

  field: { gap: spacing.xs },
  label: { ...typography.body, fontWeight: '600', color: colors.ink },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 14,
    color: colors.ink,
    backgroundColor: colors.background,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },

  error: { ...typography.caption, color: colors.error },

  submitButton: { marginTop: spacing.lg },
  cancelButton: { marginTop: spacing.md },
});
