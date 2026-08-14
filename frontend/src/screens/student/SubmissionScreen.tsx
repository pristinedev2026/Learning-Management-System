import React, { useState } from 'react';
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
import * as DocumentPicker from 'expo-document-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { StudentCatalogStackParamList } from '@/navigation/StudentTabs';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useSubmitAssignment } from '@/services/queries';
import { useAuthStore } from '@/store/authStore';
import { colors, spacing, typography } from '@/theme/tokens';
import type { Assignment } from '@/types';

type Props = NativeStackScreenProps<StudentCatalogStackParamList, 'Submission'>;

type SubmissionFormData = {
  content?: string;
  fileUrl?: string;
};

/**
 * SubmissionScreen
 * Handles assignment submission: text entry or file upload based on assignment type.
 * For now, file uploads store a placeholder URL. A real implementation would
 * upload to cloud storage (S3, Cloudinary, etc.) and return the URL.
 */
export function SubmissionScreen({ route, navigation }: Props) {
  const { assignment, existingSubmission } = route.params;
  const user = useAuthStore((s) => s.user);
  const submitMutation = useSubmitAssignment();
  const { control, watch, setValue, handleSubmit } = useForm<SubmissionFormData>({
    defaultValues: {
      content: existingSubmission?.content ?? '',
      fileUrl: existingSubmission?.fileUrl ?? '',
    },
  });

  const [selectedFileName, setSelectedFileName] = useState<string | null>(
    existingSubmission?.fileUrl ? 'Previously uploaded file' : null
  );

  const contentValue = watch('content');
  const fileUrlValue = watch('fileUrl');

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
      });

      if (result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setSelectedFileName(file.name);
        // In a real app, upload the file to cloud storage here
        // For now, just store a placeholder URL
        setValue('fileUrl', `file://${file.uri}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick file');
      console.error(error);
    }
  };

  const onSubmit = async (data: SubmissionFormData) => {
    if (!user) {
      Alert.alert('Error', 'Not logged in');
      return;
    }

    // Validate submission based on type
    if (assignment.submissionType === 'text' && !data.content?.trim()) {
      Alert.alert('Error', 'Please enter your submission text');
      return;
    }

    if (assignment.submissionType === 'file' && !data.fileUrl) {
      Alert.alert('Error', 'Please select a file to submit');
      return;
    }

    try {
      await submitMutation.mutateAsync({
        assignmentId: assignment.id,
        studentId: user.id,
        content: data.content,
        fileUrl: data.fileUrl,
      });

      Alert.alert('Success', 'Assignment submitted successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to submit assignment');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={typography.display}>Submit Assignment</Text>
        <Text style={styles.subtitle}>{assignment.title}</Text>

        <Card style={styles.section}>
          {assignment.submissionType === 'text' ? (
            <>
              <Text style={typography.subtitle}>Your answer</Text>
              <Controller
                control={control}
                name="content"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your response here..."
                    placeholderTextColor={colors.inkMuted}
                    multiline
                    numberOfLines={10}
                    value={value}
                    onChangeText={onChange}
                    textAlignVertical="top"
                  />
                )}
              />
              <Text style={styles.charCount}>
                {contentValue?.length ?? 0} characters
              </Text>
            </>
          ) : (
            <>
              <Text style={typography.subtitle}>Upload file</Text>
              <Text style={styles.label}>
                Supported formats: PDF, DOC, DOCX, Images, etc.
              </Text>

              <Pressable
                onPress={handlePickFile}
                style={({ pressed }) => [
                  styles.filePickerButton,
                  pressed && { backgroundColor: colors.gray100 },
                ]}
              >
                <Text style={styles.filePickerText}>
                  {selectedFileName ? `📎 ${selectedFileName}` : '+ Choose file'}
                </Text>
              </Pressable>

              {fileUrlValue && (
                <Pressable
                  onPress={() => {
                    setValue('fileUrl', '');
                    setSelectedFileName(null);
                  }}
                  style={styles.clearFileButton}
                >
                  <Text style={styles.clearFileText}>Remove file</Text>
                </Pressable>
              )}
            </>
          )}
        </Card>

        {/* Instructions */}
        <Card style={styles.section}>
          <Text style={typography.subtitle}>Guidelines</Text>
          <Text style={styles.guideline}>
            • Make sure your submission is complete before submitting
          </Text>
          <Text style={styles.guideline}>
            • You can resubmit until the due date
          </Text>
          <Text style={styles.guideline}>
            • Your work will be graded and feedback provided by the instructor
          </Text>
        </Card>

        {/* Submit Button */}
        <Button
          label="Submit"
          onPress={handleSubmit(onSubmit)}
          loading={submitMutation.isPending}
          style={styles.submitButton}
        />

        <Button
          label="← Cancel"
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

  subtitle: { ...typography.body, color: colors.inkMuted, marginTop: spacing.xs },

  section: { gap: spacing.sm },
  label: { ...typography.caption, color: colors.inkMuted, marginBottom: spacing.sm },

  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontFamily: 'Courier New',
    fontSize: 14,
    color: colors.ink,
    backgroundColor: colors.background,
    minHeight: 150,
  },
  charCount: { ...typography.caption, color: colors.inkMuted, marginTop: spacing.xs },

  filePickerButton: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.gray50,
  },
  filePickerText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '500',
  },

  clearFileButton: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
  },
  clearFileText: { ...typography.caption, color: colors.warning, fontWeight: '500' },

  guideline: { ...typography.body, color: colors.inkMuted, marginBottom: spacing.sm, lineHeight: 20 },

  submitButton: { marginTop: spacing.lg },
  cancelButton: { marginTop: spacing.md },
});
