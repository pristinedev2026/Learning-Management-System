import React from 'react';
import { ActivityIndicator, FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AdminStackParamList } from '@/navigation/AdminStack';
import { Card } from '@/components/Card';
import { Tag } from '@/components/StatusPieces';
import { useAllUsers } from '@/services/queries';
import type { User } from '@/types';
import { colors, spacing, typography } from '@/theme/tokens';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminUsers'>;

export function AdminUsersScreen({ navigation }: Props) {
  const { data: users, isLoading, refetch, isRefetching } = useAllUsers();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={typography.display}>Users</Text>
        <Text style={styles.subtitle}>
          Reset a user's password or force them to set a new one at next login.
        </Text>
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={styles.loading} />
      ) : (
        <FlatList
          data={users ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          onRefresh={refetch}
          refreshing={isRefetching}
          renderItem={({ item }) => <UserRow user={item} onPress={() => navigation.navigate('AdminUserDetail', { userId: item.id })} />}
        />
      )}
    </SafeAreaView>
  );
}

function UserRow({ user, onPress }: { user: User; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${user.name}, ${user.role}`}>
      <Card style={styles.card}>
        <View style={styles.rowTop}>
          <View style={styles.nameWithIcon}>
            <Ionicons name="person-circle-outline" size={24} color={colors.primary} style={{ marginRight: spacing.xs }} />
            <Text style={typography.subtitle}>{user.name}</Text>
          </View>
          <Tag
            label={user.role}
            tone={user.role === 'admin' ? 'info' : user.role === 'instructor' ? 'progress' : 'neutral'}
          />
        </View>
        <Text style={styles.meta}>{user.phone}</Text>
        {user.mustChangePassword && (
          <Tag label="Must change password" tone="danger" />
        )}
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.inkMuted, marginTop: spacing.xs },
  loading: { marginTop: spacing.xl },
  list: { padding: spacing.lg, paddingTop: spacing.sm, gap: spacing.sm },
  card: { gap: spacing.xs, marginBottom: spacing.sm, alignItems: 'flex-start' },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
  nameWithIcon: { flexDirection: 'row', alignItems: 'center' },
  meta: { ...typography.caption },
});
