import React from 'react';
import { ActivityIndicator, FlatList, Pressable, SafeAreaView, StyleSheet, Text, View, Image } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Card } from '@/components/Card';
import { ProgressBar, Tag } from '@/components/StatusPieces';
import { useCourseCatalog, useMyEnrollments } from '@/services/queries';
import { useAuthStore } from '@/store/authStore';
import type { Enrollment } from '@/types';
import { colors, spacing, typography } from '@/theme/tokens';
import type { StudentCatalogStackParamList } from '@/navigation/StudentTabs';
import { Ionicons } from '@expo/vector-icons';
import { generateCertificatePDF } from '@/utils/certificateGenerator';
import * as api from '@/services/api';
import { Alert } from 'react-native';

type Props = NativeStackScreenProps<any, 'MyCourses'>;

export function MyCoursesScreen({ navigation }: Props) {
  const user = useAuthStore((s) => s.user);
  const { data: enrollments, isLoading } = useMyEnrollments(user?.id ?? '');
  const { data: allCourses } = useCourseCatalog();

  const courseData = (courseId: string) => allCourses?.find((c) => c.id === courseId);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator style={styles.loader} color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={[typography.display, styles.header]}>My courses</Text>
      <FlatList
        data={enrollments}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={typography.subtitle}>No courses yet</Text>
            <Text style={styles.emptyBody}>Enroll in something from the catalog to get started.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const course = courseData(item.courseId);
          return (
            <EnrollmentCard
              enrollment={item}
              title={course?.title ?? '…'}
              coverImageUrl={course?.coverImageUrl}
              onPress={() => navigation.getParent()?.navigate('Catalog', {
                screen: 'CourseDetail',
                params: { courseId: item.courseId },
              })}
            />
          );
        }}
      />
    </SafeAreaView>
  );
}

function EnrollmentCard({
  enrollment,
  title,
  coverImageUrl,
  onPress,
}: {
  enrollment: Enrollment;
  title: string;
  coverImageUrl?: string;
  onPress: () => void;
}) {
  const [isGenerating, setIsGenerating] = React.useState(false);
  const tone = enrollment.status === 'completed' || enrollment.progressPercent === 100 ? 'success' : 'progress';

  const handleDownloadCertificate = async (e: any) => {
    e.stopPropagation();
    setIsGenerating(true);
    try {
      const certData = await api.fetchCertificateData(enrollment.id);
      await generateCertificatePDF(certData);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate certificate. Please try again later.');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${enrollment.progressPercent}% complete`}
      onPress={onPress}
      style={({ pressed }) => [styles.pressable, pressed && { opacity: 0.7 }]}
    >
      <Card style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.thumbnail}>
            {coverImageUrl ? (
              <Image source={{ uri: coverImageUrl }} style={styles.thumbnailImage} />
            ) : (
              <Ionicons name="school-outline" size={20} color={colors.primary} />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.titleRow}>
              <Text style={[typography.subtitle, { flex: 1 }]} numberOfLines={1}>
                {title}
              </Text>
              <Tag label={enrollment.progressPercent === 100 ? 'Completed' : 'In progress'} tone={tone} />
            </View>
          </View>
        </View>
        <ProgressBar percent={enrollment.progressPercent} />
        <View style={styles.cardBottom}>
          <Text style={styles.progressLabel}>{enrollment.progressPercent}% complete</Text>
          {enrollment.progressPercent === 100 && (
            <Pressable
              onPress={handleDownloadCertificate}
              disabled={isGenerating}
              style={({ pressed }) => [
                styles.certButton,
                pressed && { opacity: 0.7 }
              ]}
            >
              <Ionicons name="download-outline" size={16} color={colors.primary} />
              <Text style={styles.certButtonText}>
                {isGenerating ? 'Generating...' : 'Certificate'}
              </Text>
            </Pressable>
          )}
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  pressable: { marginBottom: spacing.md },
  card: { gap: spacing.sm },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  thumbnail: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressLabel: { ...typography.caption },
  certButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  certButtonText: { ...typography.caption, color: colors.primary, fontWeight: 'bold' },
  loader: { marginTop: spacing.xxl },
  emptyState: { alignItems: 'center', paddingTop: spacing.xxl, paddingHorizontal: spacing.xl },
  emptyBody: { ...typography.caption, marginTop: spacing.xs, textAlign: 'center' },
});
