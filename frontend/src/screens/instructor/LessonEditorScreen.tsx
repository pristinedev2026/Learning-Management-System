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
  Pressable,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { InstructorCoursesStackParamList } from '@/navigation/InstructorTabs';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useCreateLesson } from '@/services/queries';
import { colors, spacing, typography } from '@/theme/tokens';
import type { LessonType, Lesson } from '@/types';

type Props = NativeStackScreenProps<InstructorCoursesStackParamList, 'LessonEditor'>;

type LessonFormData = {
  title: string;
  type: LessonType;
  order: string;
  content: string;
  durationMinutes?: string;
};

/**
 * LessonEditorScreen
 * Create or edit a lesson (video, text, or PDF).
 */
export function LessonEditorScreen({ route, navigation }: Props) {
  const { courseId, moduleId, mode, lesson } = route.params;
  const createMutation = useCreateLesson();
  const isLoading = createMutation.isPending;

  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<LessonFormData>({
    defaultValues: {
      title: lesson?.title ?? '',
      type: lesson?.type ?? 'video',
      order: lesson ? String(lesson.order) : '',
      content: lesson?.content ?? '',
      durationMinutes: lesson?.durationMinutes ? String(lesson.durationMinutes) : '',
    },
  });

  const lessonType = watch('type');

  useEffect(() => {
    if (lesson) {
      reset({
        title: lesson.title,
        type: lesson.type,
        order: String(lesson.order),
        content: lesson.content,
        durationMinutes: lesson.durationMinutes ? String(lesson.durationMinutes) : '',
      });
    }
  }, [lesson, reset]);

  const onSubmit = async (data: LessonFormData) => {
    const order = parseInt(data.order, 10);
    if (!data.title || !data.content || !order || order < 1) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      if (mode === 'create') {
        await createMutation.mutateAsync({
          courseId,
          moduleId,
          title: data.title,
          type: data.type,
          order,
          content: data.content,
          durationMinutes: data.durationMinutes ? parseInt(data.durationMinutes, 10) : undefined,
        });
        Alert.alert('Success', 'Lesson created!', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      }
      // TODO: Add edit support once backend has PATCH endpoint for lessons
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to save lesson');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={typography.display}>{mode === 'create' ? 'New Lesson' : 'Edit Lesson'}</Text>

        <Card style={styles.section}>
          {/* Title */}
          <View style={styles.field}>
            <Text style={styles.label}>Lesson Title *</Text>
            <Controller
              control={control}
              name="title"
              rules={{ required: 'Title is required' }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Introduction to React Native"
                  placeholderTextColor={colors.inkMuted}
                  value={value}
                  onChangeText={onChange}
                  editable={!isLoading}
                />
              )}
            />
            {errors.title && <Text style={styles.error}>{errors.title.message}</Text>}
          </View>

          {/* Type */}
          <View style={styles.field}>
            <Text style={styles.label}>Content Type *</Text>
            <Controller
              control={control}
              name="type"
              render={({ field: { onChange, value } }) => (
                <View style={styles.typeSelector}>
                  {(['video', 'text', 'pdf'] as const).map((type) => (
                    <Pressable
                      key={type}
                      onPress={() => onChange(type)}
                      style={[
                        styles.typeButton,
                        value === type && styles.typeButtonActive,
                      ]}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: value === type }}
                    >
                      <Text
                        style={[
                          styles.typeButtonText,
                          value === type && styles.typeButtonTextActive,
                        ]}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            />
          </View>

          {/* Order */}
          <View style={styles.field}>
            <Text style={styles.label}>Lesson Number (Order) *</Text>
            <Controller
              control={control}
              name="order"
              rules={{ required: 'Order is required' }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 1"
                  placeholderTextColor={colors.inkMuted}
                  value={value}
                  onChangeText={onChange}
                  keyboardType="number-pad"
                  editable={!isLoading}
                />
              )}
            />
            {errors.order && <Text style={styles.error}>{errors.order.message}</Text>}
          </View>

          {/* Duration (for videos) */}
          {lessonType === 'video' && (
            <View style={styles.field}>
              <Text style={styles.label}>Duration (minutes)</Text>
              <Controller
                control={control}
                name="durationMinutes"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 15"
                    placeholderTextColor={colors.inkMuted}
                    value={value}
                    onChangeText={onChange}
                    keyboardType="number-pad"
                    editable={!isLoading}
                  />
                )}
              />
            </View>
          )}

          {/* Content */}
          <View style={styles.field}>
            <Text style={styles.label}>Content *</Text>
            <Text style={styles.hint}>
              {lessonType === 'video' && 'Video URL (e.g., https://example.com/video.mp4)'}
              {lessonType === 'text' && 'Markdown formatted text content'}
              {lessonType === 'pdf' && 'PDF file URL (e.g., https://example.com/doc.pdf)'}
            </Text>
            <Controller
              control={control}
              name="content"
              rules={{ required: 'Content is required' }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder={
                    lessonType === 'video'
                      ? 'https://example.com/video.mp4'
                      : lessonType === 'pdf'
                        ? 'https://example.com/document.pdf'
                        : '# Heading\n\nYour markdown content here...'
                  }
                  placeholderTextColor={colors.inkMuted}
                  value={value}
                  onChangeText={onChange}
                  multiline
                  numberOfLines={8}
                  editable={!isLoading}
                  textAlignVertical="top"
                />
              )}
            />
            {errors.content && <Text style={styles.error}>{errors.content.message}</Text>}
          </View>
        </Card>

        {/* Submit Buttons */}
        <Button
          label={isLoading ? 'Saving...' : 'Create Lesson'}
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
    minHeight: 150,
    textAlignVertical: 'top',
  },

  typeSelector: { flexDirection: 'row', gap: spacing.sm },
  typeButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeButtonText: { ...typography.caption, fontWeight: '600', color: colors.ink },
  typeButtonTextActive: { color: 'white' },

  error: { ...typography.caption, color: colors.error },
  hint: { ...typography.caption, color: colors.inkMuted, fontStyle: 'italic' },

  submitButton: { marginTop: spacing.lg },
  cancelButton: { marginTop: spacing.md },
});
