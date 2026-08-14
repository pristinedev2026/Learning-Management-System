import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
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
import { Logo } from '@/components/Logo';
import { useLogin } from '@/services/queries';
import { useAuthStore } from '@/store/authStore';
import { colors, spacing, typography } from '@/theme/tokens';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

interface FormValues {
  phone: string;
  password: string;
}

export function LoginScreen({ navigation }: Props) {
  const setSession = useAuthStore((s) => s.setSession);
  const login = useLogin();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { phone: '', password: '' } });

  const onSubmit = (values: FormValues) => {
    login.mutate(values, {
      onSuccess: ({ user, accessToken }) => {
        Alert.alert('Login successful', `Welcome back, ${user.name}.`);
        setSession(user, accessToken);
      },
      onError: (error) => {
        Alert.alert(
          'Login failed',
          error instanceof Error ? error.message : 'Invalid phone number or password.'
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
          <Logo />
          <Text style={styles.subtitle}>Log in to keep learning.</Text>

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
                  autoCapitalize="none"
                  keyboardType="phone-pad"
                  accessibilityLabel="Phone number"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.phone && <Text style={styles.error}>{errors.phone.message}</Text>}
          </View>

          <View style={styles.field}>
            <Text style={typography.label}>PASSWORD</Text>
            <Controller
              control={control}
              name="password"
              rules={{ required: 'Password is required' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={colors.gray500}
                  secureTextEntry
                  accessibilityLabel="Password"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}
          </View>

          {login.isError && (
            <Text style={styles.error}>
              {login.error instanceof Error ? login.error.message : 'Something went wrong.'}
            </Text>
          )}

          <Button
            label="Log in"
            onPress={handleSubmit(onSubmit)}
            loading={login.isPending}
            style={styles.submitButton}
          />

          <Pressable
            onPress={() => navigation.navigate('ForgotPassword')}
            accessibilityRole="button"
            style={styles.linkButton}
          >
            <Text style={styles.link}>Forgot password?</Text>
          </Pressable>

          <View style={styles.footer}>
            <Text style={typography.body}>New here? </Text>
            <Pressable onPress={() => navigation.navigate('SignUp')} accessibilityRole="button">
              <Text style={styles.link}>Create an account</Text>
            </Pressable>
          </View>

          <Text style={styles.hint}>
            Demo accounts (seeded on the backend): 091122332 (student) ·
            091122331 (instructor) · 091122330 (admin) — password: password123
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.xl },
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
  linkButton: { marginTop: spacing.lg, alignSelf: 'center' },
  link: {
    ...typography.subtitle,
    color: colors.primary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  hint: {
    ...typography.caption,
    color: colors.gray500,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
});
