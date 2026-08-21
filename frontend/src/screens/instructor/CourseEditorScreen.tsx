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
  Image,
  Pressable,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useForm, Controller } from 'react-hook-form';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { InstructorCoursesStackParamList } from '@/navigation/InstructorTabs';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useCreateCourse, useUpdateCourse, useUploadImage } from '@/services/queries';
import { colors, spacing, typography } from '@/theme/tokens';
import { API_BASE_URL } from '@/services/config';
import type { Course } from '@/types';
import { Ionicons } from '@expo/vector-icons';

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
  const uploadMutation = useUploadImage();
  const isLoading = createMutation.isPending || updateMutation.isPending || uploadMutation.isPending;

  const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<CourseFormData>({
    defaultValues: {
      title: course?.title ?? '',
      description: course?.description ?? '',
      syllabus: course?.syllabus ?? '',
      category: course?.category ?? '',
      coverImageUrl: course?.coverImageUrl ?? '',
    },
  });

  const coverImageUrl = watch('coverImageUrl');

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

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const selectedImage = result.assets[0].uri;
      try {
        const { url } = await uploadMutation.mutateAsync(selectedImage);
        // Prepend base URL if it's a relative path from the server
        const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL.replace('/api', '')}${url}`;
        console.log('Uploaded image URL:', fullUrl);
        setValue('coverImageUrl', fullUrl);
      } catch (error) {
        console.error('Upload error:', error);
        Alert.alert('Upload Failed', 'Could not upload image. Please try again.');
      }
    }
  };

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

          {/* Cover Image Upload */}
          <View style={styles.field}>
            <Text style={styles.label}>Course Cover Image</Text>
            {coverImageUrl ? (
              <View style={styles.imagePreviewContainer}>
                <Image
                  source={{ uri: coverImageUrl }}
                  style={styles.imagePreview}
                  resizeMode="cover"
                />
                <Pressable
                  onPress={() => setValue('coverImageUrl', '')}
                  style={styles.removeImageBtn}
                >
                  <Ionicons name="close-circle" size={24} color={colors.danger} />
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={pickImage}
                style={styles.uploadPlaceholder}
                disabled={isLoading}
              >
                {uploadMutation.isPending ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <>
                    <Ionicons name="camera-outline" size={32} color={colors.inkMuted} />
                    <Text style={typography.caption}>Upload Image (16:9 recommended)</Text>
                  </>
                )}
              </Pressable>
            )}
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

  uploadPlaceholder: {
    height: 150,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    gap: spacing.xs,
  },
  imagePreviewContainer: {
    height: 150,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.gray100,
    borderWidth: 1,
    borderColor: colors.border,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  removeImageBtn: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: 'white',
    borderRadius: 12,
  },
});
