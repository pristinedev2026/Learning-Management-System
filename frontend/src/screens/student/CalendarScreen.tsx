import React from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/Card';
import { useMyCalendar } from '@/services/queries';
import { colors, spacing, typography } from '@/theme/tokens';

export function CalendarScreen() {
  const { data: calendar, isLoading } = useMyCalendar();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator style={styles.loader} color={colors.primary} />
      </SafeAreaView>
    );
  }

  // Group by month
  const sections: { title: string; data: any[] }[] = [];
  calendar?.forEach((item) => {
    const date = new Date(item.dueDate);
    const monthYear = date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    let section = sections.find((s) => s.title === monthYear);
    if (!section) {
      section = { title: monthYear, data: [] };
      sections.push(section);
    }
    section.data.push(item);
  });

  return (
    <SafeAreaView style={styles.container}>
      <Text style={[typography.display, styles.header]}>Calendar</Text>
      <FlatList
        data={sections}
        keyExtractor={(item) => item.title}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={typography.subtitle}>No upcoming events</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>{item.title}</Text>
            {item.data.map((event: any) => (
              <CalendarItemCard key={event.id} item={event} />
            ))}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

function CalendarItemCard({ item }: { item: any }) {
  const date = new Date(item.dueDate);
  const day = date.getDate().toString().padStart(2, '0');
  const month = date.toLocaleDateString(undefined, { month: 'short' });

  return (
    <Card style={styles.card}>
      <View style={styles.dateBox}>
        <Text style={styles.day}>{day}</Text>
        <Text style={styles.month}>{month}</Text>
      </View>
      <View style={styles.info}>
        <Text style={typography.subtitle} numberOfLines={1}>{item.title}</Text>
        <Text style={typography.caption}>{item.courseTitle} • {item.type}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  section: { marginBottom: spacing.lg },
  sectionHeader: { ...typography.subtitle, color: colors.primary, marginBottom: spacing.sm },
  card: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, gap: spacing.md },
  dateBox: { alignItems: 'center', width: 40 },
  day: { ...typography.subtitle, color: colors.text },
  month: { ...typography.caption, textTransform: 'uppercase', color: colors.inkMuted },
  info: { flex: 1 },
  loader: { marginTop: spacing.xxl },
  emptyState: { alignItems: 'center', paddingTop: spacing.xxl },
});
