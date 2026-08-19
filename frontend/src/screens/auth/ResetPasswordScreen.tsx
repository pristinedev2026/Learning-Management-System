import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@/navigation/AuthStack';
import { Button } from '@/components/Button';
import { useResetPassword } from '@/services/queries';
import { colors, spacing, typography } from '@/theme/tokens';

type Props = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>;

interface FormValues {
  code: string;
  newPassword: string;
}

export function ResetPasswordScreen({ route, navigation }: Props) {
  const { phone } = route.params;
  const resetPassword = useResetPassword();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { code: '', newPassword: '' } });

  const onSubmit = (values: FormValues) => {
    resetPassword.mutate(
      { phone, ...values },
      {
        onSuccess: (data) => {
          Alert.alert('Success', data.message, [
            { text: 'OK', onPress: () => navigation.navigate('Login') },
          ]);
        },
        onError: (error) => {
          Alert.alert(
            'Error',
            error instanceof Error ? error.message : 'Failed to reset password.'
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
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={typography.title}>Reset your password</Text>
          <Text style={styles.subtitle}>Enter the 6-digit code sent to {phone}.</Text>

          <View style={styles.field}>
            <Text style={typography.label}>RESET CODE</Text>
            <Controller
              control={control}
              name="code"
              rules={{ required: 'Code is required' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="123456"
                  placeholderTextColor={colors.gray500}
                  keyboardType="number-pad"
                  maxLength={6}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.code && <Text style={styles.error}>{errors.code.message}</Text>}
          </View>

          <View style={styles.field}>
            <Text style={typography.label}>NEW PASSWORD</Text>
            <Controller
              control={control}
              name="newPassword"
              rules={{
                required: 'New password is required',
                minLength: { value: 8, message: 'Password must be at least 8 characters' },
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

          <Button
            label="Reset Password"
            onPress={handleSubmit(onSubmit)}
            loading={resetPassword.isPending}
            style={styles.submitButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { padding: spacing.lg, paddingTop: spacing.xl },
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
  submitButton: { marginTop: spacing.lg },
});
