import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useDiscussionPosts, useCreateDiscussionPost } from '@/services/queries';
import { colors, spacing, typography } from '@/theme/tokens';
import { Ionicons } from '@expo/vector-icons';

export function CourseDiscussionsScreen({ route }: any) {
  const { courseId } = route.params;
  const { data: posts, isLoading } = useDiscussionPosts(courseId);
  const createPost = useCreateDiscussionPost();
  const [body, setBody] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!body.trim()) return;
    createPost.mutate(
      { courseId, body, parentId: replyTo ?? undefined },
      {
        onSuccess: () => {
          setBody('');
          setReplyTo(null);
        },
      }
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const renderItem = ({ item }: any) => {
    const isReply = !!item.parentId;
    return (
      <View style={[styles.card, isReply && styles.replyCard]}>
        <View style={styles.header}>
          <Text style={styles.authorText}>{item.author.name}</Text>
          <Text style={styles.dateText}>{formatDate(item.postedAt)}</Text>
        </View>
        <Text style={styles.bodyText}>{item.body}</Text>
        {!isReply && (
          <TouchableOpacity
            onPress={() => setReplyTo(item.id)}
            style={styles.replyButton}
          >
            <Ionicons name="chatbubble-outline" size={16} color={colors.primary} />
            <Text style={styles.replyButtonText}>Reply</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>No discussions yet.</Text>}
      />

      <View style={styles.inputContainer}>
        {replyTo && (
          <View style={styles.replyingTo}>
            <Text style={styles.replyingToText}>Replying to a post...</Text>
            <TouchableOpacity onPress={() => setReplyTo(null)}>
              <Ionicons name="close-circle" size={20} color={colors.gray500} />
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder={replyTo ? 'Write a reply...' : 'Start a discussion...'}
            value={body}
            onChangeText={setBody}
            multiline
          />
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={createPost.isPending || !body.trim()}
            style={[styles.sendButton, (!body.trim() || createPost.isPending) && styles.disabledButton]}
          >
            <Ionicons name="send" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
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
  replyCard: { marginLeft: spacing.lg, backgroundColor: colors.gray100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  authorText: { ...typography.label, color: colors.ink, fontWeight: '700' },
  dateText: { ...typography.label, color: colors.gray500 },
  bodyText: { ...typography.body },
  replyButton: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  replyButtonText: {
    ...typography.label,
    color: colors.primary,
    marginLeft: 4,
    fontWeight: '700',
  },
  inputContainer: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  replyingTo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    backgroundColor: colors.gray100,
    padding: spacing.sm,
    borderRadius: 4,
  },
  replyingToText: { ...typography.label, color: colors.inkMuted },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end' },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: colors.gray100,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    ...typography.body,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: { backgroundColor: colors.gray300 },
  emptyText: { textAlign: 'center', color: colors.gray500, marginTop: spacing.xl, ...typography.body },
});
