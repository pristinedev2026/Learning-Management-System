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
} from 'react-native';
import { Button } from '@/components/Button';
import { useChangePassword } from '@/services/queries';
import { useAuthStore } from '@/store/authStore';
import { colors, spacing, typography } from '@/theme/tokens';

interface FormValues {
  newPassword: string;
  confirmPassword: string;
}

// Gated in by RootNavigator whenever the signed-in user's
// `mustChangePassword` flag is set — i.e. right after an administrator
// resets or force-flags their password. There's no "current password"
// field: the user already proved who they are by logging in / holding a
// valid session, which is the same trust boundary the backend checks.
export function ChangePasswordScreen() {
  const updateUser = useAuthStore((s) => s.updateUser);
  const signOut = useAuthStore((s) => s.signOut);
  const changePassword = useChangePassword();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { newPassword: '', confirmPassword: '' } });

  const onSubmit = (values: FormValues) => {
    if (values.newPassword !== values.confirmPassword) {
      Alert.alert('Passwords do not match', 'Please re-enter your new password.');
      return;
    }
    changePassword.mutate(
      { newPassword: values.newPassword },
      {
        onSuccess: (user) => {
          Alert.alert('Password updated', 'Your password has been changed successfully.');
          updateUser(user);
        },
        onError: (error) => {
          Alert.alert(
            'Could not update password',
            error instanceof Error ? error.message : 'Something went wrong.'
          );
        },
      }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={styles.content}>
          <Text style={typography.title}>Choose a new password</Text>
          <Text style={styles.subtitle}>
            An administrator reset your password. Set a new one to continue.
          </Text>

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
                  accessibilityLabel="New password"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.newPassword && <Text style={styles.error}>{errors.newPassword.message}</Text>}
          </View>

          <View style={styles.field}>
            <Text style={typography.label}>CONFIRM PASSWORD</Text>
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
                  accessibilityLabel="Confirm new password"
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
            label="Update password"
            onPress={handleSubmit(onSubmit)}
            loading={changePassword.isPending}
            style={styles.submitButton}
          />

          <Button
            label="Log out instead"
            variant="secondary"
            onPress={() => signOut()}
            style={styles.secondaryButton}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.lg },
  subtitle: {
    ...typography.body,
    color: colors.inkMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
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
  error: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.xs,
  },
  submitButton: { marginTop: spacing.sm },
  secondaryButton: { marginTop: spacing.md },
});
