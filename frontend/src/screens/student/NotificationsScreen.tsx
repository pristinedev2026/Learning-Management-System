import React from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/Card';
import { useMyNotifications } from '@/services/queries';
import { colors, spacing, typography } from '@/theme/tokens';
import { Ionicons } from '@expo/vector-icons';

export function NotificationsScreen() {
  const { data: notifications, isLoading } = useMyNotifications();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator style={styles.loader} color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={[typography.display, styles.header]}>Notifications</Text>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={typography.subtitle}>No notifications</Text>
          </View>
        }
        renderItem={({ item }) => <NotificationCard notification={item} />}
      />
    </SafeAreaView>
  );
}

function NotificationCard({ notification }: { notification: any }) {
  const getIcon = () => {
    switch (notification.type) {
      case 'assignment': return 'document-text-outline';
      case 'grade': return 'ribbon-outline';
      case 'deadline': return 'time-outline';
      case 'announcement': return 'megaphone-outline';
      default: return 'notifications-outline';
    }
  };

  const time = new Date(notification.createdAt).toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
  });

  return (
    <Card style={[styles.card, !notification.read && styles.unread]}>
      <View style={styles.iconContainer}>
        <Ionicons name={getIcon() as any} size={24} color={colors.primary} />
      </View>
      <View style={styles.content}>
        <Text style={typography.subtitle}>{notification.title}</Text>
        <Text style={typography.body}>{notification.body}</Text>
        <Text style={styles.time}>{time}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  card: { flexDirection: 'row', marginBottom: spacing.sm, gap: spacing.md },
  unread: { borderLeftWidth: 4, borderLeftColor: colors.primary },
  iconContainer: { paddingTop: 2 },
  content: { flex: 1 },
  time: { ...typography.caption, color: colors.textDim, marginTop: 4 },
  loader: { marginTop: spacing.xxl },
  emptyState: { alignItems: 'center', paddingTop: spacing.xxl },
});
