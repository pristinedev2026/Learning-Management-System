import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@/navigation/AuthStack';
import { Button } from '@/components/Button';
import { colors, spacing, typography } from '@/theme/tokens';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

// There is no self-service password reset. Accounts authenticate by phone
// number, and only an administrator can reset or force a change on a
// user's password (see the admin screens) — so this screen just points
// the user there instead of collecting an email/phone for a reset link.
export function ForgotPasswordScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={typography.title}>Can't log in?</Text>
        <Text style={styles.body}>
          For security, password resets aren't self-service. Please contact your
          administrator and ask them to reset your password — they can do this without
          needing your old one.
        </Text>
        <Text style={styles.body}>
          Once they've reset it, you'll be asked to choose a new password the next time
          you log in.
        </Text>

        <Button label="Back to login" onPress={() => navigation.goBack()} style={styles.button} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: spacing.lg, paddingTop: spacing.xl },
  body: {
    ...typography.body,
    color: colors.inkMuted,
    marginTop: spacing.md,
  },
  button: { marginTop: spacing.xl },
});
