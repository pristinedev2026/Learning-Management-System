import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Alert,
  Platform,
} from 'react-native';
import { Video } from 'expo-av';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { StudentCatalogStackParamList } from '@/navigation/StudentTabs';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useToggleLessonCompletion } from '@/services/queries';
import { colors, spacing, typography } from '@/theme/tokens';
import type { Lesson } from '@/types';
import {
  downloadLessonFile,
  getLocalUri,
  isLessonDownloaded,
  deleteLessonFile,
} from '@/utils/offlineManager';

type Props = NativeStackScreenProps<StudentCatalogStackParamList, 'Lesson'>;

/**
 * LessonViewerScreen
 * Renders lessons based on type: video, text (markdown), or PDF.
 * Allows navigation between lessons in a module and marks lessons as complete.
 */
export function LessonViewerScreen({ route, navigation }: Props) {
  const { lesson, moduleId, courseId, allLessonsInModule } = route.params;
  const [isCompleted, setIsCompleted] = useState(lesson.completed ?? false);
  const [videoRef, setVideoRef] = useState<Video | null>(null);

  // Offline caching state
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [localUri, setLocalUri] = useState<string | null>(null);

  useEffect(() => {
    const checkOfflineStatus = async () => {
      if (lesson.type === 'video' || lesson.type === 'pdf') {
        const uri = await getLocalUri(lesson.content);
        if (uri) {
          setLocalUri(uri);
          setIsDownloaded(true);
        }
      }
    };
    checkOfflineStatus();
  }, [lesson.id, lesson.content, lesson.type]);

  const toggleMutation = useToggleLessonCompletion(courseId);

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    setDownloadProgress(0);
    try {
      const uri = await downloadLessonFile(lesson.id, lesson.content, (progress) => {
        setDownloadProgress(progress);
      });
      setLocalUri(uri);
      setIsDownloaded(true);
      Alert.alert('Success', 'Lesson downloaded for offline viewing');
    } catch (error) {
      Alert.alert('Download Error', 'Failed to download lesson');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDeleteOffline = async () => {
    Alert.alert('Delete Offline', 'Are you sure you want to remove this lesson from offline storage?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteLessonFile(lesson.id);
          setLocalUri(null);
          setIsDownloaded(false);
        },
      },
    ]);
  };

  // Find current position in all lessons
  const currentLessonIndex = allLessonsInModule.findIndex((l) => l.id === lesson.id);
  const previousLesson = currentLessonIndex > 0 ? allLessonsInModule[currentLessonIndex - 1] : null;
  const nextLesson =
    currentLessonIndex < allLessonsInModule.length - 1 ? allLessonsInModule[currentLessonIndex + 1] : null;

  const handleNavigateToLesson = (targetLesson: Lesson) => {
    navigation.replace('Lesson', {
      lesson: targetLesson,
      moduleId,
      courseId,
      allLessonsInModule,
    });
  };

  const handleMarkComplete = async () => {
    try {
      const result = await toggleMutation.mutateAsync(lesson.id);
      setIsCompleted(result.completed);
    } catch (error) {
      Alert.alert('Error', 'Failed to update lesson status');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={typography.subtitle}>{lesson.title}</Text>
            {lesson.durationMinutes && (
              <Text style={styles.duration}>{lesson.durationMinutes} min</Text>
            )}
          </View>

          {(lesson.type === 'video' || lesson.type === 'pdf') && (
            <View style={styles.offlineActions}>
              {isDownloading ? (
                <View style={styles.progressContainer}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={styles.progressText}>{Math.round(downloadProgress * 100)}%</Text>
                </View>
              ) : isDownloaded ? (
                <Pressable onPress={handleDeleteOffline} style={styles.downloadedIndicator}>
                  <Text style={styles.downloadedText}>✓ Offline</Text>
                </Pressable>
              ) : (
                <Button
                  label="Download"
                  onPress={handleDownload}
                  variant="outline"
                  size="small"
                  style={styles.downloadButton}
                />
              )}
            </View>
          )}
        </View>

        {/* Content based on lesson type */}
        <Card style={styles.contentCard}>
          {lesson.type === 'video' && (
            <View style={styles.videoContainer}>
              <Video
                ref={(ref) => setVideoRef(ref)}
                source={{ uri: localUri || lesson.content }}
                style={styles.video}
                useNativeControls
                resizeMode="contain"
                onError={(error) => {
                  console.error('Video playback error:', error);
                  Alert.alert('Error', 'Failed to load video');
                }}
              />
            </View>
          )}

          {lesson.type === 'text' && (
            <View style={styles.textContent}>
              <MarkdownRenderer content={lesson.content} />
            </View>
          )}

          {lesson.type === 'pdf' && (
            <View style={styles.pdfContainer}>
              <Text style={styles.pdfPlaceholder}>
                📄 PDF Viewer
              </Text>
              <Text style={typography.body}>
                PDF content from: {lesson.content}
              </Text>
              <Text style={[styles.pdfPlaceholder, { marginTop: spacing.md }]}>
                (Full PDF viewer requires react-native-pdf or WebView integration)
              </Text>
            </View>
          )}
        </Card>

        {/* Mark Complete Button */}
        <Pressable
          onPress={handleMarkComplete}
          style={({ pressed }) => [
            styles.completeButton,
            { backgroundColor: isCompleted ? colors.success : colors.border },
            pressed && { opacity: 0.7 },
          ]}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: isCompleted }}
          accessibilityLabel={`Mark lesson ${isCompleted ? 'incomplete' : 'complete'}`}
        >
          <Text style={isCompleted ? styles.completedText : styles.incompleteText}>
            {isCompleted ? '✓ Completed' : '☐ Mark Complete'}
          </Text>
        </Pressable>

        {/* Navigation */}
        <View style={styles.navigation}>
          {previousLesson ? (
            <Button
              label={`← ${previousLesson.title}`}
              onPress={() => handleNavigateToLesson(previousLesson)}
              style={styles.navButton}
            />
          ) : (
            <View style={styles.navButton} />
          )}

          {nextLesson ? (
            <Button
              label={`${nextLesson.title} →`}
              onPress={() => handleNavigateToLesson(nextLesson)}
              style={styles.navButton}
            />
          ) : (
            <View style={styles.navButton} />
          )}
        </View>

        {/* Back to course */}
        <Button
          label="← Back to course"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * Simple markdown-like renderer for text content.
 * Supports headings (#, ##, ###), bold (**), lists, and basic formatting.
 */
function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split('\n');

  return (
    <View>
      {lines.map((line, index) => {
        // Headings
        if (line.startsWith('### ')) {
          return (
            <Text key={index} style={[typography.subtitle, styles.mdHeading3, { marginTop: spacing.md }]}>
              {line.replace(/^### /, '')}
            </Text>
          );
        }
        if (line.startsWith('## ')) {
          return (
            <Text key={index} style={[typography.title, styles.mdHeading2, { marginTop: spacing.lg }]}>
              {line.replace(/^## /, '')}
            </Text>
          );
        }
        if (line.startsWith('# ')) {
          return (
            <Text key={index} style={[typography.display, styles.mdHeading1, { marginTop: spacing.xl }]}>
              {line.replace(/^# /, '')}
            </Text>
          );
        }

        // List items
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <Text key={index} style={[typography.body, styles.mdListItem]}>
              • {line.replace(/^[-*] /, '')}
            </Text>
          );
        }

        // Bold and code
        let styledText = line;
        // Simple inline formatting (not perfect, but covers basics)
        const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

        return (
          <Text key={index} style={[typography.body, styles.mdParagraph]}>
            {parts.map((part, i) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return (
                  <Text key={i} style={styles.mdBold}>
                    {part.slice(2, -2)}
                  </Text>
                );
              }
              if (part.startsWith('`') && part.endsWith('`')) {
                return (
                  <Text key={i} style={styles.mdCode}>
                    {part.slice(1, -1)}
                  </Text>
                );
              }
              return part;
            })}
          </Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  duration: { ...typography.caption, color: colors.inkMuted },

  offlineActions: {
    marginLeft: spacing.md,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  progressText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: 'bold',
  },
  downloadButton: {
    minWidth: 80,
  },
  downloadedIndicator: {
    backgroundColor: colors.success + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  downloadedText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: 'bold',
  },

  contentCard: { minHeight: 200, justifyContent: 'center' },

  videoContainer: { alignItems: 'center' },
  video: { width: '100%', height: 300, borderRadius: 8 },

  textContent: { padding: spacing.md },

  pdfContainer: { alignItems: 'center', paddingVertical: spacing.lg },
  pdfPlaceholder: { ...typography.subtitle, textAlign: 'center', color: colors.inkMuted },

  completeButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
  },
  completedText: { ...typography.subtitle, color: 'white', fontWeight: 'bold' },
  incompleteText: { ...typography.subtitle, color: colors.ink },

  navigation: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  navButton: { flex: 1 },

  backButton: { marginTop: spacing.md },

  // Markdown styles
  mdHeading1: { marginBottom: spacing.xs },
  mdHeading2: { marginBottom: spacing.xs },
  mdHeading3: { marginBottom: spacing.xs },
  mdParagraph: { marginBottom: spacing.sm, lineHeight: 24 },
  mdListItem: { marginLeft: spacing.md, marginBottom: spacing.xs, lineHeight: 20 },
  mdBold: { fontWeight: 'bold' },
  mdCode: {
    backgroundColor: colors.gray100,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
    fontFamily: 'Courier New',
  },
});
