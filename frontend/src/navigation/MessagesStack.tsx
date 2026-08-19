import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MessagesScreen } from '@/screens/MessagesScreen';
import { ChatScreen } from '@/screens/ChatScreen';

export type MessagesStackParamList = {
  Conversations: undefined;
  Chat: { user: { id: string; name: string; avatarUrl?: string } };
};

const Stack = createNativeStackNavigator<MessagesStackParamList>();

export function MessagesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Conversations" component={MessagesScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
  );
}
