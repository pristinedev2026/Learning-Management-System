import React from 'react';
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
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AdminStackParamList } from '@/navigation/AdminStack';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Tag } from '@/components/StatusPieces';
import { useAdminForcePasswordChange, useAdminResetPassword, useAllUsers } from '@/services/queries';
import { colors, spacing, typography } from '@/theme/tokens';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminUserDetail'>;

// Admin resets a user's password without ever needing (or being shown)
// their old one — the backend accepts any admin-chosen new password and
// flags the account so the user must set their own at next login.
export function AdminUserDetailScreen({ route }: Props) {
  const { userId } = route.params;
  const { data: users } = useAllUsers();
  const user = users?.find((u) => u.id === userId);

  const [newPassword, setNewPassword] = React.useState('');
  const resetPassword = useAdminResetPassword();
  const forceChange = useAdminForcePasswordChange();

  const onReset = () => {
    if (newPassword.length < 8) {
      Alert.alert('Password too short', 'Enter at least 8 characters.');
      return;
    }
    resetPassword.mutate(
      { userId, newPassword },
      {
        onSuccess: () => {
          Alert.alert('Password reset', `${user?.name ?? 'This user'} must set a new password at next login.`);
          setNewPassword('');
        },
        onError: (error) => {
          Alert.alert('Reset failed', error instanceof Error ? error.message : 'Something went wrong.');
        },
      }
    );
  };

  const onForceChange = () => {
    forceChange.mutate(
      { userId },
      {
        onSuccess: () => {
          Alert.alert('Done', `${user?.name ?? 'This user'} will be asked to set a new password at next login.`);
        },
        onError: (error) => {
          Alert.alert('Failed', error instanceof Error ? error.message : 'Something went wrong.');
        },
      }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <View style={styles.content}>
          <Card style={styles.summaryCard}>
            <Text style={typography.title}>{user?.name ?? 'User'}</Text>
            <Text style={styles.meta}>{user?.phone}</Text>
            {user && <Tag label={user.role} tone="info" />}
            {user?.mustChangePassword && <Tag label="Must change password" tone="danger" />}
          </Card>

          <Text style={[typography.subtitle, styles.sectionTitle]}>Reset password</Text>
          <Text style={styles.body}>
            Set a new password for this user. You don't need to know their current one.
          </Text>
          <TextInput
            style={styles.input}
            placeholder="New password (min. 8 characters)"
            placeholderTextColor={colors.gray500}
            secureTextEntry
            accessibilityLabel="New password for this user"
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <Button
            label="Reset password"
            onPress={onReset}
            loading={resetPassword.isPending}
            style={styles.button}
          />

          <Text style={[typography.subtitle, styles.sectionTitle]}>Force password change</Text>
          <Text style={styles.body}>
            Require this user to choose a new password the next time they log in, without
            changing their current password yourself.
          </Text>
          <Button
            label="Force change at next login"
            variant="secondary"
            onPress={onForceChange}
            loading={forceChange.isPending}
            style={styles.button}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.xs },
  summaryCard: { gap: spacing.xs, alignItems: 'flex-start', marginBottom: spacing.md },
  meta: { ...typography.caption },
  sectionTitle: { marginTop: spacing.lg },
  body: { ...typography.body, color: colors.inkMuted, marginTop: spacing.xs, marginBottom: spacing.sm },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    ...typography.body,
  },
  button: { marginTop: spacing.md },
});
