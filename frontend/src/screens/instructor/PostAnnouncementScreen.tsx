import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useCreateAnnouncement } from '@/services/queries';
import { colors, spacing, typography } from '@/theme/tokens';
import { Button } from '@/components/Button';

export function PostAnnouncementScreen({ route, navigation }: any) {
  const { courseId } = route.params;
  const createAnnouncement = useCreateAnnouncement();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const handlePost = () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert('Error', 'Please fill in both title and body.');
      return;
    }

    createAnnouncement.mutate(
      { courseId, title, body },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Announcement posted.');
          navigation.goBack();
        },
        onError: (error: any) => {
          Alert.alert('Error', error.message || 'Failed to post announcement.');
        },
      }
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.labelText}>Title</Text>
      <TextInput
        style={styles.input}
        placeholder="Announcement title"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.labelText}>Message</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Write your announcement here..."
        value={body}
        onChangeText={setBody}
        multiline
        numberOfLines={6}
      />

      <Button
        title="Post Announcement"
        onPress={handlePost}
        loading={createAnnouncement.isPending}
        style={styles.button}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },
  labelText: { ...typography.label, marginBottom: spacing.sm, color: colors.ink, fontWeight: '700' },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...typography.body,
  },
  textArea: { minHeight: 120, textAlignVertical: 'top' },
  button: { marginTop: spacing.md },
});
