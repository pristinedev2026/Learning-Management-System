import React from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { colors, radius, spacing, typography } from '@/theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import { Tag } from '@/components/StatusPieces';

export function ProfileScreen({ navigation }: any) {
  const { user, signOut } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: () => signOut() },
      ]
    );
  };

  if (!user) return null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
          </View>
          <Text style={typography.title}>{user.name}</Text>
          <Tag label={user.role} tone={user.role === 'admin' ? 'info' : user.role === 'instructor' ? 'progress' : 'neutral'} />
        </View>

        <Card style={styles.section}>
          <Text style={[typography.subtitle, styles.sectionTitle]}>Account Information</Text>

          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={20} color={colors.gray500} />
            <View style={styles.infoTextContainer}>
              <Text style={typography.caption}>PHONE NUMBER</Text>
              <Text style={typography.body}>{user.phone}</Text>
            </View>
          </View>

          {user.email && (
            <View style={[styles.infoRow, { marginTop: spacing.md }]}>
              <Ionicons name="mail-outline" size={20} color={colors.gray500} />
              <View style={styles.infoTextContainer}>
                <Text style={typography.caption}>EMAIL</Text>
                <Text style={typography.body}>{user.email}</Text>
              </View>
            </View>
          )}
        </Card>

        <Card style={styles.section}>
          <Text style={[typography.subtitle, styles.sectionTitle]}>Settings</Text>

          <Pressable
            style={({ pressed }) => [styles.settingsRow, pressed && styles.pressed]}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <View style={styles.settingsLabel}>
              <Ionicons name="person-outline" size={20} color={colors.ink} />
              <Text style={[typography.body, { marginLeft: spacing.sm }]}>Edit Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
          </Pressable>

          <View style={styles.separator} />

          <Pressable
            style={({ pressed }) => [styles.settingsRow, pressed && styles.pressed]}
            onPress={() => navigation.navigate('UserChangePassword')}
          >
            <View style={styles.settingsLabel}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.ink} />
              <Text style={[typography.body, { marginLeft: spacing.sm }]}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
          </Pressable>
        </Card>

        <Button
          label="Log Out"
          onPress={handleLogout}
          variant="secondary"
          style={styles.logoutButton}
        />

        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  header: { alignItems: 'center', gap: spacing.sm, marginVertical: spacing.xl },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  avatarText: { fontSize: 32, color: 'white', fontWeight: 'bold' },
  section: { padding: spacing.md, borderRadius: radius.lg },
  sectionTitle: { marginBottom: spacing.md, color: colors.inkMuted },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  infoTextContainer: { flex: 1 },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  settingsLabel: { flexDirection: 'row', alignItems: 'center' },
  separator: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xs },
  pressed: { opacity: 0.7 },
  logoutButton: { marginTop: spacing.xl, borderColor: colors.danger },
  versionText: {
    textAlign: 'center',
    color: colors.gray400,
    ...typography.caption,
    marginTop: spacing.md,
  },
});
