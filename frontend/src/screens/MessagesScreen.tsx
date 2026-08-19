import React from 'react';
import { ActivityIndicator, FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/Card';
import { useConversations } from '@/services/queries';
import { colors, spacing, typography } from '@/theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import { useChatStore } from '@/store/chatStore';

export function MessagesScreen({ navigation }: any) {
  const { data: conversations, isLoading, refetch, isRefetching } = useConversations();
  const connect = useChatStore((s) => s.connect);

  React.useEffect(() => {
    connect();
  }, [connect]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator style={styles.loader} color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={typography.display}>Messages</Text>
      </View>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.user.id}
        contentContainerStyle={styles.list}
        onRefresh={refetch}
        refreshing={isRefetching}
        renderItem={({ item }) => (
          <Pressable onPress={() => navigation.navigate('Chat', { user: item.user })}>
            <Card style={styles.card}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={24} color={colors.primary} />
              </View>
              <View style={styles.body}>
                <View style={styles.topRow}>
                  <Text style={typography.subtitle}>{item.user.name}</Text>
                  <Text style={styles.time}>
                    {new Date(item.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <Text style={styles.lastMsg} numberOfLines={1}>
                  {item.lastMessage.body}
                </Text>
              </View>
              {!item.lastMessage.read && item.lastMessage.receiverId !== item.user.id && (
                <View style={styles.unread} />
              )}
            </Card>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={typography.body}>No conversations yet.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.lg },
  list: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  loader: { marginTop: spacing.xxl },
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primaryMuted, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, gap: 2 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  time: { ...typography.caption, color: colors.inkMuted },
  lastMsg: { ...typography.body, fontSize: 14, color: colors.inkMuted },
  unread: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  empty: { alignItems: 'center', marginTop: spacing.xxl },
});
