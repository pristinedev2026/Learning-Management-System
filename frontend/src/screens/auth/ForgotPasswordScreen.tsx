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
import { useForgotPassword } from '@/services/queries';
import { colors, spacing, typography } from '@/theme/tokens';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

interface FormValues {
  phone: string;
}

export function ForgotPasswordScreen({ navigation }: Props) {
  const forgotPassword = useForgotPassword();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { phone: '' } });

  const onSubmit = (values: FormValues) => {
    forgotPassword.mutate(values.phone, {
      onSuccess: () => {
        Alert.alert('Code Sent', 'For the demo, the code is 123456.', [
          {
            text: 'OK',
            onPress: () => navigation.navigate('ResetPassword', { phone: values.phone }),
          },
        ]);
      },
      onError: (error) => {
        Alert.alert(
          'Error',
          error instanceof Error ? error.message : 'Something went wrong.'
        );
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={typography.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            Enter your phone number and we'll send you a code to reset your password.
          </Text>

          <View style={styles.field}>
            <Text style={typography.label}>PHONE NUMBER</Text>
            <Controller
              control={control}
              name="phone"
              rules={{ required: 'Phone number is required' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="+1 555 010 1001"
                  placeholderTextColor={colors.gray500}
                  keyboardType="phone-pad"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.phone && <Text style={styles.error}>{errors.phone.message}</Text>}
          </View>

          <Button
            label="Send Reset Code"
            onPress={handleSubmit(onSubmit)}
            loading={forgotPassword.isPending}
            style={styles.submitButton}
          />

          <Button
            label="Back to Login"
            onPress={() => navigation.goBack()}
            tone="ghost"
            style={styles.backButton}
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
  submitButton: { marginTop: spacing.sm },
  backButton: { marginTop: spacing.md },
});
