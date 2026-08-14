import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
} from 'react-native';
import { Button } from '@/components/Button';
import { useChangePasswordVoluntary } from '@/services/queries';
import { useAuthStore } from '@/store/authStore';
import { colors, spacing, typography } from '@/theme/tokens';

interface FormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function UserChangePasswordScreen({ navigation }: any) {
  const { updateUser } = useAuthStore();
  const changePasswordMutation = useChangePasswordVoluntary();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (values.newPassword !== values.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }

    try {
      const updatedUser = await changePasswordMutation.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      updateUser(updatedUser);
      Alert.alert('Success', 'Password updated successfully.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update password');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={typography.display}>Change Password</Text>
          <Text style={styles.subtitle}>Enter your current password and choose a new one.</Text>

          <View style={styles.field}>
            <Text style={typography.label}>CURRENT PASSWORD</Text>
            <Controller
              control={control}
              name="currentPassword"
              rules={{ required: 'Current password is required' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={colors.gray500}
                  secureTextEntry
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.currentPassword && <Text style={styles.error}>{errors.currentPassword.message}</Text>}
          </View>

          <View style={styles.field}>
            <Text style={typography.label}>NEW PASSWORD</Text>
            <Controller
              control={control}
              name="newPassword"
              rules={{
                required: 'New password is required',
                minLength: { value: 8, message: 'At least 8 characters' },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={colors.gray500}
                  secureTextEntry
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.newPassword && <Text style={styles.error}>{errors.newPassword.message}</Text>}
          </View>

          <View style={styles.field}>
            <Text style={typography.label}>CONFIRM NEW PASSWORD</Text>
            <Controller
              control={control}
              name="confirmPassword"
              rules={{ required: 'Please confirm your new password' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={colors.gray500}
                  secureTextEntry
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.confirmPassword && (
              <Text style={styles.error}>{errors.confirmPassword.message}</Text>
            )}
          </View>

          <Button
            label="Update Password"
            onPress={handleSubmit(onSubmit)}
            loading={changePasswordMutation.isPending}
            style={styles.submitButton}
          />

          <Button
            label="Cancel"
            variant="secondary"
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md },
  subtitle: { ...typography.body, color: colors.inkMuted, marginBottom: spacing.lg },
  field: { marginBottom: spacing.md },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    marginTop: spacing.xs,
    backgroundColor: colors.surface,
    ...typography.body,
  },
  error: { ...typography.caption, color: colors.danger, marginTop: spacing.xs },
  submitButton: { marginTop: spacing.lg },
  cancelButton: { marginTop: spacing.md },
});
