import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
} from 'react-native';
import { useChatMessages } from '@/services/queries';
import { colors, spacing, typography } from '@/theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';

export function ChatScreen({ route, navigation }: any) {
  const { user: otherUser } = route.params;
  const me = useAuthStore((s) => s.user);
  const { data: initialMessages, isLoading } = useChatMessages(otherUser.id);
  const [messages, setMessages] = React.useState<any[]>([]);
  const [input, setInput] = React.useState('');
  const socket = useChatStore((s) => s.socket);

  React.useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  React.useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg: any) => {
      if (msg.senderId === otherUser.id) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    const handleMessageSent = (msg: any) => {
      if (msg.receiverId === otherUser.id) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('messageSent', handleMessageSent);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('messageSent', handleMessageSent);
    };
  }, [socket, otherUser.id]);

  const sendMessage = () => {
    if (!input.trim() || !socket) return;
    socket.emit('sendMessage', { receiverId: otherUser.id, body: input.trim() });
    setInput('');
  };

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
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </Pressable>
        <Text style={typography.subtitle}>{otherUser.name}</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item, index) => item.id || index.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const isMe = item.senderId === me?.id;
          return (
            <View style={[styles.messageContainer, isMe ? styles.myMessage : styles.theirMessage]}>
              <View style={[styles.bubble, isMe ? styles.myBubble : styles.theirBubble]}>
                <Text style={[styles.text, isMe ? styles.myText : styles.theirText]}>{item.body}</Text>
              </View>
              <Text style={styles.time}>
                {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          );
        }}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={input}
            onChangeText={setInput}
            multiline
          />
          <Pressable onPress={sendMessage} disabled={!input.trim()} style={styles.sendButton}>
            <Ionicons name="send" size={24} color={input.trim() ? colors.primary : colors.gray400} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  list: { padding: spacing.md, gap: spacing.sm },
  loader: { marginTop: spacing.xxl },
  messageContainer: { maxWidth: '80%', marginBottom: 4 },
  myMessage: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  theirMessage: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  bubble: { padding: spacing.sm, borderRadius: 16 },
  myBubble: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  theirBubble: { backgroundColor: colors.gray200, borderBottomLeftRadius: 4 },
  text: { ...typography.body, fontSize: 15 },
  myText: { color: 'white' },
  theirText: { color: colors.ink },
  time: { ...typography.caption, fontSize: 10, marginTop: 2, color: colors.inkMuted },
  inputRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: 'white' },
  input: { flex: 1, minHeight: 40, maxHeight: 100, backgroundColor: colors.gray100, borderRadius: 20, paddingHorizontal: spacing.md, paddingVertical: 8, ...typography.body, fontSize: 14 },
  sendButton: { padding: spacing.sm },
});
