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
import { useUpdateProfile } from '@/services/queries';
import { useAuthStore } from '@/store/authStore';
import { colors, spacing, typography } from '@/theme/tokens';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

interface FormValues {
  name: string;
  email: string;
}

export function EditProfileScreen({ navigation }: any) {
  const { user, updateUser } = useAuthStore();
  const updateProfileMutation = useUpdateProfile();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const updatedUser = await updateProfileMutation.mutateAsync(values);
      updateUser(updatedUser);
      Alert.alert('Success', 'Profile updated successfully.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update profile');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={typography.display}>Edit Profile</Text>
          <Text style={styles.subtitle}>Update your personal information.</Text>

          <View style={styles.field}>
            <Text style={typography.label}>FULL NAME</Text>
            <Controller
              control={control}
              name="name"
              rules={{ required: 'Name is required' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Your name"
                  placeholderTextColor={colors.gray500}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.name && <Text style={styles.error}>{errors.name.message}</Text>}
          </View>

          <View style={styles.field}>
            <Text style={typography.label}>EMAIL ADDRESS</Text>
            <Controller
              control={control}
              name="email"
              rules={{
                required: 'Email is required',
                pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.gray500}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}
          </View>

          <View style={styles.field}>
            <Text style={typography.label}>PHONE NUMBER (READ-ONLY)</Text>
            <TextInput
              style={[styles.input, styles.readOnlyInput]}
              value={user?.phone}
              editable={false}
            />
            <Text style={styles.hint}>Phone number cannot be changed once the account is created.</Text>
          </View>

          <Button
            label="Save Changes"
            onPress={handleSubmit(onSubmit)}
            loading={updateProfileMutation.isPending}
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
  readOnlyInput: { backgroundColor: colors.gray100, color: colors.gray500 },
  error: { ...typography.caption, color: colors.danger, marginTop: spacing.xs },
  hint: { ...typography.caption, color: colors.inkMuted, marginTop: spacing.xs },
  submitButton: { marginTop: spacing.lg },
  cancelButton: { marginTop: spacing.md },
});
