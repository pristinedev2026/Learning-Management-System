import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
  Image,
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
  const [category, setCategory] = React.useState<string | undefined>();
  const { data: courses, isLoading, isError, refetch, isRefetching } = useCourseCatalog(search, category);

  const categories = ['Development', 'Business', 'Design', 'Marketing', 'Photography'];

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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContent}
        >
          <Pressable
            onPress={() => setCategory(undefined)}
            style={[styles.categoryTag, !category && styles.categoryTagActive]}
          >
            <Text style={[styles.categoryText, !category && styles.categoryTextActive]}>All</Text>
          </Pressable>
          {categories.map((cat) => (
            <Pressable
              key={cat}
              onPress={() => setCategory(cat)}
              style={[styles.categoryTag, category === cat && styles.categoryTagActive]}
            >
              <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>{cat}</Text>
            </Pressable>
          ))}
        </ScrollView>
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
  const coverUri = course.coverImageUrl && course.coverImageUrl.trim() !== ''
    ? { uri: course.coverImageUrl }
    : null;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${course.title}, by ${course.instructorName}`}
    >
      <Card style={styles.card}>
        <View style={styles.thumbnail}>
          {coverUri ? (
            <Image
              source={coverUri}
              style={styles.coverImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.iconPlaceholder}>
               <Ionicons name="book-outline" size={32} color={colors.primary} />
            </View>
          )}
        </View>
        <View style={styles.cardBody}>
          <View style={styles.cardHeader}>
            <Tag label={course.category} tone="info" />
            {course.price > 0 && (
              <Text style={styles.price}>${course.price}</Text>
            )}
          </View>
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
  categoryScroll: { marginTop: spacing.md },
  categoryContent: { gap: spacing.sm, paddingRight: spacing.lg },
  categoryTag: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.gray100,
  },
  categoryTagActive: { backgroundColor: colors.primary },
  categoryText: { ...typography.caption, color: colors.ink },
  categoryTextActive: { color: 'white', fontWeight: 'bold' },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, gap: spacing.md },
  card: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  iconPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryMuted,
  },
  thumbnailInitial: { ...typography.title, color: colors.primary },
  cardBody: { flex: 1, gap: spacing.xs },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { ...typography.caption, fontWeight: 'bold', color: colors.success },
  instructor: { ...typography.caption },
  studentCount: { ...typography.caption, color: colors.gray500 },
  loader: { marginTop: spacing.xl },
  emptyState: { alignItems: 'center', paddingTop: spacing.xxl, paddingHorizontal: spacing.xl },
  emptyBody: { ...typography.caption, marginTop: spacing.xs, textAlign: 'center' },
});
