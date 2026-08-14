import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { StudentCatalogStackParamList } from '@/navigation/StudentTabs';
import { Card } from '@/components/Card';
import { Tag } from '@/components/StatusPieces';
import { useCourseCatalog } from '@/services/queries';
import type { Course } from '@/types';
import { colors, radius, spacing, typography } from '@/theme/tokens';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<StudentCatalogStackParamList, 'CourseCatalog'>;

export function CourseCatalogScreen({ navigation }: Props) {
  const [search, setSearch] = React.useState('');
  const { data: courses, isLoading, isError, refetch, isRefetching } = useCourseCatalog(search);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={typography.display}>Explore courses</Text>
        <TextInput
          style={styles.search}
          placeholder="Search by title or topic"
          placeholderTextColor={colors.gray500}
          value={search}
          onChangeText={setSearch}
          accessibilityLabel="Search courses"
          accessibilityHint="Filters the course catalog as you type"
          returnKeyType="search"
        />
      </View>

      {isLoading ? (
        <ActivityIndicator style={styles.loader} color={colors.primary} />
      ) : isError ? (
        <View style={styles.emptyState}>
          <Text style={typography.subtitle}>Couldn't load courses</Text>
          <Text style={styles.emptyBody}>Check your connection and try again.</Text>
        </View>
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onRefresh={refetch}
          refreshing={isRefetching}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={typography.subtitle}>No courses match "{search}"</Text>
              <Text style={styles.emptyBody}>Try a different search term.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <CourseCard
              course={item}
              onPress={() => navigation.navigate('CourseDetail', { courseId: item.id })}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

function CourseCard({ course, onPress }: { course: Course; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${course.title}, by ${course.instructorName}`}
    >
      <Card style={styles.card}>
        <View style={styles.thumbnail}>
          <Ionicons name="book-outline" size={32} color={colors.primary} />
        </View>
        <View style={styles.cardBody}>
          <Tag label={course.category} tone="info" />
          <Text style={typography.subtitle} numberOfLines={2}>
            {course.title}
          </Text>
          <Text style={styles.instructor}>{course.instructorName}</Text>
          <Text style={styles.studentCount}>
            {course.studentCount.toLocaleString()} students
          </Text>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md },
  search: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    ...typography.body,
  },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, gap: spacing.md },
  card: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailInitial: { ...typography.title, color: colors.primary },
  cardBody: { flex: 1, gap: spacing.xs },
  instructor: { ...typography.caption },
  studentCount: { ...typography.caption, color: colors.gray500 },
  loader: { marginTop: spacing.xl },
  emptyState: { alignItems: 'center', paddingTop: spacing.xxl, paddingHorizontal: spacing.xl },
  emptyBody: { ...typography.caption, marginTop: spacing.xs, textAlign: 'center' },
});
