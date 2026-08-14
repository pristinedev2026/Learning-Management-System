import React from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useAnnouncements } from '@/services/queries';
import { colors, spacing, typography } from '@/theme/tokens';

export function CourseAnnouncementsScreen({ route }: any) {
  const { courseId } = route.params;
  const { data: announcements, isLoading } = useAnnouncements(courseId);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={announcements}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.titleText}>{item.title}</Text>
            <Text style={styles.dateText}>{formatDate(item.postedAt)}</Text>
            <Text style={styles.bodyText}>{item.body}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No announcements yet.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: spacing.md },
  card: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  titleText: { ...typography.subtitle, marginBottom: 4 },
  dateText: { ...typography.label, marginBottom: spacing.sm },
  bodyText: { ...typography.body },
  emptyText: { textAlign: 'center', color: colors.gray500, marginTop: spacing.xl, ...typography.body },
});
