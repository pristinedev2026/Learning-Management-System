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
import { useSignUp } from '@/services/queries';
import { useAuthStore } from '@/store/authStore';
import type { Role } from '@/types';
import { colors, radius, spacing, typography } from '@/theme/tokens';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

interface FormValues {
  name: string;
  phone: string;
  password: string;
}

export function SignUpScreen({ navigation }: Props) {
  const [role, setRole] = React.useState<Role>('student');
  const setSession = useAuthStore((s) => s.setSession);
  const signUp = useSignUp();

  const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: { name: '', phone: '', password: '' },
  });

  const onSubmit = (values: FormValues) => {
    signUp.mutate(
      { name: values.name, phone: values.phone, password: values.password, role },
      {
        onSuccess: ({ user, accessToken }) => setSession(user, accessToken),
        onError: (error) => {
          Alert.alert(
            'Sign up failed',
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
        <ScrollView contentContainerStyle={styles.content}>
          <Logo width={120} />
          <Text style={[typography.label, { marginTop: spacing.lg }]}>I AM A</Text>
          <View style={styles.roleRow}>
            <RoleOption label="Student" selected={role === 'student'} onPress={() => setRole('student')} />
            <RoleOption
              label="Instructor"
              selected={role === 'instructor'}
              onPress={() => setRole('instructor')}
            />
          </View>

          <View style={styles.field}>
            <Text style={typography.label}>FULL NAME</Text>
            <Controller
              control={control}
              name="name"
              rules={{ required: 'Name is required' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Jordan Lee"
                  placeholderTextColor={colors.gray500}
                  accessibilityLabel="Full name"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.name && <Text style={styles.error}>{errors.name.message}</Text>}
          </View>

          <View style={styles.field}>
            <Text style={typography.label}>PHONE NUMBER</Text>
            <Controller
              control={control}
              name="phone"
              rules={{ required: 'Phone number is required' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="+1 555 010 1234"
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
              rules={{ required: 'Password is required', minLength: { value: 8, message: 'At least 8 characters' } }}
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

          <Button
            label="Create account"
            onPress={handleSubmit(onSubmit)}
            loading={signUp.isPending}
            style={styles.submitButton}
          />

          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            style={styles.linkButton}
          >
            <Text style={styles.link}>Already have an account? Log in</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function RoleOption({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={[styles.roleOption, selected && styles.roleOptionSelected]}
    >
      <Text style={[styles.roleLabel, selected && styles.roleLabelSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg, paddingVertical: spacing.xl },
  roleRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs, marginBottom: spacing.lg },
  roleOption: {
    flex: 1,
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  roleOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryMuted,
  },
  roleLabel: { ...typography.subtitle, color: colors.inkMuted },
  roleLabelSelected: { color: colors.primary },
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
  submitButton: { marginTop: spacing.sm },
  linkButton: { marginTop: spacing.lg, alignSelf: 'center' },
  link: { ...typography.subtitle, color: colors.primary },
});
